import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Phone,
  MapPin,
  School,
  Award,
  Trash2,
  Lock,
  ArrowRight,
  Save,
  RefreshCw,
  Info,
  Heart,
  KeyRound,
  ShieldAlert,
  HelpCircle,
  Mail,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Briefcase,
  Building,
  Tag,
  Check,
  Send,
  Clock,
  FileText
} from 'lucide-react';

const PRESET_EXPERTISE_TAGS = [
  'Engineering',
  'Medicine & Healthcare',
  'Software & IT',
  'Arts & Science',
  'Agriculture & Veterinary',
  'Law & Judiciary',
  'Civil Services (UPSC / TNPSC)',
  'Higher Education Abroad',
  'Interview Preparation',
  'Diploma & Polytechnic',
  'Scholarships & Financial Aid',
  'Research & Academia'
];

export function ProfilePage() {
  const {
    user,
    profile,
    studentDetails,
    mentorDetails,
    adminDetails,
    isProfileComplete,
    saveStudentDetails,
    saveMentorDetails,
    saveAdminDetails,
    requestDataDeletion,
    signInWithGoogle,
    updateEmail,
    updatePassword,
    linkGoogleAccount,
    unlinkGoogleAccount,
    refreshUser
  } = useAuth();

  const { lang, t, setLanguage } = useLanguage();

  // Active Tab: 'personal' | 'signin' | 'privacy'
  const [activeTab, setActiveTab] = useState('personal');

  // Form State for Student Personal Details
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
    guardian_consent_given: false
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Phase 2: Sign-in and Email States
  const [newEmail, setNewEmail] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState(null);

  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const [linkingSuccess, setLinkingSuccess] = useState(null);
  const [linkingError, setLinkingError] = useState(null);

  // Phase 3: Mentor Form States
  const [mentorFormData, setMentorFormData] = useState({
    full_name: '',
    phone: '',
    headline: '',
    organisation: '',
    expertise: ['Engineering', 'Software & IT'],
    years_of_experience: '',
    qualifications: '',
    languages: ['Tamil', 'English'],
    bio: '',
    linkedin_url: '',
    preferred_language: 'en'
  });
  const [initialMentorData, setInitialMentorData] = useState(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [submittingMentor, setSubmittingMentor] = useState(false);
  const [mentorSaveSuccess, setMentorSaveSuccess] = useState(false);
  const [mentorSaveError, setMentorSaveError] = useState(null);

  // Phase 3: Admin Form States
  const [adminFormData, setAdminFormData] = useState({
    full_name: '',
    phone: '',
    designation: '',
    preferred_language: 'en'
  });
  const [initialAdminData, setInitialAdminData] = useState(null);
  const [submittingAdmin, setSubmittingAdmin] = useState(false);
  const [adminSaveSuccess, setAdminSaveSuccess] = useState(false);
  const [adminSaveError, setAdminSaveError] = useState(null);

  // Read-only role from profiles
  const userRole = profile?.role || 'student';

  // Pre-fill student form from studentDetails / profile
  useEffect(() => {
    if (user) {
      const data = {
        full_name: studentDetails?.full_name || profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '',
        date_of_birth: studentDetails?.date_of_birth || '',
        phone_number: studentDetails?.phone_number || '',
        district: studentDetails?.district || profile?.district || 'Madurai',
        town: studentDetails?.town || '',
        current_status: studentDetails?.current_status || 'Class 12',
        school_name: studentDetails?.school_name || '',
        school_board: studentDetails?.school_board || 'State Board',
        group_stream: studentDetails?.group_stream || 'Maths-Physics-Chemistry-Biology',
        community_category: studentDetails?.community_category || 'Prefer not to say',
        maths_marks: studentDetails?.maths_marks !== null && studentDetails?.maths_marks !== undefined ? String(studentDetails.maths_marks) : '',
        physics_marks: studentDetails?.physics_marks !== null && studentDetails?.physics_marks !== undefined ? String(studentDetails.physics_marks) : '',
        chemistry_marks: studentDetails?.chemistry_marks !== null && studentDetails?.chemistry_marks !== undefined ? String(studentDetails.chemistry_marks) : '',
        total_percentage: studentDetails?.total_percentage !== null && studentDetails?.total_percentage !== undefined ? String(studentDetails.total_percentage) : '',
        annual_income_range: studentDetails?.annual_income_range || 'Prefer not to say',
        interests: Array.isArray(studentDetails?.interests) ? studentDetails.interests : [],
        preferred_language: studentDetails?.preferred_language || profile?.preferred_language || lang || 'en',
        guardian_name: studentDetails?.guardian_name || '',
        guardian_phone: studentDetails?.guardian_phone || '',
        guardian_consent_given: studentDetails?.guardian_consent_given || false
      };
      setFormData(data);
      setInitialData(data);
    }
  }, [studentDetails, profile, user]);

  // Pre-fill mentor form from mentorDetails / profile
  useEffect(() => {
    if (user) {
      const mData = {
        full_name: mentorDetails?.profiles?.full_name || profile?.full_name || user?.user_metadata?.full_name || '',
        phone: mentorDetails?.phone || '',
        headline: mentorDetails?.headline || '',
        organisation: mentorDetails?.organisation || '',
        expertise: Array.isArray(mentorDetails?.expertise) && mentorDetails.expertise.length > 0 ? mentorDetails.expertise : ['Engineering', 'Software & IT'],
        years_of_experience: mentorDetails?.years_of_experience !== null && mentorDetails?.years_of_experience !== undefined ? String(mentorDetails.years_of_experience) : '',
        qualifications: mentorDetails?.qualifications || '',
        languages: Array.isArray(mentorDetails?.languages) && mentorDetails.languages.length > 0 ? mentorDetails.languages : ['Tamil', 'English'],
        bio: mentorDetails?.bio || '',
        linkedin_url: mentorDetails?.linkedin_url || '',
        preferred_language: profile?.preferred_language || lang || 'en'
      };
      setMentorFormData(mData);
      setInitialMentorData(mData);
    }
  }, [mentorDetails, profile, user]);

  // Pre-fill admin form from adminDetails / profile
  useEffect(() => {
    if (user) {
      const aData = {
        full_name: profile?.full_name || user?.user_metadata?.full_name || 'Administrator',
        phone: adminDetails?.phone || '',
        designation: adminDetails?.designation || (lang === 'ta' ? 'மாநில ஒருங்கிணைப்பாளர்' : 'State Coordinator'),
        preferred_language: profile?.preferred_language || lang || 'en'
      };
      setAdminFormData(aData);
      setInitialAdminData(aData);
    }
  }, [adminDetails, profile, user]);

  // Determine if active form has unsaved modifications
  const isDirty = useMemo(() => {
    if (activeTab !== 'personal') return false;
    if (userRole === 'mentor') {
      if (!initialMentorData) return false;
      return JSON.stringify(mentorFormData) !== JSON.stringify(initialMentorData);
    }
    if (userRole === 'admin') {
      if (!initialAdminData) return false;
      return JSON.stringify(adminFormData) !== JSON.stringify(initialAdminData);
    }
    if (userRole === 'student') {
      if (!initialData) return false;
      return JSON.stringify(formData) !== JSON.stringify(initialData);
    }
    return false;
  }, [formData, initialData, mentorFormData, initialMentorData, adminFormData, initialAdminData, activeTab, userRole]);

  // Warn on page unload/close if dirty
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Tab switch with unsaved changes confirmation
  const handleTabClick = (tabKey) => {
    if (activeTab === tabKey) return;
    if (isDirty) {
      const confirmDiscard = window.confirm(
        t?.profile?.discardPrompt ||
        'You have unsaved changes. Are you sure you want to switch tabs without saving?'
      );
      if (!confirmDiscard) return;
    }
    setActiveTab(tabKey);
    setSaveError(null);
    setEmailErrorMsg(null);
    setPasswordErrorMsg(null);
    setLinkingError(null);
  };

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

  // Cutoff calculation: Maths/2 + Physics/4 + Chemistry/4
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

  // Validation for Student Personal Details
  const validateForm = () => {
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
      return lang === 'ta' ? 'நகரம் / தாலுகா / கிராமத்தை உள்ளிடவும்.' : 'Please enter your town or village.';
    }
    if (!formData.school_name?.trim()) {
      return lang === 'ta' ? 'பள்ளிப் பெயரை உள்ளிடவும்.' : 'Please enter your school or institute name.';
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

    if (isMinor) {
      if (!formData.guardian_name?.trim()) {
        return lang === 'ta' ? '18 வயதுக்குட்பட்ட மாணவர்களுக்கு பெற்றோர் / பாதுகாவலர் பெயர் அவசியம்.' : 'Parent/Guardian name is required for students under 18.';
      }
      if (!phoneRegex.test(formData.guardian_phone?.trim() || '')) {
        return lang === 'ta' ? 'பாதுகாவலரின் சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit parent/guardian mobile number.';
      }
      if (!formData.guardian_consent_given) {
        return lang === 'ta' ? 'பெற்றோர் / பாதுகாவலர் சம்மதப் பெட்டியைத் தேர்வு செய்யவும்.' : 'Parent/Guardian consent checkbox is required.';
      }
    }

    return null;
  };

  // Save Student Personal Details
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const error = validateForm();
    if (error) {
      setSaveError(error);
      return;
    }

    setSaving(true);
    try {
      await saveStudentDetails({
        ...formData,
        consent_given: true
      });

      if (formData.preferred_language && formData.preferred_language !== lang && setLanguage) {
        setLanguage(formData.preferred_language);
      }

      setInitialData({ ...formData });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch {
      setSaveError(
        t?.profile?.saveError ||
        (lang === 'ta'
          ? 'சுயவிவரத்தைப் புதுப்பிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Unable to update profile. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  // Mentor Personal Details Save / Submit (Phase 3)
  const handleMentorSave = async (e, submitForReview = false) => {
    if (e) e.preventDefault();
    setMentorSaveError(null);
    setMentorSaveSuccess(false);

    if (!mentorFormData.full_name?.trim()) {
      setMentorSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      return;
    }
    if (!mentorFormData.headline?.trim()) {
      setMentorSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் தொழில் தலைப்பை உள்ளிடவும்.' : 'Please enter your headline or designation.');
      return;
    }
    if (!mentorFormData.organisation?.trim()) {
      setMentorSaveError(lang === 'ta' ? 'தயவுசெய்து பணிபுரியும் நிறுவனத்தை உள்ளிடவும்.' : 'Please enter your organisation.');
      return;
    }
    if (!mentorFormData.qualifications?.trim()) {
      setMentorSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் கல்வித் தகுதியை உள்ளிடவும்.' : 'Please enter your qualifications.');
      return;
    }
    if (!mentorFormData.bio?.trim()) {
      setMentorSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் சுயவிவரக் குறிப்பை உள்ளிடவும்.' : 'Please enter a short professional bio.');
      return;
    }
    if (mentorFormData.bio.length > 500) {
      setMentorSaveError(lang === 'ta' ? 'சுயவிவரக் குறிப்பு 500 எழுத்துக்களுக்கு மிகாமல் இருக்க வேண்டும்.' : 'Bio cannot exceed 500 characters.');
      return;
    }
    if (mentorFormData.phone && !/^\d{10}$/.test(mentorFormData.phone.trim())) {
      setMentorSaveError(lang === 'ta' ? 'சரியான 10 இலக்க இந்திய தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setSubmittingMentor(true);
    try {
      const { error } = await saveMentorDetails(mentorFormData, submitForReview);
      if (error) {
        setMentorSaveError(error.message || (lang === 'ta' ? 'சேமிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to update mentor profile.'));
      } else {
        setInitialMentorData({ ...mentorFormData });
        setMentorSaveSuccess(true);
        setTimeout(() => setMentorSaveSuccess(false), 4000);
      }
    } catch {
      setMentorSaveError(lang === 'ta' ? 'இணைப்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'A network error occurred. Please try again.');
    } finally {
      setSubmittingMentor(false);
    }
  };

  const toggleMentorExpertise = (tag) => {
    setMentorFormData((prev) => {
      const exists = prev.expertise.includes(tag);
      const updated = exists ? prev.expertise.filter((t) => t !== tag) : [...prev.expertise, tag];
      return { ...prev, expertise: updated };
    });
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !mentorFormData.expertise.includes(trimmed)) {
      setMentorFormData((prev) => ({ ...prev, expertise: [...prev.expertise, trimmed] }));
      setCustomTagInput('');
    }
  };

  const toggleMentorLanguage = (langOption) => {
    setMentorFormData((prev) => {
      const exists = prev.languages.includes(langOption);
      const updated = exists ? prev.languages.filter((l) => l !== langOption) : [...prev.languages, langOption];
      return { ...prev, languages: updated.length > 0 ? updated : ['Tamil'] };
    });
  };

  // Admin Details Save (Phase 3)
  const handleAdminSave = async (e) => {
    if (e) e.preventDefault();
    setAdminSaveError(null);
    setAdminSaveSuccess(false);

    if (!adminFormData.full_name?.trim()) {
      setAdminSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் முழுப் பெயரை உள்ளிடவும்.' : 'Please enter your full name.');
      return;
    }
    if (!adminFormData.designation?.trim()) {
      setAdminSaveError(lang === 'ta' ? 'தயவுசெய்து உங்கள் நிர்வாகப் பதவியை உள்ளிடவும்.' : 'Please enter your designation.');
      return;
    }
    if (adminFormData.phone && !/^\d{10}$/.test(adminFormData.phone.trim())) {
      setAdminSaveError(lang === 'ta' ? 'சரியான 10 இலக்க இந்திய தொலைபேசி எண்ணை உள்ளிடவும்.' : 'Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setSubmittingAdmin(true);
    try {
      const { error } = await saveAdminDetails(adminFormData);
      if (error) {
        setAdminSaveError(error.message || (lang === 'ta' ? 'சேமிப்பதில் பிழை ஏற்பட்டது.' : 'Failed to update admin profile.'));
      } else {
        if (adminFormData.preferred_language && adminFormData.preferred_language !== lang && setLanguage) {
          setLanguage(adminFormData.preferred_language);
        }
        setInitialAdminData({ ...adminFormData });
        setAdminSaveSuccess(true);
        setTimeout(() => setAdminSaveSuccess(false), 4000);
      }
    } catch {
      setAdminSaveError(lang === 'ta' ? 'இணைப்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'A network error occurred. Please try again.');
    } finally {
      setSubmittingAdmin(false);
    }
  };

  // Data Deletion Request
  const handleDeleteRequest = async () => {
    const confirmMsg =
      t?.profile?.deletionConfirmMsg ||
      t?.onboarding?.deleteConfirm ||
      'Are you sure you want to request data deletion? Your profile details will be scheduled for permanent removal.';

    if (window.confirm(confirmMsg)) {
      setDeleting(true);
      try {
        await requestDataDeletion('Student requested deletion via My Profile settings');
        setDeleteConfirmed(true);
      } catch {
        // ignore
      } finally {
        setDeleting(false);
      }
    }
  };

  // -------------------------------------------------------------
  // Phase 2: Sign-in and Email Methods
  // -------------------------------------------------------------
  const userIdentities = user?.identities || [];
  const hasGoogle =
    userIdentities.some((id) => id.provider === 'google') ||
    user?.app_metadata?.provider === 'google' ||
    user?.app_metadata?.providers?.includes('google');

  const hasPassword =
    userIdentities.some((id) => id.provider === 'email') ||
    user?.app_metadata?.provider === 'email' ||
    user?.app_metadata?.providers?.includes('email');

  const distinctMethodsCount = (hasGoogle ? 1 : 0) + (hasPassword ? 1 : 0);
  const canUnlink = distinctMethodsCount > 1;

  // 1. Change Email Handler
  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailErrorMsg(null);
    setEmailSuccessMsg(null);

    const emailTrimmed = newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setEmailErrorMsg(t?.profile?.invalidEmailError || 'Please enter a valid email address.');
      return;
    }
    if (emailTrimmed === user.email?.toLowerCase()) {
      setEmailErrorMsg(t?.profile?.sameEmailError || 'New email cannot be the same as your current email.');
      return;
    }

    setUpdatingEmail(true);
    try {
      if (updateEmail) {
        const { error } = await updateEmail(emailTrimmed);
        if (error) {
          setEmailErrorMsg(
            lang === 'ta'
              ? 'மின்னஞ்சல் உறுதிப்படுத்தல் கோரிக்கையை அனுப்ப முடியவில்லை. முகவரியைச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
              : 'Unable to send confirmation link. Please verify the address and try again.'
          );
        } else {
          setEmailSuccessMsg(
            t?.profile?.emailConfirmSentMsg ||
            'Confirmation link sent! Check your inbox to confirm the change. Depending on your security settings, you may need to confirm the link in both your current and new inboxes before the change takes effect.'
          );
          setNewEmail('');
        }
      }
    } catch {
      setEmailErrorMsg(
        lang === 'ta'
          ? 'இணைப்பில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'A network error occurred. Please try again.'
      );
    } finally {
      setUpdatingEmail(false);
    }
  };

  // 2. Change or Add Password Handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setPasswordErrorMsg(
        t?.profile?.passwordRulesError ||
        'Password must be at least 8 characters long and include at least one letter and one number.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg(t?.profile?.passwordsDoNotMatch || 'Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      if (updatePassword) {
        const { error } = await updatePassword(newPassword);
        if (error) {
          setPasswordErrorMsg(
            error.message ||
            (lang === 'ta'
              ? 'கடவுச்சொல்லை மாற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : 'Unable to update password. Please try again.')
          );
        } else {
          setPasswordSuccessMsg(
            t?.profile?.passwordUpdatedMsg || 'Password updated successfully!'
          );
          setNewPassword('');
          setConfirmPassword('');
          if (refreshUser) await refreshUser();
        }
      }
    } catch {
      setPasswordErrorMsg(
        lang === 'ta'
          ? 'இணைப்பில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'A network error occurred. Please try again.'
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 3. Link Google Account
  const handleLinkGoogle = async () => {
    setLinkingError(null);
    setLinkingSuccess(null);
    setLinkingGoogle(true);
    try {
      if (linkGoogleAccount) {
        const { error } = await linkGoogleAccount();
        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('manual_linking') || msg.includes('disabled') || msg.includes('not enabled')) {
            setLinkingError(
              t?.profile?.manualLinkingDisabledMsg ||
              "Google account linking requires 'Allow manual linking' to be enabled in your Supabase authentication provider settings. Please contact the administrator or enable manual linking in Supabase Dashboard."
            );
          } else {
            setLinkingError(
              error.message ||
              (lang === 'ta' ? 'Google கணக்கை இணைப்பதில் பிழை ஏற்பட்டது.' : 'Unable to initiate Google account linking.')
            );
          }
        }
      }
    } catch {
      setLinkingError(
        lang === 'ta' ? 'இணைப்பில் பிழை ஏற்பட்டது.' : 'A network error occurred while connecting to Google.'
      );
    } finally {
      setLinkingGoogle(false);
    }
  };

  // 4. Unlink Identity
  const handleUnlinkIdentity = async (identity) => {
    if (!canUnlink) {
      alert(
        t?.profile?.cannotUnlinkLastMethod ||
        'Cannot unlink the only remaining sign-in method on your account.'
      );
      return;
    }

    const confirmMsg =
      lang === 'ta'
        ? 'இந்த உள்நுழைவு முறையை நிச்சயமாக நீக்க விரும்புகிறீர்களா?'
        : 'Are you sure you want to unlink this sign-in method?';

    if (!window.confirm(confirmMsg)) return;

    setUnlinkingId(identity.id || identity.provider);
    setLinkingError(null);
    setLinkingSuccess(null);

    try {
      if (unlinkGoogleAccount) {
        const { error } = await unlinkGoogleAccount(identity);
        if (error) {
          setLinkingError(
            error.message ||
            (lang === 'ta'
              ? 'உள்நுழைவு முறையை நீக்க முடியவில்லை.'
              : 'Unable to unlink sign-in method.')
          );
        } else {
          setLinkingSuccess(
            t?.profile?.unlinkSuccess || 'Sign-in method unlinked successfully.'
          );
          if (refreshUser) await refreshUser();
        }
      }
    } catch {
      setLinkingError(
        lang === 'ta' ? 'இணைப்பில் பிழை ஏற்பட்டது.' : 'A network error occurred.'
      );
    } finally {
      setUnlinkingId(null);
    }
  };

  if (!user) {
    return (
      <div className="container profile-page-container">
        <div className="card profile-guest-card">
          <div className="guest-icon-box">
            <Lock size={32} color="var(--navy-900)" />
          </div>
          <h2>{lang === 'ta' ? 'சுயவிவரத்தைக் காண உள்நுழையவும்' : 'Sign in to View Your Profile'}</h2>
          <p>
            {lang === 'ta'
              ? 'உங்கள் கல்வித் தகுதிகள், கட்-ஆஃப் மதிப்பெண்கள் மற்றும் உதவித்தொகைகளை நிர்வகிக்க உள்நுழையவும்.'
              : 'Sign in to access your profile settings, view personalized cutoff calculations, and manage preferences.'}
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            <span>{t.auth.continueWithGoogle}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const fullNameDisplay =
    (userRole === 'mentor' ? mentorFormData.full_name : userRole === 'admin' ? adminFormData.full_name : formData.full_name) ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  const userInitials =
    fullNameDisplay
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U';

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const mentorStatus = mentorDetails?.status || 'draft';

  return (
    <div className="profile-page-wrapper" style={{ padding: '2rem 1rem 5rem' }}>
      <div className="container profile-container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* HEADER CARD: Avatar, Name, Read-only Role Badge, Email */}
        <div className="profile-header-card card">
          <div className="profile-header-left">
            <div className="profile-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullNameDisplay} className="profile-img-large" />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>

            <div className="profile-intro-text">
              <div className="profile-name-row">
                <h2>{fullNameDisplay}</h2>
                <span className={`role-badge role-${userRole}`}>
                  {userRole === 'student'
                    ? (t?.profile?.roleBadgeStudent || 'Student')
                    : userRole === 'mentor'
                    ? (t?.profile?.roleBadgeMentor || 'Mentor')
                    : (t?.profile?.roleBadgeAdmin || 'Administrator')}
                </span>
                
                {userRole === 'student' ? (
                  <span className={`status-badge ${isProfileComplete ? 'complete' : 'pending'}`}>
                    {isProfileComplete ? t.auth.profileComplete : t.auth.profileIncomplete}
                  </span>
                ) : userRole === 'mentor' ? (
                  <span className={`mentor-status-badge status-${mentorStatus}`}>
                    {mentorStatus === 'approved' && <CheckCircle2 size={13} />}
                    {mentorStatus === 'pending_review' && <Clock size={13} />}
                    {mentorStatus === 'needs_changes' && <AlertCircle size={13} />}
                    {mentorStatus === 'draft' && <FileText size={13} />}
                    <span>
                      {mentorStatus === 'approved'
                        ? (t?.profile?.statusApproved || 'Approved')
                        : mentorStatus === 'pending_review'
                        ? (t?.profile?.statusPending || 'Pending Review')
                        : mentorStatus === 'needs_changes'
                        ? (t?.profile?.statusNeedsChanges || 'Needs Changes')
                        : (t?.profile?.statusDraft || 'Draft')}
                    </span>
                  </span>
                ) : (
                  <span className="mentor-status-badge status-approved">
                    <ShieldCheck size={13} />
                    <span>{lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட நிர்வாகி' : 'Verified Admin'}</span>
                  </span>
                )}
              </div>
              <p className="profile-email-text">{profile?.email || user.email}</p>
              
              <div className="role-readonly-note">
                <HelpCircle size={13} color="var(--text-muted)" />
                <span>
                  {t?.profile?.roleReadOnlyNote ||
                    'Account role is read-only and managed strictly by platform administrators.'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            {isDirty && (
              <span className="unsaved-warning-pill">
                <AlertTriangle size={14} />
                <span>{t?.profile?.unsavedWarning || 'Unsaved Changes'}</span>
              </span>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION: Personal Details | Sign-in & Email | Privacy */}
        <div className="profile-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'personal'}
            onClick={() => handleTabClick('personal')}
            className={`profile-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          >
            <User size={16} />
            <span>{t?.profile?.tabPersonal || 'Personal Details'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'signin'}
            onClick={() => handleTabClick('signin')}
            className={`profile-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
          >
            <KeyRound size={16} />
            <span>{t?.profile?.tabSignIn || 'Sign-in & Email'}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'privacy'}
            onClick={() => handleTabClick('privacy')}
            className={`profile-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
          >
            <Lock size={16} />
            <span>{t?.profile?.tabPrivacy || 'Privacy'}</span>
          </button>
        </div>

        {/* FEEDBACK ALERTS */}
        {saveSuccess && (
          <div className="modal-alert-success" role="status">
            <CheckCircle2 size={17} />
            <span>{t?.profile?.saveSuccess || 'Your profile has been updated successfully!'}</span>
          </div>
        )}

        {saveError && (
          <div className="modal-alert-error" role="alert">
            <AlertCircle size={17} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{saveError}</span>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="btn btn-outline"
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem', marginLeft: '0.75rem' }}
              >
                <RefreshCw size={12} />
                <span>{t?.profile?.retry || 'Retry'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: PERSONAL DETAILS (Role-specific) */}
        {activeTab === 'personal' && (
          <div className="profile-form-pane">
            {userRole === 'student' ? (
              <form onSubmit={handleSaveChanges} className="card" style={{ padding: '2rem' }}>
                <div className="section-card-title" style={{ marginBottom: '1.5rem' }}>
                  <GraduationCap size={20} color="var(--navy-900)" />
                  <h3>{lang === 'ta' ? 'மாணவர் கல்வி மற்றும் தொடர்பு விவரங்கள்' : 'Student & Academic Details'}</h3>
                </div>

                {/* Basic Details */}
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
                    <label htmlFor="profile_email" className="form-label">
                      {lang === 'ta' ? 'மின்னஞ்சல் முகவரி (மாற்ற முடியாது)' : 'Email Address (Read-only)'}
                    </label>
                    <input
                      id="profile_email"
                      type="email"
                      value={profile?.email || user.email || ''}
                      disabled
                      readOnly
                      className="form-input"
                      style={{ backgroundColor: '#F1F5F9', cursor: 'not-allowed', color: 'var(--text-secondary)' }}
                    />
                    <small className="field-help">
                      {lang === 'ta' ? 'மின்னஞ்சலை மாற்ற "உள்நுழைவு & மின்னஞ்சல்" தாவலைப் பயன்படுத்தவும்.' : 'Use the "Sign-in & Email" tab to manage linked emails.'}
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

                {/* School & Academic Info */}
                <div className="section-card-title" style={{ marginTop: '2rem', marginBottom: '1.25rem' }}>
                  <School size={18} color="var(--navy-900)" />
                  <h3>{lang === 'ta' ? 'பள்ளி மற்றும் கல்வி விவரங்கள்' : 'School & Academic Details'}</h3>
                </div>

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
                      {lang === 'ta' ? 'பள்ளி / நிறுவனம் பெயர்' : 'School / Institute Name'}
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
                      {lang === 'ta' ? 'பாடப்பிரிவு' : 'Stream / Group'}
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

                {/* Community Category */}
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

                {/* Marks & Cutoff */}
                <div className="form-section-header" style={{ marginTop: '1.75rem' }}>
                  <Award size={16} color="var(--cyan-700)" />
                  <strong>{lang === 'ta' ? 'மதிப்பெண்கள் & கட்-ஆஃப்' : 'Class 12 Marks & Engineering Cutoff'}</strong>
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
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.total_percentage}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="e.g. 85.5"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {lang === 'ta' ? 'கணக்கிடப்பட்ட பொறியியல் கட்-ஆஃப் (/200)' : 'Engineering Cutoff (/200)'}
                    </label>
                    <div className="cutoff-display-box" role="status" aria-live="polite">
                      <span className="cutoff-calc-value">
                        {calculatedCutoff !== null ? calculatedCutoff : '—'}
                      </span>
                      <small className="cutoff-formula-note">
                        Maths/2 + Physics/4 + Chemistry/4
                      </small>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="section-card-title" style={{ marginTop: '2rem', marginBottom: '1.25rem' }}>
                  <Heart size={18} color="var(--purple-600)" />
                  <h3>{lang === 'ta' ? 'விருப்பங்கள் & வருமான வரம்பு' : 'Preferences & Income Range'}</h3>
                </div>

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
                  </div>

                  <div className="form-group">
                    <label htmlFor="preferred_language" className="form-label">
                      {lang === 'ta' ? 'விருப்பமான வழிகாட்டல் மொழி' : 'Preferred Guidance Language'}
                    </label>
                    <select
                      id="preferred_language"
                      name="preferred_language"
                      value={formData.preferred_language}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="en">English (ஆங்கிலம்)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                    </select>
                  </div>
                </div>

                {/* Interests Tags */}
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">
                    <span>{lang === 'ta' ? 'உங்கள் உயர்கல்வி ஆர்வங்கள்' : 'Higher Education Interests'}</span>
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

                {/* Guardian Subform (If calculated age < 18) */}
                {isMinor && (
                  <div className="guardian-subform-box" style={{ marginTop: '1.75rem' }}>
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
                          ? 'என் குழந்தை / பாதுகாப்பிலுள்ள மாணவர் EEE-TN வழிகாட்டல் தளத்தைப் பயன்படுத்த பெற்றோர் / பாதுகாவலராக முழு சம்மதம் அளிக்கிறேன்.'
                          : 'I confirm that I am the legal parent/guardian and consent to my ward using EEE-TN educational guidance services.'}
                      </span>
                    </label>
                  </div>
                )}

                {/* SAVE BAR */}
                <div className="profile-save-bar">
                  <div>
                    {isDirty ? (
                      <span className="unsaved-warning-pill">
                        <AlertTriangle size={14} />
                        <span>{t?.profile?.unsavedWarning || 'Unsaved Changes'}</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {lang === 'ta' ? 'அனைத்து மாற்றங்களும் சேமிக்கப்பட்டுள்ளன.' : 'All changes are up to date.'}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving || !isDirty}
                    className="btn btn-primary"
                  >
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>{t?.profile?.saving || 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{t?.profile?.saveChanges || 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : userRole === 'mentor' ? (
              <form onSubmit={(e) => handleMentorSave(e, false)} className="profile-form-pane">
                {/* Mentor Status Banner & Review Note */}
                <div className="card mentor-status-banner-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                  <div className="mentor-status-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {t?.profile?.statusBadgeLabel || 'Profile Status'}:
                      </span>
                      <span className={`mentor-status-badge status-${mentorStatus}`}>
                        {mentorStatus === 'approved' && <CheckCircle2 size={15} />}
                        {mentorStatus === 'pending_review' && <Clock size={15} />}
                        {mentorStatus === 'needs_changes' && <AlertCircle size={15} />}
                        {mentorStatus === 'draft' && <FileText size={15} />}
                        <span>
                          {mentorStatus === 'approved'
                            ? (t?.profile?.statusApproved || 'Approved')
                            : mentorStatus === 'pending_review'
                            ? (t?.profile?.statusPending || 'Pending Review')
                            : mentorStatus === 'needs_changes'
                            ? (t?.profile?.statusNeedsChanges || 'Needs Changes')
                            : (t?.profile?.statusDraft || 'Draft')}
                        </span>
                      </span>
                    </div>

                    {mentorDetails?.reviewed_at && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {lang === 'ta' ? 'கடைசி மதிப்பாய்வு: ' : 'Last reviewed: '}
                        {new Date(mentorDetails.reviewed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Admin Review Note Callout */}
                  {mentorDetails?.review_note && (
                    <div className={`mentor-review-note-callout ${mentorStatus === 'needs_changes' ? 'needs-attention' : ''}`} style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem', color: mentorStatus === 'needs_changes' ? '#b91c1c' : 'var(--navy-900)', fontWeight: 700, fontSize: '0.9rem' }}>
                        <AlertCircle size={16} />
                        <span>{t?.profile?.reviewNoteTitle || 'Admin Review Note'}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5, color: '#334155' }}>
                        {mentorDetails.review_note}
                      </p>
                    </div>
                  )}

                  {/* Public fields notice if approved */}
                  {mentorStatus === 'approved' && (
                    <div className="modal-alert-success" style={{ background: 'rgba(0, 6, 102, 0.05)', borderColor: 'rgba(0, 6, 102, 0.2)', color: 'var(--navy-900)', padding: '0.65rem 0.95rem', fontSize: '0.825rem' }}>
                      <Info size={16} style={{ flexShrink: 0 }} />
                      <span>
                        {t?.profile?.publicEditNotice ||
                          'Note: Modifying public fields (bio, headline, expertise, organisation) after approval will automatically return your profile to Pending Review.'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Fields Card */}
                <div className="card" style={{ padding: '2rem' }}>
                  <div className="section-card-title" style={{ marginBottom: '1.5rem' }}>
                    <Briefcase size={20} color="var(--purple-700)" />
                    <div>
                      <h3 style={{ margin: 0 }}>{t?.profile?.mentorSectionTitle || 'Mentor Profile & Credentials'}</h3>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {t?.profile?.mentorSubtitle || 'Share your professional expertise, academic background, and guidance focus'}
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label">{t?.onboarding?.fullName || 'Full Name'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={mentorFormData.full_name}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Phone Number (Optional) */}
                    <div className="form-group">
                      <label className="form-label">
                        {t?.onboarding?.phone || 'Phone Number'} <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({lang === 'ta' ? 'விருப்பத்திற்குட்பட்டது' : 'Optional'})</small>
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        className="form-input"
                        placeholder="e.g. 9840123456"
                        value={mentorFormData.phone}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    {/* Headline / Designation */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">{t?.profile?.headlineLabel || 'Headline / Professional Title'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t?.profile?.headlinePlaceholder || 'e.g. Senior Systems Engineer @ Zoho / Assistant Professor'}
                        value={mentorFormData.headline}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, headline: e.target.value })}
                        required
                      />
                    </div>

                    {/* Current Organisation / Institution */}
                    <div className="form-group">
                      <label className="form-label">{t?.profile?.orgLabel || 'Current Organisation / Institution'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t?.profile?.orgPlaceholder || 'e.g. Zoho Corporation, Anna University, TCS'}
                        value={mentorFormData.organisation}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, organisation: e.target.value })}
                        required
                      />
                    </div>

                    {/* Years of Experience */}
                    <div className="form-group">
                      <label className="form-label">{t?.profile?.experienceLabel || 'Years of Experience'}</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="0.5"
                        className="form-input"
                        placeholder="e.g. 5"
                        value={mentorFormData.years_of_experience}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, years_of_experience: e.target.value })}
                      />
                    </div>

                    {/* Qualifications */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">{t?.profile?.qualificationsLabel || 'Qualifications & Degrees'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t?.profile?.qualificationsPlaceholder || 'e.g. B.E. (EEE), M.Tech, Ph.D'}
                        value={mentorFormData.qualifications}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, qualifications: e.target.value })}
                        required
                      />
                    </div>

                    {/* LinkedIn URL */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">{t?.profile?.linkedinLabel || 'LinkedIn Profile URL (Optional)'}</label>
                      <input
                        type="url"
                        className="form-input"
                        placeholder={t?.profile?.linkedinPlaceholder || 'https://linkedin.com/in/username'}
                        value={mentorFormData.linkedin_url}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, linkedin_url: e.target.value })}
                      />
                    </div>

                    {/* Areas of Expertise Tags */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">{t?.profile?.expertiseLabel || 'Areas of Expertise (Tags)'} *</label>
                      <div className="tags-selector-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        {PRESET_EXPERTISE_TAGS.map((tag) => {
                          const isSelected = mentorFormData.expertise.includes(tag);
                          return (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => toggleMentorExpertise(tag)}
                              className={`tag-toggle-pill ${isSelected ? 'selected' : ''}`}
                            >
                              <span>{tag}</span>
                              {isSelected && <Check size={13} />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Tag Input */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ maxWidth: '280px' }}
                          placeholder={lang === 'ta' ? 'பிற நிபுணத்துவத்தைச் சேர்க்கவும்...' : 'Add custom expertise tag...'}
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomTag}
                          className="btn btn-outline"
                          style={{ padding: '0.5rem 0.95rem' }}
                        >
                          <span>{lang === 'ta' ? '+ சேர்' : '+ Add'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Languages for Mentorship */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">{t?.profile?.languagesLabel || 'Languages for Mentorship'}</label>
                      <div className="tags-selector-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['Tamil', 'English', 'Hindi', 'Telugu', 'Malayalam'].map((langOption) => {
                          const isSelected = mentorFormData.languages.includes(langOption);
                          return (
                            <button
                              type="button"
                              key={langOption}
                              onClick={() => toggleMentorLanguage(langOption)}
                              className={`tag-toggle-pill ${isSelected ? 'selected' : ''}`}
                            >
                              <span>{langOption}</span>
                              {isSelected && <Check size={13} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Short Bio (Max 500 characters with live counter) */}
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <label className="form-label" style={{ margin: 0 }}>
                          {t?.profile?.bioLabel || 'Short Professional Bio'} *
                        </label>
                        <span className={`char-counter ${(mentorFormData.bio?.length || 0) > 480 ? 'limit-near' : ''}`} style={{ fontSize: '0.78rem', fontWeight: 600, color: (mentorFormData.bio?.length || 0) > 480 ? '#dc2626' : 'var(--text-muted)' }}>
                          {mentorFormData.bio?.length || 0} / 500 {t?.profile?.charCount || 'characters'}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        maxLength={500}
                        className="form-input"
                        placeholder={t?.profile?.bioPlaceholder || 'Describe your journey and how you can guide students (max 500 characters)'}
                        value={mentorFormData.bio}
                        onChange={(e) => setMentorFormData({ ...mentorFormData, bio: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky Save Bar for Mentor */}
                <div className="profile-save-bar">
                  <div className="save-bar-left">
                    {isDirty && (
                      <span className="unsaved-warning-pill">
                        <AlertTriangle size={14} />
                        <span>{t?.profile?.unsavedWarning || 'You have unsaved changes.'}</span>
                      </span>
                    )}
                    {mentorSaveSuccess && (
                      <span className="save-success-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        <span>{t?.profile?.saveSuccess || 'Your profile has been updated successfully!'}</span>
                      </span>
                    )}
                    {mentorSaveError && (
                      <span className="save-error-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 600 }}>
                        <AlertCircle size={16} />
                        <span>{mentorSaveError}</span>
                      </span>
                    )}
                  </div>

                  <div className="save-bar-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="submit"
                      disabled={submittingMentor || !isDirty}
                      className="btn btn-outline"
                    >
                      {submittingMentor ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          <span>{t?.profile?.saving || 'Saving...'}</span>
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          <span>{t?.profile?.saveChanges || 'Save Changes'}</span>
                        </>
                      )}
                    </button>

                    {(mentorStatus === 'draft' || mentorStatus === 'needs_changes') && (
                      <button
                        type="button"
                        onClick={(e) => handleMentorSave(e, true)}
                        disabled={submittingMentor}
                        className="btn btn-primary"
                      >
                        <Send size={16} />
                        <span>{t?.profile?.submitReviewBtn || 'Submit for Admin Review'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAdminSave} className="profile-form-pane">
                {/* Read-Only Administrator Access Overview Card */}
                <div className="card" style={{ padding: '1.75rem', borderLeft: '4px solid var(--navy-900)', marginBottom: '1.5rem' }}>
                  <div className="section-card-title" style={{ marginBottom: '1rem' }}>
                    <ShieldAlert size={20} color="var(--navy-900)" />
                    <h3>{t?.profile?.adminOverviewTitle || 'Platform Administrator Access'}</h3>
                  </div>
                  <div className="modal-alert-success" style={{ background: 'rgba(0, 6, 102, 0.05)', borderColor: 'rgba(0, 6, 102, 0.2)', color: 'var(--navy-900)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    <Info size={18} style={{ flexShrink: 0 }} />
                    <span>
                      {t?.profile?.adminAccessNotice ||
                        'Security Policy: Platform administrative roles are assigned via direct database access / Supabase dashboard. Role modification is disabled on this page.'}
                    </span>
                  </div>

                  {/* Direct link to /admin/mentors review area */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {t?.profile?.mentorAdminTitle || 'Mentor Applications Review'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {lang === 'ta' ? 'வழிகாட்டி விண்ணப்பங்களை மதிப்பாய்வு செய்து அங்கீகரிக்கவும் அல்லது மாற்றங்களைக் கோரவும்.' : 'Review incoming mentor profiles, verify credentials, and approve or request changes.'}
                      </p>
                    </div>
                    <Link to="/admin/mentors" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ShieldCheck size={16} />
                      <span>{t?.profile?.manageMentorsBtn || 'Manage Mentor Applications (/admin/mentors)'}</span>
                    </Link>
                  </div>
                </div>

                {/* Admin Personal Details Card */}
                <div className="card" style={{ padding: '2rem' }}>
                  <div className="section-card-title" style={{ marginBottom: '1.5rem' }}>
                    <User size={20} color="var(--navy-900)" />
                    <h3>{t?.profile?.adminSectionTitle || 'Administrator Details'}</h3>
                  </div>

                  <div className="form-grid">
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label">{t?.onboarding?.fullName || 'Full Name'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={adminFormData.full_name}
                        onChange={(e) => setAdminFormData({ ...adminFormData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label className="form-label">{t?.onboarding?.phone || 'Phone Number'}</label>
                      <input
                        type="tel"
                        maxLength={10}
                        className="form-input"
                        placeholder="e.g. 9444001122"
                        value={adminFormData.phone}
                        onChange={(e) => setAdminFormData({ ...adminFormData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>

                    {/* Official Designation */}
                    <div className="form-group">
                      <label className="form-label">{t?.profile?.designationLabel || 'Official Designation'} *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t?.profile?.designationPlaceholder || 'e.g. State Coordinator / Regional Mentor Lead'}
                        value={adminFormData.designation}
                        onChange={(e) => setAdminFormData({ ...adminFormData, designation: e.target.value })}
                        required
                      />
                    </div>

                    {/* Preferred Language */}
                    <div className="form-group">
                      <label className="form-label">{t?.profile?.preferredLangLabel || 'Preferred Language'}</label>
                      <select
                        className="form-input"
                        value={adminFormData.preferred_language}
                        onChange={(e) => setAdminFormData({ ...adminFormData, preferred_language: e.target.value })}
                      >
                        <option value="en">English</option>
                        <option value="ta">தமிழ் (Tamil)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sticky Save Bar for Admin */}
                <div className="profile-save-bar">
                  <div className="save-bar-left">
                    {isDirty && (
                      <span className="unsaved-warning-pill">
                        <AlertTriangle size={14} />
                        <span>{t?.profile?.unsavedWarning || 'You have unsaved changes.'}</span>
                      </span>
                    )}
                    {adminSaveSuccess && (
                      <span className="save-success-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 600 }}>
                        <CheckCircle2 size={16} />
                        <span>{t?.profile?.saveSuccess || 'Your profile has been updated successfully!'}</span>
                      </span>
                    )}
                    {adminSaveError && (
                      <span className="save-error-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 600 }}>
                        <AlertCircle size={16} />
                        <span>{adminSaveError}</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAdmin || !isDirty}
                    className="btn btn-primary"
                  >
                    {submittingAdmin ? (
                      <>
                        <RefreshCw size={16} className="spin" />
                        <span>{t?.profile?.saving || 'Saving...'}</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>{t?.profile?.saveChanges || 'Save Changes'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: SIGN-IN AND EMAIL (PHASE 2) */}
        {activeTab === 'signin' && (
          <div className="profile-form-pane">
            
            {/* Feedback Banners for Phase 2 operations */}
            {emailSuccessMsg && (
              <div className="modal-alert-success" role="status">
                <CheckCircle2 size={17} />
                <span>{emailSuccessMsg}</span>
              </div>
            )}
            {emailErrorMsg && (
              <div className="modal-alert-error" role="alert">
                <AlertCircle size={17} />
                <span>{emailErrorMsg}</span>
              </div>
            )}
            {passwordSuccessMsg && (
              <div className="modal-alert-success" role="status">
                <CheckCircle2 size={17} />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}
            {passwordErrorMsg && (
              <div className="modal-alert-error" role="alert">
                <AlertCircle size={17} />
                <span>{passwordErrorMsg}</span>
              </div>
            )}
            {linkingSuccess && (
              <div className="modal-alert-success" role="status">
                <CheckCircle2 size={17} />
                <span>{linkingSuccess}</span>
              </div>
            )}
            {linkingError && (
              <div className="modal-alert-error" role="alert">
                <AlertCircle size={17} />
                <span>{linkingError}</span>
              </div>
            )}

            {/* CARD 1: LINKED SIGN-IN METHODS & GOOGLE ACCOUNT */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="section-card-title" style={{ marginBottom: '1.25rem' }}>
                <KeyRound size={20} color="var(--navy-900)" />
                <h3>{t?.profile?.signInTitle || 'Sign-in & Email Management'}</h3>
              </div>

              {/* Current Sign-in Email */}
              <div className="profile-data-list">
                <div className="data-row">
                  <span className="data-key">{t?.profile?.currentEmail || 'Current Sign-in Email'}</span>
                  <span className="data-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="var(--cyan-700)" />
                    <strong>{user.email}</strong>
                  </span>
                </div>
              </div>

              {/* Linked Providers List */}
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
                  {t?.profile?.linkedMethods || 'Linked Sign-in Methods'}
                </h4>

                <div className="signin-methods-list">
                  {/* Google Identity */}
                  {hasGoogle && (
                    <div className="signin-method-card">
                      <div className="method-info-left">
                        <div className="method-icon-box" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                        </div>
                        <div className="method-details">
                          <strong>{t?.profile?.googleProvider || 'Google Account'}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>

                      <div className="method-actions">
                        <span className="method-active-tag">
                          <CheckCircle2 size={12} />
                          <span>{lang === 'ta' ? 'இணைக்கப்பட்டுள்ளது' : 'Connected'}</span>
                        </span>

                        {canUnlink ? (
                          <button
                            type="button"
                            onClick={() => {
                              const googleId = userIdentities.find((i) => i.provider === 'google');
                              if (googleId) handleUnlinkIdentity(googleId);
                            }}
                            disabled={unlinkingId === 'google'}
                            className="btn btn-outline btn-danger-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <Unlink size={13} />
                            <span>{unlinkingId === 'google' ? (t?.profile?.unlinking || 'Unlinking...') : (t?.profile?.unlinkBtn || 'Unlink')}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {lang === 'ta' ? '(முதன்மை முறை)' : '(Sole sign-in method)'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Password Identity */}
                  {hasPassword && (
                    <div className="signin-method-card">
                      <div className="method-info-left">
                        <div className="method-icon-box">
                          <Mail size={20} color="var(--navy-900)" />
                        </div>
                        <div className="method-details">
                          <strong>{t?.profile?.passwordProvider || 'Email & Password'}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>

                      <div className="method-actions">
                        <span className="method-active-tag">
                          <CheckCircle2 size={12} />
                          <span>{lang === 'ta' ? 'இயங்குகிறது' : 'Active'}</span>
                        </span>

                        {canUnlink ? (
                          <button
                            type="button"
                            onClick={() => {
                              const emailId = userIdentities.find((i) => i.provider === 'email');
                              if (emailId) handleUnlinkIdentity(emailId);
                            }}
                            disabled={unlinkingId === 'email'}
                            className="btn btn-outline btn-danger-outline"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <Unlink size={13} />
                            <span>{unlinkingId === 'email' ? (t?.profile?.unlinking || 'Unlinking...') : (t?.profile?.unlinkBtn || 'Unlink')}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {lang === 'ta' ? '(முதன்மை முறை)' : '(Sole sign-in method)'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanations & Google Notice */}
              {hasGoogle && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'var(--navy-50)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                  <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                    <Info size={15} color="var(--cyan-700)" />
                    <span>{t?.profile?.googleManagedNotice || 'Your email is managed by your Google account.'}</span>
                  </p>
                </div>
              )}

              {/* Warning on Separate Accounts */}
              <div style={{ marginTop: '0.75rem', padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#92400e' }}>
                <p style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{t?.profile?.separateAccountWarning || 'Warning: Signing in with a different Google account without linking creates a completely separate account. Make sure to link your Google accounts here first.'}</span>
                </p>
              </div>

              {/* Link Another Google Account Button */}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleLinkGoogle}
                  disabled={linkingGoogle}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{linkingGoogle ? (t?.profile?.linking || 'Connecting to Google...') : (t?.profile?.linkGoogleBtn || 'Link Another Google Account')}</span>
                </button>
              </div>
            </div>

            {/* CARD 2: CHANGE EMAIL ADDRESS */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="section-card-title" style={{ marginBottom: '1.25rem' }}>
                <Mail size={18} color="var(--navy-900)" />
                <h3>{t?.profile?.changeEmailTitle || 'Change Email Address'}</h3>
              </div>

              {hasPassword ? (
                <form onSubmit={handleEmailChange}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {lang === 'ta'
                      ? 'உங்கள் புதிய மின்னஞ்சல் முகவரியை உள்ளிட்டு உறுதிப்படுத்தல் இணைப்பை அனுப்பவும்.'
                      : 'Enter your new email address. A confirmation link will be sent to verify the change.'}
                  </p>

                  <div className="form-group" style={{ maxWidth: '480px' }}>
                    <label htmlFor="new_email_input" className="form-label required">
                      {t?.profile?.newEmailLabel || 'New Email Address'}
                    </label>
                    <input
                      id="new_email_input"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="e.g. yourname.new@gmail.com"
                      className="form-input"
                      required
                    />
                    <small className="field-help">
                      {lang === 'ta'
                        ? 'மாற்றம் உறுதி செய்யப்படும் வரை உங்கள் தற்போதைய மின்னஞ்சல் செயலில் இருக்கும்.'
                        : 'Your current email remains active until both verification links are confirmed.'}
                    </small>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingEmail || !newEmail.trim()}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    {updatingEmail ? (
                      <>
                        <RefreshCw size={15} className="spin" />
                        <span>{t?.profile?.sendingLink || 'Sending...'}</span>
                      </>
                    ) : (
                      <>
                        <Mail size={15} />
                        <span>{t?.profile?.sendConfirmationBtn || 'Send Confirmation Link'}</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div style={{ background: 'var(--navy-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--navy-900)', lineHeight: '1.5' }}>
                    {lang === 'ta'
                      ? 'உங்கள் கணக்கு Google மூலம் நேரடியாக இணைக்கப்பட்டுள்ளது. உங்கள் உள்நுழைவு மின்னஞ்சல் உங்கள் Google கணக்கால் தீர்மானிக்கப்படுகிறது. மாற்று மின்னஞ்சலைப் பயன்படுத்த கீழே கடவுச்சொல்லை அமைத்து மின்னஞ்சல் உள்நுழைவை இயக்கலாம்.'
                      : 'Your account is authenticated via Google OAuth. To enable standalone email modifications, add a password below to activate standard email authentication.'}
                  </p>
                </div>
              )}
            </div>

            {/* CARD 3: CHANGE OR SET PASSWORD */}
            <div className="card" style={{ padding: '2rem' }}>
              <div className="section-card-title" style={{ marginBottom: '1.25rem' }}>
                <Lock size={18} color="var(--navy-900)" />
                <h3>{hasPassword ? (t?.profile?.changePasswordTitle || 'Change Password') : (t?.profile?.addPasswordTitle || 'Add a password so you can also log in with email')}</h3>
              </div>

              <form onSubmit={handlePasswordChange}>
                <div className="form-row-2">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label htmlFor="new_password_input" className="form-label required">
                      {t?.profile?.newPasswordLabel || 'New Password'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="new_password_input"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="password-toggle-btn"
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label htmlFor="confirm_password_input" className="form-label required">
                      {t?.profile?.confirmPasswordLabel || 'Confirm New Password'}
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        id="confirm_password_input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle-btn"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <small className="field-help" style={{ display: 'block', marginTop: '0.25rem', marginBottom: '1rem' }}>
                  {t?.profile?.passwordRulesError || 'Password must be at least 8 characters long and include at least one letter and one number.'}
                </small>

                <button
                  type="submit"
                  disabled={updatingPassword || !newPassword || !confirmPassword}
                  className="btn btn-primary"
                >
                  {updatingPassword ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>{t?.profile?.saving || 'Saving...'}</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={15} />
                      <span>{hasPassword ? (t?.profile?.updatePasswordBtn || 'Update Password') : (t?.profile?.setPasswordBtn || 'Set Password')}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: PRIVACY & DATA DELETION */}
        {activeTab === 'privacy' && (
          <div className="profile-form-pane">
            <div className="card" style={{ padding: '2rem' }}>
              <div className="section-card-title" style={{ marginBottom: '1.25rem' }}>
                <Lock size={20} color="#166534" />
                <h3>{t?.profile?.privacyHeading || 'What We Store & Why'}</h3>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {t?.profile?.privacyIntro ||
                  'EEE-TN is dedicated to student empowerment. Your personal information is kept strictly confidential.'}
              </p>

              <div className="data-privacy-card" style={{ marginBottom: '1.75rem' }}>
                <ul className="privacy-card-list">
                  <li>
                    {lang === 'ta'
                      ? 'பூஜ்ஜிய வணிகப் பயன்பாடு: உங்கள் கைபேசி எண் அல்லது தனிப்பட்ட விவரங்கள் தனியார் கல்லூரிகளுக்கோ அல்லது விளம்பர நிறுவனங்களுக்கோ ஒருபோதும் விற்கப்படாது.'
                      : 'Zero commercial monetization: Your phone number and personal details are never sold or rented to private colleges or coaching brokers.'}
                  </li>
                  <li>
                    {lang === 'ta'
                      ? 'கட்-ஆஃப் மற்றும் வருமான விவரங்கள் 7.5% அரசு பள்ளி ஒதுக்கீடு, புதுமைப் பெண், தமிழ்ப் புதல்வன் மற்றும் அரசு உதவித்தொகை வழிகாட்டலுக்கு மட்டுமே பயன்படுத்தப்படுகின்றன.'
                      : 'Marks and income data are used solely to match eligibility for 7.5% government school quota, Pudhumai Penn, Tamil Pudhalvan, and scholarships.'}
                  </li>
                  <li>
                    {lang === 'ta'
                      ? 'அவசர வழிகாட்டல் விழிப்பூட்டல்கள் மற்றும் கலந்தாய்வு தகவல்கள் வழங்க மட்டுமே உங்கள் தொடர்பு எண் பயன்படுத்தப்படும்.'
                      : 'Mobile numbers are used exclusively for emergency counseling notifications and direct mentorship guidance.'}
                  </li>
                </ul>
              </div>

              {/* Data Deletion Request Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: '#dc2626', margin: '0 0 0.35rem' }}>
                      {t?.profile?.deletionTitle || 'Data Deletion Request'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '560px' }}>
                      {t?.profile?.deletionDesc ||
                        'You have the right to request permanent deletion of all your stored student data and opportunity records at any time.'}
                    </p>
                  </div>

                  <div>
                    {studentDetails?.delete_requested || deleteConfirmed ? (
                      <span className="unsaved-warning-pill" style={{ color: '#b91c1c', background: '#fee2e2', borderColor: '#fca5a5' }}>
                        <CheckCircle2 size={14} color="#b91c1c" />
                        <span>{t?.profile?.deletionPendingStatus || 'Deletion Requested (Pending Review)'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDeleteRequest}
                        disabled={deleting}
                        className="btn btn-outline btn-danger-outline"
                      >
                        <Trash2 size={15} />
                        <span>{deleting ? (lang === 'ta' ? 'கோரப்படுகிறது...' : 'Submitting...') : (t?.profile?.requestDeletionBtn || 'Request Deletion of My Data')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {(studentDetails?.delete_requested || deleteConfirmed) && (
                  <div className="profile-alert warning" role="alert" style={{ marginTop: '1rem' }}>
                    <AlertCircle size={18} />
                    <div>
                      <strong>{lang === 'ta' ? 'தரவு நீக்குதல் கோரிக்கை பெறப்பட்டது' : 'Deletion Request Received'}</strong>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                        {t?.onboarding?.deleteRequested || 'Your data deletion request is in the administrative queue for complete removal.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProfilePage;
