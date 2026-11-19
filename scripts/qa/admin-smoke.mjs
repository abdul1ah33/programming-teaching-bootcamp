// Opens every Keystatic collection/singleton list in the running dev server and reports entry counts + errors.
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:3000';
const targets = [
  'singleton/settings',
  ...['sprints', 'sessions', 'projects', 'points', 'badges', 'glossary', 'cheatsheets', 'monthlyNotes', 'fields'].map(
    (c) => `collection/${c}`,
  ),
];
const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text().slice(0, 200)}`));
for (const t of targets) {
  await page.goto(`${base}/keystatic/${t}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(800);
  const rows = await page.locator('[role="row"]').count();
  const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const err = /error|failed|invalid/i.test(text) ? ' ⚠ page text mentions an error' : '';
  console.log(`${t}: ${t.startsWith('collection') ? `${Math.max(rows - 1, 0)} rows` : 'opened'}${err}`);
}
console.log(problems.length ? `Problems:\n${problems.join('\n')}` : 'No console errors.');
await browser.close();
