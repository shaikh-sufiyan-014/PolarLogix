import React from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 max-w-3xl mx-auto my-8">
          <div className="glass-panel p-8 text-center space-y-6 border-l-4 border-l-rose-500 bg-rose-500/5 shadow-2xl rounded-2xl">
            <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-2">
              <ShieldAlert className="w-12 h-12 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {this.props.title || 'PolarLogix Operations Alert'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {this.props.message ||
                  'Something went wrong while rendering this section. Please refresh the page or retry to recover.'}
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-slate-900/90 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-40 border border-slate-800">
                <summary className="cursor-pointer text-slate-400 font-semibold mb-2 hover:text-slate-200">
                  View Technical Diagnostic Details
                </summary>
                <div className="text-rose-400 font-bold mb-1">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <pre className="whitespace-pre-wrap text-[11px] text-slate-400">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600 font-semibold rounded-xl text-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleReload}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-rose-500/25 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
