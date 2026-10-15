import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GraduationCap } from 'lucide-react';

export function FullScreenLoader() {
  const { lang } = useLanguage();

  return (
    <div className="full-screen-loader" role="status" aria-label="Loading session">
      <div className="loader-inner-card">
        <div className="loader-icon-wrap">
          <GraduationCap size={36} color="#FFFFFF" />
        </div>
        <div className="loader-ring" aria-hidden="true" />
        <p className="loader-text">
          {lang === 'ta' ? 'அங்கீகாரம் சரிபார்க்கப்படுகிறது...' : 'Verifying student session...'}
        </p>
      </div>
    </div>
  );
}

export default FullScreenLoader;
