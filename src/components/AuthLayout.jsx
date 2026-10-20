import { useEffect, useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { Logo, LanguageSwitch, ThemeSwitch } from './Navbar.jsx';
import { TileBoard } from './TileBoard.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/*
  Shared by Sign in and Create account (from docs/components/src/screens/Login.jsx).
  - lg (1024+): full-height brand panel at the start (board = 4x3 tiles), form at the end.
  - below lg: header, a compact brand card (6x2 tiles over the tagline), then the form.
  Only one TileBoard is mounted at a time. The intro plays once per page load: after that,
  switching between Sign in and Create account (or logging out) shows the finished board.
*/
let introPlayed = false;
const INTRO_MS = 4000; // the intro itself takes about 3.7s

// #region classes
export const authClasses = {
  root: 'grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]',
  panel: 'relative hidden overflow-hidden bg-brand-panel text-on-brand-panel lg:flex lg:flex-col lg:justify-between lg:p-12',
  card:
    'mt-5 flex flex-col gap-5 overflow-hidden rounded-leaf bg-brand-panel p-5 text-on-brand-panel ' +
    'md:mt-8 md:flex-row md:items-center md:gap-8 md:p-8 lg:hidden',
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
  const wide = useMediaQuery('(min-width: 64rem)');
  const [instant] = useState(() => introPlayed);

  // Count it as played once it has had time to finish, so leaving mid-intro still replays it next time.
  useEffect(() => {
    const id = setTimeout(() => { introPlayed = true; }, INTRO_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className={authClasses.root}>
      {wide && (
        <aside className={authClasses.panel} aria-hidden="true">
          <TileBoard layout="board" instant={instant} />
          <div className="max-w-sm">
            <p className="font-display text-title font-semibold">{head}</p>
            <p className="mt-3 text-body opacity-85">{sub}</p>
          </div>
        </aside>
      )}
      <main className={authClasses.main}>
        <div className={authClasses.header}>
          <Logo />
          <div className="flex items-center gap-1">
            <LanguageSwitch lang={lang} onToggle={toggleLang} />
            <ThemeSwitch theme={theme} lang={lang} onToggle={toggleTheme} />
          </div>
        </div>
        {!wide && (
          <section className={authClasses.card} aria-hidden="true">
            <TileBoard layout="band" instant={instant} className="shrink-0" />
            <div className="min-w-0">
              <p className="font-display text-heading font-semibold md:text-title">{head}</p>
              <p className="mt-2 hidden text-body opacity-85 md:block">{sub}</p>
            </div>
          </section>
        )}
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
