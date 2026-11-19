import { Check } from 'lucide-react';
import Link from 'next/link';
import { StatusPill } from '@/components/ui/status-pill';
import { cx } from '@/components/ui/primitives';
import { sprintProgress } from '@/lib/derive/progress';
import { PHASES } from '@/lib/model/enums';
import type { Sprint } from '@/lib/model/types';

/*
 * The road map is a list of stops. Each row draws its own piece of the path as an SVG that stretches
 * to the row's height, so the line always connects no matter how tall a card is. Small, fixed
 * "wobbles" (seeded by the sprint number) give it a hand-drawn feel without being random per build.
 */

/** Deterministic pseudo-random number in [0, 1) from an integer seed. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** A wobbly vertical curve from (50,0) to (50,100) in a 100×100 box. */
function segmentPath(seed: number, side: 1 | -1): string {
  const swing = 16 + seeded(seed) * 14; // how far the path swings sideways
  const x = 50 + side * swing;
  const jitter = (seeded(seed + 7) - 0.5) * 6;
  return `M50,0 C50,14 ${x + jitter},30 ${x},50 S50,86 50,100`;
}

/** A slightly irregular circle so the stops look drawn, not stamped. */
function sketchCircle(seed: number, r = 10, cx = 14, cy = 14): string {
  const points = 18;
  const pts = Array.from({ length: points + 1 }, (_, i) => {
    const a = (i / points) * Math.PI * 2 - Math.PI / 2;
    const rr = r + (seeded(seed * 31 + (i % points)) - 0.5) * 1.1;
    return `${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`;
  });
  return `M${pts.join(' L')}Z`;
}

function Segment({ seed, side, solid, last }: { seed: number; side: 1 | -1; solid: boolean; last: boolean }) {
  if (last) return null;
  const d = segmentPath(seed, side);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-x-0 top-[34px] h-full w-full overflow-visible"
    >
      {/* faint second stroke = pencil feel */}
      <path
        d={d}
        transform="translate(1.5 0)"
        fill="none"
        className={solid ? 'stroke-primary/25' : 'stroke-border'}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={d}
        fill="none"
        className={solid ? 'stroke-primary' : 'stroke-border-strong'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={solid ? undefined : '1 7'}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Stop({ sprint }: { sprint: Sprint }) {
  const d = sketchCircle(sprint.number + 3);
  const done = sprint.status === 'done';
  const current = sprint.status === 'in-progress';
  return (
    <span className="relative z-10 grid size-7 place-items-center">
      <svg aria-hidden="true" viewBox="0 0 28 28" className="absolute inset-0 size-7 overflow-visible">
        {current && <path d={sketchCircle(sprint.number + 11, 13.5)} fill="none" className="stroke-primary/40" strokeWidth={1.25} />}
        <path
          d={d}
          className={cx(done ? 'fill-primary stroke-primary' : current ? 'fill-surface stroke-primary' : 'fill-bg stroke-border-strong')}
          strokeWidth={current ? 2.25 : 1.75}
          strokeLinejoin="round"
        />
        {current && <circle cx="14" cy="14" r="4" className="fill-primary" />}
      </svg>
      {done && <Check className="relative size-3.5 text-on-primary" strokeWidth={3} aria-hidden="true" />}
    </span>
  );
}

function StopCard({ sprint, align }: { sprint: Sprint; align: 'left' | 'right' }) {
  const p = sprintProgress(sprint);
  const current = sprint.status === 'in-progress';
  return (
    <Link
      href={`/sprints/${sprint.slug}`}
      className={cx(
        'group block rounded-lg border bg-surface p-4 transition-colors duration-150 hover:border-border-strong sm:p-5',
        current ? 'border-primary/60 ring-1 ring-primary/20' : 'border-border',
        align === 'right' && 'lg:text-right',
      )}
    >
      <span className={cx('flex flex-wrap items-center gap-2', align === 'right' && 'lg:justify-end')}>
        <span className="text-sm font-medium text-muted">Sprint {sprint.number}</span>
        <span aria-hidden="true" className="text-border-strong">
          ·
        </span>
        <span className="text-sm text-muted">{sprint.duration}</span>
      </span>
      <span className="mt-1.5 block font-serif text-xl font-medium leading-snug text-text group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-[1.4rem]">
        {sprint.title}
      </span>
      <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted">{sprint.goal}</span>
      <span className={cx('mt-3 flex items-center gap-3', align === 'right' && 'lg:justify-end')}>
        <StatusPill status={sprint.status} kind="sprint" />
        {sprint.status !== 'upcoming' && (
          <span className="text-sm text-muted">
            {p.checksDone} of {p.checksTotal} on checklist
          </span>
        )}
      </span>
    </Link>
  );
}

function StraightSegment({ solid }: { solid: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 top-[34px] h-full w-full">
      <path
        d="M50,0 L50,100"
        fill="none"
        className={solid ? 'stroke-primary' : 'stroke-border-strong'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={solid ? undefined : '1 7'}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function RoadMap({ sprints }: { sprints: Sprint[] }) {
  const sorted = [...sprints].sort((a, b) => a.number - b.number);
  const rows: ({ kind: 'phase'; phase: (typeof PHASES)[number]; n: number; solid: boolean } | { kind: 'stop'; sprint: Sprint; i: number })[] = [];
  let phaseCount = 0;
  sorted.forEach((sprint, i) => {
    const prev = sorted[i - 1];
    if (!prev || prev.phase !== sprint.phase) {
      const phase = PHASES.find((p) => p.value === sprint.phase) ?? PHASES[0];
      phaseCount += 1;
      // A phase row sits between two stops; the line through it is solid when the stop above is done.
      rows.push({ kind: 'phase', phase, n: phaseCount, solid: prev?.status === 'done' });
    }
    rows.push({ kind: 'stop', sprint, i });
  });

  return (
    <ol className="relative">
      {rows.map((row) => {
        if (row.kind === 'phase') {
          return (
            <li
              key={`phase-${row.phase.value}`}
              className="relative grid grid-cols-[2.25rem_1fr] gap-x-3 pb-5 lg:grid-cols-[1fr_7rem_1fr] lg:gap-x-0"
            >
              <div className="relative col-start-1 row-start-1 lg:col-start-2">{row.n > 1 && <StraightSegment solid={row.solid} />}</div>
              <h2 className="col-start-2 row-start-1 flex items-baseline gap-3 pt-6 lg:col-span-3 lg:col-start-1 lg:grid lg:grid-cols-[1fr_7rem_1fr] lg:gap-0">
                <span className="text-sm font-medium text-muted lg:pr-4 lg:text-right">Part {row.n}</span>
                <span className="hidden lg:block" />
                <span className="text-base font-semibold text-text lg:pl-4">{row.phase.label}</span>
              </h2>
            </li>
          );
        }
        const { sprint, i } = row;
        const isLast = i === sorted.length - 1;
        const next = sorted[i + 1];
        const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
        const cardLeft = i % 2 === 1; // desktop: alternate sides
        // The next row is a phase heading when the phase changes: draw straight into it.
        const intoPhase = next !== undefined && next.phase !== sprint.phase;
        return (
          <li
            key={sprint.slug}
            className="relative grid grid-cols-[2.25rem_1fr] gap-x-3 pb-6 lg:grid-cols-[1fr_7rem_1fr] lg:gap-x-0 lg:pb-4"
          >
            <div className={cx('hidden lg:block', cardLeft && 'lg:pr-2')}>{cardLeft && <StopCard sprint={sprint} align="right" />}</div>
            <div className="relative col-start-1 row-start-1 flex justify-center pt-[20px] lg:col-start-2">
              {intoPhase ? (
                <StraightSegment solid={sprint.status === 'done'} />
              ) : (
                <Segment seed={sprint.number} side={side} solid={sprint.status === 'done'} last={isLast} />
              )}
              <Stop sprint={sprint} />
            </div>
            <div className={cx('col-start-2 row-start-1 lg:col-start-3', cardLeft ? 'lg:hidden' : 'lg:pl-2')}>
              <StopCard sprint={sprint} align="left" />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
