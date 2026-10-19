import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="m-4 rounded-lg border-2 border-red-300 bg-red-50 p-6">
          <h2 className="text-lg font-bold text-red-700">⚠️ Đã xảy ra lỗi</h2>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-red-500">Stack trace</summary>
            <pre className="mt-2 overflow-auto text-xs text-slate-600">
              {this.state.errorInfo?.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
