// Clicks an element containing the given text on a Keystatic page and prints the dialog's controls.
import { chromium } from '@playwright/test';
const [route, text] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto('http://localhost:3000/keystatic/' + route, { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForSelector('text=Save', { timeout: 120000 }).catch(() => {});
const target = page.getByText(text).first();
console.log('target tag:', await target.evaluate((el) => `${el.tagName} role=${el.getAttribute('role')} parent=${el.parentElement?.tagName}`));
await target.click();
await page.waitForTimeout(800);
const dialog = page.getByRole('dialog');
console.log('dialog open:', await dialog.count());
if (await dialog.count())
  console.log((await dialog.first().evaluate((d) => [...d.querySelectorAll('button, input, label')].map((el) => `${el.tagName.toLowerCase()}[${el.getAttribute('type') ?? el.getAttribute('role') ?? ''}] "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 60)}"`))).join('\n'));
await browser.close();
