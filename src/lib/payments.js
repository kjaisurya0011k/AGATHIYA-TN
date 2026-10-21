import { supabase } from './supabase';

const STORAGE_KEY_PAYMENTS = 'agathiya_session_payments';
const STORAGE_KEY_MENTOR_SESSIONS = 'eee_tn_mentor_sessions';
const STORAGE_KEY_SESSIONS = 'eee_tn_registered_sessions';

/**
 * Get local payment status for a session.
 * Possible returns: 'none' | 'pending_verification' | 'paid' | 'rejected'
 */
export function getPaymentStatus(sessionId, userId) {
  if (!sessionId) return 'none';

  // 1. Check local session payments store
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[sessionId]) {
        return parsed[sessionId];
      }
    }
  } catch (e) {
    console.warn('[Payments] Error reading payment storage:', e);
  }

  // 2. Check mentorSessions registrations cache
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    if (rawSessions) {
      const sessions = JSON.parse(rawSessions);
      const sess = sessions.find((s) => s.id === sessionId);
      if (sess && Array.isArray(sess.registrations)) {
        const reg = sess.registrations.find(
          (r) => (userId && r.student_id === userId) || r.student_id === 'demo-student-id'
        );
        if (reg?.payment_status) {
          return reg.payment_status;
        }
      }
    }
  } catch (e) {
    console.warn('[Payments] Error reading mentor sessions cache:', e);
  }

  return 'none';
}

/**
 * Save student payment submission as pending_verification
 */
export async function submitStudentPayment({ sessionId, user, profile, sessionObj }) {
  const studentId = user?.id || 'demo-student-id';
  const studentName =
    profile?.full_name || user?.user_metadata?.full_name || 'TN Student';
  const studentEmail = user?.email || 'student@agathiya.org';

  // 1. Store in agathiya_session_payments
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    existing[sessionId] = 'pending_verification';
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(existing));
  } catch (e) {
    console.warn('[Payments] Error updating agathiya_session_payments:', e);
  }

  // 2. Ensure registered in registeredSessions list
  try {
    const regSessionsRaw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    const regSessions = regSessionsRaw ? JSON.parse(regSessionsRaw) : [];
    if (!regSessions.includes(sessionId)) {
      regSessions.push(sessionId);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(regSessions));
    }
  } catch (e) {
    console.warn('[Payments] Error updating registeredSessions:', e);
  }

  // 3. Update mentorSessions registration in localStorage
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    let sessions = rawSessions ? JSON.parse(rawSessions) : [];
    let sessionFound = false;

    sessions = sessions.map((s) => {
      if (s.id === sessionId) {
        sessionFound = true;
        const registrations = Array.isArray(s.registrations) ? [...s.registrations] : [];
        const existingRegIdx = registrations.findIndex(
          (r) => r.student_id === studentId || (user?.email && r.email === user.email)
        );

        const updatedReg = {
          id: existingRegIdx >= 0 ? registrations[existingRegIdx].id : `reg-${Date.now()}`,
          session_id: sessionId,
          student_id: studentId,
          student_name: studentName,
          email: studentEmail,
          status: 'registered',
          payment_status: 'pending_verification',
          registered_at: new Date().toISOString()
        };

        if (existingRegIdx >= 0) {
          registrations[existingRegIdx] = { ...registrations[existingRegIdx], ...updatedReg };
        } else {
          registrations.push(updatedReg);
        }

        return { ...s, registrations };
      }
      return s;
    });

    if (!sessionFound && sessionObj) {
      sessions.push({
        ...sessionObj,
        registrations: [
          {
            id: `reg-${Date.now()}`,
            session_id: sessionId,
            student_id: studentId,
            student_name: studentName,
            email: studentEmail,
            status: 'registered',
            payment_status: 'pending_verification',
            registered_at: new Date().toISOString()
          }
        ]
      });
    }

    localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('[Payments] Error updating mentorSessions cache:', e);
  }

  // 4. Record to Supabase session_registrations if reachable
  if (user?.id) {
    try {
      await supabase.from('session_registrations').insert({
        session_id: sessionId,
        student_id: user.id,
        status: 'registered',
        payment_status: 'pending'
      });
    } catch {
      // Ignored: RLS / offline fallback
    }
  }

  // Notify listeners to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agathiya-payment-updated', { detail: { sessionId, status: 'pending_verification' } }));
  }

  return { success: true };
}

/**
 * Admin verifies or updates registration payment
 */
export function setAdminVerifiedPayment(sessionId, studentId, newStatus = 'paid') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sessionId] = newStatus;
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(parsed));
  } catch (e) {
    console.warn('[Payments] Error updating local payments for admin:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('agathiya-payment-updated', { detail: { sessionId, status: newStatus } }));
  }
}
