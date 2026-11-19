# The Programming Learning Journey

A private progress site for one student: the 10-sprint plan, sessions and files, projects, points and
badges, a glossary and cheat sheets, and printable monthly reports for parents. Everything is stored as
files in this repository and edited through an admin at `/keystatic`. It runs for free on Vercel.

This guide is in the order you'll need it. Commands go in a terminal opened in this folder.

---

## 1. Run it on your computer

You need **Node.js 20.9 or newer** (24 recommended, see `.nvmrc`) and **Git**.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The admin is at <http://localhost:3000/keystatic>.

Useful commands:

| Command | What it does |
|---|---|
| `npm run dev` | Site + admin on your computer, updates as you edit |
| `npm run verify` | Lint, type-check, content check, tests and a production build. Run before pushing. |
| `npm run validate-content` | Reads every content file and reports broken links between entries, missing files, bad dates |
| `npm run check-snippets` | Runs every Python example and compiles every C example (`gcc -Wall -Wextra -Werror`). Needs Python and gcc installed. |

## 2. Make it yours (first edits, in local mode)

With `npm run dev` running, open `/keystatic`. In **local mode** each Save writes straight to the files
in `content/` and `public/` on your computer.

1. **Settings** (left menu, under *Site*): replace the placeholders. Student first name only, your name,
   email / WhatsApp link (`https://wa.me/<number>`), **start date** (first month of reports), weekly
   schedule. The learning-plan PDF is already attached.
2. **Delete the example entries.** They're all titled `EXAMPLE — …`:
   - Sessions **1** and **2** (session 1's sample PDF is in `public/files/sessions/1/`)
   - Project **EXAMPLE — Sandwich algorithm**
   - The three **Points log** entries
   - Monthly note **2026-11**

   Open each one → **Delete entry…** (the bin icon at the top right). Or delete the files by hand:
   `content/sessions/1.mdoc`, `content/sessions/2.mdoc`, `public/files/sessions/1/`,
   `content/projects/example-sandwich-algorithm.yaml`, `content/points/*example*`,
   `content/monthly-notes/2026-11.mdoc`.
3. Check the site, then commit: `git add -A && git commit -m "My details"`.

You can always edit the files by hand instead of using the admin: they're plain YAML / Markdown in
`content/`. Run `npm run validate-content` afterwards to catch mistakes.

## 3. Put it on GitHub (private repository)

1. On GitHub: **New repository** → name it (e.g. `learning-journey`) → choose **Private** → *Create*
   (no README, no .gitignore).
2. In this folder:

   ```bash
   git remote add origin https://github.com/<your-username>/learning-journey.git
   git branch -M main
   git push -u origin main
   ```

## 4. Deploy on Vercel (free Hobby plan)

1. Sign in at <https://vercel.com> with your GitHub account.
2. **Add New… → Project** → import `learning-journey`. Vercel detects Next.js; keep the defaults
   (build command `npm run build`).
3. **Deploy.** After a minute you get an address like `learning-journey-abc.vercel.app`.

From now on every push to `main` redeploys the site automatically.

The site is already hidden from search engines (`noindex, nofollow` on every page and file, and
`robots.txt` disallows everything). To also require a password, see section 9.

## 5. Create the Keystatic GitHub App and switch the admin to GitHub mode

On the live site there's no local disk to save to, so the admin saves through GitHub instead: each
Save is a commit to your repo, and Vercel then redeploys (about a minute). Only people with write
access to the repo can log in and edit.

**a. Create the GitHub App (once, from your computer).**

1. Create a file `.env.local` in this folder with:

   ```bash
   NEXT_PUBLIC_KEYSTATIC_STORAGE=github
   NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO=<your-username>/learning-journey
   ```

2. Run `npm run dev` and open <http://localhost:3000/keystatic>. Keystatic shows a setup screen; click
   **Create GitHub App**. GitHub asks you to name the app and confirm. Keystatic then writes four
   values into a `.env` file here: `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET` and `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. (`.env` is git-ignored; never commit it.)
3. When asked, **install the app** on your account and give it access to **only** the
   `learning-journey` repository.

**b. Allow the live address to log in.**

GitHub → **Settings → Developer settings → GitHub Apps → your app → Edit**. Under *Callback URL* add:

```
https://<your-vercel-address>/api/keystatic/github/oauth/callback
```

Keep the `http://127.0.0.1:3000/…` one too if you want GitHub mode locally. Save.

**c. Add the environment variables on Vercel.**

Vercel → your project → **Settings → Environment Variables**. Add all six (Production):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_KEYSTATIC_STORAGE` | `github` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` | `<your-username>/learning-journey` |
| `KEYSTATIC_GITHUB_CLIENT_ID` | from `.env` |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | from `.env` |
| `KEYSTATIC_SECRET` | from `.env` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | from `.env` |

Then **Deployments → ⋯ → Redeploy** (environment variables only apply to new deployments).

**d. Try it.** Open `https://<your-vercel-address>/keystatic` → **Log in with GitHub**.

To go back to local mode on your computer, delete the two `NEXT_PUBLIC_KEYSTATIC_…` lines from
`.env.local` (or delete the file). In GitHub mode, pull before editing by hand: `git pull`.

## 6. Everyday editing (in the admin, also on your phone)

On your phone, open `https://<your-vercel-address>/keystatic` and log in with GitHub. The admin works
the same on a small screen. Add it to your home screen for one-tap access. After each **Save** the
live site updates about a minute later.

Each of these was tested in the admin; the number is how many fields you touch.

| Task | How |
|---|---|
| **Mark a session done** (1 field) | *Sessions* → the session → **Status: Done** → Save. Optionally write a summary in the editor at the bottom. |
| **Add a new session** (3 fields) | *Sessions* → **Add** → *Session number* (just `12`), *Title*, *Sprint* → Create. Date defaults to today and status to Planned. Planned sessions with a future date appear as "Next session" on the home page. |
| **Attach files** to a session (3 fields) | Open the session → *Files* → **Add** → label, type (slides / notes / exercises / solution / other), **Choose file** → Add → Save. PDFs open in the browser and have an inline preview on the *My files* page; other files download, named after the label. |
| **Attach files to a sprint** | *Sprints* → the sprint → *Files* (below the ready checks) → **Add** → same as above. |
| **Tick a "ready to move on" check** (1 field) | *Sprints* → the sprint → *Ready to move on when…* → click the check → tick **Done** (optionally set *Done on* so it counts in that month's report) → Done → Save. |
| **Change a sprint's status** (1 field) | *Sprints* → the sprint → **Status** → Save. When you mark one **Done**, also set **Completed on**: badges and reports use it. Then set the next sprint to In progress. |
| **Award points** (2 fields) | *Points log* → **Add** → *What happened* ("Fixed the infinite loop himself") → *Activity*. The points fill in from your rules, and you can change them. Date defaults to today. Optionally link the sprint and session → Create. |
| **Write the monthly note** (2+ fields) | *Monthly notes* → **Add** → *Month* as `2026-12` → write the note at the bottom; add highlights, focus for next month and an optional message to parents → Create. |
| **Add a badge** | *Badges* → **Add** → name, short description, icon, and *Unlocks when*: by hand (set *Earned on* when he earns it), total points ≥ N, a sprint completed, a phase completed, N projects finished, N sessions done, or an activity logged N times → Create. Automatic badges unlock and get their date from the content. |
| **Finish a project** | *Projects* → the project → **Status: Finished** + **Finished on** → Save. |

Points rules: the activities and their default points are in **Settings → Points rules** (shown on the
Points page) and in `lib/model/points-rules.ts` (the choices in the admin). Keep the two the same;
`npm run validate-content` tells you if they differ. To add a new activity, add it in both places.

## 7. Monthly reports for parents

`/reports` lists every month from the start date. Each report is built from the content: sessions held
vs planned, sprints completed and the current sprint, checks ticked, projects finished, points and
badges, plus your monthly note if you wrote one (otherwise just the numbers).

**To print or send one:** open the month → **Print / Save as PDF** → choose *A4* and *Save as PDF* (or a
printer). It's designed to fit on one page and always prints in light colours, without the site menus.
Send the PDF to parents however you like.

A new month's report page appears after the next deploy in that month. Any Save in the admin triggers
one, or use *Redeploy* in Vercel.

## 8. Files: size advice

- Keep each file **under about 15 MB**. Big files make saving slow, live in the repository forever,
  and are slow for parents on phones. (GitHub refuses files over 100 MB.)
- Export slides to **PDF** rather than uploading `.pptx`: PDFs preview inline and are usually smaller.
- **Videos:** don't upload them. Put them on YouTube as **Unlisted** and add the link to the session's
  *Links*.
- File sizes are shown next to each file on the site.

## 9. Optional: a site-wide password

Vercel → **Settings → Environment Variables** → add `SITE_PASSWORD` with a password of your choice →
Redeploy. Visitors then get the browser's password box: any username, that password. Remove the
variable (and redeploy) to turn it off. The admin is behind it too; after entering the site password
once, GitHub login works as usual.

## 10. How it's built (for later)

- **Next.js 16** (App Router, TypeScript strict) + **Tailwind CSS 4**; every public page is generated at
  build time. Only `/keystatic` and `/api/keystatic` run on the server.
- **Keystatic** for content: schema in `keystatic.config.ts`, files in `content/`, uploads in
  `public/files/`.
- `lib/content/` is the only code that reads content (Keystatic Reader API). `lib/derive/` holds pure,
  unit-tested functions for progress, current sprint, next session, points, badge unlocking and report
  stats. "Next session", "points this month" and "new badge" are worked out in the browser from today's
  date, so they're right between deploys.
- Design tokens (colours for both themes) are CSS variables in `app/globals.css`.
- Decisions and their reasons: `DECISIONS.md`. Build plan and status: `TODO.md`.
- QA scripts used during the build (Playwright) are in `scripts/qa/`, e.g.
  `node scripts/qa/screenshots.mjs <outDir> / /roadmap` against `npm run build && npm start -- -p 3100`.
