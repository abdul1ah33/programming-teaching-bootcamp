/**
 * Runs every code example in the glossary and the cheat sheets.
 *   Python: run with `python` (or `python3`); must exit 0.
 *   C:      compiled with gcc -std=c11 -Wall -Wextra -Werror (so warnings fail), then run; must exit 0.
 *           A C snippet without main() is a fragment: it's placed inside main() with the common headers.
 * Programs that read input get a few lines of "14" on stdin.
 *
 *   npm run check-snippets
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getCheatSheets, getGlossary } from '@/lib/content';
import type { Language } from '@/lib/model/enums';

interface Snippet {
  where: string;
  language: Language;
  code: string;
}

const TMP = path.join(process.cwd(), '.snippets-tmp');
const STDIN = '14\n'.repeat(10);
const TIMEOUT = 10_000;

function findPython(): string {
  for (const cmd of ['python3', 'python']) {
    const r = spawnSync(cmd, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return cmd;
  }
  throw new Error('Python not found (tried python3, python).');
}

function wrapC(code: string): string {
  if (/\bint\s+main\s*\(/.test(code)) return code;
  const body = code
    .split('\n')
    .map((l) => (l ? `    ${l}` : l))
    .join('\n');
  return `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main(void) {\n${body}\n    return 0;\n}\n`;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

async function collect(): Promise<Snippet[]> {
  const [glossary, sheets] = await Promise.all([getGlossary(), getCheatSheets()]);
  const out: Snippet[] = [];
  for (const t of glossary) {
    if (t.code) out.push({ where: `glossary/${t.slug}`, language: t.code.language, code: t.code.code });
  }
  for (const sheet of sheets) {
    sheet.sections.forEach((section) =>
      section.items.forEach((item) =>
        out.push({ where: `cheatsheets/${sheet.slug} › ${section.heading} › ${item.label}`, language: sheet.language, code: item.code }),
      ),
    );
  }
  return out;
}

const python = findPython();
rmSync(TMP, { recursive: true, force: true });
const snippets = await collect();
const failures: string[] = [];
let pythonCount = 0;
let cCount = 0;

snippets.forEach((s, i) => {
  const dir = path.join(TMP, `${String(i).padStart(3, '0')}-${slug(s.where)}`);
  mkdirSync(dir, { recursive: true });
  if (s.language === 'python') {
    pythonCount++;
    const file = path.join(dir, 'snippet.py');
    writeFileSync(file, `${s.code}\n`);
    const r = spawnSync(python, ['-I', file], { cwd: dir, input: STDIN, encoding: 'utf8', timeout: TIMEOUT });
    if (r.status !== 0) failures.push(`${s.where}\n    python exited ${r.status}${r.error ? ` (${r.error.message})` : ''}\n    ${(r.stderr || '').trim().split('\n').slice(-3).join('\n    ')}`);
  } else {
    cCount++;
    const file = path.join(dir, 'snippet.c');
    const exe = path.join(dir, process.platform === 'win32' ? 'snippet.exe' : 'snippet');
    writeFileSync(file, wrapC(s.code));
    const c = spawnSync('gcc', ['-std=c11', '-Wall', '-Wextra', '-Werror', file, '-o', exe, '-lm'], { cwd: dir, encoding: 'utf8', timeout: 60_000 });
    if (c.status !== 0) {
      failures.push(`${s.where}\n    gcc failed${c.error ? ` (${c.error.message})` : ''}\n    ${(c.stderr || '').trim().split('\n').slice(0, 6).join('\n    ')}`);
      return;
    }
    const r = spawnSync(exe, [], { cwd: dir, input: STDIN, encoding: 'utf8', timeout: TIMEOUT });
    if (r.status !== 0) failures.push(`${s.where}\n    program exited ${r.status}${r.error ? ` (${r.error.message})` : ''}`);
  }
});

console.log(`Checked ${snippets.length} snippets: ${pythonCount} Python (run), ${cCount} C (gcc -std=c11 -Wall -Wextra -Werror, then run).`);
if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} failed:\n`);
  for (const f of failures) console.error(`  ${f}\n`);
  process.exit(1);
}
rmSync(TMP, { recursive: true, force: true });
console.log('✓ Every snippet ran successfully.');
