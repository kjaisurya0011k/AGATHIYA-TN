import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FullScreenLoader } from './FullScreenLoader';
import { ShieldAlert, AlertCircle, RefreshCw } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }) {
  const {
    user,
    profile,
    isProfileComplete,
    loading,
    profileNetworkError,
    retryFetchProfile
  } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  // 1. Session is resolving: show full-screen loader to prevent flash
  if (loading) {
    return <FullScreenLoader />;
  }

  // 2. Logged-out visitors: redirect to /login and remember target page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Network error checking profile: provide retry button instead of redirect loop
  if (profileNetworkError) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem' }}>
          <AlertCircle size={44} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: 'var(--navy-900)' }}>
            {lang === 'ta' ? 'இணைப்பு பிழை' : 'Connection Error'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {lang === 'ta'
              ? 'உங்கள் கணக்கு விவரங்களை மீட்டெடுக்க முடியவில்லை. இணைய இணைப்பைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
              : 'Unable to verify your student profile due to a network issue. Please check your connection and retry.'}
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

  // 4. Mentors and admins skip student onboarding form
  const currentRole = profile?.role || 'student';
  const isStudent = currentRole === 'student';

  if (isStudent && !isProfileComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  if (!isStudent && location.pathname === '/onboarding') {
    const target = currentRole === 'admin' ? '/admin' : '/mentor';
    return <Navigate to={target} replace />;
  }

  // 5. Role checks using role stored in profiles - redirect to own role page
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    const roleHome = currentRole === 'admin' ? '/admin' : currentRole === 'mentor' ? '/mentor' : '/home';
    return <Navigate to={roleHome} replace />;
  }

  return children;
}

export default ProtectedRoute;
