import { useRef } from 'react';
import { Sparkles, Upload, RotateCcw } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

export function Header() {
  const loadSample = useDashboardStore((s) => s.loadSample);
  const loadFile = useDashboardStore((s) => s.loadFile);
  const reset = useDashboardStore((s) => s.reset);
  const dataSource = useDashboardStore((s) => s.dataSource);
  const isAnalyzing = useDashboardStore((s) => s.isAnalyzing);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (dataSource === 'none' || window.confirm('현재 데이터를 초기화하고 처음 화면으로 돌아가시겠습니까?')) {
      reset();
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-white px-8 py-4">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-navy-800">Data Insight Studio</h1>
        <p className="mt-0.5 text-[12.5px] text-slate-500">
          Excel 데이터를 한눈에 이해할 수 있는 업무 화면으로 바꿉니다
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => loadSample()}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <Sparkles size={14} /> 샘플 데이터 불러오기
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-800 disabled:opacity-50"
        >
          <Upload size={14} /> 파일 업로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={handleReset}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3.5 py-2 text-[12.5px] font-medium text-red-500 hover:bg-red-50 disabled:opacity-50"
        >
          <RotateCcw size={14} /> 초기화
        </button>
      </div>
    </header>
  );
}
