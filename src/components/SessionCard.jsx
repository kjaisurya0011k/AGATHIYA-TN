import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { brand } from '../data/brand';
import { getPaymentStatus, submitStudentPayment } from '../lib/payments';
import { PaymentModal } from './PaymentModal';
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle2,
  Sparkles,
  UserCheck,
  CalendarPlus,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function SessionCard({ session }) {
  const { lang, t } = useLanguage();
  const {
    registeredSessions,
    registerForSession,
    cancelStudentRegistration,
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();

  const isTamil = lang === 'ta';
  const sessLang = t?.studentSessions || {};

  const isRegistered = registeredSessions.includes(session.id);
  const [feedbackToast, setFeedbackToast] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const price = session.price_inr !== undefined ? session.price_inr : session.price || 0;
  const isFree = price === 0;

  // Track payment status for this session
  const [paymentStatus, setPaymentStatus] = useState(() => {
    return getPaymentStatus(session.id, user?.id);
  });

  // Sync payment status when session registrations or storage update
  useEffect(() => {
    const syncStatus = () => {
      const localSt = getPaymentStatus(session.id, user?.id);
      const reg = (session.registrations || []).find(
        (r) => (user?.id && r.student_id === user.id) || r.student_id === 'demo-student-id'
      );
      if (reg?.payment_status === 'paid' || localSt === 'paid') {
        setPaymentStatus('paid');
      } else if (reg?.payment_status === 'pending_verification' || localSt === 'pending_verification') {
        setPaymentStatus('pending_verification');
      } else if (localSt && localSt !== 'none') {
        setPaymentStatus(localSt);
      }
    };

    syncStatus();

    const handlePaymentUpdated = (e) => {
      if (!e.detail || e.detail.sessionId === session.id) {
        if (e.detail?.status) {
          setPaymentStatus(e.detail.status);
        } else {
          syncStatus();
        }
      }
    };

    window.addEventListener('agathiya-payment-updated', handlePaymentUpdated);
    return () => window.removeEventListener('agathiya-payment-updated', handlePaymentUpdated);
  }, [session.id, session.registrations, user?.id]);

  const title = (isTamil && session.title_ta ? session.title_ta : session.title_en) || session.title_en;
  const description = (isTamil && session.description_ta ? session.description_ta : session.description_en) || session.description_en || '';
  const mentorName = session.mentor_name || session.profiles?.full_name || 'Verified Career Mentor';
  const mentorRole = session.mentor_headline || (isTamil ? 'அங்கீகரிக்கப்பட்ட வழிகாட்டி' : 'Verified Mentor');

  const capacity = session.capacity || session.seats_total || 100;
  const registeredCount = session.registrations?.length || session.seats_booked || 0;
  const seatsLeft = Math.max(0, capacity - registeredCount);
  const isFull = seatsLeft === 0;

  // Format Date and Time
  const sessionDate = session.session_date || session.date || '2026-07-20';
  const startTime = session.start_time || '10:00';
  const endTime = session.end_time || '11:30';
  const timeDisplay = session.time || `${startTime} - ${endTime} IST`;

  // Meeting Link
  const meetingLink = session.meeting_link || session.session_links?.meeting_link || 'https://meet.google.com/agathiya-live';

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    const cleanDate = (sessionDate || '2026-07-20').replace(/-/g, '');
    const cleanStart = (startTime || '10:00').replace(':', '') + '00';
    const cleanEnd = (endTime || '11:30').replace(':', '') + '00';
    const dates = `${cleanDate}T${cleanStart}/${cleanDate}T${cleanEnd}`;
    const text = encodeURIComponent(title || `${brand.name} Guidance Session`);
    const details = encodeURIComponent(`${description}\n\nJoin Link: ${meetingLink}\nPlatform: ${brand.name} Higher Education Guidance`);
    const location = encodeURIComponent(meetingLink);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  };

  // Handler for student submitting payment
  const handleConfirmPaid = async () => {
    await submitStudentPayment({
      sessionId: session.id,
      user,
      profile,
      sessionObj: session
    });

    if (!isRegistered && registerForSession) {
      await registerForSession(session.id, session);
    }

    setIsPayModalOpen(false);
    setPaymentStatus('pending_verification');
    setFeedbackToast('Thanks! Your access will be confirmed after the admin verifies your payment.');
    setTimeout(() => setFeedbackToast(null), 5000);
  };

  // Handler for free session seat registration / cancellation
  const handleRegisterClick = async () => {
    if (isRegistered) {
      const confirmCancel = window.confirm(
        sessLang.confirmCancelReg || 'Are you sure you want to cancel your seat registration for this session?'
      );
      if (confirmCancel) {
        if (cancelStudentRegistration) {
          await cancelStudentRegistration(session.id);
        }
        setFeedbackToast(sessLang.regCancelledToast || (isTamil ? 'உங்கள் பதிவு ரத்து செய்யப்பட்டது.' : 'Registration cancelled.'));
        setTimeout(() => setFeedbackToast(null), 3000);
      }
    } else {
      if (registerForSession) {
        await registerForSession(session.id, session);
      }
      setFeedbackToast(sessLang.regSuccessToast || (isTamil ? 'அமர்வில் உங்கள் பதிவு உறுதியானது!' : 'Seat confirmed!'));
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  // Should the meeting link be released?
  // For free sessions: released once registered.
  // For paid sessions: released ONLY once registered AND admin verified payment (paymentStatus === 'paid').
  const canAccessMeetingLink = isRegistered && (isFree || paymentStatus === 'paid');

  return (
    <div
      className={`card session-card ${isRegistered ? 'session-registered-border' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <div>
        {/* Top Bar: Date, Price Badge, & Target Audience */}
        <div className="session-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div className="session-date-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={13} />
            <span>{sessionDate}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {session.target_audience && (
              <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                {session.target_audience}
              </span>
            )}
            {isFree ? (
              <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                {sessLang.freeBadge || (isTamil ? '100% இலவசம்' : '100% Free')}
              </span>
            ) : (
              <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                ₹{price}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="session-title" style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--navy-900)' }}>
          {title}
        </h3>

        {/* Topic Tag if present */}
        {session.topic && (
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cyan-800)', background: 'rgba(0, 166, 191, 0.1)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: 600 }}>
              {session.topic}
            </span>
          </div>
        )}

        {/* Mentor Info */}
        <div className="session-mentor" style={{ marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <UserAvatar
            name={mentorName}
            avatarPath={session.mentor_avatar_path || (session.mentor_id ? `${session.mentor_id}/avatar.webp` : null)}
            avatarUrl={session.mentor_avatar_url || session.mentor_avatar || null}
            avatarUpdatedAt={session.mentor_avatar_updated_at || session.updated_at}
            role="mentor"
            size={38}
          />
          <div className="mentor-details">
            <h4 className="mentor-name">{mentorName}</h4>
            <p className="mentor-role" style={{ fontSize: '0.78rem' }}>{mentorRole}</p>
          </div>
        </div>

        {/* Time & Platform */}
        <div className="session-meta-grid" style={{ marginBottom: '0.85rem' }}>
          <div className="meta-item">
            <Clock size={13} color="var(--text-muted)" />
            <span>{timeDisplay}</span>
          </div>
          <div className="meta-item">
            <Video size={13} color="var(--cyan-600)" />
            <span>{session.mode === 'online' ? 'Google Meet' : (session.mode || 'Online')}</span>
          </div>
        </div>

        {/* Short Description */}
        {description && (
          <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.45, marginBottom: '1rem' }}>
            {description}
          </p>
        )}

        {/* REVEALED MEETING LINK & CALENDAR (Only when authorized) */}
        {canAccessMeetingLink && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#166534', fontWeight: 700, fontSize: '0.825rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={16} />
              <span>
                {paymentStatus === 'paid'
                  ? (isTamil ? 'கட்டணம் சரிபார்க்கப்பட்டது • இருக்கை உறுதியானது' : 'Payment Verified • Seat Confirmed')
                  : sessLang.alreadyRegistered || (isTamil ? 'உங்கள் பதிவு உறுதியானது' : 'Seat Confirmed')}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#14532d', marginBottom: '0.65rem' }}>
              {sessLang.meetingLinkTitle || (isTamil ? 'உங்கள் நேரலை கூகுள் மீட் இணைப்பு:' : 'Live Google Meet Room:')}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-primary"
                style={{ background: '#166534', borderColor: '#166534', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <Video size={13} />
                <span>{sessLang.joinMeetingBtn || (isTamil ? 'கூட்டத்தில் இணையுங்கள்' : 'Launch Meet')}</span>
              </a>

              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline"
                style={{ borderColor: '#86efac', color: '#166534', background: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                <CalendarPlus size={13} />
                <span>{sessLang.addToCalendar || (isTamil ? 'Google கேலெண்டரில் சேர்' : 'Add to Calendar')}</span>
              </a>
            </div>
          </div>
        )}

        {/* Pending Verification Notice for Paid Sessions */}
        {!isFree && isRegistered && paymentStatus === 'pending_verification' && (
          <div
            style={{
              fontSize: '0.8rem',
              color: '#92400e',
              background: '#fffbeb',
              padding: '0.65rem 0.85rem',
              borderRadius: '6px',
              marginBottom: '1rem',
              border: '1px solid #fde68a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Clock size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <span>
              {isTamil
                ? 'கட்டண சரிபார்ப்பு நிலுவையில் உள்ளது. நிர்வாகி சரிபார்த்த பின் கூகுள் மீட் இணைப்பு வெளியிடப்படும்.'
                : 'Payment submitted (pending verification). Access will be confirmed after admin verifies your payment.'}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Seats Indicator & Action Buttons */}
      <div className="session-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="seats-indicator" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#64748b' }}>
          <Users size={14} />
          {isFull ? (
            <span style={{ color: '#b91c1c', fontWeight: 700 }}>
              {sessLang.seatsFull || (isTamil ? 'இருக்கைகள் நிரம்பின' : 'Full')}
            </span>
          ) : (
            <span>
              <strong style={{ color: 'var(--navy-900)' }}>{seatsLeft}</strong> {sessLang.seatsLeft || (isTamil ? 'இருக்கைகள் மீதம்' : 'seats left')}
            </span>
          )}
        </div>

        {/* Action Button: Free vs Paid Flows */}
        {isFree ? (
          /* Free Sessions: No Pay button */
          <button
            type="button"
            onClick={handleRegisterClick}
            disabled={!isRegistered && isFull}
            className={`btn btn-sm ${isRegistered ? 'btn-outline' : 'btn-pay-green'}`}
            style={{
              fontSize: '0.825rem',
              minHeight: '44px',
              padding: '0.4rem 0.9rem',
              fontWeight: 700,
              ...(isRegistered
                ? { color: '#b91c1c', borderColor: '#fca5a5' }
                : { backgroundColor: '#16a34a', borderColor: '#15803d', color: '#ffffff' })
            }}
          >
            {isRegistered ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <XCircle size={14} />
                <span>{sessLang.cancelRegBtn || (isTamil ? 'பதிவை ரத்துசெய்' : 'Cancel Seat')}</span>
              </span>
            ) : isFull ? (
              <span>{sessLang.seatsFull || 'Full'}</span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={14} />
                <span>{sessLang.registerFreeBtn || (isTamil ? 'இலவச பதிவு' : 'Register Free')}</span>
              </span>
            )}
          </button>
        ) : (
          /* Paid Sessions: Pay Button for logged-in students viewing or registered for session */
          user ? (
            paymentStatus === 'paid' ? (
              <button
                type="button"
                disabled
                className="btn btn-sm"
                aria-label="Payment verified"
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  minHeight: '44px',
                  padding: '0.4rem 1rem',
                  background: '#dcfce7',
                  color: '#166534',
                  border: '1.5px solid #86efac',
                  cursor: 'default'
                }}
              >
                ✓ {isTamil ? 'கட்டணம் செலுத்தப்பட்டது' : 'Paid'}
              </button>
            ) : paymentStatus === 'pending_verification' ? (
              <button
                type="button"
                disabled
                className="btn btn-sm btn-outline"
                aria-label="Payment submitted pending verification"
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  minHeight: '44px',
                  padding: '0.4rem 0.85rem',
                  opacity: 0.9,
                  cursor: 'not-allowed',
                  color: '#b45309',
                  borderColor: '#fcd34d',
                  background: '#fffbeb'
                }}
              >
                Payment submitted (pending verification)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPayModalOpen(true)}
                disabled={isFull && !isRegistered}
                className="btn btn-sm btn-pay-green"
                aria-label={`Pay ₹${price} for session`}
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  minHeight: '44px',
                  padding: '0.4rem 1.15rem',
                  backgroundColor: '#16a34a',
                  borderColor: '#15803d',
                  color: '#ffffff'
                }}
              >
                Pay ₹{price}
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-sm btn-pay-green"
              style={{
                fontSize: '0.825rem',
                fontWeight: 700,
                minHeight: '44px',
                padding: '0.4rem 0.9rem',
                backgroundColor: '#16a34a',
                borderColor: '#15803d',
                color: '#ffffff'
              }}
            >
              Login to Register (₹{price})
            </button>
          )
        )}
      </div>

      {feedbackToast && (
        <div className="session-toast" style={{ marginTop: '0.75rem' }}>
          ✓ {feedbackToast}
        </div>
      )}

      {/* Payment Modal: Only rendered in DOM when Pay is clicked */}
      {isPayModalOpen && (
        <PaymentModal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          session={session}
          onConfirmPaid={handleConfirmPaid}
          isTamil={isTamil}
        />
      )}
    </div>
  );
}

export default SessionCard;
