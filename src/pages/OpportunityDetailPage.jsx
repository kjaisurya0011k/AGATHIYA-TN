import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialOpportunities } from '../data/appData';
import {
  ArrowLeft,
  Calendar,
  Building2,
  ShieldCheck,
  FileText,
  CheckCircle,
  ExternalLink,
  Phone,
  Bookmark,
  BookmarkCheck,
  Share2,
  AlertCircle
} from 'lucide-react';

export function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { savedOpportunities, toggleSaveOpportunity } = useAuth();

  const opportunity = initialOpportunities.find((o) => o.id === id);

  if (!opportunity) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>{lang === 'ta' ? 'வாய்ப்பு கண்டறியப்படவில்லை' : 'Opportunity Not Found'}</h2>
        <Link to="/opportunities" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {lang === 'ta' ? 'அனைத்து வாய்ப்புகளுக்குத் திரும்பு' : 'Back to Opportunities'}
        </Link>
      </div>
    );
  }

  const isSaved = savedOpportunities.includes(opportunity.id);
  const title = lang === 'ta' ? opportunity.title_ta : opportunity.title_en;
  const provider = lang === 'ta' ? opportunity.provider_ta : opportunity.provider_en;
  const award = lang === 'ta' ? opportunity.award_amount_ta : opportunity.award_amount_en;
  const eligibility = lang === 'ta' ? opportunity.eligibility_ta : opportunity.eligibility_en;
  const benefits = lang === 'ta' ? opportunity.benefits_ta : opportunity.benefits_en;
  const documents = lang === 'ta' ? opportunity.documents_ta : opportunity.documents_en;

  return (
    <div className="page-wrapper container">
      {/* Back button & Breadcrumb */}
      <div className="detail-top-nav">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-btn"
          aria-label="Go Back"
        >
          <ArrowLeft size={16} />
          <span>{lang === 'ta' ? 'பின்செல்க' : 'Back'}</span>
        </button>

        <div className="breadcrumb-trail">
          <Link to="/">{lang === 'ta' ? 'முகப்பு' : 'Home'}</Link>
          <span>/</span>
          <Link to="/opportunities">{lang === 'ta' ? 'வாய்ப்புகள்' : 'Opportunities'}</Link>
          <span>/</span>
          <span className="current-crumb">{title}</span>
        </div>
      </div>

      <div className="detail-layout">
        {/* Main Content Area */}
        <div className="detail-main-col">
          {/* Header Card */}
          <div className="card detail-header-card">
            <div className="detail-badges-row">
              <span className="badge badge-purple">{opportunity.category}</span>
              {opportunity.is_verified && (
                <span className="verified-badge">
                  <ShieldCheck size={14} />
                  <span>
                    {lang === 'ta'
                      ? `அரசு சரிபார்க்கப்பட்டது (${opportunity.verification_date})`
                      : `Verified (${opportunity.verification_date})`}
                  </span>
                </span>
              )}
            </div>

            <h1 className="detail-title">{title}</h1>

            <div className="detail-provider">
              <Building2 size={18} color="var(--navy-900)" />
              <span>{provider}</span>
            </div>

            {/* Award Banner */}
            <div className="detail-award-box">
              <span className="award-box-label">
                {lang === 'ta' ? 'வழங்கப்படும் உதவித்தொகை / சலுகை' : 'Award & Financial Coverage'}
              </span>
              <div className="award-box-value">{award}</div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="card detail-section-card">
            <h2 className="detail-section-title">
              <CheckCircle size={20} color="var(--cyan-600)" />
              <span>{lang === 'ta' ? 'முக்கிய பயன்கள்' : 'Key Benefits & Concessions'}</span>
            </h2>
            <ul className="detail-list">
              {benefits?.map((item, idx) => (
                <li key={idx}>
                  <CheckCircle size={16} color="#16a34a" className="list-icon" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligibility Section */}
          <div className="card detail-section-card">
            <h2 className="detail-section-title">
              <ShieldCheck size={20} color="var(--purple-600)" />
              <span>{lang === 'ta' ? 'யாரெல்லாம் விண்ணப்பிக்கலாம்? (தகுதி)' : 'Eligibility Criteria'}</span>
            </h2>
            <p className="eligibility-detail-text">{eligibility}</p>
          </div>

          {/* Documents Checklist Section */}
          <div className="card detail-section-card">
            <h2 className="detail-section-title">
              <FileText size={20} color="var(--navy-900)" />
              <span>{lang === 'ta' ? 'தேவையான அத்தியாவசிய ஆவணங்கள்' : 'Required Documents'}</span>
            </h2>
            <ul className="detail-list doc-list">
              {documents?.map((doc, idx) => (
                <li key={idx}>
                  <span className="doc-num">{idx + 1}</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar Action Column */}
        <div className="detail-side-col">
          <div className="card detail-action-card">
            <h3 className="side-card-title">
              {lang === 'ta' ? 'விண்ணப்ப விபரம்' : 'Application Overview'}
            </h3>

            <div className="side-meta-item">
              <span className="side-meta-label">
                <Calendar size={14} />
                <span>{lang === 'ta' ? 'கடைசி தேதி' : 'Deadline'}</span>
              </span>
              <strong className="side-meta-val">{opportunity.deadline}</strong>
            </div>

            <div className="side-meta-item">
              <span className="side-meta-label">
                <ShieldCheck size={14} />
                <span>{lang === 'ta' ? 'சரிபார்ப்பு நிலை' : 'Verification'}</span>
              </span>
              <strong className="side-meta-val text-green">
                {lang === 'ta' ? 'அரசு தணிக்கை பெற்றது' : 'Government Audited'}
              </strong>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={() => toggleSaveOpportunity(opportunity.id)}
              className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'} side-action-btn`}
            >
              {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              <span>
                {isSaved
                  ? lang === 'ta'
                    ? 'சேமிக்கப்பட்டது'
                    : 'Saved to Profile'
                  : lang === 'ta'
                  ? 'சேமித்து வைக்க'
                  : 'Save Opportunity'}
              </span>
            </button>

            {/* Official Portal Apply Button */}
            {opportunity.official_link && (
              <a
                href={opportunity.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary side-action-btn apply-btn"
              >
                <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ தளம்' : 'Official Portal'}</span>
                <ExternalLink size={15} />
              </a>
            )}

            <p className="side-advisory-note">
              <AlertCircle size={14} />
              <span>
                {lang === 'ta'
                  ? 'அதிகாரப்பூர்வ அரசு இணையதளங்களில் மட்டுமே உங்கள் விண்ணப்பத்தை சமர்ப்பிக்கவும். இடைத்தரகர்களுக்கு பணம் செலுத்த வேண்டாம்.'
                  : 'Always apply directly on the verified official portal. Never pay money to unauthorized intermediaries.'}
              </span>
            </p>

            {opportunity.contact_info && (
              <div className="side-contact-box">
                <span className="side-contact-label">
                  <Phone size={13} />
                  <span>{lang === 'ta' ? 'அரசு உதவி எண்:' : 'Official Helpline:'}</span>
                </span>
                <p className="side-contact-text">{opportunity.contact_info}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
