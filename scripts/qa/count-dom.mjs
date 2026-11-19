// Counts matches of a selector after hydration for each route. BASE env var sets the server.
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3100';
const [selector, ...routes] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
for (const r of routes) {
  await page.goto(base + r, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  console.log(`${r} client: ${await page.locator(selector).count()}`);
}
await browser.close();
