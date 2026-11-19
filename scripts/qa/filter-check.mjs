// Checks the client-side filters on /sessions and /resources. BASE env var sets the server.
import { chromium } from '@playwright/test';
const base = process.env.BASE ?? 'http://localhost:3100';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const results = [];
const check = (n, ok) => results.push(`${ok ? 'PASS' : 'FAIL'}  ${n}`);
const rows = () => page.locator('main a[href^="/sessions/"]').count();

await page.goto(base + '/sessions', { waitUntil: 'load' });
await page.waitForTimeout(500);
check('sessions: all 2 shown', (await rows()) === 2);
await page.getByRole('button', { name: /^Done/ }).focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
check('sessions: keyboard Enter on "Done" filters to 1', (await rows()) === 1);
check('sessions: URL has ?status=done', page.url().includes('status=done'));
await page.getByRole('button', { name: /^Cancelled/ }).click();
await page.waitForTimeout(300);
check('sessions: no cancelled → empty state', await page.getByText('No lessons match').isVisible());
await page.getByRole('button', { name: 'Show all lessons' }).click();
await page.waitForTimeout(300);
check('sessions: "Show all" resets', (await rows()) === 2);
await page.goto(base + '/sessions?status=planned', { waitUntil: 'load' });
await page.waitForTimeout(500);
check('sessions: filter read from URL on load', (await rows()) === 1);
await page.getByLabel('Sprint').focus();
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(300);
check('sessions: sprint select works by keyboard', page.url().includes('sprint='));

await page.goto(base + '/resources', { waitUntil: 'load' });
await page.waitForTimeout(500);
const preview = page.getByRole('button', { name: /Preview here/ });
check('resources: preview button present for PDF', (await preview.count()) === 1);
check('resources: no iframe before asking', (await page.locator('iframe').count()) === 0);
await preview.click();
await page.waitForTimeout(800);
check('resources: preview opens an iframe', (await page.locator('iframe').count()) === 1);
await page.getByRole('button', { name: /^Exercises/ }).count().then((n) => check('resources: only used types offered', n === 0));

await browser.close();
console.log(results.join('\n'));
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
