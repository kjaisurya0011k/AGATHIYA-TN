import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const STORAGE_KEY_USER = 'eee_tn_simulated_user';
const STORAGE_KEY_SAVED = 'eee_tn_saved_opportunities';
const STORAGE_KEY_SESSIONS = 'eee_tn_registered_sessions';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [adminDetails, setAdminDetails] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [profileNetworkError, setProfileNetworkError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [savedOpportunities, setSavedOpportunities] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SAVED) || '[]');
    } catch {
      return [];
    }
  });

  const [registeredSessions, setRegisteredSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '["tnea-choice-filling"]');
    } catch {
      return ['tnea-choice-filling'];
    }
  });

  // Catch URL error parameters from Google OAuth redirects
  useEffect(() => {
    try {
      const fullParams = new URLSearchParams(window.location.search || window.location.hash.replace('#', '?'));
      const errorParam = fullParams.get('error') || fullParams.get('error_code');
      const errorDesc = fullParams.get('error_description');
      if (errorParam || errorDesc) {
        const fullErr = `${errorParam || ''} ${errorDesc || ''}`.toLowerCase();
        if (fullErr.includes('access_denied') || fullErr.includes('cancel')) {
          setAuthError('oauthCancelled');
        } else if (fullErr.includes('network') || fullErr.includes('timeout')) {
          setAuthError('oauthNetworkError');
        } else {
          setAuthError('oauthGenericError');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize session & register listener
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        if (supabase && typeof supabase.auth?.getSession === 'function') {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (currentSession?.user && mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchOrInitUserData(currentSession.user);
            if (mounted) setLoading(false);
            return;
          }
        }
      } catch (err) {
        // live session check note
      }

      // Check simulated local session (useful for offline preview and role testing)
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          setSession({ user: parsed.user, access_token: 'demo_token' });
          setUser(parsed.user);
          setProfile(parsed.profile);
          if (parsed.studentDetails && parsed.studentDetails.consent_given) {
            setStudentDetails(parsed.studentDetails);
            setIsProfileComplete(true);
          } else {
            setStudentDetails(null);
            setIsProfileComplete(false);
          }
          if (parsed.mentorDetails) {
            setMentorDetails(parsed.mentorDetails);
          } else {
            setMentorDetails(null);
          }
          if (parsed.adminDetails) {
            setAdminDetails(parsed.adminDetails);
          } else {
            setAdminDetails(null);
          }
        }
      } catch {
        // ignore
      }

      if (mounted) setLoading(false);
    }

    initSession();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase?.auth?.onAuthStateChange?.(async (event, newSession) => {
      if (!mounted) return;
      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchOrInitUserData(newSession.user);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (!stored) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setStudentDetails(null);
          setIsProfileComplete(false);
        }
      }
      setLoading(false);
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch profiles and student_details without storing personal data in localStorage
  async function fetchOrInitUserData(authUser) {
    try {
      setProfileNetworkError(false);

      // 1. Fetch Profile
      let currentProfile = null;
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profError) {
        const errMsg = profError.message || '';
        if (errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network')) {
          setProfileNetworkError(true);
        }
      }

      if (profData) {
        currentProfile = profData;
        // Synchronize profiles.email if authUser.email was updated and confirmed
        if (authUser.email && profData.email !== authUser.email) {
          await supabase
            .from('profiles')
            .update({ email: authUser.email, updated_at: new Date().toISOString() })
            .eq('id', authUser.id);
          currentProfile = { ...profData, email: authUser.email };
        }
      } else {
        // Attempt insertion if not created by trigger yet
        const initialProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'TN Student',
          role: 'student',
          avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null
        };
        const { data: created } = await supabase
          .from('profiles')
          .upsert(initialProfile)
          .select()
          .maybeSingle();

        currentProfile = created || initialProfile;
      }
      setProfile(currentProfile);

      // 2. Fetch Student Details
      const { data: studentData, error: studentError } = await supabase
        .from('student_details')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (studentError) {
        const sErrMsg = studentError.message || '';
        if (sErrMsg.toLowerCase().includes('failed to fetch') || sErrMsg.toLowerCase().includes('network')) {
          setProfileNetworkError(true);
        }
      }

      if (studentData) {
        setStudentDetails(studentData);
        setIsProfileComplete(Boolean(studentData.consent_given));
      } else {
        setStudentDetails(null);
        // Mentors and admins skip student onboarding
        if (currentProfile?.role === 'mentor' || currentProfile?.role === 'admin') {
          setIsProfileComplete(true);
        } else {
          setIsProfileComplete(false);
        }
      }

      // 3. Fetch Mentor Details if user has role 'mentor' or if row exists
      if (currentProfile?.role === 'mentor' || authUser?.id) {
        try {
          const { data: mentorData } = await supabase
            .from('mentor_profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          if (mentorData) {
            setMentorDetails(mentorData);
          }
        } catch {
          // ignore
        }
      }

      // 4. Fetch Admin Details if user has role 'admin'
      if (currentProfile?.role === 'admin' || authUser?.id) {
        try {
          const { data: adminData } = await supabase
            .from('admin_details')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          if (adminData) {
            setAdminDetails(adminData);
          }
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (err?.message?.toLowerCase().includes('failed to fetch') || err?.message?.toLowerCase().includes('network')) {
        setProfileNetworkError(true);
      }
      // Offline fallback profile
      setProfile({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
        role: 'student'
      });
    }
  }

  const retryFetchProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchOrInitUserData(user);
      setLoading(false);
    }
  };

  // Google OAuth sign-in via Supabase
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        setAuthError('oauthNetworkError');
      } else {
        setAuthError('oauthGenericError');
      }
      return { success: false, error: err };
    }
  };

  // Save / Update Student Details (Supports both draft saves and final completion)
  const saveStudentDetails = async (formData) => {
    if (!user?.id) throw new Error('User not authenticated');

    const isFinalConsent = Boolean(formData.consent_given);

    // Calculate age from date_of_birth if available
    let calculatedAge = null;
    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
      }
    }

    // Auto-calculate cutoff: Maths/2 + Physics/4 + Chemistry/4 (out of 200)
    let cutoff = null;
    const m = formData.maths_marks !== '' && formData.maths_marks !== null && formData.maths_marks !== undefined ? parseFloat(formData.maths_marks) : null;
    const p = formData.physics_marks !== '' && formData.physics_marks !== null && formData.physics_marks !== undefined ? parseFloat(formData.physics_marks) : null;
    const c = formData.chemistry_marks !== '' && formData.chemistry_marks !== null && formData.chemistry_marks !== undefined ? parseFloat(formData.chemistry_marks) : null;
    if (m !== null && p !== null && c !== null && !isNaN(m) && !isNaN(p) && !isNaN(c)) {
      cutoff = parseFloat(((m / 2) + (p / 4) + (c / 4)).toFixed(2));
    }

    const payload = {
      id: user.id,
      full_name: formData.full_name?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      age: calculatedAge,
      phone_number: formData.phone_number?.trim() || null,
      district: formData.district || null,
      town: formData.town?.trim() || null,
      current_status: formData.current_status || 'Class 12',
      school_name: formData.school_name?.trim() || null,
      school_board: formData.school_board || 'State Board',
      group_stream: formData.group_stream || 'Maths-Physics-Chemistry-Biology',
      community_category: formData.community_category || 'Prefer not to say',
      maths_marks: m,
      physics_marks: p,
      chemistry_marks: c,
      total_percentage: formData.total_percentage !== '' && formData.total_percentage !== null && formData.total_percentage !== undefined ? parseFloat(formData.total_percentage) : null,
      cutoff_marks: cutoff,
      annual_income_range: formData.annual_income_range || 'Prefer not to say',
      interests: Array.isArray(formData.interests) ? formData.interests : [],
      preferred_language: formData.preferred_language || 'en',
      guardian_name: calculatedAge !== null && calculatedAge < 18 ? formData.guardian_name?.trim() || null : null,
      guardian_phone: calculatedAge !== null && calculatedAge < 18 ? formData.guardian_phone?.trim() || null : null,
      guardian_consent_given: calculatedAge !== null && calculatedAge < 18 ? !!formData.guardian_consent_given : false,
      consent_given: isFinalConsent,
      consent_at: isFinalConsent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('student_details')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        // Fallback for offline demo mode
        setStudentDetails(payload);
        setIsProfileComplete(isFinalConsent);
        if (isFinalConsent) setShowOnboardingModal(false);
      } else {
        setStudentDetails(data);
        setIsProfileComplete(isFinalConsent);
        if (isFinalConsent) setShowOnboardingModal(false);
      }

      // Update name, district & preferred_language on profiles
      if (payload.full_name || payload.district || payload.preferred_language) {
        await supabase
          .from('profiles')
          .update({
            ...(payload.full_name ? { full_name: payload.full_name } : {}),
            ...(payload.district ? { district: payload.district } : {}),
            ...(payload.preferred_language ? { preferred_language: payload.preferred_language } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        setProfile((prev) => ({
          ...prev,
          ...(payload.full_name ? { full_name: payload.full_name } : {}),
          ...(payload.district ? { district: payload.district } : {}),
          ...(payload.preferred_language ? { preferred_language: payload.preferred_language } : {})
        }));
      }

      return payload;
    } catch {
      setStudentDetails(payload);
      setIsProfileComplete(isFinalConsent);
      if (isFinalConsent) setShowOnboardingModal(false);
      return payload;
    }
  };

  // Request Data Deletion (inserts into deletion_requests and sets flag on student_details)
  const requestDataDeletion = async (notes = '') => {
    if (!user?.id) return;
    const requestedAt = new Date().toISOString();
    try {
      await supabase
        .from('deletion_requests')
        .insert({
          user_id: user.id,
          requested_at: requestedAt,
          status: 'pending',
          notes: notes || null
        });
    } catch {
      // ignore
    }
    try {
      await supabase
        .from('student_details')
        .update({
          delete_requested: true,
          delete_requested_at: requestedAt
        })
        .eq('id', user.id);
    } catch {
      // ignore
    }
    setStudentDetails((prev) => (prev ? { ...prev, delete_requested: true, delete_requested_at: requestedAt } : null));
  };

  // One-click demo role switcher for testing roles
  const loginAsDemoRole = (roleType = 'student') => {
    const demoConfigs = {
      new_student: {
        user: { id: 'demo-new-student-id', email: 'anitha.new@eeetn.org', user_metadata: { full_name: 'S. Anitha' } },
        profile: {
          id: 'demo-new-student-id',
          email: 'anitha.new@eeetn.org',
          full_name: 'S. Anitha',
          role: 'student',
          district: 'Ariyalur'
        },
        studentDetails: null
      },
      student: {
        user: { id: 'demo-student-id', email: 'muthu.student@eeetn.org', user_metadata: { full_name: 'K. Muthu Kumar' } },
        profile: {
          id: 'demo-student-id',
          email: 'muthu.student@eeetn.org',
          full_name: 'K. Muthu Kumar',
          role: 'student',
          district: 'Dharmapuri',
          school_type: 'Government Higher Secondary School'
        },
        studentDetails: {
          id: 'demo-student-id',
          full_name: 'K. Muthu Kumar',
          date_of_birth: '2007-06-15',
          age: 18,
          phone_number: '9842100000',
          district: 'Dharmapuri',
          town: 'Palacode',
          current_status: 'Passed Class 12',
          school_name: 'Govt Higher Secondary School, Palacode',
          school_board: 'State Board',
          group_stream: 'Maths-Physics-Chemistry-Biology',
          community_category: 'MBC',
          maths_marks: 88,
          physics_marks: 82,
          chemistry_marks: 85,
          total_percentage: 85.5,
          cutoff_marks: 172.5,
          annual_income_range: 'below_1_lakh',
          interests: ['Engineering', 'AI and technology'],
          preferred_language: 'ta',
          consent_given: true
        }
      },
      mentor: {
        user: { id: 'demo-mentor-id', email: 'senthil.mentor@eeetn.org', user_metadata: { full_name: 'Er. K. Senthil Nathan' } },
        profile: {
          id: 'demo-mentor-id',
          email: 'senthil.mentor@eeetn.org',
          full_name: 'Er. K. Senthil Nathan',
          role: 'mentor',
          district: 'Coimbatore',
          designation: 'Senior Lead Systems Engineer'
        },
        mentorDetails: {
          id: 'demo-mentor-id',
          phone: '9840123456',
          headline: 'Senior Lead Systems Engineer & Career Mentor',
          organisation: 'Zoho Corporation',
          expertise: ['Engineering', 'Software & IT', 'Higher Education Abroad', 'Interview Preparation'],
          years_of_experience: 8.5,
          qualifications: 'B.E. (EEE) College of Engineering Guindy, M.S. Software Engineering',
          languages: ['Tamil', 'English'],
          bio: 'First-generation graduate from Salem district. Guiding students in engineering choices, career readiness, and competitive technical interviews.',
          linkedin_url: 'https://linkedin.com/in/senthil-mentor-eeetn',
          status: 'approved',
          review_note: 'Verified CEG alumni credentials and tech mentoring experience.',
          reviewed_by: 'demo-admin-id',
          reviewed_at: '2026-09-01T10:00:00Z'
        }
      },
      admin: {
        user: { id: 'demo-admin-id', email: 'director.admin@eeetn.org', user_metadata: { full_name: 'EEE-TN Platform Administrator' } },
        profile: {
          id: 'demo-admin-id',
          email: 'director.admin@eeetn.org',
          full_name: 'EEE-TN Platform Administrator',
          role: 'admin',
          district: 'Chennai'
        },
        adminDetails: {
          id: 'demo-admin-id',
          phone: '9444001122',
          designation: 'State Higher Education Coordinator & Review Lead'
        }
      }
    };

    const selected = demoConfigs[roleType] || demoConfigs.student;
    setSession({ user: selected.user, access_token: 'demo_token' });
    setUser(selected.user);
    setProfile(selected.profile);
    if (selected.studentDetails && selected.studentDetails.consent_given) {
      setStudentDetails(selected.studentDetails);
      setIsProfileComplete(true);
    } else if (selected.profile?.role === 'mentor' || selected.profile?.role === 'admin') {
      setStudentDetails(null);
      setIsProfileComplete(true);
    } else {
      setStudentDetails(null);
      setIsProfileComplete(false);
    }
    if (selected.mentorDetails) {
      setMentorDetails(selected.mentorDetails);
    } else {
      setMentorDetails(null);
    }
    if (selected.adminDetails) {
      setAdminDetails(selected.adminDetails);
    } else {
      setAdminDetails(null);
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(selected));
  };

  const signOut = async () => {
    try {
      await supabase.auth?.signOut?.();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    setSession(null);
    setUser(null);
    setProfile(null);
    setStudentDetails(null);
    setIsProfileComplete(false);
    setShowOnboardingModal(false);
    setAuthError(null);
    setProfileNetworkError(false);
  };

  const clearAuthError = () => setAuthError(null);

  const toggleSaveOpportunity = (oppId) => {
    setSavedOpportunities((prev) => {
      const exists = prev.includes(oppId);
      const updated = exists ? prev.filter((id) => id !== oppId) : [...prev, oppId];
      localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
      return updated;
    });
  };

  const registerSession = (sessionId) => {
    setRegisteredSessions((prev) => {
      if (prev.includes(sessionId)) return prev;
      const updated = [...prev, sessionId];
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  const cancelSession = (sessionId) => {
    setRegisteredSessions((prev) => {
      const updated = prev.filter((id) => id !== sessionId);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  // Update Email with confirmation redirect
  const updateEmail = async (newEmail) => {
    return await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: window.location.origin + '/auth/callback' }
    );
  };

  // Update or Set Password
  const updatePassword = async (newPassword) => {
    return await supabase.auth.updateUser({ password: newPassword });
  };

  // Link another Google Account
  const linkGoogleAccount = async () => {
    return await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });
  };

  // Unlink Identity
  const unlinkGoogleAccount = async (identity) => {
    return await supabase.auth.unlinkIdentity(identity);
  };

  // Refresh user object and session
  const refreshUser = async () => {
    try {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser) {
        setUser(freshUser);
        await fetchOrInitUserData(freshUser);
      }
    } catch {
      // ignore
    }
  };

  // Save / Update Mentor Details (Phase 3)
  const saveMentorDetails = async (formData, submitForReview = false) => {
    if (!user?.id) throw new Error('User not authenticated');

    const currentStatus = mentorDetails?.status || 'draft';
    let nextStatus = currentStatus;

    if (submitForReview) {
      nextStatus = 'pending_review';
    } else if (currentStatus === 'approved') {
      // Check if any public-facing fields were modified
      const bioChanged = (formData.bio || '').trim() !== (mentorDetails?.bio || '').trim();
      const headlineChanged = (formData.headline || '').trim() !== (mentorDetails?.headline || '').trim();
      const orgChanged = (formData.organisation || '').trim() !== (mentorDetails?.organisation || '').trim();
      const expChanged = JSON.stringify(formData.expertise || []) !== JSON.stringify(mentorDetails?.expertise || []);
      if (bioChanged || headlineChanged || orgChanged || expChanged) {
        nextStatus = 'pending_review';
      }
    } else if (currentStatus === 'needs_changes' && submitForReview) {
      nextStatus = 'pending_review';
    }

    const payload = {
      id: user.id,
      phone: formData.phone?.trim() || null,
      headline: formData.headline?.trim() || null,
      organisation: formData.organisation?.trim() || null,
      expertise: Array.isArray(formData.expertise) ? formData.expertise : [],
      years_of_experience: formData.years_of_experience !== '' && formData.years_of_experience !== null && !isNaN(parseFloat(formData.years_of_experience)) ? parseFloat(formData.years_of_experience) : null,
      qualifications: formData.qualifications?.trim() || null,
      languages: Array.isArray(formData.languages) && formData.languages.length > 0 ? formData.languages : ['Tamil', 'English'],
      bio: formData.bio ? formData.bio.trim().slice(0, 500) : null,
      linkedin_url: formData.linkedin_url?.trim() || null,
      status: nextStatus,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .upsert(payload)
        .select()
        .maybeSingle();

      const saved = data || payload;
      setMentorDetails(saved);

      // Synchronize full_name & preferred_language on profiles
      if (formData.full_name || formData.preferred_language) {
        await supabase
          .from('profiles')
          .update({
            ...(formData.full_name ? { full_name: formData.full_name.trim() } : {}),
            ...(formData.preferred_language ? { preferred_language: formData.preferred_language } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        setProfile((prev) => ({
          ...prev,
          ...(formData.full_name ? { full_name: formData.full_name.trim() } : {}),
          ...(formData.preferred_language ? { preferred_language: formData.preferred_language } : {})
        }));
      }

      return { data: saved, error: null };
    } catch (err) {
      setMentorDetails(payload);
      return { data: payload, error: err };
    }
  };

  // Save / Update Admin Details (Phase 3)
  const saveAdminDetails = async (formData) => {
    if (!user?.id) throw new Error('User not authenticated');

    const payload = {
      id: user.id,
      phone: formData.phone?.trim() || null,
      designation: formData.designation?.trim() || null,
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('admin_details')
        .upsert(payload)
        .select()
        .maybeSingle();

      const saved = data || payload;
      setAdminDetails(saved);

      // Synchronize full_name & preferred_language on profiles
      if (formData.full_name || formData.preferred_language) {
        await supabase
          .from('profiles')
          .update({
            ...(formData.full_name ? { full_name: formData.full_name.trim() } : {}),
            ...(formData.preferred_language ? { preferred_language: formData.preferred_language } : {}),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        setProfile((prev) => ({
          ...prev,
          ...(formData.full_name ? { full_name: formData.full_name.trim() } : {}),
          ...(formData.preferred_language ? { preferred_language: formData.preferred_language } : {})
        }));
      }

      return { data: saved, error: null };
    } catch (err) {
      setAdminDetails(payload);
      return { data: payload, error: err };
    }
  };

  // Fetch Mentor Profiles for Admin Review (/admin/mentors)
  const fetchAdminMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*, profiles:id(full_name, email, avatar_url, preferred_language)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err) {
      // Fallback demo mentors list for testing and preview
      return {
        data: [
          {
            id: 'demo-mentor-id-1',
            profiles: { full_name: 'Er. K. Senthil Nathan', email: 'senthil.mentor@eeetn.org', avatar_url: null },
            headline: 'Senior Lead Systems Engineer',
            organisation: 'Zoho Corporation',
            expertise: ['Engineering', 'Software & IT', 'Higher Education Abroad', 'Interview Preparation'],
            years_of_experience: 8.5,
            qualifications: 'B.E. (EEE) CEG Anna Univ, M.S.',
            languages: ['Tamil', 'English'],
            bio: 'First-generation graduate from Salem district. Passionate about mentoring students in software engineering careers and interview readiness.',
            linkedin_url: 'https://linkedin.com/in/senthil-mentor-eeetn',
            status: 'pending_review',
            review_note: null,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
          },
          {
            id: 'demo-mentor-id-2',
            profiles: { full_name: 'Dr. Priya Anbarasan', email: 'priya.medical@eeetn.org', avatar_url: null },
            headline: 'Assistant Professor of Pediatrics',
            organisation: 'Madras Medical College',
            expertise: ['Medicine', 'NEET Guidance', 'Government College Admissions'],
            years_of_experience: 12,
            qualifications: 'MBBS, MD (Pediatrics), DNB',
            languages: ['Tamil', 'English'],
            bio: 'Guiding rural government school students in medical admission procedures, NEET preparation strategy, and 7.5% preferential quota matching.',
            linkedin_url: 'https://linkedin.com/in/dr-priya-anbarasan',
            status: 'approved',
            review_note: 'Credentials verified with MMC alumni registry.',
            reviewed_by: 'demo-admin-id',
            reviewed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
          },
          {
            id: 'demo-mentor-id-3',
            profiles: { full_name: 'M. Anand Kumar', email: 'anand.civil@eeetn.org', avatar_url: null },
            headline: 'Assistant Executive Engineer & Civil Services Guide',
            organisation: 'Tamil Nadu Public Works Department (PWD)',
            expertise: ['Civil Services', 'TNPSC Guidance', 'Interview Preparation'],
            years_of_experience: 6,
            qualifications: 'B.E. Civil Engineering, M.E.',
            languages: ['Tamil', 'English'],
            bio: 'Mentoring TN students from rural backgrounds for TNPSC Combined Engineering and Group 1 examinations.',
            linkedin_url: 'https://linkedin.com/in/anand-pwd',
            status: 'needs_changes',
            review_note: 'Please provide official department verification document or working ID reference.',
            reviewed_by: 'demo-admin-id',
            reviewed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
          }
        ],
        error: null
      };
    }
  };

  // Review Mentor Profile (Approve or Reject with Note - Admin Only)
  const reviewMentorProfile = async (mentorId, newStatus, reviewNote = '') => {
    if (!user?.id) throw new Error('User not authenticated');

    const updatePayload = {
      status: newStatus,
      review_note: reviewNote?.trim() || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .update(updatePayload)
        .eq('id', mentorId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data: data || { id: mentorId, ...updatePayload }, error: null };
    } catch (err) {
      return { data: { id: mentorId, ...updatePayload }, error: null };
    }
  };

  const userRole = profile?.role || (user ? 'student' : null);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        studentDetails,
        isProfileComplete,
        userRole,
        loading,
        authError,
        profileNetworkError,
        retryFetchProfile,
        clearAuthError,
        showOnboardingModal,
        setShowOnboardingModal,
        signInWithGoogle,
        saveStudentDetails,
        requestDataDeletion,
        loginAsDemoRole,
        signOut,
        savedOpportunities,
        toggleSaveOpportunity,
        registeredSessions,
        registerSession,
        cancelSession,
        updateEmail,
        updatePassword,
        linkGoogleAccount,
        unlinkGoogleAccount,
        refreshUser,
        mentorDetails,
        adminDetails,
        saveMentorDetails,
        saveAdminDetails,
        fetchAdminMentors,
        reviewMentorProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
