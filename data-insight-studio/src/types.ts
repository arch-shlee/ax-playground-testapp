// Fixed to the 5 SK codes for the bundled sample data, but kept as `string`
// so an uploaded file with different company names never breaks the schema.
export type Company = string;

export type Status = '정상' | '주의' | '지연';

// The 4 categories below are the known/colored set used by the sample data;
// kept as `string` so uploaded files with other category labels still work.
export type Category = string;

export interface Project {
  id: string;
  projectName: string;
  company: Company;
  department: string;
  owner: string;
  startDate: string; // ISO yyyy-mm-dd
  dueDate: string; // ISO yyyy-mm-dd
  progress: number; // 0-100
  status: Status;
  category: Category;
  issue: string;
  weeklyChange: number; // percentage points vs last week, can be negative
}

export type DataSource = 'none' | 'sample' | 'upload';

export type AnalysisStage = 'idle' | 'structure' | 'metrics' | 'building' | 'done';

export interface Filters {
  company: string | 'all';
  department: string | 'all';
  status: Status | 'all';
  category: string | 'all';
  dueRange: 'all' | 'overdue' | '7' | '14' | '30';
}

export const DEFAULT_FILTERS: Filters = {
  company: 'all',
  department: 'all',
  status: 'all',
  category: 'all',
  dueRange: 'all',
};

export const STATUS_COLORS: Record<Status, { main: string; bg: string; text: string }> = {
  정상: { main: '#0d9488', bg: '#f0fdfa', text: '#0f766e' },
  주의: { main: '#ea580c', bg: '#fff7ed', text: '#c2410c' },
  지연: { main: '#dc2626', bg: '#fef2f2', text: '#b91c1c' },
};

export const CATEGORY_LIST: Category[] = ['데이터 분석', '업무 자동화', '문서 검색', '현황 관리'];
export const COMPANY_LIST: Company[] = ['SKMR', 'SKMJ', 'SKMP', 'SKTC', 'SKAP'];
export const STATUS_LIST: Status[] = ['정상', '주의', '지연'];

const KNOWN_CATEGORY_COLORS: Record<string, string> = {
  '데이터 분석': '#2563eb',
  '업무 자동화': '#0d9488',
  '문서 검색': '#7c3aed',
  '현황 관리': '#1e3a5f',
};

const CATEGORY_COLOR_FALLBACK_CYCLE = ['#2563eb', '#0d9488', '#7c3aed', '#1e3a5f', '#ea580c', '#64748b'];

/** Known categories get their fixed brand color; any other label (e.g. from
 * an uploaded file) is assigned a stable color by hashing its name. */
export function getCategoryColor(category: string): string {
  if (KNOWN_CATEGORY_COLORS[category]) return KNOWN_CATEGORY_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return CATEGORY_COLOR_FALLBACK_CYCLE[hash % CATEGORY_COLOR_FALLBACK_CYCLE.length];
}
