import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Data Insight Studio error boundary caught:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-white text-center">
          <AlertOctagon size={32} className="text-red-400" />
          <p className="text-sm font-semibold text-slate-700">화면을 표시하는 중 문제가 발생했습니다.</p>
          <p className="max-w-sm text-[12.5px] text-slate-400">
            새로고침 후 샘플 데이터로 다시 시작할 수 있습니다.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-2 rounded-lg bg-navy-700 px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-navy-800"
          >
            새로고침
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
