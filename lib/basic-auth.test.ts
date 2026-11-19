import { describe, expect, it } from 'vitest';
import { isAuthorized } from './basic-auth';

const header = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`;

describe('isAuthorized', () => {
  it('accepts the right password with any username', () => {
    expect(isAuthorized(header('parent', 'secret'), 'secret')).toBe(true);
    expect(isAuthorized(header('', 'secret'), 'secret')).toBe(true);
  });
  it('accepts passwords containing colons', () => {
    expect(isAuthorized(header('x', 'a:b:c'), 'a:b:c')).toBe(true);
  });
  it('rejects wrong or missing credentials', () => {
    expect(isAuthorized(header('x', 'nope'), 'secret')).toBe(false);
    expect(isAuthorized(header('x', 'secre'), 'secret')).toBe(false);
    expect(isAuthorized(null, 'secret')).toBe(false);
    expect(isAuthorized('Bearer abc', 'secret')).toBe(false);
    expect(isAuthorized('Basic !!!not-base64', 'secret')).toBe(false);
    expect(isAuthorized(`Basic ${btoa('nocolon')}`, 'secret')).toBe(false);
  });
});
