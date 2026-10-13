import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialSessions } from '../data/appData';
import {
  Users,
  Calendar,
  PlusCircle,
  Video,
  Star,
  CheckCircle2,
  FileText,
  Clock,
  MapPin,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export function MentorDashboard() {
  const { lang } = useLanguage();
  const { profile } = useAuth();
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [sessionList, setSessionList] = useState(initialSessions);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTopics, setNewTopics] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = {
      id: `session-${Date.now()}`,
      title_ta: newTitle,
      title_en: newTitle,
      mentor_name: profile?.full_name || 'Er. K. Senthil Nathan',
      mentor_role_ta: 'வழிகாட்டி (Mentor)',
      mentor_role_en: 'Career Mentor',
      date: newDate || '2026-07-15',
      time: newTime || '11:00 AM - 12:30 PM IST',
      mode: 'Online (Google Meet)',
      is_free: true,
      price: 0,
      seats_total: 100,
      seats_booked: 1,
      status: 'pending_approval',
      topics_ta: newTopics.split(',').map((t) => t.trim()),
      topics_en: newTopics.split(',').map((t) => t.trim())
    };

    setSessionList([created, ...sessionList]);
    setShowProposeModal(false);
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewTopics('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  return (
    <div className="page-wrapper container">
      {/* Mentor Banner */}
      <div className="card mentor-profile-banner">
        <div className="mentor-banner-left">
          <div className="mentor-avatar-lg">
            {profile?.full_name ? profile.full_name.charAt(0) : 'S'}
          </div>
          <div>
            <span className="badge badge-purple">
              {lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட வழிகாட்டி' : 'Verified Mentor'}
            </span>
            <h1 className="mentor-banner-name">
              {profile?.full_name || 'Er. K. Senthil Nathan'}
            </h1>
            <p className="mentor-banner-role">
              {profile?.designation || 'Senior Lead Engineer & Career Mentor (Anna Univ Alumnus)'}
            </p>

            <div className="mentor-expertise-tags">
              {(profile?.expertise || ['TNEA Counseling', 'Anna University', 'Software Careers']).map(
                (exp, i) => (
                  <span key={i} className="expertise-tag">
                    {exp}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div className="mentor-banner-stats">
          <div className="m-stat-box">
            <span className="m-stat-val">14</span>
            <span className="m-stat-label">
              {lang === 'ta' ? 'நடத்திய அமர்வுகள்' : 'Sessions Hosted'}
            </span>
          </div>
          <div className="m-stat-box">
            <span className="m-stat-val">840+</span>
            <span className="m-stat-label">
              {lang === 'ta' ? 'பயன்பெற்ற மாணவர்கள்' : 'Students Guided'}
            </span>
          </div>
          <div className="m-stat-box">
            <span className="m-stat-val text-green">4.9 ★</span>
            <span className="m-stat-label">
              {lang === 'ta' ? 'மாணவர் மதிப்பீடு' : 'Student Rating'}
            </span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="alert-box-success card">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>
            {lang === 'ta'
              ? 'உங்கள் புதிய வழிகாட்டல் அமர்வு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! நிர்வாக ஒப்புதலுக்குப் பின் மாணவர்கள் முன்பதிவு செய்யலாம்.'
              : 'New session submitted successfully! It will be live for student bookings once verified by admin.'}
          </span>
        </div>
      )}

      {/* Action Header */}
      <div className="section-padding-sm">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">
              {lang === 'ta' ? 'என் வழிகாட்டல் அமர்வுகள்' : 'My Mentorship Workshops'}
            </h2>
            <p className="section-subtitle">
              {lang === 'ta'
                ? 'நீங்கள் நடத்தும் வகுப்புகள், பதிவு செய்த மாணவர்கள் எண்ணிக்கை மற்றும் கூகுள் மீட் இணைப்புகள்.'
                : 'Manage your active guidance sessions, view registered students, and access meeting links.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowProposeModal(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>{lang === 'ta' ? 'புதிய அமர்வை உருவாக்க' : 'Propose New Session'}</span>
          </button>
        </div>

        {/* Sessions Table / List */}
        <div className="mentor-sessions-list">
          {sessionList.map((session) => (
            <div key={session.id} className="card mentor-session-row">
              <div className="row-left">
                <div className="row-date-badge">
                  <Calendar size={14} />
                  <span>{session.date}</span>
                </div>
                <div>
                  <h3 className="row-title">
                    {lang === 'ta' ? session.title_ta : session.title_en}
                  </h3>
                  <div className="row-meta">
                    <span>
                      <Clock size={13} /> {session.time}
                    </span>
                    <span>
                      <Video size={13} /> {session.mode}
                    </span>
                    <span className="badge badge-cyan">
                      <Users size={12} /> {session.seats_booked} / {session.seats_total} booked
                    </span>
                  </div>
                </div>
              </div>

              <div className="row-right">
                <a
                  href="https://meet.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline"
                >
                  <Video size={14} />
                  <span>{lang === 'ta' ? 'மீட்டிங் இணைப்பு' : 'Launch Meet'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Propose Session Modal */}
      {showProposeModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="card modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {lang === 'ta' ? 'புதிய வழிகாட்டல் அமர்வை உருவாக்க' : 'Schedule New Mentorship Workshop'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="close-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="modal-form">
              <div className="form-group">
                <label className="form-label">
                  {lang === 'ta' ? 'அமர்வு தலைப்பு:' : 'Session Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. TNEA Round 2 College Choice Strategy"
                  className="form-input"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">{lang === 'ta' ? 'தேதி:' : 'Date:'}</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'ta' ? 'நேரம்:' : 'Time Slot:'}</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM - 12:00 PM IST"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {lang === 'ta' ? 'விவாதிக்கப்படும் முக்கிய தலைப்புகள் (கமாவால் பிரிக்கவும்):' : 'Key Topics (Comma separated):'}
                </label>
                <input
                  type="text"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                  placeholder="e.g. Choice order, Fee waivers, Hostel verification"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="btn btn-outline"
                >
                  {lang === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  {lang === 'ta' ? 'அமர்வை சமர்ப்பிக்க' : 'Submit Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
