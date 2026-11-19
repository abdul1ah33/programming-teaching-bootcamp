import Link from 'next/link';
import { getPointsLog, getSettings } from '@/lib/content';
import { totalPoints } from '@/lib/derive/points';
import { Container } from '@/components/ui/primitives';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';
import { PointsLink } from './points-link';
import { ThemeToggle } from './theme-toggle';

export function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-[6px] bg-primary font-mono text-[0.7rem] font-medium text-on-primary"
    >
      &gt;_
    </span>
  );
}

export async function SiteHeader() {
  const [settings, log] = await Promise.all([getSettings(), getPointsLog()]);
  const total = totalPoints(log, settings.pointsRules);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-[6px] supports-[backdrop-filter]:bg-bg/80 print:hidden">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="-ml-1 flex items-center gap-2.5 rounded-md px-1 py-1">
          <BrandMark />
          <span className="font-serif text-[1.05rem] font-medium leading-none tracking-[-0.01em] text-text">
            Learning Journey
          </span>
        </Link>
        <DesktopNav />
        <div className="flex items-center gap-1.5">
          <PointsLink total={total} />
          <ThemeToggle className="hidden lg:grid" />
          <MobileNav pointsTotal={total} />
        </div>
      </Container>
    </header>
  );
}
