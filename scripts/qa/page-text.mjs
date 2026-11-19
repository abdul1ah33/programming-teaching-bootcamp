// Prints the visible text of a page after it loads. Usage: node page-text.mjs <url> [screenshot.png]
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(process.argv[2], { waitUntil: 'load', timeout: 120000 });
await page.waitForTimeout(3000);
console.log((await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 300));
if (process.argv[3]) await page.screenshot({ path: process.argv[3] });
await browser.close();
