import { formatDate } from '@/lib/derive/dates';
import type { BadgeStatus } from '@/lib/derive/badges';
import { cx } from '@/components/ui/primitives';
import { BadgeMedallion } from './badge-medallion';
import { NewBadgeFlag } from './new-badge-flag';

/** All badges, unlocked first in wall order; locked ones are greyed with how to unlock them. */
export function BadgeWall({ statuses }: { statuses: BadgeStatus[] }) {
  const ordered = [...statuses.filter((s) => s.unlocked), ...statuses.filter((s) => !s.unlocked)];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((s) => (
        <li
          key={s.badge.slug}
          className={cx(
            'flex gap-4 rounded-lg border p-4',
            s.unlocked ? 'border-border bg-surface' : 'border-dashed border-border-strong bg-transparent',
          )}
        >
          <BadgeMedallion icon={s.badge.icon} unlocked={s.unlocked} size={56} className={s.unlocked ? 'badge-medallion' : ''} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cx('font-medium', s.unlocked ? 'text-text' : 'text-muted')}>{s.badge.name}</p>
              {s.unlocked && <NewBadgeFlag unlockedOn={s.unlockedOn} />}
            </div>
            {s.unlocked ? (
              <>
                <p className="mt-0.5 text-sm text-muted">{s.badge.description}</p>
                <p className="mt-1.5 font-mono text-xs text-muted tabular">
                  {s.unlockedOn ? `Unlocked ${formatDate(s.unlockedOn)}` : 'Unlocked'}
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm text-text">
                  <span className="sr-only">Locked. </span>
                  {s.howToUnlock}
                </p>
                {s.progress && (
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <div
                      role="progressbar"
                      aria-label={`${s.badge.name} progress`}
                      aria-valuemin={0}
                      aria-valuemax={s.progress.target}
                      aria-valuenow={Math.min(s.progress.current, s.progress.target)}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border"
                    >
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.min(100, (s.progress.current / s.progress.target) * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-muted tabular">
                      {Math.min(s.progress.current, s.progress.target)}/{s.progress.target}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
