import { useLayoutEffect } from 'react';
import { usePrefs } from '../context/PreferencesContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { COPY } from '../components/landing/copy.js';
import { LandingHeader } from '../components/landing/LandingHeader.jsx';
import { Hero, TrustStrip } from '../components/landing/Hero.jsx';
import { Features } from '../components/landing/Features.jsx';
import { HowItWorks, Tour } from '../components/landing/Showcase.jsx';
import { Teams, Why, Faq, FinalCta, LandingFooter } from '../components/landing/Closing.jsx';
import '../components/landing/landing.css';

/** Public landing page at "/" for signed-out visitors. Every sign-in button goes to /login. */
export default function Landing() {
  const { lang, theme, dir, toggleLang, toggleTheme } = usePrefs();
  const t = COPY[lang] || COPY.en;
  usePageTitle(t.title);
  // Start at the top (or at the section in the URL hash), not where the previous page was scrolled.
  useLayoutEffect(() => {
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView();
    else window.scrollTo(0, 0);
  }, []);
  // The shared preferences only toggle, so set a specific value by toggling when it differs.
  const setLang = (l) => { if (l !== lang) toggleLang(); };
  const setTheme = (v) => { if (v !== theme) toggleTheme(); };

  return (
    <div className="lp" id="top">
      <a className="skip" href="#main">{t.nav.skip}</a>
      <LandingHeader t={t} lang={lang} theme={theme} setLang={setLang} toggleTheme={toggleTheme} />
      <main id="main" tabIndex={-1}>
        <Hero t={t} />
        <TrustStrip t={t} />
        <Features t={t} />
        <HowItWorks t={t} />
        <Tour t={t} dir={dir} />
        <Teams t={t} />
        <Why t={t} />
        <Faq t={t} />
        <FinalCta t={t} />
      </main>
      <LandingFooter t={t} lang={lang} theme={theme} setLang={setLang} setTheme={setTheme} />
    </div>
  );
}
