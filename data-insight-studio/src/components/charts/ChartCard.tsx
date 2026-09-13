import type { ReactNode } from 'react';

export function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="dis-fade-in flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
      <div>
        <h3 className="text-[13.5px] font-bold text-slate-700">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
