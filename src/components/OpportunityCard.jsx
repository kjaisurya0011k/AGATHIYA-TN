import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2,
  Calendar,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Building2
} from 'lucide-react';

export function OpportunityCard({ opportunity }) {
  const { lang } = useLanguage();
  const { savedOpportunities, toggleSaveOpportunity, user } = useAuth();

  const isSaved = savedOpportunities.includes(opportunity.id);

  const title = lang === 'ta' ? opportunity.title_ta : opportunity.title_en;
  const provider = lang === 'ta' ? opportunity.provider_ta : opportunity.provider_en;
  const award = lang === 'ta' ? opportunity.award_amount_ta : opportunity.award_amount_en;
  const eligibility = lang === 'ta' ? opportunity.eligibility_ta : opportunity.eligibility_en;

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveOpportunity(opportunity.id);
  };

  return (
    <div className="card opp-card">
      {/* Top Header: Verification & Bookmark */}
      <div className="opp-header">
        <div className="opp-meta-left">
          {opportunity.is_verified && (
            <span className="verified-badge" title={`Verified on ${opportunity.verification_date}`}>
              <ShieldCheck size={13} />
              <span>{lang === 'ta' ? 'அரசு சரிபார்க்கப்பட்டது' : 'Verified Source'}</span>
            </span>
          )}
          <span className="opp-type-badge">{opportunity.category}</span>
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
          title={isSaved ? 'Saved to achievements' : 'Save to my profile'}
        >
          {isSaved ? <BookmarkCheck size={18} color="var(--purple-600)" /> : <Bookmark size={18} />}
        </button>
      </div>

      {/* Title & Provider */}
      <h3 className="opp-title">
        <Link to={`/opportunities/${opportunity.id}`}>{title}</Link>
      </h3>

      <div className="opp-provider">
        <Building2 size={15} color="var(--navy-900)" />
        <span>{provider}</span>
      </div>

      {/* Award Amount Pill */}
      <div className="opp-award-banner">
        <span className="award-label">{lang === 'ta' ? 'கிடைக்கும் உதவி:' : 'Benefit:'}</span>
        <strong className="award-val">{award}</strong>
      </div>

      {/* Eligibility Snippet */}
      <p className="opp-eligibility">
        <strong>{lang === 'ta' ? 'தகுதி: ' : 'Eligibility: '}</strong>
        {eligibility}
      </p>

      {/* Bottom Footer: Deadline & Action Link */}
      <div className="opp-footer">
        <div className="opp-deadline">
          <Calendar size={14} />
          <span>
            {lang === 'ta' ? 'கடைசி தேதி: ' : 'Deadline: '}
            <strong>{opportunity.deadline}</strong>
          </span>
        </div>

        <Link to={`/opportunities/${opportunity.id}`} className="btn btn-sm btn-outline view-detail-btn">
          <span>{lang === 'ta' ? 'முழு விபரம்' : 'View Details'}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
