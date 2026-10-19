import { Sun, Moon, Languages, LogOut, LayoutDashboard, Plus } from 'lucide-react';
import { cx } from '../lib/cx.js';
import { Icon } from '../lib/icons.jsx';
import { Avatar } from './Avatar.jsx';
import { Button } from './Button.jsx';

/**
 * The TaskFlow mark ("Board"): four leaf tiles, one saffron. The login TileBoard in miniature:
 * the team's tasks in order, one waiting for you. Never mirrored, never recoloured, min 16px.
 */
export function Logo({ withWord = true, size = 28, className }) {
  return (
    <span className={cx('inline-flex items-center gap-2', className)} dir="ltr">
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" className="shrink-0">
        <path className="fill-primary" d="M6 0H12a2 2 0 0 1 2 2V8a6 6 0 0 1-6 6H2a2 2 0 0 1-2-2V6a6 6 0 0 1 6-6Z" />
        <path className="fill-accent" d="M24 0H30a2 2 0 0 1 2 2V8a6 6 0 0 1-6 6H20a2 2 0 0 1-2-2V6a6 6 0 0 1 6-6Z" />
        <path className="fill-primary" d="M6 18H12a2 2 0 0 1 2 2V26a6 6 0 0 1-6 6H2a2 2 0 0 1-2-2V24a6 6 0 0 1 6-6Z" />
        <path className="fill-primary" d="M24 18H30a2 2 0 0 1 2 2V26a6 6 0 0 1-6 6H20a2 2 0 0 1-2-2V24a6 6 0 0 1 6-6Z" />
      </svg>
      {withWord && <span className="font-display text-subheading font-semibold text-fg">TaskFlow</span>}
    </span>
  );
}

// #region classes
export const navbarClasses = {
  root: 'sticky top-0 z-40 border-b border-subtle bg-surface',
  inner: 'mx-auto flex h-16 max-w-page items-center gap-2 px-4 md:gap-4 md:px-6 lg:px-8',
  link:
    'inline-flex h-touch items-center gap-2 rounded-leaf-sm px-3 text-label font-medium text-fg-muted transition-colors duration-fast ' +
    'hover:bg-surface-hover hover:text-fg focus-ring md:h-control aria-[current=page]:bg-primary-soft aria-[current=page]:text-fg-primary',
  tool:
    'inline-flex size-touch items-center justify-center gap-2 rounded-leaf-sm text-fg-muted transition-colors duration-fast ' +
    'hover:bg-surface-hover hover:text-fg focus-ring md:size-control',
  langTool: 'w-auto px-3 text-label font-medium md:w-auto',
};
// #endregion

export function ThemeSwitch({ theme, onToggle, lang = 'en' }) {
  const next = theme === 'dark' ? 'light' : 'dark';
  const label = lang === 'ar' ? (next === 'dark' ? 'التبديل إلى الوضع الداكن' : 'التبديل إلى الوضع الفاتح') : `Switch to ${next} theme`;
  return (
    <button type="button" className={navbarClasses.tool} onClick={onToggle} aria-label={label} title={label}>
      <Icon icon={theme === 'dark' ? Sun : Moon} size={20} />
    </button>
  );
}

/** Shows the OTHER language in its own script, tagged with its own lang/dir. */
export function LanguageSwitch({ lang = 'en', onToggle }) {
  const other = lang === 'ar' ? { code: 'en', label: 'English' } : { code: 'ar', label: 'العربية' };
  return (
    <button type="button" className={cx(navbarClasses.tool, navbarClasses.langTool)} onClick={onToggle}
      aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}>
      <Icon icon={Languages} size={20} />
      <span lang={other.code} dir={other.code === 'ar' ? 'rtl' : 'ltr'} className="hidden sm:inline">{other.label}</span>
    </button>
  );
}

export function Navbar({ lang = 'en', theme = 'light', onTheme, onLang, user = 'Sara Haddad', current = 'dashboard', onNewProject }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <header className={navbarClasses.root}>
      <nav className={navbarClasses.inner} aria-label={t('Main', 'الرئيسية')}>
        <a href="#" className="me-2 rounded-leaf-sm focus-ring" aria-label="TaskFlow">
          <Logo withWord />
        </a>
        <a href="#" className={cx(navbarClasses.link, 'max-md:hidden')} aria-current={current === 'dashboard' ? 'page' : undefined}>
          <Icon icon={LayoutDashboard} size={16} />
          {t('Dashboard', 'لوحة التحكم')}
        </a>
        <div className="ms-auto flex items-center gap-1 md:gap-2">
          {onNewProject && (
            <Button size="md" icon={Plus} onClick={onNewProject} className="max-sm:hidden">{t('New project', 'مشروع جديد')}</Button>
          )}
          <LanguageSwitch lang={lang} onToggle={onLang} />
          <ThemeSwitch theme={theme} lang={lang} onToggle={onTheme} />
          <span className="mx-1 hidden h-6 border-s border-subtle md:block" aria-hidden="true" />
          <span className="hidden items-center gap-2 lg:inline-flex">
            <Avatar name={user} size="md" />
            <span className="text-label font-medium text-fg">{user}</span>
          </span>
          <button type="button" className={navbarClasses.tool} aria-label={t('Log out', 'تسجيل الخروج')} title={t('Log out', 'تسجيل الخروج')}>
            <Icon icon={LogOut} size={20} mirror />
          </button>
        </div>
      </nav>
    </header>
  );
}
