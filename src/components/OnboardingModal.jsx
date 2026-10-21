import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { brand } from '../data/brand';
import {
  TN_DISTRICTS,
  STUDENT_STATUS_OPTIONS,
  SCHOOL_BOARDS,
  ACADEMIC_STREAMS,
  COMMUNITY_CATEGORIES,
  INCOME_RANGES,
  CAREER_INTERESTS
} from '../data/tnDistricts';
import {
  X,
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Lock,
  Heart
} from 'lucide-react';

export function OnboardingModal() {
  const {
    user,
    profile,
    studentDetails,
    showOnboardingModal,
    setShowOnboardingModal,
    saveStudentDetails
  } = useAuth();

  const { lang, t } = useLanguage();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    phone_number: '',
    district: 'Madurai',
    town: '',
    current_status: 'Class 12',
    school_name: '',
    school_board: 'State Board',
    group_stream: 'Maths-Physics-Chemistry-Biology',
    community_category: 'Prefer not to say',
    maths_marks: '',
    physics_marks: '',
    chemistry_marks: '',
    total_percentage: '',
    annual_income_range: 'Prefer not to say',
    interests: [],
    preferred_language: 'en',
    guardian_name: '',
    guardian_phone: '',
    guardian_consent_given: false,
    consent_given: false
  });

  // Calculate age helper
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge(formData.date_of_birth);
  const isMinor = currentAge !== null && currentAge < 18;

  // Auto-calculate cutoff: Maths/2 + Physics/4 + Chemistry/4
  const calculateCutoff = (m, p, c) => {
    const maths = parseFloat(m);
    const physics = parseFloat(p);
    const chem = parseFloat(c);
    if (!isNaN(maths) && !isNaN(physics) && !isNaN(chem)) {
      return ((maths / 2) + (physics / 4) + (chem / 4)).toFixed(2);
    }
    return null;
  };

  const calculatedCutoff = calculateCutoff(
    formData.maths_marks,
    formData.physics_marks,
    formData.chemistry_marks
  );

  // Initialize form with existing studentDetails or Google OAuth prefill
  useEffect(() => {
    if (studentDetails) {
      setFormData({
        full_name: studentDetails.full_name || '',
        date_of_birth: studentDetails.date_of_birth || '',
        phone_number: studentDetails.phone_number || '',
        district: studentDetails.district || 'Madurai',
        town: studentDetails.town || '',
        current_status: studentDetails.current_status || 'Class 12',
        school_name: studentDetails.school_name || '',
        school_board: studentDetails.school_board || 'State Board',
        group_stream: studentDetails.group_stream || 'Maths-Physics-Chemistry-Biology',
        community_category: studentDetails.community_category || 'Prefer not to say',
        maths_marks: studentDetails.maths_marks !== null && studentDetails.maths_marks !== undefined ? String(studentDetails.maths_marks) : '',
        physics_marks: studentDetails.physics_marks !== null && studentDetails.physics_marks !== undefined ? String(studentDetails.physics_marks) : '',
        chemistry_marks: studentDetails.chemistry_marks !== null && studentDetails.chemistry_marks !== undefined ? String(studentDetails.chemistry_marks) : '',
        total_percentage: studentDetails.total_percentage !== null && studentDetails.total_percentage !== undefined ? String(studentDetails.total_percentage) : '',
        annual_income_range: studentDetails.annual_income_range || 'Prefer not to say',
        interests: studentDetails.interests || [],
        preferred_language: studentDetails.preferred_language || lang,
        guardian_name: studentDetails.guardian_name || '',
        guardian_phone: studentDetails.guardian_phone || '',
        guardian_consent_given: !!studentDetails.guardian_consent_given,
        consent_given: !!studentDetails.consent_given
      });
    } else if (user) {
      // Prefill from Google OAuth user_metadata
      const prefilledName = user.user_metadata?.full_name || user.user_metadata?.name || profile?.full_name || '';
      setFormData((prev) => ({
        ...prev,
        full_name: prefilledName,
        preferred_language: lang
      }));
    }
  }, [studentDetails, user, profile, lang]);

  if (!showOnboardingModal) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMsg(null);
  };

  const handleInterestToggle = (interestId) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interestId);
      const updated = exists
        ? prev.interests.filter((i) => i !== interestId)
        : [...prev.interests, interestId];
      return { ...prev, interests: updated };
    });
  };

  // Step Validation
  const validateStep1 = () => {
    if (!formData.full_name?.trim()) {
      return lang === 'ta' ? 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.';
    }
    if (!formData.date_of_birth) {
      return lang === 'ta' ? 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்.' : 'Please select your date of birth.';
    }
    if (currentAge !== null && currentAge < 12) {
      return lang === 'ta' ? 'சரியான பிறந்த தேதியை உள்ளிடவும்.' : 'Please enter a valid date of birth.';
    }
    // 10-digit Indian phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_number?.trim())) {
      return lang === 'ta' ? 'சரியான 10 இலக்க இந்திய மொபைல் எண்ணை உள்ளிடவும் (எ.கா: 9876543210).' : 'Please enter a valid 10-digit Indian phone number (starts with 6-9).';
    }
    if (!formData.district) {
      return lang === 'ta' ? 'உங்கள் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select your district.';
    }
    if (!formData.town?.trim()) {
      return lang === 'ta' ? 'உங்கள் ஊர் அல்லது நகரப் பெயரை உள்ளிடவும்.' : 'Please enter your town or village.';
    }
    if (!formData.current_status) {
      return lang === 'ta' ? 'உங்கள் தற்போதைய நிலையைத் தேர்ந்தெடுக்கவும்.' : 'Please select your current educational status.';
    }
    if (isMinor) {
      if (!formData.guardian_name?.trim()) {
        return lang === 'ta' ? '18 வயதுக்குட்பட்டவர்கள் பெற்றோர்/பாதுகாவலர் பெயரை உள்ளிட வேண்டும்.' : 'Guardian name is required for students under 18.';
      }
      if (!phoneRegex.test(formData.guardian_phone?.trim())) {
        return lang === 'ta' ? 'பெற்றோர்/பாதுகாவலரின் சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit phone number for your guardian.';
      }
      if (!formData.guardian_consent_given) {
        return lang === 'ta' ? 'பெற்றோர் அல்லது பாதுகாவலர் சம்மத உறுதிமொழியை ஏற்கவும்.' : 'Please confirm parent/guardian agreement.';
      }
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.school_name?.trim()) {
      return lang === 'ta' ? 'உங்கள் பள்ளி அல்லது கல்லூரி பெயரை உள்ளிடவும்.' : 'Please enter your school or institute name.';
    }
    if (!formData.school_board) {
      return lang === 'ta' ? 'உங்கள் கல்வி வாரியத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select your school board.';
    }
    if (!formData.group_stream) {
      return lang === 'ta' ? 'உங்கள் பாடப்பிரிவைத் தேர்ந்தெடுக்கவும்.' : 'Please select your group or stream.';
    }
    // Validate marks range if filled
    const validateMark = (val, name) => {
      if (val !== '' && val !== null && val !== undefined) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          return `${name} mark must be between 0 and 100.`;
        }
      }
      return null;
    };
    const mErr = validateMark(formData.maths_marks, 'Maths');
    if (mErr) return mErr;
    const pErr = validateMark(formData.physics_marks, 'Physics');
    if (pErr) return pErr;
    const cErr = validateMark(formData.chemistry_marks, 'Chemistry');
    if (cErr) return cErr;

    if (formData.total_percentage !== '' && formData.total_percentage !== null) {
      const pct = parseFloat(formData.total_percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return lang === 'ta' ? 'சதவீதம் 0 முதல் 100-க்குள் இருக்க வேண்டும்.' : 'Percentage must be between 0 and 100.';
      }
    }
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setErrorMsg(null);
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setErrorMsg(null);
      setStep(3);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (isSkip = false) => {
    if (!formData.consent_given && !isSkip) {
      setErrorMsg(
        lang === 'ta'
          ? `தொடர ${brand.name} தரவு சேமிப்பு சம்மதப் பெட்டியைத் தேர்வு செய்யவும்.`
          : `Please check the consent box to allow ${brand.name} to process your details.`
      );
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await saveStudentDetails({
        ...formData,
        consent_given: true
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowOnboardingModal(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(
        lang === 'ta'
          ? 'சுயவிவரத்தைச் சேமிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to save profile details. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div className="modal-badge">
              <Sparkles size={13} />
              <span>Step {step} of 3</span>
            </div>
            <h2 id="onboarding-title" className="modal-title">
              {t.onboarding.title}
            </h2>
            <p className="modal-subtitle">
              {t.onboarding.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowOnboardingModal(false)}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3-Step Progress Bar */}
        <div className="modal-stepper-bar">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <small>{t.onboarding.step1}</small>
          </div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <small>{t.onboarding.step2}</small>
          </div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <small>{t.onboarding.step3}</small>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="onboarding-alert error" role="alert">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="onboarding-alert success" role="status">
            <CheckCircle2 size={16} />
            <span>{t.onboarding.profileCompletedSuccess}</span>
          </div>
        )}

        {/* Multi-step Form Content */}
        <div className="modal-body-scroll">
          {/* STEP 1: Basic Student Details */}
          {step === 1 && (
            <div className="step-fields-container">
              <div className="form-group">
                <label htmlFor="student-full-name">
                  {t.onboarding.fullName} <span className="req">*</span>
                </label>
                <input
                  id="student-full-name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="e.g. K. Muthu Kumar"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="student-dob">
                    {t.onboarding.dob} <span className="req">*</span>
                  </label>
                  <input
                    id="student-dob"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="form-input"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {currentAge !== null && (
                    <small className="field-hint">
                      {t.onboarding.age}: <strong>{currentAge} {t.onboarding.yearsOld}</strong>
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="student-phone">
                    {t.onboarding.phone} <span className="req">*</span>
                  </label>
                  <input
                    id="student-phone"
                    type="tel"
                    maxLength={10}
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9842100000"
                    className="form-input"
                    required
                  />
                  <small className="field-hint">{t.onboarding.phoneHelp}</small>
                </div>
              </div>

              {/* Minor / Guardian Section (If Age < 18) */}
              {isMinor && (
                <div className="minor-guardian-box">
                  <div className="minor-box-header">
                    <ShieldCheck size={18} color="var(--purple-600)" />
                    <h4>{t.onboarding.minorAlert}</h4>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="guardian-name">
                        {t.onboarding.guardianName} <span className="req">*</span>
                      </label>
                      <input
                        id="guardian-name"
                        type="text"
                        value={formData.guardian_name}
                        onChange={(e) => handleChange('guardian_name', e.target.value)}
                        placeholder="e.g. S. Kumar (Father / Mother / Guardian)"
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="guardian-phone">
                        {t.onboarding.guardianPhone} <span className="req">*</span>
                      </label>
                      <input
                        id="guardian-phone"
                        type="tel"
                        maxLength={10}
                        value={formData.guardian_phone}
                        onChange={(e) => handleChange('guardian_phone', e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9876543210"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <label className="checkbox-label minor-consent">
                    <input
                      type="checkbox"
                      checked={formData.guardian_consent_given}
                      onChange={(e) => handleChange('guardian_consent_given', e.target.checked)}
                      required
                    />
                    <span>{t.onboarding.guardianConsent} <span className="req">*</span></span>
                  </label>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="student-district">
                    {t.onboarding.district} <span className="req">*</span>
                  </label>
                  <select
                    id="student-district"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    className="form-select"
                    required
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'ta' ? `${d.ta} (${d.en})` : d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="student-town">
                    {t.onboarding.town} <span className="req">*</span>
                  </label>
                  <input
                    id="student-town"
                    type="text"
                    value={formData.town}
                    onChange={(e) => handleChange('town', e.target.value)}
                    placeholder="e.g. Palacode / Kovilpatti"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="student-status">
                  {t.onboarding.currentStatus} <span className="req">*</span>
                </label>
                <select
                  id="student-status"
                  value={formData.current_status}
                  onChange={(e) => handleChange('current_status', e.target.value)}
                  className="form-select"
                  required
                >
                  {STUDENT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {lang === 'ta' ? opt.ta : opt.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: School & Marks */}
          {step === 2 && (
            <div className="step-fields-container">
              <div className="form-group">
                <label htmlFor="student-school">
                  {t.onboarding.schoolName} <span className="req">*</span>
                </label>
                <input
                  id="student-school"
                  type="text"
                  value={formData.school_name}
                  onChange={(e) => handleChange('school_name', e.target.value)}
                  placeholder="e.g. Govt Higher Secondary School, Palacode"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="student-board">
                    {t.onboarding.schoolBoard} <span className="req">*</span>
                  </label>
                  <select
                    id="student-board"
                    value={formData.school_board}
                    onChange={(e) => handleChange('school_board', e.target.value)}
                    className="form-select"
                    required
                  >
                    {SCHOOL_BOARDS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {lang === 'ta' ? b.ta : b.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="student-stream">
                    {t.onboarding.groupStream} <span className="req">*</span>
                  </label>
                  <select
                    id="student-stream"
                    value={formData.group_stream}
                    onChange={(e) => handleChange('group_stream', e.target.value)}
                    className="form-select"
                    required
                  >
                    {ACADEMIC_STREAMS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {lang === 'ta' ? s.ta : s.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Community Category */}
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="student-community">
                    {t.onboarding.community} <span className="opt-tag">(Optional)</span>
                  </label>
                  <select
                    id="student-community"
                    value={formData.community_category}
                    onChange={(e) => handleChange('community_category', e.target.value)}
                    className="form-select"
                  >
                    {COMMUNITY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === 'ta' ? c.ta : c.en}
                      </option>
                    ))}
                  </select>
                  <small className="field-hint">{t.onboarding.communityNote}</small>
                </div>

                {/* Optional Annual Family Income */}
                <div className="form-group">
                  <label htmlFor="student-income">
                    {t.onboarding.income} <span className="opt-tag">(Optional)</span>
                  </label>
                  <select
                    id="student-income"
                    value={formData.annual_income_range}
                    onChange={(e) => handleChange('annual_income_range', e.target.value)}
                    className="form-select"
                  >
                    {INCOME_RANGES.map((inc) => (
                      <option key={inc.id} value={inc.id}>
                        {lang === 'ta' ? inc.ta : inc.en}
                      </option>
                    ))}
                  </select>
                  <small className="field-hint">{t.onboarding.incomeNote}</small>
                </div>
              </div>

              {/* Optional Marks & Live Cutoff Calculator */}
              <div className="marks-card-subbox">
                <div className="marks-box-header">
                  <Calculator size={17} color="var(--cyan-700)" />
                  <div>
                    <h4>{t.onboarding.marksTitle}</h4>
                    <p>{t.onboarding.marksHelp}</p>
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label htmlFor="maths-mark">{t.onboarding.maths} (0-100)</label>
                    <input
                      id="maths-mark"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.maths_marks}
                      onChange={(e) => handleChange('maths_marks', e.target.value)}
                      placeholder="e.g. 90"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="physics-mark">{t.onboarding.physics} (0-100)</label>
                    <input
                      id="physics-mark"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.physics_marks}
                      onChange={(e) => handleChange('physics_marks', e.target.value)}
                      placeholder="e.g. 85"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="chem-mark">{t.onboarding.chemistry} (0-100)</label>
                    <input
                      id="chem-mark"
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={formData.chemistry_marks}
                      onChange={(e) => handleChange('chemistry_marks', e.target.value)}
                      placeholder="e.g. 85"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Read-Only Auto-Calculated Cutoff Score */}
                <div className="cutoff-live-display">
                  <div className="cutoff-live-label">
                    <Sparkles size={16} color="var(--purple-600)" />
                    <span>{t.onboarding.cutoff}</span>
                  </div>
                  <div className="cutoff-live-val">
                    {calculatedCutoff !== null ? (
                      <strong>{calculatedCutoff} <small>/ 200</small></strong>
                    ) : (
                      <span className="cutoff-pending">{lang === 'ta' ? 'மதிப்பெண்களை உள்ளிடவும்' : 'Enter M, P, C to view'}</span>
                    )}
                  </div>
                </div>
                <small className="field-hint" style={{ marginTop: '0.4rem', display: 'block' }}>
                  {t.onboarding.cutoffNote}
                </small>
              </div>
            </div>
          )}

          {/* STEP 3: Preferences & Consent */}
          {step === 3 && (
            <div className="step-fields-container">
              {/* Career Interests Multi-select */}
              <div className="form-group">
                <label>{t.onboarding.interests} <span className="opt-tag">(Optional)</span></label>
                <div className="interests-pill-grid">
                  {CAREER_INTERESTS.map((interest) => {
                    const isSelected = formData.interests.includes(interest.id);
                    return (
                      <button
                        type="button"
                        key={interest.id}
                        onClick={() => handleInterestToggle(interest.id)}
                        className={`interest-select-pill ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected && <CheckCircle2 size={13} />}
                        <span>{lang === 'ta' ? interest.ta : interest.en}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Language */}
              <div className="form-group">
                <label htmlFor="preferred-lang">{t.onboarding.preferredLang}</label>
                <select
                  id="preferred-lang"
                  value={formData.preferred_language}
                  onChange={(e) => handleChange('preferred_language', e.target.value)}
                  className="form-select"
                >
                  <option value="en">English (ஆங்கிலம்)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>

              {/* Plain-Language Data Privacy & Consent Box */}
              <div className="data-privacy-card">
                <div className="privacy-header">
                  <Lock size={16} color="var(--cyan-700)" />
                  <h4>{t.onboarding.dataPrivacyTitle}</h4>
                </div>
                <p className="privacy-explanation">
                  {t.onboarding.dataPrivacyNote}
                </p>

                <label className="checkbox-label consent-box">
                  <input
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={(e) => handleChange('consent_given', e.target.checked)}
                    required
                  />
                  <span>
                    <strong>{t.onboarding.consentCheckbox}</strong> <span className="req">*</span>
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="modal-footer">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="btn btn-outline"
            >
              <ArrowLeft size={16} />
              <span>{t.onboarding.back}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="btn btn-ghost"
              title="Save without completing all fields"
            >
              <span>{t.onboarding.skipAndFinish}</span>
            </button>
          )}

          <div className="modal-footer-right">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                <span>{t.onboarding.next}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={saving || !formData.consent_given}
                className="btn btn-primary"
              >
                {saving ? (
                  <span>{lang === 'ta' ? 'சேமிக்கப்படுகிறது...' : 'Saving...'}</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{t.onboarding.saveProfile}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
