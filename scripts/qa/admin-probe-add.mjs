// Clicks the Nth "Add" button on a Keystatic page and prints the controls in the dialog that opens.
import { chromium } from '@playwright/test';
const [route, nth = '0'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('http://localhost:3000/keystatic/' + route, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForSelector('text=Save', { timeout: 120000 }).catch(() => {});
await page.getByRole('button', { name: 'Add', exact: true }).nth(Number(nth)).click();
await page.waitForTimeout(800);
const dialog = page.getByRole('dialog');
console.log('dialog open:', await dialog.count());
console.log(
  (await dialog.first().evaluate((d) =>
    [...d.querySelectorAll('button, input, select, textarea, label, h2')].map(
      (el) => `${el.tagName.toLowerCase()}[${el.getAttribute('type') ?? el.getAttribute('role') ?? ''}] "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60)}"`,
    ),
  )).join('\n'),
);
await browser.close();
