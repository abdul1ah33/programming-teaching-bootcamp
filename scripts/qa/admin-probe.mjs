// Prints the accessible controls (role + name) on a Keystatic page, to script admin walkthroughs.
import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('http://localhost:3000/keystatic/' + process.argv[2], { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForSelector("text=Save", { timeout: 120000 }).catch(() => {});
await page.waitForTimeout(1500);
const items = await page.evaluate(() =>
  [...document.querySelectorAll('button, input, select, textarea, [role="combobox"], [role="checkbox"], [role="switch"]')]
    .map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('role') ?? el.getAttribute('type') ?? ''}] "${(el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim().slice(0, 50)}" id=${el.id}`)
    .slice(0, 80),
);
console.log(items.join('\n'));
await browser.close();
