import type { Project } from '../types';
import { daysRemaining } from './dateUtils';

export interface InsightItem {
  id: string;
  tone: 'delayed' | 'warning' | 'neutral';
  text: string;
}

const STATUS_RANK: Record<Project['status'], number> = { 지연: 2, 주의: 1, 정상: 0 };

function pickMostAttentionNeeded(rows: Project[]): Project | null {
  if (rows.length === 0) return null;
  return [...rows].sort((a, b) => {
    const rankDiff = STATUS_RANK[b.status] - STATUS_RANK[a.status];
    if (rankDiff !== 0) return rankDiff;
    return a.progress - b.progress;
  })[0];
}

export function buildInsights(projects: Project[]): InsightItem[] {
  const insights: InsightItem[] = [];

  const delayed = projects.filter((p) => p.status === '지연');
  insights.push({
    id: 'delayed-count',
    tone: delayed.length > 0 ? 'delayed' : 'neutral',
    text:
      delayed.length > 0
        ? `현재 총 ${delayed.length}개 과제가 일정 지연 상태입니다. 우선 점검이 필요합니다.`
        : '현재 일정이 지연된 과제는 없습니다.',
  });

  const dueSoonBehind = projects.filter((p) => {
    const remaining = daysRemaining(p.dueDate);
    return remaining >= 0 && remaining <= 7 && p.progress < 70;
  });
  insights.push({
    id: 'due-soon-behind',
    tone: dueSoonBehind.length > 0 ? 'warning' : 'neutral',
    text:
      dueSoonBehind.length > 0
        ? `7일 이내 마감 예정이면서 진행률이 70% 미만인 과제가 ${dueSoonBehind.length}건 있습니다 (${dueSoonBehind
            .map((p) => p.projectName)
            .join(', ')}).`
        : '7일 이내 마감인데 진행률이 70% 미만인 과제는 없습니다.',
  });

  const stalled = projects.filter((p) => p.weeklyChange === 0);
  insights.push({
    id: 'stalled',
    tone: stalled.length > 0 ? 'warning' : 'neutral',
    text:
      stalled.length > 0
        ? `지난주 대비 진행률 변화가 없는 과제가 ${stalled.length}건입니다. 진행 상황을 다시 확인해보세요.`
        : '모든 과제가 지난주 대비 진행률 변화를 보이고 있습니다.',
  });

  const companies = Array.from(new Set(projects.map((p) => p.company)));
  const companyLines = companies.map((company) => {
    const rows = projects.filter((p) => p.company === company);
    const target = pickMostAttentionNeeded(rows);
    if (!target) return null;
    return `${company}: ${target.projectName} (${target.status}, 진행률 ${target.progress}%)`;
  }).filter((line): line is string => Boolean(line));

  if (companyLines.length > 0) {
    insights.push({
      id: 'company-attention',
      tone: 'neutral',
      text: `관계사별 확인 필요 항목 — ${companyLines.join(' / ')}`,
    });
  }

  return insights;
}
