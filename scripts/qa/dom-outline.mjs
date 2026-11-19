// Prints the element outline (3 levels) of <body> after hydration. BASE env var sets the server.
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3000';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(base + process.argv[2], { waitUntil: 'load' });
await page.waitForTimeout(1500);
console.log(await page.evaluate(() => {
  const walk = (el, d) => d > 3 ? '' : [...el.children].map((c) => `${'  '.repeat(d)}<${c.tagName.toLowerCase()}${c.id ? '#' + c.id : ''}${c.className && typeof c.className === 'string' ? '.' + c.className.split(' ').slice(0, 2).join('.') : ''}>\n` + walk(c, d + 1)).join('');
  return walk(document.body, 0);
}));
await browser.close();
