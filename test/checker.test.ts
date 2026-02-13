import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { check } from '../src/checker.js';

const fixture = (name: string) => resolve(import.meta.dirname, 'fixtures', name);

describe('check', () => {
  it('passes when @types/node matches engines.node', () => {
    const result = check(fixture('match'));
    expect(result.status).toBe('pass');
    expect(result.enginesNode.minMajor).toBe(20);
    expect(result.typesNode.major).toBe(20);
    expect(result.fix).toBeNull();
  });

  it('fails when @types/node does not match engines.node', () => {
    const result = check(fixture('mismatch'));
    expect(result.status).toBe('fail');
    expect(result.enginesNode.minMajor).toBe(20);
    expect(result.typesNode.major).toBe(22);
    expect(result.fix).toContain('@types/node@^20');
  });

  it('warns when engines.node is missing', () => {
    const result = check(fixture('missing-engines'));
    expect(result.status).toBe('warn');
    expect(result.enginesNode.raw).toBeNull();
    expect(result.message).toContain('engines.node');
  });

  it('warns when @types/node is missing', () => {
    const result = check(fixture('missing-types'));
    expect(result.status).toBe('warn');
    expect(result.typesNode.raw).toBeNull();
    expect(result.fix).toContain('@types/node@^20');
  });

  it('handles complex engine ranges', () => {
    const result = check(fixture('complex-range'));
    expect(result.status).toBe('pass');
    expect(result.enginesNode.minMajor).toBe(18);
    expect(result.typesNode.major).toBe(18);
  });

  it('finds @types/node in dependencies (not just devDependencies)', () => {
    const result = check(fixture('types-in-deps'));
    expect(result.status).toBe('pass');
    expect(result.typesNode.location).toBe('dependencies');
  });

  it('warns when neither field is present', () => {
    const result = check(fixture('neither'));
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Neither');
  });

  it('warns when engines.node is unparseable', () => {
    const result = check(fixture('unparseable-engines'));
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Could not parse');
  });

  it('warns when @types/node specifier is unparseable', () => {
    const result = check(fixture('unparseable-types'));
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Could not parse');
  });

  it('warns when package.json does not exist', () => {
    const result = check('/nonexistent/path');
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Could not read');
  });

  it('warns when package.json is malformed JSON', () => {
    const result = check(fixture('malformed-json'));
    expect(result.status).toBe('warn');
    expect(result.message).toContain('Could not read');
  });

  it('prefers devDependencies over dependencies when both have @types/node', () => {
    const result = check(fixture('both-deps'));
    expect(result.status).toBe('pass');
    expect(result.typesNode.location).toBe('devDependencies');
    expect(result.typesNode.major).toBe(20);
  });
});
