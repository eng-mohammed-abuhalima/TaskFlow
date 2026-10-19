import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { logoutUser } from '../services/users.js';

/** Shell for every signed-in page: Navbar on top, the page below. */
export function AppLayout() {
  const { user } = useAuth();
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div className="min-h-dvh">
      <Navbar
        lang={lang}
        theme={theme}
        onLang={toggleLang}
        onTheme={toggleTheme}
        user={user.displayName || user.email}
        current={pathname === '/dashboard' ? 'dashboard' : undefined}
        onNewProject={() => navigate('/projects/new')}
        // ProtectedRoute sends us to /login once the session ends.
        onLogout={() => logoutUser()}
      />
      <Outlet />
    </div>
  );
}
