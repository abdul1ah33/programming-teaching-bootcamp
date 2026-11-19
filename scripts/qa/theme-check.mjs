import { chromium } from '@playwright/test';
const base = process.argv[2] ?? 'http://localhost:3100';
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ colorScheme: scheme });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.text()); });
  await page.goto(base + '/');
  const cls = await page.evaluate(() => document.documentElement.className.includes('dark'));
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`system=${scheme} → dark class: ${cls}, body bg: ${bg}, console issues: ${JSON.stringify(logs)}`);
  await ctx.close();
}
// stored choice: dark stored, light system → must be dark on first paint (class set by inline script before hydration)
const ctx = await browser.newContext({ colorScheme: 'light' });
await ctx.addInitScript(() => localStorage.setItem('theme', 'dark'));
const page = await ctx.newPage();
await page.goto(base + '/', { waitUntil: 'commit' });
await page.waitForSelector('body', { state: 'attached' });
const early = await page.evaluate(() => document.documentElement.className.includes('dark'));
console.log('stored dark, light system → dark at first paint:', early);
await browser.close();
