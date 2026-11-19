// Prints console errors and page errors for the given routes. BASE env var sets the server.
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message.slice(0, 1500)));
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && console.log(`${m.type()}:`, m.text().slice(0, 1500)));
for (const r of process.argv.slice(2)) {
  console.log(`--- ${r}`);
  await page.goto(base + r, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2500);
}
await browser.close();
