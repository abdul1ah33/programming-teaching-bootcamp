// Saves A4 PDFs (print CSS) of routes, reports page counts, and a print-mode screenshot for review.
// Usage: node scripts/qa/print-pdf.mjs <outDir> <route> [route...]   (theme stored as dark to prove print is light)
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const [outDir, ...routes] = process.argv.slice(2);
const base = process.env.BASE ?? 'http://localhost:3100';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('theme', 'dark'));
const page = await ctx.newPage();
for (const route of routes) {
  await page.goto(base + route, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print' });
  const name = route.replace(/^\//, '').replace(/[/?=&]+/g, '_');
  const pdfPath = path.join(outDir, `${name}-print.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4', preferCSSPageSize: true, printBackground: true });
  const pages = (readFileSync(pdfPath, 'latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const headerVisible = await page.evaluate(() => {
    const h = document.querySelector('header.sticky');
    return h ? getComputedStyle(h).display !== 'none' : false;
  });
  await page.setViewportSize({ width: 794, height: 1123 }); // A4 at 96dpi
  await page.screenshot({ path: path.join(outDir, `${name}-print-preview.png`), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.emulateMedia({ media: 'screen' });
  console.log(`${route}: ${pages} A4 page(s), body background ${bg}, site header visible in print: ${headerVisible}`);
}
await browser.close();
