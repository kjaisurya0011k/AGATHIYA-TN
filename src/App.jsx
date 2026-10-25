
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SessionsPage } from './pages/SessionsPage';

// Lazy-loaded routes for code-splitting
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage').then(m => ({ default: m.OpportunitiesPage })));
const OpportunityDetailPage = lazy(() => import('./pages/OpportunityDetailPage').then(m => ({ default: m.OpportunityDetailPage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then(m => ({ default: m.AchievementsPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then(m => ({ default: m.StudentDashboard })));
const MentorDashboard = lazy(() => import('./pages/MentorDashboard').then(m => ({ default: m.MentorDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then(m => ({ default: m.AuthCallback })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminMentorsPage = lazy(() => import('./pages/AdminMentorsPage').then(m => ({ default: m.AdminMentorsPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then(m => ({ default: m.LegalPage })));

const MentorSessionsPage = lazy(() => import('./pages/mentor/MentorSessionsPage').then(m => ({ default: m.MentorSessionsPage })));
const MentorCreateSessionPage = lazy(() => import('./pages/mentor/MentorCreateSessionPage').then(m => ({ default: m.MentorCreateSessionPage })));
const MentorEditSessionPage = lazy(() => import('./pages/mentor/MentorEditSessionPage').then(m => ({ default: m.MentorEditSessionPage })));

const AdminSessionsPage = lazy(() => import('./pages/admin/AdminSessionsPage').then(m => ({ default: m.AdminSessionsPage })));
const AdminAchievementsPage = lazy(() => import('./pages/admin/AdminAchievementsPage').then(m => ({ default: m.AdminAchievementsPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));

import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';

import { OnboardingModal } from './components/OnboardingModal';
import { FullScreenLoader } from './components/FullScreenLoader';
import { StudentBottomTabBar } from './components/StudentBottomTabBar';
import { OfflineBanner } from './components/OfflineBanner';
import { useAuth } from './context/AuthContext';

export function App() {
  const { loading, user, userRole } = useAuth();
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

  const isStudentUser = Boolean(user && (!userRole || userRole === 'student'));

  return (
    <div className="app-shell">
      <OfflineBanner />
      {!isAuthScreen && <Navbar />}

      <main
        className={`main-content ${isAuthScreen ? 'auth-main-content' : ''} ${
          isStudentUser && !isAuthScreen ? 'has-student-bottom-bar' : ''
        }`}
      >
        <Suspense fallback={<FullScreenLoader />}>
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
            path="/admin/payments"
            element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminPaymentsPage />
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
      </Suspense>
    </main>

      {!isAuthScreen && <Footer />}

      {!isAuthScreen && <StudentBottomTabBar />}

      <OnboardingModal />
    </div>
  );
}

export default App;
