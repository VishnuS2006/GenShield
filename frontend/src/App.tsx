import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PublicRoute } from './routes/PublicRoute';
import { RoleRoute } from './routes/RoleRoute';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ProtectedDocumentsPage } from './pages/ProtectedDocumentsPage';
import { ProfilePage } from './pages/ProfilePage';
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
          <Route index element={<Navigate to="/chat" replace />} />
          <Route path="chat" element={<ChatbotPage />} />
          <Route
            path="security-center"
            element={
              <RoleRoute allowedRoles={['SECURITY_ANALYST', 'ADMINISTRATOR']}>
                <SecurityCenterPage />
              </RoleRoute>
            }
          />
          {/* Backwards compatibility redirect */}
          <Route path="dashboard" element={<Navigate to="/security-center" replace />} />
          <Route path="security" element={<Navigate to="/security-center" replace />} />

          <Route
            path="audit-logs"
            element={
              <RoleRoute allowedRoles={['SECURITY_ANALYST', 'ADMINISTRATOR']}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />
          <Route
            path="documents"
            element={
              <RoleRoute allowedRoles={['SECURITY_ANALYST', 'ADMINISTRATOR']}>
                <ProtectedDocumentsPage />
              </RoleRoute>
            }
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 404 Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
};

export default App;
