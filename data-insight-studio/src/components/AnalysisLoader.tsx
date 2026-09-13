import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { AnalysisStage } from '../types';

const STEPS: { stage: AnalysisStage; label: string }[] = [
  { stage: 'structure', label: '데이터 구조 확인' },
  { stage: 'metrics', label: '주요 지표 계산' },
  { stage: 'building', label: '대시보드 구성' },
];

const STAGE_ORDER: AnalysisStage[] = ['structure', 'metrics', 'building', 'done'];

export function AnalysisLoader() {
  const isAnalyzing = useDashboardStore((s) => s.isAnalyzing);
  const analysisStage = useDashboardStore((s) => s.analysisStage);

  if (!isAnalyzing) return null;

  const currentIndex = STAGE_ORDER.indexOf(analysisStage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
      <div className="dis-fade-in flex w-72 flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-slate-100">
        <p className="text-center text-[13px] font-semibold text-slate-600">데이터를 분석하고 있습니다…</p>
        <div className="flex flex-col gap-3">
          {STEPS.map((step, i) => {
            const stepIndex = STAGE_ORDER.indexOf(step.stage);
            const isDone = currentIndex > stepIndex;
            const isActive = currentIndex === stepIndex;
            return (
              <div key={step.stage} className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 size={18} className="text-status-normal" />
                ) : isActive ? (
                  <Loader2 size={18} className="animate-spin text-blue-600" />
                ) : (
                  <Circle size={18} className="text-slate-200" />
                )}
                <span
                  className={`text-[13px] ${
                    isDone ? 'text-slate-400' : isActive ? 'font-semibold text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {i + 1}. {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
