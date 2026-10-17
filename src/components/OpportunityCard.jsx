import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';

export function OpportunityCard({ opportunity }) {
  const { lang } = useLanguage();
  const { savedOpportunities, toggleSaveOpportunity } = useAuth();

  const isSaved = savedOpportunities.includes(opportunity.id);

  // Bilingual Title
  const title = (lang === 'ta' && opportunity.title_ta)
    ? opportunity.title_ta
    : (opportunity.title_en || opportunity.title_ta || 'Higher Education Opportunity');

  // Provider
  const rawProvider = (lang === 'ta' && opportunity.provider_ta)
    ? opportunity.provider_ta
    : (opportunity.provider_name || opportunity.provider_en || opportunity.provider_ta);
  const provider = (rawProvider && rawProvider.trim())
    ? rawProvider.trim()
    : (lang === 'ta' ? 'அரசு / அதிகாரப்பூர்வ அமைப்பு' : 'Official State / National Authority');

  // Award / Benefit Amount formatting
  let award = null;
  if (lang === 'ta' && opportunity.award_amount_ta && opportunity.award_amount_ta.trim()) {
    award = opportunity.award_amount_ta.trim();
  } else if (opportunity.award_amount_en && opportunity.award_amount_en.trim()) {
    award = opportunity.award_amount_en.trim();
  } else if (opportunity.amount) {
    award = `₹${Number(opportunity.amount).toLocaleString('en-IN')}`;
  } else if (opportunity.support_type && opportunity.support_type.trim()) {
    award = opportunity.support_type.trim();
  } else if (opportunity.description_en && opportunity.description_en.trim()) {
    const desc = opportunity.description_en.trim();
    if (desc.includes('Benefits:')) {
      const bPart = desc.split('Benefits:')[1].split('.')[0].trim();
      if (bPart) {
        award = bPart.length > 70 ? bPart.substring(0, 67) + '...' : bPart;
      }
    }
    if (!award) {
      award = desc.length > 70 ? desc.substring(0, 67) + '...' : desc;
    }
  }

  if (!award || !award.trim()) {
    award = lang === 'ta' ? 'கல்விக் கட்டண விலக்கு / நிதியுதவி' : 'Full / Partial Fee Waiver & Support';
  }

  // Eligibility snippet with redundant prefix stripped
  let rawEligibility = (lang === 'ta' && opportunity.eligibility_ta)
    ? opportunity.eligibility_ta
    : (opportunity.eligibility_en || opportunity.eligibility_criteria_en || opportunity.eligibility_ta);

  if (rawEligibility && typeof rawEligibility === 'string') {
    rawEligibility = rawEligibility.replace(/^Eligibility:\s*/i, '').trim();
  }

  const eligibility = (rawEligibility && rawEligibility.trim())
    ? rawEligibility.trim()
    : (lang === 'ta' ? 'அதிகாரப்பூர்வ தகுதி விதிகளைப் பார்க்கவும்.' : 'Check full details for verified eligibility criteria.');

  // Category badge
  const category = opportunity.category || opportunity.opportunity_type || 'Scholarship';

  // Deadline display
  const rawDeadline = opportunity.deadline;
  const deadline = (rawDeadline && String(rawDeadline).trim())
    ? String(rawDeadline).trim()
    : (lang === 'ta' ? 'அதிகாரப்பூர்வ தளத்தில் பார்க்கவும்' : 'Verify on portal cycle');

  // Official Link
  const officialLink = opportunity.application_url || opportunity.official_source_url || opportunity.official_link;

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
          {(opportunity.is_verified || opportunity.status === 'verified') && (
            <span className="verified-badge" title="Audited against official government / institutional notifications">
              <ShieldCheck size={13} />
              <span>{lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
            </span>
          )}
          <span className="opp-type-badge">{category}</span>
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
          title={isSaved ? 'Saved to profile' : 'Save to my profile'}
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
      {award && (
        <div className="opp-award-banner">
          <span className="award-label">{lang === 'ta' ? 'கிடைக்கும் உதவி:' : 'Benefit:'}</span>
          <strong className="award-val">{award}</strong>
        </div>
      )}

      {/* Eligibility Snippet */}
      <p className="opp-eligibility" title={eligibility}>
        <strong>{lang === 'ta' ? 'தகுதி: ' : 'Eligibility: '}</strong>
        {eligibility}
      </p>

      {/* Bottom Footer: Deadline & Action Buttons */}
      <div className="opp-footer">
        <div className="opp-deadline">
          <Calendar size={14} />
          <span>
            {lang === 'ta' ? 'கடைசி தேதி: ' : 'Deadline: '}
            <strong>{deadline}</strong>
          </span>
        </div>

        <div className="opp-card-actions-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
          <Link
            to={`/opportunities/${opportunity.id}`}
            className="btn btn-sm btn-outline view-detail-btn"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>{lang === 'ta' ? 'முழு விபரம்' : 'View Details'}</span>
            <ArrowRight size={14} />
          </Link>

          {officialLink && (
            <a
              href={officialLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary apply-btn"
              style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}
              title={lang === 'ta' ? 'அதிகாரப்பூர்வ இணையதளத்தில் விண்ணப்பிக்கவும்' : 'Apply on official portal'}
            >
              <span>{lang === 'ta' ? 'விண்ணப்பி' : 'Apply'}</span>
              <ExternalLink size={13} style={{ marginLeft: '4px' }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
