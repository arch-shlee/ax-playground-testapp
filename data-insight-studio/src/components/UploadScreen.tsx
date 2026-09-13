import { useCallback, useState } from 'react';
import { FileSpreadsheet, Sparkles, UploadCloud } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

export function UploadScreen() {
  const loadFile = useDashboardStore((s) => s.loadFile);
  const loadSample = useDashboardStore((s) => s.loadSample);
  const [isDragOver, setIsDragOver] = useState(false);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile],
  );

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-full w-full items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-10 py-16 text-center transition-colors ${
            isDragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
          }`}
        >
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={onFileSelect} />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UploadCloud size={30} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-slate-700">Excel 또는 CSV 파일을 올려주세요</p>
            <p className="mt-1 text-[12.5px] text-slate-400">파일을 이 영역에 끌어다 놓거나 클릭해서 선택하세요</p>
          </div>
        </label>

        <div className="mt-6 flex items-center gap-3 text-slate-300">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-medium">또는</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          onClick={() => loadSample()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy-700 to-blue-600 py-3.5 text-[14px] font-bold text-white shadow-soft transition hover:opacity-90"
        >
          <Sparkles size={16} /> 샘플 데이터로 시작하기
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
          <FileSpreadsheet size={13} /> 지원 형식: .xlsx, .xls, .csv
        </p>
      </div>
    </div>
  );
}
