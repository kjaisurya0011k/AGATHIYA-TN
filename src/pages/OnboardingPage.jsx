import { brand } from '../data/brand';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Lock,
  Heart,
  Home,
  Save,
  Info
} from 'lucide-react';

const STORAGE_KEY_STEP = 'eee_tn_onboarding_step';
const STORAGE_KEY_DRAFT = 'eee_tn_onboarding_draft';

export function OnboardingPage() {
  const { user, profile, studentDetails, isProfileComplete, saveStudentDetails } = useAuth();
  const { lang, setLanguage } = useLanguage();
  const navigate = useNavigate();

  // Restore step from sessionStorage if available (1, 2, or 3)
  const [step, setStep] = useState(() => {
    try {
      const savedStep = parseInt(sessionStorage.getItem(STORAGE_KEY_STEP), 10);
      if (savedStep >= 1 && savedStep <= 3) return savedStep;
    } catch {
      // ignore
    }
    return 1;
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(false);

  // Mentors and admins skip student onboarding form (redirect to their role home)
  const userRole = profile?.role || 'student';
  useEffect(() => {
    if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    } else if (userRole === 'mentor') {
      navigate('/mentor', { replace: true });
    }
  }, [userRole, navigate]);

  // Pre-fill form: prioritize local sessionStorage draft, then studentDetails from DB, then auth metadata
  const [formData, setFormData] = useState(() => {
    let draft = null;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY_DRAFT);
      if (stored) draft = JSON.parse(stored);
    } catch {
      // ignore
    }

    return {
      full_name:
        draft?.full_name ||
        studentDetails?.full_name ||
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        '',
      date_of_birth: draft?.date_of_birth || studentDetails?.date_of_birth || '',
      phone_number: draft?.phone_number || studentDetails?.phone_number || '',
      district: draft?.district || studentDetails?.district || profile?.district || 'Madurai',
      town: draft?.town || studentDetails?.town || '',
      current_status: draft?.current_status || studentDetails?.current_status || 'Class 12',
      school_name: draft?.school_name || studentDetails?.school_name || '',
      school_board: draft?.school_board || studentDetails?.school_board || 'State Board',
      group_stream: draft?.group_stream || studentDetails?.group_stream || 'Maths-Physics-Chemistry-Biology',
      community_category: draft?.community_category || studentDetails?.community_category || 'Prefer not to say',
      maths_marks:
        draft?.maths_marks !== undefined
          ? draft.maths_marks
          : studentDetails?.maths_marks !== null && studentDetails?.maths_marks !== undefined
          ? String(studentDetails.maths_marks)
          : '',
      physics_marks:
        draft?.physics_marks !== undefined
          ? draft.physics_marks
          : studentDetails?.physics_marks !== null && studentDetails?.physics_marks !== undefined
          ? String(studentDetails.physics_marks)
          : '',
      chemistry_marks:
        draft?.chemistry_marks !== undefined
          ? draft.chemistry_marks
          : studentDetails?.chemistry_marks !== null && studentDetails?.chemistry_marks !== undefined
          ? String(studentDetails.chemistry_marks)
          : '',
      total_percentage:
        draft?.total_percentage !== undefined
          ? draft.total_percentage
          : studentDetails?.total_percentage !== null && studentDetails?.total_percentage !== undefined
          ? String(studentDetails.total_percentage)
          : '',
      annual_income_range: draft?.annual_income_range || studentDetails?.annual_income_range || 'Prefer not to say',
      interests: draft?.interests || studentDetails?.interests || [],
      preferred_language: draft?.preferred_language || studentDetails?.preferred_language || lang || 'en',
      guardian_name: draft?.guardian_name || studentDetails?.guardian_name || '',
      guardian_phone: draft?.guardian_phone || studentDetails?.guardian_phone || '',
      guardian_consent_given:
        draft?.guardian_consent_given !== undefined
          ? draft.guardian_consent_given
          : studentDetails?.guardian_consent_given || false,
      consent_given:
        draft?.consent_given !== undefined ? draft.consent_given : studentDetails?.consent_given || false
    };
  });

  // Re-sync if studentDetails or user loads after initial render
  useEffect(() => {
    if (studentDetails) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || studentDetails.full_name || '',
        date_of_birth: prev.date_of_birth || studentDetails.date_of_birth || '',
        phone_number: prev.phone_number || studentDetails.phone_number || '',
        district: prev.district || studentDetails.district || 'Madurai',
        town: prev.town || studentDetails.town || '',
        current_status: prev.current_status || studentDetails.current_status || 'Class 12',
        school_name: prev.school_name || studentDetails.school_name || '',
        school_board: prev.school_board || studentDetails.school_board || 'State Board',
        group_stream: prev.group_stream || studentDetails.group_stream || 'Maths-Physics-Chemistry-Biology',
        community_category: prev.community_category || studentDetails.community_category || 'Prefer not to say',
        maths_marks:
          prev.maths_marks !== ''
            ? prev.maths_marks
            : studentDetails.maths_marks !== null && studentDetails.maths_marks !== undefined
            ? String(studentDetails.maths_marks)
            : '',
        physics_marks:
          prev.physics_marks !== ''
            ? prev.physics_marks
            : studentDetails.physics_marks !== null && studentDetails.physics_marks !== undefined
            ? String(studentDetails.physics_marks)
            : '',
        chemistry_marks:
          prev.chemistry_marks !== ''
            ? prev.chemistry_marks
            : studentDetails.chemistry_marks !== null && studentDetails.chemistry_marks !== undefined
            ? String(studentDetails.chemistry_marks)
            : '',
        total_percentage:
          prev.total_percentage !== ''
            ? prev.total_percentage
            : studentDetails.total_percentage !== null && studentDetails.total_percentage !== undefined
            ? String(studentDetails.total_percentage)
            : '',
        annual_income_range: prev.annual_income_range || studentDetails.annual_income_range || 'Prefer not to say',
        interests: prev.interests.length ? prev.interests : studentDetails.interests || [],
        preferred_language: prev.preferred_language || studentDetails.preferred_language || lang || 'en',
        guardian_name: prev.guardian_name || studentDetails.guardian_name || '',
        guardian_phone: prev.guardian_phone || studentDetails.guardian_phone || '',
        guardian_consent_given: prev.guardian_consent_given || studentDetails.guardian_consent_given || false,
        consent_given: prev.consent_given || studentDetails.consent_given || false
      }));
    }
  }, [studentDetails]);

  // Sync draft to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  // Calculate age helper: never ask age directly
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


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleInterest = (interestName) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interestName);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interestName)
          : [...prev.interests, interestName]
      };
    });
  };

  const validateStep1 = () => {
    if (!formData.full_name?.trim()) {
      return lang === 'ta' ? 'முழு பெயரை உள்ளிடவும்.' : 'Please enter your full name.';
    }
    if (!formData.date_of_birth) {
      return lang === 'ta' ? 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்.' : 'Please select your date of birth.';
    }
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(formData.phone_number?.trim() || '')) {
      return lang === 'ta'
        ? 'சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும் (6-9 இல் தொடங்க வேண்டும்).'
        : 'Please enter a valid 10-digit Indian mobile number (starts with 6-9).';
    }
    if (!formData.district) {
      return lang === 'ta' ? 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்.' : 'Please select your district.';
    }
    if (!formData.town?.trim()) {
      return lang === 'ta' ? 'நகரம் / தாலுகா / கிராமத்தை உள்ளிடவும்.' : 'Please enter your town, taluk, or village.';
    }
    return null;
  };

  const validateStep2 = () => {
    if (!formData.school_name?.trim()) {
      return lang === 'ta' ? 'பள்ளிப் பெயரை உள்ளிடவும்.' : 'Please enter your school name.';
    }
    const validateMark = (val, fieldName) => {
      if (val !== '' && val !== null && val !== undefined) {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 100) {
          return lang === 'ta'
            ? `${fieldName} மதிப்பெண் 0 முதல் 100-க்குள் இருக்க வேண்டும்.`
            : `${fieldName} marks must be between 0 and 100.`;
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

    if (formData.total_percentage !== '' && formData.total_percentage !== null && formData.total_percentage !== undefined) {
      const pct = parseFloat(formData.total_percentage);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return lang === 'ta' ? 'சதவீதம் 0 முதல் 100-க்குள் இருக்க வேண்டும்.' : 'Percentage must be between 0 and 100.';
      }
    }
    return null;
  };

  const validateStep3 = () => {
    if (isMinor) {
      if (!formData.guardian_name?.trim()) {
        return lang === 'ta'
          ? '18 வயதுக்குட்பட்ட மாணவர்களுக்கு பெற்றோர் / பாதுகாவலர் பெயர் அவசியம்.'
          : 'Parent/Guardian name is required for students under 18.';
      }
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!phoneRegex.test(formData.guardian_phone?.trim() || '')) {
        return lang === 'ta'
          ? 'பாதுகாவலரின் சரியான 10 இலக்க இந்திய கைபேசி எண்ணை உள்ளிடவும்.'
          : 'Please enter a valid 10-digit parent/guardian mobile number.';
      }
      if (!formData.guardian_consent_given) {
        return lang === 'ta'
          ? 'பெற்றோர் / பாதுகாவலர் சம்மதப் பெட்டியைத் தேர்வு செய்யவும்.'
          : 'Parent/Guardian consent checkbox is required.';
      }
    }
    if (!formData.consent_given) {
      return lang === 'ta'
        ? `தொடர ${brand.name} தனியுரிமை மற்றும் தரவு சேமிப்பு சம்மதப் பெட்டியைத் தேர்வு செய்யவும்.`
        : `Please check the consent box to allow ${brand.name} to process your details.`;
    }
    return null;
  };

  // Save and Continue: Persists draft so refreshing mid-form preserves progress
  const handleSaveAndContinue = async () => {
    setErrorMsg(null);

    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setSaving(true);
      try {
        await saveStudentDetails({ ...formData, consent_given: false });
      } catch {
        // Continue even if Supabase network fails; draft is preserved in sessionStorage
      } finally {
        sessionStorage.setItem(STORAGE_KEY_STEP, '2');
        setStep(2);
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setErrorMsg(err);
        return;
      }
      setSaving(true);
      try {
        await saveStudentDetails({ ...formData, consent_given: false });
      } catch {
        // Continue
      } finally {
        sessionStorage.setItem(STORAGE_KEY_STEP, '3');
        setStep(3);
        setSaving(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    const prevStep = Math.max(1, step - 1);
    sessionStorage.setItem(STORAGE_KEY_STEP, String(prevStep));
    setStep(prevStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission on Step 3: Sets consent_given = true to mark onboarding complete
  const handleSubmit = async () => {
    const err = validateStep3();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await saveStudentDetails({
        ...formData,
        consent_given: true
      });

      // Clear draft storage now that profile is officially complete
      try {
        sessionStorage.removeItem(STORAGE_KEY_STEP);
        sessionStorage.removeItem(STORAGE_KEY_DRAFT);
      } catch {
        // ignore
      }

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        const savedTarget = sessionStorage.getItem('eee_tn_redirect_after_login');
        if (savedTarget) sessionStorage.removeItem('eee_tn_redirect_after_login');
        navigate(savedTarget && savedTarget !== '/' && savedTarget !== '/login' ? savedTarget : '/home', { replace: true });
      }, 1000);
    } catch {
      setErrorMsg(
        lang === 'ta'
          ? 'சுயவிவரத்தைச் சேமிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to save profile details. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const firstName =
    formData.full_name?.trim()?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="onboarding-page-wrapper">
      <div className="container onboarding-page-container">
        
        {/* Onboarding Header Banner */}
        <div className="onboarding-header-banner card">
          <div className="onboarding-banner-meta">
            <span className="onboarding-pill">
              <Sparkles size={14} />
              <span>
                {lang === 'ta' ? `படிநிலை ${step} / 3` : `Step ${step} of 3`}
              </span>
            </span>
            <h1 className="onboarding-page-title">
              {lang === 'ta'
                ? `வணக்கம், ${firstName}! உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்`
                : `Welcome, ${firstName}! Complete Your Student Profile`}
            </h1>
            <p className="onboarding-page-desc">
              {lang === 'ta'
                ? '7.5% அரசு பள்ளி ஒதுக்கீடு, தகுதி மற்றும் உதவித்தொகைகளை அடையாளம் காண உங்கள் விவரங்களை பதிவு செய்யவும்.'
                : 'Enter your basic details and academic info to match with eligible scholarships and guidance opportunities across Tamil Nadu.'}
            </p>
          </div>

          {isProfileComplete && (
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="btn btn-outline onboarding-home-btn"
            >
              <Home size={16} />
              <span>{lang === 'ta' ? 'முகப்புக்குச் செல்' : 'Go to Home'}</span>
            </button>
          )}
        </div>

        {/* Stepper Indicator */}
        <div
          className="modal-stepper-bar"
          style={{
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem',
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className={`step-dot ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? '✓' : '1'}</span>
            <small>{lang === 'ta' ? 'அடிப்படை விவரங்கள்' : 'Basic Info'}</small>
          </div>
          <div className="step-connector" />
          <div className={`step-dot ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
            <span className="step-num">{step > 2 ? '✓' : '2'}</span>
            <small>{lang === 'ta' ? 'பள்ளி & மதிப்பெண்' : 'School & Marks'}</small>
          </div>
          <div className="step-connector" />
          <div className={`step-dot ${step === 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <small>{lang === 'ta' ? 'விருப்பங்கள் & சம்மதம்' : 'Interests & Consent'}</small>
          </div>
        </div>

        {/* Form Card */}
        <div className="card onboarding-form-card">
          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="modal-alert-error" role="alert">
              <AlertCircle size={17} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="modal-alert-success" role="status">
              <CheckCircle2 size={17} />
              <span>
                {lang === 'ta'
                  ? 'உங்கள் சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது! முகப்புக்கு அழைத்துச் செல்லப்படுகிறீர்கள்...'
                  : 'Profile saved successfully! Redirecting to your dashboard...'}
              </span>
            </div>
          )}

          {/* STEP 1: Basic Details */}
          {step === 1 && (
            <div className="form-step-pane">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="full_name" className="form-label required">
                    {lang === 'ta' ? 'முழு பெயர்' : 'Full Name'}
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. S. Anitha / K. Muthu Kumar"
                    required
                  />
                  <small className="field-help">
                    {lang === 'ta' ? 'சான்றிதழ்களில் உள்ளவாறு உள்ளிடவும்.' : 'As given on your official school certificates.'}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="date_of_birth" className="form-label required">
                    {lang === 'ta' ? 'பிறந்த தேதி' : 'Date of Birth'}
                  </label>
                  <input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  {currentAge !== null && (
                    <span className="form-hint-pill" style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                      {lang === 'ta' ? `கணக்கிடப்பட்ட வயது: ${currentAge}` : `Calculated Age: ${currentAge}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="user_email" className="form-label">
                    {lang === 'ta' ? 'மின்னஞ்சல் முகவரி (மாற்ற முடியாது)' : 'Email Address (Read-only)'}
                  </label>
                  <input
                    id="user_email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    readOnly
                    className="form-input"
                    style={{
                      backgroundColor: '#F1F5F9',
                      cursor: 'not-allowed',
                      color: 'var(--text-secondary)'
                    }}
                  />
                  <small className="field-help">
                    {lang === 'ta' ? 'உங்கள் சரிபார்க்கப்பட்ட கணக்கு மின்னஞ்சல்.' : 'Verified authentication account email.'}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone_number" className="form-label required">
                    {lang === 'ta' ? 'கைபேசி எண் (10 இலக்கங்கள்)' : 'Mobile Number (10 digits)'}
                  </label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    inputMode="tel"
                    enterKeyHint="next"
                    maxLength={10}
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 9842100000"
                    required
                  />
                  <small className="field-help">
                    {lang === 'ta' ? 'கலந்தாய்வு மற்றும் அவசர வழிகாட்டல் விழிப்பூட்டல்களுக்கு மட்டுமே.' : 'Used only for emergency counseling and alert notifications.'}
                  </small>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="district" className="form-label required">
                    {lang === 'ta' ? 'மாவட்டம்' : 'District'}
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d.en} value={d.en}>
                        {lang === 'ta' ? d.ta : d.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="town" className="form-label required">
                    {lang === 'ta' ? 'நகரம் / தாலுகா / கிராமம்' : 'Town / Taluk / Village'}
                  </label>
                  <input
                    id="town"
                    name="town"
                    type="text"
                    value={formData.town}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Palacode, Paramakudi, Salem"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: School & Marks */}
          {step === 2 && (
            <div className="form-step-pane">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="current_status" className="form-label required">
                    {lang === 'ta' ? 'தற்போதைய கல்வி நிலை' : 'Current Status'}
                  </label>
                  <select
                    id="current_status"
                    name="current_status"
                    value={formData.current_status}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    {STUDENT_STATUS_OPTIONS.map((st) => (
                      <option key={st.en} value={st.en}>
                        {lang === 'ta' ? st.ta : st.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="school_name" className="form-label required">
                    {lang === 'ta' ? 'பள்ளி பெயர்' : 'School Name'}
                  </label>
                  <input
                    id="school_name"
                    name="school_name"
                    type="text"
                    value={formData.school_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Govt Higher Secondary School"
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="school_board" className="form-label required">
                    {lang === 'ta' ? 'பாடத்திட்டம் (Board)' : 'School Board'}
                  </label>
                  <select
                    id="school_board"
                    name="school_board"
                    value={formData.school_board}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {SCHOOL_BOARDS.map((b) => (
                      <option key={b.en} value={b.en}>
                        {lang === 'ta' ? b.ta : b.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="group_stream" className="form-label required">
                    {lang === 'ta' ? '12-ஆம் வகுப்பு பிரிவு' : 'Class 12 Stream / Group'}
                  </label>
                  <select
                    id="group_stream"
                    name="group_stream"
                    value={formData.group_stream}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {ACADEMIC_STREAMS.map((s) => (
                      <option key={s.en} value={s.en}>
                        {lang === 'ta' ? s.ta : s.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Community Category with Scholarship Notice */}
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="community_category" className="form-label">
                  {lang === 'ta' ? 'சமூகப் பிரிவு (விருப்பத்திற்குரியது)' : 'Community Category (Optional)'}
                </label>
                <select
                  id="community_category"
                  name="community_category"
                  value={formData.community_category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {COMMUNITY_CATEGORIES.map((c) => (
                    <option key={c.en} value={c.en}>
                      {lang === 'ta' ? c.ta : c.en}
                    </option>
                  ))}
                </select>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    background: 'rgba(0, 166, 191, 0.08)',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '0.5rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Info size={16} color="var(--cyan-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    {lang === 'ta'
                      ? 'அரசுப் பள்ளி மாணவர்களுக்கான 7.5% இடஒதுக்கீடு மற்றும் போஸ்ட்-மெட்ரிக் உதவித்தொகை தகுதியை அடையாளம் காண மட்டுமே இது பயன்படுத்தப்படும்.'
                      : 'Used strictly to identify 7.5% Tamil Nadu Government School reservation quotas and post-matric government scholarships.'}
                  </span>
                </div>
              </div>

              {/* Marks Inputs */}
              <div className="form-section-header" style={{ marginTop: '1.5rem' }}>
                <BookOpen size={16} color="var(--cyan-700)" />
                <strong>
                  {lang === 'ta' ? '12-ஆம் வகுப்பு மதிப்பெண்கள் (விருப்பத்திற்குரியது)' : 'Class 12 Marks (Optional)'}
                </strong>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="maths_marks" className="form-label">
                    {lang === 'ta' ? 'கணிதம் (Maths /100)' : 'Maths (/100)'}
                  </label>
                  <input
                    id="maths_marks"
                    name="maths_marks"
                    type="number"
                    inputMode="decimal"
                    enterKeyHint="next"
                    min="0"
                    max="100"
                    value={formData.maths_marks}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0 - 100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="physics_marks" className="form-label">
                    {lang === 'ta' ? 'இயற்பியல் (Physics /100)' : 'Physics (/100)'}
                  </label>
                  <input
                    id="physics_marks"
                    name="physics_marks"
                    type="number"
                    inputMode="decimal"
                    enterKeyHint="next"
                    min="0"
                    max="100"
                    value={formData.physics_marks}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0 - 100"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="chemistry_marks" className="form-label">
                    {lang === 'ta' ? 'வேதியியல் (Chemistry /100)' : 'Chemistry (/100)'}
                  </label>
                  <input
                    id="chemistry_marks"
                    name="chemistry_marks"
                    type="number"
                    inputMode="decimal"
                    enterKeyHint="next"
                    min="0"
                    max="100"
                    value={formData.chemistry_marks}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="0 - 100"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="total_percentage" className="form-label">
                    {lang === 'ta' ? 'மொத்த சதவீதம் (%)' : 'Overall 12th Percentage (%)'}
                  </label>
                  <input
                    id="total_percentage"
                    name="total_percentage"
                    type="number"
                    inputMode="decimal"
                    enterKeyHint="next"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.total_percentage}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 85.5"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preferences, Guardian Consent (if minor) & Platform Consent */}
          {step === 3 && (
            <div className="form-step-pane">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="annual_income_range" className="form-label">
                    {lang === 'ta' ? 'குடும்ப ஆண்டு வருமானம் (விருப்பத்திற்குரியது)' : 'Family Annual Income Range (Optional)'}
                  </label>
                  <select
                    id="annual_income_range"
                    name="annual_income_range"
                    value={formData.annual_income_range}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {INCOME_RANGES.map((inc) => (
                      <option key={inc.value || inc.id} value={inc.value || inc.id}>
                        {lang === 'ta' ? inc.ta : inc.en}
                      </option>
                    ))}
                  </select>
                  <small className="field-help">
                    {lang === 'ta'
                      ? 'புதுமைப் பெண், முதல் பட்டதாரி மற்றும் கல்வி உதவித்தொகை தகுதியை சரிபார்க்க மட்டுமே.'
                      : 'Used solely to identify Pudhumai Penn, Moovalur Ramamirtham, and first-generation tuition fee waivers.'}
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="preferred_language" className="form-label">
                    {lang === 'ta' ? 'விருப்பமான வழிகாட்டல் மொழி' : 'Preferred Guidance Language'}
                  </label>
                  <select
                    id="preferred_language"
                    name="preferred_language"
                    value={formData.preferred_language}
                    onChange={(e) => {
                      handleChange(e);
                      if (setLanguage) setLanguage(e.target.value);
                    }}
                    className="form-select"
                  >
                    <option value="en">English (ஆங்கிலம்)</option>
                    <option value="ta">தமிழ் (Tamil)</option>
                  </select>
                </div>
              </div>

              {/* Interests multi-select tags */}
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label className="form-label">
                  <Heart size={14} color="var(--purple-600)" />
                  <span>{lang === 'ta' ? 'உங்கள் உயர்கல்வி ஆர்வங்கள் (ஒன்றுக்கும் மேற்பட்டவற்றைத் தேர்ந்தெடுக்கலாம்)' : 'Higher Education Interests (Select all that apply)'}</span>
                </label>
                <div className="interests-pill-cloud">
                  {CAREER_INTERESTS.map((item) => {
                    const active = formData.interests.includes(item.en);
                    return (
                      <button
                        type="button"
                        key={item.en}
                        onClick={() => toggleInterest(item.en)}
                        className={`interest-toggle-pill ${active ? 'active' : ''}`}
                      >
                        {lang === 'ta' ? item.ta : item.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minor / Guardian Block (Visible when Age < 18) */}
              {isMinor && (
                <div className="guardian-subform-box" style={{ marginTop: '1.5rem' }}>
                  <div className="guardian-box-header">
                    <ShieldCheck size={18} color="var(--purple-600)" />
                    <strong>
                      {lang === 'ta'
                        ? '18 வயதுக்குட்பட்ட மாணவர்களுக்கான பெற்றோர் / பாதுகாவலர் விவரம்'
                        : 'Parent / Guardian Details (Required for students under 18)'}
                    </strong>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label htmlFor="guardian_name" className="form-label required">
                        {lang === 'ta' ? 'பெற்றோர் / பாதுகாவலர் பெயர்' : 'Parent / Guardian Name'}
                      </label>
                      <input
                        id="guardian_name"
                        name="guardian_name"
                        type="text"
                        value={formData.guardian_name}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. K. Krishnan"
                        required={isMinor}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="guardian_phone" className="form-label required">
                        {lang === 'ta' ? 'பாதுகாவலர் கைபேசி எண்' : 'Guardian Mobile Number (10 digits)'}
                      </label>
                      <input
                        id="guardian_phone"
                        name="guardian_phone"
                        type="tel"
                        inputMode="tel"
                        enterKeyHint="done"
                        maxLength={10}
                        value={formData.guardian_phone}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="e.g. 9842100000"
                        required={isMinor}
                      />
                    </div>
                  </div>

                  <label className="checkbox-label" htmlFor="guardian_consent_given">
                    <input
                      id="guardian_consent_given"
                      name="guardian_consent_given"
                      type="checkbox"
                      checked={formData.guardian_consent_given}
                      onChange={handleChange}
                      required={isMinor}
                    />
                    <span>
                      {lang === 'ta'
                        ? `என் குழந்தை / பாதுகாப்பிலுள்ள மாணவர் ${brand.name} வழிகாட்டல் தளத்தைப் பயன்படுத்த பெற்றோர் / பாதுகாவலராக முழு சம்மதம் அளிக்கிறேன்.`
                        : `I confirm that I am the legal parent/guardian and consent to my ward using ${brand.name} educational guidance services.`}
                    </span>
                  </label>
                </div>
              )}

              {/* Data Privacy & Consent Disclosure */}
              <div className="data-privacy-card" style={{ marginTop: '1.5rem' }}>
                <div className="privacy-card-title">
                  <Lock size={16} color="#166534" />
                  <strong>{lang === 'ta' ? '100% பாதுகாப்பான மாணவர் தனியுரிமை உறுதிமொழி' : `${brand.name} Plain-Language Privacy Promise`}</strong>
                </div>
                <ul className="privacy-card-list">
                  <li>
                    {lang === 'ta'
                      ? 'பூஜ்ஜிய வணிக பயன்பாடு: உங்கள் கைபேசி எண் அல்லது தனிப்பட்ட விவரங்கள் தனியார் கல்லூரிகளுக்கோ அல்லது விளம்பரதாரர்களுக்கோ ஒருபோதும் பகிரப்படாது.'
                      : 'Zero commercial data selling. Your phone number is never shared with private colleges, recruiters, or telemarketers.'}
                  </li>
                  <li>
                    {lang === 'ta'
                      ? 'கட்-ஆஃப் மற்றும் வருமான விவரங்கள் அரசு ஒதுக்கீடு (7.5%), உதவித்தொகை வழிகாட்டலுக்காக மட்டுமே பயன்படுத்தப்படும்.'
                      : 'Marks and income data are used solely to match eligibility for 7.5% TN govt school quota and state scholarships.'}
                  </li>
                  <li>
                    {lang === 'ta'
                      ? 'எந்த நேரத்திலும் உங்கள் சுயவிவர பக்கத்தில் "என் தரவை நீக்கு" விருப்பத்தின் மூலம் உங்கள் தரவை முற்றிலுமாக அழிக்கலாம்.'
                      : 'You can request full deletion of all your stored data anytime from your profile settings.'}
                  </li>
                </ul>

                <label className="checkbox-label consent-box-label" htmlFor="consent_given" style={{ marginTop: '1rem' }}>
                  <input
                    id="consent_given"
                    name="consent_given"
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    <strong>
                      {lang === 'ta'
                        ? `நான் ${brand.name} வழிகாட்டல் நோக்கங்களுக்காக என் கல்வி விவரங்களை பாதுகாப்பாக சேமிக்க சம்மதிக்கிறேன்.`
                        : `I consent to ${brand.name} securely processing my academic details for counseling and scholarship guidance.`}
                    </strong>
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="onboarding-form-actions">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="btn btn-outline"
              >
                <ArrowLeft size={16} />
                <span>{lang === 'ta' ? 'பின்செல்க' : 'Back'}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="actions-right-row">
              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={saving}
                  className="btn btn-primary"
                >
                  <Save size={15} />
                  <span>
                    {saving
                      ? (lang === 'ta' ? 'சேமிக்கிறது...' : 'Saving...')
                      : (lang === 'ta' ? 'சேமித்து தொடரவும்' : 'Save and Continue')}
                  </span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !formData.consent_given || (isMinor && (!formData.guardian_name || !formData.guardian_phone || !formData.guardian_consent_given))}
                  className="btn btn-primary"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {saving
                      ? (lang === 'ta' ? 'சேமிக்கிறது...' : 'Saving...')
                      : (lang === 'ta' ? 'சுயவிவரத்தை நிறைவு செய்' : 'Complete Profile & Continue')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
