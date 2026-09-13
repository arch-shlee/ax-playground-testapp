import type { ProcessGraph, ProcessLink, ProcessStep, ViewMode } from '../types';
import { nextId } from './textToProcess';

export interface NlCommandResult {
  message: string;
  graph?: ProcessGraph;
  viewMode?: ViewMode;
}

function cloneGraph(graph: ProcessGraph): ProcessGraph {
  return { title: graph.title, steps: graph.steps.map((s) => ({ ...s })), links: graph.links.map((l) => ({ ...l })) };
}

function findStep(graph: ProcessGraph, id: string): ProcessStep | undefined {
  return graph.steps.find((s) => s.id === id);
}

function insertSecurityReview(graph: ProcessGraph): ProcessGraph | null {
  const approval =
    graph.steps.find((s) => s.role === '승인자' && s.kind === 'decision') ??
    graph.steps.find((s) => s.description.includes('배포') && s.description.includes('검토')) ??
    graph.steps.find((s) => s.role === '승인자');
  if (!approval) return null;

  const incoming = graph.links.filter((l) => l.target === approval.id && l.kind === 'normal');
  if (incoming.length === 0) return null;
  const anchor = incoming.sort(
    (a, b) => (findStep(graph, b.source)?.order ?? 0) - (findStep(graph, a.source)?.order ?? 0),
  )[0];

  const anchorSource = findStep(graph, anchor.source);
  const newNode: ProcessStep = {
    id: nextId('sec'),
    kind: 'process',
    label: '보안 검토',
    role: '검증 시스템',
    description: '보안 취약점 및 정책 준수 여부를 점검한다.',
    inputs: '보안 점검 체크리스트',
    completionCriteria: '중대 취약점 없음',
    checkpoints: '개인정보 및 권한 처리 적정성 확인',
    memo: '',
    status: '대기',
    order: ((anchorSource?.order ?? approval.order - 1) + approval.order) / 2,
  };

  const next = cloneGraph(graph);
  next.steps.push(newNode);
  next.links = next.links.filter((l) => l.id !== anchor.id);
  next.links.push({ id: nextId('e'), source: anchor.source, target: newNode.id, kind: 'normal', label: anchor.label });
  next.links.push({ id: nextId('e'), source: newNode.id, target: approval.id, kind: 'normal' });
  return next;
}

function highlightFailFlow(graph: ProcessGraph): ProcessGraph {
  const next = cloneGraph(graph);
  next.links = next.links.map((l) =>
    l.label === '아니오' || l.label === '재시도' ? { ...l, kind: 'fail' } : l,
  );
  return next;
}

function removeApprovalStep(graph: ProcessGraph): ProcessGraph | null {
  const approval = graph.steps.find((s) => s.role === '승인자');
  if (!approval) return null;

  const incoming = graph.links.filter((l) => l.target === approval.id);
  const outgoing = graph.links.filter((l) => l.source === approval.id);

  const next = cloneGraph(graph);
  next.steps = next.steps.filter((s) => s.id !== approval.id);
  next.links = next.links.filter((l) => l.source !== approval.id && l.target !== approval.id);

  incoming.forEach((inLink) => {
    outgoing.forEach((outLink) => {
      next.links.push({
        id: nextId('e'),
        source: inLink.source,
        target: outLink.target,
        kind: inLink.kind === 'fail' || outLink.kind === 'fail' ? 'fail' : 'normal',
        label: outLink.label,
      });
    });
  });

  return next;
}

const UNSUPPORTED_MESSAGE = '현재 시연 버전에서는 지원하지 않는 요청입니다.';

export function applyNlCommand(command: string, graph: ProcessGraph): NlCommandResult {
  const text = command.trim();

  if (text.includes('보안') && text.includes('검토') && (text.includes('추가') || text.includes('넣'))) {
    const result = insertSecurityReview(graph);
    if (!result) return { message: UNSUPPORTED_MESSAGE };
    return { message: '자동 검증 이후, 승인 검토 이전에 "보안 검토" 단계를 추가했습니다.', graph: result };
  }

  if (
    (text.includes('실패') || text.includes('보완')) &&
    (text.includes('빨간') || text.includes('붉은') || text.includes('레드')) &&
    text.includes('표시')
  ) {
    return { message: '실패 및 보완 흐름을 붉은색 점선으로 표시했습니다.', graph: highlightFailFlow(graph) };
  }

  if ((text.includes('담당자별') || text.includes('역할별')) && (text.includes('구분') || text.includes('보기'))) {
    return { message: '담당자별 스윔레인 보기로 전환했습니다.', viewMode: 'swimlane' };
  }

  if (text.includes('승인') && (text.includes('제거') || text.includes('삭제'))) {
    const result = removeApprovalStep(graph);
    if (!result) return { message: UNSUPPORTED_MESSAGE };
    return { message: '승인 검토 단계를 제거하고 앞뒤 흐름을 다시 연결했습니다.', graph: result };
  }

  return { message: UNSUPPORTED_MESSAGE };
}

export function isFailLinkKind(link: ProcessLink): boolean {
  return link.kind === 'fail';
}
