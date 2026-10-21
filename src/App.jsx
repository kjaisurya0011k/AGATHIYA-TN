
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { SessionsPage } from './pages/SessionsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthCallback } from './pages/AuthCallback';
import { ProfilePage } from './pages/ProfilePage';
import { AdminMentorsPage } from './pages/AdminMentorsPage';
import { OnboardingPage } from './pages/OnboardingPage';

import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

import { MentorSessionsPage } from './pages/mentor/MentorSessionsPage';
import { MentorCreateSessionPage } from './pages/mentor/MentorCreateSessionPage';
import { MentorEditSessionPage } from './pages/mentor/MentorEditSessionPage';

import { AdminSessionsPage } from './pages/admin/AdminSessionsPage';
import { AdminAchievementsPage } from './pages/admin/AdminAchievementsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

import { OnboardingModal } from './components/OnboardingModal';
import { FullScreenLoader } from './components/FullScreenLoader';
import { useAuth } from './context/AuthContext';

export function App() {
  const { loading } = useAuth();
  const location = useLocation();

  // Wait for the authentication session to resolve.
  if (loading) {
    return <FullScreenLoader />;
  }

  // Authentication pages use their own layout.
  const isAuthScreen = [
    '/login',
    '/register',
    '/reset-password',
  ].includes(location.pathname);

  return (
    <div className="app-shell">
      {!isAuthScreen && <Navbar />}

      <main
        className={`main-content ${isAuthScreen ? 'auth-main-content' : ''
          }`}
      >
        <Routes>
          {/* Public homepage */}
          <Route path="/" element={<HomePage />} />

          {/* Public Contact & Support */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/support" element={<Navigate to="/contact" replace />} />

          {/* Public Legal & Policy Pages */}
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/refund-policy" element={<LegalPage type="refund" />} />

          {/* Login and registration */}
          <Route
            path="/login"
            element={<LoginPage initialTab="login" />}
          />

          <Route
            path="/register"
            element={<LoginPage initialTab="signup" />}
          />

          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />

          <Route
            path="/auth/callback"
            element={<AuthCallback />}
          />

          {/* Protected student dashboard */}
          <Route
            path="/home"
            element={
              <RoleRoute allowedRoles={['student']}>
                <StudentDashboard />
              </RoleRoute>
            }
          />

          {/* Student onboarding */}
          <Route
            path="/onboarding"
            element={
              <RoleRoute allowedRoles={['student']}>
                <OnboardingPage />
              </RoleRoute>
            }
          />

          {/* Opportunities */}
          <Route
            path="/opportunities"
            element={
              <RoleRoute allowedRoles={['student', 'admin']}>
                <OpportunitiesPage />
              </RoleRoute>
            }
          />

          <Route
            path="/opportunities/:id"
            element={
              <RoleRoute allowedRoles={['student', 'admin']}>
                <OpportunityDetailPage />
              </RoleRoute>
            }
          />

          {/* Student sessions */}
          <Route
            path="/sessions"
            element={
              <RoleRoute allowedRoles={['student']}>
                <SessionsPage />
              </RoleRoute>
            }
          />

          {/* Shared achievements */}
          <Route
            path="/achievements"
            element={
              <RoleRoute allowedRoles={['student', 'mentor', 'admin']}>
                <AchievementsPage />
              </RoleRoute>
            }
          />

          {/* Shared profile */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['student', 'mentor', 'admin']}>
                <ProfilePage />
              </RoleRoute>
            }
          />

          {/* Mentor dashboard */}
          <Route
            path="/mentor"
            element={
              <RoleRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/mentor/sessions"
            element={
              <RoleRoute allowedRoles={['mentor']}>
                <MentorSessionsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/mentor/sessions/new"
            element={
              <RoleRoute allowedRoles={['mentor']}>
                <MentorCreateSessionPage />
              </RoleRoute>
            }
          />

          <Route
            path="/mentor/sessions/:id/edit"
            element={
              <RoleRoute allowedRoles={['mentor']}>
                <MentorEditSessionPage />
              </RoleRoute>
            }
          />

          {/* Admin dashboard */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/sessions"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminSessionsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/achievements"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminAchievementsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/mentors"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminMentorsPage />
              </RoleRoute>
            }
          />

          {/* Legacy dashboard redirects */}
          <Route
            path="/dashboard/student"
            element={<Navigate to="/home" replace />}
          />

          <Route
            path="/dashboard/mentor"
            element={<Navigate to="/mentor" replace />}
          />

          <Route
            path="/dashboard/admin"
            element={<Navigate to="/admin" replace />}
          />

          {/* Unknown routes return to the public homepage */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>

      {!isAuthScreen && <Footer />}

      <OnboardingModal />
    </div>
  );
}

export default App;
