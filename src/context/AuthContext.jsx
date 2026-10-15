import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { initialSessions } from '../data/appData';

const AuthContext = createContext();

const STORAGE_KEY_USER = 'eee_tn_simulated_user';
const STORAGE_KEY_SAVED = 'eee_tn_saved_opportunities';
const STORAGE_KEY_SESSIONS = 'eee_tn_registered_sessions';
const STORAGE_KEY_MENTOR_SESSIONS = 'eee_tn_mentor_sessions_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'eee_tn_achievements_v1';
const STORAGE_KEY_ADMIN_USERS = 'eee_tn_admin_users_v1';

const INITIAL_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    title_en: 'State-Level School Innovators Hackathon 2026: Dharmapuri Govt School Secures 1st Prize',
    title_ta: 'மாநில அளவிலான பள்ளி கண்டுபிடிப்பாளர் போட்டி 2026: தருமபுரி அரசு பள்ளி மாணவர்கள் முதலிடம்',
    description_en: 'Two Class 12 students from GHSS Pennagaram developed an automated solar-powered soil moisture and drip-irrigation system for drought-prone farming, winning the grand state trophy and ₹50,000 cash grant.',
    description_ta: 'பென்னாகரம் அரசு மாதிரி மேல்நிலைப் பள்ளி 12-ஆம் வகுப்பு மாணவர்கள் தானியங்கி சூரிய ஒளி சொட்டுநீர்ப் பாசனக் கருவியைக் கண்டுபிடித்து மாநில அளவில் முதலிடமும் ரூ. 50,000 ரொக்கப்பரிசும் வென்றனர்.',
    achievement_type: 'hackathon',
    event_date: '2026-06-18',
    school_name: 'GHSS Pennagaram',
    town: 'Dharmapuri',
    winners_text: 'Team AgriBot: S. Kaviya, M. Saravanan (Class 12). Mentored by EEE-TN Robotics Guild.',
    status: 'published',
    photo_consent_confirmed: true,
    created_by: 'demo-admin-id',
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-06-20T10:00:00Z',
    images: [
      {
        id: 'img-1',
        image_path: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
        caption: 'Team AgriBot receiving the state gold trophy from Higher Education dignitaries',
        sort_order: 1
      },
      {
        id: 'img-2',
        image_path: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        caption: 'Working prototype demonstration before panel of engineers and scientists',
        sort_order: 2
      }
    ]
  },
  {
    id: 'ach-2',
    title_en: '12 First-Generation Govt School Students Join Madras Medical College via 7.5% Quota',
    title_ta: '7.5% அரசு பள்ளி ஒதுக்கீட்டில் 12 மாணவர்கள் மெட்ராஸ் மருத்துவக் கல்லூரியில் சேர்க்கை',
    description_en: 'Through EEE-TN free document verification camps and NEET counseling guidance, 12 rural students from Ariyalur, Salem, and Madurai districts successfully secured 100% free MBBS admissions at MMC.',
    description_ta: 'EEE-TN ஆவண வழிகாட்டல் மற்றும் கலந்தாய்வு முகாம் மூலம் அரியலூர், சேலம், மதுரை மாவட்டங்களைச் சேர்ந்த 12 கிராமப்புற மாணவர்கள் 100% அரசு கட்டண விலக்கில் மெட்ராஸ் மருத்துவக் கல்லூரியில் MBBS இடம் பெற்றனர்.',
    achievement_type: 'award',
    event_date: '2026-07-02',
    school_name: 'Multiple Govt Higher Secondary Schools',
    town: 'Chennai MMC',
    winners_text: 'Facilitated by EEE-TN Free Medical Counseling & 7.5% Bonafide Verification Desk.',
    status: 'published',
    photo_consent_confirmed: true,
    created_by: 'demo-admin-id',
    created_at: '2026-07-03T11:00:00Z',
    updated_at: '2026-07-03T11:00:00Z',
    images: [
      {
        id: 'img-3',
        image_path: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
        caption: 'Orientation day celebration at Madras Medical College campus',
        sort_order: 1
      }
    ]
  },
  {
    id: 'ach-3',
    title_en: 'AI & Robotics Hands-on STEM Workshop for Rural Higher Secondary Students',
    title_ta: 'செயற்கை நுண்ணறிவு & ரோபாட்டிக்ஸ் பயிற்சி பட்டறை - திருச்சி',
    description_en: 'Comprehensive 3-day hardware and coding workshop conducted for 65 government school students in Tiruchirappalli district, introducing Arduino microcontrollers and sensor programming.',
    description_ta: 'திருச்சி மாவட்ட அரசுப் பள்ளி மாணவர்களுக்கு 3 நாள் இலவச செயற்கை நுண்ணறிவு மற்றும் மைக்ரோகன்ட்ரோலர் ரோபாட்டிக்ஸ் நேரடி செய்முறைப் பயிற்சி முகாம்.',
    achievement_type: 'workshop',
    event_date: '2026-08-10',
    school_name: 'Govt Boys Higher Secondary School',
    town: 'Tiruchirappalli',
    winners_text: '65 students successfully deployed smart home and automation mini-projects.',
    status: 'published',
    photo_consent_confirmed: true,
    created_by: 'demo-admin-id',
    created_at: '2026-08-12T09:00:00Z',
    updated_at: '2026-08-12T09:00:00Z',
    images: [
      {
        id: 'img-4',
        image_path: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
        caption: 'Students assembling sensor modules and programming logic on microcontrollers',
        sort_order: 1
      }
    ]
  },
  {
    id: 'ach-4',
    title_en: 'Tirunelveli Rural Science Exhibition Best Innovation Award (Draft)',
    title_ta: 'திருநெல்வேலி கிராமப்புற அறிவியல் கண்காட்சி சிறந்த கண்டுபிடிப்பு விருது (வரைவு)',
    description_en: 'Draft showcase: Awaiting parental photo consent submission before public release.',
    description_ta: 'வரைவுப் பதிவு: பெற்றோரின் புகைப்பட ஒப்புதல் படிவம் பெற்றபின் பொதுவில் வெளியிடப்படும்.',
    achievement_type: 'award',
    event_date: '2026-09-05',
    school_name: 'Govt Model HSS',
    town: 'Tirunelveli',
    winners_text: 'R. Kamesh and Team.',
    status: 'draft',
    photo_consent_confirmed: false,
    created_by: 'demo-admin-id',
    created_at: '2026-09-06T14:00:00Z',
    updated_at: '2026-09-06T14:00:00Z',
    images: []
  }
];

const INITIAL_ADMIN_USERS = [
  {
    id: 'demo-admin-id',
    full_name: 'EEE-TN Platform Administrator',
    email: 'director.admin@eeetn.org',
    role: 'admin',
    created_at: '2026-05-10T08:00:00Z'
  },
  {
    id: 'demo-mentor-id',
    full_name: 'Er. K. Senthil Nathan',
    email: 'senthil.mentor@eeetn.org',
    role: 'mentor',
    created_at: '2026-06-01T09:30:00Z'
  },
  {
    id: 'mentor-priya-id',
    full_name: 'Dr. Priya Anbarasan',
    email: 'priya.medical@eeetn.org',
    role: 'mentor',
    created_at: '2026-06-15T11:00:00Z'
  },
  {
    id: 'demo-student-id',
    full_name: 'K. Muthu Kumar',
    email: 'muthu.student@eeetn.org',
    role: 'student',
    created_at: '2026-07-01T10:15:00Z'
  },
  {
    id: 'stu-anitha-id',
    full_name: 'S. Anitha',
    email: 'anitha.new@eeetn.org',
    role: 'student',
    created_at: '2026-07-04T12:00:00Z'
  }
];

const INITIAL_MENTOR_SESSIONS = [
  {
    id: 'sess-101',
    mentor_id: 'demo-mentor-id',
    mentor_name: 'Er. K. Senthil Nathan',
    mentor_headline: 'Senior Lead Systems Engineer @ Zoho Corporation',
    title_en: 'TNEA Counseling 2026: Strategy for Top 50 Engineering Colleges',
    title_ta: 'TNEA கலந்தாய்வு 2026: சிறந்த 50 பொறியியல் கல்லூரிகளைத் தேர்ந்தெடுப்பது எப்படி?',
    description_en: 'Complete walkthrough on branch vs college selection, single-window counselling rank trends, and first-generation graduate waiver claims.',
    description_ta: 'கல்லூரி vs படிப்பு முன்னுரிமை, ஒற்றைச் சாளர கலந்தாய்வு இட ஒதுக்கீடு மற்றும் முதல் பட்டதாரி சலுகை குறித்த நேரலை வழிகாட்டல்.',
    topic: 'Engineering & TNEA',
    target_audience: 'Both',
    language: 'Tamil & English',
    session_date: '2026-10-25',
    start_time: '10:00',
    end_time: '11:30',
    mode: 'online',
    capacity: 100,
    price_inr: 0,
    status: 'approved',
    admin_note: 'Verified credentials and approved for Class 11 & 12 students across Tamil Nadu.',
    reviewed_by: 'demo-admin-id',
    reviewed_at: '2026-07-01T10:00:00Z',
    created_at: '2026-06-25T08:00:00Z',
    updated_at: '2026-07-01T10:00:00Z',
    meeting_link: 'https://meet.google.com/eee-tnea-2026',
    registrations: [
      { id: 'reg-1', student_id: 'demo-student-id', student_name: 'K. Muthu Kumar', status: 'registered', payment_status: 'not_required', registered_at: '2026-07-02T09:15:00Z' },
      { id: 'reg-2', student_id: 'stu-2', student_name: 'S. Anitha', status: 'registered', payment_status: 'not_required', registered_at: '2026-07-03T11:30:00Z' },
      { id: 'reg-3', student_id: 'stu-3', student_name: 'R. Karthikeyan', status: 'registered', payment_status: 'not_required', registered_at: '2026-07-04T14:20:00Z' }
    ]
  },
  {
    id: 'sess-102',
    mentor_id: 'demo-mentor-id',
    mentor_name: 'Er. K. Senthil Nathan',
    mentor_headline: 'Senior Lead Systems Engineer @ Zoho Corporation',
    title_en: 'Software Engineering Careers & Tech Company Interview Guidance',
    title_ta: 'மென்பொருள் பொறியியல் & தயாரிப்பு நிறுவன நேர்காணல் வழிகாட்டல்',
    description_en: 'Roadmap for students from non-metro TN towns to build strong programming foundations, prepare for campus placements, and crack product interviews.',
    description_ta: 'கிராமப்புற மற்றும் சிறுநகர மாணவர்கள் நிரலாக்கம் (Coding) கற்று தயாரிப்பு நிறுவனங்களில் அதிக ஊதிய வேலைவாய்ப்பு பெறுவதற்கான வழிகாட்டி.',
    topic: 'Software & IT Careers',
    target_audience: 'Class 12',
    language: 'Tamil',
    session_date: '2026-10-30',
    start_time: '16:00',
    end_time: '17:30',
    mode: 'online',
    capacity: 80,
    price_inr: 0,
    status: 'pending',
    admin_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-07-05T09:00:00Z',
    updated_at: '2026-07-05T09:00:00Z',
    meeting_link: 'https://meet.google.com/eee-soft-career',
    registrations: []
  },
  {
    id: 'sess-103',
    mentor_id: 'demo-mentor-id',
    mentor_name: 'Er. K. Senthil Nathan',
    mentor_headline: 'Senior Lead Systems Engineer @ Zoho Corporation',
    title_en: 'GATE Preparation & Higher Education Scholarships Abroad',
    title_ta: 'GATE தேர்வு தயாரிப்பு மற்றும் வெளிநாட்டு உயர்கல்வி உதவித்தொகைகள்',
    description_en: 'Guidance on Master degrees in IITs/IISc, stipend opportunities, and international fully-funded scholarships for Tamil Nadu graduates.',
    description_ta: 'ஐஐடி / என்ஐடி-ல் எம்.இ/எம்.டெக் படிப்பதற்கான கேட் தேர்வு தயாரிப்பு மற்றும் உதவித்தொகைகள்.',
    topic: 'Higher Education Abroad',
    target_audience: 'Both',
    language: 'English',
    session_date: '2026-11-05',
    start_time: '18:00',
    end_time: '19:00',
    mode: 'online',
    capacity: 50,
    price_inr: 0,
    status: 'draft',
    admin_note: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-07-08T12:00:00Z',
    updated_at: '2026-07-08T12:00:00Z',
    meeting_link: 'https://meet.google.com/eee-gate-scholar',
    registrations: []
  },
  {
    id: 'sess-104',
    mentor_id: 'demo-mentor-id',
    mentor_name: 'Er. K. Senthil Nathan',
    mentor_headline: 'Senior Lead Systems Engineer @ Zoho Corporation',
    title_en: 'Government College Lateral Entry & Diploma Student Roadmap',
    title_ta: 'டிப்ளமோ மாணவர்களுக்கான அரசு பொறியியல் கல்லூரி நேரடி சேர்க்கை',
    description_en: 'Detailed advice on direct 2nd-year B.E admission, cutoffs for government engineering colleges, and syllabus transition.',
    description_ta: 'டிப்ளமோ முடித்த மாணவர்களுக்கான அண்ணா பல்கலைக்கழக நேரடி இரண்டாம் ஆண்டு சேர்க்கை வழிகாட்டி.',
    topic: 'Engineering & TNEA',
    target_audience: 'Class 12',
    language: 'Tamil',
    session_date: '2026-11-12',
    start_time: '11:00',
    end_time: '12:30',
    mode: 'online',
    capacity: 60,
    price_inr: 0,
    status: 'needs_changes',
    admin_note: 'Please provide more details on syllabus bridge course resources for polytechnic students.',
    reviewed_by: 'demo-admin-id',
    reviewed_at: '2026-07-10T15:30:00Z',
    created_at: '2026-07-09T10:00:00Z',
    updated_at: '2026-07-10T15:30:00Z',
    meeting_link: 'https://meet.google.com/eee-lateral-entry',
    registrations: []
  }
];

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
      return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSIONS) || '["tnea-choice-filling", "sess-101"]');
    } catch {
      return ['tnea-choice-filling', 'sess-101'];
    }
  });

  const [mentorSessions, setMentorSessions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
      return stored ? JSON.parse(stored) : INITIAL_MENTOR_SESSIONS;
    } catch {
      return INITIAL_MENTOR_SESSIONS;
    }
  });

  const [achievements, setAchievements] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      return stored ? JSON.parse(stored) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  const [adminUsers, setAdminUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
      return stored ? JSON.parse(stored) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
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

  // --------------------------------------------------------------------------
  // Phase 3: Session Operations for Mentors & Students
  // --------------------------------------------------------------------------

  // Fetch mentor sessions (checks Supabase, falls back to state/localStorage)
  const fetchMentorSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, session_links(meeting_link)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const formatted = data.map((s) => ({
          ...s,
          meeting_link: s.session_links?.meeting_link || '',
          registrations: s.registrations || []
        }));
        setMentorSessions(formatted);
        localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(formatted));
        return { data: formatted, error: null };
      }
    } catch {
      // Fallback to active state
    }
    return { data: mentorSessions, error: null };
  };

  // Create Mentor Session
  const createMentorSession = async (formData, meetingLink, submitForApproval = false) => {
    if (!user?.id) throw new Error('User not authenticated');

    // Rule: If mentor_profiles exists, mentor can only submit for approval if profile status is 'approved'
    if (submitForApproval && mentorDetails && mentorDetails.status !== 'approved') {
      return {
        data: null,
        error: new Error(
          'Your mentor profile must be approved by an administrator before submitting sessions for review. Please complete and submit your profile in My Profile first.'
        )
      };
    }

    const nextStatus = submitForApproval ? 'pending' : 'draft';
    const newId = `sess-${Date.now()}`;

    const newSession = {
      id: newId,
      mentor_id: user.id,
      mentor_name: profile?.full_name || user?.user_metadata?.full_name || 'Mentor',
      mentor_headline: mentorDetails?.headline || profile?.designation || 'Career Mentor',
      title_en: formData.title_en?.trim(),
      title_ta: formData.title_ta?.trim() || null,
      description_en: formData.description_en?.trim(),
      description_ta: formData.description_ta?.trim() || null,
      topic: formData.topic || 'Engineering & TNEA',
      target_audience: formData.target_audience || 'Both',
      language: formData.language || 'Tamil & English',
      session_date: formData.session_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      mode: formData.mode || 'online',
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      price_inr: formData.price_inr !== undefined && formData.price_inr !== '' ? parseFloat(formData.price_inr) : 0,
      status: nextStatus,
      admin_note: null,
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meeting_link: meetingLink?.trim() || '',
      registrations: []
    };

    try {
      await supabase.from('sessions').insert({
        id: newSession.id,
        mentor_id: user.id,
        title_en: newSession.title_en,
        title_ta: newSession.title_ta,
        description_en: newSession.description_en,
        description_ta: newSession.description_ta,
        topic: newSession.topic,
        target_audience: newSession.target_audience,
        language: newSession.language,
        session_date: newSession.session_date,
        start_time: newSession.start_time,
        end_time: newSession.end_time,
        mode: newSession.mode,
        capacity: newSession.capacity,
        price_inr: newSession.price_inr,
        status: newSession.status
      });

      if (meetingLink?.trim()) {
        await supabase.from('session_links').upsert({
          session_id: newSession.id,
          meeting_link: meetingLink.trim()
        });
      }
    } catch {
      // Offline fallback
    }

    setMentorSessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    return { data: newSession, error: null };
  };

  // Update Mentor Session
  const updateMentorSession = async (sessionId, formData, meetingLink) => {
    if (!user?.id) throw new Error('User not authenticated');

    const existing = mentorSessions.find((s) => s.id === sessionId);
    if (!existing) throw new Error('Session not found');

    // Rule: If editing key fields on an APPROVED session, automatically revert to 'pending'
    let nextStatus = existing.status;
    const keyFieldsChanged =
      (formData.title_en?.trim() || '') !== (existing.title_en || '') ||
      (formData.title_ta?.trim() || '') !== (existing.title_ta || '') ||
      (formData.description_en?.trim() || '') !== (existing.description_en || '') ||
      (formData.description_ta?.trim() || '') !== (existing.description_ta || '') ||
      formData.session_date !== existing.session_date ||
      formData.start_time !== existing.start_time ||
      formData.end_time !== existing.end_time ||
      parseFloat(formData.price_inr || 0) !== parseFloat(existing.price_inr || 0) ||
      (formData.capacity ? parseInt(formData.capacity, 10) : null) !== (existing.capacity || null);

    if (existing.status === 'approved' && keyFieldsChanged) {
      nextStatus = 'pending';
    }

    const updatedSession = {
      ...existing,
      title_en: formData.title_en?.trim() || existing.title_en,
      title_ta: formData.title_ta?.trim() || existing.title_ta,
      description_en: formData.description_en?.trim() || existing.description_en,
      description_ta: formData.description_ta?.trim() || existing.description_ta,
      topic: formData.topic || existing.topic,
      target_audience: formData.target_audience || existing.target_audience,
      language: formData.language || existing.language,
      session_date: formData.session_date || existing.session_date,
      start_time: formData.start_time || existing.start_time,
      end_time: formData.end_time || existing.end_time,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : existing.capacity,
      price_inr: formData.price_inr !== undefined && formData.price_inr !== '' ? parseFloat(formData.price_inr) : existing.price_inr,
      status: nextStatus,
      meeting_link: meetingLink !== undefined ? meetingLink.trim() : existing.meeting_link,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('sessions').update({
        title_en: updatedSession.title_en,
        title_ta: updatedSession.title_ta,
        description_en: updatedSession.description_en,
        description_ta: updatedSession.description_ta,
        topic: updatedSession.topic,
        target_audience: updatedSession.target_audience,
        language: updatedSession.language,
        session_date: updatedSession.session_date,
        start_time: updatedSession.start_time,
        end_time: updatedSession.end_time,
        capacity: updatedSession.capacity,
        price_inr: updatedSession.price_inr,
        status: updatedSession.status,
        updated_at: updatedSession.updated_at
      }).eq('id', sessionId);

      if (meetingLink?.trim()) {
        await supabase.from('session_links').upsert({
          session_id: sessionId,
          meeting_link: meetingLink.trim(),
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Offline fallback
    }

    setMentorSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? updatedSession : s));
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    return {
      data: updatedSession,
      revertedToPending: existing.status === 'approved' && nextStatus === 'pending',
      error: null
    };
  };

  // Cancel Mentor Session
  const cancelMentorSession = async (sessionId) => {
    try {
      await supabase.from('sessions').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', sessionId);
    } catch {
      // Offline fallback
    }

    setMentorSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s));
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch Session Registrations for Mentors (Privacy Shield enforced: names only)
  const fetchSessionRegistrations = async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('mentor_session_registrations_view')
        .select('*')
        .eq('session_id', sessionId);

      if (error) throw error;
      if (data && data.length > 0) return { data, error: null };
    } catch {
      // Fallback
    }

    const session = mentorSessions.find((s) => s.id === sessionId);
    return { data: session?.registrations || [], error: null };
  };

  // Fetch Approved Upcoming Sessions for Students
  const fetchApprovedSessions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('sessions')
        .select('*, profiles:mentor_id(full_name, avatar_url), session_links(meeting_link)')
        .eq('status', 'approved')
        .gte('session_date', today)
        .order('session_date', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return { data, error: null };
      }
    } catch {
      // Fallback
    }

    // Merge approved mentor sessions with initial catalog guidance sessions
    const today = new Date().toISOString().split('T')[0];
    const approvedFromMentor = mentorSessions.filter(
      (s) => s.status === 'approved' && (!s.session_date || s.session_date >= today)
    );
    const combined = [...approvedFromMentor];
    initialSessions.forEach((initSess) => {
      if (!combined.some((c) => c.id === initSess.id)) {
        combined.push({
          ...initSess,
          status: 'approved',
          session_date: initSess.date,
          price_inr: initSess.price || 0,
          capacity: initSess.seats_total || 100,
          topic: initSess.topics_en?.[0] ? initSess.title_en.split(':')[0] : 'Career Guidance',
          meeting_link: 'https://meet.google.com/eee-tn-live'
        });
      }
    });
    return { data: combined, error: null };
  };

  // Register for a session (Student)
  const registerForSession = async (sessionId, sessionObj = null) => {
    const studentName = profile?.full_name || studentDetails?.full_name || user?.user_metadata?.full_name || 'TN Student';
    const regItem = {
      id: `reg-${Date.now()}`,
      student_id: user?.id || 'demo-student-id',
      student_name: studentName,
      status: 'registered',
      payment_status: (sessionObj?.price_inr || sessionObj?.price) > 0 ? 'pending' : 'not_required',
      registered_at: new Date().toISOString()
    };

    try {
      await supabase.from('session_registrations').insert({
        session_id: sessionId,
        student_id: user?.id,
        status: 'registered',
        payment_status: regItem.payment_status
      });
    } catch {
      // Fallback
    }

    // Update registeredSessions
    setRegisteredSessions((prev) => {
      if (prev.includes(sessionId)) return prev;
      const updated = [...prev, sessionId];
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    // Update registrations array in mentorSessions if present
    setMentorSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          const currentRegs = s.registrations || [];
          if (!currentRegs.some((r) => r.student_id === (user?.id || 'demo-student-id'))) {
            return {
              ...s,
              registrations: [...currentRegs, regItem]
            };
          }
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  // Cancel student registration
  const cancelStudentRegistration = async (sessionId) => {
    try {
      await supabase.from('session_registrations').update({ status: 'cancelled' }).match({
        session_id: sessionId,
        student_id: user?.id
      });
    } catch {
      // Fallback
    }

    setRegisteredSessions((prev) => {
      const updated = prev.filter((id) => id !== sessionId);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    setMentorSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            registrations: (s.registrations || []).filter((r) => r.student_id !== (user?.id || 'demo-student-id'))
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });
  };

  // ==========================================
  // PHASE 4: ACHIEVEMENTS METHODS
  // ==========================================

  // Fetch Achievements (Public or Admin)
  const fetchAchievements = async (onlyPublished = false) => {
    try {
      let query = supabase
        .from('achievements')
        .select('*, achievement_images(*)');
      if (onlyPublished) {
        query = query.eq('status', 'published');
      }
      query = query.order('event_date', { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        const normalized = data.map((item) => ({
          ...item,
          images: (item.achievement_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        }));
        return { data: normalized, error: null };
      }
    } catch {
      // Offline fallback
    }

    const list = onlyPublished
      ? achievements.filter((a) => a.status === 'published')
      : achievements;
    return { data: list, error: null };
  };

  // Create or Update Achievement (Admin Only)
  const adminSaveAchievement = async (achievementData, imagesList = []) => {
    if (achievementData.status === 'published' && !achievementData.photo_consent_confirmed) {
      throw new Error('Photo consent confirmation is strictly mandatory to publish an achievement.');
    }

    const isEdit = Boolean(achievementData.id);
    const achievementId = achievementData.id || `ach-${Date.now()}`;
    const payload = {
      ...achievementData,
      id: achievementId,
      created_by: achievementData.created_by || user?.id || 'demo-admin-id',
      created_at: achievementData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: imagesList.map((img, idx) => ({
        id: img.id || `img-${Date.now()}-${idx}`,
        image_path: img.image_path || img.url || '',
        caption: img.caption || '',
        sort_order: img.sort_order !== undefined ? img.sort_order : idx + 1
      }))
    };

    try {
      await supabase.from('achievements').upsert({
        id: payload.id,
        title_en: payload.title_en,
        title_ta: payload.title_ta,
        description_en: payload.description_en,
        description_ta: payload.description_ta,
        achievement_type: payload.achievement_type,
        event_date: payload.event_date,
        school_name: payload.school_name,
        town: payload.town,
        winners_text: payload.winners_text,
        status: payload.status,
        photo_consent_confirmed: payload.photo_consent_confirmed,
        created_by: payload.created_by,
        updated_at: payload.updated_at
      });

      if (payload.images?.length > 0) {
        await supabase.from('achievement_images').delete().eq('achievement_id', payload.id);
        await supabase.from('achievement_images').insert(
          payload.images.map((img) => ({
            achievement_id: payload.id,
            image_path: img.image_path,
            caption: img.caption,
            sort_order: img.sort_order
          }))
        );
      }
    } catch {
      // Offline fallback
    }

    setAchievements((prev) => {
      let updated;
      if (isEdit) {
        updated = prev.map((a) => (a.id === achievementId ? payload : a));
      } else {
        updated = [payload, ...prev];
      }
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(updated));
      return updated;
    });

    return { data: payload, error: null };
  };

  // Delete Achievement (Admin Only)
  const adminDeleteAchievement = async (achievementId) => {
    try {
      await supabase.from('achievement_images').delete().eq('achievement_id', achievementId);
      await supabase.from('achievements').delete().eq('id', achievementId);
    } catch {}

    setAchievements((prev) => {
      const updated = prev.filter((a) => a.id !== achievementId);
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  // Toggle Publish Status with Photo Consent Guard (Admin Only)
  const adminTogglePublishAchievement = async (achievementId, targetStatus, photoConsent) => {
    if (targetStatus === 'published' && !photoConsent) {
      throw new Error('Parental photo consent confirmation is strictly mandatory to publish an achievement.');
    }

    try {
      await supabase
        .from('achievements')
        .update({
          status: targetStatus,
          photo_consent_confirmed: photoConsent,
          updated_at: new Date().toISOString()
        })
        .eq('id', achievementId);
    } catch {}

    setAchievements((prev) => {
      const updated = prev.map((a) =>
        a.id === achievementId
          ? { ...a, status: targetStatus, photo_consent_confirmed: photoConsent, updated_at: new Date().toISOString() }
          : a
      );
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(updated));
      return updated;
    });
    return { success: true };
  };

  // Upload Achievement Image to Storage (Admin Only)
  const uploadAchievementImage = async (file) => {
    if (!file) throw new Error('No file provided');
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files (JPEG, PNG, WebP) are permitted.');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Image size must be 2MB or less.');
    }

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `achievements/${fileName}`;

      const { data, error } = await supabase.storage
        .from('achievement-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (!error && data?.path) {
        const { data: pubData } = supabase.storage.from('achievement-images').getPublicUrl(data.path);
        if (pubData?.publicUrl) {
          return { url: pubData.publicUrl, path: data.path, error: null };
        }
      }
    } catch {
      // Offline fallback
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result, path: `local-${file.name}`, error: null });
      reader.onerror = () => resolve({ url: URL.createObjectURL(file), path: `local-${file.name}`, error: null });
      reader.readAsDataURL(file);
    });
  };

  // ==========================================
  // PHASE 4: ADMIN SESSIONS REVIEW & MUTATION
  // ==========================================

  // Admin Fetch All Sessions
  const adminFetchAllSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, profiles:mentor_id(full_name, avatar_url, email), session_links(meeting_link), session_registrations(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return { data, error: null };
      }
    } catch {}

    return { data: mentorSessions, error: null };
  };

  // Admin Edit Any Session Field
  const adminUpdateSession = async (sessionId, sessionFields, meetingLink) => {
    const payload = {
      ...sessionFields,
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('sessions').update(payload).eq('id', sessionId);
      if (meetingLink !== undefined) {
        await supabase.from('session_links').upsert({
          session_id: sessionId,
          meeting_link: meetingLink?.trim() || '',
          updated_at: new Date().toISOString()
        });
      }
    } catch {}

    setMentorSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            ...payload,
            meeting_link: meetingLink !== undefined ? meetingLink.trim() : s.meeting_link
          };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  // Admin Review Session (Approve, Reject with Note, Cancel, Complete)
  const adminReviewSession = async (sessionId, status, adminNote = '') => {
    const updatePayload = {
      status,
      admin_note: adminNote?.trim() || null,
      reviewed_by: user?.id || 'demo-admin-id',
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('sessions').update(updatePayload).eq('id', sessionId);
    } catch {}

    setMentorSessions((prev) => {
      const updated = prev.map((s) => (s.id === sessionId ? { ...s, ...updatePayload } : s));
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  // Admin Update Registration Payment Status (Paid / Pending)
  const adminUpdateRegistrationPayment = async (sessionId, registrationId, newPaymentStatus) => {
    try {
      await supabase
        .from('session_registrations')
        .update({ payment_status: newPaymentStatus })
        .eq('id', registrationId);
    } catch {}

    setMentorSessions((prev) => {
      const updated = prev.map((s) => {
        if (s.id === sessionId) {
          const regs = (s.registrations || []).map((r) =>
            r.id === registrationId ? { ...r, payment_status: newPaymentStatus } : r
          );
          return { ...s, registrations: regs };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  // ==========================================
  // PHASE 4: ADMIN USERS & ROLE MANAGEMENT
  // ==========================================

  // Fetch Users (Privacy Shield enforced: only basic account info, no marks/income/phone)
  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return { data, error: null };
      }
    } catch {}

    return { data: adminUsers, error: null };
  };

  // Admin Set User Role via Security-Definer function admin_set_role
  const adminSetUserRole = async (targetUserId, newRole) => {
    const callerId = user?.id || 'demo-admin-id';
    if (targetUserId === callerId) {
      throw new Error('Security Policy: You cannot modify your own administrative role.');
    }

    const currentTarget = adminUsers.find((u) => u.id === targetUserId);
    if (currentTarget?.role === 'admin' && newRole !== 'admin') {
      const remainingAdmins = adminUsers.filter((u) => u.id !== targetUserId && u.role === 'admin');
      if (remainingAdmins.length === 0) {
        throw new Error('Security Policy: Cannot demote or remove the last remaining administrator.');
      }
    }

    try {
      const { error } = await supabase.rpc('admin_set_role', {
        target_user: targetUserId,
        new_role: newRole
      });
      if (error) throw error;
    } catch {
      // Offline fallback
    }

    setAdminUsers((prev) => {
      const updated = prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u));
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updated));
      return updated;
    });

    return { success: true };
  };

  // Admin Dashboard Aggregate Statistics
  const fetchAdminDashboardStats = async () => {
    let pendingSessionsCount = 0;
    let pendingMentorsCount = 0;
    let publishedAchievementsCount = 0;
    let pendingPaymentsCount = 0;
    let totalUsersCount = 0;

    try {
      const sessRes = await supabase.from('sessions').select('id, status');
      if (sessRes.data) {
        pendingSessionsCount = sessRes.data.filter((s) => s.status === 'pending').length;
      }

      const mentorRes = await supabase.from('mentor_profiles').select('id, status');
      if (mentorRes.data) {
        pendingMentorsCount = mentorRes.data.filter((m) => m.status === 'pending_review').length;
      }

      const achRes = await supabase.from('achievements').select('id, status');
      if (achRes.data) {
        publishedAchievementsCount = achRes.data.filter((a) => a.status === 'published').length;
      }

      const regRes = await supabase.from('session_registrations').select('id, payment_status');
      if (regRes.data) {
        pendingPaymentsCount = regRes.data.filter((r) => r.payment_status === 'pending').length;
      }

      const profRes = await supabase.from('profiles').select('id');
      if (profRes.data) {
        totalUsersCount = profRes.data.length;
      }
    } catch {}

    if (pendingSessionsCount === 0) {
      pendingSessionsCount = mentorSessions.filter((s) => s.status === 'pending').length;
    }
    if (publishedAchievementsCount === 0) {
      publishedAchievementsCount = achievements.filter((a) => a.status === 'published').length;
    }
    if (pendingPaymentsCount === 0) {
      pendingPaymentsCount = mentorSessions.reduce((acc, s) => {
        return acc + (s.registrations || []).filter((r) => r.payment_status === 'pending').length;
      }, 0);
    }
    if (totalUsersCount === 0) {
      totalUsersCount = adminUsers.length;
    }
    if (pendingMentorsCount === 0) {
      const mentorsRes = await fetchAdminMentors();
      pendingMentorsCount = (mentorsRes.data || []).filter((m) => m.status === 'pending_review').length;
    }

    return {
      pendingSessionsCount,
      pendingMentorsCount,
      publishedAchievementsCount,
      pendingPaymentsCount,
      totalUsersCount
    };
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
        reviewMentorProfile,
        mentorSessions,
        fetchMentorSessions,
        createMentorSession,
        updateMentorSession,
        cancelMentorSession,
        fetchSessionRegistrations,
        fetchApprovedSessions,
        registerForSession,
        cancelStudentRegistration,
        achievements,
        fetchAchievements,
        adminSaveAchievement,
        adminDeleteAchievement,
        adminTogglePublishAchievement,
        uploadAchievementImage,
        adminFetchAllSessions,
        adminUpdateSession,
        adminReviewSession,
        adminUpdateRegistrationPayment,
        adminUsers,
        fetchAdminUsers,
        adminSetUserRole,
        fetchAdminDashboardStats
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
