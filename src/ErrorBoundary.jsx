import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.removeItem('theme');
    } catch {}
    window.location.reload();
  };

  handleClearCacheAndLogin = () => {
    try {
      // Clear cached session data
      localStorage.removeItem('dg_users');
      localStorage.removeItem('last_auto_backup_date');
      localStorage.removeItem('medicine_requests');
    } catch {}
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected rendering error occurred.';
      const errorStack = this.state.error?.stack || '';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Header / Alert Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200/70 text-red-600 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-500 max-w-sm">
                The application encountered an unexpected issue while rendering this screen.
              </p>
            </div>

            {/* Error Message Banner */}
            <div className="p-3.5 bg-red-50/70 border border-red-200/80 rounded-2xl text-xs text-red-800 font-mono break-words leading-relaxed">
              <span className="font-bold text-red-900 block mb-1">Error:</span>
              {errorMessage}
            </div>

            {/* Technical Details Accordion */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                <span>{this.state.showDetails ? 'Hide Technical Details' : 'View Technical Details'}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${this.state.showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {this.state.showDetails && (
                <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[10px] space-y-2 overflow-x-auto max-h-56">
                  {errorStack && (
                    <div>
                      <span className="text-red-400 font-bold block mb-1">Stack Trace:</span>
                      <pre className="whitespace-pre-wrap leading-tight">{errorStack}</pre>
                    </div>
                  )}
                  {componentStack && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-amber-400 font-bold block mb-1">Component Stack:</span>
                      <pre className="whitespace-pre-wrap leading-tight">{componentStack}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-[#0697A8] hover:bg-[#057A88] text-white font-bold rounded-xl text-xs shadow-md shadow-[#0697A8]/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndLogin}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Clear Local Cache & Return to Login</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
