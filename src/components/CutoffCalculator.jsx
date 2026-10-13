import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calculator, Award, Info, CheckCircle2, RotateCcw } from 'lucide-react';

export function CutoffCalculator() {
  const { lang, t } = useLanguage();

  const [maths, setMaths] = useState('85');
  const [physics, setPhysics] = useState('80');
  const [chemistry, setChemistry] = useState('82');
  const [calculatedCutoff, setCalculatedCutoff] = useState(null);

  const calculate = (e) => {
    if (e) e.preventDefault();
    const m = parseFloat(maths) || 0;
    const p = parseFloat(physics) || 0;
    const c = parseFloat(chemistry) || 0;

    const validM = Math.min(100, Math.max(0, m));
    const validP = Math.min(100, Math.max(0, p));
    const validC = Math.min(100, Math.max(0, c));

    const total = validM + (validP / 2) + (validC / 2);
    setCalculatedCutoff(total.toFixed(2));
  };

  const handleReset = () => {
    setMaths('');
    setPhysics('');
    setChemistry('');
    setCalculatedCutoff(null);
  };

  return (
    <div className="card calculator-card" id="cutoff-calculator">
      <div className="calc-header">
        <div className="calc-badge">
          <Calculator size={16} />
          <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ சூத்திரம்' : 'Official TNEA Formula'}</span>
        </div>
        <h3 className="calc-title">{t.calculator.title}</h3>
        <p className="calc-subtitle">{t.calculator.subtitle}</p>
      </div>

      <form onSubmit={calculate} className="calc-form">
        <div className="input-grid">
          {/* Maths */}
          <div className="input-group">
            <label htmlFor="maths-input" className="input-label">
              {lang === 'ta' ? 'கணிதம் (Maths)' : 'Mathematics'}
              <span className="max-tag">/ 100</span>
            </label>
            <input
              id="maths-input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={maths}
              onChange={(e) => setMaths(e.target.value)}
              placeholder="e.g. 85"
              required
              className="calc-input"
            />
          </div>

          {/* Physics */}
          <div className="input-group">
            <label htmlFor="physics-input" className="input-label">
              {lang === 'ta' ? 'இயற்பியல் (Physics)' : 'Physics'}
              <span className="max-tag">/ 100</span>
            </label>
            <input
              id="physics-input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={physics}
              onChange={(e) => setPhysics(e.target.value)}
              placeholder="e.g. 80"
              required
              className="calc-input"
            />
          </div>

          {/* Chemistry */}
          <div className="input-group">
            <label htmlFor="chemistry-input" className="input-label">
              {lang === 'ta' ? 'வேதியியல் (Chemistry)' : 'Chemistry'}
              <span className="max-tag">/ 100</span>
            </label>
            <input
              id="chemistry-input"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={chemistry}
              onChange={(e) => setChemistry(e.target.value)}
              placeholder="e.g. 82"
              required
              className="calc-input"
            />
          </div>
        </div>

        <div className="calc-actions">
          <button type="submit" className="btn btn-primary">
            <Calculator size={16} />
            <span>{t.calculator.calculateBtn}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            title="Reset"
          >
            <RotateCcw size={16} />
            <span>{lang === 'ta' ? 'மீட்டமை' : 'Reset'}</span>
          </button>
        </div>
      </form>

      {/* Result Display */}
      {calculatedCutoff !== null && (
        <div className="calc-result-box">
          <div className="result-main">
            <span className="result-label">{t.calculator.yourCutoff}</span>
            <div className="result-score-wrap">
              <span className="result-score">{calculatedCutoff}</span>
              <span className="result-max">/ 200</span>
            </div>
          </div>

          <div className="result-breakdown">
            <div className="breakdown-item">
              <span className="b-label">{lang === 'ta' ? 'கணிதம்:' : 'Maths:'}</span>
              <strong>{maths || 0}</strong>
            </div>
            <div className="breakdown-item">
              <span className="b-label">{lang === 'ta' ? 'இயற்பியல் (÷2):' : 'Physics (÷2):'}</span>
              <strong>{((parseFloat(physics) || 0) / 2).toFixed(2)}</strong>
            </div>
            <div className="breakdown-item">
              <span className="b-label">{lang === 'ta' ? 'வேதியியல் (÷2):' : 'Chemistry (÷2):'}</span>
              <strong>{((parseFloat(chemistry) || 0) / 2).toFixed(2)}</strong>
            </div>
          </div>

          <div className="counseling-advice">
            <Info size={16} color="var(--navy-900)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{t.calculator.cutoffAdviceTitle} </strong>
              <span>{t.calculator.cutoffAdvice}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
