import type { IsoDate, Session } from '@/lib/model/types';

const byDateThenNumber = (a: Session, b: Session) => a.date.localeCompare(b.date) || a.number - b.number;

/**
 * The next planned session on or after today. Call this on the client with the viewer's real date,
 * so it never goes stale between deploys.
 */
export function nextSession(sessions: readonly Session[], today: IsoDate): Session | undefined {
  return sessions.filter((s) => s.status === 'planned' && s.date >= today).sort(byDateThenNumber)[0];
}

/** Sessions that happened (Done), newest first. */
export function recentSessions(sessions: readonly Session[], limit = 3): Session[] {
  return sessions
    .filter((s) => s.status === 'done')
    .sort((a, b) => byDateThenNumber(b, a))
    .slice(0, limit);
}

export function sessionsDone(sessions: readonly Session[]): number {
  return sessions.filter((s) => s.status === 'done').length;
}

/** All sessions for a timeline, newest first. */
export function timeline(sessions: readonly Session[]): Session[] {
  return [...sessions].sort((a, b) => byDateThenNumber(b, a));
}

export function sessionsForSprint(sessions: readonly Session[], sprintSlug: string): Session[] {
  return sessions.filter((s) => s.sprint === sprintSlug).sort(byDateThenNumber);
}

/**
 * The lesson to show as "current": one happening today (unless cancelled), otherwise the most recent
 * lesson that's been marked Done on or before today. Call it on the client with the viewer's date.
 */
export function currentSession(sessions: readonly Session[], today: IsoDate): Session | undefined {
  const todays = sessions.filter((s) => s.date === today && s.status !== 'cancelled').sort(byDateThenNumber)[0];
  if (todays) return todays;
  return sessions
    .filter((s) => s.status === 'done' && s.date <= today)
    .sort((a, b) => byDateThenNumber(b, a))[0];
}
