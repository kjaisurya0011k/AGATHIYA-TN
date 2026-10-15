import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  User,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  MapPin,
  School,
  BookOpen,
  Award,
  HeartHandshake,
  Trash2,
  Edit3,
  Lock,
  ArrowRight
} from 'lucide-react';

export function ProfilePage() {
  const {
    user,
    profile,
    studentDetails,
    isProfileComplete,
    setShowOnboardingModal,
    requestDataDeletion,
    signInWithGoogle
  } = useAuth();

  const { lang, t } = useLanguage();
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  if (!user) {
    return (
      <div className="container profile-page-container">
        <div className="card profile-guest-card">
          <div className="guest-icon-box">
            <Lock size={32} color="var(--navy-900)" />
          </div>
          <h2>{lang === 'ta' ? 'சுயவிவரத்தைக் காண உள்நுழையவும்' : 'Sign in to View Your Student Profile'}</h2>
          <p>
            {lang === 'ta'
              ? 'உங்கள் கல்வித் தகுதிகள், கட்-ஆஃப் மதிப்பெண்கள் மற்றும் உதவித்தொகைகளை நிர்வகிக்க உள்நுழையவும்.'
              : 'Sign in with your Google account to view personalized cutoff eligibility and scholarship recommendations.'}
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="btn btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            <span>{t.auth.continueWithGoogle}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteClick = async () => {
    if (window.confirm(t.onboarding.deleteConfirm)) {
      setDeleting(true);
      await requestDataDeletion();
      setDeleting(false);
      setDeleteConfirmed(true);
    }
  };

  const getFullName = () => {
    return studentDetails?.full_name || profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'TN Student';
  };

  return (
    <div className="profile-page-wrapper">
      <div className="container profile-container">
        {/* Header Breadcrumb / Intro */}
        <div className="profile-header-card card">
          <div className="profile-header-left">
            <div className="profile-avatar-large">
              {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                <img
                  src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                  alt={getFullName()}
                  className="profile-img-large"
                />
              ) : (
                <span>{getFullName().charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="profile-intro-text">
              <div className="profile-name-row">
                <h2>{getFullName()}</h2>
                <span className={`status-badge ${isProfileComplete ? 'complete' : 'pending'}`}>
                  {isProfileComplete ? t.auth.profileComplete : t.auth.profileIncomplete}
                </span>
              </div>
              <p className="profile-email-text">{user.email}</p>
              <div className="profile-quick-tags">
                <span className="profile-tag">
                  <MapPin size={13} />
                  {studentDetails?.district || profile?.district || 'Tamil Nadu'}
                </span>
                <span className="profile-tag">
                  <School size={13} />
                  {studentDetails?.school_board || 'State Board'}
                </span>
                {studentDetails?.age && (
                  <span className="profile-tag">
                    <Calendar size={13} />
                    {studentDetails.age} {t.onboarding.yearsOld}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-header-actions">
            <button
              type="button"
              onClick={() => setShowOnboardingModal(true)}
              className="btn btn-primary"
            >
              <Edit3 size={16} />
              <span>{isProfileComplete ? (lang === 'ta' ? 'விவரங்களைத் திருத்து' : 'Edit Details') : t.auth.completeProfileBtn}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {studentDetails?.delete_requested || deleteConfirmed ? (
          <div className="profile-alert warning" role="alert">
            <AlertCircle size={18} />
            <div>
              <strong>{lang === 'ta' ? 'தரவு நீக்குதல் கோரப்பட்டது' : 'Data Deletion Requested'}</strong>
              <p>{t.onboarding.deleteRequested}</p>
            </div>
          </div>
        ) : null}

        {/* Detailed Grid */}
        <div className="profile-details-grid">
          {/* Card 1: Academic & Cutoff Summary */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <GraduationCap size={18} color="var(--cyan-700)" />
              <h3>{lang === 'ta' ? 'கல்வி & கட்-ஆஃப் விபரம்' : 'Academic & Cutoff Summary'}</h3>
            </div>

            <div className="cutoff-highlight-banner">
              <div className="cutoff-banner-text">
                <span>{t.onboarding.cutoff}</span>
                <div className="cutoff-number-display">
                  {studentDetails?.cutoff_marks ? (
                    <>
                      <strong>{studentDetails.cutoff_marks}</strong>
                      <small>/ 200</small>
                    </>
                  ) : (
                    <span className="pending-text">{lang === 'ta' ? 'கணக்கிடப்படவில்லை' : 'Not calculated yet'}</span>
                  )}
                </div>
              </div>
              <small className="cutoff-calc-formula">
                {t.onboarding.cutoffNote}
              </small>
            </div>

            <div className="profile-data-list">
              <div className="data-row">
                <span className="data-key">{t.onboarding.currentStatus}</span>
                <span className="data-val">{studentDetails?.current_status || 'Class 12'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.schoolName}</span>
                <span className="data-val">{studentDetails?.school_name || '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.groupStream}</span>
                <span className="data-val">{studentDetails?.group_stream || '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.marksTitle}</span>
                <span className="data-val">
                  {studentDetails?.maths_marks ? `Maths: ${studentDetails.maths_marks}` : ''}
                  {studentDetails?.physics_marks ? ` | Physics: ${studentDetails.physics_marks}` : ''}
                  {studentDetails?.chemistry_marks ? ` | Chem: ${studentDetails.chemistry_marks}` : ''}
                  {!studentDetails?.maths_marks && '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Contact, Location & Demographics */}
          <div className="card profile-section-card">
            <div className="section-card-title">
              <User size={18} color="var(--purple-600)" />
              <h3>{lang === 'ta' ? 'தொடர்பு & இட விவரங்கள்' : 'Location & Details'}</h3>
            </div>

            <div className="profile-data-list">
              <div className="data-row">
                <span className="data-key">{t.onboarding.district}</span>
                <span className="data-val">{studentDetails?.district || profile?.district || '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.town}</span>
                <span className="data-val">{studentDetails?.town || '—'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.phone}</span>
                <span className="data-val">
                  {studentDetails?.phone_number ? `+91 ${studentDetails.phone_number}` : '—'}
                </span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.community}</span>
                <span className="data-val">{studentDetails?.community_category || 'Prefer not to say'}</span>
              </div>
              <div className="data-row">
                <span className="data-key">{t.onboarding.income}</span>
                <span className="data-val">{studentDetails?.annual_income_range || 'Prefer not to say'}</span>
              </div>
            </div>

            {/* Minor Guardian Details (If applicable) */}
            {studentDetails?.guardian_name && (
              <div className="guardian-summary-box">
                <div className="guardian-summary-title">
                  <ShieldCheck size={14} color="var(--purple-700)" />
                  <span>{lang === 'ta' ? 'பெற்றோர் / பாதுகாவலர் விவரம்' : 'Parent / Guardian Details'}</span>
                </div>
                <p><strong>{studentDetails.guardian_name}</strong> ({studentDetails.guardian_phone})</p>
              </div>
            )}
          </div>
        </div>

        {/* Plain Language Data Privacy & Delete My Data Card */}
        <div className="card profile-privacy-card">
          <div className="privacy-card-header">
            <Lock size={20} color="var(--cyan-700)" />
            <div>
              <h3>{t.onboarding.dataPrivacyTitle}</h3>
              <p>{t.onboarding.dataPrivacyNote}</p>
            </div>
          </div>

          <div className="privacy-actions-row">
            <div className="consent-status-tag">
              <CheckCircle2 size={16} color="#16a34a" />
              <span>{lang === 'ta' ? 'சம்மதம் வழங்கப்பட்டது' : 'Consent active for scholarship matching'}</span>
            </div>

            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleting || studentDetails?.delete_requested || deleteConfirmed}
              className="btn btn-outline btn-danger-outline"
            >
              <Trash2 size={15} />
              <span>{deleting ? (lang === 'ta' ? 'கோரப்படுகிறது...' : 'Submitting...') : t.onboarding.deleteData}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
