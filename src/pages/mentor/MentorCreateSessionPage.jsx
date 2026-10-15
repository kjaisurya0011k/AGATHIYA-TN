import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  AlertCircle,
  AlertTriangle,
  Save,
  Send,
  Link as LinkIcon,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export function MentorCreateSessionPage() {
  const { lang, t } = useLanguage();
  const { mentorDetails, createMentorSession } = useAuth();
  const navigate = useNavigate();
  const isTamil = lang === 'ta';
  const hub = t?.mentorHub || {};

  const [formData, setFormData] = useState({
    title_en: '',
    title_ta: '',
    description_en: '',
    description_ta: '',
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

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);

  // Profile status verification check
  const mentorProfileStatus = mentorDetails?.status || 'draft';
  const isProfileApproved = mentorProfileStatus === 'approved';

  const validate = () => {
    if (!formData.title_en.trim() || !formData.description_en.trim()) {
      return hub.validationRequired || 'Please enter English title and description.';
    }
    if (!formData.session_date) {
      return isTamil ? 'அமர்வு தேதியைத் தேர்ந்தெடுக்கவும்.' : 'Please select a session date.';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.session_date < todayStr) {
      return hub.validationFutureDate || 'Session date must be in the future.';
    }

    if (!formData.start_time || !formData.end_time) {
      return isTamil ? 'தொடக்க மற்றும் முடிவு நேரத்தை உள்ளிடவும்.' : 'Please enter start and end times.';
    }

    if (formData.end_time <= formData.start_time) {
      return hub.validationTimeOrder || 'End time must be after the start time.';
    }

    if (!formData.meeting_link.trim() || !/^https?:\/\//i.test(formData.meeting_link.trim())) {
      return hub.validationMeetingLink || 'Please provide a valid meeting URL (e.g. https://meet.google.com/xxx-xxxx-xxx).';
    }

    return null;
  };

  const handleSaveAction = async (submitForApproval) => {
    setFormError(null);

    // Rule: mentor can only submit for approval if mentor profile is approved
    if (submitForApproval && !isProfileApproved) {
      setFormError(
        isTamil
          ? `நிர்வாக ஒப்புதலுக்கு சமர்ப்பிக்க உங்கள் வழிகாட்டி சுயவிவரம் அங்கீகரிக்கப்பட்டிருக்க வேண்டும் (தற்போதைய நிலை: ${mentorProfileStatus}). நீங்கள் வரைவாக சேமிக்கலாம்.`
          : `Submitting for admin approval requires an approved mentor profile (current status: ${mentorProfileStatus}). You can save this session as a draft.`
      );
      return;
    }

    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const res = await createMentorSession(
        formData,
        formData.meeting_link,
        submitForApproval
      );

      if (res?.error) {
        setFormError(res.error.message || 'Failed to create session');
        setSubmitting(false);
        return;
      }

      setSuccessToast(
        submitForApproval
          ? (hub.successPending || (isTamil ? 'அமர்வு நிர்வாக ஒப்புதலுக்கு சமர்ப்பிக்கப்பட்டது!' : 'Session submitted for admin approval!'))
          : (hub.successDraft || (isTamil ? 'அமர்வு வரைவாக சேமிக்கப்பட்டது!' : 'Session saved as draft!'))
      );

      setTimeout(() => {
        navigate('/mentor/sessions');
      }, 1500);
    } catch (e) {
      setFormError(e.message || 'Network error');
      setSubmitting(false);
    }
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

      {/* Header Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--navy-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="var(--navy-900)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {hub.createTitle || (isTamil ? 'புதிய வழிகாட்டல் அமர்வைத் திட்டமிடுங்கள்' : 'Create Guidance Session')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {hub.createSubtitle || (isTamil ? 'தமிழ்நாடு பள்ளி மாணவர்களுக்கான நேரலை வழிகாட்டல் அமர்வை உருவாக்கவும்' : 'Schedule a live guidance workshop for Class 11 & 12 students')}
            </p>
          </div>
        </div>

        {/* Warning if mentor profile is NOT approved */}
        {!isProfileApproved && (
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>{isTamil ? 'சுயவிவர ஒப்புதல் அறிவிப்பு:' : 'Mentor Profile Verification Note:'}</strong>{' '}
              {isTamil
                ? `உங்கள் வழிகாட்டி சுயவிவரம் இன்னும் அங்கீகரிக்கப்படவில்லை (${mentorProfileStatus}). நீங்கள் வரைவு அமர்வுகளைச் சேமிக்கலாம், ஆனால் ஒப்புதலுக்கு சமர்ப்பிக்க `
                : `Your mentor profile is currently in ${mentorProfileStatus} state. You can save sessions as drafts, but admin review submission requires verified mentor status. `}
              <Link to="/profile" style={{ color: '#b45309', fontWeight: 700, textDecoration: 'underline' }}>
                {isTamil ? 'சுயவிவரத்தை சரிபார்க்கவும்' : 'Complete profile in My Profile'}
              </Link>.
            </div>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Alert */}
      {formError && (
        <div className="auth-error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSaveAction(false); }}>
          {/* Titles: English & Tamil */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label required">
              {hub.fieldTitleEn || 'Session Title (English)'}
            </label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="e.g. TNEA Counseling 2026: Strategy for Top 50 Engineering Colleges"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">
              {hub.fieldTitleTa || 'Session Title (Tamil - Optional)'}
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.title_ta}
              onChange={(e) => setFormData({ ...formData, title_ta: e.target.value })}
              placeholder="e.g. TNEA கலந்தாய்வு 2026: சிறந்த பொறியியல் கல்லூரிகளைத் தேர்ந்தெடுப்பது எப்படி?"
            />
          </div>

          {/* Descriptions: English & Tamil */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label required">
              {hub.fieldDescEn || 'Session Description (English)'}
            </label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              value={formData.description_en}
              onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
              placeholder="Detailed agenda: college choice filling, cutoff trends, fee concessions, and hostel verifications..."
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              {hub.fieldDescTa || 'Session Description (Tamil - Optional)'}
            </label>
            <textarea
              rows={2}
              className="form-textarea"
              value={formData.description_ta}
              onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
              placeholder="அமர்வு குறித்த விரிவான விளக்கம் மற்றும் ஆலோசனைகள்..."
            />
          </div>

          {/* 3 Columns: Topic, Target Audience, Language */}
          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required">
                {hub.fieldTopic || 'Topic / Domain'}
              </label>
              <select
                className="form-select"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              >
                <option value="Engineering & TNEA">Engineering & TNEA</option>
                <option value="Medical & NEET Guidance">Medical & NEET Guidance</option>
                <option value="Arts, Science & Commerce">Arts, Science & Commerce</option>
                <option value="Software & IT Careers">Software & IT Careers</option>
                <option value="Government College Admissions">Government College Admissions</option>
                <option value="Higher Education Abroad">Higher Education Abroad</option>
                <option value="Scholarships & Financial Aid">Scholarships & Financial Aid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">
                {hub.fieldAudience || 'Target Audience'}
              </label>
              <select
                className="form-select"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              >
                <option value="Both">Class 11 & Class 12 (Both)</option>
                <option value="Class 11">Class 11 Only</option>
                <option value="Class 12">Class 12 Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">
                {hub.fieldLanguage || 'Language'}
              </label>
              <select
                className="form-select"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="Tamil & English">Tamil & English (Bilingual)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required">
                {hub.fieldDate || 'Session Date'}
              </label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                {hub.fieldStartTime || 'Start Time'}
              </label>
              <input
                type="time"
                required
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                {hub.fieldEndTime || 'End Time'}
              </label>
              <input
                type="time"
                required
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          {/* Capacity and Price INR */}
          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">
                {hub.fieldCapacity || 'Max Capacity (Seats)'}
              </label>
              <input
                type="number"
                min="5"
                max="500"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label required">
                {hub.fieldPrice || 'Price in INR (₹0 = Free)'}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                className="form-input"
                value={formData.price_inr}
                onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
                placeholder="0"
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                {hub.fieldPriceFreeNote || 'Entering ₹0 displays the session as 100% Free.'}
              </span>
            </div>
          </div>

          {/* Meeting Link (Securely isolated in session_links table) */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LinkIcon size={14} color="var(--navy-900)" />
              <span>{hub.fieldMeetingLink || 'Meeting Link (Google Meet / Zoom)'}</span>
            </label>
            <input
              type="url"
              required
              className="form-input"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--cyan-800)', marginTop: '0.25rem', display: 'block' }}>
              ℹ️ {hub.fieldMeetingLinkNote || 'This meeting link is securely protected and revealed only to registered students.'}
            </span>
          </div>

          {/* Actions: Save Draft vs Submit for Admin Approval */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link to="/mentor/sessions" className="btn btn-outline">
              {hub.btnCancel || (isTamil ? 'ரத்துசெய்' : 'Cancel')}
            </Link>

            {/* Save as Draft */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSaveAction(false)}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={16} />
              <span>{hub.btnSaveDraft || (isTamil ? 'வரைவாக சேமி' : 'Save Draft')}</span>
            </button>

            {/* Submit for Admin Approval */}
            <button
              type="button"
              disabled={submitting || !isProfileApproved}
              onClick={() => handleSaveAction(true)}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: !isProfileApproved ? 0.6 : 1,
                cursor: !isProfileApproved ? 'not-allowed' : 'pointer'
              }}
              title={!isProfileApproved ? 'Requires approved mentor profile' : ''}
            >
              <Send size={16} />
              <span>{hub.btnSubmitApproval || (isTamil ? 'நிர்வாக ஒப்புதலுக்கு சமர்ப்பி' : 'Submit for Admin Approval')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorCreateSessionPage;
