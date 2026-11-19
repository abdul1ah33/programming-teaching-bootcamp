// Opens specific Keystatic entry editors and reports visible field labels + any errors.
import { chromium } from '@playwright/test';

const base = 'http://localhost:3000';
const paths = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text().slice(0, 300)}`));
for (const p of paths) {
  await page.goto(`${base}/keystatic/${p}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForTimeout(1000);
  const text = (await page.locator('main, body').first().innerText()).replace(/\s+/g, ' ').slice(0, 400);
  console.log(`--- ${p}\n${text}`);
}
console.log(problems.length ? `Problems:\n${problems.join('\n')}` : 'No console errors.');
await browser.close();
