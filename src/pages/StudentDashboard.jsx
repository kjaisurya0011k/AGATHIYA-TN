import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialOpportunities, initialSessions } from '../data/appData';
import { OpportunityCard } from '../components/OpportunityCard';
import { SessionCard } from '../components/SessionCard';
import {
  GraduationCap,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Building,
  Sparkles,
  ArrowRight,
  Download,
  LogOut,
  UserCheck
} from 'lucide-react';

export function StudentDashboard() {
  const { lang } = useLanguage();
  const { user, profile, savedOpportunities, registeredSessions, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const savedList = initialOpportunities.filter((opp) => savedOpportunities.includes(opp.id));
  const registeredList = initialSessions.filter((s) => registeredSessions.includes(s.id));

  const actionSteps = [
    {
      id: 1,
      title_ta: 'பள்ளித் தலைமை ஆசிரியரிடம் 6 முதல் 12-ஆம் வகுப்பு Bonafide சான்றிதழ் பெறவும்',
      title_en: 'Collect Classes 6-12 Govt School Bonafide Certificate from School Headmaster',
      status: 'pending',
      actionUrl: '/opportunities/tn-7point5-quota',
      actionText_ta: 'மாதிரி படிவத்தைப் பார்க்க',
      actionText_en: 'View Format'
    },
    {
      id: 2,
      title_ta: 'இ-சேவை மையம் மூலம் "முதல் பட்டதாரி" (First Graduate) சான்றிதழுக்கு விண்ணப்பிக்கவும்',
      title_en: 'Apply for First Graduate Certificate at local e-Sevai Center',
      status: 'in-progress',
      actionUrl: '/opportunities/first-graduate-waiver',
      actionText_ta: 'தேவையான ஆவணங்கள்',
      actionText_en: 'View Checklist'
    },
    {
      id: 3,
      title_ta: 'TNEA பொறியியல் ஒற்றைச் சாளர இணையதளத்தில் பதிவு செய்யவும்',
      title_en: 'Complete Online Registration on the official TNEA portal',
      status: 'upcoming',
      actionUrl: 'https://www.tneaonline.org',
      isExternal: true,
      actionText_ta: 'tneaonline.org செல்க',
      actionText_en: 'Open tneaonline.org'
    },
    {
      id: 4,
      title_ta: 'ஜூன் 20 நடைபெறும் நேரடி TNEA சாய்ஸ் ஃபில்லிங் வழிகாட்டல் வெபினாரில் பங்கேற்கவும்',
      title_en: 'Attend Live TNEA Choice Filling Workshop on June 20',
      status: 'registered',
      actionUrl: '/sessions',
      actionText_ta: 'அமர்வு விபரம்',
      actionText_en: 'Session Details'
    }
  ];

  return (
    <div className="page-wrapper container">
      {/* Student Greeting Banner */}
      <div className="card dashboard-hero-card">
        <div className="dash-hero-info">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-cyan">
              {lang === 'ta' ? 'மாணவர் கட்டுப்பாட்டு மையம்' : 'Student Dashboard'}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Link to="/profile" className="btn btn-sm btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                <UserCheck size={15} />
                <span>{lang === 'ta' ? 'என் சுயவிவரம்' : 'My Profile'}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn btn-sm btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', minHeight: '44px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', borderColor: '#fca5a5', whiteSpace: 'nowrap' }}
                title={lang === 'ta' ? 'வெளியேற' : 'Sign Out'}
              >
                <LogOut size={15} />
                <span>{lang === 'ta' ? 'வெளியேற' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
          <h1 className="dash-hero-title">
            {lang === 'ta' ? 'வணக்கம், ' : 'Welcome, '}
            {profile?.full_name || 'K. Muthu Kumar'}!
          </h1>
          <p className="dash-hero-sub">
            {lang === 'ta'
              ? 'உங்கள் 12-ஆம் வகுப்பு உயர்கல்வி சேர்க்கைக்கான அடுத்த கட்ட தயாரிப்பு நிலைகள் இங்கே உள்ளன.'
              : 'Here is your personalized roadmap for Tamil Nadu higher education admissions.'}
          </p>

          <div className="dash-profile-meta">
            <span>
              <MapPin size={13} /> {profile?.district || 'Dharmapuri'}
            </span>
            <span>
              <Building size={13} /> {profile?.school_type || 'Govt Higher Secondary School'}
            </span>
            <span className="meta-highlight">
              <Sparkles size={13} /> {lang === 'ta' ? '7.5% அரசு ஒதுக்கீடு தகுதி' : '7.5% Quota Eligible'}
            </span>
          </div>
        </div>

        {/* Quick Guidance Sessions Widget */}
        <div className="dash-cutoff-widget">
          <div className="widget-header">
            <Calendar size={15} />
            <span>{lang === 'ta' ? 'வழிகாட்டல் அமர்வுகள்' : 'Guidance Sessions'}</span>
          </div>
          <div className="widget-score">
            <strong>{registeredSessions?.length || 0}</strong>
            <span style={{ fontSize: '0.85rem', marginLeft: '0.35rem', fontWeight: 600 }}>{lang === 'ta' ? 'பதிவு செய்தவை' : 'Registered'}</span>
          </div>
          <p className="widget-note">
            {lang === 'ta' ? 'நேரலை ஆலோசனை மற்றும் வழிகாட்டல்' : 'Live Guidance & Counseling'}
          </p>
          <Link to="/sessions" className="widget-link">
            {lang === 'ta' ? 'அமர்வுகள் பார்க்க →' : 'View Sessions →'}
          </Link>
        </div>
      </div>

      {/* Recommended Next Steps */}
      <div className="section-padding-sm">
        <div className="section-header">
          <span className="section-tag purple">
            {lang === 'ta' ? 'அடுத்த கட்ட வழிகாட்டல்' : 'Action Roadmap'}
          </span>
          <h2 className="section-title">
            {lang === 'ta' ? 'நீங்கள் செய்ய வேண்டிய முக்கிய அடுத்த படிகள்' : 'Recommended Next Steps for Admission'}
          </h2>
        </div>

        <div className="steps-list">
          {actionSteps.map((step) => (
            <div key={step.id} className="card step-item-card">
              <div className="step-num-wrap">{step.id}</div>
              <div className="step-body">
                <h3 className="step-title">
                  {lang === 'ta' ? step.title_ta : step.title_en}
                </h3>
              </div>
              <div className="step-action">
                {step.isExternal ? (
                  <a
                    href={step.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    <span>{lang === 'ta' ? step.actionText_ta : step.actionText_en}</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <Link to={step.actionUrl} className="btn btn-sm btn-outline">
                    <span>{lang === 'ta' ? step.actionText_ta : step.actionText_en}</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Grid: Saved Schemes & Registered Sessions */}
      <div className="dash-two-col-grid section-padding-sm">
        {/* Saved Opportunities */}
        <div>
          <div className="section-header-flex">
            <h3 className="sub-section-title">
              <Bookmark size={18} color="var(--navy-900)" />
              <span>
                {lang === 'ta'
                  ? `சேமித்த வாய்ப்புகள் (${savedList.length})`
                  : `Saved Opportunities (${savedList.length})`}
              </span>
            </h3>
            <Link to="/opportunities" className="btn btn-sm btn-outline">
              <span>{lang === 'ta' ? 'அனைத்தும்' : 'Browse'}</span>
            </Link>
          </div>

          <div className="dash-cards-stack">
            {savedList.length > 0 ? (
              savedList.slice(0, 2).map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))
            ) : (
              <div className="card dash-empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <Bookmark size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                  {lang === 'ta' ? 'வாய்ப்புகள் எதுவும் சேமிக்கப்படவில்லை' : 'No saved opportunities yet'}
                </p>
                <Link to="/opportunities" className="btn btn-sm btn-outline">
                  <span>{lang === 'ta' ? 'வாய்ப்புகளைப் பார்க்க' : 'Browse Opportunities'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Registered Sessions */}
        <div>
          <div className="section-header-flex">
            <h3 className="sub-section-title">
              <Calendar size={18} color="var(--purple-600)" />
              <span>
                {lang === 'ta'
                  ? `பதிவு செய்த அமர்வுகள் (${registeredList.length})`
                  : `Enrolled Workshops (${registeredList.length})`}
              </span>
            </h3>
            <Link to="/sessions" className="btn btn-sm btn-outline">
              <span>{lang === 'ta' ? 'அனைத்தும்' : 'Browse'}</span>
            </Link>
          </div>

          <div className="dash-cards-stack">
            {registeredList.length > 0 ? (
              registeredList.slice(0, 2).map((s) => (
                <SessionCard key={s.id} session={s} />
              ))
            ) : (
              <div className="card dash-empty-state" style={{ padding: '2rem 1rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <Calendar size={28} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                  {lang === 'ta' ? 'அமர்வுகள் எதுவும் பதிவு செய்யப்படவில்லை' : 'No sessions registered yet'}
                </p>
                <Link to="/sessions" className="btn btn-sm btn-primary">
                  <span>{lang === 'ta' ? 'பயிலரங்குகளைப் பார்க்க' : 'Browse Workshops'}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
