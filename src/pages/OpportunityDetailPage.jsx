import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
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
  AlertCircle,
  Loader2
} from 'lucide-react';

export function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { savedOpportunities, toggleSaveOpportunity } = useAuth();

  const [opportunity, setOpportunity] = useState(() => {
    return initialOpportunities.find((o) => o.id === id) || null;
  });
  const [loading, setLoading] = useState(!opportunity);

  useEffect(() => {
    let isMounted = true;

    async function fetchOpp() {
      // If already found in initialOpportunities, we still check if there's an updated version or continue
      const local = initialOpportunities.find((o) => o.id === id);
      if (local) {
        setOpportunity(local);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!isMounted) return;

        if (data && !error) {
          setOpportunity(data);
        } else {
          setOpportunity(null);
        }
      } catch (err) {
        console.error('[OpportunityDetailPage] Error fetching opportunity:', err);
        if (isMounted) setOpportunity(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOpp();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <Loader2 size={36} color="var(--purple-600)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--text-secondary)' }}>
          {lang === 'ta' ? 'விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading opportunity details...'}
        </p>
      </div>
    );
  }

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

  const title = (lang === 'ta' && opportunity.title_ta)
    ? opportunity.title_ta
    : (opportunity.title_en || opportunity.title_ta || 'Opportunity Details');

  const provider = (lang === 'ta' && opportunity.provider_ta)
    ? opportunity.provider_ta
    : (opportunity.provider_name || opportunity.provider_en || 'Official Authority');

  let award = null;
  if (lang === 'ta' && opportunity.award_amount_ta) {
    award = opportunity.award_amount_ta;
  } else if (opportunity.award_amount_en) {
    award = opportunity.award_amount_en;
  } else if (opportunity.amount) {
    award = `₹${Number(opportunity.amount).toLocaleString('en-IN')}`;
  } else if (opportunity.description_en) {
    award = opportunity.description_en;
  } else {
    award = lang === 'ta' ? 'கல்விக் கட்டண விலக்கு / உதவித்தொகை' : 'Complete / Partial Financial Coverage';
  }

  const eligibility = (lang === 'ta' && opportunity.eligibility_ta)
    ? opportunity.eligibility_ta
    : (opportunity.eligibility_en || (lang === 'ta' ? 'அதிகாரப்பூர்வ தகுதி விதிகளைப் பார்க்கவும்.' : 'Check verified notification for full criteria.'));

  // Benefits list
  let benefits = [];
  if (lang === 'ta' && Array.isArray(opportunity.benefits_ta) && opportunity.benefits_ta.length > 0) {
    benefits = opportunity.benefits_ta;
  } else if (Array.isArray(opportunity.benefits_en) && opportunity.benefits_en.length > 0) {
    benefits = opportunity.benefits_en;
  } else if (opportunity.description_en) {
    // Split sentences into list items
    benefits = opportunity.description_en
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }
  if (benefits.length === 0) {
    benefits = [lang === 'ta' ? 'கல்விக் கட்டண சலுகை மற்றும் உதவித்தொகை.' : 'Tuition waiver and academic financial assistance.'];
  }

  // Documents list
  let documents = [];
  if (lang === 'ta' && Array.isArray(opportunity.documents_ta) && opportunity.documents_ta.length > 0) {
    documents = opportunity.documents_ta;
  } else if (Array.isArray(opportunity.documents_en) && opportunity.documents_en.length > 0) {
    documents = opportunity.documents_en;
  } else {
    documents = [
      lang === 'ta' ? '10 & 12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்கள்' : 'Class 10 & 12 Marksheets',
      lang === 'ta' ? 'பள்ளி மாற்றுச் சான்றிதழ் (TC) & Bonafide சான்றிதழ்' : 'Transfer Certificate (TC) & School Bonafide',
      lang === 'ta' ? 'சாதிச் சான்றிதழ் (Community Certificate) மற்றும் வருமானச் சான்றிதழ்' : 'Community Certificate & Income Certificate',
      lang === 'ta' ? 'மாணவர் ஆதார் அட்டை மற்றும் வங்கி கணக்கு புத்தகம் (DBT Seeded)' : 'Student Aadhaar Card & DBT Linked Bank Passbook'
    ];
  }

  const officialLink = opportunity.application_url || opportunity.official_source_url || opportunity.official_link;
  const deadline = opportunity.deadline || (lang === 'ta' ? 'அதிகாரப்பூர்வ தளத்தில் பார்க்கவும்' : 'Verify on official portal');
  const category = opportunity.category || opportunity.opportunity_type || 'Scholarship';

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
              <span className="badge badge-purple">{category}</span>
              {(opportunity.is_verified || opportunity.status === 'verified') && (
                <span className="verified-badge">
                  <ShieldCheck size={14} />
                  <span>
                    {lang === 'ta'
                      ? 'அரசு / அறக்கட்டளை சரிபார்க்கப்பட்டது'
                      : 'Audited & Verified'}
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
              {benefits.map((item, idx) => (
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
              {documents.map((doc, idx) => (
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
              <strong className="side-meta-val">{deadline}</strong>
            </div>

            <div className="side-meta-item">
              <span className="side-meta-label">
                <ShieldCheck size={14} />
                <span>{lang === 'ta' ? 'சரிபார்ப்பு நிலை' : 'Verification'}</span>
              </span>
              <strong className="side-meta-val text-green">
                {lang === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'Verified Notification'}
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
            {officialLink && (
              <a
                href={officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary side-action-btn apply-btn"
                style={{ textDecoration: 'none' }}
              >
                <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ தளம் / விண்ணப்பி' : 'Official Portal / Apply'}</span>
                <ExternalLink size={15} />
              </a>
            )}

            <p className="side-advisory-note">
              <AlertCircle size={14} />
              <span>
                {lang === 'ta'
                  ? 'அதிகாரப்பூர்வ இணையதளங்களில் மட்டுமே உங்கள் விண்ணப்பத்தை சமர்ப்பிக்கவும். இடைத்தரகர்களுக்கு பணம் செலுத்த வேண்டாம்.'
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
