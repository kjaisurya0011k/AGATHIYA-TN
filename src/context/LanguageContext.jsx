import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('eee_tn_lang') || 'ta';
    } catch {
      return 'ta';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('eee_tn_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // ignore
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ta' ? 'en' : 'ta'));
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
