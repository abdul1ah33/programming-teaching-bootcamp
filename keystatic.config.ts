import { collection, config, fields, singleton } from '@keystatic/core';
import {
  FILE_TYPES,
  HOMEWORK_STATUSES,
  ICONS,
  LANGUAGES,
  PHASES,
  PROJECT_STATUSES,
  SESSION_STATUSES,
  SPRINT_STATUSES,
} from './lib/model/enums';
import { CUSTOM_ACTIVITY, POINTS_RULES } from './lib/model/points-rules';

/* ------------------------------------------------------------------
   Storage: local files in development, GitHub in production.
   Set NEXT_PUBLIC_KEYSTATIC_STORAGE=github and NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=owner/repo
   on Vercel to switch (see README). NEXT_PUBLIC_ because the admin UI runs in the browser.
   ------------------------------------------------------------------ */
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO ?? '';
const useGitHub = process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE === 'github' && githubRepo.includes('/');
const [repoOwner = '', repoName = ''] = githubRepo.split('/');

const storage = useGitHub
  ? ({ kind: 'github', repo: { owner: repoOwner, name: repoName } } as const)
  : ({ kind: 'local' } as const);

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */
const options = <T extends readonly { value: string; label: string }[]>(list: T) =>
  list.map(({ value, label }) => ({ value, label })) as { value: T[number]['value']; label: string }[];

const slugify = (input: string) =>
  input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const todayIso = () => new Date().toISOString().slice(0, 10);

/** An attached file (PDF, slides, image, zip…). Uploads go to public/files/<folder>/<entry>/. */
const fileList = (folder: 'sprints' | 'sessions', description: string) =>
  fields.array(
    fields.object({
      label: fields.text({ label: 'Label', description: 'What people will see, e.g. "Loops — slides".', validation: { isRequired: true } }),
      type: fields.select({ label: 'Type', options: options(FILE_TYPES), defaultValue: 'notes' }),
      file: fields.file({
        label: 'File',
        description: 'Keep files under ~15 MB. Put videos on YouTube (unlisted) and add them as a link instead.',
        directory: `public/files/${folder}`,
        publicPath: `/files/${folder}/`,
        validation: { isRequired: true },
      }),
    }),
    { label: 'Files', description, itemLabel: (props) => props.fields.label.value || 'New file' },
  );

const textList = (label: string, description?: string) =>
  fields.array(fields.text({ label, validation: { isRequired: true } }), {
    label,
    description,
    itemLabel: (props) => props.value || 'New item',
  });

/* ------------------------------------------------------------------
   Points: choosing an activity shows a points field prefilled with that rule's value.
   ------------------------------------------------------------------ */
const pointsValues = Object.fromEntries([
  ...POINTS_RULES.map((rule) => [
    rule.key,
    fields.integer({ label: 'Points', defaultValue: rule.points, validation: { isRequired: true, min: 0 } }),
  ]),
  [CUSTOM_ACTIVITY, fields.integer({ label: 'Points', defaultValue: 5, validation: { isRequired: true, min: 0 } })],
]) as Record<(typeof POINTS_RULES)[number]['key'] | typeof CUSTOM_ACTIVITY, ReturnType<typeof fields.integer<true>>>;

const activityOptions = [
  ...POINTS_RULES.map((rule) => ({ value: rule.key, label: `${rule.label} (${rule.points})` })),
  { value: CUSTOM_ACTIVITY, label: 'Custom' } as const,
];

/* ------------------------------------------------------------------
   Config
   ------------------------------------------------------------------ */
export default config({
  storage,
  ui: {
    brand: { name: 'Learning Journey' },
    navigation: {
      'Day to day': ['sessions', 'points', 'monthlyNotes'],
      Curriculum: ['sprints', 'projects', 'badges'],
      Reference: ['glossary', 'cheatsheets', 'fields'],
      Site: ['settings'],
    },
  },

  singletons: {
    settings: singleton({
      label: 'Settings',
      path: 'content/settings',
      format: { data: 'yaml' },
      schema: {
        siteTitle: fields.text({ label: 'Site title', defaultValue: 'The Programming Learning Journey', validation: { isRequired: true } }),
        studentFirstName: fields.text({ label: 'Student first name', description: 'First name only — the student is a minor.', validation: { isRequired: true } }),
        teacherName: fields.text({ label: 'Teacher name', validation: { isRequired: true } }),
        contactEmail: fields.text({ label: 'Contact email' }),
        contactWhatsApp: fields.text({ label: 'WhatsApp link', description: 'e.g. https://wa.me/441234567890 — leave empty to hide.' }),
        startDate: fields.date({ label: 'Start date', description: 'First month of monthly reports.', validation: { isRequired: true } }),
        scheduleText: fields.text({ label: 'Weekly schedule', multiline: true, description: 'Plain text, e.g. "Tuesdays and Saturdays, 5–6:30 pm".' }),
        learningPlanPdf: fields.file({
          label: 'Learning plan PDF',
          directory: 'public/files/plan',
          publicPath: '/files/plan/',
        }),
        pointsRules: fields.array(
          fields.object({
            key: fields.select({
              label: 'Activity',
              options: POINTS_RULES.map((r) => ({ value: r.key, label: r.label })),
              defaultValue: POINTS_RULES[0].key,
            }),
            label: fields.text({ label: 'Shown as', validation: { isRequired: true } }),
            points: fields.integer({ label: 'Points', validation: { isRequired: true, min: 0 } }),
          }),
          {
            label: 'Points rules',
            description: 'How points are earned, shown on the Points page. Keep in step with lib/model/points-rules.ts.',
            itemLabel: (props) => `${props.fields.label.value} — ${props.fields.points.value ?? 0}`,
          },
        ),
      },
    }),
  },

  collections: {
    sprints: collection({
      label: 'Sprints',
      path: 'content/sprints/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['number', 'status'],
      parseSlugForSort: (slug) => slug,
      schema: {
        number: fields.integer({ label: 'Sprint number', validation: { isRequired: true, min: 0, max: 99 } }),
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        status: fields.select({ label: 'Status', options: options(SPRINT_STATUSES), defaultValue: 'upcoming' }),
        completedOn: fields.date({ label: 'Completed on', description: 'Set when the status becomes Done. Used for badges and monthly reports.' }),
        phase: fields.select({ label: 'Phase', options: options(PHASES), defaultValue: 'python' }),
        duration: fields.text({ label: 'Duration', description: 'An estimate, e.g. "2–3 weeks".', validation: { isRequired: true } }),
        goal: fields.text({ label: 'Goal', multiline: true, validation: { isRequired: true } }),
        topics: textList('Topics', "What you'll learn."),
        missions: textList('Practice missions'),
        build: fields.text({ label: "What you'll build", multiline: true, validation: { isRequired: true } }),
        readyChecks: fields.array(
          fields.object({
            text: fields.text({ label: 'Check', validation: { isRequired: true } }),
            done: fields.checkbox({ label: 'Done', defaultValue: false }),
            doneOn: fields.date({ label: 'Done on', description: 'Optional. Used in the monthly report.' }),
          }),
          {
            label: 'Ready to move on when…',
            itemLabel: (props) => `${props.fields.done.value ? '✓' : '○'} ${props.fields.text.value}`,
          },
        ),
        files: fileList('sprints', 'Reference sheets, slides or anything for the whole sprint.'),
      },
    }),

    sessions: collection({
      label: 'Sessions',
      path: 'content/sessions/*',
      format: { contentField: 'summary' },
      slugField: 'number',
      columns: ['title', 'date', 'status'],
      parseSlugForSort: (slug) => Number(slug) || 0,
      entryLayout: 'form',
      schema: {
        number: fields.text({
          label: 'Session number',
          description: 'Just the number, e.g. 12. It becomes the page address /sessions/12.',
          validation: { isRequired: true, pattern: { regex: /^[1-9]\d{0,3}$/, message: 'Use a whole number like 12.' } },
        }),
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        date: fields.date({ label: 'Date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        status: fields.select({ label: 'Status', options: options(SESSION_STATUSES), defaultValue: 'planned' }),
        sprint: fields.relationship({ label: 'Sprint', collection: 'sprints', validation: { isRequired: true } }),
        files: fileList('sessions', 'Slides, notes, exercise sheets, solutions.'),
        homework: fields.object(
          {
            description: fields.text({ label: 'Homework', multiline: true, description: 'Leave empty if there is no homework.' }),
            dueDate: fields.date({ label: 'Due date' }),
            status: fields.select({ label: 'Homework status', options: options(HOMEWORK_STATUSES), defaultValue: 'assigned' }),
          },
          { label: 'Homework' },
        ),
        links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label', validation: { isRequired: true } }),
            url: fields.url({ label: 'URL', validation: { isRequired: true } }),
          }),
          { label: 'Links', itemLabel: (props) => props.fields.label.value || 'New link' },
        ),
        summary: fields.markdoc({ label: 'Summary', description: 'What we covered. Optional.' }),
      },
    }),

    projects: collection({
      label: 'Projects',
      path: 'content/projects/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['status'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        sprint: fields.relationship({ label: 'Sprint', collection: 'sprints', validation: { isRequired: true } }),
        status: fields.select({ label: 'Status', options: options(PROJECT_STATUSES), defaultValue: 'in-progress' }),
        finishedOn: fields.date({ label: 'Finished on', description: 'Set when the status becomes Finished.' }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        screenshot: fields.image({ label: 'Screenshot', directory: 'public/images/projects', publicPath: '/images/projects/' }),
        codeLink: fields.url({ label: 'Code link', description: 'Optional, e.g. a GitHub or Replit link.' }),
        whatILearned: fields.text({ label: 'What I learned', multiline: true }),
      },
    }),

    points: collection({
      label: 'Points log',
      path: 'content/points/*',
      format: { data: 'yaml' },
      slugField: 'title',
      columns: ['date'],
      schema: {
        title: fields.slug({
          name: { label: 'What happened', description: 'e.g. "Fixed the infinite loop himself"', validation: { isRequired: true } },
          slug: { generate: (name) => `${todayIso()}-${slugify(name)}` },
        }),
        activity: fields.conditional(
          fields.select({ label: 'Activity', options: activityOptions, defaultValue: POINTS_RULES[0].key }),
          pointsValues,
        ),
        date: fields.date({ label: 'Date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        sprint: fields.relationship({ label: 'Sprint (optional)', collection: 'sprints' }),
        session: fields.relationship({ label: 'Session (optional)', collection: 'sessions' }),
      },
    }),

    badges: collection({
      label: 'Badges',
      path: 'content/badges/*',
      format: { data: 'yaml' },
      slugField: 'name',
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Short description', validation: { isRequired: true } }),
        icon: fields.select({ label: 'Icon', options: ICONS.map((i) => ({ value: i, label: i })), defaultValue: 'award' }),
        order: fields.integer({ label: 'Order on the badge wall', defaultValue: 100 }),
        rule: fields.conditional(
          fields.select({
            label: 'Unlocks when',
            options: [
              { value: 'manual', label: 'I award it by hand' },
              { value: 'totalPoints', label: 'Total points reach N' },
              { value: 'sprintCompleted', label: 'A sprint is completed' },
              { value: 'phaseCompleted', label: 'A phase is completed' },
              { value: 'projectsFinished', label: 'N projects finished' },
              { value: 'sessionsDone', label: 'N sessions done' },
              { value: 'activityCount', label: 'An activity is logged N times' },
            ],
            defaultValue: 'manual',
          }),
          {
            manual: fields.object({
              earnedOn: fields.date({ label: 'Earned on', description: 'Leave empty while it is still locked.' }),
              howToEarn: fields.text({ label: 'How to earn it', description: 'Shown while locked.' }),
            }),
            totalPoints: fields.integer({ label: 'Points needed', defaultValue: 100, validation: { isRequired: true, min: 1 } }),
            sprintCompleted: fields.integer({ label: 'Sprint number', defaultValue: 1, validation: { isRequired: true, min: 0 } }),
            phaseCompleted: fields.select({ label: 'Phase', options: options(PHASES), defaultValue: 'python' }),
            projectsFinished: fields.integer({ label: 'Projects needed', defaultValue: 1, validation: { isRequired: true, min: 1 } }),
            sessionsDone: fields.integer({ label: 'Sessions needed', defaultValue: 10, validation: { isRequired: true, min: 1 } }),
            activityCount: fields.object({
              activity: fields.select({
                label: 'Activity',
                options: POINTS_RULES.map((r) => ({ value: r.key, label: r.label })),
                defaultValue: 'bugfix',
              }),
              count: fields.integer({ label: 'Times needed', defaultValue: 5, validation: { isRequired: true, min: 1 } }),
            }),
          },
        ),
      },
    }),

    glossary: collection({
      label: 'Glossary',
      path: 'content/glossary/*',
      format: { data: 'yaml' },
      slugField: 'term',
      columns: ['firstSprint'],
      schema: {
        term: fields.slug({ name: { label: 'Term', validation: { isRequired: true } } }),
        firstSprint: fields.relationship({ label: 'First appears in sprint', collection: 'sprints', validation: { isRequired: true } }),
        explanation: fields.text({
          label: 'Simple explanation',
          multiline: true,
          description: '2–3 short sentences. An everyday comparison helps.',
          validation: { isRequired: true },
        }),
        codeExample: fields.object(
          {
            language: fields.select({ label: 'Language', options: options(LANGUAGES), defaultValue: 'python' }),
            code: fields.text({ label: 'Code', multiline: true, description: 'Must run as-is. Leave empty for no example.' }),
          },
          { label: 'Code example' },
        ),
        relatedTerms: fields.multiRelationship({ label: 'Related terms', collection: 'glossary' }),
      },
    }),

    cheatsheets: collection({
      label: 'Cheat sheets',
      path: 'content/cheatsheets/*',
      format: { data: 'yaml' },
      slugField: 'title',
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        language: fields.select({ label: 'Language', options: options(LANGUAGES), defaultValue: 'python' }),
        intro: fields.text({ label: 'Intro', multiline: true }),
        sections: fields.array(
          fields.object({
            heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
            sprint: fields.relationship({ label: 'Sprint', collection: 'sprints', validation: { isRequired: true } }),
            items: fields.array(
              fields.object({
                label: fields.text({ label: 'Label', validation: { isRequired: true } }),
                code: fields.text({ label: 'Code', multiline: true, validation: { isRequired: true } }),
                note: fields.text({ label: 'Note' }),
              }),
              { label: 'Items', itemLabel: (props) => props.fields.label.value || 'New item' },
            ),
          }),
          { label: 'Sections', itemLabel: (props) => props.fields.heading.value || 'New section' },
        ),
      },
    }),

    monthlyNotes: collection({
      label: 'Monthly notes',
      path: 'content/monthly-notes/*',
      format: { contentField: 'teacherNote' },
      slugField: 'month',
      entryLayout: 'form',
      schema: {
        month: fields.text({
          label: 'Month',
          description: 'Year and month, e.g. 2026-11.',
          validation: { isRequired: true, pattern: { regex: /^\d{4}-(0[1-9]|1[0-2])$/, message: 'Use the form YYYY-MM, e.g. 2026-11.' } },
        }),
        highlights: textList('Highlights'),
        focusNextMonth: textList('Focus for next month'),
        messageToParents: fields.text({ label: 'Message to parents (optional)', multiline: true }),
        teacherNote: fields.markdoc({ label: 'Teacher note' }),
      },
    }),

    fields: collection({
      label: "What's next — fields",
      path: 'content/fields/*',
      format: { data: 'yaml' },
      slugField: 'name',
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        icon: fields.select({ label: 'Icon', options: ICONS.map((i) => ({ value: i, label: i })), defaultValue: 'compass' }),
        order: fields.integer({ label: 'Order', defaultValue: 100 }),
        summary: fields.text({ label: 'One-line summary', validation: { isRequired: true } }),
        whatItIs: fields.text({ label: 'What it is', multiline: true, validation: { isRequired: true } }),
        whatYoudLearn: textList("What you'd learn", 'Tools and languages.'),
        firstProject: fields.text({ label: 'A good first project', multiline: true, validation: { isRequired: true } }),
        buildsOn: fields.object(
          {
            text: fields.text({ label: 'How it builds on what you know', multiline: true, validation: { isRequired: true } }),
            sprints: fields.multiRelationship({ label: 'Related sprints', collection: 'sprints' }),
          },
          { label: 'Builds on' },
        ),
        goodFitIf: textList('A good fit if you enjoy…'),
      },
    }),
  },
});
