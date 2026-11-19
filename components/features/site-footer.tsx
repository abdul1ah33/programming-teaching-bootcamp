import Link from 'next/link';
import { getSettings } from '@/lib/content';
import { Container } from '@/components/ui/primitives';

export async function SiteFooter() {
  const settings = await getSettings();
  return (
    <footer className="mt-20 border-t border-border print:hidden">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {settings.siteTitle} · a private site for {settings.studentFirstName} and family.
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/plan" className="hover:text-text">
            Learning plan
          </Link>
          <Link href="/reports" className="hover:text-text">
            Monthly reports
          </Link>
          <Link href="/glossary" className="hover:text-text">
            Glossary
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
