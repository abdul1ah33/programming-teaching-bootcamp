# Decisions

A log of technical decisions, one line each with the reason. Newest at the bottom.

| # | Date | Phase | Decision | Reason |
|---|------|-------|----------|--------|
| 1 | 2026-11-19 | Plan | Next.js app lives at the repo root (no `src/`), docs stay in `docs/`. | Matches the folder structure in SPEC.md (`app/`, `components/`, `lib/`, `content/`). |
| 2 | 2026-11-19 | Plan | Curriculum read from `docs/Programming Learning Journey - Learning Plan.pdf`. | `docs/curriculum.pdf` does not exist; this is the only curriculum file. |
| 3 | 2026-11-19 | Plan | All derive functions take `today` as an argument. | Keeps them pure and testable; the client passes the real date for "next session". |
| 4 | 2026-11-19 | Plan | Road map, points chart and badge medallions are hand-built SVG. | Spec asks for code-drawn visuals; avoids extra dependencies. |
| 5 | 2026-11-19 | 0 | Next.js 16.4.6, React 19.3, Tailwind 4.3, Vitest 5, ESLint 9.39. | Latest stable; Keystatic peers accept React 19 / Next ≥14; ESLint 9 for plugin compatibility. |
| 6 | 2026-11-19 | 0 | TypeScript 6.0.3 instead of 7.x. | typescript-eslint (via eslint-config-next) requires TS < 6.1. |
| 7 | 2026-11-19 | 0 | Basic Auth lives in `proxy.ts`, not `middleware.ts`. | Next 16 renamed Middleware to Proxy; same behaviour. |
| 8 | 2026-11-19 | 0 | `next-themes` with `defaultTheme="system"`. | Light for anyone without a dark system setting (spec "light by default"), but respects a dark system preference and remembers a manual choice. |
| 9 | 2026-11-19 | 0 | noindex via metadata `robots` **and** an `X-Robots-Tag` header; `robots.txt` disallows `/`. | Covers HTML pages and non-HTML files (PDFs) alike. |
| 10 | 2026-11-19 | 0 | Playwright installed in Phase 0; QA scripts live in `scripts/qa/`. | Needed to check theme/no-flash for the Phase 0 gate; reused for screenshots. |
