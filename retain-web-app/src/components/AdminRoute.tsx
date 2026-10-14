import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// sits inside ProtectedRoute, so the user is already logged in here
export default function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
