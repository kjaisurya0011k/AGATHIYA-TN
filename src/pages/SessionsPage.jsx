import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialSessions } from '../data/appData';
import { SessionCard } from '../components/SessionCard';
import {
  Calendar,
  Users,
  CheckCircle,
  Video,
  Sparkles,
  HelpCircle,
  GraduationCap
} from 'lucide-react';

export function SessionsPage() {
  const { lang, t } = useLanguage();
  const { registeredSessions, user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');

  const filteredSessions = initialSessions.filter((s) => {
    if (activeTab === 'registered') {
      return registeredSessions.includes(s.id);
    }
    if (activeTab === 'free') {
      return s.is_free;
    }
    return true;
  });

  return (
    <div className="page-wrapper container">
      {/* Header */}
      <div className="page-header">
        <span className="section-tag cyan">
          {lang === 'ta' ? 'வழிகாட்டல் வெபினார்கள்' : 'Mentorship Sessions'}
        </span>
        <h1 className="page-title">
          {lang === 'ta'
            ? 'தமிழ்நாடு மாணவர்களுக்கான நேரடி ஆலோசனைக் கூட்டங்கள்'
            : 'Interactive Counseling & Guidance Workshops'}
        </h1>
        <p className="page-subtitle">
          {lang === 'ta'
            ? 'அண்ணா பல்கலைக்கழக முன்னாள் மாணவர்கள், அரசு மருத்துவர்கள் மற்றும் வங்கி மேலாளர்களுடன் இணைய வழி நேரடி கலந்துரையாடல்கள்.'
            : 'Direct live sessions with Anna University alumni, government medical tutors, and academic counselors for post-12th students.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="sessions-tabs-row">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Calendar size={16} />
          <span>{lang === 'ta' ? 'அனைத்து அமர்வுகள்' : 'All Sessions'}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'free' ? 'active' : ''}`}
          onClick={() => setActiveTab('free')}
        >
          <Sparkles size={16} />
          <span>{lang === 'ta' ? 'இலவச அமர்வுகள் (100% Free)' : 'Free Sessions Only'}</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          <CheckCircle size={16} />
          <span>
            {lang === 'ta'
              ? `நான் பதிவு செய்தவை (${registeredSessions.length})`
              : `My Registered (${registeredSessions.length})`}
          </span>
        </button>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="sessions-grid">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="card empty-state-card">
          <HelpCircle size={40} color="var(--purple-600)" />
          <h3>
            {activeTab === 'registered'
              ? lang === 'ta'
                ? 'நீங்கள் இன்னும் எந்த அமர்விலும் பதிவு செய்யவில்லை'
                : 'You have not registered for any sessions yet'
              : lang === 'ta'
              ? 'அமர்வுகள் எதுவும் இல்லை'
              : 'No sessions found'}
          </h3>
          <p>
            {activeTab === 'registered'
              ? lang === 'ta'
                ? 'வரவிருக்கும் அமர்வுகளைப் பார்த்து உங்கள் இலவச இருக்கையை முன்பதிவு செய்யுங்கள்.'
                : 'Browse our upcoming workshops and reserve your free seat with one click.'
              : lang === 'ta'
              ? 'வடிகட்டிகளை மாற்றவும்.'
              : 'Try changing your filter selection.'}
          </p>
          {activeTab === 'registered' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('all')}
            >
              {lang === 'ta' ? 'வரவிருக்கும் அமர்வுகளைப் பார்க்க' : 'Browse Upcoming Sessions'}
            </button>
          )}
        </div>
      )}

      {/* Mentor Volunteer Invitation Banner */}
      <div className="card mentor-invite-banner">
        <div className="mentor-invite-content">
          <GraduationCap size={32} color="var(--navy-900)" />
          <div>
            <h3 className="mentor-invite-title">
              {lang === 'ta'
                ? 'நீங்கள் கல்லூரியில் பயிலும் மாணவரா அல்லது பட்டதாரியா?'
                : 'Are you an engineer, doctor, or graduate from Tamil Nadu?'}
            </h3>
            <p className="mentor-invite-desc">
              {lang === 'ta'
                ? 'உங்கள் ஊர் மற்றும் கிராமப்புற 12-ஆம் வகுப்பு தம்பிகள், தங்கைகளுக்கு வழிகாட்ட முன்வாருங்கள். EEE-TN-இல் வழிகாட்டியாக (Mentor) இணையுங்கள்.'
                : 'Share your genuine counseling experiences and guide rural Class 12 students. Join as an EEE-TN verified mentor.'}
            </p>
          </div>
        </div>
        <Link to="/login" className="btn btn-outline">
          {lang === 'ta' ? 'வழிகாட்டியாக இணைய' : 'Join as Mentor'}
        </Link>
      </div>
    </div>
  );
}
