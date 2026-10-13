import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert } from 'lucide-react';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, userRole, loading } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          {lang === 'ta' ? 'சரிபார்க்கிறது...' : 'Verifying authentication...'}
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem' }}>
          <ShieldAlert size={48} color="var(--purple-600)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--navy-900)', marginBottom: '0.75rem', fontSize: '1.4rem' }}>
            {lang === 'ta' ? 'அணுகல் அனுமதி இல்லை' : 'Access Restricted'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {lang === 'ta'
              ? `இந்த பக்கம் ${allowedRoles.join(', ')} அனுமதி பெற்றவர்களுக்கு மட்டுமே. உங்கள் தற்போதைய பங்கு: ${userRole}.`
              : `This section is restricted to ${allowedRoles.join(', ')} accounts. Your current profile role is: ${userRole}.`}
          </p>
          <a href="/" className="btn btn-primary">
            {lang === 'ta' ? 'முகப்புக்குச் செல்' : 'Back to Home'}
          </a>
        </div>
      </div>
    );
  }

  return children;
}
