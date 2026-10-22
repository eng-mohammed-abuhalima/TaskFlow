// Captures app screenshots for the video from the local dev server (npm run dev in the app).
// It opens a real Edge window with its own profile (video/.profile). If you are not signed in,
// sign in yourself in that window; the script waits, then takes every shot in Arabic and English.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'public', 'shots');
const BASE = process.env.APP_URL || 'http://localhost:5173';
const PROJECT_NAME = process.env.PROJECT_NAME || 'Website Redesign 2026';
const DESKTOP = { width: 1376, height: 860 };
const PHONE = { width: 390, height: 844 };

await mkdir(out, { recursive: true });
const ctx = await chromium.launchPersistentContext(path.join(root, '.profile'), {
  channel: 'msedge',
  headless: false,
  viewport: DESKTOP,
  deviceScaleFactor: 2,
});
const page = ctx.pages()[0] ?? (await ctx.newPage());

await page.goto(`${BASE}/dashboard`);
await page.waitForTimeout(2500);
if (!page.url().includes('/dashboard')) {
  console.log('>> Sign in in the Edge window (owner account). Waiting up to 20 minutes...');
  const until = Date.now() + 1_200_000;
  let last = '';
  // Poll instead of waitForURL: client-side redirects after sign-in don't always fire a navigation event.
  while (!page.url().includes('/dashboard')) {
    if (Date.now() > until) throw new Error('Timed out waiting for sign-in');
    if (page.url() !== last) { last = page.url(); console.log('   at', last); }
    await page.waitForTimeout(2000);
  }
  await page.waitForTimeout(2000);
}
console.log('signed in, capturing...');

async function prefs({ lang, theme = 'light', view = 'list' }) {
  await page.evaluate(([l, t, v]) => {
    localStorage.setItem('tf-lang', l);
    localStorage.setItem('tf-theme', t);
    localStorage.setItem('tf-task-view', v);
  }, [lang, theme, view]);
}

async function shot(name, url, { wait = 3000, fullPage = false, scrollTo = null } = {}) {
  await page.goto(`${BASE}${url}`);
  await page.waitForTimeout(wait);
  // No scrollbars in the video.
  await page.addStyleTag({ content: 'html{scrollbar-width:none} ::-webkit-scrollbar{display:none}' });
  if (scrollTo) {
    // Scroll so the first heading/label that starts with `scrollTo` sits near the top.
    await page.evaluate((text) => {
      const el = [...document.querySelectorAll('h1,h2,h3,label,legend')].find((e) => e.textContent.trim().startsWith(text));
      el?.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -32);
    }, scrollTo);
    await page.waitForTimeout(600);
  }
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage });
  console.log('saved', name);
}

// Find the demo project's URL from the dashboard.
await page.waitForTimeout(1500);
const href = await page.evaluate((name) => {
  const links = [...document.querySelectorAll('a[href^="/projects/"]')];
  const hit = links.find((a) => a.textContent.includes(name) && !a.getAttribute('href').endsWith('/new'));
  return hit?.getAttribute('href') ?? null;
}, PROJECT_NAME);
if (!href) throw new Error(`Project "${PROJECT_NAME}" not found on the dashboard`);
const projectUrl = href.replace(/\/settings$/, '');

for (const lang of ['ar', 'en']) {
  await page.setViewportSize(DESKTOP);
  await prefs({ lang });
  await shot(`${lang}-dashboard`, '/dashboard', { wait: 4000 });
  await shot(`${lang}-project`, projectUrl, { wait: 4000 });
  await prefs({ lang, view: 'board' });
  await shot(`${lang}-board`, projectUrl, { wait: 4500 });
  await prefs({ lang });
  await shot(`${lang}-settings`, `${projectUrl}/settings`, { wait: 3500, scrollTo: lang === 'ar' ? 'الأعضاء' : 'Members' });

  await page.setViewportSize(PHONE);
  await prefs({ lang, theme: 'dark' });
  await shot(`${lang}-phone-dashboard`, '/dashboard', { wait: 3500 });
  await prefs({ lang, theme: 'dark', view: 'board' });
  await shot(`${lang}-phone-project`, projectUrl, { wait: 4000 });
}

// Leave the app the way most people see it.
await page.setViewportSize(DESKTOP);
await prefs({ lang: 'ar' });
await ctx.close();
console.log('done');
