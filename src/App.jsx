import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { SessionsPage } from './pages/SessionsPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { MentorDashboard } from './pages/MentorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthCallback } from './pages/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';

export function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Connected Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />
          <Route path="/sessions" element={<SessionsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

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

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
