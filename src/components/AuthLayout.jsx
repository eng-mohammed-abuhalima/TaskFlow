import { CircleAlert } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { Logo, LanguageSwitch, ThemeSwitch } from './Navbar.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/*
  Shared by Sign in and Create account (from docs/components/src/screens/Login.jsx).
  lg+: brand panel at the start, form at the end. Below lg: header + form.
  TileBoard animation is deferred (see docs/ROADMAP.md, phase 11).
*/
// #region classes
export const authClasses = {
  root: 'grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]',
  panel: 'relative hidden overflow-hidden bg-brand-panel text-on-brand-panel lg:flex lg:flex-col lg:justify-end lg:p-12',
  main: 'flex min-w-0 flex-col px-4 py-5 md:px-10 md:py-8',
  header: 'flex items-center justify-between gap-2',
  body: 'mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 py-8 md:max-w-md lg:max-w-sm lg:py-10',
  form:
    'flex flex-col gap-6 md:rounded-leaf md:border md:border-subtle md:bg-surface md:p-8 md:shadow-card ' +
    'lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none',
  title: 'font-display text-title font-semibold text-fg',
  lead: 'text-body text-fg-muted',
  alert: 'flex items-start gap-2.5 rounded-leaf-sm border border-danger/50 bg-danger-soft p-3 text-body-sm text-danger-fg',
  switch: 'text-center text-body-sm text-fg-muted',
  link: 'rounded-tight font-medium text-fg-primary underline decoration-1 underline-offset-4 hover:decoration-2 focus-ring',
};
// #endregion

export function AuthLayout({ tagline: [head, sub], children }) {
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  return (
    <div className={authClasses.root}>
      <aside className={authClasses.panel} aria-hidden="true">
        <div className="max-w-sm">
          <p className="font-display text-title font-semibold">{head}</p>
          <p className="mt-3 text-body opacity-85">{sub}</p>
        </div>
      </aside>
      <main className={authClasses.main}>
        <div className={authClasses.header}>
          <Logo />
          <div className="flex items-center gap-1">
            <LanguageSwitch lang={lang} onToggle={toggleLang} />
            <ThemeSwitch theme={theme} lang={lang} onToggle={toggleTheme} />
          </div>
        </div>
        <div className={authClasses.body}>
          <div className={authClasses.form}>{children}</div>
        </div>
      </main>
    </div>
  );
}

export function AuthAlert({ children }) {
  return (
    <div role="alert" className={authClasses.alert}>
      <Icon icon={CircleAlert} size={20} />
      <p>{children}</p>
    </div>
  );
}
