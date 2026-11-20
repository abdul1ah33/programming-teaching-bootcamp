// Lists elements wider than the viewport. Usage: node find-overflow.mjs <route> [light|dark] [width]
import { chromium } from '@playwright/test';
const [route = '/', theme = 'dark', width = '375'] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: Number(width), height: 812 } });
await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
const page = await ctx.newPage();
for (let run = 0; run < 3; run++) {
  await page.goto((process.env.BASE ?? 'http://localhost:3100') + route, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 0.5) out.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 70)} right=${r.right.toFixed(1)} w=${r.width.toFixed(1)}`);
    }
    return { scroll: document.documentElement.scrollWidth - vw, out: out.slice(0, 8) };
  });
  console.log(`run ${run}: overflow ${res.scroll}px`, res.out.join('\n  '));
}
await browser.close();
