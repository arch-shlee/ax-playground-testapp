import { toPng, toSvg } from 'html-to-image';
import type { ProcessStep } from '../types';

export function todayStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportElementAsImage(
  element: HTMLElement,
  format: 'png' | 'svg',
): Promise<void> {
  const options = { backgroundColor: '#ffffff', pixelRatio: 2, cacheBust: true };
  const dataUrl = format === 'png' ? await toPng(element, options) : await toSvg(element, options);
  triggerDownload(dataUrl, `process-canvas-${todayStamp()}.${format}`);
}

function csvEscape(value: string): string {
  const v = value ?? '';
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function exportStepsAsCsv(steps: ProcessStep[]): void {
  const headers = ['순서', '단계명', '유형', '담당역할', '상태', '설명', '필요자료', '완료조건', '확인사항', '메모'];
  const kindLabel: Record<ProcessStep['kind'], string> = {
    start: '시작',
    end: '종료',
    process: '진행',
    decision: '의사결정',
  };
  const rows = [...steps]
    .sort((a, b) => a.order - b.order)
    .map((s) =>
      [
        String(s.order + 1),
        s.label,
        kindLabel[s.kind],
        s.role,
        s.status,
        s.description,
        s.inputs,
        s.completionCriteria,
        s.checkpoints,
        s.memo,
      ]
        .map(csvEscape)
        .join(','),
    );
  const csv = ['﻿' + headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, `process-canvas-steps-${todayStamp()}.csv`);
  URL.revokeObjectURL(url);
}
