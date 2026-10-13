import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialOpportunities, initialSessions } from '../data/appData';
import { OpportunityCard } from '../components/OpportunityCard';
import { SessionCard } from '../components/SessionCard';
import {
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Clock,
  Sparkles,
  MapPin,
  Building,
  User,
  ArrowRight
} from 'lucide-react';

export function AchievementsPage() {
  const { lang } = useLanguage();
  const { user, profile, savedOpportunities, registeredSessions } = useAuth();

  const savedList = initialOpportunities.filter((opp) => savedOpportunities.includes(opp.id));
  const registeredList = initialSessions.filter((s) => registeredSessions.includes(s.id));

  // Milestone tasks
  const milestones = [
    {
      id: 'm1',
      title_ta: 'TNEA பொறியியல் கட்-ஆஃப் கணக்கிடப்பட்டது',
      title_en: 'TNEA Engineering Cutoff Calculated',
      status: 'completed',
      date: '2026-05-12'
    },
    {
      id: 'm2',
      title_ta: '7.5% அரசுப் பள்ளி இடஒதுக்கீடு தகுதி சரிபார்க்கப்பட்டது',
      title_en: '7.5% Govt School Quota Eligibility Verified',
      status: 'completed',
      date: '2026-05-14'
    },
    {
      id: 'm3',
      title_ta: 'முதல் பட்டதாரி சான்றிதழ் ஆவணங்கள் தயார் செய்யப்பட்டது',
      title_en: 'First Graduate Certificate Documents Prepared',
      status: 'completed',
      date: '2026-05-18'
    },
    {
      id: 'm4',
      title_ta: 'கவுன்சிலிங் கல்லூரி விருப்பப் பட்டியல் தயாரித்தல்',
      title_en: 'Counseling Choice Filling Strategy Finalization',
      status: 'in-progress',
      date: '2026-06-10'
    }
  ];

  return (
    <div className="page-wrapper container">
      {/* Top Header */}
      <div className="page-header">
        <span className="section-tag purple">
          {lang === 'ta' ? 'மாணவர் மைல்ஸ்டோன்கள்' : 'Student Portfolio'}
        </span>
        <h1 className="page-title">
          {lang === 'ta' ? 'என் சாதனைகள் & சேமித்த வாய்ப்புகள்' : 'Achievements & Saved Opportunities'}
        </h1>
        <p className="page-subtitle">
          {lang === 'ta'
            ? 'உங்கள் உயர்கல்வி முன்னேற்றம், சேமிக்கப்பட்ட உதவித்தொகைகள் மற்றும் பதிவு செய்த வழிகாட்டல் அமர்வுகள்.'
            : 'Track your admission progress, bookmarked scholarships, and enrolled mentor guidance sessions.'}
        </p>
      </div>

      {/* Student Profile Summary Card */}
      <div className="card student-summary-card">
        <div className="summary-left">
          <div className="student-avatar-lg">
            {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div className="student-info">
            <h2 className="student-name">
              {profile?.full_name || (lang === 'ta' ? 'கே. முத்து குமார்' : 'K. Muthu Kumar')}
            </h2>
            <div className="student-tags-row">
              <span className="badge badge-navy">
                <MapPin size={12} />
                <span>{profile?.district || (lang === 'ta' ? 'தருமபுரி மாவட்டம்' : 'Dharmapuri')}</span>
              </span>
              <span className="badge badge-purple">
                <Building size={12} />
                <span>{profile?.school_type || (lang === 'ta' ? 'அரசு மாதிரி மேல்நிலைப் பள்ளி' : 'Govt Model School')}</span>
              </span>
              <span className="badge badge-green">
                <Sparkles size={12} />
                <span>{lang === 'ta' ? '7.5% ஒதுக்கீட்டிற்கு தகுதியுடையவர்' : '7.5% Quota Eligible'}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="summary-stats-grid">
          <div className="stat-box">
            <span className="stat-number">{savedOpportunities.length}</span>
            <span className="stat-label">
              {lang === 'ta' ? 'சேமித்த வாய்ப்புகள்' : 'Saved Schemes'}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-number">{registeredSessions.length}</span>
            <span className="stat-label">
              {lang === 'ta' ? 'பதிவு செய்த அமர்வுகள்' : 'Registered Sessions'}
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-number">3/4</span>
            <span className="stat-label">
              {lang === 'ta' ? 'முடிந்த மைல்ஸ்டோன்கள்' : 'Milestones'}
            </span>
          </div>
        </div>
      </div>

      {/* Learning Milestones Section */}
      <div className="section-padding-sm">
        <div className="section-header-flex">
          <div>
            <h3 className="sub-section-title">
              <Award size={20} color="var(--purple-600)" />
              <span>{lang === 'ta' ? 'முடித்த தயாரிப்பு நிலைகள்' : 'Admissions Milestones Progress'}</span>
            </h3>
          </div>
        </div>

        <div className="milestones-grid">
          {milestones.map((m) => (
            <div key={m.id} className="card milestone-card">
              <div className="milestone-icon-wrap">
                {m.status === 'completed' ? (
                  <CheckCircle2 size={22} color="#16a34a" />
                ) : (
                  <Clock size={22} color="var(--purple-600)" />
                )}
              </div>
              <div className="milestone-content">
                <h4 className="milestone-title">
                  {lang === 'ta' ? m.title_ta : m.title_en}
                </h4>
                <div className="milestone-meta">
                  <span className={`status-pill ${m.status}`}>
                    {m.status === 'completed'
                      ? lang === 'ta'
                        ? 'முடிந்தது'
                        : 'Completed'
                      : lang === 'ta'
                      ? 'செயலில் உள்ளது'
                      : 'In Progress'}
                  </span>
                  <span className="milestone-date">{m.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Opportunities Section */}
      <div className="section-padding-sm">
        <div className="section-header-flex">
          <div>
            <h3 className="sub-section-title">
              <Bookmark size={20} color="var(--navy-900)" />
              <span>
                {lang === 'ta'
                  ? `சேமிக்கப்பட்ட உதவித்தொகைகள் (${savedList.length})`
                  : `Saved Opportunities (${savedList.length})`}
              </span>
            </h3>
          </div>
          <Link to="/opportunities" className="btn btn-sm btn-outline">
            <span>{lang === 'ta' ? 'கூடுதல் வாய்ப்புகளைப் பார்க்க' : 'Explore More'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {savedList.length > 0 ? (
          <div className="opportunities-grid">
            {savedList.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        ) : (
          <div className="card empty-state-box">
            <Bookmark size={36} color="var(--text-muted)" />
            <p>
              {lang === 'ta'
                ? 'நீங்கள் இன்னும் எந்த வாய்ப்பையும் சேமிக்கவில்லை.'
                : 'You have not bookmarked any opportunities yet.'}
            </p>
            <Link to="/opportunities" className="btn btn-sm btn-primary">
              {lang === 'ta' ? 'உதவித்தொகைகளைப் பார்க்க' : 'Browse Opportunities'}
            </Link>
          </div>
        )}
      </div>

      {/* Registered Sessions Section */}
      <div className="section-padding-sm">
        <div className="section-header-flex">
          <div>
            <h3 className="sub-section-title">
              <Calendar size={20} color="var(--cyan-600)" />
              <span>
                {lang === 'ta'
                  ? `பதிவு செய்த அமர்வுகள் (${registeredList.length})`
                  : `Registered Mentor Sessions (${registeredList.length})`}
              </span>
            </h3>
          </div>
          <Link to="/sessions" className="btn btn-sm btn-outline">
            <span>{lang === 'ta' ? 'அனைத்து அமர்வுகள்' : 'All Sessions'}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {registeredList.length > 0 ? (
          <div className="sessions-grid">
            {registeredList.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <div className="card empty-state-box">
            <Calendar size={36} color="var(--text-muted)" />
            <p>
              {lang === 'ta'
                ? 'நீங்கள் இன்னும் எந்த அமர்விலும் பதிவு செய்யவில்லை.'
                : 'No workshops registered yet.'}
            </p>
            <Link to="/sessions" className="btn btn-sm btn-primary">
              {lang === 'ta' ? 'இலவச அமர்வில் இணைய' : 'Register for a Session'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
