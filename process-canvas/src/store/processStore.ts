import { create } from 'zustand';
import type { ProcessGraph, ProcessLink, ProcessStep, Role, StepStatus, ViewMode } from '../types';
import { DEFAULT_SCENARIO, buildScenarioGraph, type SampleScenario } from '../data/sampleScenarios';
import { generateProcessFromText, nextId } from '../utils/textToProcess';
import { applyNlCommand } from '../utils/nlEdit';
import type { Point } from '../utils/layout';

const STORAGE_KEY = 'process-canvas-state-v1';

interface PersistedState {
  graph: ProcessGraph;
  inputText: string;
  viewMode: ViewMode;
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.graph || !Array.isArray(parsed.graph.steps)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persist(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / privacy-mode errors — demo still works without persistence
  }
}

function cloneGraph(graph: ProcessGraph): ProcessGraph {
  return { title: graph.title, steps: graph.steps.map((s) => ({ ...s })), links: graph.links.map((l) => ({ ...l })) };
}

interface ProcessState {
  graph: ProcessGraph;
  inputText: string;
  viewMode: ViewMode;
  selectedNodeId: string | null;
  nodePositionOverrides: Record<string, Point>;
  history: ProcessGraph[];
  generation: number;
  toast: string | null;
  presentationMode: boolean;

  setInputText: (text: string) => void;
  loadScenario: (scenario: SampleScenario) => void;
  generateFromInput: () => void;
  setViewMode: (mode: ViewMode) => void;
  selectNode: (id: string | null) => void;
  updateStep: (id: string, patch: Partial<ProcessStep>) => void;
  addNode: (afterId?: string | null) => void;
  deleteNode: (id: string) => void;
  addLink: (source: string, target: string) => void;
  removeLink: (linkId: string) => void;
  setNodePosition: (id: string, pos: Point) => void;
  autoLayout: () => void;
  undo: () => void;
  reset: () => void;
  runNlCommand: (command: string) => void;
  dismissToast: () => void;
  setPresentationMode: (v: boolean) => void;
}

function initialPersistedOrDefault(): { graph: ProcessGraph; inputText: string; viewMode: ViewMode } {
  const persisted = loadPersisted();
  if (persisted) return persisted;
  const graph = buildScenarioGraph(DEFAULT_SCENARIO);
  return { graph, inputText: DEFAULT_SCENARIO.text, viewMode: 'flow' };
}

const initial = initialPersistedOrDefault();

export const useProcessStore = create<ProcessState>((set, get) => ({
  graph: initial.graph,
  inputText: initial.inputText,
  viewMode: initial.viewMode,
  selectedNodeId: null,
  nodePositionOverrides: {},
  history: [],
  generation: 0,
  toast: null,
  presentationMode: false,

  setInputText: (text) => set({ inputText: text }),

  loadScenario: (scenario) => {
    const graph = buildScenarioGraph(scenario);
    set((state) => ({
      graph,
      inputText: scenario.text,
      selectedNodeId: null,
      nodePositionOverrides: {},
      history: [...state.history, state.graph].slice(-20),
      generation: state.generation + 1,
    }));
    persist({ graph, inputText: scenario.text, viewMode: get().viewMode });
  },

  generateFromInput: () => {
    const { inputText } = get();
    const graph = generateProcessFromText(inputText, '사용자 정의 프로세스');
    set((state) => ({
      graph,
      selectedNodeId: null,
      nodePositionOverrides: {},
      history: [...state.history, state.graph].slice(-20),
      generation: state.generation + 1,
    }));
    persist({ graph, inputText, viewMode: get().viewMode });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
    const { graph, inputText } = get();
    persist({ graph, inputText, viewMode: mode });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateStep: (id, patch) => {
    set((state) => {
      const graph = cloneGraph(state.graph);
      graph.steps = graph.steps.map((s) => (s.id === id ? { ...s, ...patch } : s));
      persist({ graph, inputText: state.inputText, viewMode: state.viewMode });
      return { graph };
    });
  },

  addNode: (afterId) => {
    set((state) => {
      const graph = cloneGraph(state.graph);
      const anchor = afterId ? graph.steps.find((s) => s.id === afterId) : undefined;
      const maxOrder = Math.max(0, ...graph.steps.map((s) => s.order));
      const newStep: ProcessStep = {
        id: nextId('step'),
        kind: 'process',
        label: '새 단계',
        role: '담당자 미지정',
        description: '',
        inputs: '',
        completionCriteria: '',
        checkpoints: '',
        memo: '',
        status: '대기',
        order: anchor ? anchor.order + 0.5 : maxOrder + 1,
      };
      graph.steps.push(newStep);
      const newLinks: ProcessLink[] = [];
      if (anchor) {
        newLinks.push({ id: nextId('e'), source: anchor.id, target: newStep.id, kind: 'normal' });
      }
      graph.links = [...graph.links, ...newLinks];
      persist({ graph, inputText: state.inputText, viewMode: state.viewMode });
      return {
        graph,
        selectedNodeId: newStep.id,
        history: [...state.history, state.graph].slice(-20),
      };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const graph = cloneGraph(state.graph);
      const incoming = graph.links.filter((l) => l.target === id);
      const outgoing = graph.links.filter((l) => l.source === id);
      graph.steps = graph.steps.filter((s) => s.id !== id);
      graph.links = graph.links.filter((l) => l.source !== id && l.target !== id);
      incoming.forEach((inLink) => {
        outgoing.forEach((outLink) => {
          graph.links.push({
            id: nextId('e'),
            source: inLink.source,
            target: outLink.target,
            kind: inLink.kind === 'fail' || outLink.kind === 'fail' ? 'fail' : 'normal',
            label: outLink.label,
          });
        });
      });
      persist({ graph, inputText: state.inputText, viewMode: state.viewMode });
      return {
        graph,
        selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
        history: [...state.history, state.graph].slice(-20),
      };
    });
  },

  addLink: (source, target) => {
    set((state) => {
      const graph = cloneGraph(state.graph);
      if (graph.links.some((l) => l.source === source && l.target === target)) return {};
      graph.links.push({ id: nextId('e'), source, target, kind: 'normal' });
      persist({ graph, inputText: state.inputText, viewMode: state.viewMode });
      return { graph, history: [...state.history, state.graph].slice(-20) };
    });
  },

  removeLink: (linkId) => {
    set((state) => {
      const graph = cloneGraph(state.graph);
      graph.links = graph.links.filter((l) => l.id !== linkId);
      persist({ graph, inputText: state.inputText, viewMode: state.viewMode });
      return { graph, history: [...state.history, state.graph].slice(-20) };
    });
  },

  setNodePosition: (id, pos) => {
    set((state) => ({ nodePositionOverrides: { ...state.nodePositionOverrides, [id]: pos } }));
  },

  autoLayout: () => {
    set((state) => ({
      nodePositionOverrides: {},
      history: [...state.history, state.graph].slice(-20),
    }));
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) return { toast: '더 이상 취소할 변경사항이 없습니다.' };
      const prev = state.history[state.history.length - 1];
      persist({ graph: prev, inputText: state.inputText, viewMode: state.viewMode });
      return {
        graph: prev,
        history: state.history.slice(0, -1),
        nodePositionOverrides: {},
        selectedNodeId: null,
      };
    });
  },

  reset: () => {
    const graph = buildScenarioGraph(DEFAULT_SCENARIO);
    persist({ graph, inputText: DEFAULT_SCENARIO.text, viewMode: 'flow' });
    set((state) => ({
      graph,
      inputText: DEFAULT_SCENARIO.text,
      viewMode: 'flow',
      selectedNodeId: null,
      nodePositionOverrides: {},
      history: [...state.history, state.graph].slice(-20),
      generation: state.generation + 1,
    }));
  },

  runNlCommand: (command) => {
    const { graph } = get();
    const result = applyNlCommand(command, graph);
    set((state) => {
      const next: Partial<ProcessState> = { toast: result.message };
      if (result.graph) {
        next.graph = result.graph;
        next.history = [...state.history, state.graph].slice(-20);
        next.nodePositionOverrides = {};
      }
      if (result.viewMode) {
        next.viewMode = result.viewMode;
      }
      if (result.graph || result.viewMode) {
        persist({
          graph: result.graph ?? state.graph,
          inputText: state.inputText,
          viewMode: result.viewMode ?? state.viewMode,
        });
      }
      return next as ProcessState;
    });
  },

  dismissToast: () => set({ toast: null }),
  setPresentationMode: (v) => set({ presentationMode: v }),
}));

export function roleBadgeText(role: Role): string {
  return role;
}

export function statusOptions(): StepStatus[] {
  return ['대기', '진행중', '완료', '보류'];
}
