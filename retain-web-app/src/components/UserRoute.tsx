import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// personal pages are for normal users, admins go to their own overview
export default function UserRoute() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;

  return <Outlet />;
}
