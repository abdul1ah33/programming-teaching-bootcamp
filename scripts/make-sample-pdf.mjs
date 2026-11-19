// Writes a tiny, valid one-page PDF used by the example session. Run once: node scripts/make-sample-pdf.mjs <out>
import { writeFileSync } from 'node:fs';

const out = process.argv[2];
if (!out) throw new Error('Usage: node scripts/make-sample-pdf.mjs <output.pdf>');

const lines = [
  ['F2', 20, 'Session 1 notes (EXAMPLE)'],
  ['F1', 12, 'What is an algorithm?'],
  ['F1', 11, 'An algorithm is a list of clear steps that solves a problem.'],
  ['F1', 11, 'Each step must be exact: someone else should get the same result.'],
  ['F1', 12, 'Inputs -> process -> outputs'],
  ['F1', 11, 'Example: a two-number calculator.'],
  ['F1', 11, 'Inputs: two numbers. Process: add them. Output: the sum.'],
  ['F1', 12, 'Practice'],
  ['F1', 11, '1. Write the steps for making a sandwich.'],
  ['F1', 11, '2. Swap steps with a partner and follow them exactly.'],
  ['F1', 9, 'This is a sample file. Delete it with the example session.'],
];
let y = 770;
const text = lines
  .map(([font, size, str]) => {
    y -= size === 12 ? 30 : size === 20 ? 0 : 18;
    const esc = str.replace(/[\\()]/g, (c) => `\\${c}`);
    return `BT /${font} ${size} Tf 64 ${y} Td (${esc}) Tj ET`;
  })
  .join('\n');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  `<< /Length ${Buffer.byteLength(text)} >>\nstream\n${text}\nendstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
writeFileSync(out, pdf, 'latin1');
console.log(`Wrote ${out} (${pdf.length} bytes)`);
