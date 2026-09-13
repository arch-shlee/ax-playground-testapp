import { Wand2, FileText, ListChecks, ClipboardList } from 'lucide-react';
import { useProcessStore } from '../store/processStore';
import { SAMPLE_SCENARIOS } from '../data/sampleScenarios';

const SCENARIO_ICONS = [ClipboardList, FileText, ListChecks];

export function InputPanel() {
  const inputText = useProcessStore((s) => s.inputText);
  const setInputText = useProcessStore((s) => s.setInputText);
  const generateFromInput = useProcessStore((s) => s.generateFromInput);
  const loadScenario = useProcessStore((s) => s.loadScenario);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto pc-scrollbar border-r border-slate-100 bg-white px-5 py-5">
      <div>
        <h2 className="text-sm font-bold text-slate-700">업무 절차 입력</h2>
        <p className="mt-0.5 text-[12px] text-slate-400">업무 절차를 문장으로 입력해주세요</p>
      </div>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={'업무 절차를 문장으로 입력해주세요.\n예) 담당자가 신청서를 접수한다. 시스템이 자동으로 확인한다. ...'}
        className="h-64 w-full flex-none resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-[13px] leading-relaxed text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />

      <button
        onClick={generateFromInput}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-2.5 text-[13.5px] font-bold text-white shadow-sm transition hover:opacity-90"
      >
        <Wand2 size={16} /> 프로세스 생성
      </button>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="text-[12.5px] font-bold text-slate-600">샘플 시나리오 선택</h3>
        <div className="mt-2 flex flex-col gap-2">
          {SAMPLE_SCENARIOS.map((scenario, i) => {
            const Icon = SCENARIO_ICONS[i % SCENARIO_ICONS.length];
            const active = inputText === scenario.text;
            return (
              <button
                key={scenario.id}
                onClick={() => loadScenario(scenario)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  active
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon size={15} className={active ? 'text-blue-500' : 'text-slate-400'} />
                {scenario.title}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto rounded-lg bg-slate-50 p-3 text-[11.5px] leading-relaxed text-slate-400">
        문장의 동사(확인한다, 검토한다, 요청한다 등)를 기준으로 단계를 나누고, "여부/통과하면/실패하면/승인되면"이 포함된 문장은 의사결정 단계로 표시됩니다.
      </div>
    </aside>
  );
}
