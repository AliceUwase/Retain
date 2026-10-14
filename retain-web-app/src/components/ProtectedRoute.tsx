import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  // remember where they were going, so login can send them back
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
