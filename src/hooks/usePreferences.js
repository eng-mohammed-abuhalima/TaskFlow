import { useCallback, useEffect, useState } from 'react';

const read = (k, ok, fallback) => { try { const v = localStorage.getItem(k); return ok.includes(v) ? v : fallback(); } catch { return fallback(); } };
const systemTheme = () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Switching only flips attributes on <html>; colours, fonts and direction follow through CSS variables.
export function usePreferences() {
  const html = document.documentElement;
  const [theme, setTheme] = useState(() => html.getAttribute('data-theme') || read('tf-theme', ['light', 'dark'], systemTheme));
  const [lang, setLang] = useState(() => html.lang || 'en');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Follow the OS until the user picks a theme explicitly.
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (!read('tf-theme', ['light', 'dark'], () => null)) setTheme(systemTheme()); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => { const n = t === 'dark' ? 'light' : 'dark'; try { localStorage.setItem('tf-theme', n); } catch { /* storage blocked */ } return n; }), []);
  const toggleLang = useCallback(() => setLang((l) => { const n = l === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('tf-lang', n); } catch { /* storage blocked */ } return n; }), []);


  
  return { theme, lang, dir: lang === 'ar' ? 'rtl' : 'ltr', toggleTheme, toggleLang, t: (en, ar) => (lang === 'ar' ? ar : en) };
}
