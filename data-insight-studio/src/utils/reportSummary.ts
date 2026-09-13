import type { Project } from '../types';
import { computeKpis } from './metrics';
import { daysRemaining, formatDateKo } from './dateUtils';

export function generateReportSummary(projects: Project[]): string {
  const now = formatDateKo(new Date().toISOString());
  const kpi = computeKpis(projects);

  const goodProgress = [...projects]
    .filter((p) => p.status !== '지연')
    .sort((a, b) => b.weeklyChange - a.weeklyChange)
    .slice(0, 3);

  const needsAttention = projects.filter((p) => p.status === '주의');

  const delayed = projects.filter((p) => p.status === '지연');

  const nextWeekFocus = [...projects]
    .filter((p) => {
      const remaining = daysRemaining(p.dueDate);
      return p.status !== '정상' || (remaining >= 0 && remaining <= 7);
    })
    .sort((a, b) => daysRemaining(a.dueDate) - daysRemaining(b.dueDate))
    .slice(0, 5);

  const lines: string[] = [];
  lines.push(`이번 주 보고 요약 (기준일: ${now})`);
  lines.push('');

  lines.push('■ 전체 현황');
  lines.push(
    `- 총 ${kpi.total}개 과제 중 정상 ${kpi.normal}건, 확인 필요(주의) ${kpi.warning}건, 일정 지연 ${kpi.delayed}건입니다.`,
  );
  lines.push(
    `- 평균 진행률은 ${kpi.avgProgress.toFixed(1)}%이며, 지난주 대비 평균 ${
      kpi.avgWeeklyChange >= 0 ? '+' : ''
    }${kpi.avgWeeklyChange.toFixed(1)}%p 변화했습니다.`,
  );
  lines.push('');

  lines.push('■ 주요 진척');
  if (goodProgress.length > 0) {
    goodProgress.forEach((p) => {
      lines.push(`- ${p.projectName} (${p.company}): 진행률 ${p.progress}%, 지난주 대비 +${p.weeklyChange}%p`);
    });
  } else {
    lines.push('- 이번 주 두드러진 진척 사항은 없습니다.');
  }
  lines.push('');

  lines.push('■ 확인 필요 사항');
  if (needsAttention.length > 0) {
    needsAttention.forEach((p) => {
      lines.push(`- ${p.projectName} (${p.company} / ${p.owner}): ${p.issue || '진행률 점검 필요'}`);
    });
  } else {
    lines.push('- 현재 별도로 확인이 필요한 과제는 없습니다.');
  }
  lines.push('');

  lines.push('■ 일정 지연 항목');
  if (delayed.length > 0) {
    delayed.forEach((p) => {
      lines.push(
        `- ${p.projectName} (${p.company} / ${p.owner}): ${p.issue || '지연 사유 미기재'} (진행률 ${p.progress}%)`,
      );
    });
  } else {
    lines.push('- 현재 일정이 지연된 과제는 없습니다.');
  }
  lines.push('');

  lines.push('■ 다음 주 우선 확인사항');
  if (nextWeekFocus.length > 0) {
    nextWeekFocus.forEach((p) => {
      const remaining = daysRemaining(p.dueDate);
      const dueText = remaining < 0 ? `기한 ${Math.abs(remaining)}일 초과` : `마감 D-${remaining}`;
      lines.push(`- ${p.projectName} (${p.company}): ${dueText}, 진행률 ${p.progress}%`);
    });
  } else {
    lines.push('- 다음 주 특별히 우선 확인할 과제는 없습니다.');
  }

  return lines.join('\n');
}
