import React, { useState } from 'react';
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
  UserCog
} from 'lucide-react';

export function AdminUsersPage() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isTamil = lang === 'ta';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [roleChangeNotice, setRoleChangeNotice] = useState(null);

  // Mock users for Phase 1 visual demonstration
  const [userList, setUserList] = useState([
    {
      id: 'u-1',
      full_name: 'EEE-TN Platform Administrator',
      email: 'director.admin@eeetn.org',
      role: 'admin',
      created_at: '2026-05-10',
      isCurrentCaller: true
    },
    {
      id: 'u-2',
      full_name: 'Er. K. Senthil Nathan',
      email: 'senthil.mentor@eeetn.org',
      role: 'mentor',
      created_at: '2026-06-01',
      isCurrentCaller: false
    },
    {
      id: 'u-3',
      full_name: 'Dr. Priya Anbarasan',
      email: 'priya.medical@eeetn.org',
      role: 'mentor',
      created_at: '2026-06-15',
      isCurrentCaller: false
    },
    {
      id: 'u-4',
      full_name: 'K. Muthu Kumar',
      email: 'muthu.student@eeetn.org',
      role: 'student',
      created_at: '2026-07-01',
      isCurrentCaller: false
    },
    {
      id: 'u-5',
      full_name: 'S. Anitha',
      email: 'anitha.new@eeetn.org',
      role: 'student',
      created_at: '2026-07-04',
      isCurrentCaller: false
    }
  ]);

  const handleRoleChange = (targetUser, newRole) => {
    if (targetUser.isCurrentCaller) {
      alert(isTamil ? 'பாதுகாப்பு விதி: நீங்கள் உங்கள் சொந்த பங்கை மாற்ற முடியாது.' : 'Security Rule: You cannot modify your own administrative role.');
      return;
    }
    const confirmed = window.confirm(
      isTamil
        ? `"${targetUser.full_name}" என்பவரின் பங்கை "${newRole}" ஆக மாற்ற விரும்புகிறீர்களா?`
        : `Are you sure you want to change the role of "${targetUser.full_name}" to "${newRole}"?`
    );
    if (!confirmed) return;

    setUserList((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );
    setRoleChangeNotice(
      isTamil
        ? `"${targetUser.full_name}" பங்கு வெற்றிகரமாக "${newRole}" ஆக புதுப்பிக்கப்பட்டது (முன்னோட்டம்).`
        : `Role for "${targetUser.full_name}" updated to "${newRole}" (Preview).`
    );
    setTimeout(() => setRoleChangeNotice(null), 4000);
  };

  const filteredUsers = userList.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
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
      <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem', borderLeft: '4px solid var(--cyan-700)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--cyan-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="var(--cyan-700)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: 'var(--navy-900)' }}>
              {t?.placeholders?.adminUsersTitle || (isTamil ? 'பயனர்கள் & பங்கு மேலாண்மை' : 'User Directory & Role Management')}
            </h1>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {t?.placeholders?.adminUsersDesc || (isTamil ? 'தளத்தின் மாணவர்கள், வழிகாட்டிகள் மற்றும் நிர்வாகிகளின் கணக்குகளைப் பாதுகாப்பாக நிர்வகிக்கவும்.' : 'Search platform users and manage access roles securely.')}
            </p>
          </div>
        </div>

        {/* Strict Student Privacy Banner */}
        <div style={{ marginTop: '1rem', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Lock size={16} color="var(--navy-900)" />
          <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <strong>{isTamil ? 'மாணவர் தனியுரிமை கொள்கை:' : 'Student Privacy Guard:'}</strong>{' '}
            {isTamil
              ? 'மாணவர்களின் கைபேசி எண், சமூகப் பிரிவு, மதிப்பெண்கள் அல்லது வருமான விவரங்கள் ஒருபோதும் இங்கு காட்சிப்படுத்தப்படாது.'
              : 'Students’ phone numbers, community category, academic marks, and family income are strictly confidential and never displayed in this directory.'}
          </span>
        </div>
      </div>

      {roleChangeNotice && (
        <div className="modal-alert-success" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
          <CheckCircle2 size={18} />
          <span>{roleChangeNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'student', 'mentor', 'admin'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`filter-pill-btn ${roleFilter === role ? 'active' : ''}`}
            >
              <span>{role === 'all' ? (isTamil ? 'அனைத்தும்' : 'All') : role.toUpperCase()}</span>
              <span className="count-badge">
                {role === 'all' ? userList.length : userList.filter((u) => u.role === role).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={isTamil ? 'பெயர் அல்லது மின்னஞ்சல் தேடுக...' : 'Search by name or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="card" style={{ padding: '0', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)', color: 'var(--navy-900)' }}>
              <th style={{ padding: '1rem 1.25rem' }}>{isTamil ? 'பயனர் பெயர்' : 'User'}</th>
              <th style={{ padding: '1rem 1.25rem' }}>{isTamil ? 'மின்னஞ்சல்' : 'Email'}</th>
              <th style={{ padding: '1rem 1.25rem' }}>{isTamil ? 'தற்போதைய பங்கு' : 'Role'}</th>
              <th style={{ padding: '1rem 1.25rem' }}>{isTamil ? 'சேர்ந்த தேதி' : 'Joined Date'}</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>{isTamil ? 'பங்கு மாற்றம்' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="user-avatar" style={{ width: '34px', height: '34px', fontSize: '0.85rem' }}>
                      {u.full_name.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--navy-900)', display: 'block' }}>{u.full_name}</strong>
                      {u.isCurrentCaller && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--cyan-700)', fontWeight: 600 }}>
                          ({isTamil ? 'நீங்கள்' : 'Current Session'})
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                  {u.email}
                </td>

                <td style={{ padding: '1rem 1.25rem' }}>
                  <span className={`role-pill role-${u.role}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>

                <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)' }}>
                  {u.created_at}
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  {u.isCurrentCaller ? (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {isTamil ? 'மாற்ற முடியாது' : 'Locked (Self)'}
                    </span>
                  ) : (
                    <select
                      className="form-select"
                      style={{ maxWidth: '140px', padding: '0.35rem 0.65rem', fontSize: '0.82rem' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsersPage;
