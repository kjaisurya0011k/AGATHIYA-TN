import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
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

  // Show full-screen loader while session is resolving to prevent any visual flash
  if (loading) {
    return <FullScreenLoader />;
  }

  // Full-page authentication routes that have their own self-contained header/layout
  const isAuthScreen = ['/', '/login', '/reset-password'].includes(location.pathname);

  return (
    <div className="app-shell">
      {!isAuthScreen && <Navbar />}

      <main className={`main-content ${isAuthScreen ? 'auth-main-content' : ''}`}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes: Student Home & Onboarding */}
          <Route
            path="/home"
            element={
              <RoleRoute allowedRoles={['student']}>
                <HomePage />
              </RoleRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <RoleRoute allowedRoles={['student']}>
                <OnboardingPage />
              </RoleRoute>
            }
          />

          {/* Student & Shared Routes */}
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

          <Route
            path="/sessions"
            element={
              <RoleRoute allowedRoles={['student']}>
                <SessionsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <RoleRoute allowedRoles={['student', 'mentor', 'admin']}>
                <AchievementsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['student', 'mentor', 'admin']}>
                <ProfilePage />
              </RoleRoute>
            }
          />

          {/* Mentor Routes */}
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

          {/* Admin Routes */}
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

          {/* Legacy Dashboard Route Redirects */}
          <Route path="/dashboard/student" element={<Navigate to="/home" replace />} />
          <Route path="/dashboard/mentor" element={<Navigate to="/mentor" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />

          {/* Catch-all: unknown routes redirect to "/" */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAuthScreen && <Footer />}
      <OnboardingModal />
    </div>
  );
}

export default App;
