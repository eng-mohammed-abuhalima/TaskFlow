import { useState } from 'react';
import { cx } from '../lib/cx.js';
import { ThemeScope } from '../lib/portal.jsx';

function Seg({ label, value, options, onChange }) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <span className="text-caption font-medium text-fg-subtle">{label}</span>
      <div className="inline-flex rounded-leaf-sm border border-subtle bg-surface p-0.5">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
            className="h-7 rounded-leaf-sm px-2.5 text-caption font-medium text-fg-muted focus-ring aria-pressed:bg-primary aria-pressed:text-on-primary">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Documentation chrome: a toolbar that flips theme, language and screen state on a wrapper. */
export function ScreenFrame({ width, states, initial = {}, children }) {
  const [theme, setTheme] = useState(initial.theme || 'light');
  const [lang, setLang] = useState(initial.lang || 'en');
  const [state, setState] = useState(initial.state || (states && states[0].value));
  const [replay, setReplay] = useState(0);
  const [el, setEl] = useState(null);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const onTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const onLang = () => setLang(lang === 'ar' ? 'en' : 'ar');
  return (
    <div className="bg-canvas font-sans text-fg" lang="en" dir="ltr">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-subtle bg-surface-sunken px-3 py-2">
        <span className="text-caption font-semibold text-fg-muted tabular-nums">{width}px</span>
        <Seg label="Theme" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        <Seg label="Lang" value={lang} onChange={setLang} options={[{ value: 'en', label: 'EN' }, { value: 'ar', label: 'AR' }]} />
        {states && <Seg label="State" value={state} onChange={setState} options={states} />}
        <button type="button" onClick={() => setReplay(replay + 1)}
          className="h-7 rounded-leaf-sm border border-subtle bg-surface px-2.5 text-caption font-medium text-fg-muted hover:text-fg focus-ring">↻ Replay intro</button>
      </div>
      <div ref={setEl} data-theme={theme} lang={lang} dir={dir} className={cx('min-h-[calc(100%-2.75rem)] bg-canvas font-sans text-fg')}>
        <ThemeScope container={el} dir={dir}>
          {children({ theme, lang, dir, state, onTheme, onLang, replay, t: (en, ar) => (lang === 'ar' ? ar : en) })}
        </ThemeScope>
      </div>
    </div>
  );
}
