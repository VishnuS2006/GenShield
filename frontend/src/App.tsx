import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { RoleRoute } from './routes/RoleRoute';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { SecurityAnalysisPage } from './pages/SecurityAnalysisPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ThemeToggle } from './components/common/ThemeToggle';

export const App: React.FC = () => {
  return (
    <>
      <ThemeToggle />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes inside AppLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="chat" element={<ChatbotPage />} />
          <Route
            path="analysis"
            element={
              <RoleRoute allowedRoles={['SECURITY_ANALYST', 'ADMINISTRATOR']}>
                <SecurityAnalysisPage />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="security-center" element={<Navigate to="/analysis" replace />} />
          <Route path="security" element={<Navigate to="/analysis" replace />} />
          <Route path="audit-logs" element={<Navigate to="/analysis" replace />} />
          <Route path="documents" element={<Navigate to="/analysis" replace />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
