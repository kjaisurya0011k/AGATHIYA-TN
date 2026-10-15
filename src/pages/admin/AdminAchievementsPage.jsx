import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import {
  Award,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Calendar,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';

export function AdminAchievementsPage() {
  const { lang, t } = useLanguage();
  const isTamil = lang === 'ta';

  const [filter, setFilter] = useState('all');

  const [achievements, setAchievements] = useState([
    {
      id: 'ach-1',
      title: isTamil
        ? 'மாநில அளவிலான பள்ளி கண்டுபிடிப்பாளர் போட்டி 2026: தருமபுரி அரசு பள்ளி மாணவர்கள் முதலிடம்'
        : 'State-Level School Innovators Hackathon 2026: Dharmapuri Govt School Secures 1st Prize',
      type: 'hackathon',
      date: '2026-06-18',
      school: 'GHSS Pennagaram',
      town: 'Dharmapuri',
      status: 'published',
      consent: true,
      imageCount: 3
    },
    {
      id: 'ach-2',
      title: isTamil
        ? '7.5% அரசு பள்ளி ஒதுக்கீட்டில் 12 மாணவர்கள் மெட்ராஸ் மருத்துவக் கல்லூரியில் சேர்க்கை'
        : '12 First-Generation Govt School Students Join Madras Medical College via 7.5% Quota',
      type: 'award',
      date: '2026-07-02',
      school: 'Multiple Districts (Ariyalur, Salem, Madurai)',
      town: 'Chennai MMC',
      status: 'published',
      consent: true,
      imageCount: 4
    },
    {
      id: 'ach-3',
      title: isTamil
        ? 'செயற்கை நுண்ணறிவு & ரோபாட்டிக்ஸ் பயிற்சி பட்டறை - திருச்சி'
        : 'AI & Robotics Hands-on Workshop for Rural Higher Secondary Students',
      type: 'workshop',
      date: '2026-08-10',
      school: 'Govt Boys HSS',
      town: 'Tiruchirappalli',
      status: 'draft',
      consent: false,
      imageCount: 1
    }
  ]);

  const filtered = achievements.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'நிர்வாக டாஷ்போர்டுக்குத் திரும்பு' : 'Back to Admin Dashboard'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid var(--purple-600)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--purple-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} color="var(--purple-700)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
                {t?.placeholders?.adminAchievementsTitle || (isTamil ? 'சாதனைகள் மேலாண்மை' : 'Achievements Showcase Management')}
              </h1>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {t?.placeholders?.adminAchievementsDesc || (isTamil ? 'மாணவர் சாதனைகள், ஹேக்கத்தான்கள் மற்றும் விருதுகளை நிர்வகிக்கவும்.' : 'Manage student achievements, hackathon wins, awards, and school showcases.')}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
            onClick={() => alert(isTamil ? 'புதிய சாதனை உருவாக்கும் படிவம் கட்டம் 4-ல் முழுமையாக்கப்படும்.' : 'New achievement creation dialog will be fully implemented in Phase 4.')}
          >
            <PlusCircle size={16} />
            <span>{isTamil ? 'புதிய சாதனை சேர்' : 'New Achievement'}</span>
          </button>
        </div>

        {/* Phase Notice */}
        <div className="modal-alert-success" style={{ background: 'rgba(109, 40, 217, 0.08)', borderColor: 'rgba(109, 40, 217, 0.3)', color: 'var(--navy-900)', marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <CheckCircle2 size={16} color="var(--purple-700)" />
          <span style={{ fontSize: '0.825rem' }}>
            <strong>{isTamil ? 'கட்டம் 1 நிலை:' : 'Phase 1 Status:'}</strong>{' '}
            {isTamil
              ? 'இந்த பகுதி கட்டம் 4-ல் Supabase Storage multi-image upload மற்றும் பெற்றோர் புகைப்பட சம்மத சரிபார்ப்புடன் இணைக்கப்படும்.'
              : 'This management portal will connect to the achievement-images storage bucket and photo consent guards in Phase 4.'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`filter-pill-btn ${filter === 'all' ? 'active' : ''}`}
        >
          <span>{isTamil ? 'அனைத்தும்' : 'All'}</span>
          <span className="count-badge">{achievements.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('published')}
          className={`filter-pill-btn ${filter === 'published' ? 'active' : ''}`}
        >
          <span>{isTamil ? 'வெளியிடப்பட்டவை' : 'Published'}</span>
          <span className="count-badge">{achievements.filter((a) => a.status === 'published').length}</span>
        </button>
        <button
          type="button"
          onClick={() => setFilter('draft')}
          className={`filter-pill-btn ${filter === 'draft' ? 'active' : ''}`}
        >
          <span>{isTamil ? 'வரைவுகள்' : 'Drafts'}</span>
          <span className="count-badge">{achievements.filter((a) => a.status === 'draft').length}</span>
        </button>
      </div>

      {/* Achievements Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filtered.map((item) => (
          <div key={item.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className={`mentor-status-badge status-${item.status === 'published' ? 'approved' : 'draft'}`}>
                  {item.status === 'published' ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                  <span>{item.status === 'published' ? (isTamil ? 'வெளியிடப்பட்டது' : 'Published') : (isTamil ? 'வரைவு' : 'Draft')}</span>
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  {item.date}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
                {item.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <div>🏛️ {item.school}</div>
                <div>📍 {item.town}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: item.consent ? '#166534' : '#b45309', fontWeight: 600 }}>
                  <ShieldCheck size={14} />
                  <span>{item.consent ? (isTamil ? 'பெற்றோர் புகைப்பட சம்மதம் பெறப்பட்டது' : 'Photo Consent Confirmed') : (isTamil ? 'சம்மதம் தேவை' : 'Consent Pending')}</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <ImageIcon size={14} />
                <span>{item.imageCount} {isTamil ? 'படங்கள்' : 'Photos'}</span>
              </span>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => alert(isTamil ? 'கட்டம் 4-ல் நேரலை திருத்தம் செயல்படுத்தப்படும்.' : 'Edit modal will be wired in Phase 4.')}
                >
                  <Edit size={12} />
                  <span>{isTamil ? 'திருத்து' : 'Edit'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminAchievementsPage;
