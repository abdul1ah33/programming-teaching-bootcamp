// Drives the Keystatic admin (local mode, dev server on :3000) through each editing action in the
// spec and checks the file it writes. Usage: node scripts/qa/admin-walkthrough.mjs <pdf> <zip> <outDir>
// It CHANGES content files; revert afterwards (see Phase 9 in TODO.md).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const [pdf, zip, outDir] = process.argv.slice(2);
const base = 'http://localhost:3000/keystatic/';
const root = process.cwd();
const read = (p) => (existsSync(path.join(root, p)) ? readFileSync(path.join(root, p), 'utf8') : '');
const results = [];
const log = (name, ok, fields, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name} — ${fields} field(s) touched${detail ? ` · ${detail}` : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
page.setDefaultTimeout(60000);

async function open(route) {
  await page.goto(base + route, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByRole('button', { name: /^(Save|Create)$/ }).first().waitFor();
  await page.waitForTimeout(500);
}
/** React Aria picker: click the button showing the current value, then choose an option. */
async function pick(scope, current, option) {
  const esc = current.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  await scope.locator('button', { hasText: new RegExp(`^\\s*${esc}\\s*$`) }).first().click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
async function save() {
  const btn = page.getByRole('button', { name: /^(Save|Create)$/ }).first();
  await btn.click();
  await page.waitForTimeout(2500);
}
async function addFile(fieldIndex, label, type, file) {
  await page.getByRole('button', { name: 'Add', exact: true }).nth(fieldIndex).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Label').fill(label);
  if (type) await pick(dialog, 'Notes', type);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), dialog.getByRole('button', { name: 'Choose file' }).click()]);
  await chooser.setFiles(file);
  await page.waitForTimeout(300);
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();
}

try {
  // 1. Mark a session as done (1 field)
  await open('collection/sessions/item/2');
  await pick(page, 'Planned', 'Done');
  await save();
  log('Mark session done', /status: done/.test(read('content/sessions/2.mdoc')), 1);

  // 2. Attach a file to a session (label + type + file = 3 fields, inside one "Add")
  await open('collection/sessions/item/2');
  await addFile(0, 'Flowchart exercises', 'Exercises', pdf);
  await save();
  const s2 = read('content/sessions/2.mdoc');
  const s2Dir = path.join(root, 'public/files/sessions/2');
  const s2Files = existsSync(s2Dir) ? readdirSync(s2Dir, { recursive: true }).map(String) : [];
  log('Attach a PDF to a session', /Flowchart exercises/.test(s2) && s2Files.some((f) => f.endsWith('.pdf')), 3, `stored as ${s2Files.join(', ')}`);

  // 3. Add a new session (number, title, sprint — date defaults to today, status to Planned)
  await open('collection/sessions/create');
  const inputs = page.locator('main input[type="text"]');
  await inputs.nth(0).fill('3');
  await inputs.nth(1).fill('Testing with sample inputs');
  const combo = page.getByRole('combobox').first();
  await combo.fill('Comp');
  await page.getByRole('option', { name: /computational/i }).first().click();
  await save();
  const s3 = read('content/sessions/3.mdoc');
  log('Add a session', /Testing with sample inputs/.test(s3) && /sprint: computational-thinking/.test(s3) && /status: planned/.test(s3), 3, 'date defaults to today');

  // 4. Tick a ready-to-move-on check (open the check, tick Done = 1 field; date optional)
  await open('collection/sprints/item/computational-thinking');
  await page.getByText('Explain what an algorithm is').first().click();
  const checkDialog = page.getByRole('dialog');
  await checkDialog.getByRole('checkbox').first().check({ force: true });
  await checkDialog.getByRole('button', { name: 'Done', exact: true }).click();
  await save();
  log('Tick a ready check', /text: Explain what an algorithm is\n\s+done: true/.test(read('content/sprints/computational-thinking.yaml')), 1);

  // 5. Change a sprint's status (1 field)
  await open('collection/sprints/item/python-foundations');
  await pick(page, 'Upcoming', 'In progress');
  await save();
  log("Change a sprint's status", /status: in-progress/.test(read('content/sprints/python-foundations.yaml')), 1);

  // 6. Attach a file to a sprint (zip)
  await open('collection/sprints/item/python-foundations');
  await addFile(3, 'Starter files', 'Other', zip); // 4th Add on a sprint: topics, missions, checks, files
  await save();
  const spDir = path.join(root, 'public/files/sprints/python-foundations');
  const spFiles = existsSync(spDir) ? readdirSync(spDir, { recursive: true }).map(String) : [];
  log('Attach a zip to a sprint', /Starter files/.test(read('content/sprints/python-foundations.yaml')) && spFiles.some((f) => f.endsWith('.zip')), 3, `stored as ${spFiles.join(', ')}`);

  // 7. Award points (title + activity; points prefilled from the rule; date defaults to today)
  await open('collection/points/create');
  await page.locator('main input[type="text"]').first().fill('Solved the challenge without hints');
  await pick(page, 'Exercise completed (5)', 'Challenge problem solved (10)');
  const prefilled = await page.locator('main input[inputmode="numeric"], main input[type="number"]').first().inputValue().catch(() => '?');
  await save();
  const pointsFile = readdirSync(path.join(root, 'content/points')).find((f) => f.includes('solved-the-challenge-without-hints'));
  const pointsYaml = pointsFile ? read(`content/points/${pointsFile}`) : '';
  log('Award points', /discriminant: challenge/.test(pointsYaml) && /value: 10/.test(pointsYaml), 2, `points field prefilled with ${prefilled}; file ${pointsFile}`);

  // 8. Write the monthly note (month + note text; highlights optional)
  await open('collection/monthlyNotes/create');
  await page.locator('main input[type="text"]').first().fill('2026-12');
  const editor = page.locator('[contenteditable="true"]').first();
  await editor.click();
  await page.keyboard.type('A steady month. Loops clicked once we traced them on paper.');
  await save();
  log('Write the monthly note', /Loops clicked/.test(read('content/monthly-notes/2026-12.mdoc')), 2);

  // 9. Add a badge (name, description; icon and rule have defaults)
  await open('collection/badges/create');
  await page.locator('main input[type="text"]').first().fill('Pointer pro');
  await page.locator('main input[type="text"]').nth(2).fill('Explained pointers with a drawing.');
  await save();
  log('Add a badge', /name: Pointer pro/.test(read('content/badges/pointer-pro.yaml')), 2, 'rule defaults to "I award it by hand"');

  if (outDir) await page.screenshot({ path: path.join(outDir, 'admin-last-step.png') });
} catch (e) {
  results.push(`FAIL  walkthrough stopped: ${e.message.split('\n')[0]}`);
  if (outDir) await page.screenshot({ path: path.join(outDir, 'admin-failure.png') }).catch(() => {});
}

await browser.close();
console.log(results.join('\n'));
if (results.some((r) => r.startsWith('FAIL'))) process.exit(1);
