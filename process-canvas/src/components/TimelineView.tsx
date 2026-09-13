import { motion } from 'framer-motion';
import { Code2, Settings2, Cpu, UserCheck, User, HelpCircle, Play, Flag, type LucideIcon } from 'lucide-react';
import { useProcessStore } from '../store/processStore';
import { ROLE_COLORS, type Role } from '../types';

const ROLE_ICONS: Record<Role, LucideIcon> = {
  개발자: Code2,
  '운영 담당자': Settings2,
  '검증 시스템': Cpu,
  승인자: UserCheck,
  사용자: User,
  '담당자 미지정': HelpCircle,
};

export function TimelineView() {
  const graph = useProcessStore((s) => s.graph);
  const selectedNodeId = useProcessStore((s) => s.selectedNodeId);
  const selectNode = useProcessStore((s) => s.selectNode);

  const steps = [...graph.steps].sort((a, b) => a.order - b.order);

  return (
    <div id="process-canvas-timeline" className="h-full w-full overflow-y-auto pc-scrollbar bg-white px-10 py-8">
      <div className="mx-auto max-w-2xl">
        {steps.map((step, i) => {
          const colors = ROLE_COLORS[step.role];
          const Icon = step.kind === 'start' ? Play : step.kind === 'end' ? Flag : ROLE_ICONS[step.role];
          const outgoing = graph.links.filter((l) => l.source === step.id);
          const isSelected = step.id === selectedNodeId;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              className="relative flex gap-4 pb-8 last:pb-0"
            >
              {i < steps.length - 1 && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-16px)] w-px bg-slate-200" />
              )}
              <button
                onClick={() => selectNode(step.id)}
                className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-transform hover:scale-105"
                style={{ background: colors.bg, borderColor: colors.main, color: colors.main }}
              >
                <Icon size={18} />
              </button>
              <div
                onClick={() => selectNode(step.id)}
                className={`flex-1 cursor-pointer rounded-lg border-l-4 bg-slate-50/60 px-4 py-3 transition-all ${
                  isSelected ? 'ring-2 ring-blue-400 bg-blue-50/40' : 'hover:bg-slate-50'
                }`}
                style={{ borderLeftColor: colors.main }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-slate-800">
                    {i + 1}. {step.label}
                    {step.kind === 'decision' && (
                      <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                        의사결정
                      </span>
                    )}
                  </p>
                  <span className="shrink-0 text-[11px] font-medium" style={{ color: colors.main }}>
                    {step.role}
                  </span>
                </div>
                {step.description && <p className="mt-1 text-[12px] text-slate-500">{step.description}</p>}
                {outgoing.some((l) => l.label) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {outgoing
                      .filter((l) => l.label)
                      .map((l) => (
                        <span
                          key={l.id}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            l.kind === 'fail' ? 'bg-red-50 text-red-600' : 'bg-cyan-50 text-cyan-700'
                          }`}
                        >
                          {l.label} → {graph.steps.find((s) => s.id === l.target)?.label ?? l.target}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {steps.length === 0 && (
          <p className="py-16 text-center text-sm text-slate-400">표시할 단계가 없습니다. 왼쪽에서 프로세스를 생성해주세요.</p>
        )}
      </div>
    </div>
  );
}
