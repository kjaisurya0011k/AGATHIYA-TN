import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  AlertTriangle,
  Save,
  Send,
  XCircle,
  Link as LinkIcon,
  MessageSquare
} from 'lucide-react';

export function MentorEditSessionPage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const {
    mentorSessions,
    updateMentorSession,
    cancelMentorSession,
    mentorDetails
  } = useAuth();
  const navigate = useNavigate();
  const isTamil = lang === 'ta';
  const hub = t?.mentorHub || {};

  const existingSession = mentorSessions.find((s) => s.id === id) || {
    id: id || '',
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
    status: 'draft',
    admin_note: null,
    meeting_link: ''
  };

  const [formData, setFormData] = useState({
    title_en: existingSession.title_en || '',
    title_ta: existingSession.title_ta || '',
    description_en: existingSession.description_en || '',
    description_ta: existingSession.description_ta || '',
    topic: existingSession.topic || 'Engineering & TNEA',
    target_audience: existingSession.target_audience || 'Both',
    language: existingSession.language || 'Tamil & English',
    session_date: existingSession.session_date || '',
    start_time: existingSession.start_time || '10:00',
    end_time: existingSession.end_time || '11:30',
    capacity: existingSession.capacity || 100,
    price_inr: existingSession.price_inr !== undefined ? existingSession.price_inr : 0,
    meeting_link: existingSession.meeting_link || ''
  });

  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const isApproved = existingSession.status === 'approved';
  const isNeedsChanges = existingSession.status === 'needs_changes';
  const isCancelled = existingSession.status === 'cancelled';

  // Check if key fields were touched
  const hasKeyFieldsChanged =
    (formData.title_en?.trim() || '') !== (existingSession.title_en || '') ||
    (formData.title_ta?.trim() || '') !== (existingSession.title_ta || '') ||
    (formData.description_en?.trim() || '') !== (existingSession.description_en || '') ||
    (formData.description_ta?.trim() || '') !== (existingSession.description_ta || '') ||
    formData.session_date !== existingSession.session_date ||
    formData.start_time !== existingSession.start_time ||
    formData.end_time !== existingSession.end_time ||
    parseFloat(formData.price_inr || 0) !== parseFloat(existingSession.price_inr || 0) ||
    parseInt(formData.capacity || 0, 10) !== parseInt(existingSession.capacity || 0, 10);

  const validate = () => {
    if (!formData.title_en.trim() || !formData.description_en.trim()) {
      return hub.validationRequired || 'Please enter English title and description.';
    }
    if (!formData.session_date) {
      return isTamil ? 'அமர்வு தேதியைத் தேர்ந்தெடுக்கவும்.' : 'Please select a session date.';
    }
    if (!formData.start_time || !formData.end_time) {
      return isTamil ? 'தொடக்க மற்றும் முடிவு நேரத்தை உள்ளிடவும்.' : 'Please enter start and end times.';
    }
    if (formData.end_time <= formData.start_time) {
      return hub.validationTimeOrder || 'End time must be after start time.';
    }
    if (formData.meeting_link && !/^https?:\/\//i.test(formData.meeting_link.trim())) {
      return hub.validationMeetingLink || 'Please provide a valid meeting URL (e.g. https://meet.google.com/xxx-xxxx-xxx).';
    }
    return null;
  };

  const handleSave = async (submitAfterEdit = false) => {
    setFormError(null);
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    // Confirmation if approved session is modified
    if (isApproved && hasKeyFieldsChanged) {
      const confirmWarning = isTamil
        ? 'கவனம்: இந்த அமர்வு ஏற்கனவே அங்கீகரிக்கப்பட்டுள்ளது. தலைப்பு, தேதி அல்லது விவரங்களை மாற்றினால், இது மீண்டும் நிர்வாகியின் மதிப்பாய்வுக்கு (Pending Review) அனுப்பப்படும். தொடரவா?'
        : 'Warning: This session is currently APPROVED. Modifying key fields will automatically revert its status back to Pending Review for admin re-verification. Do you want to proceed?';
      if (!window.confirm(confirmWarning)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await updateMentorSession(
        existingSession.id,
        formData,
        formData.meeting_link
      );

      if (res?.error) {
        setFormError(res.error.message || 'Failed to update session');
        setSubmitting(false);
        return;
      }

      if (res?.revertedToPending) {
        setFeedbackMsg(
          isTamil
            ? 'மாற்றங்கள் சேமிக்கப்பட்டன. முக்கிய விவரங்கள் மாற்றப்பட்டதால் நிர்வாகியின் மறு-ஒப்புதலுக்கு (Pending Review) அனுப்பப்பட்டுள்ளது!'
            : 'Changes saved! Key fields were modified, so status automatically reverted to Pending Review for admin verification.'
        );
      } else {
        setFeedbackMsg(hub.successUpdated || (isTamil ? 'அமர்வு விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!' : 'Session updated successfully!'));
      }

      setTimeout(() => {
        navigate('/mentor/sessions');
      }, 1800);
    } catch (e) {
      setFormError(e.message || 'Network error');
      setSubmitting(false);
    }
  };

  const handleCancelThisSession = async () => {
    const confirmMsg = hub.confirmCancelSession || 'Are you sure you want to cancel this guidance session?';
    if (window.confirm(confirmMsg)) {
      await cancelMentorSession(existingSession.id);
      navigate('/mentor/sessions');
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

      {/* Header Card with Status Badge */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {hub.editTitle || (isTamil ? 'வழிகாட்டல் அமர்வைத் திருத்து' : 'Edit Guidance Session')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {hub.editSubtitle || (isTamil ? 'அமர்வு தகவல்கள், நேரம், கட்டணம் மற்றும் இணைப்பு விவரங்களைப் புதுப்பிக்கவும்' : 'Update session details, timings, capacity, and meeting link')}
            </p>
          </div>

          <div>
            {existingSession.status === 'approved' && (
              <span className="mentor-status-badge status-approved">
                <CheckCircle2 size={13} />
                <span>{isTamil ? 'அங்கீகரிக்கப்பட்டது (நேரலை)' : 'Approved (Live for Students)'}</span>
              </span>
            )}
            {existingSession.status === 'pending' && (
              <span className="mentor-status-badge status-pending_review">
                <Clock size={13} />
                <span>{isTamil ? 'மதிப்பாய்வில் உள்ளது' : 'Pending Admin Review'}</span>
              </span>
            )}
            {existingSession.status === 'needs_changes' && (
              <span className="mentor-status-badge status-needs_changes">
                <AlertCircle size={13} />
                <span>{isTamil ? 'மாற்றங்கள் தேவை' : 'Needs Changes'}</span>
              </span>
            )}
            {existingSession.status === 'draft' && (
              <span className="mentor-status-badge status-draft">
                <FileText size={13} />
                <span>{isTamil ? 'வரைவு' : 'Draft'}</span>
              </span>
            )}
            {existingSession.status === 'cancelled' && (
              <span className="mentor-status-badge status-draft" style={{ background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' }}>
                <XCircle size={13} />
                <span>{isTamil ? 'ரத்து செய்யப்பட்டது' : 'Cancelled'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Admin Note if Needs Changes */}
        {isNeedsChanges && existingSession.admin_note && (
          <div className="mentor-review-note-callout" style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#b91c1c' }}>
              <MessageSquare size={15} />
              <span>{hub.adminNoteTitle || (isTamil ? 'நிர்வாகியின் மதிப்பாய்வுக் குறிப்பு:' : 'Admin Review Note:')}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
              {existingSession.admin_note}
            </p>
          </div>
        )}

        {/* Warning if Approved Session is modified */}
        {isApproved && (
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              background: '#fffbeb',
              border: '1.5px solid #fde68a',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.85rem', color: '#92400e' }}>
              <strong>{isTamil ? 'முக்கிய பாதுகாப்பு எச்சரிக்கை:' : 'Approval Re-verification Notice:'}</strong>{' '}
              {hub.approvedRevertWarning ||
                (isTamil
                  ? 'அங்கீகரிக்கப்பட்ட அமர்வின் தலைப்பு, விவரம், தேதி, நேரம், கட்டணம் அல்லது இருக்கைகளை மாற்றினால், அது தானாகவே மீண்டும் நிர்வாகி ஒப்புதலுக்கு (Pending Review) அனுப்பப்படும்.'
                  : 'Modifying key fields (title, description, date, time, price, capacity) on an approved session will automatically revert its status back to Pending Review for admin re-verification.')}
            </div>
          </div>
        )}
      </div>

      {feedbackMsg && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {formError && (
        <div className="auth-error-banner" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={16} />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
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
            />
          </div>

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
            />
          </div>

          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required">{hub.fieldTopic || 'Topic / Domain'}</label>
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
              <label className="form-label required">{hub.fieldAudience || 'Target Audience'}</label>
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
              <label className="form-label required">{hub.fieldLanguage || 'Language'}</label>
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

          <div className="form-row-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label required">{hub.fieldDate || 'Session Date'}</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.session_date}
                onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">{hub.fieldStartTime || 'Start Time'}</label>
              <input
                type="time"
                required
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">{hub.fieldEndTime || 'End Time'}</label>
              <input
                type="time"
                required
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">{hub.fieldCapacity || 'Max Capacity'}</label>
              <input
                type="number"
                min="5"
                max="500"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label required">{hub.fieldPrice || 'Price (INR)'}</label>
              <input
                type="number"
                min="0"
                step="1"
                required
                className="form-input"
                value={formData.price_inr}
                onChange={(e) => setFormData({ ...formData, price_inr: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label required" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LinkIcon size={14} color="var(--navy-900)" />
              <span>{hub.fieldMeetingLink || 'Meeting Link'}</span>
            </label>
            <input
              type="url"
              required
              className="form-input"
              value={formData.meeting_link}
              onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              {!isCancelled && (
                <button
                  type="button"
                  onClick={handleCancelThisSession}
                  className="btn btn-outline"
                  style={{ color: '#b91c1c', borderColor: '#fca5a5', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <XCircle size={15} />
                  <span>{hub.actionCancel || 'Cancel Session'}</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/mentor/sessions" className="btn btn-outline">
                {hub.btnCancel || (isTamil ? 'ரத்துசெய்' : 'Back')}
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={16} />
                <span>
                  {isApproved
                    ? (hub.btnSaveApprovedChanges || (isTamil ? 'மாற்றங்களை சேமித்து மீண்டும் சமர்ப்பி' : 'Save & Re-submit for Review'))
                    : (hub.btnSaveDraft || (isTamil ? 'மாற்றங்களை சேமி' : 'Save Changes'))}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MentorEditSessionPage;
