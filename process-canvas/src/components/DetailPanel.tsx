import { PlusCircle, Trash2, MousePointerClick } from 'lucide-react';
import { useProcessStore, statusOptions } from '../store/processStore';
import { ROLE_ORDER } from '../types';
import { AnalysisPanel } from './AnalysisPanel';

const FIELD_LABELS = {
  description: '단계 설명',
  inputs: '필요한 입력자료',
  completionCriteria: '완료 조건',
  checkpoints: '확인사항',
  memo: '메모',
} as const;

export function DetailPanel() {
  const graph = useProcessStore((s) => s.graph);
  const selectedNodeId = useProcessStore((s) => s.selectedNodeId);
  const updateStep = useProcessStore((s) => s.updateStep);
  const deleteNode = useProcessStore((s) => s.deleteNode);
  const addNode = useProcessStore((s) => s.addNode);

  const step = graph.steps.find((s) => s.id === selectedNodeId) ?? null;

  return (
    <aside className="flex h-full flex-col border-l border-slate-100 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <h2 className="text-sm font-bold text-slate-700">단계 상세정보</h2>
        <button
          onClick={() => addNode(selectedNodeId)}
          title="새 단계 추가"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-blue-600 hover:bg-blue-50"
        >
          <PlusCircle size={14} /> 단계 추가
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pc-scrollbar px-5 py-4">
        {!step ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <MousePointerClick size={22} />
            <p className="text-[12.5px]">캔버스에서 단계를 선택하면
              <br />
              상세정보를 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400">단계명</label>
              <input
                value={step.label}
                onChange={(e) => updateStep(step.id, { label: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13.5px] font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400">담당 역할</label>
                <select
                  value={step.role}
                  onChange={(e) => updateStep(step.id, { role: e.target.value as (typeof ROLE_ORDER)[number] })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[12.5px] outline-none focus:border-blue-400"
                >
                  {ROLE_ORDER.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400">상태</label>
                <select
                  value={step.status}
                  onChange={(e) => updateStep(step.id, { status: e.target.value as (typeof step)['status'] })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-[12.5px] outline-none focus:border-blue-400"
                >
                  {statusOptions().map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[]).map((field) => (
              <div key={field}>
                <label className="text-[11px] font-semibold text-slate-400">{FIELD_LABELS[field]}</label>
                <textarea
                  value={step[field]}
                  onChange={(e) => updateStep(step.id, { [field]: e.target.value })}
                  rows={field === 'description' ? 3 : 2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-[12.5px] leading-relaxed text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}

            <button
              onClick={() => deleteNode(step.id)}
              className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-100 py-2 text-[12.5px] font-medium text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> 단계 삭제
            </button>
          </div>
        )}
      </div>

      <AnalysisPanel />
    </aside>
  );
}
