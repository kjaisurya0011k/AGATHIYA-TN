import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FullScreenLoader } from './FullScreenLoader';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Returns the default home destination for a specific role
 */
export function getRoleHomePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'mentor') return '/mentor';
  return '/home';
}

/**
 * RoleRoute Guard:
 * - Shows full-screen loader while session/role is resolving (zero visual flash)
 * - Redirects logged-out visitors to /login
 * - Enforces student onboarding completion (mentors and admins skip onboarding)
 * - Redirects unauthorized roles directly to their respective role page:
 *   - Student opening /mentor or /admin -> redirected to /home
 *   - Mentor opening /admin -> redirected to /mentor
 *   - Admin opening student-only route -> redirected to /admin
 */
export function RoleRoute({ children, allowedRoles }) {
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

  // 1. Session or role is resolving: show full-screen loader to prevent flash of wrong page
  if (loading) {
    return <FullScreenLoader />;
  }

  // 2. Unauthenticated visitors: redirect to /login and remember attempted destination
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
              : 'Unable to verify your account profile due to a network issue. Please check your connection and retry.'}
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

  const currentRole = profile?.role || 'student';
  const isStudent = currentRole === 'student';

  // 4. Students with incomplete onboarding: send to /onboarding
  if (isStudent && !isProfileComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // 5. Mentors and admins skip student onboarding form (redirect to their role home)
  if (!isStudent && location.pathname === '/onboarding') {
    return <Navigate to={getRoleHomePath(currentRole)} replace />;
  }

  // 6. Role check: if current role is not in allowedRoles, redirect directly to their own home
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={getRoleHomePath(currentRole)} replace />;
  }

  return children;
}

export default RoleRoute;
