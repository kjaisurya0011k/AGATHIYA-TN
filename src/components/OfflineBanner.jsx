import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { lang } = useLanguage();
  const isTamil = lang === 'ta';

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <aside
      aria-label="Offline status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#991b1b',
        color: '#ffffff',
        padding: '8px 16px',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: 650,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
        textAlign: 'center'
      }}
    >
      <WifiOff size={16} aria-hidden="true" />
      <span>
        {isTamil
          ? 'இணைய இணைப்பு துண்டிக்கப்பட்டுள்ளது. உங்கள் நெட்வொர்க்கைச் சரிபார்க்கவும்.'
          : 'You are currently offline. Showing cached content.'}
      </span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: '#ffffff',
          borderRadius: '4px',
          padding: '2px 8px',
          fontSize: '0.75rem',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '4px'
        }}
      >
        <RefreshCw size={12} />
        <span>{isTamil ? 'மீண்டும் முயற்சி' : 'Retry'}</span>
      </button>
    </aside>
  );
}

export default OfflineBanner;
