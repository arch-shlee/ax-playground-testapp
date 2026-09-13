import { useState } from 'react';
import { X, ClipboardCopy, Download, Check } from 'lucide-react';
import type { Project } from '../types';
import { generateReportSummary } from '../utils/reportSummary';
import { exportReportAsText } from '../utils/exportUtils';

export function ReportSummaryModal({ projects, onClose }: { projects: Project[]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const summary = generateReportSummary(projects);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert('클립보드 복사에 실패했습니다. 텍스트를 직접 선택해 복사해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-6">
      <div className="dis-fade-in flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-[15px] font-bold text-slate-800">이번 주 보고 요약</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto dis-scrollbar px-6 py-5">
          <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-slate-700">{summary}</pre>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={() => exportReportAsText(summary)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download size={14} /> 텍스트 파일로 다운로드
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-800"
          >
            {copied ? <Check size={14} /> : <ClipboardCopy size={14} />} {copied ? '복사됨' : '클립보드에 복사'}
          </button>
        </div>
      </div>
    </div>
  );
}
