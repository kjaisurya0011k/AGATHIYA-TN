
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Compass,
  Calendar,
  Award,
  Globe,
  LogIn,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  PlusCircle,
  Clock,
  Users
} from 'lucide-react';
import { BrandIdentity } from './BrandIdentity';
import { UserAvatar } from './UserAvatar';

export function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, profile, userRole, signOut, signInWithGoogle } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const isTamil = lang === 'ta';

  const labels = {
    home: isTamil ? 'முகப்பு' : 'Home',
    opportunities: isTamil ? 'வாய்ப்புகள்' : 'Opportunities',
    sessions: isTamil ? 'வழிகாட்டல்' : 'Sessions',
    achievements: isTamil ? 'சாதனைகள்' : 'Achievements',
    dashboard: isTamil ? 'டாஷ்போர்டு' : 'My Dashboard',
    myAchievements: isTamil ? 'என் சாதனைகள்' : 'My Achievements',
    admin: isTamil ? 'நிர்வாகம்' : 'Admin Panel',
    signIn: isTamil ? 'உள்நுழைய' : 'Sign In',
    signOut: isTamil ? 'வெளியேற' : 'Sign Out',
    switchLanguage: isTamil ? 'English' : 'தமிழ்',
    brandSubtitle: isTamil ? 'கல்வி வழிகாட்டி' : 'Higher Ed Guidance'
  };

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'mentor') return '/mentor';
    return '/home';
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  const mobileLinkClass = ({ isActive }) =>
    `mobile-nav-item ${isActive ? 'active' : ''}`;

  const renderNavLinks = (isMobile = false) => {
    const linkClass = isMobile ? mobileLinkClass : navLinkClass;
    const iconSize = isMobile ? 18 : 16;

    if (userRole === 'mentor') {
      return (
        <>
          <NavLink to="/mentor" end className={linkClass} onClick={closeMenus}>
            <LayoutDashboard size={iconSize} />
            <span>{t?.roleNav?.dashboard || 'Dashboard'}</span>
          </NavLink>
          <NavLink to="/mentor/sessions" className={linkClass} onClick={closeMenus}>
            <Calendar size={iconSize} />
            <span>{t?.roleNav?.mySessions || 'My Sessions'}</span>
          </NavLink>
          <NavLink to="/mentor/sessions/new" className={linkClass} onClick={closeMenus}>
            <PlusCircle size={iconSize} />
            <span>{t?.roleNav?.createSession || 'Create Session'}</span>
          </NavLink>
          <NavLink to="/achievements" className={linkClass} onClick={closeMenus}>
            <Award size={iconSize} />
            <span>{t?.roleNav?.achievements || 'Achievements'}</span>
          </NavLink>
        </>
      );
    }

    if (userRole === 'admin') {
      return (
        <>
          <NavLink to="/admin" end className={linkClass} onClick={closeMenus}>
            <LayoutDashboard size={iconSize} />
            <span>{t?.roleNav?.dashboard || 'Dashboard'}</span>
          </NavLink>
          <NavLink to="/admin/sessions" className={linkClass} onClick={closeMenus}>
            <Clock size={iconSize} />
            <span>{t?.roleNav?.sessionsReview || 'Sessions Review'}</span>
          </NavLink>
          <NavLink to="/admin/achievements" className={linkClass} onClick={closeMenus}>
            <Award size={iconSize} />
            <span>{t?.roleNav?.adminAchievements || 'Achievements'}</span>
          </NavLink>
          <NavLink to="/opportunities" className={linkClass} onClick={closeMenus}>
            <Compass size={iconSize} />
            <span>{t?.roleNav?.opportunities || 'Opportunities'}</span>
          </NavLink>
          <NavLink to="/admin/users" className={linkClass} onClick={closeMenus}>
            <Users size={iconSize} />
            <span>{t?.roleNav?.users || 'Users'}</span>
          </NavLink>
        </>
      );
    }

    // Default: Student or Guest
    return (
      <>
        <NavLink to="/home" className={linkClass} onClick={closeMenus}>
          <Home size={iconSize} />
          <span>{t?.roleNav?.home || 'Home'}</span>
        </NavLink>
        <NavLink to="/opportunities" className={linkClass} onClick={closeMenus}>
          <Compass size={iconSize} />
          <span>{t?.roleNav?.opportunities || 'Opportunities'}</span>
        </NavLink>
        <NavLink to="/sessions" className={linkClass} onClick={closeMenus}>
          <Calendar size={iconSize} />
          <span>{t?.roleNav?.sessions || 'Sessions'}</span>
        </NavLink>
        <NavLink to="/achievements" className={linkClass} onClick={closeMenus}>
          <Award size={iconSize} />
          <span>{t?.roleNav?.achievements || 'Achievements'}</span>
        </NavLink>
      </>
    );
  };

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">

        {/* Brand */}
        <Link
          to={user ? getDashboardPath() : "/login"}
          className="brand-logo"
          onClick={closeMenus}
        >
          <div className="brand-icon">
            <GraduationCap size={22} color="#FFFFFF" />
          </div>

          <BrandIdentity variant="header" />
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          {renderNavLinks(false)}
        </nav>

        {/* Language and User Actions */}
        <div className="navbar-actions">

          <button
            type="button"
            onClick={toggleLanguage}
            className="lang-toggle-btn"
            title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
            aria-label="Toggle language"
          >
            <Globe size={15} />
            <span className="lang-text">
              {labels.switchLanguage}
            </span>
          </button>

          {user ? (
            <div className="user-menu-container">
              <button
                type="button"
                onClick={() =>
                  setUserDropdownOpen(!userDropdownOpen)
                }
                className="user-profile-trigger"
                aria-expanded={userDropdownOpen}
              >
                <UserAvatar
                  name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                  avatarPath={profile?.avatar_path}
                  avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                  avatarUpdatedAt={profile?.avatar_updated_at}
                  role={userRole}
                  size={34}
                />

                <div className="user-meta desktop-only">
                  <span className="user-name">
                    {profile?.full_name
                      ? profile.full_name.split(' ')[0]
                      : (user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User')}
                  </span>

                  <span className={`role-badge role-${userRole || 'student'}`}>
                    {userRole || 'student'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.45rem', padding: '1rem' }}>
                    <UserAvatar
                      name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                      avatarPath={profile?.avatar_path}
                      avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                      avatarUpdatedAt={profile?.avatar_updated_at}
                      role={userRole}
                      size={52}
                      fontSize="1.1rem"
                    />
                    <div>
                      <p className="dropdown-user-name" style={{ margin: 0, fontWeight: 700 }}>
                        {profile?.full_name || 'Student'}
                      </p>
                      <p className="dropdown-user-email" style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                        {profile?.email || user.email}
                      </p>
                    </div>
                    <span className={`role-pill role-${userRole || 'student'}`} style={{ marginTop: '0.2rem' }}>
                      {(userRole || 'student').toUpperCase()}
                    </span>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    <UserCheck size={16} />
                    <span>{t?.roleNav?.myProfile || (isTamil ? 'என் சுயவிவரம்' : 'My Profile')}</span>
                  </Link>

                  <Link
                    to={getDashboardPath()}
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    <LayoutDashboard size={16} />
                    <span>{t?.roleNav?.dashboard || (isTamil ? 'டாஷ்போர்டு' : 'Dashboard')}</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="dropdown-item dropdown-logout"
                  >
                    <LogOut size={16} />
                    <span>{labels.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="btn btn-sm btn-primary login-btn"
              aria-label={labels.signIn}
              title={labels.signIn}
            >
              <LogIn size={15} />
              <span className="login-btn-text">{labels.signIn}</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen
              ? <X size={22} />
              : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="mobile-nav-links">
            {renderNavLinks(true)}
          </div>

          <div className="mobile-drawer-footer">
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                closeMenus();
              }}
              className="btn btn-outline"
              style={{
                width: '100%',
                marginBottom: '0.75rem'
              }}
            >
              <Globe size={16} />
              <span>
                {isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
              </span>
            </button>

            {user ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', marginBottom: '0.85rem', border: '1px solid #e2e8f0' }}>
                  <UserAvatar
                    name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                    avatarPath={profile?.avatar_path}
                    avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                    avatarUpdatedAt={profile?.avatar_updated_at}
                    role={userRole}
                    size={38}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--navy-900)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {profile?.full_name || 'Student'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {profile?.email || user.email}
                    </div>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="btn btn-primary"
                  style={{ width: '100%', marginBottom: '0.65rem' }}
                  onClick={closeMenus}
                >
                  <UserCheck size={16} />
                  <span>{isTamil ? 'என் சுயவிவரம்' : 'My Profile'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    color: '#dc2626',
                    borderColor: '#fca5a5'
                  }}
                >
                  <LogOut size={16} />
                  <span>{labels.signOut}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeMenus();
                  signInWithGoogle();
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <LogIn size={16} />
                <span>
                  {isTamil ? 'Google மூலம் உள்நுழைய' : 'Sign in with Google'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
