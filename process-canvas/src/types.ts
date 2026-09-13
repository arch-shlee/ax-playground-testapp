export type Role =
  | '개발자'
  | '운영 담당자'
  | '검증 시스템'
  | '승인자'
  | '사용자'
  | '담당자 미지정';

export type NodeKind = 'start' | 'end' | 'process' | 'decision';

export type StepStatus = '대기' | '진행중' | '완료' | '보류';

export interface ProcessStep {
  id: string;
  kind: NodeKind;
  label: string;
  role: Role;
  description: string;
  inputs: string;
  completionCriteria: string;
  checkpoints: string;
  memo: string;
  status: StepStatus;
  /** original sequential order, used for swimlane/timeline layout */
  order: number;
}

export type EdgeKind = 'normal' | 'fail';

export interface ProcessLink {
  id: string;
  source: string;
  target: string;
  label?: string;
  kind: EdgeKind;
}

export type ViewMode = 'flow' | 'swimlane' | 'timeline';

export interface ProcessGraph {
  title: string;
  steps: ProcessStep[];
  links: ProcessLink[];
}

export const ROLE_ORDER: Role[] = [
  '개발자',
  '운영 담당자',
  '검증 시스템',
  '승인자',
  '사용자',
  '담당자 미지정',
];

export const ROLE_COLORS: Record<Role, { main: string; bg: string; border: string; text: string }> = {
  개발자: { main: '#2563eb', bg: '#eff6ff', border: '#93c5fd', text: '#1e3a8a' },
  '운영 담당자': { main: '#0d9488', bg: '#f0fdfa', border: '#5eead4', text: '#115e59' },
  '검증 시스템': { main: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd', text: '#4c1d95' },
  승인자: { main: '#ea580c', bg: '#fff7ed', border: '#fdba74', text: '#9a3412' },
  사용자: { main: '#1e3a5f', bg: '#eef3f8', border: '#93a9c4', text: '#1e3a5f' },
  '담당자 미지정': { main: '#64748b', bg: '#f8fafc', border: '#cbd5e1', text: '#334155' },
};
