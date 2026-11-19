import Link from 'next/link';
import { Container } from '@/components/ui/primitives';

const LINKS = [
  { href: '/', label: 'Home', note: 'Your next lesson and homework' },
  { href: '/roadmap', label: 'My path', note: 'All ten sprints' },
  { href: '/sessions', label: 'Lessons', note: 'Every lesson, newest first' },
  { href: '/glossary', label: 'Word list', note: 'Coding words explained' },
];

export function NotFoundContent() {
  return (
    <Container className="max-w-[880px] py-16 sm:py-24">
      <p className="text-sm font-medium text-muted">Page not found</p>
      <h1 className="mt-3 font-serif text-[2.4rem] font-medium leading-[1.08] sm:text-5xl">This page doesn’t exist.</h1>
      <div className="mt-6 max-w-[56ch] rounded-md border border-border bg-surface-2 px-4 py-3 font-mono text-sm leading-relaxed">
        <span className="text-muted">&gt;&gt;&gt;</span> page = site[&quot;this address&quot;]
        <br />
        <span className="text-danger">KeyError</span>: &apos;this address&apos;
      </div>
      <p className="mt-5 max-w-[56ch] text-muted">
        The link may be old, or there’s a typo in the address. Try one of these instead:
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-border-strong">
              <span className="block font-medium">{l.label}</span>
              <span className="mt-0.5 block text-sm text-muted">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
