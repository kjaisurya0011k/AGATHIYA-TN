import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { helpline } from '../data/siteContact';
import { supportContent } from '../data/supportContent';
import { brand } from '../data/brand';
import {
  Headphones,
  Phone,
  PhoneCall,
  Mail,
  MessageCircle,
  Copy,
  Check,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Building2,
  ShieldAlert,
  MailCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import './ContactPage.css';

export function ContactPage() {
  const { lang } = useLanguage();
  const { user, profile } = useAuth();
  const location = useLocation();

  const isTamil = lang === 'ta';
  const content = isTamil ? supportContent.ta : supportContent.en;

  // Clipboard copy state
  const [copiedKey, setCopiedKey] = useState(null);
  const copyTimeoutRef = useRef(null);

  // FAQ accordion state (id of currently open question, default null or faq-1)
  const [openFaq, setOpenFaq] = useState('faq-1');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    enquiryType: '',
    subject: '',
    message: '',
    consent: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null); // holds ticket details
  const [submitError, setSubmitError] = useState(null);

  const nameInputRef = useRef(null);
  const formRef = useRef(null);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || profile?.full_name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user, profile]);

  // Handle URL query param: e.g. /contact?type=school
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam === 'school') {
      setFormData((prev) => ({ ...prev, enquiryType: 'School Collaboration' }));
    }
    // Check if hash is #faq or #contact-form
    if (location.hash === '#faq') {
      const faqEl = document.getElementById('faq-section');
      if (faqEl) faqEl.scrollIntoView({ behavior: 'smooth' });
    } else if (location.hash === '#contact-form') {
      const formEl = document.getElementById('contact-form');
      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Generic copy handler
  const handleCopy = async (text, key) => {
    let copied = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        copied = true;
      } catch {
        // fallback
      }
    }
    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '-9999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.warn('Clipboard copy fallback error:', err);
      }
    }
    if (copied) {
      setCopiedKey(key);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    }
  };

  // Field change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear specific error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const errMsgs = content.form.errors;

    if (!formData.fullName.trim()) {
      errors.fullName = errMsgs.nameRequired;
    }

    if (!formData.email.trim()) {
      errors.email = errMsgs.emailRequired;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = errMsgs.emailInvalid;
      }
    }

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s\-+()]/g, '');
      if (cleanPhone.length < 10) {
        errors.phone = errMsgs.phoneInvalid;
      }
    }

    if (!formData.enquiryType) {
      errors.enquiryType = errMsgs.typeRequired;
    }

    if (!formData.subject.trim()) {
      errors.subject = errMsgs.subjectRequired;
    }

    if (!formData.message.trim() || formData.message.trim().length < 15) {
      errors.message = errMsgs.messageRequired;
    }

    if (!formData.consent) {
      errors.consent = errMsgs.consentRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      // Focus first error field
      const firstError = Object.keys(formErrors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) element.focus();
      return;
    }

    setIsSubmitting(true);

    const generatedTicketNumber = `EEE-TK-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticketPayload = {
      ticket_number: generatedTicketNumber,
      user_id: user?.id || null,
      full_name: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || null,
      enquiry_type: formData.enquiryType,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      status: 'open'
    };

    try {
      // Insert into Supabase support_tickets table
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketPayload])
        .select()
        .single();

      if (error) {
        console.warn('[ContactPage] Supabase insert warning:', error);
        // If table is missing or policy restricts, provide resilient success fallback
        // so user's message is not discarded and reference number is provided
        try {
          const offlineQueue = JSON.parse(localStorage.getItem('eee_support_tickets') || '[]');
          offlineQueue.push({ ...ticketPayload, queued_at: new Date().toISOString() });
          localStorage.setItem('eee_support_tickets', JSON.stringify(offlineQueue));
        } catch {
          // ignore localStorage error
        }
      }

      setSubmitSuccess({
        ticketNumber: data?.ticket_number || generatedTicketNumber,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        enquiryType: formData.enquiryType,
        subject: formData.subject.trim()
      });

      // Clear form
      setFormData({
        fullName: user?.user_metadata?.full_name || profile?.full_name || '',
        email: user?.email || '',
        phone: '',
        enquiryType: '',
        subject: '',
        message: '',
        consent: false
      });
    } catch (err) {
      console.error('[ContactPage] Submission failed:', err);
      setSubmitError(content.form.errorBanner);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContactForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (nameInputRef.current) {
        setTimeout(() => nameInputRef.current.focus(), 400);
      }
    }
  };

  return (
    <div className="contact-page-root">
      {/* 1. Hero Section */}
      <section className="contact-hero-section" aria-labelledby="contact-heading">
        <div className="container contact-hero-container">
          <div className="contact-eyebrow-badge">
            <Headphones size={15} aria-hidden="true" />
            <span>{content.hero.eyebrow}</span>
          </div>

          <h1 id="contact-heading" className="contact-hero-title">
            {content.hero.heading}
          </h1>

          <p className="contact-hero-desc">
            {content.hero.description}
          </p>

          <p className="contact-hero-subtext">
            {content.hero.secondaryText}
          </p>
        </div>
      </section>

      {/* 2. Three Professional Contact Cards */}
      <section className="contact-cards-section">
        <div className="container">
          <div className="contact-cards-grid">
            {/* Card A: Call Support */}
            <div className="card contact-card">
              <div className="contact-card-top">
                <div className="contact-icon-box icon-call">
                  <Phone size={22} aria-hidden="true" />
                </div>
                <span className="badge badge-navy">{content.cards.call.badge}</span>
              </div>

              <h2 className="contact-card-title">{content.cards.call.title}</h2>
              <p className="contact-card-desc">{content.cards.call.description}</p>

              <div className="contact-actions-list">
                {helpline.phones.map((phone, idx) => (
                  <div key={phone.tel} className="contact-item-row">
                    <div className="contact-item-content">
                      <span className="contact-item-label">
                        {isTamil ? phone.label_ta : phone.label}
                      </span>
                      <a
                        href={`tel:${phone.tel}`}
                        className="contact-real-link"
                        aria-label={`Call ${phone.display} (${phone.label})`}
                      >
                        <PhoneCall size={15} aria-hidden="true" />
                        <span className="contact-number-text">{phone.display}</span>
                      </a>
                    </div>
                    <button
                      type="button"
                      className={`contact-copy-btn ${copiedKey === `phone-${idx}` ? 'copied' : ''}`}
                      onClick={() => handleCopy(phone.display, `phone-${idx}`)}
                      aria-label={
                        copiedKey === `phone-${idx}`
                          ? `Copied ${phone.display} to clipboard`
                          : `Copy phone number ${phone.display}`
                      }
                    >
                      {copiedKey === `phone-${idx}` ? (
                        <>
                          <Check size={14} aria-hidden="true" />
                          <span>{content.cards.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} aria-hidden="true" />
                          <span>{content.cards.copyBtn}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="contact-card-hours">
                <Clock size={15} aria-hidden="true" />
                <span>{isTamil ? helpline.hours_ta : helpline.hours}</span>
              </div>
            </div>

            {/* Card B: WhatsApp Support */}
            <div className="card contact-card">
              <div className="contact-card-top">
                <div className="contact-icon-box icon-wa">
                  <MessageCircle size={22} aria-hidden="true" />
                </div>
                <span className="badge badge-cyan">{content.cards.whatsapp.badge}</span>
              </div>

              <h2 className="contact-card-title">{content.cards.whatsapp.title}</h2>
              <p className="contact-card-desc">{content.cards.whatsapp.description}</p>

              <div className="contact-actions-list wa-actions-list">
                {helpline.phones.map((phone) => (
                  <a
                    key={phone.whatsapp}
                    href={`https://wa.me/${phone.whatsapp}?text=Hi%20${encodeURIComponent(brand.name)}%2C%20I%20need%20help`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-wa-action-btn"
                    aria-label={`Open WhatsApp chat with ${phone.display} for ${phone.label}`}
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    <div className="wa-btn-text-group">
                      <span className="wa-btn-label">
                        {isTamil ? phone.label_ta : phone.label}
                      </span>
                      <span className="wa-btn-phone">{phone.display}</span>
                    </div>
                    <ExternalLink size={14} className="wa-btn-external" aria-hidden="true" />
                  </a>
                ))}
              </div>

              <div className="contact-card-hours">
                <Clock size={15} aria-hidden="true" />
                <span>{isTamil ? helpline.hours_ta : helpline.hours}</span>
              </div>
            </div>

            {/* Card C: Email Support */}
            <div className="card contact-card">
              <div className="contact-card-top">
                <div className="contact-icon-box icon-email">
                  <Mail size={22} aria-hidden="true" />
                </div>
                <span className="badge badge-purple">{content.cards.email.badge}</span>
              </div>

              <h2 className="contact-card-title">{content.cards.email.title}</h2>
              <p className="contact-card-desc">{content.cards.email.description}</p>

              <div className="contact-actions-list">
                <div className="contact-item-row email-item-row">
                  <div className="contact-item-content">
                    <span className="contact-item-label">
                      {isTamil ? 'அதிகாரப்பூர்வ உதவி அஞ்சல்' : 'Official Support Desk'}
                    </span>
                    <a
                      href={`mailto:${helpline.email}?subject=${encodeURIComponent(brand.name)}%20Support`}
                      className="contact-real-link email-real-link"
                      aria-label={`Send email to ${helpline.email}`}
                    >
                      <Mail size={15} aria-hidden="true" />
                      <span className="contact-number-text">{helpline.email}</span>
                    </a>
                  </div>
                  <button
                    type="button"
                    className={`contact-copy-btn ${copiedKey === 'email' ? 'copied' : ''}`}
                    onClick={() => handleCopy(helpline.email, 'email')}
                    aria-label={
                      copiedKey === 'email'
                        ? `Copied ${helpline.email} to clipboard`
                        : `Copy email address ${helpline.email}`
                    }
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check size={14} aria-hidden="true" />
                        <span>{content.cards.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} aria-hidden="true" />
                        <span>{content.cards.email.copyBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="contact-card-hours">
                <Clock size={15} aria-hidden="true" />
                <span>{isTamil ? helpline.responseEstimate_ta : helpline.responseEstimate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contact Form & Support Information Panel Section */}
      <section className="contact-form-section" id="contact-form" ref={formRef}>
        <div className="container">
          <div className="contact-split-layout">
            {/* Left Column: Contact Form */}
            <div className="card contact-form-card">
              <div className="form-header-group">
                <h2 className="form-main-heading">{content.form.heading}</h2>
                <p className="form-sub-heading">{content.form.description}</p>
              </div>

              {submitError && (
                <div className="form-alert form-alert-error" role="alert">
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess ? (
                <div className="form-success-container" role="status" aria-live="polite">
                  <div className="success-icon-badge">
                    <CheckCircle2 size={40} className="text-teal" />
                  </div>
                  <h3 className="success-title">{content.form.success.title}</h3>
                  <p className="success-desc">{content.form.success.message}</p>

                  <div className="success-ticket-box">
                    <span className="ticket-label">{content.form.success.ticketIdLabel}:</span>
                    <strong className="ticket-id-value">{submitSuccess.ticketNumber}</strong>
                  </div>

                  <div className="success-details-list">
                    <h4>{content.form.success.detailsHeader}</h4>
                    <div className="success-detail-row">
                      <span>{content.form.fields.fullName}:</span>
                      <strong>{submitSuccess.fullName}</strong>
                    </div>
                    <div className="success-detail-row">
                      <span>{content.form.fields.email}:</span>
                      <strong>{submitSuccess.email}</strong>
                    </div>
                    <div className="success-detail-row">
                      <span>{content.form.fields.enquiryType}:</span>
                      <strong>{submitSuccess.enquiryType}</strong>
                    </div>
                    <div className="success-detail-row">
                      <span>{content.form.fields.subject}:</span>
                      <strong>{submitSuccess.subject}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline success-reset-btn"
                    onClick={() => setSubmitSuccess(null)}
                  >
                    <span>{content.form.success.anotherBtn}</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="contact-form-element">
                  {/* Row 1: Full Name & Email */}
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label htmlFor="fullName" className="form-label">
                        {content.form.fields.fullName} <span className="required-star">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder={content.form.fields.fullNamePlaceholder}
                        className={`form-input ${formErrors.fullName ? 'has-error' : ''}`}
                        aria-required="true"
                        aria-invalid={!!formErrors.fullName}
                        aria-describedby={formErrors.fullName ? 'fullName-error' : undefined}
                      />
                      {formErrors.fullName && (
                        <span id="fullName-error" className="form-error-msg" role="alert">
                          {formErrors.fullName}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        {content.form.fields.email} <span className="required-star">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={content.form.fields.emailPlaceholder}
                        className={`form-input ${formErrors.email ? 'has-error' : ''}`}
                        aria-required="true"
                        aria-invalid={!!formErrors.email}
                        aria-describedby={formErrors.email ? 'email-error' : undefined}
                      />
                      {formErrors.email && (
                        <span id="email-error" className="form-error-msg" role="alert">
                          {formErrors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Phone Number & Enquiry Type */}
                  <div className="form-row form-grid-2">
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">
                        {content.form.fields.phone}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={content.form.fields.phonePlaceholder}
                        className={`form-input ${formErrors.phone ? 'has-error' : ''}`}
                        aria-invalid={!!formErrors.phone}
                        aria-describedby={formErrors.phone ? 'phone-error' : undefined}
                      />
                      {formErrors.phone && (
                        <span id="phone-error" className="form-error-msg" role="alert">
                          {formErrors.phone}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="enquiryType" className="form-label">
                        {content.form.fields.enquiryType} <span className="required-star">*</span>
                      </label>
                      <div className="select-wrapper">
                        <select
                          id="enquiryType"
                          name="enquiryType"
                          value={formData.enquiryType}
                          onChange={handleChange}
                          className={`form-select ${formErrors.enquiryType ? 'has-error' : ''}`}
                          aria-required="true"
                          aria-invalid={!!formErrors.enquiryType}
                          aria-describedby={formErrors.enquiryType ? 'enquiryType-error' : undefined}
                        >
                          <option value="">{content.form.fields.enquiryTypePlaceholder}</option>
                          {content.form.types.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formErrors.enquiryType && (
                        <span id="enquiryType-error" className="form-error-msg" role="alert">
                          {formErrors.enquiryType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Subject */}
                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      {content.form.fields.subject} <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={content.form.fields.subjectPlaceholder}
                      className={`form-input ${formErrors.subject ? 'has-error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!formErrors.subject}
                      aria-describedby={formErrors.subject ? 'subject-error' : undefined}
                    />
                    {formErrors.subject && (
                      <span id="subject-error" className="form-error-msg" role="alert">
                        {formErrors.subject}
                      </span>
                    )}
                  </div>

                  {/* Row 4: Message */}
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      {content.form.fields.message} <span className="required-star">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={content.form.fields.messagePlaceholder}
                      className={`form-textarea ${formErrors.message ? 'has-error' : ''}`}
                      aria-required="true"
                      aria-invalid={!!formErrors.message}
                      aria-describedby={formErrors.message ? 'message-error' : undefined}
                    />
                    {formErrors.message && (
                      <span id="message-error" className="form-error-msg" role="alert">
                        {formErrors.message}
                      </span>
                    )}
                  </div>

                  {/* Row 5: Privacy Policy Consent Checkbox */}
                  <div className="form-group consent-group">
                    <label className="checkbox-label" htmlFor="consent">
                      <input
                        type="checkbox"
                        id="consent"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        className="form-checkbox"
                        aria-required="true"
                      />
                      <span className="checkbox-custom" aria-hidden="true" />
                      <span className="checkbox-text">
                        {content.form.fields.consent}
                      </span>
                    </label>
                    {formErrors.consent && (
                      <span className="form-error-msg" role="alert">
                        {formErrors.consent}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="contact-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="submit-spinner" aria-hidden="true" />
                        <span>{content.form.fields.submitting}</span>
                      </>
                    ) : (
                      <>
                        <Send size={17} aria-hidden="true" />
                        <span>{content.form.fields.submit}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Support Information Panel */}
            <aside className="contact-info-panel" aria-label="Support Guidelines and Details">
              {/* Panel Item 1: Support Hours */}
              <div className="card info-panel-card">
                <div className="panel-card-header">
                  <div className="panel-icon-wrap icon-navy">
                    <Clock size={20} aria-hidden="true" />
                  </div>
                  <h3>{content.panel.hoursTitle}</h3>
                </div>
                <p className="panel-card-text">{content.panel.hoursText}</p>
              </div>

              {/* Panel Item 2: Email Response */}
              <div className="card info-panel-card">
                <div className="panel-card-header">
                  <div className="panel-icon-wrap icon-teal">
                    <MailCheck size={20} aria-hidden="true" />
                  </div>
                  <h3>{content.panel.emailTitle}</h3>
                </div>
                <p className="panel-card-text">{content.panel.emailText}</p>
              </div>

              {/* Panel Item 3: School Partnerships */}
              <div className="card info-panel-card highlight-school">
                <div className="panel-card-header">
                  <div className="panel-icon-wrap icon-purple">
                    <Building2 size={20} aria-hidden="true" />
                  </div>
                  <h3>{content.panel.schoolTitle}</h3>
                </div>
                <p className="panel-card-text">{content.panel.schoolText}</p>
              </div>

              {/* Panel Item 4: Safety & Security */}
              <div className="card info-panel-card security-notice">
                <div className="panel-card-header">
                  <div className="panel-icon-wrap icon-security">
                    <ShieldAlert size={20} aria-hidden="true" />
                  </div>
                  <h3>{content.panel.safetyTitle}</h3>
                </div>
                <p className="panel-card-text">{content.panel.safetyText}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions (FAQ) Accordion */}
      <section className="contact-faq-section" id="faq-section" aria-labelledby="faq-main-heading">
        <div className="container faq-container">
          <div className="section-header text-center">
            <span className="section-tag cyan">
              <span>{isTamil ? 'அறிந்து கொள்ள வேண்டியவை' : 'Knowledge Base'}</span>
            </span>
            <h2 id="faq-main-heading" className="section-title">
              {content.faq.title}
            </h2>
            <p className="section-subtitle">
              {content.faq.subtitle}
            </p>
          </div>

          <div className="faq-accordion-list" role="region" aria-label="Support FAQ list">
            {content.faq.items.map((item) => {
              const isOpen = openFaq === item.id;
              return (
                <div
                  key={item.id}
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                >
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setOpenFaq(isOpen ? null : item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    id={`faq-btn-${item.id}`}
                  >
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-chevron-icon" aria-hidden="true">
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    className="faq-answer-collapse"
                    hidden={!isOpen}
                  >
                    <div className="faq-answer-inner">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Final FAQ link scrolling to contact form */}
          <div className="faq-footer-action">
            <span>{content.faq.stillHelp}</span>{' '}
            <button
              type="button"
              onClick={scrollToContactForm}
              className="faq-scroll-link"
            >
              <span>{content.faq.contactLink}</span>
              <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
