import { AlertTriangle, X } from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';

export function ErrorBanner() {
  const error = useDashboardStore((s) => s.error);
  const dismissError = useDashboardStore((s) => s.dismissError);

  if (!error) return null;

  return (
    <div className="dis-fade-in flex items-center gap-2.5 border-b border-orange-100 bg-orange-50 px-8 py-2.5 text-[12.5px] text-orange-700">
      <AlertTriangle size={15} className="shrink-0" />
      <span className="flex-1">{error}</span>
      <button onClick={dismissError} className="rounded p-0.5 hover:bg-orange-100">
        <X size={14} />
      </button>
    </div>
  );
}
