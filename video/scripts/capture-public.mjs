// Screenshots of the public pages (landing, sign-in) for the README. Uses a fresh, signed-out browser.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = path.join(root, 'public', 'shots');
const BASE = process.env.APP_URL || 'http://localhost:5173';

await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const ctx = await browser.newContext({ viewport: { width: 1376, height: 860 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const lang of ['en', 'ar']) {
  await page.goto(`${BASE}/login`);
  await page.evaluate((l) => { localStorage.setItem('tf-lang', l); localStorage.setItem('tf-theme', 'light'); }, lang);
  for (const [name, url, wait] of [['landing', '/', 3500], ['login', '/login', 6000]]) {
    await page.goto(`${BASE}${url}`);
    await page.addStyleTag({ content: 'html{scrollbar-width:none} ::-webkit-scrollbar{display:none}' });
    await page.waitForTimeout(wait); // let the intro animations finish
    await page.mouse.move(0, 0);
    await page.screenshot({ path: path.join(out, `${lang}-${name}.png`) });
    console.log('saved', `${lang}-${name}`);
  }
}
await browser.close();
