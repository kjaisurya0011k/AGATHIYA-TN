import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ArrowLeft,
  Search,
  Check,
  X,
  CreditCard,
  ExternalLink,
  Edit,
  ShieldCheck,
  XCircle,
  AlertTriangle,
  Video,
  Save,
  CheckCheck
} from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import { setAdminVerifiedPayment } from '../../lib/payments';
import { formatDisplayDate } from '../../lib/dateUtils';

export function AdminSessionsPage() {
  const { lang, t } = useLanguage();
  const {
    adminFetchAllSessions,
    adminReviewSession,
    adminUpdateSession,
    adminUpdateRegistrationPayment,
    mentorSessions
  } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalTab, setModalTab] = useState('edit'); // 'edit' | 'registrations'
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Rejection note
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // When a session is selected, populate the edit form
  const handleOpenSession = (sess) => {
    setSelectedSession(sess);
    setModalTab('edit');
    setShowRejectInput(false);
    setRejectNote(sess.admin_note || '');
    setEditFormData({
      title_en: sess.title_en || '',
      title_ta: sess.title_ta || '',
      description_en: sess.description_en || '',
      description_ta: sess.description_ta || '',
      topic: sess.topic || 'Engineering & TNEA',
      target_audience: sess.target_audience || 'Both',
      language: sess.language || 'Tamil & English',
      session_date: sess.session_date || sess.date || '',
      start_time: sess.start_time || '10:00',
      end_time: sess.end_time || '11:30',
      capacity: sess.capacity || sess.seats_total || 100,
      price_inr: sess.price_inr !== undefined ? sess.price_inr : sess.price || 0,
      meeting_link: sess.meeting_link || sess.session_links?.meeting_link || ''
    });
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
    setShowRejectInput(false);
    setRejectNote('');
  };

  // 1. Approve Session
  const handleApprove = async () => {
    if (!selectedSession) return;
    try {
      if (adminReviewSession) {
        await adminReviewSession(selectedSession.id, 'approved', 'Approved by administrator');
      }
      setActionSuccess(admLang.sessionApprovedToast || (isTamil ? 'அமர்வு அங்கீகரிக்கப்பட்டு மாணவர் பக்கத்தில் வெளியிடப்பட்டது!' : 'Session approved and published to live catalogue!'));
      handleCloseModal();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error approving session');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  // 2. Reject / Request Changes with Required Note
  const handleReject = async () => {
    if (!selectedSession) return;
    if (!rejectNote.trim()) {
      alert(admLang.rejectNoteRequired || (isTamil ? 'திருத்தம் கோரி அனுப்பும்போது அதற்கான காரணத்தை குறிப்பில் எழுதுவது கட்டாயமாகும்.' : 'A revision note is strictly required when requesting changes.'));
      return;
    }
    try {
      if (adminReviewSession) {
        await adminReviewSession(selectedSession.id, 'needs_changes', rejectNote.trim());
      }
      setActionSuccess(admLang.sessionRejectedToast || (isTamil ? 'அமர்வுக்கான திருத்தக் குறிப்பு வழிகாட்டிக்கு வெற்றிகரமாக அனுப்பப்பட்டது.' : 'Session sent back to mentor with review notes.'));
      handleCloseModal();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error declining session');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  // 3. Cancel Session
  const handleCancelSession = async () => {
    if (!selectedSession) return;
    const confirmCancel = window.confirm(
      isTamil ? 'இந்த அமர்வை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா?' : 'Are you sure you want to cancel this session?'
    );
    if (!confirmCancel) return;

    try {
      if (adminReviewSession) {
        await adminReviewSession(selectedSession.id, 'cancelled', 'Cancelled by administrator');
      }
      setActionSuccess(admLang.sessionCancelledToast || (isTamil ? 'அமர்வு ரத்து செய்யப்பட்டது.' : 'Session cancelled.'));
      handleCloseModal();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error cancelling session');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  // 4. Mark Completed
  const handleMarkCompleted = async () => {
    if (!selectedSession) return;
    try {
      if (adminReviewSession) {
        await adminReviewSession(selectedSession.id, 'completed', 'Marked completed');
      }
      setActionSuccess(isTamil ? 'அமர்வு நிறைவடைந்ததாகக் குறிக்கப்பட்டது.' : 'Session marked as completed.');
      handleCloseModal();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error updating session');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  // 5. Admin Save Edits to Session
  const handleSaveEdits = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    setIsSaving(true);
    try {
      if (adminUpdateSession) {
        await adminUpdateSession(
          selectedSession.id,
          {
            title_en: editFormData.title_en,
            title_ta: editFormData.title_ta,
            description_en: editFormData.description_en,
            description_ta: editFormData.description_ta,
            topic: editFormData.topic,
            target_audience: editFormData.target_audience,
            language: editFormData.language,
            session_date: editFormData.session_date,
            start_time: editFormData.start_time,
            end_time: editFormData.end_time,
            capacity: parseInt(editFormData.capacity, 10) || 100,
            price_inr: parseFloat(editFormData.price_inr) || 0
          },
          editFormData.meeting_link
        );
      }
      setActionSuccess(admLang.sessionUpdatedToast || (isTamil ? 'அமர்வு விவரங்கள் நிர்வாகியால் புதுப்பிக்கப்பட்டன.' : 'Session updated by administrator.'));
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error updating session fields');
      setTimeout(() => setActionError(null), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  // 6. Toggle Payment Status for Student Registration
  const handleTogglePayment = async (regId, currentPayment) => {
    if (!selectedSession) return;
    const newStatus = currentPayment === 'paid' ? 'pending' : 'paid';
    if (adminUpdateRegistrationPayment) {
      await adminUpdateRegistrationPayment(selectedSession.id, regId, newStatus);
      setAdminVerifiedPayment(selectedSession.id, regId, newStatus);
      // Update selectedSession registrations locally
      setSelectedSession((prev) => {
        if (!prev) return prev;
        const regs = (prev.registrations || []).map((r) =>
          r.id === regId ? { ...r, payment_status: newStatus } : r
        );
        return { ...prev, registrations: regs };
      });
    }
  };

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    return mentorSessions.filter((s) => {
      // Status filter
      if (activeFilter !== 'all' && s.status !== activeFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleEn = s.title_en?.toLowerCase() || '';
        const titleTa = s.title_ta?.toLowerCase() || '';
        const mentor = (s.mentor_name || '').toLowerCase();
        const topic = (s.topic || '').toLowerCase();
        if (!titleEn.includes(q) && !titleTa.includes(q) && !mentor.includes(q) && !topic.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [mentorSessions, activeFilter, searchQuery]);

  const counts = {
    pending: mentorSessions.filter((s) => s.status === 'pending').length,
    approved: mentorSessions.filter((s) => s.status === 'approved').length,
    needs_changes: mentorSessions.filter((s) => s.status === 'needs_changes').length,
    cancelled: mentorSessions.filter((s) => s.status === 'cancelled').length,
    completed: mentorSessions.filter((s) => s.status === 'completed').length,
    all: mentorSessions.length
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-green">{isTamil ? 'அங்கீகரிக்கப்பட்டது' : 'Approved'}</span>;
      case 'pending':
        return <span className="badge badge-amber">{isTamil ? 'ஒப்புதலுக்கு காத்திருக்கிறது' : 'Pending Review'}</span>;
      case 'needs_changes':
        return <span className="badge badge-purple">{isTamil ? 'திருத்தம் கோரப்பட்டது' : 'Needs Changes'}</span>;
      case 'cancelled':
        return <span className="badge badge-red">{isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled'}</span>;
      case 'completed':
        return <span className="badge badge-navy">{isTamil ? 'நிறைவடைந்தது' : 'Completed'}</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Back to Admin Dashboard */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையத்திற்குத் திரும்பு' : 'Back to Admin Control Center'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid #f59e0b', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={20} color="#b45309" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {admLang.sessionsReviewTitle || (isTamil ? 'வழிகாட்டி அமர்வுகள் மதிப்பாய்வு & ஒப்புதல்' : 'Sessions Review & Approval Queue')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.885rem', color: '#64748b' }}>
              {admLang.sessionsReviewSubtitle ||
                (isTamil
                  ? 'வழிகாட்டிகளின் அமர்வுகளை ஆய்வு செய்து, தேவைப்படின் மாற்றங்களைச் செய்து அங்கீகரிக்கவும்.'
                  : 'Inspect incoming mentor proposals, edit any fields, approve for live student catalogue, or request revisions.')}
            </p>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ✓ {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ⚠️ {actionError}
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className={`tab-btn ${activeFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveFilter('pending')}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}
            >
              <Clock size={14} />
              <span>{admLang.filterPending || (isTamil ? 'ஒப்புதலுக்கு நிலுவை' : 'Pending')} ({counts.pending})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeFilter === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveFilter('approved')}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}
            >
              <CheckCircle2 size={14} />
              <span>{admLang.filterApproved || (isTamil ? 'அங்கீகரிக்கப்பட்டவை' : 'Approved')} ({counts.approved})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeFilter === 'needs_changes' ? 'active' : ''}`}
              onClick={() => setActiveFilter('needs_changes')}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}
            >
              <AlertTriangle size={14} />
              <span>{admLang.filterNeedsChanges || (isTamil ? 'திருத்தம் கோரப்பட்டவை' : 'Needs Changes')} ({counts.needs_changes})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}
            >
              <CheckCheck size={14} />
              <span>{admLang.filterCompleted || (isTamil ? 'நிறைவடைந்தவை' : 'Completed')} ({counts.completed})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.8rem' }}
            >
              <span>{admLang.filterAll || (isTamil ? 'அனைத்தும்' : 'All')} ({counts.all})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ flex: '0 1 300px', minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTamil ? 'தலைப்பு, வழிகாட்டி வாரியாகத் தேடு...' : 'Search title, mentor, or topic...'}
              style={{ width: '100%', paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Sessions Table */}
        {filteredSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
              {isTamil ? 'இந்த வடிகட்டலில் அமர்வுகள் எதுவும் இல்லை' : 'No sessions match this filter'}
            </div>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              {isTamil ? 'வேறு வடிகட்டலைத் தேர்ந்தெடுக்கவும்.' : 'Try changing your status filter or search query.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'அமர்வு தலைப்பு' : 'Session Title'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'வழிகாட்டி' : 'Mentor'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'தேதி & நேரம்' : 'Schedule'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'கட்டணம்' : 'Fee'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'இருக்கைகள்' : 'Seats / Regs'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'நிலை' : 'Status'}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>{isTamil ? 'நடவடிக்கை' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  const title = (isTamil && s.title_ta ? s.title_ta : s.title_en) || s.title_en;
                  const price = s.price_inr !== undefined ? s.price_inr : s.price || 0;
                  const registeredCount = s.registrations?.length || s.seats_booked || 0;
                  const capacity = s.capacity || s.seats_total || 100;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label={isTamil ? 'அமர்வு தலைப்பு' : 'Session Title'} style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem', lineHeight: 1.35 }}>
                          {title}
                        </div>
                        {s.topic && (
                          <span style={{ fontSize: '0.72rem', color: '#008394', background: 'rgba(0,166,191,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {s.topic}
                          </span>
                        )}
                      </td>
                      <td data-label={isTamil ? 'வழிகாட்டி' : 'Mentor'} style={{ padding: '0.85rem 0.75rem', color: '#334155', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <UserAvatar
                            name={s.mentor_name || 'Verified Mentor'}
                            avatarPath={s.mentor_avatar_path || (s.mentor_id ? `${s.mentor_id}/avatar.webp` : null)}
                            avatarUrl={s.mentor_avatar_url || s.mentor_avatar || null}
                            avatarUpdatedAt={s.mentor_avatar_updated_at || s.updated_at}
                            role="mentor"
                            size={28}
                          />
                          <span>{s.mentor_name || 'Verified Mentor'}</span>
                        </div>
                      </td>
                      <td data-label={isTamil ? 'தேதி & நேரம்' : 'Schedule'} style={{ padding: '0.85rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatDisplayDate(s.session_date || s.date)}{' '}
                        <span style={{ fontSize: '0.78rem' }}>({s.start_time || '10:00'} - {s.end_time || '11:30'})</span>
                      </td>
                      <td data-label={isTamil ? 'கட்டணம்' : 'Fee'} style={{ padding: '0.85rem 0.75rem' }}>
                        {price === 0 ? (
                          <span className="badge badge-green" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Free</span>
                        ) : (
                          <span className="badge badge-purple" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap' }}>₹{price}</span>
                        )}
                      </td>
                      <td data-label={isTamil ? 'இருக்கைகள்' : 'Seats'} style={{ padding: '0.85rem 0.75rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        <strong>{registeredCount}</strong> / {capacity}
                      </td>
                      <td data-label={isTamil ? 'நிலை' : 'Status'} style={{ padding: '0.85rem 0.75rem' }}>
                        {getStatusBadge(s.status)}
                      </td>
                      <td data-label={isTamil ? 'நடவடிக்கை' : 'Actions'} style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenSession(s)}
                          className="btn btn-sm btn-primary"
                          style={{ fontSize: '0.85rem', minHeight: '44px', padding: '0.5rem 1rem', width: '100%', justifyContent: 'center', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <Edit size={14} />
                          <span>{admLang.btnEditSession || (isTamil ? 'மதிப்பாய்வு & திருத்து' : 'Review & Edit')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REVIEW & EDIT MODAL */}
      {selectedSession && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                    {isTamil ? 'அமர்வு நிர்வாக பார்வை' : 'Session Administration Portal'}
                  </span>
                  {getStatusBadge(selectedSession.status)}
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  {(isTamil && selectedSession.title_ta ? selectedSession.title_ta : selectedSession.title_en) || selectedSession.title_en}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.35rem' }}>
                  <UserAvatar
                    name={selectedSession.mentor_name || 'Verified Mentor'}
                    avatarPath={selectedSession.mentor_avatar_path || (selectedSession.mentor_id ? `${selectedSession.mentor_id}/avatar.webp` : null)}
                    avatarUrl={selectedSession.mentor_avatar_url || selectedSession.mentor_avatar || null}
                    avatarUpdatedAt={selectedSession.mentor_avatar_updated_at || selectedSession.updated_at}
                    role="mentor"
                    size={24}
                  />
                  <span style={{ fontSize: '0.825rem', color: '#475569' }}>
                    {isTamil ? 'வழிகாட்டி: ' : 'Mentor: '} <strong>{selectedSession.mentor_name || 'Verified Mentor'}</strong>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs: Edit Details | Registrations */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setModalTab('edit')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderBottom: modalTab === 'edit' ? '2px solid var(--navy-900)' : '2px solid transparent',
                  color: modalTab === 'edit' ? 'var(--navy-900)' : '#64748b',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer'
                }}
              >
                {admLang.btnEditSession || (isTamil ? 'அமர்வு விவரங்களைத் திருத்து' : 'Session Details & Edit')}
              </button>

              <button
                type="button"
                onClick={() => setModalTab('registrations')}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderBottom: modalTab === 'registrations' ? '2px solid var(--navy-900)' : '2px solid transparent',
                  color: modalTab === 'registrations' ? 'var(--navy-900)' : '#64748b',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Users size={14} />
                <span>{admLang.registrationsTabTitle || (isTamil ? 'பதிவு செய்த மாணவர்கள்' : 'Student Registrations')} ({selectedSession.registrations?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: EDIT SESSION DETAILS */}
            {modalTab === 'edit' && (
              <div>
                {/* Admin Action Bar (Approve, Reject, Cancel, Complete) */}
                <div
                  style={{
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.65rem',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {isTamil ? 'நிர்வாக நடவடிக்கைகள்:' : 'Administrator Actions:'}
                  </span>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedSession.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="btn btn-sm btn-primary"
                        style={{ background: '#16a34a', borderColor: '#16a34a', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Check size={14} />
                        <span>{admLang.btnApprove || (isTamil ? 'அமர்வை அங்கீகரி' : 'Approve Session')}</span>
                      </button>
                    )}

                    {selectedSession.status !== 'needs_changes' && (
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(!showRejectInput)}
                        className="btn btn-sm btn-outline"
                        style={{ color: '#b45309', borderColor: '#fde68a', background: '#fffbeb', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <AlertTriangle size={14} />
                        <span>{admLang.btnRejectWithNote || (isTamil ? 'திருத்தம் கோரு' : 'Request Changes')}</span>
                      </button>
                    )}

                    {selectedSession.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={handleMarkCompleted}
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {admLang.btnMarkCompleted || (isTamil ? 'நிறைவடைந்தது' : 'Mark Completed')}
                      </button>
                    )}

                    {selectedSession.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={handleCancelSession}
                        className="btn btn-sm btn-outline"
                        style={{ color: '#b91c1c', borderColor: '#fecaca', fontSize: '0.8rem' }}
                      >
                        {admLang.btnCancelSession || (isTamil ? 'ரத்துசெய்' : 'Cancel Session')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Reject Note Input Panel if toggled */}
                {showRejectInput && (
                  <div style={{ padding: '1rem', background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>
                      {admLang.rejectNoteLabel || (isTamil ? 'வழிகாட்டிக்கு அனுப்ப வேண்டிய திருத்தக் குறிப்பு (கட்டாயம்) *' : 'Revision Note for Mentor (Required) *')}
                    </label>
                    <textarea
                      rows={3}
                      className="form-input"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder={admLang.rejectNotePlaceholder || (isTamil ? 'எ.கா. பாடப்பிரிவு விவரங்கள் மற்றும் தகுதித் தேவைகளை மேலும் விரிவாக விளக்கவும்...' : 'State clear revision instructions for the mentor...')}
                      style={{ width: '100%', fontSize: '0.85rem', marginBottom: '0.65rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(false)}
                        className="btn btn-sm btn-outline"
                      >
                        {isTamil ? 'ரத்து' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        className="btn btn-sm btn-danger"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {isTamil ? 'குறிப்பை அனுப்பி நிராகரி' : 'Send Note & Decline'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Full Inline Edit Form */}
                <form onSubmit={handleSaveEdits}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'தலைப்பு (ஆங்கிலம்) *' : 'Title (English) *'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.title_en || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title_en: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'தலைப்பு (தமிழ்)' : 'Title (Tamil)'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.title_ta || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title_ta: e.target.value })}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'விவரம் (ஆங்கிலம்) *' : 'Description (English) *'}
                      </label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={editFormData.description_en || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description_en: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'விவரம் (தமிழ்)' : 'Description (Tamil)'}
                      </label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={editFormData.description_ta || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description_ta: e.target.value })}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'துறை / தலைப்பு *' : 'Topic *'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.topic || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'இலக்கு மாணவர்கள் *' : 'Target Audience *'}
                      </label>
                      <select
                        className="form-input"
                        value={editFormData.target_audience || 'Both'}
                        onChange={(e) => setEditFormData({ ...editFormData, target_audience: e.target.value })}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      >
                        <option value="Class 11">Class 11</option>
                        <option value="Class 12">Class 12</option>
                        <option value="Both">Both (Class 11 & 12)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'மொழி *' : 'Language *'}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editFormData.language || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, language: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'தேதி *' : 'Session Date *'}
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={editFormData.session_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, session_date: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'தொடக்க நேரம் *' : 'Start Time *'}
                      </label>
                      <input
                        type="time"
                        className="form-input"
                        value={editFormData.start_time || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, start_time: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'முடிவு நேரம் *' : 'End Time *'}
                      </label>
                      <input
                        type="time"
                        className="form-input"
                        value={editFormData.end_time || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, end_time: e.target.value })}
                        required
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'இருக்கைகள்' : 'Capacity'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={editFormData.capacity || 100}
                        onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                        {isTamil ? 'கட்டணம் (₹, 0 = Free)' : 'Fee (INR, 0 = Free)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={editFormData.price_inr !== undefined ? editFormData.price_inr : 0}
                        onChange={(e) => setEditFormData({ ...editFormData, price_inr: e.target.value })}
                        style={{ width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Meeting Link */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                      {isTamil ? 'கூகுள் மீட் / ஜூம் இணைய இணைப்பு *' : 'Live Meeting URL (Google Meet / Zoom) *'}
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      value={editFormData.meeting_link || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, meeting_link: e.target.value })}
                      required
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-outline"
                    >
                      {isTamil ? 'மூடு' : 'Close'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="btn btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Save size={15} />
                      <span>{isSaving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (admLang.btnSaveSessionChanges || (isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Session Changes'))}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: REGISTRATIONS MANAGEMENT */}
            {modalTab === 'registrations' && (
              <div>
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#475569' }}>
                    {isTamil ? 'இந்த அமர்வுக்கு பதிவு செய்த மாணவர்கள் பட்டியல்:' : 'Students registered for this mentorship session:'}
                  </span>
                  <span className="badge badge-purple">
                    {selectedSession.registrations?.length || 0} {isTamil ? 'மாணவர்கள்' : 'Enrolled'}
                  </span>
                </div>

                {(!selectedSession.registrations || selectedSession.registrations.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                    <Users size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      {admLang.noRegistrationsYet || (isTamil ? 'இந்த அமர்வில் இதுவரை மாணவர்கள் யாரும் பதிவு செய்யவில்லை.' : 'No students have registered for this session yet.')}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                          <th style={{ padding: '0.65rem' }}>{isTamil ? 'மாணவர் பெயர்' : 'Student Name'}</th>
                          <th style={{ padding: '0.65rem' }}>{isTamil ? 'பதிவு தேதி' : 'Reg Date'}</th>
                          <th style={{ padding: '0.65rem' }}>{isTamil ? 'நிலை' : 'Status'}</th>
                          <th style={{ padding: '0.65rem' }}>{isTamil ? 'கட்டண நிலை' : 'Payment Status'}</th>
                          <th style={{ padding: '0.65rem', textAlign: 'right' }}>{isTamil ? 'நடவடிக்கை' : 'Action'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSession.registrations.map((reg) => {
                          const isPaid = reg.payment_status === 'paid';
                          const isFree = selectedSession.price_inr === 0 || selectedSession.price === 0;

                          return (
                            <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td data-label={isTamil ? 'மாணவர் பெயர்' : 'Student Name'} style={{ padding: '0.65rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                                {reg.student_name || 'TN Student'}
                              </td>
                              <td data-label={isTamil ? 'பதிவு தேதி' : 'Reg Date'} style={{ padding: '0.65rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                {formatDisplayDate(reg.registered_at) || '2 Jul 2026'}
                              </td>
                              <td data-label={isTamil ? 'நிலை' : 'Status'} style={{ padding: '0.65rem' }}>
                                <span className="badge badge-green" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                  {reg.status || 'registered'}
                                </span>
                              </td>
                              <td data-label={isTamil ? 'கட்டண நிலை' : 'Payment Status'} style={{ padding: '0.65rem' }}>
                                {isFree ? (
                                  <span className="badge badge-gray" style={{ fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                                    {admLang.paymentStatusNotRequired || 'Free'}
                                  </span>
                                ) : isPaid ? (
                                  <span className="badge badge-green" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                                    <Check size={11} /> {admLang.paymentStatusPaid || 'Paid'}
                                  </span>
                                ) : reg.payment_status === 'pending_verification' ? (
                                  <span className="badge badge-purple" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d', whiteSpace: 'nowrap' }}>
                                    <Clock size={11} /> {isTamil ? 'சரிபார்ப்பு நிலுவை' : 'Pending Verification'}
                                  </span>
                                ) : (
                                  <span className="badge badge-amber" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                                    <Clock size={11} /> {admLang.paymentStatusPending || 'Pending'}
                                  </span>
                                )}
                              </td>
                              <td data-label={isTamil ? 'நடவடிக்கை' : 'Action'} style={{ padding: '0.65rem', textAlign: 'right' }}>
                                {!isFree && (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePayment(reg.id, reg.payment_status)}
                                    className="btn btn-sm btn-outline"
                                    style={{ fontSize: '0.8rem', minHeight: '44px', padding: '0.4rem 0.8rem', width: '100%', justifyContent: 'center', whiteSpace: 'nowrap' }}
                                  >
                                    {isPaid
                                      ? (admLang.markPendingBtn || (isTamil ? 'நிலுவை என மாற்று' : 'Mark Pending'))
                                      : reg.payment_status === 'pending_verification'
                                      ? (isTamil ? 'சரிபார் (Mark Paid)' : 'Verify Payment (Mark Paid)')
                                      : (admLang.markPaidBtn || (isTamil ? 'கட்டணம் செலுத்தப்பட்டது' : 'Mark Paid'))}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSessionsPage;
