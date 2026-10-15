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
import { OnboardingPage } from './pages/OnboardingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
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

          {/* Protected Routes (Require Login & Completed Onboarding) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <OpportunitiesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/opportunities/:id"
            element={
              <ProtectedRoute>
                <OpportunityDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/achievements"
            element={
              <ProtectedRoute>
                <AchievementsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Dashboards */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

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
