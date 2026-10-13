import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Globe,
  ShieldCheck,
  UserCheck,
  Users,
  Shield,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export function LoginPage() {
  const { lang, toggleLanguage } = useLanguage();
  const { user, signInWithGoogle, loginAsDemoRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await signInWithGoogle();
    if (!result.success) {
      setErrorMsg(
        lang === 'ta'
          ? 'Google உள்நுழைவு துவங்குவதில் சிக்கல். நீங்கள் கீழேயுள்ள முன்னோட்ட பாத்திரங்களை (Demo Roles) தேர்வு செய்து சோதிக்கலாம்.'
          : 'Unable to initiate Google OAuth directly. You can test immediately using the demo role previews below.'
      );
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    loginAsDemoRole(role);
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'mentor') navigate('/dashboard/mentor');
    else navigate('/dashboard/student');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card card">
        {/* Card Header & Language Toggle */}
        <div className="login-card-header">
          <Link to="/" className="login-brand">
            <div className="brand-icon">
              <GraduationCap size={20} color="#FFFFFF" />
            </div>
            <span className="brand-name">EEE-TN</span>
          </Link>

          <button
            type="button"
            onClick={toggleLanguage}
            className="lang-pill-btn"
            title="Toggle Language"
          >
            <Globe size={13} />
            <span>{lang === 'ta' ? 'English' : 'தமிழ்'}</span>
          </button>
        </div>

        {/* Headline */}
        <div className="login-title-wrap">
          <h1 className="login-title">
            {lang === 'ta' ? 'மாணவர் தளத்தில் உள்நுழைக' : 'Sign In to EEE-TN'}
          </h1>
          <p className="login-sub">
            {lang === 'ta'
              ? 'உங்கள் கல்லூரி விருப்பங்கள், கட்-ஆஃப் விவரங்கள் மற்றும் உதவித்தொகைகளைச் சேமிக்க உள்நுழையவும்.'
              : 'Save your counseling choices, bookmarked scholarships, and workshop registrations.'}
          </p>
        </div>

        {/* Error notice if OAuth isn't ready */}
        {errorMsg && (
          <div className="login-notice-box">
            <AlertCircle size={16} color="var(--purple-600)" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Google Sign In */}
        <div className="login-action-box">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn btn-google-auth"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {loading
                ? lang === 'ta'
                  ? 'இணைக்கிறது...'
                  : 'Connecting...'
                : lang === 'ta'
                ? 'Google மூலம் உள்நுழைக'
                : 'Sign in with Google'}
            </span>
          </button>
        </div>

        {/* Trust & Privacy Notice */}
        <div className="login-trust-notice">
          <ShieldCheck size={16} color="#16a34a" />
          <p>
            {lang === 'ta'
              ? 'உங்கள் மின்னஞ்சல் முகவரிக்கு எந்தவித விளம்பரங்களும் அனுப்பப்பட மாட்டாது. இது 100% பாதுகாப்பான மற்றும் தன்னார்வ மாணவர் தளம்.'
              : 'Zero spam, zero data selling. We only use your Google sign-in to securely store your academic records.'}
          </p>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>{lang === 'ta' ? 'அல்லது விரைவு முன்னோட்டம்' : 'Or Role Testing Preview'}</span>
        </div>

        {/* Fast Role Previews (Student, Mentor, Admin) */}
        <div className="demo-roles-wrap">
          <p className="demo-roles-desc">
            {lang === 'ta'
              ? 'அனைத்து பக்கங்கள் மற்றும் பாத்திரங்களை உடனடியாக சோதித்து பார்க்க:'
              : 'Instantly preview all connected screens by role:'}
          </p>

          <div className="demo-btns-grid">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="btn btn-outline demo-role-btn"
            >
              <UserCheck size={15} color="var(--cyan-600)" />
              <div className="demo-btn-text">
                <strong>{lang === 'ta' ? 'மாணவர் (Student)' : 'Student Role'}</strong>
                <span>K. Muthu Kumar</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('mentor')}
              className="btn btn-outline demo-role-btn"
            >
              <Users size={15} color="var(--purple-600)" />
              <div className="demo-btn-text">
                <strong>{lang === 'ta' ? 'வழிகாட்டி (Mentor)' : 'Mentor Role'}</strong>
                <span>Er. K. Senthil Nathan</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="btn btn-outline demo-role-btn"
            >
              <Shield size={15} color="var(--navy-900)" />
              <div className="demo-btn-text">
                <strong>{lang === 'ta' ? 'நிர்வாகி (Admin)' : 'Admin Role'}</strong>
                <span>Platform Director</span>
              </div>
            </button>
          </div>
        </div>

        <div className="login-back-home">
          <Link to="/" className="back-home-link">
            ← {lang === 'ta' ? 'முகப்புக்குத் திரும்பு' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
