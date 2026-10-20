import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';
import { OfflineBanner } from './OfflineBanner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/** Shell for every signed-in page: skip link, offline banner, Navbar, then the page inside <main>. */
export function AppLayout() {
  const { user, logout } = useAuth();
  const { t, lang, theme, toggleLang, toggleTheme } = usePrefs();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const lastPath = useRef(pathname);

  // After moving to another page, start at the top and put the keyboard/screen-reader position on <main>
  // (a single-page app doesn't reload, so without this focus would stay on the old link).
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-2 focus:z-50 focus:rounded-leaf-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-label focus:font-medium focus:text-on-primary focus-ring"
      >
        {t('Skip to main content', 'تخطَّ إلى المحتوى الرئيسي')}
      </a>
      <OfflineBanner />
      <Navbar
        lang={lang}
        theme={theme}
        onLang={toggleLang}
        onTheme={toggleTheme}
        user={user.displayName || user.email}
        current={pathname === '/dashboard' ? 'dashboard' : 'other'}
        onNewProject={() => navigate('/projects/new')}
        // ProtectedRoute sends us to /login once the session ends.
        onLogout={logout}
      />
      <main id="main" ref={mainRef} tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
    </div>
  );
}
