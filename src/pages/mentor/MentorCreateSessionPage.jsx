import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  Tag,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Link as LinkIcon
} from 'lucide-react';

export function MentorCreateSessionPage() {
  const { lang, t } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isTamil = lang === 'ta';

  const [formData, setFormData] = useState({
    title_en: '',
    title_ta: '',
    description_en: '',
    topic: 'Engineering & TNEA',
    target_audience: 'Both',
    language: 'Tamil & English',
    session_date: '',
    start_time: '10:00',
    end_time: '11:30',
    capacity: 100,
    price_inr: 0,
    meeting_link: ''
  });

  const [submittedMessage, setSubmittedMessage] = useState(null);

  const handleSubmit = (actionType) => {
    setSubmittedMessage(
      actionType === 'pending'
        ? (isTamil ? 'அமர்வு உருவாக்கப்பட்டு நிர்வாகி மதிப்பாய்வுக்கு சமர்ப்பிக்கப்பட்டது (முன்னோட்டம்)!' : 'Session proposed and submitted for admin review (Preview)!')
        : (isTamil ? 'அமர்வு வரைவாக சேமிக்கப்பட்டது (முன்னோட்டம்)!' : 'Session saved as draft (Preview)!')
    );
    setTimeout(() => {
      navigate('/mentor/sessions');
    }, 1500);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--navy-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} color="var(--navy-900)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {t?.placeholders?.mentorCreateTitle || (isTamil ? 'புதிய வழிகாட்டல் அமர்வு உருவாக்கு' : 'Create Guidance Session')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t?.placeholders?.mentorCreateDesc || (isTamil ? '11 மற்றும் 12-ஆம் வகுப்பு மாணவர்களுக்கான புதிய நேரலை வழிகாட்டல் அமர்வைத் திட்டமிடுங்கள்.' : 'Schedule a live guidance session for Class 11 and Class 12 students.')}
            </p>
          </div>
        </div>

        {/* Phase 1 Notice */}
        <div className="modal-alert-success" style={{ background: 'rgba(0, 166, 191, 0.08)', borderColor: 'rgba(0, 166, 191, 0.3)', color: 'var(--navy-900)', marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={16} color="var(--cyan-700)" />
          <span style={{ fontSize: '0.825rem' }}>
            <strong>{isTamil ? 'கட்டம் 1 நிலை:' : 'Phase 1 Status:'}</strong>{' '}
            {t?.placeholders?.phaseNotice || (isTamil ? 'இந்த படிவம் கட்டம் 3-ல் நேரலை sessions அட்டவணையுடன் இணைக்கப்படும்.' : 'This form will connect to the sessions database and RLS policies in Phase 3.')}
          </span>
        </div>
      </div>

      {submittedMessage && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('pending'); }} className="card" style={{ padding: '2rem' }}>
        <div className="form-grid">
          {/* Title English */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'அமர்வு தலைப்பு (English) *' : 'Session Title (English) *'}</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. TNEA 2026: Strategy for Top 50 Engineering Colleges"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
            />
          </div>

          {/* Title Tamil */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'அமர்வு தலைப்பு (தமிழ் - விருப்பத்திற்குட்பட்டது)' : 'Session Title (Tamil - Optional)'}</label>
            <input
              type="text"
              className="form-input"
              placeholder="எ.கா. TNEA 2026: சிறந்த 50 பொறியியல் கல்லூரிகளைத் தேர்ந்தெடுப்பது எப்படி?"
              value={formData.title_ta}
              onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
            />
          </div>

          {/* Topic */}
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
              <option value="Agriculture & Veterinary">Agriculture & Veterinary</option>
              <option value="Scholarships & Financial Aid">Scholarships & Financial Aid</option>
              <option value="Civil Services Guidance">Civil Services Guidance</option>
            </select>
          </div>

          {/* Target Audience */}
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

          {/* Date */}
          <div className="form-group">
            <label className="form-label">{isTamil ? 'தேதி *' : 'Session Date *'}</label>
            <input
              type="date"
              className="form-input"
              required
              value={formData.session_date}
              onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
            />
          </div>

          {/* Time row */}
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

          {/* Capacity */}
          <div className="form-group">
            <label className="form-label">{isTamil ? 'அதிகபட்ச இருக்கைகள்' : 'Max Capacity'}</label>
            <input
              type="number"
              min="10"
              max="500"
              className="form-input"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 50 })}
            />
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">{isTamil ? 'கட்டணம் (₹ 0 = இலவசம்)' : 'Price INR (0 = Free)'}</label>
            <input
              type="number"
              min="0"
              className="form-input"
              value={formData.price_inr}
              onChange={(e) => setFormData({ ...formData, price_inr: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          {/* Meeting Link */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{isTamil ? 'கூட்ட இணைப்பு (Google Meet / Zoom URL)' : 'Meeting Link (Google Meet / Zoom URL)'}</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            />
            <small className="field-help" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              {isTamil
                ? 'பாதுகாப்பு விதி: பதிவு செய்து அங்கீகரிக்கப்பட்ட மாணவர்களுக்கு மட்டுமே இந்த இணைப்பு காட்டப்படும்.'
                : 'Security note: Stored in separate session_links table; revealed only to registered students.'}
            </small>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={16} />
            <span>{isTamil ? 'வரைவாகச் சேமி' : 'Save Draft'}</span>
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Send size={16} />
            <span>{isTamil ? 'நிர்வாகி ஒப்புதலுக்கு சமர்ப்பி' : 'Submit for Admin Approval'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default MentorCreateSessionPage;
