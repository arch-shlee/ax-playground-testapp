import { AlertTriangle, RefreshCw, GitBranch, Users, ListOrdered, ShieldQuestion } from 'lucide-react';
import { useProcessStore } from '../store/processStore';
import { analyzeProcess } from '../utils/analysis';
import { exportStepsAsCsv } from '../utils/exportUtils';

export function AnalysisPanel() {
  const graph = useProcessStore((s) => s.graph);
  const analysis = analyzeProcess(graph);

  const rows = [
    { icon: ListOrdered, label: '전체 단계 수', value: `${analysis.totalSteps}개` },
    { icon: Users, label: '담당 역할 수', value: `${analysis.roleCount}개` },
    { icon: GitBranch, label: '의사결정 단계 수', value: `${analysis.decisionCount}개` },
    {
      icon: AlertTriangle,
      label: '담당자 미지정 단계',
      value: analysis.unassignedSteps.length > 0 ? `${analysis.unassignedSteps.length}개` : '없음',
      warn: analysis.unassignedSteps.length > 0,
    },
    { icon: RefreshCw, label: '반복/되돌아가는 흐름', value: `${analysis.loopCount}개` },
    {
      icon: ShieldQuestion,
      label: '확인이 필요한 단계',
      value: analysis.checkpointSteps.length > 0 ? `${analysis.checkpointSteps.length}개` : '없음',
    },
  ];

  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[12.5px] font-bold text-slate-600">프로세스 확인사항</h3>
        <button
          onClick={() => exportStepsAsCsv(graph.steps)}
          className="text-[11px] font-semibold text-blue-600 hover:underline"
        >
          CSV 다운로드
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-white px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400">
              <row.icon size={12} />
              {row.label}
            </div>
            <p className={`mt-0.5 text-[13px] font-bold ${row.warn ? 'text-orange-500' : 'text-slate-700'}`}>
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
