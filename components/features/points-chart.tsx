'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { daysBetween, formatDate } from '@/lib/derive/dates';
import type { PointsDay } from '@/lib/derive/points';

const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

/** Round up to a friendly axis maximum (10, 20, 25, 50, 100, …). */
function niceMax(value: number): number {
  if (value <= 10) return 10;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * pow >= value) return m * pow;
  return 10 * pow;
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/**
 * Cumulative points over time: one series, so no legend — the heading names it.
 * Step line (the total only changes when points are logged), a 10% area wash, hairline grid,
 * crosshair + tooltip that snaps to the nearest day, arrow-key navigation, and a table view.
 */
export function PointsChart({ series }: { series: PointsDay[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const tableId = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(280, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const first = series[0];
  const last = series.at(-1);
  if (!first || !last) return null;

  // Time scale: pad a single day so the line has some length.
  const start = series.length === 1 ? addDays(first.date, -3) : first.date;
  const end = series.length === 1 ? addDays(first.date, 3) : last.date;
  const span = Math.max(1, daysBetween(start, end));
  const yMax = niceMax(last.total);
  const innerW = width - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (date: string) => PAD.left + (daysBetween(start, date) / span) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  // Step-after path starting from zero at the first day.
  const pts = series.map((d) => ({ ...d, px: x(d.date), py: y(d.total) }));
  let line = `M${x(start).toFixed(1)},${y(0).toFixed(1)}`;
  let prevY = y(0);
  for (const p of pts) {
    line += ` L${p.px.toFixed(1)},${prevY.toFixed(1)} L${p.px.toFixed(1)},${p.py.toFixed(1)}`;
    prevY = p.py;
  }
  line += ` L${x(end).toFixed(1)},${prevY.toFixed(1)}`;
  const area = `${line} L${x(end).toFixed(1)},${y(0).toFixed(1)} Z`;

  const ticks = [0, yMax / 2, yMax];
  // A handful of date labels: first, last, and evenly spaced ones between (no collisions).
  const labelCount = Math.max(2, Math.min(5, Math.floor(innerW / 110)));
  const candidates = [...new Set(Array.from({ length: labelCount }, (_, i) => addDays(start, Math.round((span * i) / (labelCount - 1)))))];
  // Keep labels at least 70px apart; the last date always gets a label.
  const dateTicks: string[] = [];
  for (const d of candidates) {
    const prev = dateTicks.at(-1);
    const isLast = d === candidates.at(-1);
    if (prev !== undefined && x(d) - x(prev) < 70) {
      if (isLast) dateTicks[dateTicks.length - 1] = d;
      continue;
    }
    dateTicks.push(d);
  }

  const nearest = (clientX: number) => {
    const rect = wrap.current?.getBoundingClientRect();
    if (!rect) return null;
    const px = clientX - rect.left;
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p.px - px) < Math.abs((pts[best]?.px ?? 0) - px)) best = i;
    });
    return best;
  };

  const a = active !== null ? pts[active] : undefined;

  return (
    <figure>
      <div
        ref={wrap}
        className="relative touch-pan-y"
        onPointerMove={(e) => setActive(nearest(e.clientX))}
        onPointerLeave={() => setActive(null)}
      >
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`Points over time: ${last.total} points by ${formatDate(last.date)}. Use the arrow keys to read each day, or see the table below.`}
          tabIndex={0}
          onFocus={() => setActive((v) => v ?? pts.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setActive((v) => Math.min(pts.length - 1, (v ?? -1) + 1));
            if (e.key === 'ArrowLeft') setActive((v) => Math.max(0, (v ?? pts.length) - 1));
            if (e.key === 'Home') setActive(0);
            if (e.key === 'End') setActive(pts.length - 1);
          }}
          className="block max-w-full overflow-visible rounded-md focus-visible:outline-offset-4"
        >
          {/* grid + y labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px] tabular">
                {t}
              </text>
            </g>
          ))}
          {/* x labels */}
          {dateTicks.map((d, i) => (
            <text
              key={d}
              x={x(d)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? 'start' : i === dateTicks.length - 1 ? 'end' : 'middle'}
              className="fill-muted font-mono text-[11px] tabular"
            >
              {formatDate(d, 'day-month')}
            </text>
          ))}
          <path d={area} className="fill-chart" fillOpacity={0.1} />
          <path d={line} fill="none" className="stroke-chart" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* end dot with a surface ring */}
          <circle cx={pts.at(-1)?.px} cy={pts.at(-1)?.py} r={4.5} className="fill-chart stroke-surface" strokeWidth={2} />
          {a && (
            <g>
              <line x1={a.px} x2={a.px} y1={PAD.top} y2={PAD.top + innerH} className="stroke-border-strong" strokeWidth={1} />
              <circle cx={a.px} cy={a.py} r={4.5} className="fill-chart stroke-surface" strokeWidth={2} />
            </g>
          )}
        </svg>
        {a && (
          <div
            role="status"
            className="pointer-events-none absolute top-1 z-10 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs shadow-[0_4px_12px_-6px_rgb(0_0_0/0.2)]"
            style={{
              left: Math.min(Math.max(a.px - 60, 0), width - 128),
            }}
          >
            <p className="font-mono text-sm font-medium text-text tabular">{a.total} points</p>
            <p className="text-muted">
              <span className="font-mono tabular">+{a.points}</span> on {formatDate(a.date)}
            </p>
          </div>
        )}
      </div>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-text">Show as a table</summary>
        <table id={tableId} className="mt-2 w-full max-w-md text-left">
          <thead className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="py-1.5 font-normal">Date</th>
              <th scope="col" className="py-1.5 text-right font-normal">Earned</th>
              <th scope="col" className="py-1.5 text-right font-normal">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono tabular">
            {series.map((d) => (
              <tr key={d.date}>
                <td className="py-1.5">{formatDate(d.date)}</td>
                <td className="py-1.5 text-right">+{d.points}</td>
                <td className="py-1.5 text-right">{d.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
