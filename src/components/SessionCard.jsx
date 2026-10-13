import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  Users,
  CheckCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';

export function SessionCard({ session }) {
  const { lang } = useLanguage();
  const { registeredSessions, registerSession, cancelSession, user } = useAuth();
  const [successMsg, setSuccessMsg] = useState(false);

  const isRegistered = registeredSessions.includes(session.id);

  const title = lang === 'ta' ? session.title_ta : session.title_en;
  const mentorRole = lang === 'ta' ? session.mentor_role_ta : session.mentor_role_en;
  const topics = lang === 'ta' ? session.topics_ta : session.topics_en;

  const handleRegister = () => {
    if (isRegistered) {
      cancelSession(session.id);
    } else {
      registerSession(session.id);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="card session-card">
      {/* Session Top Bar: Free Badge & Date */}
      <div className="session-top">
        <div className="session-date-badge">
          <Calendar size={14} />
          <span>{session.date}</span>
        </div>
        <div className="session-price-badge">
          {session.is_free ? (
            <span className="badge badge-green">
              {lang === 'ta' ? 'இலவசம் (100% Free)' : '100% Free'}
            </span>
          ) : (
            <span className="badge badge-purple">₹{session.price}</span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="session-title">{title}</h3>

      {/* Mentor Info */}
      <div className="session-mentor">
        <div className="mentor-avatar">
          {session.mentor_name.charAt(0)}
        </div>
        <div className="mentor-details">
          <h4 className="mentor-name">{session.mentor_name}</h4>
          <p className="mentor-role">{mentorRole}</p>
        </div>
      </div>

      {/* Time & Platform */}
      <div className="session-meta-grid">
        <div className="meta-item">
          <Clock size={14} color="var(--text-muted)" />
          <span>{session.time}</span>
        </div>
        <div className="meta-item">
          <Video size={14} color="var(--cyan-600)" />
          <span>{session.mode}</span>
        </div>
      </div>

      {/* Topics Covered */}
      <div className="session-topics">
        <span className="topics-label">
          {lang === 'ta' ? 'கலந்துரையாடப்படும் அம்சங்கள்:' : 'Key Discussion Topics:'}
        </span>
        <ul className="topics-list">
          {topics?.slice(0, 3).map((topic, idx) => (
            <li key={idx}>
              <span className="bullet-dot" />
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer: Seats & Register Action */}
      <div className="session-footer">
        <div className="seats-indicator">
          <Users size={14} />
          <span>
            <strong>{session.seats_booked}</strong> / {session.seats_total}{' '}
            {lang === 'ta' ? 'பதிவு செய்யப்பட்டுள்ளது' : 'registered'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleRegister}
          className={`btn btn-sm ${isRegistered ? 'btn-outline-registered' : 'btn-primary'}`}
        >
          {isRegistered ? (
            <>
              <CheckCircle size={15} color="#16a34a" />
              <span>{lang === 'ta' ? 'பதிவு செய்யப்பட்டது' : 'Registered'}</span>
            </>
          ) : (
            <>
              <UserCheck size={15} />
              <span>{lang === 'ta' ? 'இலவச பதிவு' : 'Register Free'}</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="session-toast">
          ✓ {lang === 'ta' ? 'அமர்வில் உங்கள் பதிவு உறுதியானது! கூகுள் மீட் இணைப்பு மின்னஞ்சலுக்கு அனுப்பப்படும்.' : 'Seat confirmed! Meeting link sent to your registered profile.'}
        </div>
      )}
    </div>
  );
}
