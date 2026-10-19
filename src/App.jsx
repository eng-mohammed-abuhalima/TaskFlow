import { Navigate, Route, Routes } from 'react-router-dom';
import { DirectionProvider } from '@radix-ui/react-direction';
import { usePrefs } from './context/PreferencesContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/routing/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute.jsx';
import { FullPageLoading } from './components/routing/FullPageLoading.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Placeholder from './pages/Placeholder.jsx';
import NotFound from './pages/NotFound.jsx';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoading />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  const { t, dir } = usePrefs();
  return (
    <DirectionProvider dir={dir}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Placeholder title={t('Dashboard', 'لوحة التحكم')} />} />
            <Route path="/projects/new" element={<Placeholder title={t('New project', 'مشروع جديد')} />} />
            <Route path="/projects/:id" element={<Placeholder title={t('Project', 'المشروع')} />} />
            <Route path="/projects/:id/settings" element={<Placeholder title={t('Project settings', 'إعدادات المشروع')} />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DirectionProvider>
  );
}
