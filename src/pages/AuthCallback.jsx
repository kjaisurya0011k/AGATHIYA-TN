import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../context/LanguageContext';
import { GraduationCap } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  useEffect(() => {
    let mounted = true;

    async function handleAuth() {
      try {
        if (supabase?.auth?.getSession) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && mounted) {
            navigate('/dashboard/student', { replace: true });
            return;
          }
        }
      } catch (err) {
        console.warn('OAuth callback handling note:', err);
      }

      // Fallback redirect
      setTimeout(() => {
        if (mounted) navigate('/', { replace: true });
      }, 1500);
    }

    handleAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="callback-wrapper container">
      <div className="card callback-card">
        <div className="brand-icon" style={{ margin: '0 auto 1.5rem', width: '56px', height: '56px' }}>
          <GraduationCap size={32} color="#FFFFFF" />
        </div>
        <h2>{lang === 'ta' ? 'அங்கீகரிக்கப்படுகிறது...' : 'Authenticating...'}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {lang === 'ta'
            ? 'உங்கள் Google கணக்கு சரிபார்க்கப்பட்டு உங்கள் டாஷ்போர்டிற்கு அழைத்துச் செல்லப்படுகிறீர்கள்.'
            : 'Verifying your credentials and redirecting to your personalized student portal.'}
        </p>
      </div>
    </div>
  );
}
