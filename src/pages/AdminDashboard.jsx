import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { initialOpportunities, initialSessions } from '../data/appData';
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
  Compass
} from 'lucide-react';

export function AdminDashboard() {
  const { lang } = useLanguage();
  const { profile } = useAuth();

  const [pendingSessions, setPendingSessions] = useState([
    {
      id: 'p1',
      title: 'TNAU தமிழ்நாடு வேளாண் பல்கலைக்கழக சேர்க்கை & கலந்தாய்வு வழிகாட்டல்',
      mentor: 'Dr. M. Sangeetha (TNAU Alumnus)',
      date: '2026-07-08',
      type: 'Agriculture Counseling'
    },
    {
      id: 'p2',
      title: 'சட்டப் படிப்புகள் (5-Year B.A. LL.B) அரசு சட்டக்கல்லூரி சேர்க்கை',
      mentor: 'Adv. S. Ramanathan, Madras High Court',
      date: '2026-07-12',
      type: 'Law Admissions'
    }
  ]);

  const [approvedCount, setApprovedCount] = useState(4);
  const [actionNotice, setActionNotice] = useState(null);

  const handleApprove = (id, title) => {
    setPendingSessions((prev) => prev.filter((s) => s.id !== id));
    setApprovedCount((c) => c + 1);
    setActionNotice(
      lang === 'ta'
        ? `"${title}" அமர்வு அங்கீகரிக்கப்பட்டு மாணவர் பார்வைக்கு வெளியிடப்பட்டது.`
        : `"${title}" has been approved and published to the live sessions page.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleReject = (id, title) => {
    setPendingSessions((prev) => prev.filter((s) => s.id !== id));
    setActionNotice(
      lang === 'ta'
        ? `"${title}" அமர்வு நிராகரிக்கப்பட்டது.`
        : `"${title}" proposal was declined.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="page-wrapper container">
      {/* Admin Title & Security Notice */}
      <div className="page-header">
        <div className="admin-header-flex">
          <div>
            <span className="badge badge-navy">
              <Lock size={12} />
              <span>{lang === 'ta' ? 'அதிகாரப்பூர்வ நிர்வாக மையம்' : 'Admin Control Center'}</span>
            </span>
            <h1 className="page-title">
              {lang === 'ta' ? 'EEE-TN தள நிர்வாகம் & சரிபார்ப்பு' : 'Platform Administration & Verification'}
            </h1>
            <p className="page-subtitle">
              {lang === 'ta'
                ? 'வழிகாட்டி அமர்வுகள் ஒப்புதல், அரசு உதவித்தொகை தகவல்கள் தணிக்கை மற்றும் மாணவர் சரிபார்ப்பு.'
                : 'Review mentor workshop proposals, audit government scheme accuracy, and verify student records.'}
            </p>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <Link
                to="/admin/sessions"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Clock size={15} />
                <span>{lang === 'ta' ? 'அமர்வுகள் மதிப்பாய்வு' : 'Sessions Review'}</span>
              </Link>

              <Link
                to="/admin/achievements"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Award size={15} />
                <span>{lang === 'ta' ? 'சாதனைகள்' : 'Achievements'}</span>
              </Link>

              <Link
                to="/admin/users"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={15} />
                <span>{lang === 'ta' ? 'பயனர்கள்' : 'Users'}</span>
              </Link>

              <Link
                to="/admin/mentors"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShieldCheck size={15} />
                <span>{lang === 'ta' ? 'வழிகாட்டிகள்' : 'Mentors'}</span>
              </Link>

              <Link
                to="/opportunities"
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Compass size={15} />
                <span>{lang === 'ta' ? 'வாய்ப்புகள்' : 'Opportunities'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="alert-box-success card">
          <CheckCircle size={18} color="#16a34a" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Admin Stats Grid */}
      <div className="admin-stats-grid section-padding-sm">
        <div className="card admin-stat-card">
          <span className="stat-num">{initialOpportunities.length}</span>
          <span className="stat-desc">
            {lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட வாய்ப்புகள்' : 'Active Opportunities'}
          </span>
          <span className="badge badge-green">100% Verified</span>
        </div>

        <div className="card admin-stat-card">
          <span className="stat-num">{pendingSessions.length}</span>
          <span className="stat-desc">
            {lang === 'ta' ? 'ஒப்புதல் நிலுவையில் உள்ள அமர்வுகள்' : 'Pending Session Proposals'}
          </span>
          <span className="badge badge-amber">Requires Review</span>
        </div>

        <div className="card admin-stat-card">
          <span className="stat-num">{approvedCount}</span>
          <span className="stat-desc">
            {lang === 'ta' ? 'நேரலை வெபினார்கள்' : 'Live Workshops'}
          </span>
          <span className="badge badge-purple">Active Online</span>
        </div>

        <div className="card admin-stat-card">
          <span className="stat-num">38</span>
          <span className="stat-desc">
            {lang === 'ta' ? 'தமிழ்நாடு மாவட்டங்கள்' : 'Districts Covered'}
          </span>
          <span className="badge badge-cyan">TN Statewide</span>
        </div>
      </div>

      {/* Section 1: Pending Workshop Approvals */}
      <div className="section-padding-sm">
        <div className="section-header">
          <h2 className="section-title">
            {lang === 'ta' ? 'வழிகாட்டல் அமர்வுகள் ஒப்புதல் வரிசை' : 'Pending Mentor Session Approvals'}
          </h2>
          <p className="section-subtitle">
            {lang === 'ta'
              ? 'முன்னாள் மாணவர்கள் சமர்ப்பிக்கும் வகுப்புகளின் தரம் மற்றும் நம்பகத்தன்மையை சரிபார்த்து ஒப்புதல் அளிக்கவும்.'
              : 'Review submitted mentor sessions for authenticity before making them visible to students.'}
          </p>
        </div>

        {pendingSessions.length > 0 ? (
          <div className="admin-table-card card">
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{lang === 'ta' ? 'தலைப்பு' : 'Session Title'}</th>
                    <th>{lang === 'ta' ? 'வழிகாட்டி' : 'Mentor'}</th>
                    <th>{lang === 'ta' ? 'தேதி' : 'Proposed Date'}</th>
                    <th>{lang === 'ta' ? 'பிரிவு' : 'Domain'}</th>
                    <th>{lang === 'ta' ? 'செயல்கள்' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSessions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{s.title}</strong>
                      </td>
                      <td>{s.mentor}</td>
                      <td>{s.date}</td>
                      <td>
                        <span className="badge badge-cyan">{s.type}</span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            type="button"
                            onClick={() => handleApprove(s.id, s.title)}
                            className="btn btn-sm btn-primary"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                            <span>{lang === 'ta' ? 'ஒப்புதல்' : 'Approve'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(s.id, s.title)}
                            className="btn btn-sm btn-outline text-danger"
                            title="Reject"
                          >
                            <XCircle size={14} />
                            <span>{lang === 'ta' ? 'நிராகரி' : 'Decline'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card empty-state-box">
            <CheckCircle size={36} color="#16a34a" />
            <p>
              {lang === 'ta'
                ? 'நிலுவையில் உள்ள அமர்வுகள் எதுவும் இல்லை. அனைத்து சமர்ப்பிப்புகளும் சரிபார்க்கப்பட்டன!'
                : 'All submitted mentor sessions have been reviewed and approved!'}
            </p>
          </div>
        )}
      </div>

      {/* Section 2: Opportunities Registry Audit */}
      <div className="section-padding-sm">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">
              {lang === 'ta' ? 'அரசு உதவித்தொகை & வாய்ப்புகள் பட்டியல்' : 'Verified Opportunities Registry'}
            </h2>
          </div>
        </div>

        <div className="admin-table-card card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{lang === 'ta' ? 'திட்டம் / உதவித்தொகை' : 'Scheme Name'}</th>
                  <th>{lang === 'ta' ? 'வழங்குபவர்' : 'Agency / Dept'}</th>
                  <th>{lang === 'ta' ? 'கடைசி தேதி' : 'Deadline'}</th>
                  <th>{lang === 'ta' ? 'தணிக்கை தேதி' : 'Last Audited'}</th>
                  <th>{lang === 'ta' ? 'இணைப்பு' : 'Official Portal'}</th>
                </tr>
              </thead>
              <tbody>
                {initialOpportunities.map((opp) => (
                  <tr key={opp.id}>
                    <td>
                      <strong>{lang === 'ta' ? opp.title_ta : opp.title_en}</strong>
                    </td>
                    <td>{lang === 'ta' ? opp.provider_ta : opp.provider_en}</td>
                    <td>{opp.deadline}</td>
                    <td>
                      <span className="badge badge-green">
                        <FileCheck size={12} /> {opp.verification_date}
                      </span>
                    </td>
                    <td>
                      <a
                        href={opp.official_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portal-link-btn"
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
