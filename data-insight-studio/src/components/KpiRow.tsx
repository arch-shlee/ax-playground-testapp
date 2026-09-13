import { ClipboardList, CheckCircle2, AlertTriangle, AlertOctagon, Gauge, ArrowUp, ArrowDown } from 'lucide-react';
import type { KpiData } from '../utils/metrics';

interface KpiCardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  accentClass: string;
  delta?: number;
  deltaGoodDirection?: 'up' | 'down';
  deltaSuffix?: string;
}

function KpiCard({ label, value, description, icon, accentClass, delta, deltaGoodDirection, deltaSuffix }: KpiCardProps) {
  const showDelta = delta !== undefined && delta !== 0;
  const isUp = (delta ?? 0) > 0;
  const isGood = showDelta && deltaGoodDirection ? (isUp ? deltaGoodDirection === 'up' : deltaGoodDirection === 'down') : true;

  return (
    <div className="dis-fade-in flex flex-1 flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClass}`}>{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-800">{value}</span>
        {showDelta && (
          <span
            className={`flex items-center gap-0.5 text-[12px] font-semibold ${
              isGood ? 'text-status-normal' : 'text-status-delayed'
            }`}
          >
            {isUp ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
            {Math.abs(delta ?? 0)}
            {deltaSuffix}
          </span>
        )}
      </div>
      <p className="text-[12px] text-slate-400">{description}</p>
    </div>
  );
}

export function KpiRow({ kpi }: { kpi: KpiData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <KpiCard
        label="전체 과제"
        value={`${kpi.total}건`}
        description="현재 필터 기준 전체 과제 수"
        icon={<ClipboardList size={18} className="text-navy-700" />}
        accentClass="bg-navy-50"
      />
      <KpiCard
        label="정상 진행"
        value={`${kpi.normal}건`}
        description="일정대로 진행 중인 과제"
        icon={<CheckCircle2 size={18} className="text-status-normal" />}
        accentClass="bg-teal-50"
        delta={kpi.normalDelta}
        deltaGoodDirection="up"
      />
      <KpiCard
        label="확인 필요"
        value={`${kpi.warning}건`}
        description="주의가 필요한 과제"
        icon={<AlertTriangle size={18} className="text-status-warning" />}
        accentClass="bg-orange-50"
        delta={kpi.warningDelta}
        deltaGoodDirection="down"
      />
      <KpiCard
        label="일정 지연"
        value={`${kpi.delayed}건`}
        description="기한을 넘겼거나 지연된 과제"
        icon={<AlertOctagon size={18} className="text-status-delayed" />}
        accentClass="bg-red-50"
        delta={kpi.delayedDelta}
        deltaGoodDirection="down"
      />
      <KpiCard
        label="평균 진행률"
        value={`${kpi.avgProgress.toFixed(1)}%`}
        description="전체 과제 평균 진행률"
        icon={<Gauge size={18} className="text-blue-600" />}
        accentClass="bg-blue-50"
        delta={Math.round(kpi.avgWeeklyChange * 10) / 10}
        deltaGoodDirection="up"
        deltaSuffix="%p"
      />
    </div>
  );
}
