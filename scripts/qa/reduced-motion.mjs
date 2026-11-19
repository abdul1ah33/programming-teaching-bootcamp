// With prefers-reduced-motion, animations and transitions must be effectively off.
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(base + '/points', { waitUntil: 'load' });
const max = await page.evaluate(() => {
  let worst = 0;
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    for (const v of [...s.transitionDuration.split(','), ...s.animationDuration.split(',')]) {
      const ms = v.trim().endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000;
      if (ms > worst) worst = ms;
    }
  }
  return worst;
});
console.log(`${max <= 1 ? 'PASS' : 'FAIL'}  longest transition/animation with reduced motion: ${max}ms`);
await browser.close();
process.exit(max <= 1 ? 0 : 1);
