import React from "react";
import toast from "react-hot-toast";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for developers
    console.error("🔴 Error Boundary caught an error:", {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorStack: error.stack,
    });

    // Store error details in state for potential reporting
    this.setState({
      error,
      errorInfo,
    });

    // Show user-friendly toast notification
    toast.error("Something went wrong. Please refresh the page.");
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl"></i>
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h1>

            <p className="text-slate-400 mb-8">
              We encountered an unexpected error. This has been logged and our
              team will look into it.
            </p>

            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-500 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-slate-950 rounded-lg text-xs text-red-400 overflow-auto">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
