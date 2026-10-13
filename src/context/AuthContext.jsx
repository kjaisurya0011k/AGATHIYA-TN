import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

const STORAGE_KEY_USER = 'eee_tn_simulated_user';
const STORAGE_KEY_SAVED = 'eee_tn_saved_opportunities';
const STORAGE_KEY_SESSIONS = 'eee_tn_registered_sessions';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  // Load session on startup
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        // First check Supabase live session if available
        if (supabase && typeof supabase.auth?.getSession === 'function') {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await fetchOrInitProfile(session.user);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[EEE-TN Auth] Live Supabase session check:', err?.message || err);
      }

      // Check simulated local session (useful for offline preview and role testing)
      try {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored && mounted) {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      } catch {
        // ignore
      }

      if (mounted) setLoading(false);
    }

    initSession();

    // Listen to Supabase auth changes
    const { data: authListener } = supabase?.auth?.onAuthStateChange?.(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchOrInitProfile(session.user);
      } else {
        // If not using simulated user
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (!stored) {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    }) || { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Fetch or create profile using Supabase or fallback
  async function fetchOrInitProfile(authUser) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data && !error) {
        setProfile(data);
        return;
      }

      // If profile does not exist yet, attempt to insert initial record
      if (error && error.code === 'PGRST116') {
        const initialProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'TN Student',
          role: 'student',
          district: 'Madurai',
          school_type: 'Government School'
        };

        const { data: created, error: insertError } = await supabase
          .from('profiles')
          .insert([initialProfile])
          .select()
          .single();

        if (created && !insertError) {
          setProfile(created);
          return;
        }
      }
    } catch (e) {
      console.warn('[EEE-TN Auth] Profile query note:', e?.message || e);
    }

    // Default fallback profile
    const defaultProfile = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || 'K. Muthu Kumar',
      role: 'student',
      district: 'Dharmapuri',
      school_type: 'Government Model School'
    };
    setProfile(defaultProfile);
  }

  // Google OAuth sign-in via Supabase
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.warn('[EEE-TN Auth] Google OAuth notice:', err.message);
      return { success: false, error: err };
    }
  };

  // One-click demo role switcher for testing all 3 user roles
  const loginAsDemoRole = (roleType = 'student') => {
    const demoConfigs = {
      student: {
        user: { id: 'demo-student-id', email: 'muthu.student@eeetn.org' },
        profile: {
          id: 'demo-student-id',
          email: 'muthu.student@eeetn.org',
          full_name: 'K. Muthu Kumar',
          role: 'student',
          district: 'Dharmapuri',
          school_type: 'Government Higher Secondary School',
          stream_12th: 'Biology-Maths (+2)',
          cutoff_marks: 182.5,
          is_first_graduate: true,
          is_7point5_eligible: true
        }
      },
      mentor: {
        user: { id: 'demo-mentor-id', email: 'senthil.mentor@eeetn.org' },
        profile: {
          id: 'demo-mentor-id',
          email: 'senthil.mentor@eeetn.org',
          full_name: 'Er. K. Senthil Nathan',
          role: 'mentor',
          district: 'Chennai / Coimbatore',
          designation: 'Senior Lead Engineer & Career Mentor',
          expertise: ['TNEA Engineering Counseling', 'Anna University', 'Software Careers'],
          rating: 4.9,
          sessions_conducted: 14
        }
      },
      admin: {
        user: { id: 'demo-admin-id', email: 'director.admin@eeetn.org' },
        profile: {
          id: 'demo-admin-id',
          email: 'director.admin@eeetn.org',
          full_name: 'EEE-TN Platform Administrator',
          role: 'admin',
          district: 'State Operations - Tamil Nadu',
          verified: true
        }
      }
    };

    const selected = demoConfigs[roleType] || demoConfigs.student;
    setUser(selected.user);
    setProfile(selected.profile);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(selected));
  };

  const signOut = async () => {
    try {
      await supabase.auth?.signOut?.();
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
    setProfile(null);
  };

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

  const userRole = profile?.role || (user ? 'student' : null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        userRole,
        loading,
        signInWithGoogle,
        loginAsDemoRole,
        signOut,
        savedOpportunities,
        toggleSaveOpportunity,
        registeredSessions,
        registerSession,
        cancelSession
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
