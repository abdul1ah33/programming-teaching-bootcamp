import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { POINTS_RULES } from '@/lib/model/points-rules';
import { getBadges } from './badges';
import { getCheatSheets } from './cheatsheets';
import { getFields } from './fields';
import { getGlossary } from './glossary';
import { getMonthlyNotes } from './monthly-notes';
import { getPointsLog } from './points';
import { getProjects } from './projects';
import { getSessions } from './sessions';
import { getSettings } from './settings';
import { getSprints } from './sprints';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  counts: Record<string, number>;
}

const SOFT_FILE_LIMIT = 15 * 1024 * 1024;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Reads every collection and singleton through the Reader API (which itself rejects entries that
 * don't match the schema) and checks the things the schema can't: references, uniqueness, files on
 * disk, and that the points rules in code and settings agree.
 */
export async function validateContent(root = process.cwd()): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  const [settings, sprints, sessions, projects, points, badges, glossary, cheatsheets, notes, fields] =
    await Promise.all([
      getSettings(),
      getSprints(),
      getSessions(),
      getProjects(),
      getPointsLog(),
      getBadges(),
      getGlossary(),
      getCheatSheets(),
      getMonthlyNotes(),
      getFields(),
    ]);

  const sprintSlugs = new Set(sprints.map((s) => s.slug));
  const sessionSlugs = new Set(sessions.map((s) => s.slug));
  const termSlugs = new Set(glossary.map((t) => t.slug));

  const checkSprint = (where: string, slug: string | null) => {
    if (slug !== null && !sprintSlugs.has(slug)) errors.push(`${where}: unknown sprint "${slug}"`);
  };
  const checkDate = (where: string, date: string | null) => {
    if (date !== null && (!ISO_DATE.test(date) || Number.isNaN(Date.parse(date)))) {
      errors.push(`${where}: "${date}" is not a valid date (YYYY-MM-DD)`);
    }
  };
  const checkFile = (where: string, url: string | null) => {
    if (url === null) return;
    if (!url.startsWith('/')) {
      errors.push(`${where}: file path "${url}" must start with /`);
      return;
    }
    const onDisk = path.join(root, 'public', decodeURIComponent(url));
    if (!existsSync(onDisk)) {
      errors.push(`${where}: file "${url}" is missing from public/`);
      return;
    }
    const size = statSync(onDisk).size;
    if (size > SOFT_FILE_LIMIT) {
      warnings.push(`${where}: "${url}" is ${(size / 1024 / 1024).toFixed(1)} MB (soft limit 15 MB)`);
    }
  };

  // Settings
  checkDate('settings.startDate', settings.startDate);
  checkFile('settings.learningPlanPdf', settings.learningPlanPdf);
  if (!settings.studentFirstName.trim()) errors.push('settings: student first name is empty');
  for (const rule of POINTS_RULES) {
    const inSettings = settings.pointsRules.find((r) => r.key === rule.key);
    if (!inSettings) errors.push(`settings.pointsRules: missing rule "${rule.key}" (defined in lib/model/points-rules.ts)`);
    else if (inSettings.points !== rule.points) {
      errors.push(
        `settings.pointsRules: "${rule.key}" is ${inSettings.points} points in settings but ${rule.points} in lib/model/points-rules.ts`,
      );
    }
  }
  const ruleKeys = settings.pointsRules.map((r) => r.key);
  if (new Set(ruleKeys).size !== ruleKeys.length) errors.push('settings.pointsRules: an activity is listed twice');

  // Sprints
  const numbers = sprints.map((s) => s.number);
  if (new Set(numbers).size !== numbers.length) errors.push('sprints: two sprints share the same number');
  if (sprints.filter((s) => s.status === 'in-progress').length > 1) {
    warnings.push('sprints: more than one sprint is "in progress"');
  }
  for (const s of sprints) {
    const where = `sprints/${s.slug}`;
    checkDate(`${where}.completedOn`, s.completedOn);
    if (s.status === 'done' && !s.completedOn) warnings.push(`${where}: status is Done but "Completed on" is empty`);
    s.readyChecks.forEach((c, i) => checkDate(`${where}.readyChecks[${i}].doneOn`, c.doneOn));
    s.files.forEach((f, i) => checkFile(`${where}.files[${i}]`, f.url));
  }

  // Sessions
  for (const s of sessions) {
    const where = `sessions/${s.slug}`;
    if (!/^[1-9]\d*$/.test(s.slug)) errors.push(`${where}: session file name must be a number`);
    checkSprint(where, s.sprint);
    checkDate(`${where}.date`, s.date);
    checkDate(`${where}.homework.dueDate`, s.homework?.dueDate ?? null);
    s.files.forEach((f, i) => checkFile(`${where}.files[${i}]`, f.url));
  }

  // Projects
  for (const p of projects) {
    const where = `projects/${p.slug}`;
    checkSprint(where, p.sprint);
    checkDate(`${where}.finishedOn`, p.finishedOn);
    checkFile(`${where}.screenshot`, p.screenshot);
    if (p.status === 'finished' && !p.finishedOn) warnings.push(`${where}: status is Finished but "Finished on" is empty`);
  }

  // Points
  for (const e of points) {
    const where = `points/${e.slug}`;
    checkSprint(where, e.sprint);
    checkDate(`${where}.date`, e.date);
    if (e.session !== null && !sessionSlugs.has(e.session)) errors.push(`${where}: unknown session "${e.session}"`);
  }

  // Badges
  for (const b of badges) {
    const where = `badges/${b.slug}`;
    const r = b.rule;
    if (r.kind === 'sprintCompleted' && !numbers.includes(r.sprint)) errors.push(`${where}: no sprint number ${r.sprint}`);
    if (r.kind === 'manual') checkDate(`${where}.earnedOn`, r.earnedOn);
    if (r.kind === 'activityCount' && !POINTS_RULES.some((p) => p.key === r.activity)) {
      errors.push(`${where}: unknown activity "${r.activity}"`);
    }
    if (r.kind === 'phaseCompleted' && !sprints.some((s) => s.phase === r.phase)) {
      errors.push(`${where}: no sprints in phase "${r.phase}"`);
    }
  }

  // Glossary
  for (const t of glossary) {
    const where = `glossary/${t.slug}`;
    checkSprint(where, t.firstSprint);
    for (const rel of t.related) {
      if (!termSlugs.has(rel)) errors.push(`${where}: unknown related term "${rel}"`);
      if (rel === t.slug) errors.push(`${where}: lists itself as related`);
    }
  }

  // Cheat sheets
  for (const c of cheatsheets) {
    c.sections.forEach((s, i) => checkSprint(`cheatsheets/${c.slug}.sections[${i}]`, s.sprint));
  }

  // Monthly notes
  for (const n of notes) {
    if (!ISO_MONTH.test(n.month)) errors.push(`monthly-notes/${n.month}: file name must be YYYY-MM`);
  }

  // Fields
  for (const f of fields) {
    f.buildsOn.sprints.forEach((s) => checkSprint(`fields/${f.slug}.buildsOn`, s));
  }

  return {
    errors,
    warnings,
    counts: {
      sprints: sprints.length,
      sessions: sessions.length,
      projects: projects.length,
      points: points.length,
      badges: badges.length,
      glossary: glossary.length,
      cheatsheets: cheatsheets.length,
      monthlyNotes: notes.length,
      fields: fields.length,
    },
  };
}
