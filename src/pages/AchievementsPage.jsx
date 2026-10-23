import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialOpportunities, initialSessions } from '../data/appData';
import { OpportunityCard } from '../components/OpportunityCard';
import { SessionCard } from '../components/SessionCard';
import { formatDisplayDate } from '../lib/dateUtils';
import {
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Clock,
  Sparkles,
  MapPin,
  Building,
  User,
  ArrowRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Layers
} from 'lucide-react';

export function AchievementsPage() {
  const { lang, t } = useLanguage();
  const {
    user,
    profile,
    savedOpportunities,
    registeredSessions,
    fetchAchievements,
    achievements
  } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [publishedAchievements, setPublishedAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Load published achievements
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        if (fetchAchievements) {
          const res = await fetchAchievements(true);
          if (isMounted && res?.data) {
            setPublishedAchievements(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching published achievements:', err);
      } finally {
        if (isMounted) setLoadingAchievements(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchAchievements, achievements]);

  const savedList = initialOpportunities.filter((opp) => savedOpportunities.includes(opp.id));
  const registeredList = initialSessions.filter((s) => registeredSessions.includes(s.id));

  const milestones = [
    {
      id: 'm1',
      title_ta: 'உயர்கல்வி இலக்கு மற்றும் படிப்பு விருப்பங்கள் பதிவு செய்யப்பட்டது',
      title_en: 'Higher Education Path & Stream Goal Set',
      status: 'completed',
      date: '2026-05-12'
    },
    {
      id: 'm2',
      title_ta: '7.5% அரசுப் பள்ளி இடஒதுக்கீடு தகுதி சரிபார்க்கப்பட்டது',
      title_en: '7.5% Govt School Quota Eligibility Verified',
      status: 'completed',
      date: '2026-05-14'
    },
    {
      id: 'm3',
      title_ta: 'முதல் பட்டதாரி சான்றிதழ் ஆவணங்கள் தயார் செய்யப்பட்டது',
      title_en: 'First Graduate Certificate Documents Prepared',
      status: 'completed',
      date: '2026-05-18'
    },
    {
      id: 'm4',
      title_ta: 'கவுன்சிலிங் கல்லூரி விருப்பப் பட்டியல் தயாரித்தல்',
      title_en: 'Counseling Choice Filling Strategy Finalization',
      status: 'in-progress',
      date: '2026-06-10'
    }
  ];

  const openGalleryModal = (item) => {
    setSelectedGalleryItem(item);
    setActivePhotoIndex(0);
  };

  const closeGalleryModal = () => {
    setSelectedGalleryItem(null);
    setActivePhotoIndex(0);
  };

  const nextPhoto = () => {
    if (!selectedGalleryItem?.images?.length) return;
    setActivePhotoIndex((prev) => (prev + 1) % selectedGalleryItem.images.length);
  };

  const prevPhoto = () => {
    if (!selectedGalleryItem?.images?.length) return;
    setActivePhotoIndex((prev) => (prev - 1 + selectedGalleryItem.images.length) % selectedGalleryItem.images.length);
  };

  const getCategoryBadge = (type) => {
    switch (type) {
      case 'hackathon':
        return <span className="badge badge-purple">{admLang.typeHackathon || 'Hackathon Win'}</span>;
      case 'award':
        return <span className="badge badge-green">{admLang.typeAward || 'State Award'}</span>;
      case 'workshop':
        return <span className="badge badge-cyan">{admLang.typeWorkshop || 'STEM Workshop'}</span>;
      case 'school_collaboration':
        return <span className="badge badge-navy">{admLang.typeSchoolCollab || 'School Outreach'}</span>;
      default:
        return <span className="badge badge-gray">{type}</span>;
    }
  };

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem 5rem' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <span className="section-tag purple">
          {admLang.publicShowcaseTag || (isTamil ? 'தமிழ்நாடு சாதனைச் சுடர்' : 'Inspiring Showcases')}
        </span>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.3rem)', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
          {admLang.publicShowcaseTitle || (isTamil ? 'அரசுப் பள்ளி மாணவர்கள் & வழிகாட்டிகளின் சாதனைகள்' : 'Statewide Student Achievements & Honors')}
        </h1>
        <p className="page-subtitle" style={{ fontSize: '1rem', color: '#475569', maxWidth: '820px', lineHeight: 1.6 }}>
          {admLang.publicShowcaseSubtitle ||
            (isTamil
              ? 'கிராமப்புற மற்றும் சிறுநகர மாணவர்கள் வென்ற தேசிய ஹேக்கத்தான்கள், மருத்துவ இடஒதுக்கீடு வெற்றிகள் மற்றும் புதிய கண்டுபிடிப்புகள்.'
              : 'Celebrating inspiring milestones of rural and government school students across Tamil Nadu in state hackathons, medical quotas, and scientific breakthroughs.')}
        </p>
      </div>

      {/* SECTION 1: PUBLIC ACHIEVEMENTS SHOWCASE CARDS WITH PHOTO GALLERIES */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} color="var(--purple-700)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
              {isTamil ? 'சமீபத்திய அரசு பள்ளி சாதனைகள்' : 'Verified Student Showcases & Awards'}
            </h2>
          </div>

          <span className="badge badge-purple" style={{ fontSize: '0.78rem' }}>
            {publishedAchievements.length} {isTamil ? 'வெளியிடப்பட்ட சாதனைகள்' : 'Featured Achievements'}
          </span>
        </div>

        {loadingAchievements ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>{isTamil ? 'சாதனைகள் ஏற்றப்படுகின்றன...' : 'Loading showcases...'}</p>
          </div>
        ) : publishedAchievements.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', color: '#64748b' }}>
            <Award size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '0.25rem' }}>
              {isTamil ? 'சாதனைகள் விரைவில் வெளியிடப்படும்' : 'No showcases published yet'}
            </h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {isTamil ? 'நிர்வாகியால் அங்கீகரிக்கப்பட்ட சாதனைகள் இங்கே காட்சிப்படுத்தப்படும்.' : 'New achievements approved by administrators will be featured here.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {publishedAchievements.map((ach) => {
              const title = (isTamil && ach.title_ta ? ach.title_ta : ach.title_en) || ach.title_en;
              const desc = (isTamil && ach.description_ta ? ach.description_ta : ach.description_en) || ach.description_en || '';
              const firstImage = ach.images?.[0]?.image_path;

              return (
                <div
                  key={ach.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '0',
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 4px 15px rgba(15, 23, 42, 0.06)',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                >
                  {/* Photo Hero Cover or Placeholder */}
                  {firstImage ? (
                    <div
                      style={{
                        position: 'relative',
                        height: '190px',
                        background: '#0f172a',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => openGalleryModal(ach)}
                    >
                      <img
                        src={firstImage}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {ach.images.length > 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <ImageIcon size={12} />
                          <span>+{ach.images.length - 1} photos</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        height: '130px',
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}
                    >
                      <Award size={44} />
                    </div>
                  )}

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Category Badge & Date */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        {getCategoryBadge(ach.achievement_type)}
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                          <Calendar size={12} />
                          <span>{formatDisplayDate(ach.event_date)}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                        {title}
                      </h3>

                      {/* School & Town */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#008394', fontWeight: 600, marginBottom: '0.75rem' }}>
                        <MapPin size={13} />
                        <span>{ach.school_name}, {ach.town}</span>
                      </div>

                      {/* Description */}
                      {desc && (
                        <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                          {desc}
                        </p>
                      )}

                      {/* Winners text callout */}
                      {ach.winners_text && (
                        <div style={{ fontSize: '0.78rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '4px', borderLeft: '3px solid #7c3aed', color: '#334155', marginBottom: '1rem' }}>
                          <strong>{isTamil ? 'வெற்றியாளர்கள்: ' : 'Honorees: '}</strong>
                          {ach.winners_text}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {ach.images?.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => openGalleryModal(ach)}
                          className="btn btn-sm btn-outline"
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <ImageIcon size={13} />
                          <span>{admLang.viewGallery || (isTamil ? 'படங்களைக் காண்க' : 'View Photos')} ({ach.images.length})</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {isTamil ? 'புகைப்படங்கள் இல்லை' : 'Verified Notice'}
                        </span>
                      )}

                      <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <CheckCircle2 size={12} /> {isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: STUDENT PORTFOLIO, MILESTONES & BOOKMARKS */}
      <div style={{ borderTop: '2px dashed #e2e8f0', paddingTop: '3rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="section-tag cyan">
            {isTamil ? 'என் கல்வி மைல்ஸ்டோன்கள்' : 'My Personal Dashboard'}
          </span>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0.35rem 0 0' }}>
            {isTamil ? 'சேமித்த வாய்ப்புகள் & கலந்தாய்வு மைல்ஸ்டோன்கள்' : 'My Tracked Opportunities & Milestones'}
          </h2>
        </div>

        {/* Student Profile Summary Card */}
        <div className="card student-summary-card" style={{ marginBottom: '2rem' }}>
          <div className="summary-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="student-avatar-lg" style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ede9fe', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="student-info">
              <h3 className="student-name" style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--navy-900)' }}>
                {profile?.full_name || (isTamil ? 'கே. முத்து குமார்' : 'K. Muthu Kumar')}
              </h3>
              <div className="student-tags-row" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span className="badge badge-navy" style={{ fontSize: '0.72rem' }}>
                  <MapPin size={11} />
                  <span>{profile?.district || (isTamil ? 'தருமபுரி மாவட்டம்' : 'Dharmapuri')}</span>
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                  <Sparkles size={11} />
                  <span>{isTamil ? '7.5% ஒதுக்கீட்டிற்கு தகுதியுடையவர்' : '7.5% Quota Eligible'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones Timeline */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
            {isTamil ? 'உயர்கல்வி வழிகாட்டல் முன்னேற்ற மைல்ஸ்டோன்கள்' : 'Higher Education Guidance Milestones'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {milestones.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: m.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                  border: m.status === 'completed' ? '1.5px solid #86efac' : '1px solid #e2e8f0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {m.status === 'completed' ? (
                    <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>✓ {isTamil ? 'முடிந்தது' : 'Completed'}</span>
                  ) : (
                    <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>⏳ {isTamil ? 'செயலில்' : 'In Progress'}</span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{m.date}</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  {isTamil ? m.title_ta : m.title_en}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarked Opportunities Grid */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
              {isTamil ? 'நான் சேமித்த அரசு உதவித்தொகை திட்டங்கள்' : 'My Saved Scholarships & Schemes'} ({savedList.length})
            </h3>
            <Link to="/opportunities" className="btn btn-sm btn-outline" style={{ fontSize: '0.78rem' }}>
              {isTamil ? 'அனைத்து திட்டங்களையும் காண்க' : 'Browse All Opportunities'}
            </Link>
          </div>

          {savedList.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {savedList.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', background: '#FFFFFF', color: '#64748b' }}>
              <Bookmark size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {isTamil ? 'நீங்கள் இதுவரை எந்த வாய்ப்பையும் சேமிக்கவில்லை.' : 'You have not saved any scholarship schemes yet.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FULL PHOTO GALLERY MODAL */}
      {selectedGalleryItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.88)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '860px',
              background: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: '#FFFFFF'
            }}
          >
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                  {(isTamil && selectedGalleryItem.title_ta ? selectedGalleryItem.title_ta : selectedGalleryItem.title_en) || selectedGalleryItem.title_en}
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  {selectedGalleryItem.school_name}, {selectedGalleryItem.town} ({selectedGalleryItem.event_date})
                </div>
              </div>

              <button
                type="button"
                onClick={closeGalleryModal}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                aria-label="Close photo gallery"
              >
                <X size={22} />
              </button>
            </div>

            {/* Active Image Stage with Navigation */}
            <div style={{ position: 'relative', height: '420px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {selectedGalleryItem.images?.[activePhotoIndex] ? (
                <img
                  src={selectedGalleryItem.images[activePhotoIndex].image_path}
                  alt={`Showcase Photo ${activePhotoIndex + 1}`}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No photo available</div>
              )}

              {selectedGalleryItem.images?.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevPhoto}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: 'none',
                      color: '#FFFFFF',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={nextPhoto}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: 'none',
                      color: '#FFFFFF',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="Next photo"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Caption & Thumbnail Strip */}
            <div style={{ padding: '1rem 1.25rem', background: '#0f172a' }}>
              {selectedGalleryItem.images?.[activePhotoIndex]?.caption && (
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#e2e8f0', textAlign: 'center' }}>
                  "{selectedGalleryItem.images[activePhotoIndex].caption}"
                </p>
              )}

              {selectedGalleryItem.images?.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {selectedGalleryItem.images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActivePhotoIndex(idx)}
                      style={{
                        width: '50px',
                        height: '40px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        border: idx === activePhotoIndex ? '2px solid #38bdf8' : '1px solid #334155',
                        padding: 0,
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <img
                        src={img.image_path}
                        alt={`Thumb ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchievementsPage;
