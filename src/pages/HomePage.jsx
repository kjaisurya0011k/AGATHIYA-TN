
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  initialOpportunities,
  initialSessions,
  learningResources
} from '../data/appData';
import { streamsData } from '../data/guidanceData';
import { OpportunityCard } from '../components/OpportunityCard';
import { SessionCard } from '../components/SessionCard';
import { CutoffCalculator } from '../components/CutoffCalculator';
import { BrandIdentity } from '../components/BrandIdentity';

import heroStudents from '../assets/eee-tn-students.png';

import {
  Compass,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Download,
  Calendar,
  Award
} from 'lucide-react';

export function HomePage() {
  const { lang, t } = useLanguage();
  const [selectedStreamCat, setSelectedStreamCat] = useState('all');

  const filteredStreams =
    selectedStreamCat === 'all'
      ? streamsData
      : streamsData.filter(
        (stream) => stream.category === selectedStreamCat
      );

  return (
    <div className="home-page">

      {/* 1. EEE-TN Hero Landing Section */}
      <section className="hero-section eee-hero">
        <div className="container eee-hero-container">

          {/* Hero Text */}
          <div className="eee-hero-content">

            {/* Hero Brand Block */}
            <BrandIdentity variant="hero" />

            <span className="eee-hero-badge">
              <GraduationCap size={15} />
              {t.hero.badge}
            </span>

            <h1 className="eee-hero-title">
              {t.hero.heading}{' '}
              <span>{t.hero.headingHighlight}</span>
            </h1>

            <p className="eee-hero-description">
              {t.hero.desc}
            </p>

            {/* Hero Buttons */}
            <div className="eee-hero-actions">

              <Link
                to="/opportunities"
                className="eee-btn-primary"
              >
                <Compass size={18} />
                <span>{t.hero.exploreBtn}</span>
                <ArrowRight size={17} />
              </Link>

              <a
                href="#cutoff-calculator"
                className="eee-btn-secondary"
              >
                <GraduationCap size={18} />
                <span>{t.hero.cutoffBtn}</span>
              </a>

            </div>

            {/* Trust Points */}
            <div className="eee-hero-trust">

              <div>
                <CheckCircle2 size={17} />
                <span>{t.hero.fact1}</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>{t.hero.fact2}</span>
              </div>

              <div>
                <CheckCircle2 size={17} />
                <span>{t.hero.fact3}</span>
              </div>

            </div>
          </div>

          {/* Right Column: Restored Original Student Visual with Floating Card */}
          <div className="eee-hero-visual">
            <div className="eee-hero-glow" aria-hidden="true" />
            <img
              src={heroStudents}
              alt={lang === 'ta' ? 'அறிவிப்பு பலகையைப் பார்க்கும் தமிழ்நாடு மாணவர்கள்' : 'Tamil Nadu students exploring higher education opportunities'}
              className="eee-hero-photo"
              loading="eager"
            />
            <div className="eee-photo-note">
              <div className="eee-photo-note-icon">
                <Compass size={22} />
              </div>
              <div>
                <strong>
                  {t.hero.cardTitle || (lang === 'ta' ? 'உங்கள் எதிர்காலம், உங்கள் தேர்வு.' : 'Your Future, Your Choice.')}
                </strong>
                <p>
                  {t.hero.cardSubtitle || (lang === 'ta' ? 'நம்பிக்கையுடன் அடுத்த அடியை எடுத்து வையுங்கள்.' : 'Make your next move with confidence.')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* 2. Popular Higher Education Streams */}
      <section
        className="section-padding streams-section"
        id="streams"
      >
        <div className="container">

          <div className="section-header">
            <span className="section-tag">
              {t.streams.tag}
            </span>

            <h2 className="section-title">
              {t.streams.title}
            </h2>

            <p className="section-subtitle">
              {t.streams.subtitle}
            </p>
          </div>

          {/* Category Filters */}
          <div className="filter-pill-group">
            {[
              { id: 'all', label: t.streams.categories.all },
              {
                id: 'engineering',
                label: t.streams.categories.engineering
              },
              {
                id: 'medical',
                label: t.streams.categories.medical
              },
              {
                id: 'arts',
                label: t.streams.categories.arts
              },
              {
                id: 'agri',
                label: t.streams.categories.agri
              },
              {
                id: 'law',
                label: t.streams.categories.law
              },
              {
                id: 'vocational',
                label: t.streams.categories.vocational
              }
            ].map((category) => (
              <button
                key={category.id}
                type="button"
                className={`filter-pill ${selectedStreamCat === category.id
                    ? 'active'
                    : ''
                  }`}
                onClick={() =>
                  setSelectedStreamCat(category.id)
                }
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Streams Grid */}
          <div className="streams-grid">
            {filteredStreams.map((item) => {
              const title =
                lang === 'ta'
                  ? item.title_ta
                  : item.title_en;

              const brief =
                lang === 'ta'
                  ? item.brief_ta
                  : item.brief_en;

              const advice =
                lang === 'ta'
                  ? item.tier2Advice_ta
                  : item.tier2Advice_en;

              const formula =
                lang === 'ta'
                  ? item.formula_ta
                  : item.formula_en;

              return (
                <div
                  key={item.id}
                  className="card stream-card"
                >
                  <div className="stream-card-top">

                    <span className="badge badge-navy">
                      {item.category.toUpperCase()}
                    </span>

                    <a
                      href={item.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="portal-link"
                      title={item.portal}
                    >
                      <span>{item.portal}</span>
                      <ExternalLink size={12} />
                    </a>

                  </div>

                  <h3 className="stream-card-title">
                    {title}
                  </h3>

                  <p className="stream-card-brief">
                    {brief}
                  </p>

                  <div className="stream-formula-box">
                    <strong>
                      {lang === 'ta'
                        ? 'கட்-ஆஃப் முறை:'
                        : 'Cutoff:'}
                    </strong>{' '}
                    <span>{formula}</span>
                  </div>

                  <div className="stream-tier2-advice">
                    <div className="advice-label">
                      {lang === 'ta'
                        ? 'மாணவர்களுக்கான வழிகாட்டல்:'
                        : 'Student Guidance:'}
                    </div>

                    <p>{advice}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>


      {/* 3. Cutoff Calculator */}
      <section
        className="section-padding bg-alt-section"
        id="cutoff-calculator"
      >
        <div className="container">
          <div className="calculator-layout">
            <CutoffCalculator />
          </div>
        </div>
      </section>


      {/* 4. Scholarships and Opportunities */}
      <section className="section-padding">
        <div className="container">

          <div className="section-header-flex">

            <div>
              <span className="section-tag purple">
                {t.schemes.tag}
              </span>

              <h2 className="section-title">
                {t.schemes.title}
              </h2>

              <p className="section-subtitle">
                {t.schemes.subtitle}
              </p>
            </div>

            <Link
              to="/opportunities"
              className="btn btn-outline view-all-link"
            >
              <span>
                {lang === 'ta'
                  ? 'அனைத்து வாய்ப்புகளும்'
                  : 'View All Opportunities'}
              </span>

              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="opportunities-grid">
            {initialOpportunities
              .slice(0, 3)
              .map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
          </div>

        </div>
      </section>


      {/* 5. Mentor Sessions */}
      <section className="section-padding bg-alt-section">
        <div className="container">

          <div className="section-header-flex">

            <div>
              <span className="section-tag cyan">
                {lang === 'ta'
                  ? 'வழிகாட்டல் அமர்வுகள்'
                  : 'Mentor Sessions'}
              </span>

              <h2 className="section-title">
                {lang === 'ta'
                  ? 'உங்கள் அடுத்த படிக்கு வழிகாட்டல்'
                  : 'Guidance for Your Next Step'}
              </h2>

              <p className="section-subtitle">
                {lang === 'ta'
                  ? 'கல்லூரி சேர்க்கை, Scholarships மற்றும் Career தேர்வுகள் பற்றி அறிந்துகொள்ளுங்கள்.'
                  : 'Explore college admissions, scholarships and career options through guidance sessions.'}
              </p>
            </div>

            <Link
              to="/sessions"
              className="btn btn-outline view-all-link"
            >
              <span>
                {lang === 'ta'
                  ? 'அனைத்து அமர்வுகளும்'
                  : 'View All Sessions'}
              </span>

              <ArrowRight size={16} />
            </Link>

          </div>

          <div className="sessions-grid">
            {initialSessions
              .slice(0, 2)
              .map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                />
              ))}
          </div>

        </div>
      </section>


      {/* 6. College Selection Checklist */}
      <section className="section-padding checklist-section">
        <div className="container">

          <div className="section-header">
            <span className="section-tag">
              {t.checklist.tag}
            </span>

            <h2 className="section-title">
              {t.checklist.title}
            </h2>

            <p className="section-subtitle">
              {t.checklist.subtitle}
            </p>
          </div>

          <div className="checklist-grid">
            {t.checklist.points.map((point, index) => (
              <div
                key={index}
                className="card checklist-card"
              >
                <div className="checklist-num">
                  {index + 1}
                </div>

                <h3 className="checklist-item-title">
                  {point.title}
                </h3>

                <p className="checklist-item-desc">
                  {point.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 7. Learning Resources */}
      <section className="section-padding bg-alt-section">
        <div className="container">

          <div className="section-header">
            <span className="section-tag cyan">
              {lang === 'ta'
                ? 'கற்றல் வளங்கள்'
                : 'Learning Resources'}
            </span>

            <h2 className="section-title">
              {lang === 'ta'
                ? 'கையேடுகள் மற்றும் முக்கிய தகவல்கள்'
                : 'Handbooks and Useful Resources'}
            </h2>
          </div>

          <div className="resources-grid">
            {learningResources.map((resource) => {
              const title =
                lang === 'ta'
                  ? resource.title_ta
                  : resource.title_en;

              const type =
                lang === 'ta'
                  ? resource.type_ta
                  : resource.type_en;

              const tag =
                lang === 'ta'
                  ? resource.tag_ta
                  : resource.tag_en;

              return (
                <div
                  key={resource.id}
                  className="card resource-card"
                >
                  <div className="resource-icon-wrap">
                    <BookOpen
                      size={20}
                      color="var(--navy-900)"
                    />
                  </div>

                  <div className="resource-body">
                    <span className="badge badge-cyan">
                      {tag}
                    </span>

                    <h3 className="resource-title">
                      {title}
                    </h3>

                    <p className="resource-type">
                      {type}
                    </p>
                  </div>

                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline resource-btn"
                  >
                    <Download size={14} />

                    <span>
                      {lang === 'ta' ? 'பார்க்க' : 'Open'}
                    </span>
                  </a>
                </div>
              );
            })}
          </div>

        </div>
      </section>

    </div>
  );
}
