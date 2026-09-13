import { AlertOctagon, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { InsightItem } from '../utils/insights';

const TONE_STYLE: Record<InsightItem['tone'], { icon: typeof Info; className: string }> = {
  delayed: { icon: AlertOctagon, className: 'text-status-delayed bg-red-50' },
  warning: { icon: AlertTriangle, className: 'text-status-warning bg-orange-50' },
  neutral: { icon: Info, className: 'text-slate-500 bg-slate-50' },
};

export function InsightsPanel({ insights }: { insights: InsightItem[] }) {
  return (
    <div className="dis-fade-in flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
      <div className="flex items-center gap-1.5">
        <Lightbulb size={15} className="text-blue-600" />
        <h3 className="text-[13.5px] font-bold text-slate-700">이번 주 확인사항</h3>
      </div>
      <div className="flex flex-col gap-2.5">
        {insights.map((insight) => {
          const style = TONE_STYLE[insight.tone];
          const Icon = style.icon;
          return (
            <div key={insight.id} className={`flex gap-2.5 rounded-xl p-3 text-[12.5px] leading-relaxed ${style.className}`}>
              <Icon size={15} className="mt-0.5 shrink-0" />
              <span className="text-slate-700">{insight.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
