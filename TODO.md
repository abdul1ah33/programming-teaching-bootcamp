# TODO — The Programming Learning Journey

Source of truth: `docs/SPEC.md` (spec) and `docs/Programming Learning Journey - Learning Plan.pdf`
(the curriculum; the spec calls it `docs/curriculum.pdf`).

## Rules

- Work through phases strictly in order. Do not start a phase until the previous phase's acceptance gate passes.
- Every gate includes `npm run verify` passing with zero errors, plus that phase's specific checks.
  For UI phases, the gate also includes saving light + dark screenshots (phone and desktop width)
  of the pages built in that phase to `docs/screenshots/phase-N/` (Playwright is pre-approved as a dev
  dependency for this) and fixing anything that looks off before moving on.
- Tick each task in TODO.md (`- [x]`) as soon as it's done. At the end of each phase: update TODO.md,
  then make one git commit `Phase N: <name>`.
- **No mid-course changes**: do not redesign, refactor or "improve" earlier phases while working on a later
  one. Only touch earlier code to fix a bug that blocks the current gate, and log it in DECISIONS.md.
- **No scope creep**: any new idea goes into "Later / out of scope" in TODO.md and is not built.
- Follow SPEC.md exactly. If the spec and TODO.md ever conflict, SPEC.md wins; note the fix in DECISIONS.md.
- If something is unclear mid-build, use the most reasonable default, record it under "Questions" with
  the choice you made, and keep going. Only stop for something that can't be undone (e.g. deleting
  content files) or that needs my accounts (GitHub App, Vercel env vars) — for those, prepare everything,
  write exact instructions in the README, and continue with the rest.
- Ask before adding any dependency not named in SPEC.md or in these rules.
- **If a session ends or your context resets**: start by reading SPEC.md, then TODO.md, then continue
  from the first unchecked task. Never restart a finished phase.

Screenshot widths used throughout: phone = 375×812, desktop = 1280×800.

---

## Phase 0 — Setup

- [x] Scaffold Next.js (App Router, latest stable that Keystatic supports) + TypeScript at repo root (no `src/`)
- [x] `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess`, path alias `@/*`
- [x] Tailwind CSS installed and wired to CSS variables
- [x] ESLint (Next config, flat config), zero warnings policy (`--max-warnings 0`)
- [x] Vitest configured (node environment, `@/` alias), one smoke test
- [x] Folder structure: `app/`, `components/ui/`, `components/features/`, `lib/content/`, `lib/derive/`, `content/`, `public/files/`, `scripts/`, `tests/` (as needed)
- [x] npm scripts: `dev`, `lint`, `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `build`, `verify` (runs lint → typecheck → test → build, stops on first failure)
- [x] Design tokens in `app/globals.css` as CSS variables (light on `:root`, dark on `.dark`) using the spec palette; Tailwind theme reads them
- [x] Fonts via `next/font/google` (self-hosted at build): Fraunces (headings), IBM Plex Sans (UI/body), JetBrains Mono (code/labels/numbers)
- [x] `next-themes` provider: light default, `enableSystem`, class strategy, stored choice, no flash (`suppressHydrationWarning`)
- [x] Site-wide `robots: { index: false, follow: false }` metadata + `X-Robots-Tag: noindex, nofollow` header
- [x] `app/robots.ts` → `Disallow: /` for all agents
- [x] Basic Auth middleware, active only when `SITE_PASSWORD` is set (any username, password must match); excluded for static assets
- [x] `.gitignore`, `.env.example` (documents every env var), `.nvmrc`
- [x] Placeholder home page that renders with fonts + tokens

**Acceptance gate (Phase 0)**
- `npm run verify` passes with zero errors and zero lint warnings.
- `npm run dev` serves `/` with status 200; HTML contains `<meta name="robots" content="noindex, nofollow">`.
- `GET /robots.txt` returns `User-agent: *` + `Disallow: /`.
- With `SITE_PASSWORD=test` set, `/` returns 401 without credentials and 200 with them; without the var, 200.
- Theme: `<html>` gets `class="dark"` only after toggling / with dark system preference; no hydration warnings in the console.
- Commit `Phase 0: Setup`.

---

## Phase 1 — Content model & seed

- [x] Install `@keystatic/core`, `@keystatic/next`; `keystatic.config.ts` at root (storage chosen by env var, see Phase 9 — local by default for now)
- [x] `app/keystatic/[[...params]]/page.tsx` + `app/api/keystatic/[...params]/route.ts` (minimal, so the admin opens in dev)
- [x] Singleton **settings**: studentFirstName, teacherName, contactEmail, contactWhatsApp, startDate, scheduleText, learningPlanPdf (file), siteTitle, pointsRules[] {key, label, points}
- [x] Collection **sprints**: number, slug, title, phase (thinking|python|c|capstone), duration, goal, topics[], missions[], build, readyChecks[] {text, done, doneOn?}, status, completedOn?, files[] {label, type, file}
- [x] Collection **sessions**: number, date, sprint (relationship), title, status, summary (rich text), files[] {label, type, file}, homework {description, dueDate, status}, links[] {label, url}
- [x] Collection **projects**: title, slug, sprint, description, screenshot (image), codeLink, status, finishedOn?, whatILearned
- [x] Collection **points**: date (default today), title, activity (select from rules + custom, conditional points field prefilled per rule), sprint?, session?
- [x] Collection **badges**: name, slug, description, icon (fixed Lucide list), unlock rule (conditional: manual{earnedOn} | totalPoints{n} | sprintCompleted{sprint number} | phaseCompleted{phase} | projectsFinished{n} | sessionsDone{n} | activityCount{activity, n})
- [x] Collection **glossary**: term, slug, explanation, codeExample {language, code}, firstSprint, relatedTerms[]
- [x] Collection **cheatsheets**: title, slug, language, intro, sections[] {heading, sprint, items[] {label, code, note}}
- [x] Collection **monthlyNotes**: month (YYYY-MM, validated), teacherNote (rich text), highlights[], focusNextMonth[], messageToParents?
- [x] Collection **fields**: name, slug, summary, whatItIs, whatYoudLearn[], firstProject, buildsOn {text, sprints[]}, goodFitIf[], icon
- [x] Seed **settings** with clearly marked placeholder values + the 5 points rules from the spec; copy learning-plan PDF to `public/files/plan/learning-plan.pdf`
- [x] Seed all **10 sprints** from the curriculum (titles, phase, duration, goal, topics, missions, build, ready checks); Sprint 0 `in-progress`, others `upcoming`
- [x] Seed **examples** (marked `EXAMPLE — delete me`): 2 sessions (one done with a small sample PDF, one planned), 1 project, 3 points entries, 1 monthly note
- [x] `lib/content/` — typed reader wrappers (one module per collection) — the only place that touches the Reader API
- [x] `scripts/validate-content.ts` + `npm run validate-content`: reads every collection/singleton through the Reader API, checks required fields, relationship targets exist, unique sprint/session numbers, month format, file paths exist on disk, point rule keys match settings; non-zero exit on failure. Added to `verify`.
- [x] Unit test that runs the validator against the seeded content

**Acceptance gate (Phase 1)**
- `npm run verify` (now including `validate-content`) passes.
- `/keystatic` opens in dev; every collection and the settings singleton list their seeded entries without errors.
- Seeded sprint text matches the curriculum (spot-check every sprint's title, duration, missions count).
- Commit `Phase 1: Content model & seed`.

---

## Phase 2 — Derive logic

All functions pure (inputs → outputs, `today` passed in explicitly), in `lib/derive/`.

- [x] `progress.ts`: overall % (done sprints + partial credit from ready checks of the current sprint), sprints done count, checks ticked count
- [x] `currentSprint.ts`: first `in-progress` sprint, else first `upcoming`, else last sprint (journey complete)
- [x] `nextSession.ts`: earliest `planned` session with date ≥ today; handles none / past-dated planned sessions
- [x] `points.ts`: resolve points per entry (explicit value, else rule value), total, total for a month, cumulative series by date (for the chart), per-session and per-sprint totals
- [x] `badges.ts`: evaluate every rule kind → `{unlocked, unlockedOn | null, progress {current, target}, howToUnlock text}`; unlock date = date the threshold was first crossed (points/sessions/projects/activity), sprint `completedOn`, phase = latest `completedOn` of its sprints, manual `earnedOn`
- [x] `reports.ts`: months from start date to today (`YYYY-MM` list); per-month stats: sessions held vs planned, cancelled, sprints completed in month, current sprint at month end, ready checks ticked in month, projects finished, points earned, badges unlocked; merge monthly note if present
- [x] `resources.ts`: flatten sprint + session files into one list with sprint/session/type/date metadata, newest first
- [x] `dates.ts`: timezone-safe ISO date helpers (no `Date` timezone drift), month labels
- [x] Vitest suites for each module covering edge cases (empty content, ties, boundary dates, month edges, missing optional dates, threshold exactly hit)

**Acceptance gate (Phase 2)**
- `npm run verify` passes; ≥ 1 test file per derive module; `vitest run --coverage` not required, but every exported function has at least one test and `badges.ts` / `reports.ts` cover every rule kind and every stat.
- No derive module imports from `lib/content`, `fs`, React, or Next.
- Commit `Phase 2: Derive logic`.

---

## Phase 3 — Design system & shell

- [x] Root layout: skip link, header, main, footer; max widths; semantic landmarks
- [x] Desktop navigation: Home, Road map, Sessions, Resources, Projects · "Learn" menu (Glossary, Cheat sheets, What's next) · "Points" link with total · "For parents" menu (Learning plan, Monthly reports) — menus keyboard-accessible (disclosure pattern, Esc closes)
- [x] Mobile navigation: menu button → bottom sheet/drawer with all links grouped, focus trapped, Esc/overlay closes, body scroll locked
- [x] Theme toggle (light/dark/system cycle or light/dark with system default), accessible label
- [x] UI primitives in `components/ui/`: Card, Badge, StatusPill (upcoming / in-progress / done / planned / cancelled / assigned / reviewed), ProgressBar (ARIA), CodeBlock (Shiki at build time, dual light/dark theme, copy button), FileRow (icon by type, size, download/preview), SectionHeading, EmptyState
- [x] Shiki highlighter wrapper (server-side, cached), themes matched to site palette
- [x] Motion: ≤ 200ms transitions, all disabled under `prefers-reduced-motion`
- [x] Home page: greeting, current sprint card, overall progress, next session (client-computed), points total + latest badge, latest 3 sessions, latest files
- [x] One sprint page `/sprints/[slug]` (built for Sprint 0 data, generic for all)
- [x] Playwright installed (dev), `scripts/screenshots.ts` (or test) capturing given routes × {light, dark} × {375, 1280}

**Acceptance gate (Phase 3)**
- `npm run verify` passes.
- Screenshots of `/` and `/sprints/computational-thinking` in light + dark at 375 and 1280 saved to `docs/screenshots/phase-3/`; reviewed and anything off fixed.
- Keyboard: Tab reaches every nav item, menus open with Enter/Space and close with Esc, focus ring visible in both themes.
- No theme flash on hard reload with dark stored.
- Commit `Phase 3: Design system & shell`.

---

## Phase 4 — Core pages

- [x] `/roadmap`: hand-drawn-feeling SVG path (built in code) grouped by phase, each stop shows number, title, status; accessible list fallback
- [x] `/sprints/[slug]` for all 10 (generateStaticParams), related sessions, project, glossary placeholder hook (filled in Phase 6)
- [x] `/sessions`: timeline, client-side filter by sprint and status (URL query synced)
- [x] `/sessions/[number]`: summary (rich text), files, homework, links, points earned in that session
- [x] `/resources`: all files, filter by sprint and type; PDFs preview inline (lazy `<iframe>`/`<object>` behind a "Preview" toggle), other types download
- [x] `/projects` gallery + `/projects/[slug]` detail
- [x] `/plan`: plain-language plan, schedule, how progress is checked (checks met; mastery over speed), PDF download, contact
- [x] `not-found.tsx`: helpful 404 with links
- [x] Rich-text renderer for Keystatic content (summary, teacher note)

**Acceptance gate (Phase 4)**
- `npm run verify` passes; `next build` output lists all pages as static (○ / ●) except Keystatic routes.
- Screenshots of every page above (light + dark, 375 + 1280) in `docs/screenshots/phase-4/`, reviewed and fixed.
- Filters work with keyboard; empty filter results show an empty state.
- Commit `Phase 4: Core pages`.

---

## Phase 5 — Points & badges

- [x] Seed ~10 badges (First program, Loop master = Sprint 2, Python graduate = Phase Python, C explorer = Phase C, Bug hunter = 5 bug fixes, 50 points, 100 points, 10 sessions, First project, Capstone builder = Sprint 9)
- [x] SVG medallion component (consistent shape, Lucide glyph centre, locked = greyed + lock state)
- [x] `/points`: total, simple SVG chart of cumulative points over time (accessible table fallback), badge wall (unlocked with date, locked with how to unlock + progress), points log newest first, points rules
- [x] "New badge" moment: understated highlight for badges unlocked in the last 14 days (client-side, respects reduced motion, no confetti)
- [x] Home-page widgets wired: points total + latest badge; nav Points link shows total
- [x] Session detail shows points earned in that session (verify)

**Acceptance gate (Phase 5)**
- `npm run verify` passes; validate-content checks badge rules reference real sprints/phases/activities.
- Screenshots of `/points` and `/` (light + dark, 375 + 1280) in `docs/screenshots/phase-5/`, reviewed and fixed.
- With seed data, at least one badge shows unlocked with a correct date and the rest locked with progress.
- Commit `Phase 5: Points & badges`.

---

## Phase 6 — Glossary & cheat sheets

- [x] Seed ~35 glossary terms (Sprints 0–8, in order of appearance), each with a friendly explanation, analogy where useful, correct code example, related terms
- [x] Seed Python cheat sheet (Sprints 1–4) and C cheat sheet (Sprints 5–8), sections in learning order
- [x] `/glossary`: A–Z list, instant client-side text filter + sprint filter, letter jump links
- [x] `/glossary/[slug]`: explanation, highlighted code, related terms, sprint link
- [x] Sprint pages list terms introduced there; terms mentioned in sprint topics auto-link to glossary entries
- [x] `/cheatsheets` index (if linked from nav), `/cheatsheets/python`, `/cheatsheets/c`: compact, grouped by sprint, copy button on each snippet
- [x] Print stylesheet for cheat sheets: light, no nav, compact, few A4 pages, no broken snippets across pages
- [x] `scripts/check-snippets` + `npm run check-snippets`: extract every Python snippet (run with `python`) and every C snippet (wrap if needed, compile with `gcc -std=c11 -Wall -Wextra -Werror`, run); report failures

**Acceptance gate (Phase 6)**
- `npm run verify` passes.
- `npm run check-snippets`: every Python snippet runs with exit 0 and every C snippet compiles with zero warnings under `gcc -Wall -Wextra` and runs with exit 0. Output saved in the commit message summary.
- Screenshots of `/glossary`, one term, both cheat sheets (light + dark, 375 + 1280) + a print-emulated PDF of each cheat sheet in `docs/screenshots/phase-6/`, reviewed and fixed.
- Commit `Phase 6: Glossary & cheat sheets`.

---

## Phase 7 — Monthly reports

- [x] `/reports`: list of months from start date to the current month (static at build + client hint for months added since deploy)
- [x] `/reports/[month]`: stats (sessions held vs planned, sprints completed + current sprint, checks ticked, projects finished, points earned, badges unlocked) + monthly note (highlights, focus next month, message to parents); stats only when no note
- [x] "Print / Save as PDF" button
- [x] Print stylesheet: A4, always light colours, no navigation/footer, fits one page with seed data

**Acceptance gate (Phase 7)**
- `npm run verify` passes.
- Playwright `page.pdf({format: 'A4'})` of the seeded month produces exactly 1 page, light colours; saved to `docs/screenshots/phase-7/`.
- Screenshots of `/reports` and one month (light + dark, 375 + 1280) saved and reviewed.
- Commit `Phase 7: Monthly reports`.

---

## Phase 8 — What's next

- [x] Seed 6 fields: Web development, Game development, Mobile apps, Backend & APIs, AI & machine learning, Embedded systems & robotics (tied to C)
- [x] `/whats-next`: framed as "explore after the capstone", field cards
- [x] `/whats-next/[slug]`: what it is, what he'd learn, first project, how it builds on sprints (links), good fit if you enjoy…

**Acceptance gate (Phase 8)**
- `npm run verify` passes.
- Screenshots of `/whats-next` and one field (light + dark, 375 + 1280) in `docs/screenshots/phase-8/`, reviewed and fixed.
- Commit `Phase 8: What's next`.

---

## Phase 9 — Admin

- [x] Storage switch: `KEYSTATIC_STORAGE=github` (+ `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` / `KEYSTATIC_GITHUB_REPO` owner/name) → github mode, else local
- [x] Env vars documented in `.env.example`: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`
- [x] Admin UX: sensible field order, descriptions, defaults (today for dates, `planned` status, next session number hint), entry labels
- [x] Basic Auth middleware doesn't block Keystatic GitHub OAuth callback incorrectly (document behaviour)
- [x] Walk through each editing action in local mode (Playwright or manual via dev server) and record field count + steps: mark session done · add session · attach a file to a session and to a sprint · tick a ready check · change sprint status · award points · write the monthly note · add a badge
- [x] Revert test edits afterwards (git checkout of content changes made during the walkthrough)

**Acceptance gate (Phase 9)**
- `npm run verify` passes.
- Each editing action above completed in local mode, producing the expected file change in `content/`, and the site reflects it after reload; each needs ≤ 4 fields touched. Results logged in DECISIONS.md.
- Build with `KEYSTATIC_STORAGE=github` (dummy repo values) succeeds.
- Commit `Phase 9: Admin`.

---

## Phase 10 — Polish & QA

- [x] Responsive pass at 375 and 1280 on every page, both themes
- [x] Keyboard pass: every interactive control reachable, visible focus, menus/drawers/filters/copy buttons
- [x] Contrast check: compute WCAG ratios for every token text/background pair in both themes (script), fix any < 4.5 (body) / < 3 (large/UI)
- [x] Empty states: no sessions, no points, no projects, no files, no note, filter with no results
- [x] Large PDFs: preview loads lazily and only on demand; file size shown
- [x] Copy pass against the spec's "Avoid" list and plain-teacher tone
- [x] Lighthouse-style sanity (no console errors, images sized, no layout shift on theme load)

**Acceptance gate (Phase 10)**
- `npm run verify` passes.
- Contrast script reports every pair ≥ AA; results recorded in DECISIONS.md.
- Full screenshot set (all pages × themes × widths) in `docs/screenshots/phase-10/` reviewed; issues fixed.
- Commit `Phase 10: Polish & QA`.

---

## Phase 11 — README & handover

- [x] `README.md` step by step: run locally; edit in local mode; push to private GitHub repo; deploy on Vercel; create Keystatic GitHub App + env vars on Vercel; switch to GitHub mode; mark a session done, add files, award points, add a badge, write the monthly note (incl. from a phone); print a monthly report; enable site password; file-size advice (~15 MB, videos → unlisted YouTube); how to delete the example entries
- [x] Final screenshots of every main page in both themes to `docs/screenshots/` (phone + desktop)
- [x] "What was built / known limitations" section at the end of this file

**Acceptance gate (Phase 11)**
- `npm run verify` passes; `npm run check-snippets` passes.
- README covers every item in SPEC.md "Deliverables" §2 (checked line by line).
- Commit `Phase 11: README & handover`.

## Phase 12 — Student-friendly pass (requested after handover)

Feedback: "the UI/UX is really hard for a 14-year-old student not in tech to understand — make it more
focused for a child." Same design system (colours, fonts, layout grid); parent pages (plan, reports)
keep their content. Not babyish: plain, warm, short sentences.

- [x] Plain-language navigation: Home, My path, Lessons, My files, My projects, Points · "Help" menu (Word list, Cheat sheets, After the course) · "For parents"
- [x] Plain status words: Coming up / You're here / Finished (sprints), Coming up / Done / Cancelled (lessons), To do / Checked (homework), Working on it / Finished (projects)
- [x] Replace small uppercase monospace labels with sentence-case labels site-wide (monospace only for code and numbers)
- [x] Home answers "what now?": next lesson + homework due first, then "What I'm learning now" with the "I can…" checklist, then points/badge, then latest lessons and files; remove adult stats ("0 of 32 checks ticked")
- [x] "How this site works" card on Home for first visits (3 short points, dismissible, remembered in the browser)
- [x] One-sentence explanation of "sprint" wherever it first appears (home, path, sprint page)
- [x] Sprint page reordered: what it's about → "I can…" checklist → what I'll make → what I'll learn → practice → words to know → lessons & files
- [x] Friendlier empty states and helper text on lessons, files, projects, points, word list
- [x] Copy check: no jargon left in student pages ("resources", "phase", "checks ticked", "session #", "upcoming")

**Acceptance gate (Phase 12)**
- `npm run verify` and `npm run check-snippets` pass.
- Jargon scan of student-facing UI text finds none of: "Resources", "Road map", "checks ticked", "Upcoming", "In progress", "Phase " (outside parent pages).
- Keyboard, filter, glossary, contrast and print checks still pass (labels updated in QA scripts where renamed).
- Light + dark screenshots at 375 and 1280 of every student page in `docs/screenshots/phase-12/`, reviewed and fixed.
- Commit `Phase 12: Student-friendly pass`.

---

## Questions

Each has the default I'll use if you don't answer. **Status: you replied "go", so every default below was applied.**

1. **Curriculum file name.** The spec says `docs/curriculum.pdf`; the file is `docs/Programming Learning Journey - Learning Plan.pdf`.
   *Default:* leave it where it is; copy it to `public/files/plan/learning-plan.pdf` as the downloadable learning plan.
2. **Sprint titles differ between the overview table and the sprint pages** (e.g. Sprint 2 "Decisions and repetition" vs "Decisions and Loops"; Sprint 4 "Files, errors, and OOP foundations" vs "Building Useful Python Programs"; Sprint 7 "Memory and dynamic allocation" vs "Memory Management").
   *Default:* use the sprint-page titles (the detailed ones).
3. **"Main outcome" column** in the overview table has no field in the spec's sprint model.
   *Default:* not stored; the sprint `goal` (from the sprint page) is used everywhere, including the road map.
4. **Ready checks are one sentence per sprint in the PDF**, the spec wants a list.
   *Default:* split each sentence into 2–4 separate checks, keeping the PDF's wording (e.g. Sprint 0 → "Can explain what an algorithm is" / "Can identify inputs and outputs" / "Can trace a short sequence of instructions"). The general "A sprint is complete when…" criteria go on `/plan`, not into each sprint.
5. **Dates needed for derived stats that the spec model lacks.** Badge unlock dates and monthly reports need to know *when* a sprint was completed, a check was ticked, and a project finished.
   *Default:* add optional date fields: sprint `completedOn`, ready check `doneOn`, project `finishedOn`. If left empty, the item counts as done but has no date (badge shows "Unlocked", report doesn't count it in a month). The README tells you to fill them.
6. **"Bug hunter — 5 bug fixes"** isn't expressible with the spec's five automatic rule types.
   *Default:* add a sixth automatic rule `activityCount ≥ N` (counts points-log entries for one activity, e.g. "bug found and fixed").
7. **Points prefilled from the rule.** Keystatic can't read the settings singleton to prefill another field.
   *Default:* the activity choices are defined once in code (same list that seeds settings); choosing an activity shows a points field already set to that rule's value (Keystatic conditional field), editable. Settings keeps the rules table for display; `validate-content` fails if the two drift. Adding a brand-new activity type means editing one list in code (documented).
8. **Extra dependencies** not named in the spec that I expect to need:
   - `@markdoc/markdoc` — render Keystatic rich text (already a Keystatic dependency; listing it explicitly).
   - `tsx` (dev) — run `scripts/validate-content.ts` and `scripts/check-snippets.ts`.
   - `@tailwindcss/postcss` / `postcss` — part of Tailwind v4 setup.
   - `eslint-config-next` (dev) — Next's ESLint rules.
   *Default:* add these four groups. Nothing else without asking (chart, road map, medallions all hand-built SVG).
9. **Placeholder student name / dates.** *Default:* first name "Sam", teacher "Your Name", start date 2026-11-02, example sessions in November 2026, contact `teacher@example.com`.
10. **Next.js version / "middleware".** Recent Next versions rename middleware to `proxy.ts`.
    *Default:* latest stable Next that Keystatic supports; use whichever file name that version expects, logged in DECISIONS.md.
11. **"New badge" moment.** *Default:* a badge unlocked within the last 14 days (computed on the client) gets a subtle "New" tag and a one-time 200ms ring animation; nothing else.
12. **C compile flags.** *Default:* `gcc -std=c11 -Wall -Wextra -Werror` (warnings count as failures) and each program is also run. Local gcc is MinGW 6.3.
13. **Badge "First program".** *Default:* manual badge (you set the date when he runs his first Python program).
14. **Copy voice.** *Default:* student-facing pages talk to him in the second person ("Your next session"); parent pages use his first name from settings.

## Later / out of scope

Ideas noticed during the build. None of these are built.

- Embed YouTube videos (privacy-enhanced `youtube-nocookie.com`) on session pages instead of plain links.
- Show sprint titles instead of slugs in the admin's relationship pickers (needs a custom Keystatic field).
- Fill in "Completed on" / "Done on" automatically when a status or check changes (Keystatic can't do this out of the box).
- Compress uploaded project screenshots automatically.
- A small "since last time" summary for parents on the plan page.

## What was built / known limitations

**What was built** (12 phases, one commit each):

- A static Next.js 16 site with 73 pages: home dashboard, road map (code-drawn SVG path), 10 sprint pages,
  sessions timeline and detail, resources with inline PDF preview, projects, points with chart and
  badge wall, A–Z glossary (37 terms) with term pages, Python and C cheat sheets (print to 3 A4 pages
  each), learning plan for parents, monthly reports (print to 1 A4 page), "What's next" (6 fields), 404.
- Keystatic admin with every collection from the spec; local mode in dev, GitHub mode via env vars.
  Every editing action from the spec was tested in the admin, touching 1–3 fields each (DECISIONS #57).
- Seed content: all 10 sprints from the curriculum, settings with placeholders, 5 points rules,
  10 badges, 37 glossary terms, 2 cheat sheets, 6 fields, and marked examples (2 sessions, 1 project,
  3 points entries, 1 monthly note).
- All 84 code examples run: 48 Python run, 36 C compile with `gcc -std=c11 -Wall -Wextra -Werror` and run.
- Pure derive functions with 102 unit tests; `npm run verify` (lint, types, content check, tests, build)
  passes with zero errors and zero warnings.
- Light/dark themes from one set of tokens, no flash on load, WCAG AA for every text pair in both
  themes, keyboard accessible, reduced motion respected, noindex + robots.txt, optional password.

**Known limitations**

- **Needs your accounts:** the GitHub repo, the Vercel project, the Keystatic GitHub App and the Vercel
  env vars aren't set up. README sections 3–5 have the exact steps.
- **Pages update on deploy.** Everything is static, so changes appear about a minute after an admin
  Save (redeploy). "Next session", "points this month" and "new badge" use the viewer's date, so they're
  always current. A new month's report page appears with the first deploy in that month.
- **Dates drive badges and reports.** A sprint marked Done without *Completed on*, a check without
  *Done on* or a project without *Finished on* still counts as done, but has no date. It then doesn't
  appear in a month's report, and its badge shows "Unlocked" without a date. `validate-content` warns
  about the first and last of these.
- **Points activities live in two places**: Settings (shown on the site) and
  `lib/model/points-rules.ts` (the admin's choices). The validator fails if they differ.
- The admin's sprint/session pickers show slugs (`computational-thinking`), not titles.
- Uploaded files are stored as `…/files/0/file.pdf` (Keystatic's naming). The site names downloads
  after their label.
- `npm run check-snippets` needs Python and gcc installed, so it isn't part of `verify` and doesn't run
  on Vercel. Run it locally after editing code examples. It was checked with MinGW gcc 6.3 and Python 3.12.
- `docs/screenshots/` is about 52 MB (per-phase review screenshots). Once you've reviewed them, you can
  delete the `phase-*` folders to keep the repo small.
- Vercel's free Hobby plan is meant for non-commercial use. If the tutoring is paid, check whether
  Vercel's terms require the Pro plan.
- Example copy uses "he/his" where the spec does; the UI talks to the student as "you" and uses the
  first name from settings elsewhere.
