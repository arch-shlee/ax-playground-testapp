import { useState } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Download,
  RotateCcw,
  Workflow,
  Rows3,
  ListTree,
  Maximize,
  Minimize,
  ChevronDown,
} from 'lucide-react';
import { useProcessStore } from '../store/processStore';
import { DEFAULT_SCENARIO } from '../data/sampleScenarios';
import { exportElementAsImage } from '../utils/exportUtils';
import type { ViewMode } from '../types';

const VIEW_TABS: { id: ViewMode; label: string; icon: typeof Workflow }[] = [
  { id: 'flow', label: '기본 흐름도', icon: Workflow },
  { id: 'swimlane', label: '담당자별 보기', icon: Rows3 },
  { id: 'timeline', label: '단계 목록', icon: ListTree },
];

export function Header() {
  const viewMode = useProcessStore((s) => s.viewMode);
  const setViewMode = useProcessStore((s) => s.setViewMode);
  const loadScenario = useProcessStore((s) => s.loadScenario);
  const autoLayout = useProcessStore((s) => s.autoLayout);
  const reset = useProcessStore((s) => s.reset);
  const undo = useProcessStore((s) => s.undo);
  const presentationMode = useProcessStore((s) => s.presentationMode);
  const setPresentationMode = useProcessStore((s) => s.setPresentationMode);

  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'png' | 'svg') => {
    setExportOpen(false);
    const el =
      document.getElementById('process-canvas-viewport') ?? document.getElementById('process-canvas-timeline');
    if (!el) return;
    setExporting(true);
    try {
      await exportElementAsImage(el, format);
    } catch {
      window.alert('이미지 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('현재 프로세스를 초기화하고 기본 샘플로 되돌리시겠습니까?')) {
      reset();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!presentationMode) {
        await document.documentElement.requestFullscreen?.();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      }
    } catch {
      // fullscreen API may be blocked (iframe/permissions) — presentation mode still applies via CSS
    }
    setPresentationMode(!presentationMode);
  };

  if (presentationMode) {
    return (
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-2">
        <span className="text-sm font-semibold text-navy-700">Process Canvas — 발표 모드</span>
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
        >
          <Minimize size={14} /> 발표 모드 종료
        </button>
      </div>
    );
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-3">
      <div className="flex items-center gap-8">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-navy-800">Process Canvas</h1>
          <p className="text-[12px] text-slate-500">업무 설명을 이해하기 쉬운 프로세스 맵으로 바꿉니다</p>
        </div>

        <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {VIEW_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = viewMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  active ? 'bg-white text-navy-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => loadScenario(DEFAULT_SCENARIO)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <Sparkles size={14} /> 샘플 불러오기
        </button>
        <button
          onClick={autoLayout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <LayoutGrid size={14} /> 자동 정렬
        </button>
        <button
          onClick={undo}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={14} /> 변경 취소
        </button>

        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-navy-800 disabled:opacity-60"
          >
            <Download size={14} /> {exporting ? '저장 중…' : '이미지 저장'} <ChevronDown size={12} />
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
              <button
                onClick={() => handleExport('png')}
                className="block w-full px-3 py-2 text-left text-[12.5px] hover:bg-slate-50"
              >
                PNG로 저장
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="block w-full px-3 py-2 text-left text-[12.5px] hover:bg-slate-50"
              >
                SVG로 저장
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleReset}
          className="rounded-lg border border-red-100 px-3 py-1.5 text-[12.5px] font-medium text-red-500 hover:bg-red-50"
        >
          초기화
        </button>
        <button
          onClick={toggleFullscreen}
          title="전체화면 발표 모드"
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-500 hover:bg-slate-50"
        >
          <Maximize size={14} />
        </button>
      </div>
    </header>
  );
}
