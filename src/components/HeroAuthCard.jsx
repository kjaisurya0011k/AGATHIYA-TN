import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { brand } from '../data/brand';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Compass,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';

export function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function HeroAuthCard() {
  const {
    user,
    profile,
    studentDetails,
    isProfileComplete,
    signInWithGoogle,
    setShowOnboardingModal,
    authError,
    clearAuthError
  } = useAuth();

  const { lang, t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleClick = async () => {
    setSubmitting(true);
    await signInWithGoogle();
    setSubmitting(false);
  };

  const getFirstName = () => {
    const raw = studentDetails?.full_name || profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    if (raw) return raw.trim().split(' ')[0];
    return user?.email ? user.email.split('@')[0] : 'Student';
  };

  const completionPercentage = isProfileComplete ? 100 : 35;

  // 1. Logged-in State: Welcome Card
  if (user) {
    return (
      <div className="hero-auth-card hero-welcome-card" role="region" aria-label="Student Welcome Portal">
        <div className="welcome-card-header">
          <div className="welcome-avatar-wrapper">
            {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <img
                src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                alt={getFirstName()}
                className="welcome-avatar-img"
              />
            ) : (
              <div className="welcome-avatar-fallback">
                {getFirstName().charAt(0).toUpperCase()}
              </div>
            )}
            <span className="online-indicator" aria-label="Online" />
          </div>

          <div className="welcome-meta">
            <span className="welcome-salutation">
              {t.auth.welcomeBack}
            </span>
            <h3 className="welcome-name">
              {getFirstName()}!
            </h3>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="welcome-progress-block">
          <div className="welcome-progress-label">
            <span>
              {isProfileComplete ? t.auth.profileComplete : t.auth.profileIncomplete}
            </span>
            <strong className="welcome-progress-percent">
              {completionPercentage}%
            </strong>
          </div>
          <div className="welcome-progress-track">
            <div
              className={`welcome-progress-fill ${isProfileComplete ? 'complete' : 'pending'}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Highlights / Status Note */}
        <div className="welcome-badges-row">
          <div className="welcome-pill">
            <ShieldCheck size={14} color="var(--cyan-700)" />
            <span>{studentDetails?.district || profile?.district || (lang === 'ta' ? 'தமிழ்நாடு' : 'Tamil Nadu')}</span>
          </div>
          {studentDetails?.cutoff_marks && (
            <div className="welcome-pill">
              <Sparkles size={14} color="#843AB4" />
              <span>{lang === 'ta' ? 'கட்-ஆஃப்: ' : 'Cutoff: '}{studentDetails.cutoff_marks}</span>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div className="welcome-actions">
          {!isProfileComplete ? (
            <button
              type="button"
              onClick={() => setShowOnboardingModal(true)}
              className="btn btn-primary btn-full-width welcome-action-btn"
            >
              <UserCheck size={17} />
              <span>{t.auth.completeProfileBtn}</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <div className="welcome-button-group">
              <Link
                to="/opportunities"
                className="btn btn-primary welcome-action-btn"
              >
                <Compass size={17} />
                <span>{t.auth.exploreOptionsBtn}</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="btn btn-outline welcome-edit-btn"
                title={lang === 'ta' ? 'சுயவிவரத்தைத் திருத்த' : 'Edit profile'}
              >
                <Edit3 size={15} />
                <span>{t.auth.myProfile}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Logged-out State: Sign-In Card
  return (
    <div className="hero-auth-card hero-signin-card" role="region" aria-label={`Sign In to ${brand.name}`}>
      {/* Friendly OAuth Error Banner */}
      {authError && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={16} className="auth-error-icon" />
          <span className="auth-error-text">
            {t.auth[authError] || t.auth.oauthGenericError}
          </span>
          <button
            type="button"
            onClick={clearAuthError}
            className="auth-error-close"
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="signin-card-badge">
        <Sparkles size={13} />
        <span>{lang === 'ta' ? 'இலவச வழிகாட்டல்' : 'Free Student Access'}</span>
      </div>

      <h2 className="signin-card-title">
        {t.auth.joinTitle}
      </h2>

      <p className="signin-card-desc">
        {t.auth.joinDesc}
      </p>

      {/* Continue with Google button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={submitting}
        className="google-signin-btn"
        aria-label="Continue with Google"
      >
        <div className="google-icon-wrapper">
          <GoogleLogo />
        </div>
        <span className="google-btn-text">
          {submitting
            ? (lang === 'ta' ? 'இணைகிறது...' : 'Connecting...')
            : t.auth.continueWithGoogle}
        </span>
      </button>

      {/* Benefits checklist */}
      <div className="signin-benefits-list">
        <div className="signin-benefit-item">
          <CheckCircle2 size={14} color="var(--cyan-700)" />
          <span>{lang === 'ta' ? '7.5% அரசுப் பள்ளி ஒதுக்கீடு சரிபார்ப்பு' : '7.5% Government school quota matching'}</span>
        </div>
        <div className="signin-benefit-item">
          <CheckCircle2 size={14} color="var(--cyan-700)" />
          <span>{lang === 'ta' ? 'TNEA & மருத்துவ கட்-ஆஃப் வழிகாட்டல்' : 'Engineering & Medical cutoff calculators'}</span>
        </div>
      </div>

      {/* Privacy notice and terms placeholder */}
      <p className="signin-card-terms">
        {lang === 'ta' ? (
          <>
            தொடர்வதன் மூலம் எங்கள்{' '}
            <a href="#privacy-terms" onClick={(e) => e.preventDefault()} className="terms-link">விதிமுறைகள்</a> மற்றும்{' '}
            <a href="#privacy-terms" onClick={(e) => e.preventDefault()} className="terms-link">தனியுரிமைக் கொள்கை</a>யை ஏற்றுக்கொள்கிறீர்கள்.
          </>
        ) : (
          <>
            By continuing you agree to our{' '}
            <a href="#privacy-terms" onClick={(e) => e.preventDefault()} className="terms-link">Terms</a> and{' '}
            <a href="#privacy-terms" onClick={(e) => e.preventDefault()} className="terms-link">Privacy Policy</a>.
          </>
        )}
      </p>
    </div>
  );
}

export default HeroAuthCard;
