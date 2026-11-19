import { evaluateBadges } from '@/lib/derive/badges';
import { toIsoDate } from '@/lib/derive/dates';
import { monthReport, reportMonths, type MonthReport } from '@/lib/derive/reports';
import { getBadges } from './badges';
import { getMonthlyNotes } from './monthly-notes';
import { getPointsLog } from './points';
import { getProjects } from './projects';
import { getSessions } from './sessions';
import { getSettings } from './settings';
import { getSprints } from './sprints';

/** The date the site was built. Reports are static, so "today" for a report is the build date. */
export const buildDate = (): string => toIsoDate(new Date());

/** Months that have a report page in this build (start month → build month). */
export async function getReportMonths(): Promise<string[]> {
  const settings = await getSettings();
  return reportMonths(settings.startDate, buildDate());
}

/** Loads everything a report needs and computes one month. */
export async function getMonthReport(month: string): Promise<MonthReport> {
  const [settings, sprints, sessions, projects, points, badges, notes] = await Promise.all([
    getSettings(),
    getSprints(),
    getSessions(),
    getProjects(),
    getPointsLog(),
    getBadges(),
    getMonthlyNotes(),
  ]);
  const rules = settings.pointsRules;
  const statuses = evaluateBadges({ badges, sprints, sessions, projects, points, rules });
  return monthReport(month, { sprints, sessions, projects, points, rules, badges: statuses, notes }, buildDate());
}
