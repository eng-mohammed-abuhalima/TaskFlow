import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { FullPageLoading } from './FullPageLoading.jsx';

/** Login / register: a signed-in user is sent on to where they were heading (or the dashboard). */
export function PublicOnlyRoute() {
  const { user, loading, registering } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoading />;
  if (user && !registering) return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
  return <Outlet />;
}
