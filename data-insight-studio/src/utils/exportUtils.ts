import type { Project } from '../types';
import { formatDateKo, todayStamp } from './dateUtils';

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function csvEscape(value: string): string {
  const v = value ?? '';
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function exportProjectsAsCsv(projects: Project[]): void {
  const headers = ['과제명', '관계사', '담당 조직', '담당자', '상태', '진행률', '시작일', '완료 예정일', '업무 유형', '주요 이슈', '지난주 대비 변화'];
  const rows = projects.map((p) =>
    [
      p.projectName,
      p.company,
      p.department,
      p.owner,
      p.status,
      `${p.progress}%`,
      formatDateKo(p.startDate),
      formatDateKo(p.dueDate),
      p.category,
      p.issue,
      `${p.weeklyChange >= 0 ? '+' : ''}${p.weeklyChange}%p`,
    ]
      .map(csvEscape)
      .join(','),
  );
  const csv = ['﻿' + headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `data-insight-studio-projects-${todayStamp()}.csv`);
  URL.revokeObjectURL(url);
}

export function exportReportAsText(summary: string): void {
  const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `data-insight-studio-report-${todayStamp()}.txt`);
  URL.revokeObjectURL(url);
}
