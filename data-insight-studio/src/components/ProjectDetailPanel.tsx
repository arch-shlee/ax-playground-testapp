import { ChevronLeft, ChevronRight, X, Calendar, User, Building2, AlertCircle } from 'lucide-react';
import type { Project } from '../types';
import { STATUS_COLORS } from '../types';
import { formatDateKo, remainingLabel } from '../utils/dateUtils';

export function ProjectDetailPanel({
  project,
  orderedProjects,
  onClose,
  onNavigate,
}: {
  project: Project | null;
  orderedProjects: Project[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  if (!project) return null;

  const index = orderedProjects.findIndex((p) => p.id === project.id);
  const prev = index > 0 ? orderedProjects[index - 1] : null;
  const next = index >= 0 && index < orderedProjects.length - 1 ? orderedProjects[index + 1] : null;
  const colors = STATUS_COLORS[project.status];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/20" onClick={onClose} />
      <div className="dis-fade-in relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <span className="text-[12.5px] font-semibold text-slate-400">
            {index + 1} / {orderedProjects.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => prev && onNavigate(prev.id)}
              disabled={!prev}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              title="이전 프로젝트"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => next && onNavigate(next.id)}
              disabled={!next}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
              title="다음 프로젝트"
            >
              <ChevronRight size={18} />
            </button>
            <button onClick={onClose} className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto dis-scrollbar px-6 py-5">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-[11.5px] font-bold"
            style={{ background: colors.bg, color: colors.text }}
          >
            {project.status}
          </span>
          <h2 className="mt-3 text-[19px] font-bold leading-snug text-slate-800">{project.projectName}</h2>

          <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
            <div className="flex items-center gap-2 text-slate-500">
              <Building2 size={14} /> {project.company} · {project.department}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <User size={14} /> {project.owner}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar size={14} /> {formatDateKo(project.startDate)} ~ {formatDateKo(project.dueDate)}
            </div>
            <div className="flex items-center gap-2 font-semibold" style={{ color: colors.main }}>
              <AlertCircle size={14} /> {remainingLabel(project.dueDate)}
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
              <span className="font-semibold text-slate-600">진행률</span>
              <span className="font-bold text-slate-800">{project.progress}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${project.progress}%`, background: colors.main }}
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-slate-400">
              지난주 대비 {project.weeklyChange >= 0 ? '+' : ''}
              {project.weeklyChange}%p
            </p>
          </div>

          <div className="mt-6">
            <h3 className="mb-1.5 text-[12.5px] font-semibold text-slate-600">업무 유형</h3>
            <p className="text-[12.5px] text-slate-500">{project.category}</p>
          </div>

          <div className="mt-6">
            <h3 className="mb-1.5 text-[12.5px] font-semibold text-slate-600">주요 이슈</h3>
            <p className="rounded-lg bg-slate-50 p-3 text-[12.5px] leading-relaxed text-slate-600">
              {project.issue || '특이사항 없음'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
