import { describe, expect, it } from 'vitest';
import { validateContent } from './validate';

describe('seeded content', () => {
  it('passes validation with no errors', async () => {
    const result = await validateContent();
    expect(result.errors).toEqual([]);
    expect(result.counts.sprints).toBe(10);
  });
});
