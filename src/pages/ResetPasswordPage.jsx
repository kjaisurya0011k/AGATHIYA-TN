import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { BrandIdentity } from '../components/BrandIdentity';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe
} from 'lucide-react';

export function ResetPasswordPage() {
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const isValidPassword = (val) => {
    return val.length >= 8 && /[A-Za-z]/.test(val) && /\d/.test(val);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidPassword(password)) {
      setErrorMsg(t.auth.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t.auth.passwordsDoNotMatch);
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch {
      setErrorMsg(t.auth.oauthNetworkError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <header className="login-screen-nav">
        <button
          type="button"
          onClick={toggleLanguage}
          className="login-lang-btn"
          title={lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
          aria-label="Toggle language"
        >
          <Globe size={15} />
          <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
        </button>
      </header>

      <main className="login-screen-main">
        <div className="login-brand-center">
          <BrandIdentity variant="hero" />
        </div>

        <div className="hero-auth-card login-auth-card" role="region" aria-label="Reset Password">
          <h2 className="signin-card-title" style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
            {t.auth.newPasswordLabel}
          </h2>
          <p className="signin-card-desc" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {lang === 'ta'
              ? 'உங்கள் கணக்கிற்கான புதிய கடவுச்சொல்லை உள்ளிட்டு மாற்றவும்.'
              : 'Enter and confirm your new password below.'}
          </p>

          {errorMsg && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} className="auth-error-icon" />
              <span className="auth-error-text">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-success-banner" role="status">
              <CheckCircle2 size={16} color="#16a34a" />
              <span className="auth-success-text">{t.auth.passwordUpdatedSuccess}</span>
            </div>
          )}

          {!successMsg && (
            <form onSubmit={handleResetSubmit} className="auth-email-form" noValidate>
              <div className="form-group">
                <label htmlFor="reset-password-input" className="auth-label">
                  {t.auth.newPasswordLabel}
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="reset-password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters (letters & numbers)"
                    className="auth-input"
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
                <label htmlFor="reset-confirm-password" className="auth-label">
                  {t.auth.confirmPasswordLabel}
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle-btn"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary auth-submit-btn"
              >
                <span>
                  {submitting
                    ? (lang === 'ta' ? 'புதுப்பிக்கிறது...' : 'Updating...')
                    : t.auth.updatePasswordBtn}
                </span>
                <ArrowRight size={16} />
              </button>

              <div className="auth-back-row">
                <Link to="/login" className="auth-link-btn">
                  ← {t.auth.backToLogin}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ResetPasswordPage;
