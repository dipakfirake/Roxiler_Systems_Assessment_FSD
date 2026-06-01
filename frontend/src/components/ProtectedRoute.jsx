import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on their role
    const roleRedirects = {
      admin: '/admin/dashboard',
      user: '/stores',
      store_owner: '/store-owner/dashboard',
    };
    const redirectTo = roleRedirects[user.role] || '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
