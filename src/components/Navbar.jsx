
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
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
  GraduationCap
} from 'lucide-react';

export function Navbar() {
  const { lang, toggleLanguage } = useLanguage();
  const { user, profile, userRole, signOut } = useAuth();

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
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/dashboard/admin';
    if (userRole === 'mentor') return '/dashboard/mentor';
    return '/dashboard/student';
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'active' : ''}`;

  const mobileLinkClass = ({ isActive }) =>
    `mobile-nav-item ${isActive ? 'active' : ''}`;

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">

        {/* Brand */}
        <Link
          to="/"
          className="brand-logo"
          onClick={closeMenus}
        >
          <div className="brand-icon">
            <GraduationCap size={22} color="#FFFFFF" />
          </div>

          <div className="brand-text">
            <div className="brand-name">
              EEE<span className="brand-highlight">-TN</span>
            </div>

            <div className="brand-sub">
              {labels.brandSubtitle}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="desktop-nav"
          aria-label="Main Navigation"
        >
          <NavLink
            to="/"
            end
            className={navLinkClass}
          >
            {labels.home}
          </NavLink>

          <NavLink
            to="/opportunities"
            className={navLinkClass}
          >
            <Compass size={16} />
            <span>{labels.opportunities}</span>
          </NavLink>

          <NavLink
            to="/sessions"
            className={navLinkClass}
          >
            <Calendar size={16} />
            <span>{labels.sessions}</span>
          </NavLink>

          <NavLink
            to="/achievements"
            className={navLinkClass}
          >
            <Award size={16} />
            <span>{labels.achievements}</span>
          </NavLink>
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
                <div className="user-avatar">
                  {profile?.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : 'U'}
                </div>

                <div className="user-meta desktop-only">
                  <span className="user-name">
                    {profile?.full_name
                      ? profile.full_name.split(' ')[0]
                      : 'User'}
                  </span>

                  <span className={`role-badge role-${userRole || 'student'}`}>
                    {userRole || 'student'}
                  </span>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-user-name">
                      {profile?.full_name || 'Student'}
                    </p>

                    <p className="dropdown-user-email">
                      {profile?.email || user.email}
                    </p>

                    <span className={`role-pill role-${userRole || 'student'}`}>
                      {(userRole || 'student').toUpperCase()}
                    </span>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to={getDashboardPath()}
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    <LayoutDashboard size={16} />
                    <span>{labels.dashboard}</span>
                  </Link>

                  <Link
                    to="/achievements"
                    className="dropdown-item"
                    onClick={closeMenus}
                  >
                    <Award size={16} />
                    <span>{labels.myAchievements}</span>
                  </Link>

                  {userRole === 'admin' && (
                    <Link
                      to="/dashboard/admin"
                      className="dropdown-item"
                      onClick={closeMenus}
                    >
                      <ShieldCheck size={16} />
                      <span>{labels.admin}</span>
                    </Link>
                  )}

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
            <Link
              to="/login"
              className="btn btn-sm btn-primary login-btn"
            >
              <LogIn size={15} />
              <span>{labels.signIn}</span>
            </Link>
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
            <NavLink
              to="/"
              end
              className={mobileLinkClass}
              onClick={closeMenus}
            >
              {labels.home}
            </NavLink>

            <NavLink
              to="/opportunities"
              className={mobileLinkClass}
              onClick={closeMenus}
            >
              <Compass size={18} />
              <span>
                {isTamil
                  ? 'படிப்பு & உதவித்தொகை'
                  : 'Opportunities & Scholarships'}
              </span>
            </NavLink>

            <NavLink
              to="/sessions"
              className={mobileLinkClass}
              onClick={closeMenus}
            >
              <Calendar size={18} />
              <span>
                {isTamil ? 'வழிகாட்டல் அமர்வுகள்' : 'Mentor Sessions'}
              </span>
            </NavLink>

            <NavLink
              to="/achievements"
              className={mobileLinkClass}
              onClick={closeMenus}
            >
              <Award size={18} />
              <span>{labels.achievements}</span>
            </NavLink>

            {user && (
              <NavLink
                to={getDashboardPath()}
                className={mobileLinkClass}
                onClick={closeMenus}
              >
                <LayoutDashboard size={18} />
                <span>{labels.dashboard}</span>
              </NavLink>
            )}
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
            ) : (
              <Link
                to="/login"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={closeMenus}
              >
                <LogIn size={16} />
                <span>
                  {isTamil ? 'Google மூலம் உள்நுழைய' : 'Sign in with Google'}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
