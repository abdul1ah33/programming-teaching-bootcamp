# Build: "The Programming Learning Journey" — a private progress site for one student

## Context
I'm personally teaching programming to one 14-year-old student, following my own 10-sprint curriculum
(Python first, then C, ~6–9 months, 2 sessions/week). The full curriculum is in `docs/curriculum.pdf` —
read it first and use it as the single source of truth for sprint content (titles, phases, durations,
goals, topics, practice missions, "What you'll build", "Ready to move on when…").

The site is for three audiences: the student (what am I learning, what's next, my files, projects and
points), his parents (is he progressing, what's the plan, monthly reports), and me (the only editor).

## Hard requirements
- **Free hosting**: deploy on Vercel Hobby. No paid services, no database.
- **Only I can edit**: content lives as files in this Git repo. Use **Keystatic** for an admin UI at
  `/keystatic` — `local` storage in development, `github` storage in production (switch via env var).
  Only users with write access to the repo can edit. Saving in the admin = a commit = Vercel redeploy.
  I must also be able to edit content files by hand and `git push`.
- **My main editing actions** must be fast (≤ 30 seconds each): mark a session as done, add a new
  session, attach files (PDF, slides, images, zip) to a session or sprint, tick a sprint's
  "ready to move on" checks, change a sprint's status, award points, write the monthly note.
- **Light mode by default**, with a dark mode toggle (respect system preference, remember the choice,
  no flash of the wrong theme on load). Green is the accent colour.
- **Privacy**: the student is a minor. First name only, comes from a settings file. Add
  `noindex, nofollow` site-wide and a `robots.txt` that disallows everything. Optional site-wide password via
  Next.js middleware + HTTP Basic Auth, enabled only if a `SITE_PASSWORD` env var is set.

## Tech stack
- Next.js (App Router) + TypeScript (strict) + Tailwind CSS. Use `next-themes` for theming.
- Keystatic (`@keystatic/core`, `@keystatic/next`) with its Reader API for type-safe content reads.
- All public pages statically generated. Only the Keystatic routes need server functions.
- Fonts self-hosted via `next/font`. No external analytics, no trackers, no third-party embeds
  except YouTube (privacy-enhanced `youtube-nocookie.com`).
- Syntax highlighting at build time (e.g. Shiki), with light and dark themes that match the site.
- Files uploaded through Keystatic go to `public/files/...`. Document a soft limit (~15 MB per file)
  and recommend YouTube/unlisted for videos.

## Content model (Keystatic)
- **settings** (singleton): student first name, teacher name, contact (email/WhatsApp link), start date,
  weekly schedule text, learning-plan PDF file, site title, and the **points rules** table
  (activity → points), seeded with: exercise completed 5, challenge problem solved 10,
  solved independently 15, bug found and fixed 5, mini-project / sprint project completed 30.
- **sprints** (collection, 10 entries seeded from the PDF): number, slug, title, phase
  (Thinking / Python / C / Capstone), duration, goal, topics[], practice missions[], build description,
  readyChecks[] {text, done:boolean}, status (upcoming | in-progress | done), files[] {label, type, file}.
- **sessions** (collection): number, date, sprint (relationship), title, status (planned | done |
  cancelled), summary (rich text), files[] {label, type: slides|notes|exercises|solution|other, file},
  homework {description, due date, status: assigned|reviewed}, links[].
- **projects** (collection): title, sprint (relationship), description, screenshot, code link,
  status (in-progress | finished), "what I learned".
- **points** (collection — the points log): date, title (e.g. "Fixed the infinite loop himself"),
  activity (select from the settings rules, or "custom"), points (prefilled from the rule, editable),
  sprint (optional relationship), session (optional relationship). Adding an entry must take seconds.
- **badges** (collection): name, short description, icon (choose from a fixed list of Lucide icon names),
  unlock rule — either `manual` (I set an "earned on" date) or automatic:
  `totalPoints ≥ N`, `sprintCompleted = n`, `phaseCompleted = name`, `projectsFinished ≥ N`,
  `sessionsDone ≥ N`. Automatic badges show the date they were unlocked (derived from content).
  Seed ~10 sensible badges (e.g. "First program", "Loop master" for Sprint 2, "Python graduate"
  for Phase 2, "Bug hunter" for 5 bug fixes, "100 points", "Capstone builder"). Locked badges show
  greyed out with how to unlock them.
- **glossary** (collection): term, slug, simple explanation (2–3 short sentences a 14-year-old
  understands, with an everyday analogy where helpful), code example {language: python | c, code},
  first appears in sprint (relationship), related terms (relationships).
  Seed ~35 terms covering Sprints 0–8 in order of appearance (algorithm, pseudocode, variable,
  data type, string, boolean, condition, loop, list, dictionary, function, parameter, return value,
  scope, exception, class, object, compiler, header file, array, pointer, address, stack, heap,
  malloc/free, memory leak, struct, linked list, stack (data structure), queue, Big-O, etc.).
- **cheatsheets** (collection, 2 seeded entries: Python and C): title, language, intro, sections[]
  {heading, sprint (relationship), items[] {label, code, note}}. Organize sections in the order
  he learns them. Python covers Sprints 1–4; C covers Sprints 5–8.
- **monthlyNotes** (collection): month (YYYY-MM), teacher note (rich text), highlights[],
  focus for next month[], optional message to parents.
- **fields** (collection, for "What's next"): name, slug, one-line summary, what it is (plain language),
  what he'd learn (tools/languages), a good first project, how it builds on what he already knows
  (link to sprints), "a good fit if you enjoy…", icon. Seed: Web development, Game development,
  Mobile apps, Backend & APIs, AI & machine learning, Embedded systems & robotics (connect this to C).

Derive everything else from content: progress %, sessions done, current sprint, total points,
points this month, unlocked badges and their unlock dates, next planned session.
"Next session" must be computed on the client from today's date so it never goes stale between deploys.
Put all derivation logic in pure functions with unit tests (Vitest), especially badge unlocking and
monthly report statistics.

## Pages
Navigation — keep it uncluttered: primary nav = Home, Road map, Sessions, Resources, Projects.
A "Learn" menu = Glossary, Cheat sheets, What's next. A "Points" link showing his current total.
A "For parents" menu = Learning plan, Monthly reports. Mobile: a clean bottom sheet / drawer.

- `/` Home: greeting with first name, current sprint card, overall progress, next session,
  points total + latest badge, latest 3 sessions, latest files.
- `/roadmap`: all 10 sprints as a visual path grouped by phase, with status.
- `/sprints/[slug]`: goal, topics, missions, build, ready-to-move-on checklist (read-only ticks),
  files, related sessions, project, and glossary terms introduced in this sprint.
- `/sessions` (timeline, filter by sprint/status) and `/sessions/[number]` (detail with files,
  homework, and points earned in that session).
- `/resources`: every file from sprints and sessions in one filterable list (by sprint, by type).
  PDFs preview inline. Other types download.
- `/projects` and `/projects/[slug]`: gallery.
- `/points`: total, a simple chart of points over time, the badge wall (unlocked + locked),
  the points log (newest first), and the points rules so he knows how to earn more.
- `/glossary`: A–Z list with instant client-side filter and filter by sprint; each term on
  `/glossary/[slug]` with explanation, highlighted code, related terms, and the sprint it belongs to.
  Terms mentioned in sprint pages link here.
- `/cheatsheets/python` and `/cheatsheets/c`: compact, scannable, grouped by sprint, with a
  copy button on each snippet and a clean print layout (fits on few A4 pages).
- `/whats-next`: the fields as cards → `/whats-next/[slug]` detail. Frame it as "explore after the
  capstone", not as part of the curriculum.
- `/plan`: parent-facing page: the plan in plain language, schedule, how progress is checked
  (a sprint is complete when its checks are met; mastery over speed), PDF download, contact.
- `/reports` (list of months since the start date) and `/reports/[month]`: a printable monthly
  progress report for parents, generated automatically: sessions held vs planned, sprints completed and
  current sprint, ready-checks ticked that month, projects finished, points earned and badges unlocked
  that month, plus my monthlyNotes entry (highlights, focus for next month, message to parents).
  If I haven't written a note for that month, show the stats only. Include a "Print / Save as PDF"
  button. Print stylesheet: A4, always light colours, no navigation, ideally one page.
- `/keystatic`: admin.
- A good 404 page.

## Design direction — premium, calm, and NOT "AI-generated looking"
Think of a well-made independent course site or a thoughtful product's docs, not a SaaS landing page.
- **Palette (light)**: background #FAFAF7, surface #FFFFFF, text #16181D, muted text #5B6159,
  borders #E6E8E3, primary green #1F7A4D (hover #17633E), green tint #E8F3EC.
  **Dark**: background #0F1412, surface #161C19, text #E7ECE8, muted #9AA59E, borders #26302B,
  green #4CB884. Check WCAG AA contrast for every text/background pair in both themes.
- **Type**: a characterful serif for large headings only (e.g. Fraunces), a clean sans for UI and body
  (e.g. IBM Plex Sans), a mono for code, labels and numbers (e.g. JetBrains Mono). Strong size
  hierarchy, generous line height, max ~70ch line length.
- **Layout**: editorial and asymmetric where it helps; real information density on the dashboard;
  consistent 4/8px spacing scale; subtle 1px borders over heavy shadows; small radii (6–10px).
- **Details that make it feel crafted**: tabular numerals for dates, points and progress; status shown
  with small, consistent badges; a hand-drawn-feeling SVG road map (built in code, not an image);
  badges drawn as simple, consistent SVG medallions (no cartoon art); tasteful micro-interactions
  (≤ 200ms, respect `prefers-reduced-motion`); a small, understated moment when a badge is new.
- **Avoid** (these make sites look AI-made): purple/blue gradients, glassmorphism, glowing blobs,
  emoji as icons, generic hero copy ("Unlock your potential"), a centered hero + three identical feature
  cards, stock illustrations, confetti, oversized drop shadows, everything centered, Inter as the only font.
  Use one icon set consistently (Lucide), sparingly.
- Write all UI copy plainly and specifically, as a real teacher would, in short sentences.
  Glossary and cheat-sheet text must be friendly and simple, but never babyish.
- Fully responsive (the student and parents will mostly use phones), keyboard accessible,
  visible focus states, semantic HTML.

## Architecture & code quality
- Clear structure: `app/` (routes), `components/` (ui primitives vs feature components),
  `lib/content/` (all Reader API access), `lib/derive/` (pure functions: progress, badges, reports,
  next session — unit tested), `content/` (Keystatic data), `keystatic.config.ts`.
- Pages never read files directly — only through `lib/content`.
- Design tokens as CSS variables consumed by Tailwind, so the theme lives in one place.
- No unused dependencies. ESLint + TypeScript + tests must pass with zero errors. `next build` must pass.

## Seed data
- All 10 sprints fully populated from `docs/curriculum.pdf`; Sprint 0 status "in-progress", others "upcoming".
- The full glossary (~35 terms), both cheat sheets, ~10 badges, the 6 "What's next" fields,
  and the points rules — all complete, not placeholders.
- **Every code example in the glossary and cheat sheets must be correct**: extract them and actually
  run the Python snippets and compile the C snippets (gcc, `-Wall -Wextra`) before finishing; fix any that fail.
- Clearly marked examples I can delete: 2 sessions (one done with a sample PDF, one planned),
  1 project, 3 points entries, 1 monthly note.
- settings with placeholder values I'll replace.

## Deliverables
1. The working site, built in this order: content model + seed → derive functions + tests →
   layout/theme → core pages → points/badges → glossary/cheat sheets → reports → what's next →
   Keystatic → polish. Show me the home page and one sprint page in both themes before polishing everything.
2. `README.md` written for me, step by step: run locally; edit in local mode; push to GitHub
   (private repo); deploy on Vercel; create the Keystatic GitHub App and set the env vars on Vercel;
   switch to GitHub mode; how to mark a session done, add files, award points, add a badge and write
   the monthly note from the admin (including from a phone); how to print a monthly report;
   how to enable the site password; file-size advice.
3. Before finishing: run lint, typecheck, tests and a production build; open the main pages in light and
   dark mode at phone and desktop widths, print-preview one monthly report, and fix anything that looks off.

Ask me before adding any dependency not listed here, or if something in the curriculum PDF is ambiguous.