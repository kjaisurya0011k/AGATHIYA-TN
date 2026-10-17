import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { GraduationCap, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import './Footer.css';

export function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="footer-wrapper">
      <div className="container footer-content">
        {/* Brand & Purpose Column */}
        <div className="footer-col brand-col">
          <div className="footer-brand">
            <div className="brand-icon">
              <GraduationCap size={20} color="#FFFFFF" />
            </div>
            <span className="footer-brand-name">EEE-TN</span>
          </div>
          <p className="footer-tagline">
            {lang === 'ta'
              ? 'கல்வி பரிணாமம் மற்றும் அதிகாரம் - தமிழ்நாடு. 12-ஆம் வகுப்பு முடித்த கிராமப்புற மற்றும் சிறுநகர மாணவர்களுக்கான உண்மையான வழிகாட்டி தளம்.'
              : 'Education Evolution and Empowerment – Tamil Nadu. A trustworthy guidance platform for Class 12 students from Tier 2, Tier 3 towns and rural areas.'}
          </p>
          <div className="trust-badge">
            <ShieldCheck size={16} color="var(--cyan-600)" />
            <span>{lang === 'ta' ? 'அரசு அங்கீகரிக்கப்பட்ட தகவல்கள் மட்டுமே' : '100% Verified Govt Sources'}</span>
          </div>
        </div>

        {/* Official Tamil Nadu Portals */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {lang === 'ta' ? 'அரசு அதிகாரப்பூர்வ தளங்கள்' : 'Official State Portals'}
          </h4>
          <ul className="footer-links">
            <li>
              <a href="https://www.tneaonline.org" target="_blank" rel="noopener noreferrer">
                <span>TNEA பொறியியல் கவுன்சிலிங்</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://tnmedicalselection.net" target="_blank" rel="noopener noreferrer">
                <span>TN மருத்துவ கவுன்சிலிங் (MBBS/BDS)</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://www.tngasa.in" target="_blank" rel="noopener noreferrer">
                <span>TNGASA கலை & அறிவியல் சேர்க்கை</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://tnau.ac.in" target="_blank" rel="noopener noreferrer">
                <span>TNAU தமிழ்நாடு வேளாண் பல்கலைக்கழகம்</span>
                <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a href="https://naanmudhalvan.tn.gov.in" target="_blank" rel="noopener noreferrer">
                <span>நான் முதல்வன் (Naan Mudhalvan)</span>
                <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Navigation Links */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {lang === 'ta' ? 'முக்கிய வழிகாட்டல்' : 'Quick Pathways'}
          </h4>
          <ul className="footer-links">
            <li>
              <Link to="/opportunities">
                {lang === 'ta' ? '7.5% அரசுப் பள்ளி இடஒதுக்கீடு' : '7.5% Govt School Quota'}
              </Link>
            </li>
            <li>
              <Link to="/opportunities">
                {lang === 'ta' ? 'புதுமைப் பெண் & தமிழ்ப் புதல்வன்' : 'Pudhumai Penn & Tamil Pudhalvan'}
              </Link>
            </li>
            <li>
              <Link to="/opportunities">
                {lang === 'ta' ? 'முதல் பட்டதாரி கட்டணச் சலுகை' : 'First Graduate Fee Waiver'}
              </Link>
            </li>
            <li>
              <Link to="/sessions">
                {lang === 'ta' ? 'இலவச வழிகாட்டல் வெபினார்கள்' : 'Free Mentor Webinars'}
              </Link>
            </li>
            <li>
              <Link to="/achievements">
                {lang === 'ta' ? 'சேமிக்கப்பட்ட உதவித்தொகைகள்' : 'Saved Opportunities'}
              </Link>
            </li>
          </ul>
        </div>

        {/* Caution Advisory */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {lang === 'ta' ? 'மாணவர்களுக்கான எச்சரிக்கை' : 'Student Advisory'}
          </h4>
          <p className="advisory-text">
            {lang === 'ta'
              ? 'கல்லூரி சேர்க்கைக்கு தனியார் இடைத்தரகர்களுக்கு (Brokers) எந்தவித முன் தொகையையும் செலுத்த வேண்டாம். அரசு நடத்தும் கலந்தாய்வு மூலமே சேருங்கள்.'
              : 'Never pay advance seat-booking fees to unverified brokers or agents. Always enroll through official government counseling sessions.'}
          </p>
          <div className="non-profit-note">
            <Heart size={14} color="var(--purple-600)" />
            <span>{lang === 'ta' ? 'லாப நோக்கற்ற தன்னார்வ முயற்சி' : 'Community Non-Profit Initiative'}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            © 2026 EEE-TN (Education Evolution and Empowerment – Tamil Nadu).
          </p>
          <p className="disclaimer-text">
            {lang === 'ta'
              ? 'அனைத்து கல்வி விபரங்களும் மாணவர் விழிப்புணர்விற்காக மட்டுமே தொகுக்கப்பட்டுள்ளன.'
              : 'Compiled purely for public student awareness and empowerment.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
