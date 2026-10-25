import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { SessionCard } from '../components/SessionCard';
import { brand } from '../data/brand';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { PaymentModal } from '../components/PaymentModal';
import { submitStudentPayment } from '../lib/payments';
import {
  Calendar,
  Users,
  CheckCircle,
  Video,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Search,
  Filter,
  X,
  ArrowRight
} from 'lucide-react';

export function SessionsPage() {
  const { lang, t } = useLanguage();
  const { registeredSessions, fetchApprovedSessions, mentorSessions, user, profile, registerForSession } = useAuth();
  
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');

  const isTamil = lang === 'ta';
  const sessLang = t?.studentSessions || {};

  // Fetch approved upcoming sessions from Supabase/AuthContext
  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      setLoading(true);
      try {
        if (fetchApprovedSessions) {
          const res = await fetchApprovedSessions();
          if (isMounted && res?.data) {
            setSessions(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching approved sessions:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSessions();
    return () => {
      isMounted = false;
    };
  }, [fetchApprovedSessions, mentorSessions]);

  // Extract unique topics for dropdown filter
  const topicsList = useMemo(() => {
    const set = new Set();
    sessions.forEach((s) => {
      if (s.topic?.trim()) {
        set.add(s.topic.trim());
      }
    });
    return Array.from(set);
  }, [sessions]);

  // Filtered sessions based on Tab, Topic, and Search
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // 1. Tab filter
      if (activeTab === 'registered') {
        if (!registeredSessions.includes(s.id)) return false;
      } else if (activeTab === 'free') {
        const price = s.price_inr !== undefined ? s.price_inr : s.price || 0;
        if (price > 0 && !s.is_free) return false;
      }

      // 2. Topic filter
      if (selectedTopic !== 'all') {
        if (s.topic?.toLowerCase() !== selectedTopic.toLowerCase()) return false;
      }

      // 3. Keyword Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleEn = s.title_en?.toLowerCase() || '';
        const titleTa = s.title_ta?.toLowerCase() || '';
        const descEn = s.description_en?.toLowerCase() || '';
        const descTa = s.description_ta?.toLowerCase() || '';
        const mentor = (s.mentor_name || s.profiles?.full_name || '').toLowerCase();
        const topic = (s.topic || '').toLowerCase();

        const match =
          titleEn.includes(q) ||
          titleTa.includes(q) ||
          descEn.includes(q) ||
          descTa.includes(q) ||
          mentor.includes(q) ||
          topic.includes(q);

        if (!match) return false;
      }

      return true;
    });
  }, [sessions, activeTab, selectedTopic, searchQuery, registeredSessions]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTopic('all');
    setActiveTab('all');
  };

  const [stickyPaySession, setStickyPaySession] = useState(null);

  // Identify next upcoming workshop for mobile sticky bar
  const stickyTargetSession = useMemo(() => {
    return filteredSessions.find((s) => {
      const p = s.price_inr !== undefined ? s.price_inr : s.price || 0;
      return p > 0 && !registeredSessions.includes(s.id);
    }) || filteredSessions[0];
  }, [filteredSessions, registeredSessions]);

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <span className="section-tag cyan">
          {sessLang.pageTag || (isTamil ? 'நேரலை வழிகாட்டல்' : 'Interactive Workshops')}
        </span>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          {sessLang.pageTitle ||
            (isTamil
              ? 'தமிழ்நாடு மாணவர்களுக்கான நேரடி ஆலோசனைக் கூட்டங்கள்'
              : 'Interactive Counseling & Guidance Workshops')}
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1rem', color: '#475569', maxWidth: '780px', lineHeight: 1.6 }}>
          {sessLang.pageSubtitle ||
            (isTamil
              ? 'அண்ணா பல்கலைக்கழக முன்னாள் மாணவர்கள், அரசு மருத்துவர்கள் மற்றும் வங்கி மேலாளர்களுடன் இணைய வழி நேரடி கலந்துரையாடல்கள்.'
              : 'Direct live sessions with Anna University alumni, government medical tutors, and academic counselors for post-12th students.')}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          {/* Keyword Search Input */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={sessLang.searchPlaceholder || (isTamil ? 'தலைப்பு, வழிகாட்டி அல்லது துறை வாரியாகத் தேடு...' : 'Search by session title, topic, or mentor...')}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: searchQuery ? '2.5rem' : '1rem',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                border: '1px solid #cbd5e1'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Topic Select Dropdown */}
          <div style={{ flex: '0 1 240px', minWidth: '180px', position: 'relative' }}>
            <select
              className="form-input"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                border: '1px solid #cbd5e1',
                paddingRight: '1.5rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">{sessLang.filterAllTopics || (isTamil ? 'அனைத்து துறைகளும்' : 'All Topics')}</option>
              {topicsList.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="sessions-tabs-row" style={{ margin: 0, paddingTop: '0.25rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <Calendar size={16} />
            <span>{sessLang.tabAll || (isTamil ? 'அனைத்து அமர்வுகள்' : 'All Sessions')}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'free' ? 'active' : ''}`}
            onClick={() => setActiveTab('free')}
          >
            <Sparkles size={16} />
            <span>{sessLang.tabFree || (isTamil ? 'இலவச அமர்வுகள் (100% Free)' : '100% Free Sessions')}</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
            onClick={() => setActiveTab('registered')}
          >
            <CheckCircle size={16} />
            <span>
              {sessLang.tabRegistered
                ? `${sessLang.tabRegistered} (${registeredSessions.length})`
                : isTamil
                ? `நான் பதிவு செய்தவை (${registeredSessions.length})`
                : `My Registered (${registeredSessions.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div style={{ padding: '1rem 0' }}>
          <SkeletonLoader type="card" count={3} />
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="sessions-grid">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="card empty-state-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <HelpCircle size={44} color="var(--purple-600)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
            {activeTab === 'registered'
              ? isTamil
                ? 'நீங்கள் இன்னும் எந்த அமர்விலும் பதிவு செய்யவில்லை'
                : 'You have not registered for any sessions yet'
              : isTamil
              ? 'பொருத்தமான அமர்வுகள் எதுவும் கிடைக்கவில்லை'
              : 'No sessions found matching your filters'}
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
            {activeTab === 'registered'
              ? isTamil
                ? 'வரவிருக்கும் பயனுள்ள அமர்வுகளைப் பார்த்து உங்கள் இலவச அல்லது கட்டண இருக்கையை முன்பதிவு செய்யுங்கள்.'
                : 'Browse our upcoming workshops and reserve your seat with one click.'
              : isTamil
              ? 'உங்கள் தேடல் வார்த்தைகளை மாற்றவும் அல்லது வடிகட்டிகளை மீட்டமைக்கவும்.'
              : 'Try clearing your search query or selecting a different topic filter.'}
          </p>
          <div style={{ display: 'inline-flex', gap: '0.75rem', justifyContent: 'center' }}>
            {activeTab === 'registered' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('all')}
              >
                {isTamil ? 'வரவிருக்கும் அமர்வுகளைப் பார்க்க' : 'Browse Upcoming Sessions'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={clearFilters}
              >
                {isTamil ? 'வடிகட்டிகளை மீட்டமை' : 'Reset Filters'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mentor Volunteer Invitation Banner */}
      <div className="card mentor-invite-banner" style={{ marginTop: '3rem' }}>
        <div className="mentor-invite-content">
          <GraduationCap size={36} color="var(--navy-900)" style={{ flexShrink: 0 }} />
          <div>
            <h3 className="mentor-invite-title">
              {isTamil
                ? 'நீங்கள் கல்லூரியில் பயிலும் மாணவரா அல்லது பட்டதாரியா?'
                : 'Are you an engineer, doctor, or graduate from Tamil Nadu?'}
            </h3>
            <p className="mentor-invite-desc">
              {isTamil
                ? `உங்கள் ஊர் மற்றும் கிராமப்புற 12-ஆம் வகுப்பு தம்பிகள், தங்கைகளுக்கு வழிகாட்ட முன்வாருங்கள். ${brand.name}-இல் வழிகாட்டியாக (Mentor) இணைந்து உங்கள் அனுபவங்களை பகிர்ந்துகொள்ளுங்கள்.`
                : `Share your genuine counseling experiences and guide rural Class 12 students. Join as an ${brand.name} verified mentor.`}
            </p>
          </div>
        </div>
        <Link to={user ? '/profile' : '/login'} className="btn btn-outline" style={{ flexShrink: 0, fontWeight: 700 }}>
          {isTamil ? 'வழிகாட்டியாக இணைய' : 'Join as Mentor'}
        </Link>
      </div>

      {/* Sticky Mobile Pay Bar on Sessions Page (< 768px) */}
      {stickyTargetSession && (
        <div className="sessions-mobile-sticky-pay-bar">
          <div className="sms-pay-info">
            <span className="sms-pay-title">
              {isTamil && stickyTargetSession.title_ta ? stickyTargetSession.title_ta : stickyTargetSession.title_en}
            </span>
            <span className="sms-pay-price">
              {(stickyTargetSession.price_inr !== undefined ? stickyTargetSession.price_inr : stickyTargetSession.price || 0) > 0
                ? `₹${stickyTargetSession.price_inr !== undefined ? stickyTargetSession.price_inr : stickyTargetSession.price || 0}`
                : (isTamil ? 'இலவசம்' : 'Free')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const p = stickyTargetSession.price_inr !== undefined ? stickyTargetSession.price_inr : stickyTargetSession.price || 0;
              if (p > 0) {
                setStickyPaySession(stickyTargetSession);
              } else {
                const el = document.getElementById(`session-${stickyTargetSession.id}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            className="btn btn-primary sms-pay-btn"
          >
            <span>
              {(stickyTargetSession.price_inr !== undefined ? stickyTargetSession.price_inr : stickyTargetSession.price || 0) > 0
                ? (isTamil ? `₹${stickyTargetSession.price_inr || stickyTargetSession.price} செலுத்து` : `Pay ₹${stickyTargetSession.price_inr || stickyTargetSession.price}`)
                : (isTamil ? 'இணையுங்கள்' : 'Register')}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Payment Modal if triggered from sticky pay bar */}
      {stickyPaySession && (
        <PaymentModal
          isOpen={Boolean(stickyPaySession)}
          onClose={() => setStickyPaySession(null)}
          session={stickyPaySession}
          onConfirmPaid={async (transactionRef) => {
            await submitStudentPayment({
              sessionId: stickyPaySession.id,
              user,
              profile,
              sessionObj: stickyPaySession,
              transactionRef
            });
            if (!registeredSessions.includes(stickyPaySession.id) && registerForSession) {
              await registerForSession(stickyPaySession.id, stickyPaySession);
            }
            setStickyPaySession(null);
            window.dispatchEvent(
              new CustomEvent('agathiya-payment-updated', {
                detail: { sessionId: stickyPaySession.id, status: 'pending' }
              })
            );
          }}
          isTamil={isTamil}
        />
      )}
    </div>
  );
}

export default SessionsPage;

