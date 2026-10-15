import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import {
  Calendar,
  Clock,
  Video,
  Users,
  PlusCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  UserCheck,
  X
} from 'lucide-react';

export function MentorDashboard() {
  const { lang, t } = useLanguage();
  const {
    user,
    profile,
    mentorDetails,
    mentorSessions,
    cancelMentorSession,
    fetchSessionRegistrations
  } = useAuth();

  const isTamil = lang === 'ta';
  const hub = t?.mentorHub || {};

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionForStudents, setSelectedSessionForStudents] = useState(null);
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);

  // Status Counts for Summary Cards
  const counts = {
    drafts: mentorSessions.filter((s) => s.status === 'draft').length,
    pending: mentorSessions.filter((s) => s.status === 'pending').length,
    approved: mentorSessions.filter((s) => s.status === 'approved').length,
    needs_changes: mentorSessions.filter((s) => s.status === 'needs_changes').length,
    completed: mentorSessions.filter((s) => s.status === 'completed').length,
    cancelled: mentorSessions.filter((s) => s.status === 'cancelled').length,
    totalRegistrations: mentorSessions.reduce((acc, s) => acc + (s.registrations?.length || 0), 0)
  };

  // Profile Approval Status Check
  const mentorProfileStatus = mentorDetails?.status || 'draft';
  const isProfileApproved = mentorProfileStatus === 'approved';

  // Filtered Sessions
  const filteredSessions = mentorSessions.filter((s) => {
    const matchesFilter = activeFilter === 'all' ? true : s.status === activeFilter;
    const title = (isTamil && s.title_ta ? s.title_ta : s.title_en) || '';
    const topic = s.topic || '';
    const matchesSearch =
      !searchQuery.trim() ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenStudentsDialog = async (session) => {
    setSelectedSessionForStudents(session);
    setLoadingStudents(true);
    if (fetchSessionRegistrations) {
      const { data } = await fetchSessionRegistrations(session.id);
      setRegisteredStudents(data || []);
    } else {
      setRegisteredStudents(session.registrations || []);
    }
    setLoadingStudents(false);
  };

  const handleCancelSession = async (sessionId) => {
    const confirmMsg = hub.confirmCancelSession || 'Are you sure you want to cancel this guidance session?';
    if (window.confirm(confirmMsg)) {
      await cancelMentorSession(sessionId);
      setCancelToast(true);
      setTimeout(() => setCancelToast(false), 4000);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="mentor-status-badge status-approved">
            <CheckCircle2 size={13} />
            <span>{isTamil ? 'அங்கீகரிக்கப்பட்டது' : 'Approved'}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="mentor-status-badge status-pending_review">
            <Clock size={13} />
            <span>{isTamil ? 'மதிப்பாய்வில் உள்ளது' : 'Pending Review'}</span>
          </span>
        );
      case 'needs_changes':
        return (
          <span className="mentor-status-badge status-needs_changes">
            <AlertCircle size={13} />
            <span>{isTamil ? 'மாற்றங்கள் தேவை' : 'Needs Changes'}</span>
          </span>
        );
      case 'draft':
        return (
          <span className="mentor-status-badge status-draft">
            <FileText size={13} />
            <span>{isTamil ? 'வரைவு' : 'Draft'}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="mentor-status-badge status-draft" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>
            <XCircle size={13} />
            <span>{isTamil ? 'ரத்துசெய்யப்பட்டது' : 'Cancelled'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="mentor-status-badge status-approved" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <CheckCircle2 size={13} />
            <span>{isTamil ? 'நிறைவடைந்தது' : 'Completed'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* 1. Header Hero Banner */}
      <div className="card mentor-profile-banner" style={{ marginBottom: '2rem' }}>
        <div className="mentor-banner-left">
          <UserAvatar
            name={profile?.full_name || 'Mentor'}
            avatarPath={profile?.avatar_path}
            avatarUrl={profile?.avatar_url || user?.user_metadata?.avatar_url}
            avatarUpdatedAt={profile?.avatar_updated_at}
            role="mentor"
            size={72}
            fontSize="1.75rem"
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
              <span className={`badge ${isProfileApproved ? 'badge-green' : 'badge-purple'}`}>
                {isProfileApproved
                  ? (isTamil ? 'அங்கீகரிக்கப்பட்ட வழிகாட்டி' : 'Approved Mentor')
                  : (isTamil ? `சுயவிவர நிலை: ${mentorProfileStatus}` : `Profile Status: ${mentorProfileStatus}`)}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ID: {profile?.id?.slice(0, 8) || 'mentor-user'}
              </span>
            </div>
            <h1 className="mentor-banner-name" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {profile?.full_name || 'Mentor'}
            </h1>
            <p className="mentor-banner-role" style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              {mentorDetails?.headline || profile?.designation || (isTamil ? 'தொழில் வழிகாட்டி & கல்வி ஆலோசகர்' : 'Career Mentor & Guidance Lead')}
              {mentorDetails?.organisation && ` • ${mentorDetails.organisation}`}
            </p>

            {mentorDetails?.expertise && mentorDetails.expertise.length > 0 && (
              <div className="mentor-expertise-tags" style={{ marginTop: '0.75rem' }}>
                {mentorDetails.expertise.map((exp, i) => (
                  <span key={i} className="expertise-tag">
                    {exp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mentor-banner-stats">
          <Link
            to="/mentor/sessions/new"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
          >
            <PlusCircle size={16} />
            <span>{hub.createSessionBtn || (isTamil ? 'புதிய அமர்வு உருவாக்கு' : 'Create Session')}</span>
          </Link>
          <Link
            to="/profile"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <ShieldCheck size={16} />
            <span>{isTamil ? 'என் சுயவிவரம்' : 'My Profile'}</span>
          </Link>
        </div>
      </div>

      {/* 2. Mentor Profile Unapproved Warning Banner */}
      {!isProfileApproved && (
        <div
          className="card"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            background: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
            <AlertTriangle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 0.35rem', color: '#92400e', fontSize: '1rem', fontWeight: 700 }}>
                {hub.profileNoticeTitle || (isTamil ? 'சுயவிவர ஒப்புதல் நிலை அறிவிப்பு' : 'Profile Approval Status Notice')}
              </h4>
              <p style={{ margin: '0 0 0.75rem', color: '#78350f', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {hub.profileNoticeDesc
                  ? hub.profileNoticeDesc.replace('{status}', mentorProfileStatus)
                  : isTamil
                  ? `உங்கள் வழிகாட்டி சுயவிவரம் இன்னும் நிர்வாகியால் அங்கீகரிக்கப்படவில்லை (தற்போதைய நிலை: ${mentorProfileStatus}). நீங்கள் வரைவு அமர்வுகளை உருவாக்கலாம், ஆனால் நிர்வாக ஒப்புதலுக்கு சமர்ப்பிக்க உங்கள் சுயவிவரம் அங்கீகரிக்கப்பட வேண்டும்.`
                  : `Your mentor profile is awaiting administrator approval (current status: ${mentorProfileStatus}). You can create draft sessions, but submitting them for admin review requires an approved mentor profile.`}
              </p>
              <Link
                to="/profile"
                className="btn btn-sm btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#b45309', borderColor: '#b45309' }}
              >
                <span>{hub.completeProfileBtn || (isTamil ? 'சுயவிவரத்தை சரிபார்க்கவும்' : 'Complete / Verify Profile')}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Success Toast */}
      {cancelToast && (
        <div className="alert-box-success card" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{hub.sessionCancelledSuccess || (isTamil ? 'அமர்வு வெற்றிகரமாக ரத்து செய்யப்பட்டது.' : 'Session cancelled successfully.')}</span>
        </div>
      )}

      {/* 4. SUMMARY METRIC CARDS (Drafts, Pending, Approved, Needs Changes, Total Registrations) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        {/* Approved Sessions */}
        <div
          className="card"
          onClick={() => setActiveFilter('approved')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderTop: '4px solid #16a34a',
            background: activeFilter === 'approved' ? '#f0fdf4' : '#ffffff',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              {hub.statApproved || (isTamil ? 'அங்கீகரிக்கப்பட்டவை' : 'Approved')}
            </span>
            <CheckCircle2 size={16} color="#16a34a" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {counts.approved}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {isTamil ? 'மாணவர்களுக்கு நேரலையாகக் கிடைக்கும்' : 'Live & visible to students'}
          </p>
        </div>

        {/* Pending Review */}
        <div
          className="card"
          onClick={() => setActiveFilter('pending')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderTop: '4px solid #f59e0b',
            background: activeFilter === 'pending' ? '#fffbeb' : '#ffffff',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              {hub.statPending || (isTamil ? 'மதிப்பாய்வில் உள்ளவை' : 'Pending Review')}
            </span>
            <Clock size={16} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {counts.pending}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {isTamil ? 'நிர்வாகி ஒப்புதலுக்காக காத்திருக்கிறது' : 'Awaiting admin verification'}
          </p>
        </div>

        {/* Needs Changes */}
        <div
          className="card"
          onClick={() => setActiveFilter('needs_changes')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderTop: '4px solid #ef4444',
            background: activeFilter === 'needs_changes' ? '#fef2f2' : '#ffffff',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase' }}>
              {hub.statNeedsChanges || (isTamil ? 'மாற்றங்கள் தேவை' : 'Needs Changes')}
            </span>
            <AlertCircle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {counts.needs_changes}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {isTamil ? 'நிர்வாகியின் குறிப்புடன் திருத்தப்பட வேண்டும்' : 'Admin note attached'}
          </p>
        </div>

        {/* Drafts */}
        <div
          className="card"
          onClick={() => setActiveFilter('draft')}
          style={{
            padding: '1.25rem',
            cursor: 'pointer',
            borderTop: '4px solid #94a3b8',
            background: activeFilter === 'draft' ? '#f8fafc' : '#ffffff',
            transition: 'transform 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              {hub.statDrafts || (isTamil ? 'வரைவுகள்' : 'Drafts')}
            </span>
            <FileText size={16} color="#64748b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {counts.drafts}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {isTamil ? 'சமர்ப்பிக்கப்படாதவை' : 'Unsubmitted drafts'}
          </p>
        </div>

        {/* Total Student Registrations */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderTop: '4px solid var(--cyan-600)',
            background: 'linear-gradient(180deg, #ffffff 0%, rgba(0, 166, 191, 0.04) 100%)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan-700)', textTransform: 'uppercase' }}>
              {hub.statTotalRegistrations || (isTamil ? 'மொத்த பதிவுகள்' : 'Registrations')}
            </span>
            <Users size={16} color="var(--cyan-600)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {counts.totalRegistrations}
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
            {isTamil ? 'அனைத்து அமர்வுகளிலும் மாணவர்கள்' : 'Across all your sessions'}
          </p>
        </div>
      </div>

      {/* 5. Sessions Management Table Header */}
      <div className="section-padding-sm" style={{ padding: '0 0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {hub.tableTitle || (isTamil ? 'என் வழிகாட்டல் அமர்வுகள்' : 'My Guidance Sessions')}
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {isTamil
                ? 'அமர்வுகளைத் திருத்தவும், பதிவுகளைக் கண்காணிக்கவும் மற்றும் இணைப்புகளைப் பார்க்கவும்.'
                : 'Monitor incoming registrations, update schedules, and launch live video rooms.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/mentor/sessions/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle size={16} />
              <span>{hub.createSessionBtn || (isTamil ? 'புதிய அமர்வு உருவாக்கு' : 'Create Session')}</span>
            </Link>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: hub.filterAll || (isTamil ? 'அனைத்தும்' : 'All'), count: mentorSessions.length },
              { id: 'approved', label: hub.statApproved || (isTamil ? 'அங்கீகரிக்கப்பட்டவை' : 'Approved'), count: counts.approved },
              { id: 'pending', label: hub.statPending || (isTamil ? 'மதிப்பாய்வில்' : 'Pending'), count: counts.pending },
              { id: 'needs_changes', label: hub.statNeedsChanges || (isTamil ? 'மாற்றங்கள் தேவை' : 'Needs Changes'), count: counts.needs_changes },
              { id: 'draft', label: hub.statDrafts || (isTamil ? 'வரைவுகள்' : 'Drafts'), count: counts.drafts }
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`filter-pill-btn ${activeFilter === pill.id ? 'active' : ''}`}
                style={{
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '9999px',
                  border: '1.5px solid var(--border-subtle)',
                  background: activeFilter === pill.id ? 'var(--navy-900)' : '#ffffff',
                  color: activeFilter === pill.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{pill.label}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: activeFilter === pill.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                    color: activeFilter === pill.id ? '#ffffff' : '#334155'
                  }}
                >
                  {pill.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTamil ? 'அமர்வு தேடுக...' : 'Search sessions...'}
              className="form-input"
              style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* 6. Sessions List Cards */}
        {filteredSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredSessions.map((session) => {
              const sessionTitle = (isTamil && session.title_ta ? session.title_ta : session.title_en) || session.title_en;
              const sessionDesc = (isTamil && session.description_ta ? session.description_ta : session.description_en) || session.description_en;
              const regCount = session.registrations?.length || 0;
              const isApproved = session.status === 'approved';
              const isNeedsChanges = session.status === 'needs_changes';

              return (
                <div
                  key={session.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderLeft: `5px solid ${
                      session.status === 'approved'
                        ? '#16a34a'
                        : session.status === 'pending'
                        ? '#f59e0b'
                        : session.status === 'needs_changes'
                        ? '#ef4444'
                        : '#94a3b8'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1, minWidth: '260px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        {getStatusBadge(session.status)}
                        <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                          {session.topic}
                        </span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                          {session.target_audience}
                        </span>
                        {session.price_inr === 0 ? (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                            {isTamil ? 'இலவசம்' : '100% Free'}
                          </span>
                        ) : (
                          <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                            ₹{session.price_inr}
                          </span>
                        )}
                      </div>

                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                        {sessionTitle}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.45, maxWidth: '780px' }}>
                        {sessionDesc}
                      </p>
                    </div>

                    {/* Action Buttons for this session */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* View Registrations Dialog Trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenStudentsDialog(session)}
                        className="btn btn-sm btn-outline"
                        title={hub.actionViewStudents || 'View Students'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <Users size={14} color="var(--cyan-700)" />
                        <span>{regCount} {isTamil ? 'மாணவர்கள்' : 'Students'}</span>
                      </button>

                      {/* Edit Session */}
                      <Link
                        to={`/mentor/sessions/${session.id}/edit`}
                        className="btn btn-sm btn-outline"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
                      >
                        <Edit3 size={14} />
                        <span>{hub.actionEdit || (isTamil ? 'திருத்து' : 'Edit')}</span>
                      </Link>

                      {/* Cancel Session */}
                      {session.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleCancelSession(session.id)}
                          className="btn btn-sm btn-outline"
                          style={{ color: '#b91c1c', borderColor: '#fca5a5', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          title={hub.actionCancel || 'Cancel Session'}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Date, Time, Mode & Meeting Link Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem',
                      paddingTop: '0.75rem',
                      marginTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} color="var(--navy-900)" />
                      <strong>{session.session_date}</strong>
                    </span>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} color="var(--navy-900)" />
                      <span>{session.start_time} - {session.end_time} IST</span>
                    </span>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Video size={14} color="var(--cyan-700)" />
                      <span>{session.mode === 'online' ? 'Google Meet / Online' : session.mode}</span>
                    </span>

                    {session.capacity && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={14} color="#64748b" />
                        <span>{regCount} / {session.capacity} {isTamil ? 'இருக்கைகள்' : 'capacity'}</span>
                      </span>
                    )}

                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          marginLeft: 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: 'var(--cyan-700)',
                          fontWeight: 600,
                          fontSize: '0.825rem'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>{isTamil ? 'மீட்டிங் அறை திறக்க' : 'Launch Meeting Room'}</span>
                      </a>
                    )}
                  </div>

                  {/* Admin Note Callout if rejected or needs changes */}
                  {isNeedsChanges && session.admin_note && (
                    <div className="mentor-review-note-callout" style={{ marginTop: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c' }}>
                        <MessageSquare size={14} />
                        <span>{hub.adminNoteTitle || (isTamil ? 'நிர்வாகியின் குறிப்பு:' : 'Admin Note:')}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155' }}>
                        {session.admin_note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card empty-state-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Calendar size={44} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 0.4rem' }}>
              {hub.noSessionsFound || (isTamil ? 'இந்த பிரிவில் அமர்வுகள் எதுவும் இல்லை.' : 'No sessions found in this view.')}
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isTamil
                ? 'உங்கள் மாணவர்களுக்கான புதிய நேரலை வழிகாட்டல் அமர்வை உடனே திட்டமிடுங்கள்.'
                : 'Schedule a new live counselling session for Class 11 and 12 students.'}
            </p>
            <Link to="/mentor/sessions/new" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle size={16} />
              <span>{hub.createFirstSession || (isTamil ? 'முதல் அமர்வைத் தொடங்குங்கள்' : 'Create First Session')}</span>
            </Link>
          </div>
        )}
      </div>

      {/* 7. Registered Students Modal (Student Privacy Shield Enforced) */}
      {selectedSessionForStudents && (
        <div className="modal-backdrop" onClick={() => setSelectedSessionForStudents(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '640px', width: '92%', padding: '2rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Users size={22} color="var(--navy-900)" />
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {hub.studentsDialogTitle || (isTamil ? 'பதிவு செய்த மாணவர்கள் பட்டியல்' : 'Registered Students List')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionForStudents(null)}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Session Info Pill */}
            <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>
                {isTamil && selectedSessionForStudents.title_ta ? selectedSessionForStudents.title_ta : selectedSessionForStudents.title_en}
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {selectedSessionForStudents.session_date} • {selectedSessionForStudents.start_time} - {selectedSessionForStudents.end_time} IST • {registeredStudents.length} {isTamil ? 'பதிவுகள்' : 'enrollments'}
              </div>
            </div>

            {/* Student Privacy Shield Notice */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                background: 'rgba(0, 166, 191, 0.08)',
                border: '1px solid rgba(0, 166, 191, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: 'var(--navy-900)'
              }}
            >
              <ShieldCheck size={18} color="var(--cyan-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>{isTamil ? 'தனியுரிமை பாதுகாப்பு:' : 'Student Privacy Shield:'}</strong>{' '}
                {hub.privacyShieldNotice ||
                  (isTamil
                    ? 'மாணவர்களின் பெயர் மற்றும் பதிவு நிலை மட்டுமே வழிகாட்டிகளுக்குத் தெரியும். தொலைபேசி எண்கள், மதிப்பெண்கள் மற்றும் உணர்திறன் தகவல்கள் பாதுகாக்கப்பட்டுள்ளன.'
                    : 'Only student names and registration dates are accessible to mentors. Contact numbers, cut-off marks, and personal scholarship details remain strictly private.')}
              </div>
            </div>

            {/* Students Table */}
            {registeredStudents.length > 0 ? (
              <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid var(--border-subtle)' }}>
                      <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>#</th>
                      <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {hub.regStudentName || (isTamil ? 'மாணவர் பெயர்' : 'Student Name')}
                      </th>
                      <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {hub.regDate || (isTamil ? 'பதிவு தேதி' : 'Date')}
                      </th>
                      <th style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        {hub.regStatus || (isTamil ? 'நிலை' : 'Status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredStudents.map((st, idx) => (
                      <tr key={st.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserCheck size={14} color="var(--cyan-700)" />
                            <span>{st.student_name || 'TN Student'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {st.registered_at ? new Date(st.registered_at).toLocaleDateString() : 'Active'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: '#dcfce7',
                              color: '#166534',
                              border: '1px solid #bbf7d0'
                            }}
                          >
                            {isTamil ? 'பதிவு உறுதியானது' : 'Confirmed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                {hub.noRegistrationsYet || (isTamil ? 'இந்த அமர்வில் இதுவரை மாணவர்கள் யாரும் பதிவு செய்யவில்லை.' : 'No students have registered for this session yet.')}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedSessionForStudents(null)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                {hub.closeBtn || (isTamil ? 'மூடு' : 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;
