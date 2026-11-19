/**
 * Plain domain types shared by lib/content (which produces them) and lib/derive (which computes on them).
 * Dates are ISO strings "YYYY-MM-DD"; months are "YYYY-MM".
 */
import type {
  FileType,
  HomeworkStatus,
  IconName,
  Language,
  Phase,
  ProjectStatus,
  SessionStatus,
  SprintStatus,
} from './enums';
import type { ActivityKey, PointsRuleKey } from './points-rules';

export type IsoDate = string;
export type IsoMonth = string;

export interface FileRef {
  label: string;
  type: FileType;
  url: string;
  /** Size in bytes, read at build time; undefined if the file isn't on disk. */
  size?: number;
}

export interface ReadyCheck {
  text: string;
  done: boolean;
  doneOn: IsoDate | null;
}

export interface Sprint {
  slug: string;
  number: number;
  title: string;
  status: SprintStatus;
  completedOn: IsoDate | null;
  phase: Phase;
  duration: string;
  goal: string;
  topics: string[];
  missions: string[];
  build: string;
  readyChecks: ReadyCheck[];
  files: FileRef[];
}

export interface Homework {
  description: string;
  dueDate: IsoDate | null;
  status: HomeworkStatus;
}

export interface Link {
  label: string;
  url: string;
}

export interface Session {
  slug: string;
  number: number;
  title: string;
  date: IsoDate;
  status: SessionStatus;
  sprint: string;
  files: FileRef[];
  homework: Homework | null;
  links: Link[];
}

export interface Project {
  slug: string;
  title: string;
  sprint: string;
  status: ProjectStatus;
  finishedOn: IsoDate | null;
  description: string;
  screenshot: string | null;
  codeLink: string | null;
  whatILearned: string;
}

export interface PointsEntry {
  slug: string;
  title: string;
  activity: ActivityKey;
  /** Points as stored; null means "use the rule's value". */
  points: number | null;
  date: IsoDate;
  sprint: string | null;
  session: string | null;
}

export interface PointsRule {
  key: PointsRuleKey;
  label: string;
  points: number;
}

export type BadgeRule =
  | { kind: 'manual'; earnedOn: IsoDate | null; howToEarn: string }
  | { kind: 'totalPoints'; n: number }
  | { kind: 'sprintCompleted'; sprint: number }
  | { kind: 'phaseCompleted'; phase: Phase }
  | { kind: 'projectsFinished'; n: number }
  | { kind: 'sessionsDone'; n: number }
  | { kind: 'activityCount'; activity: PointsRuleKey; n: number };

export interface Badge {
  slug: string;
  name: string;
  description: string;
  icon: IconName;
  order: number;
  rule: BadgeRule;
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  firstSprint: string;
  explanation: string;
  code: { language: Language; code: string } | null;
  related: string[];
}

export interface CheatSheetItem {
  label: string;
  code: string;
  note: string;
}

export interface CheatSheetSection {
  heading: string;
  sprint: string;
  items: CheatSheetItem[];
}

export interface CheatSheet {
  slug: string;
  title: string;
  language: Language;
  intro: string;
  sections: CheatSheetSection[];
}

export interface MonthlyNote {
  month: IsoMonth;
  highlights: string[];
  focusNextMonth: string[];
  messageToParents: string | null;
}

export interface Field {
  slug: string;
  name: string;
  icon: IconName;
  order: number;
  summary: string;
  whatItIs: string;
  whatYoudLearn: string[];
  firstProject: string;
  buildsOn: { text: string; sprints: string[] };
  goodFitIf: string[];
}

export interface Settings {
  siteTitle: string;
  studentFirstName: string;
  teacherName: string;
  contactEmail: string | null;
  contactWhatsApp: string | null;
  startDate: IsoDate;
  scheduleText: string;
  learningPlanPdf: string | null;
  pointsRules: PointsRule[];
}
