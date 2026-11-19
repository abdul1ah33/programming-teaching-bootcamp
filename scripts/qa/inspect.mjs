// Prints computed styles of a selector after an optional click. Usage: node inspect.mjs <route> <selector> [clickSelector] [width]
import { chromium } from '@playwright/test';
const [route, selector, click, width = '375'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: 812 } });
await page.goto((process.env.BASE ?? 'http://localhost:3100') + route, { waitUntil: 'load' });
if (click) await page.click(click);
await page.waitForTimeout(600);
console.log(await page.$eval(selector, (el) => {
  const s = getComputedStyle(el);
  const b = getComputedStyle(el, '::backdrop');
  return { bg: s.backgroundColor, opacity: s.opacity, animation: s.animationName, display: s.display, backdrop: b.backgroundColor, cls: el.className };
}));
await browser.close();
