import { useEffect, useState } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProcessStore } from '../store/processStore';

export function NlEditBar() {
  const [value, setValue] = useState('');
  const runNlCommand = useProcessStore((s) => s.runNlCommand);
  const toast = useProcessStore((s) => s.toast);
  const dismissToast = useProcessStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismissToast, 4000);
    return () => clearTimeout(t);
  }, [toast, dismissToast]);

  const submit = () => {
    const text = value.trim();
    if (!text) return;
    runNlCommand(text);
    setValue('');
  };

  return (
    <div className="relative flex items-center gap-3 border-t border-slate-100 bg-white px-6 py-2.5">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-16 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy-800 px-3.5 py-2 text-[12.5px] font-medium text-white shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <MessageSquarePlus size={16} className="shrink-0 text-slate-400" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="프로세스 수정 요청 — 예) 보안 검토 단계를 추가해줘 / 담당자별로 구분해줘"
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-[12.5px] outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
      />
      <button
        onClick={submit}
        className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-navy-800"
      >
        <Send size={13} /> 요청
      </button>

      <p className="ml-4 shrink-0 border-l border-slate-100 pl-4 text-[11px] text-slate-400">
        본 프로세스는 기능 시연을 위해 구성한 예시입니다
      </p>
    </div>
  );
}
