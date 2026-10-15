import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  XCircle
} from 'lucide-react';

export function MentorEditSessionPage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const isTamil = lang === 'ta';

  // Demo initial values for editing
  const [formData, setFormData] = useState({
    title_en: 'TNEA Counseling 2026: Strategy for Top 50 Engineering Colleges',
    title_ta: 'TNEA கலந்தாய்வு 2026: சிறந்த பொறியியல் கல்லூரிகளைத் தேர்ந்தெடுப்பது எப்படி?',
    description_en: 'In-depth guidance on choosing branch vs college, cut-off analysis, and government quota counseling tips.',
    topic: 'Engineering & TNEA',
    target_audience: 'Both',
    language: 'Tamil & English',
    session_date: '2026-07-20',
    start_time: '10:00',
    end_time: '11:30',
    capacity: 100,
    price_inr: 0,
    meeting_link: 'https://meet.google.com/eee-guid-tn'
  });

  const [sessionStatus, setSessionStatus] = useState('approved');
  const [saveFeedback, setSaveFeedback] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveFeedback(
      isTamil
        ? 'மாற்றங்கள் சேமிக்கப்பட்டன. முக்கிய விவரங்கள் மாற்றப்பட்டதால் நிர்வாகி ஒப்புதலுக்கு மீண்டும் அனுப்பப்பட்டது (முன்னோட்டம்)!'
        : 'Changes saved! Key details were modified, so status is sent back to Pending Review (Preview)!'
    );
    setTimeout(() => {
      navigate('/mentor/sessions');
    }, 1800);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem', maxWidth: '840px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/mentor/sessions"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'அமர்வுகள் பட்டியலுக்குத் திரும்பு' : 'Back to Sessions'}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {t?.placeholders?.mentorEditTitle || (isTamil ? 'அமர்வை திருத்து' : 'Edit Guidance Session')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t?.placeholders?.mentorEditDesc || (isTamil ? 'அமர்வு விவரங்களை மாற்றியமைக்கவும்.' : 'Update session details, timing, topic, and meeting link.')}
            </p>
          </div>

          <span className={`mentor-status-badge status-${sessionStatus}`}>
            <CheckCircle2 size={13} />
            <span>{isTamil ? 'அங்கீகரிக்கப்பட்டது' : 'Approved'}</span>
          </span>
        </div>

        {/* Warning if approved session edited */}
        {sessionStatus === 'approved' && (
          <div className="profile-alert warning" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>{isTamil ? 'முக்கிய அறிவிப்பு:' : 'Important Notice:'}</strong>{' '}
              {isTamil
                ? 'அங்கீகரிக்கப்பட்ட அமர்வின் தலைப்பு, விவரம், தேதி, நேரம், கட்டணம் அல்லது இருக்கைகளை மாற்றினால், அது தானாகவே மீண்டும் நிர்வாகி ஒப்புதலுக்கு (Pending) அனுப்பப்படும்.'
                : 'Editing key fields (title, description, date, time, price, capacity) on an approved session will automatically revert its status back to Pending Review.'}
            </div>
          </div>
        )}
      </div>

      {saveFeedback && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: '2rem' }}>
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'அமர்வு தலைப்பு (English) *' : 'Session Title (English) *'}</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'அமர்வு தலைப்பு (தமிழ்)' : 'Session Title (Tamil)'}</label>
            <input
              type="text"
              className="form-input"
              value={formData.title_ta}
              onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'அமர்வு விவரம் *' : 'Description *'}</label>
            <textarea
              rows={3}
              className="form-input"
              required
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'தலைப்பு / துறை *' : 'Topic / Domain *'}</label>
            <select
              className="form-select"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            >
              <option value="Engineering & TNEA">Engineering & TNEA</option>
              <option value="Medicine & NEET">Medicine & NEET</option>
              <option value="Arts, Science & Commerce">Arts, Science & Commerce</option>
              <option value="Law & Judiciary">Law & Judiciary</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'இலக்கு மாணவர்கள் *' : 'Target Audience *'}</label>
            <select
              className="form-select"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
            >
              <option value="Class 12">Class 12</option>
              <option value="Class 11">Class 11</option>
              <option value="Both">Both Class 11 & 12</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'தேதி *' : 'Date *'}</label>
            <input
              type="date"
              className="form-input"
              required
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'நேரம் (தொடக்க - முடிவு) *' : 'Time (Start - End) *'}</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="time"
                className="form-input"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
              <span>to</span>
              <input
                type="time"
                className="form-input"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'அதிகபட்ச இருக்கைகள்' : 'Max Capacity'}</label>
            <input
              type="number"
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 50 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{isTamil ? 'கட்டணம் (₹ 0 = இலவசம்)' : 'Price INR'}</label>
            <input
              type="number"
              className="form-input"
              value={formData.price_inr}
              onChange={(e) => setFormData({ ...formData, price_inr: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'கூட்ட இணைப்பு' : 'Meeting Link'}</label>
            <input
              type="url"
              className="form-input"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(isTamil ? 'இந்த அமர்வை ரத்து செய்ய விரும்புகிறீர்களா?' : 'Do you want to cancel this session?')) {
                navigate('/mentor/sessions');
              }
            }}
            className="btn btn-outline"
            style={{ color: '#dc2626', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <XCircle size={16} />
            <span>{isTamil ? 'அமர்வை ரத்துசெய்' : 'Cancel Session'}</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} />
            <span>{isTamil ? 'மாற்றங்களைச் சேமி' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default MentorEditSessionPage;
