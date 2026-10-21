import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { brand, BRAND_NAME } from '../data/brand';

export { BRAND_NAME };

/**
 * Shared Brand component ensuring consistent acronym, typography,
 * and bilingual full-form display across Header and Hero sections.
 */
export function BrandIdentity({ variant = 'header', className = '' }) {
  const { lang, t } = useLanguage();
  const tagline = brand.tagline || '';

  if (variant === 'hero') {
    return (
      <div className={`hero-brand-block ${className}`.trim()}>
        <div className="hero-brand-title" translate="no">
          {BRAND_NAME}
        </div>
        {tagline && (
          <>
            <div className="hero-brand-divider" aria-hidden="true" />
            <p className="hero-brand-subtitle" lang={lang}>
              {tagline}
            </p>
          </>
        )}
      </div>
    );
  }

  // Default: Header logo text block
  return (
    <div className={`brand-text ${className}`.trim()}>
      <div className="brand-name" translate="no">
        {BRAND_NAME}
      </div>
      {tagline && (
        <div className="brand-sub" lang={lang} title={tagline}>
          {tagline}
        </div>
      )}
    </div>
  );
}

export default BrandIdentity;
