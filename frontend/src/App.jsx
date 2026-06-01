import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAddUser from './pages/AdminAddUser';
import UserDetails from './pages/UserDetails';
import AdminStores from './pages/AdminStores';
import AdminAddStore from './pages/AdminAddStore';
import UserStores from './pages/UserStores';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import ChangePassword from './pages/ChangePassword';

function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const roleRedirects = {
    admin: '/admin/dashboard',
    user: '/stores',
    store_owner: '/store-owner/dashboard',
  };

  return <Navigate to={roleRedirects[user.role] || '/login'} replace />;
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminUsers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/add"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminAddUser />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <UserDetails />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminStores />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores/add"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminAddStore />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route
        path="/stores"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <AppLayout>
              <UserStores />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Store Owner Routes */}
      <Route
        path="/store-owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['store_owner']}>
            <AppLayout>
              <StoreOwnerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* All authenticated users */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user', 'store_owner']}>
            <AppLayout>
              <ChangePassword />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
