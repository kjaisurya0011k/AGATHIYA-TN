import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const {
    session,
    user,
    profile,
    isProfileComplete,
    loading,
    profileNetworkError,
    retryFetchProfile
  } = useAuth();

  const [callbackError, setCallbackError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function handleAuthVerification() {
      // Catch any error in hash or query parameters
      try {
        const fullParams = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
        const errorDesc = fullParams.get('error_description') || fullParams.get('error');
        if (errorDesc) {
          if (mounted) setCallbackError(errorDesc);
          return;
        }
      } catch {
        // ignore
      }

      // If session is still loading from AuthContext, wait
      if (loading) return;

      // If user & session are established, route according to role and onboarding status
      if (user || session) {
        const savedTarget = sessionStorage.getItem('eee_tn_redirect_after_login');
        if (savedTarget) {
          sessionStorage.removeItem('eee_tn_redirect_after_login');
        }

        const userRole = profile?.role || 'student';
        if (userRole === 'admin') {
          const target = savedTarget && savedTarget !== '/' && savedTarget !== '/login' ? savedTarget : '/admin';
          navigate(target, { replace: true });
        } else if (userRole === 'mentor') {
          const target = savedTarget && savedTarget !== '/' && savedTarget !== '/login' ? savedTarget : '/mentor';
          navigate(target, { replace: true });
        } else {
          // student
          if (!isProfileComplete) {
            navigate('/onboarding', { replace: true });
          } else {
            const target = savedTarget && savedTarget !== '/' && savedTarget !== '/login' ? savedTarget : '/home';
            navigate(target, { replace: true });
          }
        }
        return;
      }

      // If no user yet, perform a direct getSession check
      try {
        if (supabase?.auth?.getSession) {
          const { data: { session: directSession }, error } = await supabase.auth.getSession();
          if (error) {
            if (mounted) setCallbackError(error.message);
            return;
          }
          if (!directSession) {
            // No session returned after callback: redirect back to login
            navigate('/login', { replace: true });
          }
        }
      } catch (err) {
        if (mounted) setCallbackError(err?.message || 'Authentication failed');
      }
    }

    handleAuthVerification();

    return () => {
      mounted = false;
    };
  }, [loading, user, session, isProfileComplete, navigate]);

  if (profileNetworkError) {
    return (
      <div className="callback-wrapper container" style={{ padding: '5rem 1rem' }}>
        <div className="card callback-card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2>{lang === 'ta' ? 'இணைப்பு பிழை' : 'Connection Error'}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.5rem' }}>
            {lang === 'ta'
              ? 'உங்கள் சுயவிவரத்தை சரிபார்க்க முடியவில்லை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
              : 'Unable to verify your student profile over the network. Please retry.'}
          </p>
          <button
            type="button"
            onClick={retryFetchProfile}
            className="btn btn-primary"
            style={{ minWidth: '160px', margin: '0 auto' }}
          >
            <RefreshCw size={16} />
            <span>{lang === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  if (callbackError) {
    return (
      <div className="callback-wrapper container" style={{ padding: '5rem 1rem' }}>
        <div className="card callback-card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2>{lang === 'ta' ? 'உள்நுழைவு பிழை' : 'Authentication Error'}</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 1.5rem' }}>
            {callbackError}
          </p>
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="btn btn-primary"
            style={{ margin: '0 auto' }}
          >
            {lang === 'ta' ? 'உள்நுழைவு பக்கத்திற்குத் திரும்பு' : 'Back to Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-wrapper container" style={{ padding: '6rem 1rem' }}>
      <div className="card callback-card" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <div className="brand-icon" style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px' }}>
          <GraduationCap size={32} color="#FFFFFF" />
        </div>
        <h2>{lang === 'ta' ? 'அங்கீகரிக்கப்படுகிறது...' : 'Signing You In...'}</h2>
        <div className="loader-ring" style={{ margin: '1.25rem auto' }} aria-hidden="true" />
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.92rem' }}>
          {lang === 'ta'
            ? 'உங்கள் Google கணக்கு சரிபார்க்கப்பட்டு உங்கள் பக்கத்திற்கு அழைத்துச் செல்லப்படுகிறீர்கள்.'
            : 'Verifying your credentials and directing you to the student portal.'}
        </p>
      </div>
    </div>
  );
}

export default AuthCallback;
