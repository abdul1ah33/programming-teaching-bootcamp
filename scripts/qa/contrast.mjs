// WCAG 2.x contrast for every text/background pair the UI uses, in both themes, read from the real
// tokens in app/globals.css and the code themes in lib/highlight.ts. Exits 1 if any pair fails.
import { readFileSync } from 'node:fs';

const css = readFileSync('app/globals.css', 'utf8');
const block = (selector) => {
  const m = css.match(new RegExp(`(?:^|\\n)${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`No ${selector} block in globals.css`);
  return Object.fromEntries([...m[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, k, v]) => [k, v]));
};
const themes = { light: block(':root'), dark: block('.dark') };

const hl = readFileSync('lib/highlight.ts', 'utf8');
const codeTheme = (name) => {
  const part = hl.slice(hl.indexOf(`name: '${name}'`));
  const bg = part.match(/'editor\.background': '(#[0-9A-Fa-f]{6})'/)[1];
  const fgs = [...part.slice(0, part.indexOf('};')).matchAll(/foreground: '(#[0-9A-Fa-f]{6})'/g)].map((m) => m[1]);
  return { bg, fgs: [...new Set(fgs)] };
};

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// [foreground token, background token, minimum, where it's used]
const PAIRS = [
  ['text', 'bg', 4.5, 'body text'],
  ['text', 'surface', 4.5, 'text on cards'],
  ['text', 'surface-2', 4.5, 'text on code/inset blocks'],
  ['muted', 'bg', 4.5, 'secondary text'],
  ['muted', 'surface', 4.5, 'secondary text on cards'],
  ['muted', 'surface-2', 4.5, 'secondary text on inset blocks'],
  ['primary', 'bg', 4.5, 'links'],
  ['primary', 'surface', 4.5, 'links on cards'],
  ['primary-hover', 'primary-tint', 4.5, 'light: green pill / active nav text'],
  ['primary', 'primary-tint', 4.5, 'dark: green pill text'],
  ['text', 'primary-tint', 4.5, 'text on selected chips'],
  ['on-primary', 'primary', 4.5, 'solid green pill / button text'],
  ['warn', 'warn-tint', 4.5, '"To do" pill'],
  ['danger', 'danger-tint', 4.5, '"Cancelled" pill'],
  ['danger', 'surface-2', 4.5, 'error text in code-style block'],
  ['control', 'surface', 3, 'form control / checkbox outlines (non-text)'],
  ['control', 'bg', 3, 'form control outlines on the page background'],
  ['control', 'surface-2', 3, 'form control outlines on inset blocks'],
  ['primary', 'surface', 3, 'focus ring (non-text)'],
  ['chart', 'surface', 3, 'chart line (non-text)'],
];

let failures = 0;
for (const [theme, t] of Object.entries(themes)) {
  console.log(`\n${theme.toUpperCase()}`);
  for (const [fg, bg, min, where] of PAIRS) {
    if (theme === 'light' && fg === 'primary' && bg === 'primary-tint') continue; // light uses primary-hover
    if (theme === 'dark' && fg === 'primary-hover' && bg === 'primary-tint') continue; // dark uses primary
    const r = ratio(t[fg], t[bg]);
    const ok = r >= min;
    if (!ok) failures++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (≥${min})  ${fg} on ${bg} — ${where}`);
  }
  const code = codeTheme(theme === 'light' ? 'journey-light' : 'journey-dark');
  for (const fg of code.fgs) {
    const r = ratio(fg, code.bg);
    const ok = r >= 4.5;
    if (!ok) failures++;
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (≥4.5)  code ${fg} on ${code.bg}`);
  }
}
console.log(failures ? `\n✖ ${failures} pair(s) below WCAG AA` : '\n✓ Every pair meets WCAG AA');
process.exit(failures ? 1 : 0);
