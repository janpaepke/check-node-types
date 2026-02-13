import { describe, it, expect } from 'vitest';
import { formatResult, formatJson } from '../src/output.js';
import type { CheckResult, CliOptions } from '../src/types.js';

const baseOptions: CliOptions = { path: '.', json: false, verbose: false, color: false };

const passResult: CheckResult = {
  status: 'pass',
  enginesNode: { raw: '>=20', minMajor: 20 },
  typesNode: { raw: '^20.11.0', major: 20, location: 'devDependencies' },
  message: '@types/node major (20) matches engines.node minimum major (20).',
  fix: null,
};

const failResult: CheckResult = {
  status: 'fail',
  enginesNode: { raw: '>=20', minMajor: 20 },
  typesNode: { raw: '^22.1.0', major: 22, location: 'devDependencies' },
  message: '@types/node major (22) does not match engines.node minimum major (20).',
  fix: 'npm install -D @types/node@^20',
};

const warnResult: CheckResult = {
  status: 'warn',
  enginesNode: { raw: null, minMajor: null },
  typesNode: { raw: '^20.0.0', major: 20, location: 'devDependencies' },
  message: 'No "engines.node" field found. Cannot verify @types/node compatibility.',
  fix: 'Add "engines": { "node": ">=XX" } to your package.json.',
};

describe('formatResult', () => {
  it('shows single line for pass without verbose', () => {
    const output = formatResult(passResult, baseOptions);
    expect(output).toContain('PASS');
    expect(output.split('\n')).toHaveLength(1);
  });

  it('shows version details for pass with verbose', () => {
    const output = formatResult(passResult, { ...baseOptions, verbose: true });
    expect(output).toContain('PASS');
    expect(output).toContain('engines.node: >=20');
    expect(output).toContain('@types/node:  ^20.11.0');
    expect(output).toContain('minimum major: 20');
  });

  it('shows both majors and fix for fail', () => {
    const output = formatResult(failResult, baseOptions);
    expect(output).toContain('FAIL');
    expect(output).toContain('20');
    expect(output).toContain('22');
    expect(output).toContain('Fix:');
    expect(output).toContain('npm install -D @types/node@^20');
  });

  it('shows message and fix for warn', () => {
    const output = formatResult(warnResult, baseOptions);
    expect(output).toContain('WARN');
    expect(output).toContain('engines.node');
    expect(output).toContain('Fix:');
  });

  it('does not include ANSI codes when color is false', () => {
    const output = formatResult(failResult, baseOptions);
    expect(output).not.toMatch(/\x1b\[/);
  });

  it('includes ANSI codes when color is true', () => {
    const output = formatResult(failResult, { ...baseOptions, color: true });
    expect(output).toMatch(/\x1b\[/);
  });
});

describe('formatJson', () => {
  it('returns valid JSON matching the result structure', () => {
    const output = formatJson(failResult);
    const parsed = JSON.parse(output);
    expect(parsed.status).toBe('fail');
    expect(parsed.enginesNode.minMajor).toBe(20);
    expect(parsed.typesNode.major).toBe(22);
    expect(parsed.fix).toBe('npm install -D @types/node@^20');
  });

  it('returns pretty-printed JSON', () => {
    const output = formatJson(passResult);
    expect(output).toContain('\n');
    expect(output.startsWith('{')).toBe(true);
  });
});
