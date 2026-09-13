import { AnimatePresence, motion } from 'framer-motion';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ProcessCanvas } from './components/ProcessCanvas';
import { TimelineView } from './components/TimelineView';
import { DetailPanel } from './components/DetailPanel';
import { NlEditBar } from './components/NlEditBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useProcessStore } from './store/processStore';

function CanvasArea() {
  const viewMode = useProcessStore((s) => s.viewMode);
  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="h-full w-full"
        >
          {viewMode === 'timeline' ? <TimelineView /> : <ProcessCanvas />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AppShell() {
  const presentationMode = useProcessStore((s) => s.presentationMode);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      <Header />
      <main className="flex min-h-0 flex-1">
        {!presentationMode && (
          <div style={{ width: '28%' }} className="min-w-[280px] max-w-[420px] shrink-0">
            <InputPanel />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <CanvasArea />
        </div>
        {!presentationMode && (
          <div style={{ width: '22%' }} className="min-w-[280px] max-w-[380px] shrink-0">
            <DetailPanel />
          </div>
        )}
      </main>
      {!presentationMode && <NlEditBar />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
