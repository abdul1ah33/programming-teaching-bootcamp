// Usage: node scripts/qa/screenshots.mjs <outDir> <route> [route...]
// Captures every route in light + dark at phone (375) and desktop (1280) width, full page.
// BASE env var sets the server (default http://localhost:3100).
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const [outDir, ...routes] = process.argv.slice(2);
if (!outDir || routes.length === 0) {
  console.error('Usage: node scripts/qa/screenshots.mjs <outDir> <route> [route...]');
  process.exit(1);
}
const base = process.env.BASE ?? 'http://localhost:3100';
const widths = [
  { name: 'phone', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 800 },
];
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];
for (const theme of ['light', 'dark']) {
  for (const vp of widths) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problems.push(`${page.url()} pageerror: ${e.message}`));
    page.on('console', (m) => {
      if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) problems.push(`${page.url()} console: ${m.text().slice(0, 200)}`);
    });
    page.on('response', (r) => {
      if (r.status() >= 400) problems.push(`${r.status()} ${new URL(r.url()).pathname} (from ${new URL(page.url()).pathname})`);
    });
    for (const route of routes) {
      const res = await page.goto(base + route, { waitUntil: 'load' });
      await page.waitForTimeout(400);
      if (!res || res.status() >= 400) problems.push(`${route}: HTTP ${res?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) problems.push(`${route} @${vp.width} ${theme}: horizontal overflow ${overflow}px`);
      const name = (route === '/' ? 'home' : route.replace(/^\//, '').replace(/[/?=&]+/g, '_')) + `-${theme}-${vp.name}.png`;
      await page.screenshot({ path: path.join(outDir, name), fullPage: true });
    }
    await ctx.close();
  }
}
await browser.close();
console.log(`Saved ${routes.length * 4} screenshots to ${outDir}`);
console.log(problems.length ? `Problems:\n  ${problems.join('\n  ')}` : 'No problems detected.');
