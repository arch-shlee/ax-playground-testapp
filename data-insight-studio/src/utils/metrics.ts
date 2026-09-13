import type { Category, Company, Project, Status } from '../types';
import { daysRemaining } from './dateUtils';

function uniqueInOrder<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export interface KpiData {
  total: number;
  normal: number;
  warning: number;
  delayed: number;
  avgProgress: number;
  avgWeeklyChange: number;
  normalDelta: number;
  warningDelta: number;
  delayedDelta: number;
}

/**
 * Approximates "지난주" counts by re-deriving each project's status from its
 * progress a week ago (progress - weeklyChange) using the same schedule
 * pressure the current status already reflects, so the KPI trend arrows have
 * something meaningful to compare against without needing real history.
 */
function estimatePrevStatus(p: Project): Status {
  const prevProgress = Math.max(0, Math.min(100, p.progress - p.weeklyChange));
  const remaining = daysRemaining(p.dueDate);
  if (p.status === '지연' && prevProgress >= p.progress) return '지연';
  if (prevProgress < p.progress - 8 && remaining < 14) return p.status === '정상' ? '주의' : p.status;
  if (prevProgress > p.progress + 8) return p.status === '지연' ? '주의' : p.status;
  return p.status;
}

export function computeKpis(projects: Project[]): KpiData {
  const total = projects.length;
  const normal = projects.filter((p) => p.status === '정상').length;
  const warning = projects.filter((p) => p.status === '주의').length;
  const delayed = projects.filter((p) => p.status === '지연').length;
  const avgProgress = mean(projects.map((p) => p.progress));
  const avgWeeklyChange = mean(projects.map((p) => p.weeklyChange));

  const prevStatuses = projects.map(estimatePrevStatus);
  const prevNormal = prevStatuses.filter((s) => s === '정상').length;
  const prevWarning = prevStatuses.filter((s) => s === '주의').length;
  const prevDelayed = prevStatuses.filter((s) => s === '지연').length;

  return {
    total,
    normal,
    warning,
    delayed,
    avgProgress,
    avgWeeklyChange,
    normalDelta: normal - prevNormal,
    warningDelta: warning - prevWarning,
    delayedDelta: delayed - prevDelayed,
  };
}

export interface TrendPoint {
  week: string;
  진행률: number;
}

export function buildProgressTrend(projects: Project[]): TrendPoint[] {
  const avgProgress = mean(projects.map((p) => p.progress));
  const avgChange = mean(projects.map((p) => p.weeklyChange));
  const weeks = 8;
  const points: TrendPoint[] = [];

  for (let i = 0; i < weeks; i++) {
    const weeksAgo = weeks - 1 - i;
    const base = avgProgress - avgChange * weeksAgo * 0.55;
    const wave = Math.sin(i * 1.3) * 1.5;
    const value = Math.max(0, Math.min(100, base + wave));
    points.push({ week: `${i + 1}주차`, 진행률: Math.round(value * 10) / 10 });
  }
  if (points.length > 0) {
    points[points.length - 1].진행률 = Math.round(avgProgress * 10) / 10;
  }
  return points;
}

export interface CompanyStatusRow {
  company: Company;
  정상: number;
  주의: number;
  지연: number;
}

export function buildCompanyStatusData(projects: Project[]): CompanyStatusRow[] {
  const companies = uniqueInOrder(projects.map((p) => p.company));
  return companies.map((company) => {
    const rows = projects.filter((p) => p.company === company);
    return {
      company,
      정상: rows.filter((p) => p.status === '정상').length,
      주의: rows.filter((p) => p.status === '주의').length,
      지연: rows.filter((p) => p.status === '지연').length,
    };
  });
}

export interface CategoryDonutRow {
  name: Category;
  value: number;
}

export function buildCategoryDonutData(projects: Project[]): CategoryDonutRow[] {
  const categories = uniqueInOrder(projects.map((p) => p.category));
  return categories.map((category) => ({
    name: category,
    value: projects.filter((p) => p.category === category).length,
  }));
}

export interface ScatterRow {
  id: string;
  projectName: string;
  status: Status;
  progress: number;
  remaining: number;
}

export function buildScatterData(projects: Project[]): ScatterRow[] {
  return projects.map((p) => ({
    id: p.id,
    projectName: p.projectName,
    status: p.status,
    progress: p.progress,
    remaining: daysRemaining(p.dueDate),
  }));
}

export function buildUpcomingDeadlines(projects: Project[], limit = 6): Project[] {
  return [...projects]
    .filter((p) => p.status !== '정상' || daysRemaining(p.dueDate) <= 14)
    .sort((a, b) => daysRemaining(a.dueDate) - daysRemaining(b.dueDate))
    .slice(0, limit);
}
