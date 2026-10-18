import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  initialOpportunities,
  learningResources
} from '../data/appData';
import { streamsData } from '../data/guidanceData';
import { OpportunityCard } from '../components/OpportunityCard';
import { CutoffCalculator } from '../components/CutoffCalculator';
import { EdnovaAI } from '../components/EdnovaAI';

import heroStudents from '../assets/eee-tn-students.png';
import { BrandIdentity } from '../components/BrandIdentity';
import './HomePage.css';

import {
  Compass,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Download,
  Award,
  Sparkles,
  Bot,
  Layers,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Palette,
  Wrench,
  Search
} from 'lucide-react';

export function HomePage() {
  const { lang, t } = useLanguage();
  const isTamil = lang === 'ta';
  const [selectedStreamCat, setSelectedStreamCat] = useState('all');
  const [featuredOpportunities, setFeaturedOpportunities] = useState(initialOpportunities.slice(0, 6));
  const [totalOppCount, setTotalOppCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadFeatured() {
      try {
        const { data, count, error } = await supabase
          .from('opportunities')
          .select('*', { count: 'exact' })
          .order('title_en', { ascending: true })
          .limit(6);

        if (!isMounted) return;
        if (!error && data && data.length > 0) {
          setFeaturedOpportunities(data);
          if (typeof count === 'number') {
            setTotalOppCount(count);
          }
        }
      } catch (err) {
        console.warn('[HomePage] Failed to fetch featured opportunities:', err);
      }
    }
    loadFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStreams =
    selectedStreamCat === 'all'
      ? streamsData
      : streamsData.filter((stream) => stream.category === selectedStreamCat);

  // Practical Skill categories
  const skillTracks = isTamil
    ? [
      {
        title: 'செயற்கை நுண்ணறிவு & கணினித் தொழில்நுட்பம் (AI & Computing)',
        desc: 'Python, Machine Learning, Data Analytics மற்றும் Web Development போன்ற உயர் வேலைவாய்ப்புத் திறன்கள்.',
        icon: <Cpu size={24} className="text-teal" />,
        tag: 'High Growth',
        badge: 'எதிர்காலத் தொழில்நுட்பம்'
      },
      {
        title: 'டிஜிட்டல் வடிவமைப்பு & தொடர்பாடல் (Design & Creative Media)',
        desc: 'UI/UX Design, Visual Communication, Content Creation மற்றும் தொழில்நுட்ப ஊடகத் திறன்கள்.',
        icon: <Palette size={24} className="text-purple" />,
        tag: 'Creative Track',
        badge: 'படைப்பாற்றல் திறன்'
      },
      {
        title: 'நடைமுறைத் தொழில்சார் பயிற்சிகள் (Hands-on Technical & Vocational)',
        desc: 'Automotive, Electrical, Solar Energy மற்றும் தொழிற்துறை 4.0 சார்ந்த செய்முறைப் பயிற்சிகள்.',
        icon: <Wrench size={24} className="text-blue" />,
        tag: 'Industry Ready',
        badge: 'தொழில்சார் திறன்'
      }
    ]
    : [
      {
        title: 'Artificial Intelligence & Computing Skills',
        desc: 'Master practical Python programming, Data Analytics, Cloud Essentials, and Full-Stack Web Development.',
        icon: <Cpu size={24} className="text-teal" />,
        tag: 'High Growth',
        badge: 'Emerging Tech'
      },
      {
        title: 'Digital Design & Creative Media',
        desc: 'Explore UI/UX fundamentals, visual branding, creative multimedia, and digital communications.',
        icon: <Palette size={24} className="text-purple" />,
        tag: 'Creative Track',
        badge: 'Design Skills'
      },
      {
        title: 'Practical Vocational & Industry 4.0 Skills',
        desc: 'Hands-on training in electric vehicles, green energy systems, automation, and modern industrial trades.',
        icon: <Wrench size={24} className="text-blue" />,
        tag: 'Industry Ready',
        badge: 'Applied Skills'
      }
    ];

  // Journey steps
  const journeySteps = isTamil
    ? [
      {
        num: '01',
        title: 'ஆர்வத்தைக் கண்டறியுங்கள்',
        desc: 'பொறியியல், மருத்துவம், கலை, அறிவியல் மற்றும் தொழிற்கல்வி படிப்புகளின் எதிர்கால வாய்ப்புகளை ஒப்பிடுங்கள்.'
      },
      {
        num: '02',
        title: 'தகுதியை அறிந்து கொள்ளுங்கள்',
        desc: 'TNEA கட்-ஆஃப் சூத்திரம், தகுதி விதிமுறைகள் மற்றும் 7.5% அரசு பள்ளி ஒதுக்கீட்டின் பலன்களைக் கணக்கிடுங்கள்.'
      },
      {
        num: '03',
        title: 'உதவித்தொகைகளைப் பெறுங்கள்',
        desc: 'புதுமைப் பெண், தமிழ்ப் புதல்வன், முதல் பட்டதாரி சலுகைகள் மூலம் நிதித் தடைகளைத் தகர்த்தெறியுங்கள்.'
      },
      {
        num: '04',
        title: 'நம்பிக்கையுடன் கல்லூரியைத் தேர்ந்தெடுங்கள்',
        desc: 'Ednova AI மற்றும் வழிகாட்டிகளின் ஆலோசனையுடன் உங்கள் இலக்குக்கு ஏற்ற கல்லூரியைத் தேர்வு செய்யுங்கள்.'
      }
    ]
    : [
      {
        num: '01',
        title: 'Discover Your Interests',
        desc: 'Compare career outcomes across engineering, arts & science, diploma, and emerging technology tracks.'
      },
      {
        num: '02',
        title: 'Understand Eligibility & Cutoffs',
        desc: 'Calculate your exact TNEA cutoff score and explore government quota criteria with ease.'
      },
      {
        num: '03',
        title: 'Access Scholarships & Waivers',
        desc: 'Overcome financial barriers with Pudhumai Penn, Tamil Pudhalvan, First Graduate, and 7.5% fee waivers.'
      },
      {
        num: '04',
        title: 'Choose the Right College',
        desc: 'Make informed, confident admission decisions guided by verified data and Ednova AI.'
      }
    ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="homepage-landing-root">
      {/* 3. Homepage Hero Section */}
      <section className="hp-hero-section" id="home">
        <div className="hp-hero-ambient-glow" aria-hidden="true" />
        <div className="container hp-hero-container">
          {/* Left Column: Hero Text */}
          <div className="hp-hero-content">
            {/* Hero Brand Block matching reference screenshot */}
            <BrandIdentity variant="hero" />

            <span className="eee-hero-badge">
              <GraduationCap size={15} />
              {t.hero.badge}
            </span>

            <h1 className="hp-hero-title">
              {t.hero.heading}{' '}
              <span className="hp-gradient-highlight">{t.hero.headingHighlight}</span>
            </h1>

            <p className="hp-hero-description">
              {t.hero.desc}
            </p>

            <div className="hp-hero-actions">
              <Link to="/opportunities" className="hp-btn-primary">
                <Compass size={18} />
                <span>{t.hero.exploreBtn || (isTamil ? 'படிப்பு வாய்ப்புகளைப் பாருங்கள்' : 'Explore My Options')}</span>
                <ArrowRight size={17} />
              </Link>

              <button
                type="button"
                className="hp-btn-secondary"
                onClick={() => scrollTo('colleges')}
              >
                <GraduationCap size={18} />
                <span>{t.hero.cutoffBtn || (isTamil ? 'Cut-off கணக்கிடுங்கள்' : 'Estimate My Cutoff')}</span>
              </button>
            </div>

            {/* Trust points */}
            <div className="hp-hero-trust-row">
              <div className="hp-trust-item">
                <CheckCircle2 size={16} />
                <span>{t.hero.fact1}</span>
              </div>
              <div className="hp-trust-item">
                <CheckCircle2 size={16} />
                <span>{t.hero.fact2}</span>
              </div>
              <div className="hp-trust-item">
                <CheckCircle2 size={16} />
                <span>{t.hero.fact3}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Existing Hero Student Image + Connected Ednova AI Teaser */}
          <div className="hp-hero-visual-col">
            <div className="hp-photo-card">
              <img
                src={heroStudents}
                alt={
                  isTamil
                    ? 'அறிவிப்பு பலகையைப் பார்க்கும் தமிழ்நாடு மாணவர்கள்'
                    : 'Tamil Nadu students exploring higher education opportunities'
                }
                className="hp-hero-photo"
                loading="eager"
              />

              <div className="hp-photo-overlay-card">
                <div className="hp-photo-icon-box">
                  <Compass size={20} />
                </div>
                <div>
                  <strong>
                    {isTamil ? 'உங்கள் எதிர்காலம், உங்கள் தேர்வு.' : 'Your Future, Your Choice.'}
                  </strong>
                  <p>
                    {isTamil
                      ? 'நம்பிக்கையுடன் அடுத்த அடியை எடுத்து வையுங்கள்.'
                      : 'Make your next move with genuine confidence.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Hero Ednova AI Bubble Anchor */}
            <div className="hp-hero-ednova-anchor">
              <div className="hp-ednova-mini-badge">
                <Bot size={16} className="text-teal" />
                <span>Ednova AI</span>
              </div>
              <p className="hp-ednova-mini-text">
                {isTamil
                  ? '“12-ஆம் வகுப்புக்குப் பிறகு என்ன படிக்கலாம்? என்னிடம் கேளுங்கள்!”'
                  : '“Not sure what to choose after Class 12? Let’s explore your options!”'}
              </p>
              <button
                type="button"
                className="hp-ednova-mini-cta"
                onClick={() => scrollTo('ednova-ai')}
              >
                <span>{isTamil ? 'உரையாடலைத் தொடங்கு' : 'Chat with Ednova'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5.1 Explore Careers Section */}
      <section className="section-padding hp-section" id="careers">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              {isTamil ? 'படிப்பு வழிகாட்டி' : 'Explore Careers'}
            </span>
            <h2 className="section-title">
              {isTamil
                ? 'உங்களுக்குப் பொருத்தமான துறை எது?'
                : 'Find the Career Path That Fits You'}
            </h2>
            <p className="section-subtitle">
              {isTamil
                ? 'பொறியியல், கலை மற்றும் அறிவியல், தொழிற்கல்வி, மருத்துவத் துறைகள் முதல் வளர்ந்து வரும் புதிய வாய்ப்புகள் வரை அனைத்தும்.'
                : 'Explore engineering, arts & science, diploma, vocational streams, and emerging technology tracks.'}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="filter-pill-group">
            {[
              { id: 'all', label: isTamil ? 'அனைத்தும்' : 'All Streams' },
              { id: 'engineering', label: isTamil ? 'பொறியியல் (Engineering)' : 'Engineering' },
              { id: 'medical', label: isTamil ? 'மருத்துவம் (Medical)' : 'Medical & Health' },
              { id: 'arts', label: isTamil ? 'கலை & அறிவியல்' : 'Arts & Science' },
              { id: 'agri', label: isTamil ? 'வேளாண்மை' : 'Agriculture' },
              { id: 'law', label: isTamil ? 'சட்டம்' : 'Law' },
              { id: 'vocational', label: isTamil ? 'டிப்ளமோ & தொழிற்கல்வி' : 'Vocational & Diploma' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`filter-pill ${selectedStreamCat === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedStreamCat(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Streams Grid */}
          <div className="streams-grid">
            {filteredStreams.map((item) => {
              const title = isTamil ? item.title_ta : item.title_en;
              const brief = isTamil ? item.brief_ta : item.brief_en;
              const advice = isTamil ? item.tier2Advice_ta : item.tier2Advice_en;
              const formula = isTamil ? item.formula_ta : item.formula_en;

              return (
                <div key={item.id} className="card stream-card">
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

                  <h3 className="stream-card-title">{title}</h3>
                  <p className="stream-card-brief">{brief}</p>

                  <div className="stream-formula-box">
                    <strong>{isTamil ? 'கட்-ஆஃப் முறை:' : 'Cutoff Formula:'}</strong>{' '}
                    <span>{formula}</span>
                  </div>

                  <div className="stream-tier2-advice">
                    <div className="advice-label">
                      {isTamil ? 'மாணவர்களுக்கான வழிகாட்டல்:' : 'Guidance Note:'}
                    </div>
                    <p>{advice}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5.2 Find Your College Section & Cutoff Calculator */}
      <section className="section-padding bg-alt-section hp-section" id="colleges">
        <div className="container">
          <div className="section-header">
            <span className="section-tag cyan">
              {isTamil ? 'கல்லூரித் தேர்வு' : 'Find Your College'}
            </span>
            <h2 className="section-title">
              {isTamil
                ? 'உங்கள் மதிப்பெண்ணுக்கு ஏற்ற கல்லூரியைத் தேர்ந்தெடுங்கள்'
                : 'Choose the College and Course That Fit Your Goals'}
            </h2>
            <p className="section-subtitle">
              {isTamil
                ? 'அரசு ஒற்றைச் சாளர கலந்தாய்வு மூலம் நியாயமான கட்டணத்தில் தரமான கல்லூரியைத் தேர்வு செய்ய வழிகாட்டுதல்.'
                : 'Compare counseling options, statutory fee structures, and calculate your TNEA cutoff accurately.'}
            </p>
          </div>

          <div className="colleges-split-layout">
            {/* Cutoff Calculator Integrated */}
            <div className="colleges-calculator-col">
              <CutoffCalculator />
            </div>

            {/* Checklist Guide */}
            <div className="colleges-checklist-col">
              <div className="card hp-checklist-card">
                <div className="hp-checklist-header">
                  <GraduationCap size={22} className="text-teal" />
                  <h3>{isTamil ? 'கல்லூரி சேரும் முன் கவனிக்க வேண்டியவை' : 'College Selection Checklist'}</h3>
                </div>
                <div className="hp-checklist-items">
                  {t.checklist.points.slice(0, 4).map((point, index) => (
                    <div key={index} className="hp-check-row">
                      <span className="hp-check-num">{index + 1}</span>
                      <div>
                        <strong>{point.title}</strong>
                        <p>{point.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hp-checklist-footer">
                  <a
                    href="https://www.tneaonline.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <span>{isTamil ? 'அதிகாரப்பூர்வ TNEA தளம்' : 'Official TNEA Counseling'}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.3 Scholarships Section */}
      <section className="section-padding hp-section" id="scholarships">
        <div className="container">
          <div className="section-header-flex">
            <div>
              <span className="section-tag purple">
                {isTamil ? 'நிதி உதவி & உதவித்தொகை' : 'Scholarships & Support'}
              </span>
              <h2 className="section-title">
                {isTamil
                  ? 'கல்விச் செலவு உங்கள் கனவைத் தடுக்கக் கூடாது'
                  : 'Financial Support for Every Deserving Student'}
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

      {/* 5.4 Build Your Skills Section */}
      <section className="section-padding bg-alt-section hp-section" id="skills">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              {isTamil ? 'திறன் மேம்பாடு' : 'Build Your Skills'}
            </span>
            <h2 className="section-title">
              {isTamil
                ? 'படிப்பைத் தாண்டி நடைமுறைத் திறன்களை வளர்த்துக் கொள்ளுங்கள்'
                : 'Practical Skills for Emerging Tomorrow'}
            </h2>
            <p className="section-subtitle">
              {isTamil
                ? 'எதிர்கால வேலைவாய்ப்புகளுக்குத் தேவையான புதிய தலைமுறைத் தொழில்நுட்பங்கள் மற்றும் நடைமுறைத் திறன்கள்.'
                : 'Go beyond traditional degrees. Master hands-on digital skills and industry readiness.'}
            </p>
          </div>

          <div className="skills-grid-clean">
            {skillTracks.map((track, i) => (
              <div key={i} className="card skill-track-card">
                <div className="skill-card-top">
                  <div className="skill-icon-wrap">{track.icon}</div>
                  <span className="badge badge-cyan">{track.badge}</span>
                </div>
                <h3 className="skill-card-title">{track.title}</h3>
                <p className="skill-card-desc">{track.desc}</p>
                <div className="skill-card-footer">
                  <span className="skill-tag-pill">{track.tag}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Handbooks row */}
          <div className="learning-resources-banner card">
            <div className="lr-banner-text">
              <BookOpen size={24} className="text-teal" />
              <div>
                <strong>{isTamil ? 'இலவசக் கையேடுகள் மற்றும் வழிகாட்டிகள்' : 'Free Student Learning Resources'}</strong>
                <p>
                  {isTamil
                    ? '12-ஆம் வகுப்புக்குப் பிந்தைய சேர்க்கை வழிகாட்டி கையேடுகளை உடனே பதிவிறக்குங்கள்.'
                    : 'Download admission guides and verified career reference handbooks for free.'}
                </p>
              </div>
            </div>
            <div className="lr-resources-links">
              {learningResources.slice(0, 2).map((res) => (
                <a
                  key={res.id}
                  href={res.link}
                  download={res.fileName || true}
                  className="btn btn-sm btn-outline"
                >
                  <Download size={14} />
                  <span>{isTamil ? res.title_ta : res.title_en}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 How EEE-TN Works Section */}
      <section className="section-padding hp-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-tag cyan">
              {isTamil ? 'எளிய வழிமுறை' : 'How EEE-TN Works'}
            </span>
            <h2 className="section-title">
              {isTamil ? '4 எளிய படிகளில் உங்கள் எதிர்காலம்' : 'Your Student Journey in 4 Simple Steps'}
            </h2>
            <p className="section-subtitle">
              {isTamil
                ? 'தமிழ்நாடு மாணவர்களுக்கான வெளிப்படையான, நம்பகமான உயர்கல்வி வழிகாட்டல் பயணம்.'
                : 'A transparent and empowering guidance pathway designed for students across all districts.'}
            </p>
          </div>

          <div className="journey-steps-grid">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="card journey-step-card">
                <span className="journey-step-num">{step.num}</span>
                <div className="journey-step-indicator" />
                <h3 className="journey-step-title">{step.title}</h3>
                <p className="journey-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 & 5.6 Meet Ednova AI Section */}
      <section className="section-padding bg-alt-section hp-section" id="ednova-ai">
        <div className="container">
          <div className="section-header">
            <span className="section-tag purple">
              <Bot size={15} />
              <span>{isTamil ? 'அறிமுகமாகிறது எட்னோவா ஏஐ' : 'Meet Ednova AI'}</span>
            </span>
            <h2 className="section-title">
              {isTamil
                ? 'உங்கள் தோழனாக வழிகாட்டும் AI உதவியாளர்'
                : 'Your Friendly, Trustworthy AI Education Guide'}
            </h2>
            <p className="section-subtitle">
              {isTamil
                ? '12-ஆம் வகுப்பு மாணவர்கள், பெற்றோர்கள் தங்கள் சந்தேகங்களை உடனுக்குடன் கேட்டு தெளிவு பெறலாம்.'
                : 'Empowering students and parents with instant, verified guidance on courses, cutoffs, and admissions.'}
            </p>
          </div>

          {/* Interactive Ednova Component */}
          <div className="ednova-showcase-container">
            <EdnovaAI />
          </div>
        </div>
      </section>

      {/* 5.7 Final Get Started Section */}
      <section className="hp-final-cta-section" id="about">
        <div className="container">
          <div className="hp-final-cta-card">
            <div className="hp-cta-glow-bg" aria-hidden="true" />
            <span className="section-tag" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF' }}>
              {isTamil ? 'இன்றே தொடங்குங்கள்' : 'Start Today'}
            </span>
            <h2 className="hp-cta-heading">
              {isTamil
                ? 'உங்கள் உயர்கல்விப் பயணத்தை நம்பிக்கையுடன் தொடங்குங்கள்.'
                : 'Your Future Begins With an Informed Decision.'}
            </h2>
            <p className="hp-cta-subtext">
              {isTamil
                ? 'EEE-TN தளத்தில் இலவசமாக இணைந்து தகுதியான உதவித்தொகைகள், கட்-ஆஃப் மற்றும் ஆலோசனை வழிகாட்டல்களைப் பெறுங்கள்.'
                : 'Join EEE-TN to discover verified higher education pathways, fee waivers, and career counseling.'}
            </p>

            <div className="hp-cta-action-row">
              <Link to="/register" className="hp-cta-primary-btn">
                <Sparkles size={18} />
                <span>{isTamil ? 'இலவசமாக இணையுங்கள்' : 'Get Started Now'}</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="hp-cta-secondary-btn">
                <span>{isTamil ? 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும்' : 'Already have an account? Login'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
