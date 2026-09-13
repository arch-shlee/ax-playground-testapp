import { create } from 'zustand';
import type { AnalysisStage, DataSource, Filters, Project } from '../types';
import { DEFAULT_FILTERS } from '../types';
import { buildSampleProjects } from '../data/sampleData';
import { parseProjectFile } from '../utils/fileParser';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DashboardState {
  dataSource: DataSource;
  projects: Project[];
  filters: Filters;
  selectedProjectId: string | null;
  analysisStage: AnalysisStage;
  isAnalyzing: boolean;
  error: string | null;
  reportModalOpen: boolean;

  loadSample: () => Promise<void>;
  loadFile: (file: File) => Promise<void>;
  reset: () => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  selectProject: (id: string | null) => void;
  openReportModal: () => void;
  closeReportModal: () => void;
  dismissError: () => void;
}

async function runAnalysisAnimation(setStage: (stage: AnalysisStage) => void): Promise<void> {
  setStage('structure');
  await delay(500);
  setStage('metrics');
  await delay(500);
  setStage('building');
  await delay(400);
  setStage('done');
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dataSource: 'none',
  projects: [],
  filters: DEFAULT_FILTERS,
  selectedProjectId: null,
  analysisStage: 'idle',
  isAnalyzing: false,
  error: null,
  reportModalOpen: false,

  loadSample: async () => {
    set({ isAnalyzing: true, error: null });
    await runAnalysisAnimation((stage) => set({ analysisStage: stage }));
    set({
      projects: buildSampleProjects(),
      dataSource: 'sample',
      isAnalyzing: false,
      analysisStage: 'idle',
      filters: DEFAULT_FILTERS,
      selectedProjectId: null,
    });
  },

  loadFile: async (file: File) => {
    set({ isAnalyzing: true, error: null });
    try {
      const { projects, warnings } = await parseProjectFile(file);
      await runAnalysisAnimation((stage) => set({ analysisStage: stage }));
      if (projects.length === 0) {
        set({
          isAnalyzing: false,
          analysisStage: 'idle',
          error: warnings[0] ?? '파일에서 유효한 데이터를 찾지 못했습니다. 샘플 데이터로 시작해보세요.',
        });
        return;
      }
      set({
        projects,
        dataSource: 'upload',
        isAnalyzing: false,
        analysisStage: 'idle',
        filters: DEFAULT_FILTERS,
        selectedProjectId: null,
        error: warnings[0] ?? null,
      });
    } catch (err) {
      set({
        isAnalyzing: false,
        analysisStage: 'idle',
        error: err instanceof Error ? err.message : '파일을 읽는 중 문제가 발생했습니다.',
      });
    }
  },

  reset: () => {
    set({
      dataSource: 'none',
      projects: [],
      filters: DEFAULT_FILTERS,
      selectedProjectId: null,
      error: null,
      analysisStage: 'idle',
      isAnalyzing: false,
      reportModalOpen: false,
    });
  },

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  selectProject: (id) => set({ selectedProjectId: id }),

  openReportModal: () => set({ reportModalOpen: true }),
  closeReportModal: () => set({ reportModalOpen: false }),

  dismissError: () => set({ error: null }),
}));
