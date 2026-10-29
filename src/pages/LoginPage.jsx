import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BrandIdentity } from '../components/BrandIdentity';
import { brand } from '../data/brand';
import { supabase } from '../lib/supabase';
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Send,
  GraduationCap
} from 'lucide-react';

export function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
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

export function LoginPage({ initialTab = 'login' }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const {
    user,
    profile,
    isProfileComplete,
    loading,
    signInWithGoogle,
    authError,
    clearAuthError,
    profileNetworkError,
    retryFetchProfile
  } = useAuth();

  const location = useLocation();

  // Active view: 'login' | 'signup' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States for submission & feedback
  const [submitting, setSubmitting] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Remember redirect path if user tried to visit protected route
  const from = location.state?.from?.pathname;
  if (from && from !== '/' && from !== '/login' && from !== '/register') {
    sessionStorage.setItem('eee_tn_redirect_after_login', from);
  }

  // If already logged in, redirect by role: student goes to /home, mentor to /mentor, admin to /admin
  if (!loading && user) {
    const userRole = profile?.role || 'student';
    const isAuthPath = (p) => !p || p === '/' || p === '/login' || p === '/register';
    if (userRole === 'admin') {
      const dest = from && !isAuthPath(from) ? from : '/admin';
      return <Navigate to={dest} replace />;
    }
    if (userRole === 'mentor') {
      const dest = from && !isAuthPath(from) ? from : '/mentor';
      return <Navigate to={dest} replace />;
    }
    // student role
    if (isProfileComplete) {
      const destination = from && !isAuthPath(from) ? from : '/home';
      return <Navigate to={destination} replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // Field validation helpers
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isValidPassword = (val) => {
    // At least 8 chars, at least one letter and at least one number
    return val.length >= 8 && /[A-Za-z]/.test(val) && /\d/.test(val);
  };

  // Google OAuth Login
  const handleGoogleClick = async () => {
    setSubmitting(true);
    setInlineError(null);
    clearAuthError();
    await signInWithGoogle();
    setSubmitting(false);
  };

  // Email & Password Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setInlineError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    if (!isValidEmail(cleanEmail)) {
      setInlineError(t.auth.invalidEmail);
      return;
    }
    if (!password) {
      setInlineError(lang === 'ta' ? 'கடவுச்சொல்லை உள்ளிடவும்.' : 'Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('email not confirmed')) {
          setInlineError(t.auth.emailNotConfirmed);
          setPendingConfirmationEmail(cleanEmail);
        } else if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
          setInlineError(t.auth.invalidCredentials);
        } else if (msg.includes('rate limit') || msg.includes('too many requests')) {
          setInlineError(t.auth.tooManyRequests);
        } else if (msg.includes('fetch') || msg.includes('network')) {
          setInlineError(t.auth.oauthNetworkError);
        } else {
          setInlineError(error.message);
        }
      }
    } catch (err) {
      setInlineError(t.auth.oauthNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  // Create Account (Sign-up)
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setInlineError(null);
    setInfoMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setInlineError(t.auth.nameRequired);
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setInlineError(t.auth.invalidEmail);
      return;
    }
    if (!isValidPassword(password)) {
      setInlineError(t.auth.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setInlineError(t.auth.passwordsDoNotMatch);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('user already registered') || msg.includes('already exists')) {
          setInlineError(t.auth.userAlreadyExists);
        } else if (msg.includes('rate limit')) {
          setInlineError(t.auth.tooManyRequests);
        } else {
          setInlineError(error.message);
        }
      } else {
        // Successful signup requiring confirmation
        setPendingConfirmationEmail(cleanEmail);
        setInfoMessage(t.auth.checkEmailTitle);
      }
    } catch {
      setInlineError(t.auth.oauthNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  // Resend confirmation email
  const handleResendConfirmation = async () => {
    if (!pendingConfirmationEmail) return;
    setResending(true);
    setResendSuccess(false);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingConfirmationEmail,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (!error) {
        setResendSuccess(true);
      }
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  // Forgot Password request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setInlineError(null);
    const cleanEmail = email.trim();

    if (!isValidEmail(cleanEmail)) {
      setInlineError(t.auth.invalidEmail);
      return;
    }

    setSubmitting(true);
    try {
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/reset-password'
      });
      // Security standard: Always display neutral message regardless of whether user exists
      setInfoMessage(t.auth.resetSentMsg);
    } catch {
      setInfoMessage(t.auth.resetSentMsg);
    } finally {
      setSubmitting(false);
    }
  };
  const authCardAnimationClass =
    activeTab === 'forgot'
      ? 'card-fade-slide'
      : 'auth-card-flip-enter';
  return (

    <div className="login-page-screen">
      <div className="login-page-box">
        {/* 1. Header: Navy-to-teal gradient panel with large rounded bottom corners */}
        <header className="login-header-hero">
          <div className="login-header-top-row">
            <div className="login-header-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!logoError && (
                <img
                  src={brand.logo}
                  alt="AGATHIYA — Where Learning Evolves."
                  className="login-brand-logo-img"
                  onError={() => setLogoError(true)}
                />
              )}
              <div className="login-brand-copy">
                <span className="login-brand-acronym">{brand.name}</span>
                {brand.tagline ? (
                  <span className="login-brand-tagline">
                    {brand.tagline}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={toggleLanguage}
              className="login-lang-pill"
              title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
              aria-label="Toggle language"
            >
              <Globe size={13} />
              <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
            </button>
          </div>

          <div className="login-header-body" key={activeTab}>
            <h1 className="login-header-title">
              {activeTab === 'signup'
                ? (lang === 'ta' ? 'உங்கள் கணக்கை உருவாக்குங்கள் ' : 'Create your account ')
                : activeTab === 'forgot'
                  ? (lang === 'ta' ? 'கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset your password')
                  : (t.auth.welcomeGreeting || (lang === 'ta' ? 'வணக்கம் 👋' : 'Welcome 👋'))}
            </h1>

            <p className="login-header-subtitle">
              {activeTab === 'signup'
                ? (lang === 'ta' ? `${brand.name} உடன் உங்கள் பயணத்தைத் தொடங்குங்கள்` : `Start your journey with ${brand.name}`)
                : activeTab === 'forgot'
                  ? (lang === 'ta' ? 'உங்கள் கடவுச்சொல்லை மீட்டமைக்கவும்' : 'Reset your password securely')
                  : (t.auth.welcomeTagline || (lang === 'ta' ? 'உங்கள் பயணத்தைத் தொடர உள்நுழைக' : 'Login to continue your journey'))}
            </p>

            <p className="login-header-desc">
              {activeTab === 'signup'
                ? (lang === 'ta'
                  ? 'கல்லூரிகள், உதவித்தொகைகள் மற்றும் தொழில் வழிகாட்டலை ஒரே இடத்தில் கண்டறியுங்கள்.'
                  : 'Discover colleges, scholarships and career guidance in one place.')
                : activeTab === 'forgot'
                  ? (lang === 'ta'
                    ? 'உங்கள் கணக்கிற்கான அணுகலை மீண்டும் பெறுங்கள்.'
                    : `Recover access to your ${brand.name} account.`)
                  : (t.auth.welcomeDesc || (lang === 'ta'
                    ? 'தமிழ்நாடு 12-ஆம் வகுப்பு மாணவர்களுக்கான உதவித்தொகை, கல்லூரி மற்றும் உயர்கல்வி வழிகாட்டல்.'
                    : 'Scholarships, colleges and career guidance for Tamil Nadu Class 12 students.'))}
            </p>
          </div>
        </header>

        {/* 2. Card: White, large rounded corners, soft shadow, overlapping header */}
        <div className="login-overlap-card-wrap">
          <div
            key={activeTab}
            className={`login-main-card ${authCardAnimationClass}`}
            role="region"
            aria-label={
              activeTab === 'signup'
                ? 'Create Account'
                : activeTab === 'forgot'
                  ? 'Reset Password'
                  : 'Sign In'
            }
          >
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

            {/* Network Retry Banner */}
            {profileNetworkError && (
              <div className="auth-error-banner" style={{ background: '#fef2f2', borderColor: '#fca5a5' }} role="alert">
                <AlertCircle size={16} color="#dc2626" />
                <span className="auth-error-text" style={{ color: '#991b1b' }}>
                  {lang === 'ta' ? 'இணைப்பில் தாமதம். மீண்டும் முயற்சிக்கவும்.' : 'Connection issue. Please retry.'}
                </span>
                <button
                  type="button"
                  onClick={retryFetchProfile}
                  className="btn btn-outline"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                >
                  <RefreshCw size={12} />
                  <span>{lang === 'ta' ? 'மீண்டும்' : 'Retry'}</span>
                </button>
              </div>
            )}

            {/* Inline Form Error */}
            {inlineError && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={16} className="auth-error-icon" />
                <span className="auth-error-text">{inlineError}</span>
                <button
                  type="button"
                  onClick={() => setInlineError(null)}
                  className="auth-error-close"
                  aria-label="Dismiss error"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Success / Info Message */}
            {infoMessage && (
              <div className="auth-success-banner" role="status">
                <CheckCircle2 size={16} color="#16a34a" />
                <span className="auth-success-text">{infoMessage}</span>
              </div>
            )}

            {/* Account Confirmation prompt if waiting for verification */}
            {pendingConfirmationEmail && activeTab !== 'forgot' && (
              <div className="email-confirmation-box" role="status">
                <h4>{t.auth.checkEmailTitle}</h4>
                <p>
                  {t.auth.checkEmailDesc} ({pendingConfirmationEmail})
                </p>
                <div className="confirmation-actions-row">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="btn btn-sm btn-outline"
                  >
                    <Send size={13} />
                    <span>
                      {resending
                        ? (lang === 'ta' ? 'அனுப்புகிறது...' : 'Sending...')
                        : (t.auth.resendBtn || 'Resend email')}
                    </span>
                  </button>
                  {resendSuccess && (
                    <span className="resend-success-hint">
                      ✓ {t.auth.resendSent}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* VIEW A: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailLogin} className="login-card-form" noValidate>
                <div className="form-group">
                  <label htmlFor="login-email" className="auth-card-label">
                    {t.auth.emailAddressLabel || t.auth.emailLabel || (lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address')}
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      enterKeyHint="next"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="auth-card-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="login-password" className="auth-card-label">
                    {t.auth.passwordLabel || (lang === 'ta' ? 'கடவுச்சொல்' : 'Password')}
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      enterKeyHint="done"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="auth-card-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Full-width pill "Login" button with navy-to-teal gradient */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="login-gradient-pill-btn"
                >
                  <span>
                    {submitting
                      ? (lang === 'ta' ? 'சரிபார்க்கிறது...' : 'Logging in...')
                      : (t.auth.loginBtn || 'Login')}
                  </span>
                  <ArrowRight size={16} />
                </button>

                {/* Centred "Don't have an account? Register" */}
                <p className="login-card-switch-prompt">
                  <span>{t.auth.dontHaveAccount || (lang === 'ta' ? 'கணக்கு இல்லையா? ' : "Don't have an account? ")}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setInlineError(null);
                      setInfoMessage(null);
                    }}
                    className="login-card-accent-link"
                  >
                    {t.auth.registerLink || (lang === 'ta' ? 'பதிவு செய்க' : 'Register')}
                  </button>
                </p>

                {/* Left-aligned "Forgot Password?" link */}
                <div className="login-card-forgot-row">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setInlineError(null);
                      setInfoMessage(null);
                    }}
                    className="login-card-forgot-link"
                  >
                    {t.auth.forgotPasswordLink || (lang === 'ta' ? 'கடவுச்சொல் மறந்துவிட்டதா?' : 'Forgot Password?')}
                  </button>
                </div>

                {/* Divider with "or" */}
                <div className="auth-or-divider" aria-hidden="true">
                  <span>{t.auth.orDivider || 'or'}</span>
                </div>

                {/* Full-width white "Continue with Google" button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={submitting}
                  className="google-pill-btn"
                  aria-label="Continue with Google"
                >
                  <GoogleLogo />
                  <span>
                    {submitting
                      ? (lang === 'ta' ? 'இணைகிறது...' : 'Connecting...')
                      : (t.auth.continueWithGoogle || 'Continue with Google')}
                  </span>
                </button>
              </form>
            )}

            {/* VIEW B: REGISTER */}
            {activeTab === 'signup' && (
              <form onSubmit={handleEmailSignup} className="login-card-form" noValidate>
                <div className="form-group">
                  <label htmlFor="signup-name" className="auth-card-label">
                    {t.auth.fullNameLabel || (lang === 'ta' ? 'முழுப் பெயர்' : 'Full Name')}
                  </label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      inputMode="text"
                      enterKeyHint="next"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. S. Anitha / K. Muthu"
                      className="auth-card-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-email" className="auth-card-label">
                    {t.auth.emailAddressLabel || t.auth.emailLabel || (lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address')}
                  </label>
                  <div className="auth-input-wrapper">
                    <Mail size={16} className="auth-input-icon" />
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      enterKeyHint="next"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="auth-card-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-password" className="auth-card-label">
                    {t.auth.passwordLabel || (lang === 'ta' ? 'கடவுச்சொல்' : 'Password')}
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      enterKeyHint="next"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters (letters & numbers)"
                      className="auth-card-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signup-confirm-password" className="auth-card-label">
                    {t.auth.confirmPasswordLabel || (lang === 'ta' ? 'கடவுச்சொல்லை உறுதிப்படுத்துக' : 'Confirm Password')}
                  </label>
                  <div className="auth-input-wrapper">
                    <Lock size={16} className="auth-input-icon" />
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      enterKeyHint="done"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="auth-card-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle-btn"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Gradient Create Account button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="login-gradient-pill-btn"
                >
                  <span>
                    {submitting
                      ? (lang === 'ta' ? 'பதிவு செய்கிறது...' : 'Creating Account...')
                      : (t.auth.createAccountBtn || 'Create account')}
                  </span>
                  <ArrowRight size={16} />
                </button>

                {/* Centred "Already have an account? Login" below */}
                <p className="login-card-switch-prompt">
                  <span>{t.auth.alreadyHaveAccount || (lang === 'ta' ? 'ஏற்கனவே கணக்கு உள்ளதா? ' : 'Already have an account? ')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setInlineError(null);
                      setInfoMessage(null);
                    }}
                    className="login-card-accent-link"
                  >
                    {t.auth.loginLink || (lang === 'ta' ? 'உள்நுழைக' : 'Login')}
                  </button>
                </p>

                {/* Divider with "or" */}
                <div className="auth-or-divider" aria-hidden="true">
                  <span>{t.auth.orDivider || 'or'}</span>
                </div>

                {/* Full-width white "Continue with Google" button */}
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={submitting}
                  className="google-pill-btn"
                  aria-label="Continue with Google"
                >
                  <GoogleLogo />
                  <span>
                    {submitting
                      ? (lang === 'ta' ? 'இணைகிறது...' : 'Connecting...')
                      : (t.auth.continueWithGoogle || 'Continue with Google')}
                  </span>
                </button>
              </form>
            )}

            {/* VIEW C: FORGOT PASSWORD */}
            {activeTab === 'forgot' && (
              <div className="auth-forgot-section">
                <h3 className="auth-forgot-title">{t.auth.resetPasswordTitle}</h3>
                <p className="auth-forgot-desc">{t.auth.resetPasswordDesc}</p>

                <form onSubmit={handleForgotPassword} className="login-card-form" noValidate>
                  <div className="form-group">
                    <label htmlFor="forgot-email" className="auth-card-label">
                      {t.auth.emailAddressLabel || t.auth.emailLabel || (lang === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address')}
                    </label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        enterKeyHint="done"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="auth-card-input"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="login-gradient-pill-btn"
                  >
                    <Send size={15} />
                    <span>
                      {submitting
                        ? (lang === 'ta' ? 'அனுப்புகிறது...' : 'Sending Link...')
                        : t.auth.sendResetLink}
                    </span>
                  </button>

                  <div className="auth-back-row">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setInlineError(null);
                        setInfoMessage(null);
                      }}
                      className="auth-link-btn"
                    >
                      ← {t.auth.backToLogin}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* 3. Footer under the card: Tiny text */}
          <p className="login-footer-terms">
            {lang === 'ta' ? (
              <>
                தொடர்வதன் மூலம் எங்கள்{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="terms-link">விதிமுறைகள்</a> மற்றும்{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="terms-link">தனியுரிமைக் கொள்கை</a>யை ஏற்றுக்கொள்கிறீர்கள்.
              </>
            ) : (
              <>
                By continuing you agree to our{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="terms-link">Terms</a> and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="terms-link">Privacy Policy</a>.
              </>
            )}
          </p>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
