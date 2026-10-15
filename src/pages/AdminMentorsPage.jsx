import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Search,
  Filter,
  ArrowLeft,
  Briefcase,
  Building,
  GraduationCap,
  ExternalLink,
  MessageSquare,
  Send,
  UserCheck,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Globe
} from 'lucide-react';

export function AdminMentorsPage() {
  const { user, fetchAdminMentors, reviewMentorProfile } = useAuth();
  const { lang, t } = useLanguage();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionErrorMsg, setActionErrorMsg] = useState(null);

  // Load mentors on mount
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      if (fetchAdminMentors) {
        const { data } = await fetchAdminMentors();
        if (mounted && data) {
          setMentors(data);
        }
      }
      if (mounted) setLoading(false);
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [fetchAdminMentors]);

  // Filtered mentors list
  const filteredMentors = mentors.filter((m) => {
    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
    const name = m.profiles?.full_name || m.full_name || '';
    const headline = m.headline || '';
    const org = m.organisation || '';
    const matchesSearch =
      !searchQuery.trim() ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.expertise && m.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

  // Status counts for filter pills
  const counts = {
    all: mentors.length,
    pending_review: mentors.filter((m) => m.status === 'pending_review').length,
    needs_changes: mentors.filter((m) => m.status === 'needs_changes').length,
    approved: mentors.filter((m) => m.status === 'approved').length,
    draft: mentors.filter((m) => m.status === 'draft').length
  };

  // Open review action modal/box
  const handleOpenReview = (mentor, initialNote = '') => {
    setSelectedMentor(mentor);
    setReviewNote(mentor.review_note || initialNote || '');
    setActionSuccessMsg(null);
    setActionErrorMsg(null);
  };

  // Submit review action (approve or request changes)
  const handleSubmitReview = async (newStatus) => {
    if (!selectedMentor) return;
    if (newStatus === 'needs_changes' && !reviewNote.trim()) {
      setActionErrorMsg(
        lang === 'ta'
          ? 'மாற்றங்களைக் கோருவதற்கு முன் வழிகாட்டிக்கான விளக்கக் குறிப்பை உள்ளிடவும்.'
          : 'Please enter a review note explaining the required changes.'
      );
      return;
    }

    setActionInProgress(newStatus);
    setActionErrorMsg(null);
    setActionSuccessMsg(null);

    try {
      if (reviewMentorProfile) {
        const { error } = await reviewMentorProfile(selectedMentor.id, newStatus, reviewNote);
        if (error) {
          setActionErrorMsg(error.message || (lang === 'ta' ? 'செயல்பாட்டில் பிழை ஏற்பட்டது.' : 'Failed to update review status.'));
        } else {
          // Update local state list
          setMentors((prev) =>
            prev.map((item) =>
              item.id === selectedMentor.id
                ? {
                    ...item,
                    status: newStatus,
                    review_note: reviewNote.trim() || null,
                    reviewed_at: new Date().toISOString()
                  }
                : item
            )
          );

          setActionSuccessMsg(
            newStatus === 'approved'
              ? (t?.profile?.mentorApprovedSuccess || 'Mentor profile approved successfully!')
              : (t?.profile?.mentorChangesRequested || 'Requested changes sent to mentor.')
          );

          // Close modal after brief feedback
          setTimeout(() => {
            setSelectedMentor(null);
            setActionSuccessMsg(null);
          }, 1800);
        }
      }
    } catch {
      setActionErrorMsg(lang === 'ta' ? 'இணைப்பில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'A network error occurred.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="admin-mentors-page" style={{ padding: '2rem 1rem 5rem', background: 'var(--bg-page)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Breadcrumb & Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link
            to="/profile"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} />
            <span>{t?.profile?.backToProfile || 'Back to Profile'}</span>
          </Link>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#F1F5F9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--navy-900)', fontWeight: 700 }}>
            <ShieldCheck size={16} />
            <span>{lang === 'ta' ? 'நிர்வாகி பகுதி' : 'Admin Area'}</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #000666 0%, #082567 60%, #00a6bf 100%)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <UserCheck size={26} color="#38bdf8" />
            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 1.85rem)', fontWeight: 800, color: '#FFFFFF' }}>
              {t?.profile?.mentorAdminTitle || 'Mentor Applications & Review'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9, maxWidth: '750px', lineHeight: 1.5 }}>
            {lang === 'ta'
              ? 'விண்ணப்பித்துள்ள வழிகாட்டிகளின் சுயவிவரங்கள், தொழில் அனுபவங்கள் மற்றும் கல்வித் தகுதிகளை மதிப்பாய்வு செய்து அங்கீகரிக்கவும்.'
              : 'Review submitted mentor credentials, verify professional experience, and approve or request changes before public listing.'}
          </p>
        </div>

        {/* Search & Status Filter Controls */}
        <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder={lang === 'ta' ? 'வழிகாட்டி பெயர், தலைப்பு, நிபுணத்துவத்தால் தேடவும்...' : 'Search by name, headline, organisation, or tag...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Refresh */}
            <button
              type="button"
              onClick={async () => {
                if (fetchAdminMentors) {
                  setLoading(true);
                  const { data } = await fetchAdminMentors();
                  if (data) setMentors(data);
                  setLoading(false);
                }
              }}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>{lang === 'ta' ? 'புதுப்பி' : 'Refresh'}</span>
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="admin-status-filters" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`filter-pill-btn ${filterStatus === 'all' ? 'active' : ''}`}
            >
              <span>{t?.profile?.filterAll || 'All'}</span>
              <span className="count-badge">{counts.all}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('pending_review')}
              className={`filter-pill-btn ${filterStatus === 'pending_review' ? 'active status-pending' : ''}`}
            >
              <Clock size={13} />
              <span>{t?.profile?.filterPending || 'Pending Review'}</span>
              <span className="count-badge">{counts.pending_review}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('needs_changes')}
              className={`filter-pill-btn ${filterStatus === 'needs_changes' ? 'active status-changes' : ''}`}
            >
              <AlertCircle size={13} />
              <span>{t?.profile?.filterNeedsChanges || 'Needs Changes'}</span>
              <span className="count-badge">{counts.needs_changes}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('approved')}
              className={`filter-pill-btn ${filterStatus === 'approved' ? 'active status-approved' : ''}`}
            >
              <CheckCircle2 size={13} />
              <span>{t?.profile?.filterApproved || 'Approved'}</span>
              <span className="count-badge">{counts.approved}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('draft')}
              className={`filter-pill-btn ${filterStatus === 'draft' ? 'active status-draft' : ''}`}
            >
              <FileText size={13} />
              <span>{t?.profile?.filterDraft || 'Drafts'}</span>
              <span className="count-badge">{counts.draft}</span>
            </button>
          </div>
        </div>

        {/* Mentors List */}
        {loading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw size={32} className="spin" style={{ color: 'var(--cyan-700)', marginBottom: '1rem' }} />
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {lang === 'ta' ? 'வழிகாட்டி விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading mentor profiles...'}
            </p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <UserCheck size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--navy-900)' }}>
              {t?.profile?.noMentorsFound || 'No mentor profiles found in this category.'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {searchQuery ? (lang === 'ta' ? 'தேடல் சொற்களை மாற்ற முயற்சிக்கவும்.' : 'Try adjusting your search query.') : ''}
            </p>
          </div>
        ) : (
          <div className="mentors-admin-grid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredMentors.map((m) => {
              const name = m.profiles?.full_name || m.full_name || 'Mentor Applicant';
              const email = m.profiles?.email || 'N/A';
              const avatar = m.profiles?.avatar_url;
              const initials = name.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('').toUpperCase() || 'M';

              return (
                <div key={m.id} className="card mentor-review-card" style={{ padding: '1.75rem', border: m.status === 'pending_review' ? '2px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)' }}>
                  
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="profile-avatar-large" style={{ width: '56px', height: '56px', fontSize: '1.3rem' }}>
                        {avatar ? <img src={avatar} alt={name} className="profile-img-large" /> : <span>{initials}</span>}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>{name}</h3>
                          <span className={`mentor-status-badge status-${m.status}`}>
                            {m.status === 'approved' && <CheckCircle2 size={13} />}
                            {m.status === 'pending_review' && <Clock size={13} />}
                            {m.status === 'needs_changes' && <AlertCircle size={13} />}
                            {m.status === 'draft' && <FileText size={13} />}
                            <span>
                              {m.status === 'approved'
                                ? (t?.profile?.statusApproved || 'Approved')
                                : m.status === 'pending_review'
                                ? (t?.profile?.statusPending || 'Pending Review')
                                : m.status === 'needs_changes'
                                ? (t?.profile?.statusNeedsChanges || 'Needs Changes')
                                : (t?.profile?.statusDraft || 'Draft')}
                            </span>
                          </span>
                        </div>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span><Mail size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {email}</span>
                          {m.phone && <span>• <Phone size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {m.phone}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Review Action Trigger Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenReview(m)}
                      className={`btn ${m.status === 'pending_review' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
                    >
                      <MessageSquare size={15} />
                      <span>{lang === 'ta' ? 'மதிப்பாய்வு செய்க' : 'Review Profile'}</span>
                    </button>
                  </div>

                  {/* Core Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', background: '#F8FAFC', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {t?.profile?.headlineLabel || 'Headline'}
                      </small>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--navy-900)' }}>{m.headline || 'Not provided'}</strong>
                    </div>

                    <div>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {t?.profile?.orgLabel || 'Organisation'}
                      </small>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>{m.organisation || 'Not provided'}</span>
                    </div>

                    <div>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {t?.profile?.qualificationsLabel || 'Qualifications'}
                      </small>
                      <span style={{ fontSize: '0.9rem', color: '#334155' }}>{m.qualifications || 'Not provided'}</span>
                    </div>

                    <div>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {t?.profile?.experienceLabel || 'Experience'}
                      </small>
                      <span style={{ fontSize: '0.9rem', color: '#334155' }}>
                        {m.years_of_experience ? `${m.years_of_experience} ${lang === 'ta' ? 'ஆண்டுகள்' : 'years'}` : 'Not provided'}
                      </span>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  {Array.isArray(m.expertise) && m.expertise.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
                        {t?.profile?.expertiseLabel || 'Areas of Expertise'}:
                      </small>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {m.expertise.map((tag) => (
                          <span key={tag} className="profile-tag" style={{ background: '#FFFFFF', borderColor: 'var(--border-subtle)', fontSize: '0.78rem' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {m.bio && (
                    <div style={{ marginBottom: '1rem' }}>
                      <small style={{ color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                        {t?.profile?.bioLabel || 'Professional Bio'}:
                      </small>
                      <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.55, color: '#334155', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        {m.bio}
                      </p>
                    </div>
                  )}

                  {/* Footer & Meta */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div>
                      {m.linkedin_url && (
                        <a
                          href={m.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--cyan-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <span>LinkedIn</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    <div>
                      {m.reviewed_at && (
                        <span>
                          {lang === 'ta' ? 'கடைசி மதிப்பாய்வு: ' : 'Reviewed: '}
                          {new Date(m.reviewed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Existing Review Note Notice */}
                  {m.review_note && (
                    <div className="mentor-review-note-callout" style={{ marginTop: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.82rem', fontWeight: 700, color: m.status === 'needs_changes' ? '#b91c1c' : 'var(--navy-900)' }}>
                        <MessageSquare size={14} />
                        <span>{t?.profile?.reviewNoteTitle || 'Review Note'}:</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: '#334155' }}>{m.review_note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* REVIEW DIALOG / MODAL */}
        {selectedMentor && (
          <div className="modal-backdrop" onClick={() => setSelectedMentor(null)}>
            <div
              className="modal-card"
              style={{ maxWidth: '600px', width: '92%', padding: '2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ShieldCheck size={22} color="var(--navy-900)" />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {lang === 'ta' ? 'வழிகாட்டி விண்ணப்ப மதிப்பாய்வு' : 'Review Mentor Profile'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Applicant Summary */}
              <div style={{ background: '#F8FAFC', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: '1.05rem', color: 'var(--navy-900)', display: 'block' }}>
                  {selectedMentor.profiles?.full_name || selectedMentor.full_name}
                </strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {selectedMentor.headline || 'Headline not provided'} • {selectedMentor.organisation || 'Organisation not provided'}
                </span>
              </div>

              {/* Feedback messages */}
              {actionSuccessMsg && (
                <div className="modal-alert-success" style={{ marginBottom: '1rem' }}>
                  <CheckCircle2 size={16} />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}
              {actionErrorMsg && (
                <div className="modal-alert-error" style={{ marginBottom: '1rem' }}>
                  <AlertCircle size={16} />
                  <span>{actionErrorMsg}</span>
                </div>
              )}

              {/* Review Note Input */}
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                  {lang === 'ta' ? 'நிர்வாகியின் மதிப்பாய்வுக் குறிப்பு / மாற்றங்களுக்கான வழிகாட்டல்' : 'Review Note / Reason for Decision'}
                  <small style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                    ({lang === 'ta' ? 'மாற்றங்களைக் கோரும் போது கட்டாயம்' : 'Required when requesting changes'})
                  </small>
                </label>
                <textarea
                  rows={4}
                  className="form-input"
                  placeholder={
                    t?.profile?.reviewNotePlaceholder ||
                    'Add specific feedback, verification instructions, or reasons for requesting changes...'
                  }
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>

              {/* Actions: Approve or Request Changes */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="btn btn-outline"
                >
                  {lang === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                </button>

                {/* Request Changes / Reject */}
                <button
                  type="button"
                  onClick={() => handleSubmitReview('needs_changes')}
                  disabled={actionInProgress !== null}
                  className="btn btn-outline"
                  style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
                >
                  {actionInProgress === 'needs_changes' ? (
                    <RefreshCw size={15} className="spin" />
                  ) : (
                    <AlertCircle size={15} />
                  )}
                  <span>{t?.profile?.requestChangesBtn || 'Request Changes'}</span>
                </button>

                {/* Approve */}
                <button
                  type="button"
                  onClick={() => handleSubmitReview('approved')}
                  disabled={actionInProgress !== null}
                  className="btn btn-primary"
                  style={{ background: '#166534', borderColor: '#166534' }}
                >
                  {actionInProgress === 'approved' ? (
                    <RefreshCw size={15} className="spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>{t?.profile?.approveBtn || 'Approve Mentor'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMentorsPage;
