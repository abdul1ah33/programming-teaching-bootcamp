import { describe, expect, it } from 'vitest';
import { session, sprint } from '@/tests/fixtures';
import { allResources, canPreview, fileExtension, formatBytes, latestResources } from './resources';

describe('fileExtension / canPreview', () => {
  it('reads the extension from a path, ignoring query and hash', () => {
    expect(fileExtension('/files/sessions/1/notes.PDF')).toBe('pdf');
    expect(fileExtension('/files/a.tar.gz?x=1#y')).toBe('gz');
    expect(fileExtension('/files/README')).toBe('');
    expect(fileExtension('/files/.hidden')).toBe('');
  });
  it('previews PDFs only', () => {
    expect(canPreview('/files/a.pdf')).toBe(true);
    expect(canPreview('/files/a.pptx')).toBe(false);
    expect(canPreview('/files/a.zip')).toBe(false);
  });
});

describe('allResources', () => {
  const sprints = [
    sprint(0, { slug: 'ct', title: 'Computational Thinking', files: [{ label: 'Reference', type: 'notes', url: '/files/sprints/ct/ref.pdf' }] }),
    sprint(1, { slug: 'py', title: 'Python Foundations', files: [{ label: 'Setup', type: 'other', url: '/files/sprints/py/setup.zip' }] }),
  ];
  const sessions = [
    session(1, { date: '2026-11-03', sprint: 'ct', files: [{ label: 'Slides 1', type: 'slides', url: '/files/sessions/1/s.pdf' }] }),
    session(2, {
      date: '2026-11-07',
      sprint: 'py',
      files: [
        { label: 'Exercises 2', type: 'exercises', url: '/files/sessions/2/e.pdf' },
        { label: 'Solution 2', type: 'solution', url: '/files/sessions/2/sol.py' },
      ],
    }),
    session(3, { date: '2026-11-10', sprint: 'ct' }),
  ];

  it('lists session files newest first, then sprint files by number', () => {
    const r = allResources(sprints, sessions);
    expect(r.map((x) => x.label)).toEqual(['Exercises 2', 'Solution 2', 'Slides 1', 'Reference', 'Setup']);
  });

  it('carries sprint and session context and unique keys', () => {
    const r = allResources(sprints, sessions);
    expect(r[0]).toMatchObject({
      source: 'session',
      extension: 'pdf',
      sprint: { slug: 'py', number: 1 },
      session: { number: 2, date: '2026-11-07' },
    });
    expect(r[3]).toMatchObject({ source: 'sprint', session: null, sprint: { slug: 'ct' } });
    expect(new Set(r.map((x) => x.key)).size).toBe(r.length);
  });

  it('handles a session pointing to an unknown sprint', () => {
    const r = allResources([], [session(1, { sprint: 'gone', files: [{ label: 'x', type: 'other', url: '/f/x.txt' }] })]);
    expect(r[0]?.sprint).toBeNull();
  });

  it('latestResources limits the list', () => {
    expect(latestResources(sprints, sessions, 2).map((x) => x.label)).toEqual(['Exercises 2', 'Solution 2']);
    expect(latestResources([], [])).toEqual([]);
  });
});

describe('formatBytes', () => {
  it('uses B, KB and MB', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1451)).toBe('1 KB');
    expect(formatBytes(1.4 * 1024 * 1024)).toBe('1.4 MB');
    expect(formatBytes(14.6 * 1024 * 1024)).toBe('15 MB');
  });
});
