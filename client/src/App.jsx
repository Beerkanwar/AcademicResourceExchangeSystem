import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import UploadResourcePage from './pages/resources/UploadResourcePage';
import BrowseResourcesPage from './pages/resources/BrowseResourcesPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import BookmarksPage from './pages/bookmarks/BookmarksPage';
import VerificationQueuePage from './pages/admin/VerificationQueuePage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — all authenticated users */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Auth pages */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
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

        {/* Stub pages — will be implemented in later phases */}
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <BrowseResourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:id"
          element={
            <ProtectedRoute>
              <ResourceDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={<Navigate to="/resources" replace />}
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadResourcePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <VerificationQueuePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
