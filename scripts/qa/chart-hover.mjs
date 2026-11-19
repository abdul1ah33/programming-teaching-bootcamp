// Hovers the points chart and saves a screenshot of it in both themes. Usage: node chart-hover.mjs <outDir>
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3100';
const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(base + '/points', { waitUntil: 'load' });
  const svg = page.locator('figure svg');
  const box = await svg.boundingBox();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height / 2);
  await page.waitForTimeout(300);
  console.log(theme, 'tooltip:', await page.locator('figure [role=status]').innerText().catch(() => 'none'));
  await page.locator('figure').screenshot({ path: `${process.argv[2]}/points-chart-hover-${theme}.png` });
  await svg.focus();
  await page.keyboard.press('Home');
  console.log(theme, 'keyboard Home:', await page.locator('figure [role=status]').innerText().catch(() => 'none'));
  await ctx.close();
}
await browser.close();
