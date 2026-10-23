import React, { useEffect, useState, useRef } from 'react';
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
  const handledRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    // 1. Check for any OAuth errors in URL query or hash parameters
    try {
      const fullParams = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
      const errorDesc = fullParams.get('error_description') || fullParams.get('error');
      if (errorDesc) {
        // Clear sensitive URL params immediately without logging tokens
        window.history.replaceState({}, document.title, window.location.pathname);
        if (mounted) {
          setCallbackError(errorDesc);
        }
        return;
      }
    } catch {
      // ignore
    }

    // Helper: route user to their respective destination based on role & profile completeness
    async function routeAuthenticatedUser(activeUser, activeProfile, activeIsProfileComplete) {
      if (handledRef.current) return;
      handledRef.current = true;

      // Clean URL hash and search params without logging or exposing tokens
      window.history.replaceState({}, document.title, window.location.pathname);

      const savedTarget = sessionStorage.getItem('eee_tn_redirect_after_login');
      if (savedTarget) {
        sessionStorage.removeItem('eee_tn_redirect_after_login');
      }

      let currentRole = activeProfile?.role;
      let isComplete = activeIsProfileComplete;

      // If profile is not yet resolved in context, fetch directly from Supabase
      if (!currentRole && supabase?.from) {
        try {
          const { data: prof } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', activeUser.id)
            .maybeSingle();
          if (prof?.role) {
            currentRole = prof.role;
          }
        } catch {
          // fallback to student
        }
      }

      currentRole = currentRole || 'student';

      if (currentRole === 'admin') {
        const target = savedTarget && savedTarget.startsWith('/admin') ? savedTarget : '/admin';
        navigate(target, { replace: true });
        return;
      }

      if (currentRole === 'mentor') {
        const target = savedTarget && (savedTarget.startsWith('/mentor') || savedTarget.startsWith('/profile')) ? savedTarget : '/mentor';
        navigate(target, { replace: true });
        return;
      }

      // Student role: verify whether onboarding / profile is complete
      if (isComplete === undefined && supabase?.from) {
        try {
          const { data: stData } = await supabase
            .from('student_details')
            .select('consent_given')
            .eq('id', activeUser.id)
            .maybeSingle();
          isComplete = Boolean(stData?.consent_given);
        } catch {
          isComplete = false;
        }
      }

      if (!isComplete) {
        navigate('/onboarding', { replace: true });
      } else {
        const target = savedTarget && !savedTarget.startsWith('/admin') && !savedTarget.startsWith('/mentor') && savedTarget !== '/login' ? savedTarget : '/home';
        navigate(target, { replace: true });
      }
    }

    // 2. If AuthContext has already resolved user & session
    if (!loading && (user || session)) {
      routeAuthenticatedUser(user || session.user, profile, isProfileComplete);
      return;
    }

    // 3. Listen to Supabase auth state change (handles OAuth hash & PKCE exchanges)
    if (supabase?.auth?.onAuthStateChange) {
      const { data: subData } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          await routeAuthenticatedUser(newSession.user, profile, isProfileComplete);
        }
      });
      authSubscription = subData?.subscription;
    }

    // 4. Also check getSession() directly
    if (supabase?.auth?.getSession) {
      supabase.auth.getSession().then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setCallbackError(error.message);
          return;
        }
        if (data?.session?.user) {
          routeAuthenticatedUser(data.session.user, profile, isProfileComplete);
        }
      }).catch((err) => {
        if (!mounted) return;
        setCallbackError(err?.message || 'Authentication failed');
      });
    }

    // 5. Fallback timer if no session is detected after 7 seconds
    const timeoutId = setTimeout(() => {
      if (!mounted || handledRef.current) return;
      window.history.replaceState({}, document.title, window.location.pathname);
      setCallbackError(
        lang === 'ta'
          ? 'உள்நுழைவு அமர்வை நிறுவ முடியவில்லை. தயவுசெய்து மீண்டும் உள்நுழையவும்.'
          : 'Unable to establish sign-in session. Please try signing in again.'
      );
    }, 7000);

    return () => {
      mounted = false;
      authSubscription?.unsubscribe?.();
      clearTimeout(timeoutId);
    };
  }, [loading, user, session, profile, isProfileComplete, navigate, lang]);

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
        <h2>{lang === 'ta' ? 'அங்கீகரிக்கப்படுகிறது...' : 'Signing you in...'}</h2>
        <div className="loader-ring" style={{ margin: '1.25rem auto' }} aria-hidden="true" />
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.92rem' }}>
          {lang === 'ta'
            ? 'உங்கள் Google கணக்கு சரிபார்க்கப்பட்டு உங்கள் பக்கத்திற்கு அழைத்துச் செல்லப்படுகிறீர்கள்.'
            : 'Verifying your credentials and directing you to your portal...'}
        </p>
      </div>
    </div>
  );
}

export default AuthCallback;
