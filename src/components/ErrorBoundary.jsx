import React from 'react';
import { AlertCircle, RefreshCw, Home, LogOut, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleSignOut = async () => {
    try {
      if (supabase?.auth?.signOut) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out during error recovery note:', e);
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.href = '/login';
  };

  handleCopyError = () => {
    const details = `${this.state.error?.toString()}\n\nStack:\n${this.state.error?.stack || ''}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || ''}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(details).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
      });
    }
  };

  render() {
    if (this.state.hasError) {
      const isTamil = (typeof localStorage !== 'undefined' && localStorage.getItem('eee_tn_lang') === 'ta') || true;

      return (
        <div
          role="alert"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FBF8F2',
            padding: '1.5rem',
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(10, 37, 64, 0.08)',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid #FEE2E2'
              }}
            >
              <AlertCircle size={32} />
            </div>

            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#0A2540',
                margin: '0 0 0.5rem 0',
                lineHeight: 1.3
              }}
            >
              {isTamil ? 'ஏதோ தவறு நடந்துவிட்டது' : 'Something went wrong'}
            </h1>

            <p
              style={{
                color: '#4B5563',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                margin: '0 0 1.75rem 0'
              }}
            >
              {isTamil
                ? 'பக்கத்தை ஏற்றுவதில் எதிர்பாராத பிழை ஏற்பட்டது. பக்கத்தை மீண்டும் ஏற்றலாம் அல்லது முகப்புப் பக்கத்திற்குச் செல்லலாம்.'
                : 'An unexpected issue occurred while loading this page. You can try refreshing or returning to the home screen.'}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: '#008394',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 131, 148, 0.2)'
                }}
              >
                <RefreshCw size={16} />
                <span>{isTamil ? 'மீண்டும் ஏற்று' : 'Reload Page'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#0A2540',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid #D1D5DB',
                  cursor: 'pointer'
                }}
              >
                <Home size={16} />
                <span>{isTamil ? 'முகப்புக்குச் செல்' : 'Go to Home'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleSignOut}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#DC2626',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid #FCA5A5',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>{isTamil ? 'வெளியேறு' : 'Sign Out'}</span>
              </button>
            </div>

            {/* Error diagnostics collapsible */}
            <details
              style={{
                marginTop: '1.5rem',
                textAlign: 'left',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                padding: '0.75rem',
                border: '1px solid #E5E7EB',
                fontSize: '0.8rem',
                color: '#374151'
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: '#4B5563',
                  userSelect: 'none'
                }}
              >
                {isTamil ? 'பிழை விவரங்கள் (Technical Details)' : 'Technical Details'}
              </summary>
              <div style={{ marginTop: '0.75rem' }}>
                <pre
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#F87171',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    overflowX: 'auto',
                    fontSize: '0.78rem',
                    margin: '0 0 0.5rem 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {this.state.error?.toString()}
                </pre>
                <button
                  type="button"
                  onClick={this.handleCopyError}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.75rem',
                    color: '#4B5563',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {this.state.copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                  <span>{this.state.copied ? 'Copied!' : 'Copy error details'}</span>
                </button>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
