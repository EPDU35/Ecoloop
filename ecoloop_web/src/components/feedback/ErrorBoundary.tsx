import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[EcoLoop] Error Boundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="font-bold text-xl text-gray-900 mb-2">
              Une erreur est survenue
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Cette page a rencontré un problème inattendu. Essayez de recharger.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-xs text-left bg-gray-50 p-3 rounded-xl mb-4 overflow-auto max-h-32 border border-gray-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleRetry}
              className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <RefreshCw size={18} />
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
