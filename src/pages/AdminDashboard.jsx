import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  FileCheck,
  PlusCircle,
  Lock,
  ExternalLink,
  Clock,
  Award,
  Compass,
  ArrowRight,
  Sparkles,
  CreditCard,
  UserCheck
} from 'lucide-react';

export function AdminDashboard() {
  const { lang, t } = useLanguage();
  const {
    profile,
    fetchAdminDashboardStats,
    mentorSessions,
    achievements,
    adminUsers
  } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [stats, setStats] = useState({
    pendingSessionsCount: 0,
    pendingMentorsCount: 0,
    publishedAchievementsCount: 0,
    pendingPaymentsCount: 0,
    totalUsersCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      if (fetchAdminDashboardStats) {
        const s = await fetchAdminDashboardStats();
        if (isMounted && s) {
          setStats(s);
          setLoading(false);
        }
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [fetchAdminDashboardStats, mentorSessions, achievements, adminUsers]);

  const pendingSessionsList = mentorSessions.filter((s) => s.status === 'pending');

  return (
    <div className="page-wrapper container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Banner */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#0f172a', color: '#38bdf8', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.65rem' }}>
          <Lock size={13} />
          <span>{admLang.dashboardTitle || (isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையம்' : 'Administrator Control Center')}</span>
        </div>
        <h1 className="page-title" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 0.5rem 0' }}>
          {admLang.dashboardTitle || (isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையம்' : 'Administrator Mission Control')}
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.98rem', color: '#475569', maxWidth: '820px', lineHeight: 1.6 }}>
          {admLang.dashboardSubtitle ||
            (isTamil
              ? 'அமர்வுகள் ஒப்புதல், வழிகாட்டி விண்ணப்பங்கள், மாணவர் சாதனைகள் மற்றும் பயனர் அணுகல் மேலாண்மை.'
              : 'Manage session proposals, mentor applications, student achievement showcases, and platform access control.')}
        </p>

        {/* Quick Nav Row */}
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <Link
            to="/admin/sessions"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Clock size={15} />
            <span>{admLang.navSessionsReview || (isTamil ? 'அமர்வுகள் மதிப்பாய்வு' : 'Sessions Review')}</span>
          </Link>

          <Link
            to="/admin/mentors"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <UserCheck size={15} />
            <span>{admLang.navMentorsReview || (isTamil ? 'வழிகாட்டி விண்ணப்பங்கள்' : 'Mentor Applications')}</span>
          </Link>

          <Link
            to="/admin/achievements"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Award size={15} />
            <span>{admLang.navAchievements || (isTamil ? 'சாதனைகள் மேலாண்மை' : 'Achievements Showcase')}</span>
          </Link>

          <Link
            to="/admin/users"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Users size={15} />
            <span>{admLang.navUsers || (isTamil ? 'பயனர் மேலாண்மை' : 'User Permissions')}</span>
          </Link>

          <Link
            to="/opportunities"
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
          >
            <Compass size={15} />
            <span>{admLang.navOpportunities || (isTamil ? 'அரசு வாய்ப்புகள் மேலாண்மை' : 'Manage Opportunities')}</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Summary Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        {/* 1. Pending Sessions */}
        <Link
          to="/admin/sessions"
          className="card"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderLeft: '4px solid #f59e0b',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              {admLang.statPendingSessions || (isTamil ? 'ஒப்புதலுக்கு நிலுவை' : 'Pending Sessions')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#b45309" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.pendingSessionsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{isTamil ? 'மதிப்பாய்வு செய்ய கிளிக் செய்யவும்' : 'Click to review queue'}</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 2. Pending Mentor Profiles */}
        <Link
          to="/admin/mentors"
          className="card"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderLeft: '4px solid #00a6bf',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#008394', textTransform: 'uppercase' }}>
              {admLang.statPendingMentors || (isTamil ? 'சரிபார்ப்பு நிலுவை' : 'Pending Mentors')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 166, 191, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={16} color="#008394" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.pendingMentorsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{isTamil ? 'விண்ணப்பங்களைச் சரிபார்க்க' : 'Review applications'}</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 3. Published Achievements */}
        <Link
          to="/admin/achievements"
          className="card"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderLeft: '4px solid #7c3aed',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase' }}>
              {admLang.statPublishedAchievements || (isTamil ? 'வெளியிடப்பட்டவை' : 'Published Showcases')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={16} color="#6d28d9" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.publishedAchievementsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{isTamil ? 'சாதனைகளை நிர்வகிக்க' : 'Manage showcases'}</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 4. Pending Payment Registrations */}
        <Link
          to="/admin/sessions"
          className="card"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderLeft: '4px solid #ea580c',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase' }}>
              {admLang.statPendingPayments || (isTamil ? 'கட்டண நிலுவை' : 'Pending Payments')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={16} color="#c2410c" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.pendingPaymentsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{isTamil ? 'பதிவுகளைக் காண்க' : 'Audit registrations'}</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {/* 5. Total Users */}
        <Link
          to="/admin/users"
          className="card"
          style={{
            padding: '1.25rem',
            background: '#FFFFFF',
            borderLeft: '4px solid #0f172a',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase' }}>
              {admLang.statTotalUsers || (isTamil ? 'மொத்த பயனர்கள்' : 'Total Users')}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#0f172a" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
            {stats.totalUsersCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{isTamil ? 'அணுகல் உரிமைகளை நிர்வகிக்க' : 'Manage role access'}</span>
            <ArrowRight size={12} />
          </div>
        </Link>
      </div>

      {/* Pending Sessions Queue Preview */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
              {isTamil ? 'ஒப்புதல் நிலுவையில் உள்ள வழிகாட்டி அமர்வுகள்' : 'Sessions Awaiting Administrator Review'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              {isTamil
                ? 'வழிகாட்டிகளால் சமர்ப்பிக்கப்பட்ட புதிய அல்லது திருத்தப்பட்ட அமர்வுகளை மதிப்பாய்வு செய்து அங்கீகரிக்கவும்.'
                : 'Inspect newly submitted guidance sessions, verify details, and publish to the live student catalogue.'}
            </p>
          </div>

          <Link
            to="/admin/sessions"
            className="btn btn-sm btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>{isTamil ? 'அனைத்தையும் காண்க' : 'Open Full Review Queue'}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {pendingSessionsList.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', color: '#64748b' }}>
            <CheckCircle size={32} color="#16a34a" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 700, color: '#166534', marginBottom: '0.25rem' }}>
              {isTamil ? 'அனைத்து அமர்வுகளும் மதிப்பாய்வு செய்யப்பட்டுவிட்டன!' : 'All session proposals have been reviewed!'}
            </div>
            <div style={{ fontSize: '0.825rem' }}>
              {isTamil ? 'ஒப்புதலுக்கு புதிய அமர்வுகள் ஏதுமில்லை.' : 'No sessions are currently waiting in the pending queue.'}
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', background: '#f8fafc' }}>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'அமர்வு தலைப்பு' : 'Session Title'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'வழிகாட்டி' : 'Mentor'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'தேதி & நேரம்' : 'Schedule'}</th>
                  <th style={{ padding: '0.75rem' }}>{isTamil ? 'துறை' : 'Topic'}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>{isTamil ? 'நடவடிக்கை' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {pendingSessionsList.slice(0, 4).map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {(isTamil && s.title_ta ? s.title_ta : s.title_en) || s.title_en}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>
                      {s.mentor_name || 'Verified Mentor'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: '#64748b' }}>
                      {s.session_date || s.date} ({s.start_time || '10:00'})
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                        {s.topic || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <Link
                        to="/admin/sessions"
                        className="btn btn-sm btn-outline"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                      >
                        {isTamil ? 'மதிப்பாய்வு செய்' : 'Review & Edit'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security & RLS Policy Compliance Notice */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          background: '#f8fafc',
          borderLeft: '4px solid #0f172a',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#0f172a', fontWeight: 700, fontSize: '0.875rem' }}>
          <ShieldCheck size={18} color="#00a6bf" />
          <span>{isTamil ? 'பாதுகாப்பு & தரவு தனியுரிமை கொள்கை' : 'Security Policy & Row Level Security Enforcement'}</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.825rem', color: '#475569', lineHeight: 1.55 }}>
          {isTamil
            ? 'அனைத்து பாத்திர அனுமதிகளும் Supabase Row Level Security (RLS) மற்றும் security-definer செயல்பாடுகளால் தரவுத்தள மட்டத்தில் கண்டிப்பாக அமல்படுத்தப்பட்டுள்ளன. பயனரின் பங்கு மாற்றங்கள் admin_set_role() மூலம் மட்டுமே சாத்தியமாகும்; தனிநபர் தனது சொந்த பங்கை மாற்ற முடியாது, மற்றும் கடைசி நிர்வாகியை நீக்க இயலாது.'
            : 'All administrative privileges are strictly enforced at the database level via Supabase Row Level Security (RLS) and security-definer functions (is_admin, admin_set_role). Role elevation cannot be manipulated on the frontend alone, and student personal records remain strictly private.'}
        </p>
      </div>
    </div>
  );
}

export default AdminDashboard;
