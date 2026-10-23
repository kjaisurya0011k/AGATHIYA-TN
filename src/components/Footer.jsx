import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { helpline } from '../data/siteContact';
import { brand } from '../data/brand';
import { Mail, Phone, ShieldCheck, MessageCircle } from 'lucide-react';
import './Footer.css';

export function Footer() {
  const { lang } = useLanguage();
  const isTamil = lang === 'ta';
  const currentYear = new Date().getFullYear();
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="footer-wrapper" role="contentinfo">
      <div className="container footer-content">
        {/* Mobile quick-contact buttons for students on phones */}
        <div className="footer-mobile-touch-actions">
          <a
            href={`tel:${helpline.phones[0]?.tel}`}
            className="footer-touch-btn footer-touch-call"
            aria-label="Call Support"
          >
            <Phone size={18} aria-hidden="true" />
            <span>{isTamil ? 'அழைக்க: ' : 'Call: '}{helpline.phones[0]?.display}</span>
          </a>
          <a
            href={`https://wa.me/${helpline.phones[0]?.whatsapp}?text=Hi%20AGATHIYA`}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-touch-btn footer-touch-wa"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>{isTamil ? 'வாட்ஸ்அப் உதவி' : 'Chat on WhatsApp'}</span>
          </a>
          <a
            href={`mailto:${helpline.email}`}
            className="footer-touch-btn footer-touch-email"
            aria-label="Email Support"
          >
            <Mail size={18} aria-hidden="true" />
            <span>{isTamil ? 'மின்னஞ்சல்: ' : 'Email: '}{helpline.email}</span>
          </a>
        </div>

        {/* Column 1: Brand */}
        <div className="footer-col brand-col">
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!logoError && (
              <img
                src={brand.logo}
                alt="AGATHIYA logo"
                style={{
                  height: '38px',
                  width: 'auto',
                  objectFit: 'contain',
                  background: '#ffffff',
                  padding: '3px 6px',
                  borderRadius: '6px'
                }}
                onError={() => setLogoError(true)}
              />
            )}
            <span className="footer-brand-name">{brand.name}</span>
          </div>
          {brand.tagline && (
            <p className="footer-full-name">{brand.tagline}</p>
          )}
          <p className="footer-tagline">
            {isTamil
              ? 'மாணவர்கள் புதிய வாய்ப்புகளைக் கண்டறியவும், நடைமுறைத் திறன்களை வளர்க்கவும், கற்றல் மற்றும் புதுமை மூலம் தங்கள் எதிர்காலத்தை ஆராயவும் உதவுகிறோம்.'
              : 'Helping students discover opportunities, develop practical skills, and explore their future through learning and innovation.'}
          </p>
          <div className="trust-badge">
            <ShieldCheck size={16} color="var(--cyan-600)" />
            <span>{isTamil ? 'அரசு அங்கீகரிக்கப்பட்ட வழிகாட்டல்' : '100% Verified Education Guidance'}</span>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {isTamil ? 'விரைவு இணைப்புகள்' : 'Quick Links'}
          </h4>
          <ul className="footer-links">
            <li>
              <Link to="/">
                <span>{isTamil ? 'முகப்பு' : 'Home'}</span>
              </Link>
            </li>
            <li>
              <Link to="/opportunities">
                <span>{isTamil ? 'கல்வி வாய்ப்புகள்' : 'Opportunities'}</span>
              </Link>
            </li>
            <li>
              <Link to="/sessions">
                <span>{isTamil ? 'வழிகாட்டல் அமர்வுகள்' : 'Sessions'}</span>
              </Link>
            </li>
            <li>
              <Link to="/achievements">
                <span>{isTamil ? 'மாணவர் சாதனைகள்' : 'Achievements'}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {isTamil ? 'உதவி & தொடர்பு' : 'Support'}
          </h4>
          <ul className="footer-links">
            <li>
              <Link to="/contact">
                <span>{isTamil ? 'தொடர்பு கொள்ள' : 'Contact Us'}</span>
              </Link>
            </li>
            <li>
              <Link to="/contact">
                <span>{isTamil ? 'உதவி மையம்' : 'Help & Support'}</span>
              </Link>
            </li>
            <li>
              <Link to="/contact#faq">
                <span>{isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions'}</span>
              </Link>
            </li>
            <li>
              <Link to="/contact?type=school">
                <span>{isTamil ? 'பள்ளி கூட்டாண்மை' : 'School Collaboration'}</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Official Contact */}
        <div className="footer-col">
          <h4 className="footer-heading">
            {isTamil ? 'சட்டம் & தொடர்புகள்' : 'Legal & Contact'}
          </h4>
          <ul className="footer-links">
            <li>
              <Link to="/privacy">
                <span>{isTamil ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}</span>
              </Link>
            </li>
            <li>
              <Link to="/terms">
                <span>{isTamil ? 'விதிமுறைகள் & நிபந்தனைகள்' : 'Terms & Conditions'}</span>
              </Link>
            </li>
            <li>
              <Link to="/refund-policy">
                <span>{isTamil ? 'ரீஃபண்ட் கொள்கை' : 'Refund Policy'}</span>
              </Link>
            </li>
            <li className="footer-contact-item">
              <a href={`mailto:${helpline.email}`}>
                <Mail size={13} aria-hidden="true" />
                <span>{helpline.email}</span>
              </a>
            </li>
            <li className="footer-contact-item">
              <a href={`tel:${helpline.phones[0]?.tel}`}>
                <Phone size={13} aria-hidden="true" />
                <span>{helpline.phones[0]?.display}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="copyright-text">
            © {currentYear} {brand.name}. {isTamil ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'All rights reserved.'}
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">{isTamil ? 'தனியுரிமை' : 'Privacy Policy'}</Link>
            <span className="dot-divider">•</span>
            <Link to="/terms">{isTamil ? 'விதிமுறைகள்' : 'Terms & Conditions'}</Link>
            <span className="dot-divider">•</span>
            <Link to="/contact">{isTamil ? 'உதவி மையம்' : 'Help Desk'}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
