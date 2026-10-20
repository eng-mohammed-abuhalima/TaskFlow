import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { DirectionProvider } from '@radix-ui/react-direction';
import { usePrefs } from './context/PreferencesContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/routing/ProtectedRoute.jsx';
import { PublicOnlyRoute } from './components/routing/PublicOnlyRoute.jsx';
import { FullPageLoading } from './components/routing/FullPageLoading.jsx';
import { AppLayout } from './components/AppLayout.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NewProject from './pages/NewProject.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import ProjectSettings from './pages/ProjectSettings.jsx';
import NotFound from './pages/NotFound.jsx';

// Remount the page when :id changes, so the previous project never flashes while the next one loads.
function KeyedById({ page: Page }) {
  const { id } = useParams();
  return <Page key={id} />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoading />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  const { dir } = usePrefs();
  const { pathname } = useLocation();
  return (
    <DirectionProvider dir={dir}>
      {/* resetKey: moving to another page clears a crash, so one broken page doesn't block the rest */}
      <ErrorBoundary resetKey={pathname}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/new" element={<NewProject />} />
            <Route path="/projects/:id" element={<KeyedById page={ProjectDetails} />} />
            <Route path="/projects/:id/settings" element={<KeyedById page={ProjectSettings} />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </ErrorBoundary>
    </DirectionProvider>
  );
}
