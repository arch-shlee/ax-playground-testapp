import { Header } from './components/Header';
import { ErrorBanner } from './components/ErrorBanner';
import { AnalysisLoader } from './components/AnalysisLoader';
import { UploadScreen } from './components/UploadScreen';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useDashboardStore } from './store/dashboardStore';

function AppShell() {
  const dataSource = useDashboardStore((s) => s.dataSource);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      <Header />
      <ErrorBanner />
      <main className="min-h-0 flex-1">{dataSource === 'none' ? <UploadScreen /> : <Dashboard />}</main>
      <AnalysisLoader />
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
