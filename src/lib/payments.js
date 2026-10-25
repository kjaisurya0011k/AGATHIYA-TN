import { supabase } from './supabase.js';

export const STORAGE_KEY_PAYMENTS = 'agathiya_session_payments';
export const STORAGE_KEY_MENTOR_SESSIONS = 'eee_tn_mentor_sessions';
export const STORAGE_KEY_SESSIONS = 'eee_tn_registered_sessions';
export const STORAGE_KEY_PAYMENT_DETAILS = 'agathiya_session_payment_details';

/**
 * Get payment status for a session.
 * Normalized returns: 'none' | 'pending' | 'verified' | 'rejected'
 */
export function getPaymentStatus(sessionId, userId) {
  if (!sessionId) return 'none';

  // 1. Check detailed payment store
  try {
    const rawDetails = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    if (rawDetails) {
      const detailsMap = JSON.parse(rawDetails);
      const key = userId ? `${sessionId}_${userId}` : sessionId;
      const detail = detailsMap[key] || detailsMap[sessionId];
      if (detail?.status) {
        if (detail.status === 'verified' || detail.status === 'paid') return 'verified';
        if (detail.status === 'rejected') return 'rejected';
        if (detail.status === 'pending' || detail.status === 'pending_verification') return 'pending';
      }
    }
  } catch (e) {
    console.warn('[Payments] Error reading payment details storage:', e);
  }

  // 2. Check local session payments store
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed[sessionId]) {
        const s = parsed[sessionId];
        if (s === 'verified' || s === 'paid') return 'verified';
        if (s === 'rejected') return 'rejected';
        if (s === 'pending' || s === 'pending_verification') return 'pending';
        return s;
      }
    }
  } catch (e) {
    console.warn('[Payments] Error reading payment storage:', e);
  }

  // 3. Check mentorSessions registrations cache
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    if (rawSessions) {
      const sessions = JSON.parse(rawSessions);
      const sess = sessions.find((s) => s.id === sessionId);
      if (sess && Array.isArray(sess.registrations)) {
        const reg = sess.registrations.find(
          (r) => userId && (r.student_id === userId || r.id === userId)
        );
        if (reg?.payment_status) {
          const s = reg.payment_status;
          if (s === 'verified' || s === 'paid') return 'verified';
          if (s === 'rejected') return 'rejected';
          if (s === 'pending' || s === 'pending_verification') return 'pending';
          return s;
        }
      }
    }
  } catch (e) {
    console.warn('[Payments] Error reading mentor sessions cache:', e);
  }

  return 'none';
}

/**
 * Get detailed payment record for a session / user
 */
export function getPaymentRecord(sessionId, userId) {
  if (!sessionId) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    if (raw) {
      const parsed = JSON.parse(raw);
      const key = userId ? `${sessionId}_${userId}` : sessionId;
      return parsed[key] || parsed[sessionId] || null;
    }
  } catch (e) {
    console.warn('[Payments] Error reading payment record:', e);
  }
  return null;
}

/**
 * Save student payment submission as pending verification
 */
export async function submitStudentPayment({
  sessionId,
  user,
  profile,
  sessionObj,
  transactionRef = '',
  paymentMethod = 'UPI'
}) {
  const studentId = user?.id;
  const studentName =
    profile?.full_name || user?.user_metadata?.full_name || 'TN Student';
  const studentEmail = user?.email || 'student@agathiya.org';
  const price = sessionObj?.price_inr !== undefined ? sessionObj.price_inr : sessionObj?.price || 0;
  const sessionTitle = sessionObj?.title_en || sessionObj?.title || 'Guidance Session';
  const sessionTitleTa = sessionObj?.title_ta || '';
  const mentorName = sessionObj?.mentor_name || sessionObj?.profiles?.full_name || 'Verified Mentor';
  const submittedAt = new Date().toISOString();
  const cleanTxRef = (transactionRef || '').trim() || null;

  const paymentRecord = {
    id: `reg-${Date.now()}`,
    session_id: sessionId,
    session_title: sessionTitle,
    session_title_ta: sessionTitleTa,
    mentor_name: mentorName,
    student_id: studentId,
    student_name: studentName,
    student_email: studentEmail,
    amount_expected: price,
    amount_paid: price,
    payment_method: paymentMethod,
    transaction_reference: cleanTxRef,
    payment_submitted_at: submittedAt,
    status: 'pending',
    payment_status: 'pending'
  };

  // 1. Store in detailed storage
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const key = studentId ? `${sessionId}_${studentId}` : sessionId;
    existing[key] = paymentRecord;
    existing[sessionId] = paymentRecord;
    localStorage.setItem(STORAGE_KEY_PAYMENT_DETAILS, JSON.stringify(existing));
  } catch (e) {
    console.warn('[Payments] Error updating agathiya_session_payment_details:', e);
  }

  // 2. Store in agathiya_session_payments (legacy & quick status)
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    existing[sessionId] = 'pending';
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(existing));
  } catch (e) {
    console.warn('[Payments] Error updating agathiya_session_payments:', e);
  }

  // 3. Ensure registered in registeredSessions list
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

  // 4. Update mentorSessions registration in localStorage
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
          payment_status: 'pending',
          payment_method: paymentMethod,
          transaction_reference: cleanTxRef,
          amount_paid: price,
          payment_submitted_at: submittedAt,
          registered_at: submittedAt
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
            payment_status: 'pending',
            payment_method: paymentMethod,
            transaction_reference: cleanTxRef,
            amount_paid: price,
            payment_submitted_at: submittedAt,
            registered_at: submittedAt
          }
        ]
      });
    }

    localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.warn('[Payments] Error updating mentorSessions cache:', e);
  }

  // 5. Record to Supabase session_registrations if reachable
  if (user?.id) {
    try {
      // First attempt with extended payment tracking columns
      const { error: fullInsertErr } = await supabase.from('session_registrations').upsert(
        {
          session_id: sessionId,
          student_id: user.id,
          status: 'registered',
          payment_status: 'pending',
          payment_method: paymentMethod,
          transaction_reference: cleanTxRef,
          amount_paid: price,
          payment_submitted_at: submittedAt
        },
        { onConflict: 'session_id,student_id' }
      );

      // If extended columns are not yet in the DB schema cache, fall back to basic columns
      if (fullInsertErr && fullInsertErr.code === '42703') {
        await supabase.from('session_registrations').upsert(
          {
            session_id: sessionId,
            student_id: user.id,
            status: 'registered',
            payment_status: 'pending'
          },
          { onConflict: 'session_id,student_id' }
        );
      }
    } catch {
      // Offline fallback preserved
    }
  }

  // Notify listeners to update UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('agathiya-payment-updated', {
        detail: {
          sessionId,
          status: 'pending',
          transactionRef: cleanTxRef
        }
      })
    );
  }

  return { success: true, paymentRecord };
}

/**
 * Fetch all payments for Administrator Mission Control
 * Combines real database queries with local storage cache to guarantee
 * instant responsiveness, offline support, and complete registration audit.
 */
export async function adminFetchAllPayments() {
  const paymentsMap = new Map();

  // 1. Query Supabase session_registrations
  try {
    // Attempt enhanced view first if available
    const { data: viewData, error: viewError } = await supabase
      .from('admin_payment_verifications_view')
      .select('*')
      .order('registered_at', { ascending: false });

    if (!viewError && Array.isArray(viewData) && viewData.length > 0) {
      viewData.forEach((row) => {
        paymentsMap.set(row.registration_id || `${row.session_id}_${row.student_id}`, {
          id: row.registration_id,
          sessionId: row.session_id,
          studentId: row.student_id,
          studentName: row.student_name || 'TN Student',
          studentEmail: row.student_email || '—',
          sessionTitle: row.session_title || 'Session',
          sessionTitleTa: row.session_title_ta || '',
          mentorName: row.mentor_name || 'Verified Mentor',
          amountExpected: Number(row.session_price) || 0,
          amountPaid: Number(row.amount_paid) || Number(row.session_price) || 0,
          paymentMethod: row.payment_method || 'UPI',
          transactionReference: row.transaction_reference || null,
          submittedAt: row.payment_submitted_at || row.registered_at,
          status: normalizeStatus(row.payment_status),
          verifiedBy: row.verified_by,
          verifiedByName: row.verified_by_name || null,
          verifiedAt: row.verified_at,
          rejectionReason: row.rejection_reason,
          rejectedBy: row.rejected_by,
          rejectedByName: row.rejected_by_name || null,
          rejectedAt: row.rejected_at,
          raw: row
        });
      });
    } else {
      // Query session_registrations with joins
      const { data: regData, error: regError } = await supabase
        .from('session_registrations')
        .select(`
          id,
          session_id,
          student_id,
          status,
          payment_status,
          created_at,
          updated_at,
          sessions:session_id (
            id,
            title_en,
            title_ta,
            price_inr,
            session_date,
            mentor_id,
            profiles:mentor_id (
              full_name,
              email
            )
          ),
          profiles:student_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (!regError && Array.isArray(regData)) {
        regData.forEach((row) => {
          const sess = row.sessions || {};
          const stu = row.profiles || {};
          const mentor = sess.profiles || {};
          const expected = Number(sess.price_inr) || 0;

          // Only paid sessions or registrations with payment status
          if (expected > 0 || row.payment_status !== 'not_required') {
            const key = row.id || `${row.session_id}_${row.student_id}`;
            paymentsMap.set(key, {
              id: row.id,
              sessionId: row.session_id,
              studentId: row.student_id,
              studentName: stu.full_name || 'TN Student',
              studentEmail: stu.email || '—',
              sessionTitle: sess.title_en || 'Session',
              sessionTitleTa: sess.title_ta || '',
              mentorName: mentor.full_name || 'Verified Mentor',
              amountExpected: expected,
              amountPaid: row.amount_paid ? Number(row.amount_paid) : expected,
              paymentMethod: row.payment_method || 'UPI',
              transactionReference: row.transaction_reference || null,
              submittedAt: row.payment_submitted_at || row.created_at,
              status: normalizeStatus(row.payment_status),
              verifiedBy: row.verified_by || null,
              verifiedByName: null,
              verifiedAt: row.verified_at || null,
              rejectionReason: row.rejection_reason || null,
              rejectedBy: row.rejected_by || null,
              rejectedByName: null,
              rejectedAt: row.rejected_at || null,
              raw: row
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('[Payments] Error querying Supabase registrations:', err);
  }

  // 2. Merge local storage registrations from mentorSessions
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    if (rawSessions) {
      const sessions = JSON.parse(rawSessions);
      sessions.forEach((s) => {
        const expected = Number(s.price_inr !== undefined ? s.price_inr : s.price) || 0;
        if (Array.isArray(s.registrations)) {
          s.registrations.forEach((r) => {
            const pStatus = r.payment_status;
            if (expected > 0 || (pStatus && pStatus !== 'not_required')) {
              const key = r.id || `${s.id}_${r.student_id}`;
              const existing = paymentsMap.get(key);

              // Merge or insert
              paymentsMap.set(key, {
                id: r.id || key,
                sessionId: s.id,
                studentId: r.student_id,
                studentName: r.student_name || r.name || existing?.studentName || 'TN Student',
                studentEmail: r.email || existing?.studentEmail || '—',
                sessionTitle: s.title_en || s.title || existing?.sessionTitle || 'Session',
                sessionTitleTa: s.title_ta || existing?.sessionTitleTa || '',
                mentorName: s.mentor_name || s.profiles?.full_name || existing?.mentorName || 'Verified Mentor',
                amountExpected: expected,
                amountPaid: r.amount_paid ? Number(r.amount_paid) : existing?.amountPaid || expected,
                paymentMethod: r.payment_method || existing?.paymentMethod || 'UPI',
                transactionReference: r.transaction_reference || existing?.transactionReference || null,
                submittedAt: r.payment_submitted_at || r.registered_at || existing?.submittedAt || new Date().toISOString(),
                status: normalizeStatus(r.payment_status || existing?.status || 'pending'),
                verifiedBy: r.verified_by || existing?.verifiedBy || null,
                verifiedByName: r.verified_by_name || existing?.verifiedByName || null,
                verifiedAt: r.verified_at || existing?.verifiedAt || null,
                rejectionReason: r.rejection_reason || existing?.rejectionReason || null,
                rejectedBy: r.rejected_by || existing?.rejectedBy || null,
                rejectedByName: r.rejected_by_name || existing?.rejectedByName || null,
                rejectedAt: r.rejected_at || existing?.rejectedAt || null,
                raw: { ...existing?.raw, ...r }
              });
            }
          });
        }
      });
    }
  } catch (err) {
    console.warn('[Payments] Error reading local mentorSessions:', err);
  }

  // 3. Merge detailed payment store
  try {
    const rawDetails = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    if (rawDetails) {
      const detailsMap = JSON.parse(rawDetails);
      Object.entries(detailsMap).forEach(([k, rec]) => {
        if (!rec || !rec.session_id) return;
        const key = rec.id || `${rec.session_id}_${rec.student_id}`;
        const existing = paymentsMap.get(key);
        paymentsMap.set(key, {
          id: rec.id || key,
          sessionId: rec.session_id,
          studentId: rec.student_id,
          studentName: rec.student_name || existing?.studentName || 'TN Student',
          studentEmail: rec.student_email || existing?.studentEmail || '—',
          sessionTitle: rec.session_title || existing?.sessionTitle || 'Session',
          sessionTitleTa: rec.session_title_ta || existing?.sessionTitleTa || '',
          mentorName: rec.mentor_name || existing?.mentorName || 'Verified Mentor',
          amountExpected: Number(rec.amount_expected) || existing?.amountExpected || 0,
          amountPaid: Number(rec.amount_paid) || existing?.amountPaid || 0,
          paymentMethod: rec.payment_method || existing?.paymentMethod || 'UPI',
          transactionReference: rec.transaction_reference || existing?.transactionReference || null,
          submittedAt: rec.payment_submitted_at || existing?.submittedAt || new Date().toISOString(),
          status: normalizeStatus(rec.payment_status || rec.status || existing?.status || 'pending'),
          verifiedBy: rec.verified_by || existing?.verifiedBy || null,
          verifiedByName: rec.verified_by_name || existing?.verifiedByName || null,
          verifiedAt: rec.verified_at || existing?.verifiedAt || null,
          rejectionReason: rec.rejection_reason || existing?.rejectionReason || null,
          rejectedBy: rec.rejected_by || existing?.rejectedBy || null,
          rejectedByName: rec.rejected_by_name || existing?.rejectedByName || null,
          rejectedAt: rec.rejected_at || existing?.rejectedAt || null,
          raw: { ...existing?.raw, ...rec }
        });
      });
    }
  } catch (err) {
    console.warn('[Payments] Error reading payment details map:', err);
  }

  // Return as sorted array: newest submitted/registered first
  const list = Array.from(paymentsMap.values());
  list.sort((a, b) => {
    const dateA = new Date(a.submittedAt || 0).getTime();
    const dateB = new Date(b.submittedAt || 0).getTime();
    return dateB - dateA;
  });

  return list;
}

/**
 * Admin Verifies a Payment
 * Atomically updates status to 'verified', records admin audit info,
 * updates Supabase and local storage, and grants access.
 */
export async function adminVerifyPayment({
  registrationId,
  sessionId,
  studentId,
  adminUser
}) {
  const adminId = adminUser?.id || null;
  const adminName =
    adminUser?.user_metadata?.full_name || adminUser?.email || 'Administrator';
  const now = new Date().toISOString();

  // 1. Call Supabase RPC or update table
  let dbSuccess = false;
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_verify_payment', {
      p_registration_id: registrationId
    });

    if (!rpcError && rpcData?.success) {
      dbSuccess = true;
    } else {
      // Direct update fallback
      const { error: updateErr } = await supabase
        .from('session_registrations')
        .update({
          payment_status: 'verified',
          status: 'registered',
          verified_by: adminId,
          verified_at: now,
          rejection_reason: null,
          rejected_by: null,
          rejected_at: null
        })
        .match(
          registrationId && !registrationId.startsWith('reg-')
            ? { id: registrationId }
            : { session_id: sessionId, student_id: studentId }
        );

      if (!updateErr) {
        dbSuccess = true;
      } else if (updateErr.code === '42703') {
        // Fallback for basic schema (status paid)
        await supabase
          .from('session_registrations')
          .update({ payment_status: 'paid', status: 'registered' })
          .match(
            registrationId && !registrationId.startsWith('reg-')
              ? { id: registrationId }
              : { session_id: sessionId, student_id: studentId }
          );
        dbSuccess = true;
      }
    }
  } catch (err) {
    console.warn('[Payments] Error updating verification in Supabase:', err);
  }

  // 2. Update local payments quick store
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sessionId] = 'verified';
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(parsed));
  } catch (e) {
    console.warn('[Payments] Error updating local payments:', e);
  }

  // 3. Update detailed payment store
  try {
    const rawDetails = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    const detailsMap = rawDetails ? JSON.parse(rawDetails) : {};
    const key = studentId ? `${sessionId}_${studentId}` : sessionId;

    const existing = detailsMap[key] || detailsMap[sessionId] || {};
    const updated = {
      ...existing,
      id: registrationId,
      session_id: sessionId,
      student_id: studentId,
      status: 'verified',
      payment_status: 'verified',
      verified_by: adminId,
      verified_by_name: adminName,
      verified_at: now,
      rejection_reason: null,
      rejected_by: null,
      rejected_at: null
    };

    detailsMap[key] = updated;
    detailsMap[sessionId] = updated;
    localStorage.setItem(STORAGE_KEY_PAYMENT_DETAILS, JSON.stringify(detailsMap));
  } catch (e) {
    console.warn('[Payments] Error updating local payment details:', e);
  }

  // 4. Update mentorSessions cache
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    if (rawSessions) {
      let sessions = JSON.parse(rawSessions);
      sessions = sessions.map((s) => {
        if (s.id === sessionId && Array.isArray(s.registrations)) {
          const regs = s.registrations.map((r) => {
            if (
              r.id === registrationId ||
              (studentId && r.student_id === studentId)
            ) {
              return {
                ...r,
                payment_status: 'verified',
                status: 'registered',
                verified_by: adminId,
                verified_by_name: adminName,
                verified_at: now,
                rejection_reason: null
              };
            }
            return r;
          });
          return { ...s, registrations: regs };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(sessions));
    }
  } catch (e) {
    console.warn('[Payments] Error updating mentorSessions registration:', e);
  }

  // Notify listeners to update student UI instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('agathiya-payment-updated', {
        detail: {
          sessionId,
          studentId,
          status: 'verified',
          verifiedAt: now
        }
      })
    );
  }

  return { success: true, dbSuccess, verifiedAt: now };
}

/**
 * Admin Rejects a Payment
 * Records rejection reason, admin audit info, and updates registration status
 * without deleting the registration record.
 */
export async function adminRejectPayment({
  registrationId,
  sessionId,
  studentId,
  reason,
  adminUser
}) {
  const adminId = adminUser?.id || null;
  const adminName =
    adminUser?.user_metadata?.full_name || adminUser?.email || 'Administrator';
  const now = new Date().toISOString();
  const cleanReason = (reason || 'Transaction could not be confirmed').trim();

  // 1. Call Supabase RPC or update table
  let dbSuccess = false;
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('admin_reject_payment', {
      p_registration_id: registrationId,
      p_reason: cleanReason
    });

    if (!rpcError && rpcData?.success) {
      dbSuccess = true;
    } else {
      // Direct update fallback
      const { error: updateErr } = await supabase
        .from('session_registrations')
        .update({
          payment_status: 'rejected',
          rejection_reason: cleanReason,
          rejected_by: adminId,
          rejected_at: now
        })
        .match(
          registrationId && !registrationId.startsWith('reg-')
            ? { id: registrationId }
            : { session_id: sessionId, student_id: studentId }
        );

      if (!updateErr) {
        dbSuccess = true;
      }
    }
  } catch (err) {
    console.warn('[Payments] Error updating rejection in Supabase:', err);
  }

  // 2. Update local payments quick store
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sessionId] = 'rejected';
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(parsed));
  } catch (e) {
    console.warn('[Payments] Error updating local payments for rejection:', e);
  }

  // 3. Update detailed payment store
  try {
    const rawDetails = localStorage.getItem(STORAGE_KEY_PAYMENT_DETAILS);
    const detailsMap = rawDetails ? JSON.parse(rawDetails) : {};
    const key = studentId ? `${sessionId}_${studentId}` : sessionId;

    const existing = detailsMap[key] || detailsMap[sessionId] || {};
    const updated = {
      ...existing,
      id: registrationId,
      session_id: sessionId,
      student_id: studentId,
      status: 'rejected',
      payment_status: 'rejected',
      rejection_reason: cleanReason,
      rejected_by: adminId,
      rejected_by_name: adminName,
      rejected_at: now
    };

    detailsMap[key] = updated;
    detailsMap[sessionId] = updated;
    localStorage.setItem(STORAGE_KEY_PAYMENT_DETAILS, JSON.stringify(detailsMap));
  } catch (e) {
    console.warn('[Payments] Error updating local payment rejection details:', e);
  }

  // 4. Update mentorSessions cache
  try {
    const rawSessions = localStorage.getItem(STORAGE_KEY_MENTOR_SESSIONS);
    if (rawSessions) {
      let sessions = JSON.parse(rawSessions);
      sessions = sessions.map((s) => {
        if (s.id === sessionId && Array.isArray(s.registrations)) {
          const regs = s.registrations.map((r) => {
            if (
              r.id === registrationId ||
              (studentId && r.student_id === studentId)
            ) {
              return {
                ...r,
                payment_status: 'rejected',
                rejection_reason: cleanReason,
                rejected_by: adminId,
                rejected_by_name: adminName,
                rejected_at: now
              };
            }
            return r;
          });
          return { ...s, registrations: regs };
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEY_MENTOR_SESSIONS, JSON.stringify(sessions));
    }
  } catch (e) {
    console.warn('[Payments] Error updating mentorSessions rejection:', e);
  }

  // Notify listeners to update student UI instantly
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('agathiya-payment-updated', {
        detail: {
          sessionId,
          studentId,
          status: 'rejected',
          reason: cleanReason,
          rejectedAt: now
        }
      })
    );
  }

  return { success: true, dbSuccess, rejectedAt: now };
}

/**
 * Normalizes payment status string
 */
function normalizeStatus(status) {
  if (!status) return 'pending';
  const s = String(status).toLowerCase();
  if (s === 'verified' || s === 'paid') return 'verified';
  if (s === 'rejected') return 'rejected';
  if (s === 'pending' || s === 'pending_verification') return 'pending';
  return s;
}

/**
 * Admin quick verify legacy helper
 */
export function setAdminVerifiedPayment(sessionId, studentId, newStatus = 'verified') {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sessionId] = newStatus;
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(parsed));
  } catch (e) {
    console.warn('[Payments] Error updating local payments for admin:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('agathiya-payment-updated', {
        detail: { sessionId, status: newStatus }
      })
    );
  }
}
