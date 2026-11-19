import { Download, Mail, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Container, PageHeader, SectionHeading } from '@/components/ui/primitives';
import { StatusPill } from '@/components/ui/status-pill';
import { getSettings, getSprints } from '@/lib/content';
import { currentSprint } from '@/lib/derive/current-sprint';
import { formatDate } from '@/lib/derive/dates';
import { PHASES } from '@/lib/model/enums';

export const metadata: Metadata = { title: 'Learning plan' };

const AT_A_GLANCE: [string, string][] = [
  ['Languages', 'Python first, then C'],
  ['Structure', '10 sprints, each ending with proof of learning'],
  ['How long', 'About 6–9 months, moving on when ready, not by the calendar'],
  ['Pace', '2 sessions a week, 60–90 minutes each, plus practice'],
  ['Style', 'Short explanations, coding together, solo exercises, projects and reflection'],
];

const COMPLETE_WHEN = [
  'All essential lessons and practice tasks have been attempted.',
  'They can explain the sprint’s main ideas in their own words.',
  'They complete the sprint project and can demonstrate it.',
  'They score about 70% or more on a short quiz, with a retry allowed after reviewing mistakes.',
  'The teacher confirms they can apply the ideas, not just repeat a memorised answer.',
];

const HOMEWORK: [string, string, string][] = [
  ['Quick recall', '3–5 questions', 'Revisit ideas from the lesson'],
  ['Core exercises', '2–4 problems', 'Practise the new skill'],
  ['Challenge problem', '1, optional', 'Encourage deeper thinking'],
  ['Reflection', '2–3 sentences', 'Explain what was learned or what was confusing'],
];

const TOOLS: [string, string, string][] = [
  ['Python 3', 'The main language for the first part', 'Sprint 1'],
  ['A beginner-friendly editor (e.g. VS Code)', 'Write and run programs', 'Sprint 1'],
  ['Terminal / command prompt', 'Run programs and basic commands', 'Sprint 1, gradually'],
  ['C compiler (e.g. GCC)', 'Compile and run C programs', 'Sprint 5'],
  ['Debugger', 'Step through a program and inspect values', 'Simply in Python; more in C'],
  ['Git and GitHub', 'Save versions and build good habits', 'Optional, Sprint 4 or later'],
];

export default async function PlanPage() {
  const [settings, sprints] = await Promise.all([getSettings(), getSprints()]);
  const name = settings.studentFirstName;
  const current = currentSprint(sprints);

  return (
    <Container>
      <PageHeader
        eyebrow="For parents"
        title="The learning plan"
        lead={`How ${name} is learning to program: what the course covers, how a week works, and how progress is checked.`}
      />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 space-y-14 lg:col-span-8">
          <section aria-labelledby="idea">
            <SectionHeading id="idea">The idea</SectionHeading>
            <p className="max-w-[62ch] font-serif text-2xl leading-snug">
              Learn to think, experiment, build and explain.
            </p>
            <p className="mt-4 max-w-[65ch] leading-relaxed text-muted">
              {name} should spend more time solving problems and making programs than watching explanations or
              memorising syntax. The course starts with problem-solving and Python, then moves to C to understand
              what happens underneath: types, memory, pointers and data structures. The aim isn’t to rush through
              topics. It’s real confidence and understanding.
            </p>
            <dl className="mt-6 divide-y divide-border rounded-lg border border-border bg-surface">
              {AT_A_GLANCE.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                  <dt className="font-mono text-xs uppercase tracking-[0.1em] text-muted sm:pt-0.5">{k}</dt>
                  <dd className="text-[0.95rem]">{v}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="sprints">
            <SectionHeading id="sprints" aside={<Link href="/roadmap" className="hover:text-text">See the road map →</Link>}>
              The ten sprints
            </SectionHeading>
            <div className="space-y-6">
              {PHASES.map((phase, i) => {
                const inPhase = sprints.filter((s) => s.phase === phase.value);
                if (inPhase.length === 0) return null;
                return (
                  <div key={phase.value}>
                    <p className="mb-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      Phase {i + 1} · {phase.label}
                    </p>
                    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
                      {inPhase.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/sprints/${s.slug}`}
                            className="grid grid-cols-[2rem_1fr_auto] items-start gap-3 px-4 py-3 hover:bg-surface-2/60"
                          >
                            <span className="font-mono text-sm text-muted tabular">{s.number}</span>
                            <span className="min-w-0">
                              <span className="block text-[0.95rem] font-medium">{s.title}</span>
                              <span className="mt-0.5 block text-sm text-muted">{s.goal}</span>
                            </span>
                            <span className="flex flex-col items-end gap-1.5">
                              <StatusPill status={s.status} />
                              <span className="font-mono text-xs text-muted">{s.duration}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-labelledby="checked">
            <SectionHeading id="checked">How progress is checked</SectionHeading>
            <p className="max-w-[65ch] leading-relaxed text-muted">
              Progress means understanding and practical skill, not just getting through lessons. It’s checked
              with short quizzes, practice exercises, reading and fixing code, the sprint project, and{' '}
              {name} explaining the work in their own words. Each sprint has a short list of “ready to move on”
              checks; you can see them on every sprint page.
            </p>
            <Card className="mt-5 p-5">
              <p className="text-sm font-semibold">A sprint is complete when</p>
              <ul className="mt-3 space-y-2">
                {COMPLETE_WHEN.map((c) => (
                  <li key={c} className="flex gap-2.5 text-[0.95rem] leading-6">
                    <span aria-hidden="true" className="mt-[0.65rem] h-px w-3 shrink-0 bg-primary" />
                    {c}
                  </li>
                ))}
              </ul>
            </Card>
            <div className="mt-5 border-l-2 border-primary pl-4">
              <p className="font-semibold">Mastery over speed</p>
              <p className="mt-1 max-w-[62ch] text-muted">
                Needing another week isn’t failing a sprint. We extend it, revisit the hard part, and check again.
                The week counts are estimates; we never move on just to keep to the calendar.
              </p>
            </div>
          </section>

          <section aria-labelledby="homework">
            <SectionHeading id="homework">Homework and practice at home</SectionHeading>
            <p className="max-w-[65ch] leading-relaxed text-muted">
              Two or three short practice periods between sessions work better than one long one. A typical
              homework set takes 30–60 minutes in total.
            </p>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
              <table className="w-full min-w-[30rem] text-left text-sm">
                <thead className="border-b border-border font-mono text-xs uppercase tracking-[0.08em] text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-normal">Task</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">How much</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {HOMEWORK.map(([t, h, w]) => (
                    <tr key={t}>
                      <th scope="row" className="px-4 py-2.5 font-medium">{t}</th>
                      <td className="px-4 py-2.5 font-mono text-xs tabular">{h}</td>
                      <td className="px-4 py-2.5 text-muted">{w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="tools">
            <SectionHeading id="tools">What’s needed</SectionHeading>
            <p className="max-w-[65ch] leading-relaxed text-muted">
              Setup stays simple at the start. The first goal is the satisfaction of writing and running a first
              program; the rest is added gradually.
            </p>
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
              {TOOLS.map(([tool, why, when]) => (
                <li key={tool} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_1fr_auto] sm:gap-4">
                  <span className="text-[0.95rem] font-medium">{tool}</span>
                  <span className="text-sm text-muted">{why}</span>
                  <span className="font-mono text-xs text-muted sm:text-right">{when}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="later">
            <SectionHeading id="later">Coming later, not yet</SectionHeading>
            <p className="max-w-[65ch] leading-relaxed text-muted">
              Web development, mobile apps, databases, advanced algorithms, software architecture and AI can come
              once the core path is done and if {name} is interested. They shouldn’t distract from the
              fundamentals first. <Link href="/whats-next" className="font-medium text-primary underline underline-offset-2">What’s next</Link>{' '}
              has a short introduction to each.
            </p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:col-span-4 lg:self-start">
          <Card className="p-5">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">Now</p>
            {current ? (
              <Link href={`/sprints/${current.slug}`} className="mt-2 block hover:underline">
                <span className="font-mono text-sm text-muted">Sprint {current.number}</span>
                <span className="block font-serif text-xl font-medium">{current.title}</span>
              </Link>
            ) : (
              <p className="mt-2 text-sm text-muted">Not started yet.</p>
            )}
            <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-muted">Started</dt>
                <dd className="font-mono tabular">{formatDate(settings.startDate, 'long')}</dd>
              </div>
              {settings.scheduleText && (
                <div>
                  <dt className="text-muted">Schedule</dt>
                  <dd>{settings.scheduleText}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted">Teacher</dt>
                <dd>{settings.teacherName}</dd>
              </div>
            </dl>
          </Card>

          {settings.learningPlanPdf && (
            <a
              href={settings.learningPlanPdf}
              download
              className="flex items-center justify-between gap-3 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-on-primary hover:bg-primary-hover"
            >
              <span>Download the full plan (PDF)</span>
              <Download className="size-4" aria-hidden="true" />
            </a>
          )}

          {(settings.contactEmail || settings.contactWhatsApp) && (
            <Card className="p-5">
              <p className="text-sm font-semibold">Questions?</p>
              <p className="mt-1 text-sm text-muted">Get in touch any time.</p>
              <ul className="mt-3 space-y-2 text-sm">
                {settings.contactEmail && (
                  <li>
                    <a href={`mailto:${settings.contactEmail}`} className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary-hover">
                      <Mail className="size-4" aria-hidden="true" />
                      {settings.contactEmail}
                    </a>
                  </li>
                )}
                {settings.contactWhatsApp && (
                  <li>
                    <a
                      href={settings.contactWhatsApp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary-hover"
                    >
                      <MessageCircle className="size-4" aria-hidden="true" />
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </Card>
          )}

          <Link href="/reports" className="block rounded-lg border border-border px-4 py-3 text-sm hover:border-border-strong">
            <span className="font-medium">Monthly reports</span>
            <span className="mt-0.5 block text-muted">A printable summary of each month.</span>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
