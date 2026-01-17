import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fas fa-bug"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Oeps, er ging iets mis</h1>
            <p className="text-slate-600 mb-6">
              De applicatie is tegen een onverwachte fout aangelopen. Probeer de pagina te verversen.
            </p>
            <div className="bg-slate-100 p-3 rounded text-left text-xs font-mono text-slate-500 mb-6 overflow-auto max-h-32">
                {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all w-full"
            >
              Pagina Verversen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
