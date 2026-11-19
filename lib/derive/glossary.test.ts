import { describe, expect, it } from 'vitest';
import { groupByLetter, linkTerms, termAliases, termsForSprint } from './glossary';

const terms = [
  { slug: 'list', term: 'List', firstSprint: 's3' },
  { slug: 'linked-list', term: 'Linked list', firstSprint: 's8' },
  { slug: 'dictionary', term: 'Dictionary', firstSprint: 's3' },
  { slug: 'class', term: 'Class', firstSprint: 's4' },
  { slug: 'stack-memory', term: 'Stack (memory)', firstSprint: 's7' },
  { slug: 'stack-data-structure', term: 'Stack (data structure)', firstSprint: 's8' },
  { slug: 'malloc-and-free', term: 'malloc and free', firstSprint: 's7' },
  { slug: 'big-o', term: 'Big-O', firstSprint: 's8' },
  { slug: 'loop', term: 'Loop', firstSprint: 's2' },
];

const linked = (segs: { text: string; slug?: string }[]) => segs.filter((s) => s.slug).map((s) => `${s.text}→${s.slug}`);

describe('termAliases', () => {
  it('includes the name, the name without brackets, and both halves of "X and Y"', () => {
    expect(termAliases('Stack (memory)')).toEqual(['stack (memory)', 'stack']);
    expect(termAliases('malloc and free')).toEqual(['malloc and free', 'malloc', 'free']);
    expect(termAliases('Loop')).toEqual(['loop']);
  });
});

describe('linkTerms', () => {
  it('links plurals: s, es and ies', () => {
    const [a] = linkTerms(['Lists, dictionaries and classes'], terms);
    expect(linked(a!)).toEqual(['Lists→list', 'dictionaries→dictionary', 'classes→class']);
  });

  it('keeps the text intact around links', () => {
    const [a] = linkTerms(['while loops and for loops'], terms);
    expect(a!.map((s) => s.text).join('')).toBe('while loops and for loops');
  });

  it('links each term only once across all texts', () => {
    const out = linkTerms(['while loops and for loops', 'Loop tracing'], terms);
    expect(out.flatMap(linked)).toEqual(['loops→loop']);
  });

  it('prefers the longest match: "linked list" over "list"', () => {
    const [a] = linkTerms(['Linked lists: nodes and traversal'], terms);
    expect(linked(a!)).toEqual(['Linked lists→linked-list']);
  });

  it('resolves a shared word to the term introduced in the current sprint', () => {
    expect(linked(linkTerms(['stack and heap memory'], terms, 's7')[0]!)).toEqual(['stack→stack-memory']);
    expect(linked(linkTerms(['Stacks and queues'], terms, 's8')[0]!)).toEqual(['Stacks→stack-data-structure']);
  });

  it('matches halves of "X and Y" terms and hyphenated names', () => {
    const [a] = linkTerms(['malloc(), calloc(), realloc(), and free()', 'Big-O intuition'], terms).map(linked);
    expect(a).toEqual(['malloc→malloc-and-free']);
    expect(linkTerms(['Big-O intuition'], terms).flatMap(linked)).toEqual(['Big-O→big-o']);
  });

  it('does not match inside other words', () => {
    expect(linkTerms(['classroom blacklist'], terms).flatMap(linked)).toEqual([]);
  });

  it('returns plain text when there are no terms', () => {
    expect(linkTerms(['hello'], [])).toEqual([[{ text: 'hello' }]]);
  });
});

describe('termsForSprint and groupByLetter', () => {
  it('filters by sprint, A–Z', () => {
    expect(termsForSprint(terms, 's3').map((t) => t.slug)).toEqual(['dictionary', 'list']);
  });
  it('groups by first letter, case-insensitively', () => {
    const groups = groupByLetter(terms);
    expect(groups.map((g) => g.letter)).toEqual(['B', 'C', 'D', 'L', 'M', 'S']);
    expect(groups.find((g) => g.letter === 'M')?.terms[0]?.slug).toBe('malloc-and-free');
  });
});
