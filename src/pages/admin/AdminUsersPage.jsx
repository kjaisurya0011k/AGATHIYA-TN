import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  UserCheck,
  UserCog,
  Calendar,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { UserAvatar } from '../../components/UserAvatar';
import { formatDisplayDate } from '../../lib/dateUtils';

export function AdminUsersPage() {
  const { lang, t } = useLanguage();
  const { user, fetchAdminUsers, adminSetUserRole, adminUsers } = useAuth();

  const isTamil = lang === 'ta';
  const admLang = t?.adminHub || {};

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadUsers() {
      try {
        if (fetchAdminUsers) {
          const res = await fetchAdminUsers();
          if (isMounted && res?.data) {
            setUsersList(res.data);
          }
        }
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [fetchAdminUsers, adminUsers]);

  const callerId = user?.id || 'demo-admin-id';

  // Handle Role Change
  const handleRoleChange = async (targetUser, newRole) => {
    setActionError(null);
    setActionSuccess(null);

    // Rule 1: Cannot change own role
    if (targetUser.id === callerId) {
      alert(admLang.selfRoleChangeForbidden || (isTamil ? 'பாதுகாப்புக் கொள்கை: உங்கள் சொந்த நிர்வாகி பாத்திரத்தை நீங்கள் மாற்ற முடியாது.' : 'Security Policy: You cannot modify your own administrative role.'));
      return;
    }

    // Rule 2: Cannot remove last admin
    if (targetUser.role === 'admin' && newRole !== 'admin') {
      const remainingAdmins = usersList.filter((u) => u.id !== targetUser.id && u.role === 'admin');
      if (remainingAdmins.length === 0) {
        alert(admLang.lastAdminRemovalForbidden || (isTamil ? 'பாதுகாப்புக் கொள்கை: தளத்தின் கடைசி நிர்வாகியை நீக்கவோ அல்லது பாத்திரம் மாற்றவோ முடியாது.' : 'Security Policy: Cannot demote or remove the last remaining administrator.'));
        return;
      }
    }

    const confirmMsg = (admLang.confirmChangeRole || 'Are you sure you want to change the role of "{name}" to "{role}"?')
      .replace('{name}', targetUser.full_name || targetUser.email)
      .replace('{role}', newRole);

    const confirmed = window.confirm(confirmMsg);
    if (!confirmed) return;

    try {
      if (adminSetUserRole) {
        await adminSetUserRole(targetUser.id, newRole);
      }
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      const successMsg = (admLang.roleChangeSuccess || 'Role for "{name}" updated to "{role}" successfully!')
        .replace('{name}', targetUser.full_name || targetUser.email)
        .replace('{role}', newRole);

      setActionSuccess(successMsg);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err) {
      setActionError(err.message || 'Error updating user role');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (u.full_name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [usersList, roleFilter, searchQuery]);

  const counts = {
    all: usersList.length,
    student: usersList.filter((u) => u.role === 'student').length,
    mentor: usersList.filter((u) => u.role === 'mentor').length,
    admin: usersList.filter((u) => u.role === 'admin').length
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge badge-navy" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Admin</span>;
      case 'mentor':
        return <span className="badge badge-cyan" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Mentor</span>;
      case 'student':
        return <span className="badge badge-purple" style={{ fontSize: '0.75rem', fontWeight: 700 }}>Student</span>;
      default:
        return <span className="badge badge-gray">{role}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link
          to="/admin"
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} />
          <span>{isTamil ? 'நிர்வாக கட்டுப்பாட்டு மையத்திற்குத் திரும்பு' : 'Back to Admin Control Center'}</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid #0f172a', background: '#FFFFFF', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#0f172a" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {admLang.usersTitle || (isTamil ? 'தள பயனர்கள் & அணுகல் மேலாண்மை' : 'Platform Users & Role Administration')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.885rem', color: '#64748b' }}>
              {admLang.usersSubtitle ||
                (isTamil
                  ? 'மாணவர்கள், வழிகாட்டிகள் மற்றும் நிர்வாகிகளின் கணக்குகள் மற்றும் அனுமதி நிலைகள்.'
                  : 'Manage student, mentor, and administrator accounts and enforce role permissions securely.')}
            </p>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {actionSuccess && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ✓ {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="session-toast" style={{ marginBottom: '1.5rem', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.75rem 1rem', borderRadius: '8px' }}>
          ⚠️ {actionError}
        </div>
      )}

      {/* Student Privacy Shield Notice */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          background: '#f8fafc',
          borderLeft: '4px solid #00a6bf',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.65rem'
        }}
      >
        <ShieldCheck size={20} color="#008394" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
        <div>
          <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>
            {isTamil ? 'நிர்வாக மாணவர் தனியுரிமை பாதுகாப்பு:' : 'Administrator Student Privacy Shield:'}
          </strong>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
            {admLang.privacyShieldUsersNote ||
              (isTamil
                ? 'பயனரின் பெயர், மின்னஞ்சல் மற்றும் பதிவு செய்யப்பட்ட தேதி மட்டுமே காட்டப்படும். மாணவர்களின் தொலைபேசி எண்கள், கட்-ஆஃப் மதிப்பெண்கள், சமூகம் அல்லது வருமான விவரங்கள் இங்கே காட்டப்படாது.'
                : 'Only basic identification (name, email, role, joined date) is displayed. Personal student information (phone numbers, community category, cut-off marks, or family income) is strictly masked to preserve data privacy.')}
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              className={`tab-btn ${roleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setRoleFilter('all')}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
            >
              <span>{admLang.filterRoleAll || (isTamil ? 'அனைத்து பாத்திரங்களும்' : 'All Roles')} ({counts.all})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${roleFilter === 'student' ? 'active' : ''}`}
              onClick={() => setRoleFilter('student')}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
            >
              <GraduationCap size={13} />
              <span>{admLang.filterRoleStudent || (isTamil ? 'மாணவர்கள்' : 'Students')} ({counts.student})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${roleFilter === 'mentor' ? 'active' : ''}`}
              onClick={() => setRoleFilter('mentor')}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
            >
              <UserCheck size={13} />
              <span>{admLang.filterRoleMentor || (isTamil ? 'வழிகாட்டிகள்' : 'Mentors')} ({counts.mentor})</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${roleFilter === 'admin' ? 'active' : ''}`}
              onClick={() => setRoleFilter('admin')}
              style={{ fontSize: '0.825rem', padding: '0.35rem 0.8rem' }}
            >
              <Lock size={13} />
              <span>{admLang.filterRoleAdmin || (isTamil ? 'நிர்வாகிகள்' : 'Admins')} ({counts.admin})</span>
            </button>
          </div>

          {/* Search Box */}
          <div style={{ flex: '0 1 300px', minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={admLang.searchUserPlaceholder || (isTamil ? 'பெயர் அல்லது மின்னஞ்சல் வாரியாகத் தேடு...' : 'Search by name or email...')}
              style={{ width: '100%', paddingLeft: '2.25rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>{isTamil ? 'பயனர்கள் ஏற்றப்படுகின்றனர்...' : 'Loading user accounts...'}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Users size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>
              {isTamil ? 'பயனர்கள் யாரும் கிடைக்கவில்லை' : 'No users match this filter'}
            </div>
            <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
              {isTamil ? 'தேடல் வார்த்தையை மாற்றவும்.' : 'Try changing your search term.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '0.75rem' }}>{admLang.colName || (isTamil ? 'பயனர் பெயர்' : 'User Name')}</th>
                  <th style={{ padding: '0.75rem' }}>{admLang.colEmail || (isTamil ? 'மின்னஞ்சல்' : 'Email')}</th>
                  <th style={{ padding: '0.75rem' }}>{admLang.colRole || (isTamil ? 'தற்போதைய பாத்திரம்' : 'Current Role')}</th>
                  <th style={{ padding: '0.75rem' }}>{admLang.colJoinedDate || (isTamil ? 'இணைந்த தேதி' : 'Joined Date')}</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>{admLang.colActions || (isTamil ? 'பாத்திரம் மாற்று' : 'Assign Role')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isCaller = u.id === callerId;
                  const joinedDate = u.created_at ? formatDisplayDate(u.created_at) : '1 Jun 2026';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label={admLang.colName || (isTamil ? 'பயனர் பெயர்' : 'User Name')} style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <UserAvatar
                            name={u.full_name || 'TN User'}
                            avatarPath={u.avatar_path}
                            avatarUrl={u.avatar_url}
                            avatarUpdatedAt={u.avatar_updated_at}
                            role={u.role}
                            size={32}
                            forStaffOnly={true}
                          />
                          <div>
                            <div>{u.full_name || 'TN User'}</div>
                            {isCaller && (
                              <span style={{ fontSize: '0.7rem', color: '#008394', fontWeight: 600 }}>
                                ({isTamil ? 'நீங்கள்' : 'Current Account'})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label={admLang.colEmail || (isTamil ? 'மின்னஞ்சல்' : 'Email')} style={{ padding: '0.85rem 0.75rem', color: '#475569', wordBreak: 'break-all' }}>
                        {u.email || 'user@eeetn.org'}
                      </td>
                      <td data-label={admLang.colRole || (isTamil ? 'தற்போதைய பாத்திரம்' : 'Current Role')} style={{ padding: '0.85rem 0.75rem' }}>
                        {getRoleBadge(u.role)}
                      </td>
                      <td data-label={admLang.colJoinedDate || (isTamil ? 'இணைந்த தேதி' : 'Joined Date')} style={{ padding: '0.85rem 0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {joinedDate}
                      </td>
                      <td data-label={admLang.colActions || (isTamil ? 'பாத்திரம் மாற்று' : 'Assign Role')} style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        {isCaller ? (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                            {isTamil ? 'பாதுகாக்கப்பட்டது' : 'Caller Role Locked'}
                          </span>
                        ) : (
                          <select
                            className="form-input"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            style={{
                              fontSize: '0.9rem',
                              padding: '0.4rem 0.65rem',
                              minHeight: '44px',
                              width: '100%',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            <option value="student">{admLang.roleStudent || 'Student'}</option>
                            <option value="mentor">{admLang.roleMentor || 'Mentor'}</option>
                            <option value="admin">{admLang.roleAdmin || 'Admin'}</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Policies Footer Note */}
      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
          <Lock size={14} color="#008394" />
          <span>{isTamil ? 'பங்கு மேலாண்மை பாதுகாப்பு விதிகள் (admin_set_role)' : 'admin_set_role Security Function Rules:'}</span>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.55 }}>
          <li>{isTamil ? 'நிர்வாக பாத்திர மாற்றங்கள் Supabase security-definer செயல்பாடு மூலம் மட்டுமே செயல்படுத்தப்படும்.' : 'Role updates are governed exclusively by the admin_set_role security-definer function.'}</li>
          <li>{isTamil ? 'நிர்வாகிகள் தங்கள் சொந்த கணக்கின் பாத்திரத்தை மாற்ற இயலாது.' : 'Administrators cannot change their own account role.'}</li>
          <li>{isTamil ? 'தளத்தில் குறைந்தது ஒரு நிர்வாகி இருக்க வேண்டும் என்ற விதி கண்டிப்பாக அமலில் உள்ளது.' : 'Demoting or removing the last remaining administrator is strictly forbidden.'}</li>
        </ul>
      </div>
    </div>
  );
}

export default AdminUsersPage;
