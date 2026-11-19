import { validateContent } from '@/lib/content/validate';

const { errors, warnings, counts } = await validateContent();

console.log(
  'Content read through the Reader API: ' +
    Object.entries(counts)
      .map(([k, v]) => `${k} ${v}`)
      .join(', '),
);
for (const w of warnings) console.warn(`  warning  ${w}`);
for (const e of errors) console.error(`  error    ${e}`);

if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} content error(s).`);
  process.exit(1);
}
console.log(`✓ Content is valid${warnings.length ? ` (${warnings.length} warning(s))` : ''}.`);
