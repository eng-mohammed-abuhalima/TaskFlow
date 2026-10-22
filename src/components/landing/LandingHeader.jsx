import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { Logo } from '../Navbar.jsx';
import { I } from './parts.jsx';

const SECTIONS = ['features', 'how', 'teams', 'faq'];

/** EN / العربية as two pressed-state buttons, each label in its own language. */
export function LangSeg({ lang, setLang, label }) {
  return (
    <div className="seg leaf-sm" role="group" aria-label={label}>
      <button type="button" className="leaf-sm" lang="en" dir="ltr" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
      <button type="button" className="leaf-sm" lang="ar" dir="rtl" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>العربية</button>
    </div>
  );
}

export function LandingHeader({ t, lang, theme, setLang, toggleTheme }) {
  const themeLabel = theme === 'dark' ? t.nav.toLight : t.nav.toDark;
  const links = SECTIONS.map((id) => <a key={id} href={`#${id}`}>{t.nav[id]}</a>);
  return (
    <header className="hdr">
      <div className="wrap">
        <div className="hdr-in">
          <a href="#top" className="logo" aria-label={t.nav.home}><Logo /></a>
          <nav className="nav" aria-label={t.nav.label}>{links}</nav>
          <div className="hdr-end">
            <LangSeg lang={lang} setLang={setLang} label={t.nav.langLabel} />
            <button type="button" className="ibtn leaf-sm" aria-label={themeLabel} title={themeLabel} onClick={toggleTheme}>
              <I icon={theme === 'dark' ? Sun : Moon} size={20} />
            </button>
            <Link to="/login" className="btn btn-primary leaf-sm btn-signin">{t.nav.signin}</Link>
          </div>
        </div>
        {/* phones: the sign-in pill comes first so it's never scrolled out of view */}
        <nav className="subnav" aria-label={t.nav.label}>
          <Link to="/login" className="go-in">{t.nav.signin}</Link>
          {links}
        </nav>
      </div>
    </header>
  );
}
