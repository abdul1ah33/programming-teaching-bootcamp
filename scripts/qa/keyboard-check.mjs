// Keyboard checks for the site shell. BASE env var sets the server (default http://localhost:3100).
import { chromium } from '@playwright/test';

const base = process.env.BASE ?? 'http://localhost:3100';
const out = process.argv[2];
const browser = await chromium.launch();
const results = [];
const check = (name, ok) => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}`);

// Desktop
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  check('first Tab focuses the skip link', (await page.evaluate(() => document.activeElement?.textContent)) === 'Skip to content');
  const seen = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press('Tab');
    seen.push(await page.evaluate(() => (document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent || '').trim()));
  }
  for (const label of ['Home', 'Road map', 'Sessions', 'Resources', 'Projects', 'Learn', 'For parents']) {
    check(`Tab reaches "${label}"`, seen.includes(label));
  }
  check('Tab reaches Points link', seen.some((s) => s.startsWith('Points')));
  check('Tab reaches theme toggle', seen.some((s) => /theme/i.test(s)));

  const learn = page.getByRole('button', { name: 'Learn' });
  await learn.focus();
  const ring = await learn.evaluate((el) => getComputedStyle(el).outlineStyle !== 'none' && getComputedStyle(el).outlineWidth !== '0px');
  check('focused nav button shows an outline', ring);
  await page.keyboard.press('Enter');
  check('Enter opens Learn menu', (await learn.getAttribute('aria-expanded')) === 'true' && (await page.getByRole('link', { name: /Glossary/ }).first().isVisible()));
  if (out) await page.screenshot({ path: `${out}/keyboard-learn-menu-open.png` });
  await page.keyboard.press('Escape');
  check('Esc closes Learn menu', (await learn.getAttribute('aria-expanded')) === 'false');
  check('focus returns to Learn button', await learn.evaluate((el) => el === document.activeElement));
  await page.keyboard.press(' ');
  check('Space opens Learn menu', (await learn.getAttribute('aria-expanded')) === 'true');
  await page.keyboard.press('Tab');
  check('Tab moves into the open menu', await page.evaluate(() => document.activeElement?.closest('[id]')?.tagName === 'DIV'));
  await page.mouse.click(10, 700);
  check('click outside closes menu', (await learn.getAttribute('aria-expanded')) === 'false');
  await page.close();
}

// Phone
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('dialog[open]');
  check('Menu button opens the sheet', await dialog.isVisible());
  check('focus moves into the sheet', await page.evaluate(() => !!document.activeElement?.closest('dialog')));
  for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
  check('focus stays trapped in the sheet', await page.evaluate(() => !!document.activeElement?.closest('dialog') || document.activeElement === document.body));
  await page.waitForTimeout(400);
  if (out) await page.screenshot({ path: `${out}/keyboard-mobile-sheet-open.png` });
  await page.keyboard.press('Escape');
  check('Esc closes the sheet', !(await dialog.count()));
  check('focus returns to the Menu button', await menu.evaluate((el) => el === document.activeElement));
  await page.close();
}

await browser.close();
console.log(results.join('\n'));
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
