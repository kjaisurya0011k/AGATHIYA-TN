import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Globe,
  LogIn,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  UserCheck,
  Calendar,
  Award,
  Compass,
  Clock,
  PlusCircle,
  Home,
  Headphones
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { brand } from '../data/brand';
import './Navbar.css';

export function Navbar() {
  const { lang, toggleLanguage, t } = useLanguage();
  const { user, profile, userRole, signOut } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const isTamil = lang === 'ta';

  const labels = {
    home: isTamil ? 'முகப்பு' : 'Home',
    opportunities: isTamil ? 'வாய்ப்புகள்' : 'Opportunities',
    sessions: isTamil ? 'வழிகாட்டல்' : 'Sessions',
    achievements: isTamil ? 'சாதனைகள்' : 'Achievements',
    support: isTamil ? 'உதவி மையம்' : 'Support',
    dashboard: isTamil ? 'டாஷ்போர்டு' : 'Dashboard',
    login: isTamil ? 'உள்நுழைக' : 'Login',
    register: isTamil ? 'தொடங்குக' : 'Get Started',
    signOut: isTamil ? 'வெளியேற' : 'Sign Out',
    myProfile: isTamil ? 'என் சுயவிவரம்' : 'My Profile',
    navbarSubtitle: isTamil ? 'கல்வி பரிணாமம் மற்றும் அதிகாரம்' : 'EDUCATION EVOLUTION AND EMPOWERMENT',
    fullBrandName: t?.brandFullName || t?.siteFullName || 'Education Evolution and Empowerment'
  };

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Close drawer on Escape key and lock body scroll
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMenus();
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'mentor') return '/mentor';
    return '/home';
  };

  return (
    <header className="navbar-header-root">
      <div className="navbar-container">
        {/* Brand Logo & Name Matching Reference Design */}
        <Link
          to="/"
          className="navbar-brand-pill"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            closeMenus();
          }}
        >
          {!logoError && (
            <img
              src={brand.logo}
              alt="AGATHIYA — Where Learning Evolves."
              className="navbar-brand-logo-img"
              onError={() => setLogoError(true)}
            />
          )}
          <div className="brand-name-group">
            <span className="brand-primary-text">{brand.name}</span>
            {brand.tagline ? (
              <span className="brand-tagline-text" title={brand.tagline}>
                {brand.tagline}
              </span>
            ) : null}
          </div>
        </Link>

        {/* Center Pill Navigation Links */}
        <nav className="navbar-nav-center" aria-label="Main Navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <span>{labels.home}</span>
          </NavLink>

          <NavLink
            to="/opportunities"
            className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <span>{labels.opportunities}</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <span>{labels.sessions}</span>
          </NavLink>

          <NavLink
            to="/achievements"
            className={({ isActive }) => `nav-pill-item ${isActive ? 'active' : ''}`}
            onClick={closeMenus}
          >
            <span>{labels.achievements}</span>
          </NavLink>
        </nav>

        {/* Right Section: Language Toggle & Auth Controls */}
        <div className="navbar-actions-right">
          {/* Language Toggle Pill: • தமிழ் / • English */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="navbar-lang-pill-btn"
            title={isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}
            aria-label="Toggle language"
          >
            <span className="lang-dot-indicator" aria-hidden="true" />
            <span className="lang-label-text">{isTamil ? 'English' : 'தமிழ்'}</span>
          </button>

          {/* User Authenticated: User Pill Button & Dropdown */}
          {user ? (
            <div className="navbar-user-menu-wrapper">
              <button
                type="button"
                className="navbar-user-pill-btn"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <UserAvatar
                  name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                  avatarPath={profile?.avatar_path}
                  avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                  avatarUpdatedAt={profile?.avatar_updated_at}
                  role={userRole}
                  size={32}
                />
                <span className="user-pill-name">
                  {profile?.full_name
                    ? profile.full_name.split(' ')[0]
                    : (user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'User')}
                </span>
                <span className={`user-role-badge badge-role-${userRole || 'student'}`}>
                  {(userRole || 'student').toUpperCase()}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="navbar-dropdown-panel" role="menu">
                  <div className="dropdown-user-header">
                    <UserAvatar
                      name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                      avatarPath={profile?.avatar_path}
                      avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                      avatarUpdatedAt={profile?.avatar_updated_at}
                      role={userRole}
                      size={48}
                      fontSize="1.1rem"
                    />
                    <div className="dropdown-user-info">
                      <p className="dropdown-name">{profile?.full_name || 'Student'}</p>
                      <p className="dropdown-email">{profile?.email || user.email}</p>
                      <span className={`user-role-badge badge-role-${userRole || 'student'}`}>
                        {(userRole || 'student').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to={getDashboardPath()}
                    className="dropdown-menu-item"
                    onClick={closeMenus}
                    role="menuitem"
                  >
                    <LayoutDashboard size={16} />
                    <span>{labels.dashboard}</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="dropdown-menu-item"
                    onClick={closeMenus}
                    role="menuitem"
                  >
                    <UserCheck size={16} />
                    <span>{labels.myProfile}</span>
                  </Link>

                  <Link
                    to="/contact"
                    className="dropdown-menu-item"
                    onClick={closeMenus}
                    role="menuitem"
                  >
                    <Headphones size={16} />
                    <span>{labels.support}</span>
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="dropdown-menu-item dropdown-logout-btn"
                    role="menuitem"
                  >
                    <LogOut size={16} />
                    <span>{labels.signOut}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Signed Out: Single Combined Pill CTA Button */
            <div className="navbar-auth-group">
              <Link to="/register" className="btn-nav-combined-cta" onClick={closeMenus}>
                <span className="btn-nav-cta-text">{labels.register}</span>
                <span className="btn-nav-cta-slide" aria-hidden="true" />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="navbar-mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div
          className="navbar-mobile-backdrop"
          onClick={closeMenus}
          role="presentation"
        >
          <div
            className="navbar-mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-drawer-header">
              <div className="mobile-drawer-brand">
                {!logoError && (
                  <img
                    src={brand.logo}
                    alt="AGATHIYA — Where Learning Evolves."
                    className="mobile-drawer-logo-img"
                    onError={() => setLogoError(true)}
                  />
                )}
                <span className="brand-primary-text" style={{ fontSize: '1.25rem' }}>{brand.name}</span>
              </div>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={closeMenus}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-nav-pill-list">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `mobile-pill-link ${isActive ? 'active' : ''}`}
                onClick={closeMenus}
              >
                <Home size={18} />
                <span>{labels.home}</span>
              </NavLink>

              <NavLink
                to="/opportunities"
                className={({ isActive }) => `mobile-pill-link ${isActive ? 'active' : ''}`}
                onClick={closeMenus}
              >
                <Compass size={18} />
                <span>{labels.opportunities}</span>
              </NavLink>

              <NavLink
                to="/sessions"
                className={({ isActive }) => `mobile-pill-link ${isActive ? 'active' : ''}`}
                onClick={closeMenus}
              >
                <Calendar size={18} />
                <span>{labels.sessions}</span>
              </NavLink>

              <NavLink
                to="/achievements"
                className={({ isActive }) => `mobile-pill-link ${isActive ? 'active' : ''}`}
                onClick={closeMenus}
              >
                <Award size={18} />
                <span>{labels.achievements}</span>
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) => `mobile-pill-link ${isActive ? 'active' : ''}`}
                onClick={closeMenus}
              >
                <Headphones size={18} />
                <span>{labels.support}</span>
              </NavLink>
            </div>

            <div className="mobile-drawer-footer">
              <button
                type="button"
                onClick={() => {
                  toggleLanguage();
                  closeMenus();
                }}
                className="mobile-lang-btn"
              >
                <Globe size={16} />
                <span>{isTamil ? 'Switch to English' : 'தமிழுக்கு மாறவும்'}</span>
              </button>

              {user ? (
                <div className="mobile-user-actions">
                  <div className="mobile-user-info-card">
                    <UserAvatar
                      name={profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User'}
                      avatarPath={profile?.avatar_path}
                      avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url}
                      avatarUpdatedAt={profile?.avatar_updated_at}
                      role={userRole}
                      size={38}
                    />
                    <div>
                      <strong className="mobile-user-name">{profile?.full_name || 'User'}</strong>
                      <span className="mobile-user-role">{(userRole || 'student').toUpperCase()}</span>
                    </div>
                  </div>

                  <Link
                    to={getDashboardPath()}
                    className="btn btn-outline"
                    style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center' }}
                    onClick={closeMenus}
                  >
                    <LayoutDashboard size={16} />
                    <span>{labels.dashboard}</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="btn btn-outline"
                    style={{ width: '100%', marginBottom: '0.5rem', justifyContent: 'center' }}
                    onClick={closeMenus}
                  >
                    <UserCheck size={16} />
                    <span>{labels.myProfile}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="btn btn-outline"
                    style={{ width: '100%', color: '#dc2626', borderColor: '#fca5a5', justifyContent: 'center' }}
                  >
                    <LogOut size={16} />
                    <span>{labels.signOut}</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <Link
                    to="/register"
                    className="btn-nav-combined-cta"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={closeMenus}
                  >
                    <span className="btn-nav-cta-text">{labels.register}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;