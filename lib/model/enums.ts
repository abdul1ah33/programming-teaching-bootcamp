/** Shared option lists used by the Keystatic schema and the site. */

export const PHASES = [
  { value: 'thinking', label: 'Thinking like a programmer', short: 'Thinking' },
  { value: 'python', label: 'Python', short: 'Python' },
  { value: 'c', label: 'The C language', short: 'C' },
  { value: 'capstone', label: 'Capstone', short: 'Capstone' },
] as const;
export type Phase = (typeof PHASES)[number]['value'];

export const SPRINT_STATUSES = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number]['value'];

export const SESSION_STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'done', label: 'Done' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number]['value'];

export const HOMEWORK_STATUSES = [
  { value: 'assigned', label: 'Assigned' },
  { value: 'reviewed', label: 'Reviewed' },
] as const;
export type HomeworkStatus = (typeof HOMEWORK_STATUSES)[number]['value'];

export const PROJECT_STATUSES = [
  { value: 'in-progress', label: 'In progress' },
  { value: 'finished', label: 'Finished' },
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]['value'];

export const FILE_TYPES = [
  { value: 'slides', label: 'Slides' },
  { value: 'notes', label: 'Notes' },
  { value: 'exercises', label: 'Exercises' },
  { value: 'solution', label: 'Solution' },
  { value: 'other', label: 'Other' },
] as const;
export type FileType = (typeof FILE_TYPES)[number]['value'];

export const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C' },
] as const;
export type Language = (typeof LANGUAGES)[number]['value'];

/** Lucide icon names available for badges and "What's next" fields. */
export const ICONS = [
  'terminal', 'code', 'braces', 'repeat', 'git-branch', 'list', 'package', 'file-text', 'bug',
  'cpu', 'memory-stick', 'layers', 'network', 'trophy', 'star', 'flag', 'rocket', 'compass',
  'award', 'medal', 'target', 'zap', 'calendar-check', 'hammer', 'puzzle', 'brain', 'globe',
  'gamepad-2', 'smartphone', 'server', 'bot', 'circuit-board', 'book-open', 'lightbulb',
] as const;
export type IconName = (typeof ICONS)[number];
