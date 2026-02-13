import { describe, it, expect } from 'vitest';
import { getMinMajorFromRange, getMajorFromSpecifier } from '../src/version-utils.js';

describe('getMinMajorFromRange', () => {
  it.each([
    ['>=20', 20],
    ['^20.0.0', 20],
    ['~20.11.0', 20],
    ['20.x', 20],
    ['>=18 <22', 18],
    ['>=18.0.0 || >=20.0.0', 18],
    ['20', 20],
    ['>=18.17.0', 18],
    ['*', 0],
  ])('parses "%s" as major %i', (range, expected) => {
    expect(getMinMajorFromRange(range)).toBe(expected);
  });

  it('returns null for unparseable input', () => {
    expect(getMinMajorFromRange('not-a-version')).toBeNull();
  });

  it('treats empty string as unconstrained (major 0)', () => {
    expect(getMinMajorFromRange('')).toBe(0);
  });

  it('handles whitespace-padded range', () => {
    expect(getMinMajorFromRange(' >=20 ')).toBe(20);
  });

  it('handles >=0', () => {
    expect(getMinMajorFromRange('>=0')).toBe(0);
  });

  it('handles pre-release version', () => {
    expect(getMinMajorFromRange('>=20.0.0-rc.1')).toBe(20);
  });
});

describe('getMajorFromSpecifier', () => {
  it.each([
    ['^22.1.0', 22],
    ['~20.0.0', 20],
    ['22.x', 22],
    ['22', 22],
    ['22.0.0', 22],
    ['^20.11.5', 20],
  ])('parses "%s" as major %i', (specifier, expected) => {
    expect(getMajorFromSpecifier(specifier)).toBe(expected);
  });

  it('returns null for "*"', () => {
    expect(getMajorFromSpecifier('*')).toBeNull();
  });

  it('returns null for "latest"', () => {
    expect(getMajorFromSpecifier('latest')).toBeNull();
  });
});
