import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Award, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './StudentBottomTabBar.css';

export function StudentBottomTabBar() {
  const { user, userRole } = useAuth();
  const { lang } = useLanguage();
  const location = useLocation();

  // Only visible for logged-in students
  if (!user || (userRole && userRole !== 'student')) {
    return null;
  }

  // Hide on auth screens or onboarding
  const hiddenPaths = ['/login', '/register', '/reset-password', '/onboarding'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  const isTamil = lang === 'ta';

  const tabs = [
    {
      to: '/home',
      label: isTamil ? 'முகப்பு' : 'Home',
      icon: Home
    },
    {
      to: '/sessions',
      label: isTamil ? 'அமர்வுகள்' : 'Sessions',
      icon: Calendar
    },
    {
      to: '/achievements',
      label: isTamil ? 'சாதனைகள்' : 'Stories',
      icon: Award
    },
    {
      to: '/profile',
      label: isTamil ? 'சுயவிவரம்' : 'Profile',
      icon: User
    }
  ];

  return (
    <nav className="student-bottom-nav" aria-label="Student Mobile Navigation">
      <div className="student-bottom-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `bottom-tab-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="bottom-tab-icon-wrap">
                <Icon size={20} strokeWidth={2.2} />
              </div>
              <span className="bottom-tab-label">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default StudentBottomTabBar;
