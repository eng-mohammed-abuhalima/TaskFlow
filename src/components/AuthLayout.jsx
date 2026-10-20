import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleAlert, MailCheck } from 'lucide-react';
import { Icon } from '../lib/icons.jsx';
import { cx } from '../lib/cx.js';
import { useMediaQuery } from '../lib/useMediaQuery.js';
import { Logo, LanguageSwitch, ThemeSwitch } from './Navbar.jsx';
import { TileBoard, tileBoardAnimates } from './TileBoard.jsx';
import { OfflineBanner } from './OfflineBanner.jsx';
import { usePrefs } from '../context/PreferencesContext.jsx';

/*
  Shared by Sign in and Create account (from docs/components/src/screens/Login.jsx).
  - lg (1024+): full-height brand panel at the start (board = 4x3 tiles), form at the end.
  - below lg: header, a compact brand card (6x2 tiles over the tagline), then the form.
  Only one TileBoard is mounted at a time. The intro plays once per page load: after that,
  switching between Sign in and Create account (or logging out) shows the finished board.
*/
let introPlayed = false;
const INTRO_MS = 4500; // the intro itself takes about 4.3s (sorting ~3.4s + the move and the tagline)

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
  notice: 'flex items-start gap-2.5 rounded-leaf-sm border border-success/50 bg-success-soft p-3 text-body-sm text-success-fg',
  switch: 'text-center text-body-sm text-fg-muted',
  link: 'rounded-tight font-medium text-fg-primary underline decoration-1 underline-offset-4 hover:decoration-2 focus-ring',
};
// #endregion

const INTRO_SCALE = 1.2;
const PROMPT_GAP = 28; // px between the centred board and the prompt line
const PROMPT_HEIGHT = 40; // about one line of text-heading; only used to centre board + prompt as a group
const MOVE_MS = 700;

/*
  Desktop brand panel. The intro tells a small story:
  1. The board sits in the middle of the panel, a bit larger, and the tiles fall in scattered,
     with a prompt under it ("Sort out your scattered tasks").
  2. The focus tile puts them in order (TileBoard).
  3. The sorted board glides to its corner, the prompt fades out and the tagline rises in.
  Replays (`instant`) and prefers-reduced-motion show step 3's end state with no motion.
  The centre offset is measured before the first paint (FLIP), so the board never jumps.
*/
function BrandPanel({ instant, head, sub }) {
  const { t } = usePrefs();
  const [animates] = useState(() => tileBoardAnimates(instant));
  const [settled, setSettled] = useState(!animates);
  const [intro, setIntro] = useState(null); // { x, y, promptTop } once measured
  const panelRef = useRef(null);
  const boardRef = useRef(null);

  useLayoutEffect(() => {
    if (!animates) return;
    const panel = panelRef.current.getBoundingClientRect();
    const board = boardRef.current.getBoundingClientRect(); // its resting place: nothing is transformed yet
    const boardH = board.height * INTRO_SCALE;
    const groupTop = panel.height / 2 - (boardH + PROMPT_GAP + PROMPT_HEIGHT) / 2;
    const centreY = groupTop + boardH / 2;
    // Measured in a layout effect so the centred position is set before the first paint.
    setIntro({
      x: panel.left + panel.width / 2 - (board.left + board.width / 2),
      y: panel.top + centreY - (board.top + board.height / 2),
      promptTop: groupTop + boardH + PROMPT_GAP,
    });
  }, [animates]);

  const centred = !settled && intro;
  return (
    <aside ref={panelRef} className={authClasses.panel} aria-hidden="true">
      <div
        ref={boardRef}
        className="w-max"
        style={{
          transform: centred ? `translate(${intro.x}px, ${intro.y}px) scale(${INTRO_SCALE})` : 'none',
          // Only the glide to the corner is animated; jumping to the centre at mount must be instant.
          transition: settled && animates ? `transform ${MOVE_MS}ms var(--ease-flow)` : undefined,
          // Hidden only for the instant between mount and measuring, so it never shows in the corner first.
          visibility: animates && !intro ? 'hidden' : undefined,
        }}
      >
        <TileBoard layout="board" instant={instant} onSorted={() => setSettled(true)} />
      </div>

      {animates && (
        <p
          className="absolute inset-x-12 text-center font-display text-heading font-semibold transition-opacity duration-slow"
          style={{ top: intro?.promptTop ?? 0, opacity: settled ? 0 : 1 }}
        >
          <span className="block animate-intro-text" style={{ animationDelay: '400ms' }}>
            {t('Sort out your scattered tasks.', 'رتّب مهامك المبعثرة.')}
          </span>
        </p>
      )}

      {/* Stays in the layout from the start so nothing shifts; it only becomes visible once settled. */}
      <div
        className={cx('max-w-sm', !settled && 'opacity-0', settled && animates && 'animate-intro-text')}
        style={animates ? { animationDelay: `${MOVE_MS / 2}ms` } : undefined}
      >
        <p className="font-display text-title font-semibold">{head}</p>
        <p className="mt-3 text-body opacity-85">{sub}</p>
      </div>
    </aside>
  );
}

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
      {wide && <BrandPanel instant={instant} head={head} sub={sub} />}
      <main className={authClasses.main}>
        <OfflineBanner className="mb-4 rounded-leaf-sm border" />
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

/** Success counterpart of AuthAlert (polite: it follows the user's own action). */
export function AuthNotice({ children }) {
  return (
    <div role="status" className={authClasses.notice}>
      <Icon icon={MailCheck} size={20} />
      <p>{children}</p>
    </div>
  );
}
