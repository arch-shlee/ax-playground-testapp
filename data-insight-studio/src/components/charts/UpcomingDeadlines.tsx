import type { Project } from '../../types';
import { STATUS_COLORS } from '../../types';
import { remainingLabel } from '../../utils/dateUtils';
import { ChartCard } from './ChartCard';

export function UpcomingDeadlines({ projects, onSelect }: { projects: Project[]; onSelect: (id: string) => void }) {
  return (
    <ChartCard title="마감 임박 과제" subtitle="완료 예정일이 가까운 순">
      <div className="flex flex-col gap-3">
        {projects.length === 0 && <p className="py-6 text-center text-[12.5px] text-slate-400">해당하는 과제가 없습니다.</p>}
        {projects.map((p) => {
          const colors = STATUS_COLORS[p.status];
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="flex flex-col gap-1.5 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50"
            >
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="truncate font-medium text-slate-700">{p.projectName}</span>
                <span className="ml-2 shrink-0 font-semibold" style={{ color: colors.main }}>
                  {remainingLabel(p.dueDate)}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${p.progress}%`, background: colors.main }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}
