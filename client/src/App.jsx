import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

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
              <PlaceholderPage title="Browse Resources" phase={6} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Search" phase={7} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Upload Resource" phase={4} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="My Bookmarks" phase={8} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher']}>
              <PlaceholderPage title="Verification Queue" phase={5} />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlaceholderPage title="User Management" phase={3} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlaceholderPage title="Departments" phase={4} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlaceholderPage title="Audit Logs" phase={5} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlaceholderPage title="Settings" phase={11} />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

// Temporary placeholder for pages not yet implemented
function PlaceholderPage({ title, phase }) {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-nitj-gold/10 mx-auto flex items-center justify-center mb-4">
          <span className="text-nitj-gold text-2xl">🚧</span>
        </div>
        <h1 className="text-2xl font-bold text-text-heading">{title}</h1>
        <p className="text-text-muted mt-2">
          This page will be implemented in <span className="font-semibold text-nitj-gold">Phase {phase}</span>
        </p>
        <div className="mt-4 inline-block bg-primary/5 rounded-lg px-4 py-2">
          <p className="text-xs text-primary font-medium">
            Skeleton route registered — ready for implementation
          </p>
        </div>
      </div>
    </div>
  );
}
