import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const BRAND_NAME = 'EEE-TN';

/**
 * Shared Brand component ensuring consistent acronym, typography,
 * and bilingual full-form display across Header and Hero sections.
 */
export function BrandIdentity({ variant = 'header', className = '' }) {
  const { lang, t } = useLanguage();
  const fullName = t.brandFullName || t.siteFullName || 'Education Evolution and Empowerment – Tamil Nadu';

  if (variant === 'hero') {
    return (
      <div className={`hero-brand-block ${className}`.trim()}>
        <div className="hero-brand-title" translate="no">
          {BRAND_NAME}
        </div>
        <div className="hero-brand-divider" aria-hidden="true" />
        <p className="hero-brand-subtitle" lang={lang}>
          {fullName}
        </p>
      </div>
    );
  }

  // Default: Header logo text block
  return (
    <div className={`brand-text ${className}`.trim()}>
      <div className="brand-name" translate="no">
        {BRAND_NAME}
      </div>
      <div className="brand-sub" lang={lang} title={fullName}>
        {fullName}
      </div>
    </div>
  );
}

export default BrandIdentity;
