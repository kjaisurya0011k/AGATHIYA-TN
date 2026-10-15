import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Video
} from 'lucide-react';

export function MentorSessionsPage() {
  const { lang, t } = useLanguage();
  const { profile } = useAuth();
  const isTamil = lang === 'ta';

  const [activeFilter, setActiveFilter] = useState('all');

  // Preview mock sessions for Phase 1 visual demonstration
  const sampleSessions = [
    {
      id: 'sess-101',
      title: isTamil
        ? 'TNEA கலந்தாய்வு 2026: சிறந்த பொறியியல் கல்லூரிகளைத் தேர்ந்தெடுப்பது எப்படி?'
        : 'TNEA Counseling 2026: How to Choose the Right Engineering Colleges',
      date: '2026-07-20',
      time: '10:00 AM - 11:30 AM',
      mode: 'Online (Google Meet)',
      price: 0,
      capacity: 100,
      registeredCount: 42,
      status: 'approved'
    },
    {
      id: 'sess-102',
      title: isTamil
        ? 'மென்பொருள் பொறியியல் & தயாரிப்பு நிறுவன நேர்காணல் வழிகாட்டல்'
        : 'Software Engineering Careers & Product Company Interview Guidance',
      date: '2026-07-28',
      time: '04:00 PM - 05:30 PM',
      mode: 'Online (Google Meet)',
      price: 0,
      capacity: 80,
      registeredCount: 15,
      status: 'pending'
    },
    {
      id: 'sess-103',
      title: isTamil
        ? 'கிராமப்புற மாணவர்களுக்கான GATE & உயர்கல்வி உதவித்தொகை'
        : 'GATE & Higher Studies Scholarships for Rural College Students',
      date: '2026-08-05',
      time: '06:00 PM - 07:00 PM',
      mode: 'Online (Google Meet)',
      price: 0,
      capacity: 50,
      registeredCount: 0,
      status: 'draft'
    }
  ];

  const filteredSessions = sampleSessions.filter((s) => {
    if (activeFilter === 'all') return true;
    return s.status === activeFilter;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link
          to="/mentor"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          <span>{t?.placeholders?.backToDashboard || (isTamil ? 'டாஷ்போர்டுக்குத் திரும்பு' : 'Back to Dashboard')}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, #07162c 0%, #0d3b66 60%, #00838f 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Calendar size={14} />
              <span>{isTamil ? 'வழிகாட்டி மேலாண்மை' : 'Mentor Management'}</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#ffffff' }}>
              {t?.placeholders?.mentorSessionsTitle || (isTamil ? 'என் வழிகாட்டல் அமர்வுகள்' : 'My Mentor Sessions')}
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#e0f2fe', maxWidth: '640px', lineHeight: 1.5 }}>
              {t?.placeholders?.mentorSessionsDesc || (isTamil ? 'நீங்கள் திட்டமிட்ட அல்லது நடத்திய அமர்வுகளின் முழு விவரங்கள் மற்றும் பதிவு செய்த மாணவர் பட்டியல்.' : 'Manage all your guidance sessions, review schedules, and track registered students.')}
            </p>
          </div>

          <Link
            to="/mentor/sessions/new"
            className="btn"
            style={{ background: '#00a6bf', color: '#ffffff', fontWeight: 700, border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '9999px', boxShadow: '0 4px 12px rgba(0, 166, 191, 0.35)' }}
          >
            <PlusCircle size={18} />
            <span>{t?.roleNav?.createSession || (isTamil ? 'புதிய அமர்வு உருவாக்கு' : 'Create Session')}</span>
          </Link>
        </div>
      </div>

      {/* Phase 1 Notice Banner */}
      <div className="modal-alert-success" style={{ background: 'rgba(0, 166, 191, 0.08)', borderColor: 'rgba(0, 166, 191, 0.3)', color: 'var(--navy-900)', marginBottom: '1.75rem', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
        <CheckCircle2 size={18} color="var(--cyan-700)" />
        <span style={{ fontSize: '0.88rem' }}>
          <strong>{isTamil ? 'கட்டம் 1 நிலை:' : 'Phase 1 Status:'}</strong>{' '}
          {t?.placeholders?.phaseNotice || (isTamil ? 'இந்த பகுதி அடுத்த கட்டத்தில் நேரலை தரவுத்தள அட்டவணைகளுடன் முழுமையாக்கப்படும்.' : 'This view will connect to the live sessions database table in Phase 3.')}
        </span>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { key: 'all', label: isTamil ? 'அனைத்தும்' : 'All' },
          { key: 'approved', label: isTamil ? 'அங்கீகரிக்கப்பட்டவை' : 'Approved' },
          { key: 'pending', label: isTamil ? 'மதிப்பாய்வில்' : 'Pending Review' },
          { key: 'draft', label: isTamil ? 'வரைவுகள்' : 'Drafts' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`filter-pill-btn ${activeFilter === tab.key ? 'active' : ''}`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredSessions.map((session) => (
          <div key={session.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span className={`mentor-status-badge status-${session.status === 'approved' ? 'approved' : session.status === 'pending' ? 'pending_review' : 'draft'}`}>
                  {session.status === 'approved' && <CheckCircle2 size={13} />}
                  {session.status === 'pending' && <Clock size={13} />}
                  {session.status === 'draft' && <FileText size={13} />}
                  <span>
                    {session.status === 'approved'
                      ? (isTamil ? 'அங்கீகரிக்கப்பட்டது' : 'Approved')
                      : session.status === 'pending'
                      ? (isTamil ? 'மதிப்பாய்வில்' : 'Pending Review')
                      : (isTamil ? 'வரைவு' : 'Draft')}
                  </span>
                </span>

                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {session.price === 0 ? (isTamil ? 'இலவசம்' : 'Free') : `₹${session.price}`}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                {session.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} color="var(--cyan-700)" />
                  <span>{session.date} • {session.time}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Video size={14} color="var(--cyan-700)" />
                  <span>{session.mode}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={14} color="var(--purple-700)" />
                  <span>
                    {isTamil
                      ? `${session.registeredCount} / ${session.capacity} மாணவர்கள் பதிவு செய்துள்ளனர்`
                      : `${session.registeredCount} / ${session.capacity} Students Registered`}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <Link
                to={`/mentor/sessions/${session.id}/edit`}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Edit3 size={14} />
                <span>{isTamil ? 'திருத்து' : 'Edit'}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MentorSessionsPage;
