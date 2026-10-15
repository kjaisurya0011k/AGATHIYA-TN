import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export function AdminSessionsPage() {
  const { lang, t } = useLanguage();
  const isTamil = lang === 'ta';

  const [activeFilter, setActiveFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Mock sessions for Phase 1 visual demonstration
  const [sessions, setSessions] = useState([
    {
      id: 'sess-p1',
      title: 'TNAU தமிழ்நாடு வேளாண் பல்கலைக்கழக சேர்க்கை & கலந்தாய்வு வழிகாட்டல்',
      mentor_name: 'Dr. M. Sangeetha (TNAU Alumnus)',
      mentor_role: 'Agriculture Scientist',
      date: '2026-07-22',
      time: '11:00 AM - 12:30 PM',
      topic: 'Agriculture Counseling',
      price: 0,
      capacity: 100,
      registeredCount: 38,
      status: 'pending',
      meeting_link: 'https://meet.google.com/tnau-agri-guide'
    },
    {
      id: 'sess-p2',
      title: 'சட்டப் படிப்புகள் (5-Year B.A. LL.B) அரசு சட்டக்கல்லூரி சேர்க்கை',
      mentor_name: 'Adv. S. Ramanathan',
      mentor_role: 'Madras High Court Advocate',
      date: '2026-07-25',
      time: '03:00 PM - 04:30 PM',
      topic: 'Law Admissions',
      price: 0,
      capacity: 75,
      registeredCount: 22,
      status: 'pending',
      meeting_link: 'https://meet.google.com/law-counseling-tn'
    },
    {
      id: 'sess-p3',
      title: 'Anna University Campus Placements & Core Engineering Career Roadmap',
      mentor_name: 'Er. K. Senthil Nathan',
      mentor_role: 'Senior Systems Engineer @ Zoho',
      date: '2026-07-15',
      time: '10:00 AM - 11:30 AM',
      topic: 'Core Engineering',
      price: 0,
      capacity: 150,
      registeredCount: 88,
      status: 'approved',
      meeting_link: 'https://meet.google.com/anna-univ-core'
    }
  ]);

  const counts = {
    pending: sessions.filter((s) => s.status === 'pending').length,
    approved: sessions.filter((s) => s.status === 'approved').length,
    all: sessions.length
  };

  const handleApprove = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
    );
    setActionSuccess(isTamil ? 'அமர்வு அங்கீகரிக்கப்பட்டு மாணவர் பக்கத்தில் வெளியிடப்பட்டது!' : 'Session approved and published to students catalogue!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleReject = (id) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
    setActionSuccess(isTamil ? 'அமர்வுக்கான திருத்தக் குறிப்பு வழிகாட்டிக்கு அனுப்பப்பட்டது.' : 'Session sent back for revisions.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mentor_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'நிர்வாக டாஷ்போர்டுக்குத் திரும்பு' : 'Back to Admin Dashboard'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid var(--navy-900)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--navy-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} color="var(--navy-900)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {t?.placeholders?.adminSessionsTitle || (isTamil ? 'வழிகாட்டல் அமர்வுகள் மதிப்பாய்வு' : 'Sessions Review Queue')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t?.placeholders?.adminSessionsDesc || (isTamil ? 'வழிகாட்டிகள் சமர்ப்பித்த அமர்வுகளை மதிப்பாய்வு செய்து அங்கீகரிக்கவும்.' : 'Review, approve, or request revisions on mentor session proposals.')}
            </p>
          </div>
        </div>

        {/* Phase Notice */}
        <div className="modal-alert-success" style={{ background: 'rgba(0, 166, 191, 0.08)', borderColor: 'rgba(0, 166, 191, 0.3)', color: 'var(--navy-900)', marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={16} color="var(--cyan-700)" />
          <span style={{ fontSize: '0.825rem' }}>
            <strong>{isTamil ? 'கட்டம் 1 நிலை:' : 'Phase 1 Status:'}</strong>{' '}
            {t?.placeholders?.phaseNotice || (isTamil ? 'இந்த பகுதி கட்டம் 4-ல் முழுமையான தரவுத்தள கட்டுப்பாடுகளுடன் இயக்கப்படும்.' : 'This review queue will connect to real database RLS and triggers in Phase 4.')}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`filter-pill-btn ${activeFilter === 'pending' ? 'active' : ''}`}
          >
            <span>{isTamil ? 'மதிப்பாய்வு தேவை' : 'Pending Review'}</span>
            <span className="count-badge">{counts.pending}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('approved')}
            className={`filter-pill-btn ${activeFilter === 'approved' ? 'active' : ''}`}
          >
            <span>{isTamil ? 'அங்கீகரிக்கப்பட்டவை' : 'Approved'}</span>
            <span className="count-badge">{counts.approved}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <span>{isTamil ? 'அனைத்தும்' : 'All'}</span>
            <span className="count-badge">{counts.all}</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={isTamil ? 'அமர்வு / வழிகாட்டி தேடுக...' : 'Search session or mentor...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredSessions.map((session) => (
          <div key={session.id} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className={`mentor-status-badge status-${session.status === 'approved' ? 'approved' : 'pending_review'}`} style={{ marginBottom: '0.5rem' }}>
                  {session.status === 'approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  <span>{session.status === 'approved' ? (isTamil ? 'அங்கீகரிக்கப்பட்டது' : 'Approved') : (isTamil ? 'மதிப்பாய்வில்' : 'Pending Review')}</span>
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.35rem 0' }}>
                  {session.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {isTamil ? 'வழிகாட்டி: ' : 'Proposed by: '}<strong>{session.mentor_name}</strong> • {session.topic}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {session.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReject(session.id)}
                      className="btn btn-outline"
                      style={{ color: '#dc2626', borderColor: '#fca5a5', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <X size={15} />
                      <span>{isTamil ? 'மாற்றங்களைக் கோரு' : 'Request Changes'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(session.id)}
                      className="btn btn-primary"
                      style={{ background: '#166534', borderColor: '#166534', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <Check size={15} />
                      <span>{isTamil ? 'அங்கீகரி' : 'Approve Session'}</span>
                    </button>
                  </>
                )}
                {session.status === 'approved' && (
                  <span style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} />
                    <span>{isTamil ? 'மாணவர்களுக்குக் காட்டப்படுகிறது' : 'Live on Students Sessions Page'}</span>
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-secondary)', background: '#F8FAFC', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
              <span>📅 {session.date}</span>
              <span>⏰ {session.time}</span>
              <span>👥 {session.registeredCount} / {session.capacity} {isTamil ? 'மாணவர்கள்' : 'Students'}</span>
              <span>🔗 {session.meeting_link}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminSessionsPage;
