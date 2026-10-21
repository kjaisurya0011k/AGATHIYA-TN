import { brand } from '../data/brand';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, FileText, RefreshCw, ArrowLeft, Headphones } from 'lucide-react';
import './LegalPage.css';

export function LegalPage({ type = 'privacy' }) {
  const { lang } = useLanguage();
  const isTamil = lang === 'ta';
  const location = useLocation();

  // Determine active document from prop or pathname
  let activeDoc = type;
  if (location.pathname.includes('terms')) activeDoc = 'terms';
  else if (location.pathname.includes('refund')) activeDoc = 'refund';
  else if (location.pathname.includes('privacy')) activeDoc = 'privacy';

  const documents = {
    privacy: {
      icon: <ShieldCheck size={28} className="legal-icon" />,
      tag: isTamil ? 'தனியுரிமை ஆவணம்' : 'Privacy & Trust',
      title: isTamil ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy',
      lastUpdated: 'October 18, 2026',
      content: isTamil ? (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>குறிப்பு:</strong> இது ${brand.name} தளத்திற்கான மதிப்பாய்வு வரைவு ஆவணமாகும் (Draft for Review).
          </div>
          <h3>1. நாங்கள் சேகரிக்கும் தகவல்கள்</h3>
          <p>
            ${brand.name} தளத்தில் மாணவர்கள் தங்கள் உயர்கல்வி, கட்-ஆஃப் மற்றும் உதவித்தொகை வாய்ப்புகளை அறிந்துகொள்ள பதிவு செய்யும்போது பெயர், மின்னஞ்சல், தொலைபேசி எண், பள்ளி மற்றும் மாவட்ட விபரங்களை மட்டுமே தன்னார்வமாகப் பெறுகிறோம்.
          </p>
          <h3>2. தகவல்கள் எவ்வாறு பயன்படுத்தப்படுகின்றன?</h3>
          <p>
            மாணவர்களுக்குப் பொருத்தமான வழிகாட்டல் அமர்வுகள், அரசு திட்டங்கள் மற்றும் கல்வி வாய்ப்புகளைத் தெரிவிப்பதற்காக மட்டுமே இந்தத் தகவல்கள் பயன்படுகின்றன. எக்காரணம் கொண்டும் மாணவர்களின் தகவல்கள் வணிக நிறுவனங்களுக்கோ அல்லது இடைத்தரகர்களுக்கோ விற்கப்படுவதில்லை.
          </p>
          <h3>3. உதவி மைய தகவல்கள் & பாதுகாப்பு</h3>
          <p>
            Contact & Support படிவம் மூலம் பெறப்படும் வினவல்கள் பாதுகாப்பான சர்வர் தளத்தில் சேமிக்கப்பட்டு, மாணவர் பிரச்சனைகளைத் தீர்ப்பதற்கு மட்டுமே அதிகாரப்பூர்வ ஆலோசகர்களால் அணுகப்படும்.
          </p>
          <h3>4. உங்கள் உரிமைகள்</h3>
          <p>
            உங்கள் கணக்கு அல்லது பதிவு விபரங்களை எப்போது வேண்டுமானாலும் திருத்தவோ அல்லது நீக்கவோ Profile பக்கத்தில் கோரிக்கை வைக்கலாம்.
          </p>
        </div>
      ) : (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>Notice:</strong> This is an official draft policy for ${brand.name}, published for student and partner review.
          </div>
          <h3>1. Information We Collect</h3>
          <p>
            When registering or requesting support through ${brand.name}, we collect basic profile details including your full name, email address, optional contact number, district, and educational stream. When you submit a support ticket, we securely store your message and enquiry category.
          </p>
          <h3>2. Purpose & Use of Data</h3>
          <p>
            We use your information exclusively to provide verified higher education pathways, cutoff estimations, mentorship session access, and support response. We never sell, monetize, or disclose student data to commercial advertising brokers or third-party marketing agencies.
          </p>
          <h3>3. Support Enquiries & Security</h3>
          <p>
            All support messages are transmitted via encrypted connections and protected by strict Row-Level Security policies in our database. Only verified platform administrators have access to support messages to resolve your tickets.
          </p>
          <h3>4. Data Ownership & Deletion</h3>
          <p>
            You retain full ownership of your account information. You may view, update, or request complete account deletion at any time through your Profile Settings.
          </p>
        </div>
      )
    },
    terms: {
      icon: <FileText size={28} className="legal-icon" />,
      tag: isTamil ? 'பயன்பாட்டு விதிமுறைகள்' : 'Terms of Service',
      title: isTamil ? 'விதிமுறைகள் மற்றும் நிபந்தனைகள்' : 'Terms & Conditions',
      lastUpdated: 'October 18, 2026',
      content: isTamil ? (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>குறிப்பு:</strong> இது ${brand.name} தளத்தின் பயன்பாட்டு விதிமுறைகளுக்கான மதிப்பாய்வு வரைவு ஆவணமாகும்.
          </div>
          <h3>1. தளத்தின் நோக்கம்</h3>
          <p>
            ${brand.name} என்பது தமிழ்நாட்டில் 12-ஆம் வகுப்பு முடித்த கிராமப்புற மற்றும் சிறுநகர மாணவர்களுக்கு இலவச மற்றும் நியாயமான உயர்கல்வி விழிப்புணர்வை வழங்கும் சமூக முயற்சியாகும்.
          </p>
          <h3>2. சேர்க்கை வழிகாட்டல் விபரங்கள்</h3>
          <p>
            இங்கு வெளியிடப்படும் கட்-ஆஃப் சூத்திரங்கள், அரசு உதவித்தொகைகள் மற்றும் சேர்க்கை வழிகாட்டல்கள் அரசு அதிகாரப்பூர்வ ஆணைகளின் அடிப்படையில் தொகுக்கப்பட்டவை. மாணவர்கள் இறுதி முடிவெடுக்கும் முன் அதிகாரப்பூர்வ கலந்தாய்வு தளங்களில் சரிபார்க்க அறிவுறுத்தப்படுகிறார்கள்.
          </p>
          <h3>3. இடைத்தரகர்களுக்கு எதிரான கொள்கை</h3>
          <p>
            கல்லூரி சேர்க்கைக்காக எந்தவொரு தனியார் ஏஜெண்டுகளுக்கோ இடைத்தரகர்களுக்கோ முன் பணம் செலுத்த வேண்டாம். அரசு ஒற்றைச் சாளர கவுன்சிலிங் மூலமே கல்லூரியைத் தேர்ந்தெடுக்க வேண்டும்.
          </p>
        </div>
      ) : (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>Notice:</strong> This document represents the operational terms of use for ${brand.name} educational platforms.
          </div>
          <h3>1. Platform Scope & Purpose</h3>
          <p>
            ${brand.name} is an initiative providing verified education guidance, mentorship webinars, and scholarship awareness for students across all districts of Tamil Nadu.
          </p>
          <h3>2. Educational Accuracy & Disclaimers</h3>
          <p>
            While cutoffs, quota thresholds (such as the 7.5% government school waiver), and scholarship data are curated from official government gazettes, students must confirm statutory admission dates and counselling schedules via official university portals.
          </p>
          <h3>3. Zero-Intermediary Advisory</h3>
          <p>
            ${brand.name} strongly advises all students and parents against paying advance seat-reservation fees to unverified brokers or agents. Official admissions must strictly proceed through government single-window counselling portals.
          </p>
        </div>
      )
    },
    refund: {
      icon: <RefreshCw size={28} className="legal-icon" />,
      tag: isTamil ? 'கட்டண ரீஃபண்ட் கொள்கை' : 'Refund Guidelines',
      title: isTamil ? 'ரீஃபண்ட் & ரத்துக் கொள்கை' : 'Refund & Cancellation Policy',
      lastUpdated: 'October 18, 2026',
      content: isTamil ? (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>குறிப்பு:</strong> கட்டணப் பயிற்சிகள் மற்றும் பட்டறைகளுக்கான ரீஃபண்ட் கொள்கை வரைவு.
          </div>
          <h3>1. இலவச அமர்வுகள்</h3>
          <p>
            ${brand.name} தளத்தில் வழங்கப்படும் பெரும்பாலான வழிகாட்டல் வெபினார்கள் மற்றும் ஆலோசனைகள் மாணவர்களுக்கு 100% இலவசமானவை.
          </p>
          <h3>2. கட்டணப் பட்டறைகள் & ரத்து</h3>
          <p>
            ஒரு சிறப்பு பட்டறை ${brand.name} அல்லது பேச்சாளரால் ரத்து செய்யப்பட்டால், செலுத்தப்பட்ட கட்டணம் 5-7 வேலை நாட்களுக்குள் அசல் கட்டண முறைக்கே 100% திருப்பி அளிக்கப்படும்.
          </p>
          <h3>3. இரட்டைப் பரிவர்த்தனை (Duplicate Payments)</h3>
          <p>
            இணையத் தொடர்பு துண்டிக்கப்பட்டு ஒரே பதிவுக்கு இரண்டு முறை கட்டணம் கழிக்கப்பட்டால், Contact & Support படிவத்தில் பரிவர்த்தனை குறிப்பு எண்ணுடன் செய்தி அனுப்பினால் உடனடியாக சரிபார்க்கப்பட்டு கூடுதல் தொகை ரீஃபண்ட் செய்யப்படும்.
          </p>
        </div>
      ) : (
        <div className="legal-body">
          <div className="legal-draft-notice">
            <strong>Notice:</strong> Applicable to paid skill bootcamps, workshops, and verified certificate masterclasses.
          </div>
          <h3>1. Free Public Webinars</h3>
          <p>
            The majority of ${brand.name} career counseling webinars, college cutoff reviews, and scholarship guidance events are offered free of cost to students.
          </p>
          <h3>2. Workshop Cancellations by Organizer</h3>
          <p>
            If a paid technical workshop is cancelled or rescheduled by ${brand.name}, registered participants will automatically receive a full refund credited to their original payment method within 5–7 business days.
          </p>
          <h3>3. Duplicate Transaction Support</h3>
          <p>
            If you encounter duplicate charges during registration due to a network glitch, submit an enquiry with category 'Payment or Refund' and your payment transaction ID. Our finance team will verify the payment log and issue an immediate reversal.
          </p>
        </div>
      )
    }
  };

  const doc = documents[activeDoc] || documents.privacy;

  return (
    <div className="legal-page-root">
      <div className="container legal-container">
        {/* Breadcrumb navigation */}
        <div className="legal-nav-bar">
          <Link to="/" className="legal-back-link">
            <ArrowLeft size={16} />
            <span>{isTamil ? 'முகப்புக்குச் செல்' : 'Back to Home'}</span>
          </Link>
          <div className="legal-tabs">
            <Link
              to="/privacy"
              className={`legal-tab-btn ${activeDoc === 'privacy' ? 'active' : ''}`}
            >
              {isTamil ? 'தனியுரிமை' : 'Privacy'}
            </Link>
            <Link
              to="/terms"
              className={`legal-tab-btn ${activeDoc === 'terms' ? 'active' : ''}`}
            >
              {isTamil ? 'விதிமுறைகள்' : 'Terms'}
            </Link>
            <Link
              to="/refund-policy"
              className={`legal-tab-btn ${activeDoc === 'refund' ? 'active' : ''}`}
            >
              {isTamil ? 'ரீஃபண்ட்' : 'Refunds'}
            </Link>
            <Link
              to="/contact"
              className="legal-tab-btn support-tab"
            >
              <Headphones size={14} />
              <span>{isTamil ? 'உதவி மையம்' : 'Support'}</span>
            </Link>
          </div>
        </div>

        {/* Document Card */}
        <div className="card legal-card">
          <div className="legal-header">
            <div className="legal-icon-wrap">{doc.icon}</div>
            <div>
              <span className="badge badge-cyan">{doc.tag}</span>
              <h1 className="legal-title">{doc.title}</h1>
              <p className="legal-updated">
                {isTamil ? 'கடைசியாக புதுப்பிக்கப்பட்டது:' : 'Last updated:'} {doc.lastUpdated}
              </p>
            </div>
          </div>

          <div className="legal-content-wrapper">
            {doc.content}
          </div>

          <div className="legal-footer-contact">
            <div>
              <strong>{isTamil ? 'கேள்விகள் அல்லது விளக்கங்கள் தேவையா?' : 'Questions about our policies?'}</strong>
              <p>{isTamil ? 'எங்கள் குழு உங்களுக்கு உதவ எப்போதும் தயாராக உள்ளது.' : 'Contact our official support desk anytime.'}</p>
            </div>
            <Link to="/contact" className="btn btn-primary btn-sm">
              <Headphones size={15} />
              <span>{isTamil ? 'உதவி மையத்தைத் தொடர்பு கொள்க' : 'Contact Support'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalPage;
