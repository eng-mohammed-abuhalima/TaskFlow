import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FullPageLoading } from './FullPageLoading.jsx';

/** Signed-out visitors go to /login, remembering where they were heading (unless they just logged out). */
export function ProtectedRoute() {
  const { user, loading, loggedOut } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoading />;
  if (!user) return <Navigate to="/login" replace state={loggedOut ? undefined : { from: location }} />;
  return <Outlet />;
}
