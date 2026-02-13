import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const cli = resolve(import.meta.dirname, '../dist/cli.mjs');
const fixture = (name: string) => resolve(import.meta.dirname, 'fixtures', name);

function run(args: string[]): { stdout: string; exitCode: number } {
  try {
    const stdout = execFileSync('node', [cli, ...args], { encoding: 'utf-8', env: { ...process.env, NO_COLOR: '1' } });
    return { stdout, exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout: string; status: number };
    return { stdout: e.stdout ?? '', exitCode: e.status };
  }
}

describe('CLI', () => {
  it('exits 0 for matching versions', () => {
    const { exitCode, stdout } = run(['-p', fixture('match')]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('PASS');
  });

  it('exits 1 for mismatched versions', () => {
    const { exitCode, stdout } = run(['-p', fixture('mismatch')]);
    expect(exitCode).toBe(1);
    expect(stdout).toContain('FAIL');
  });

  it('exits 2 for warnings', () => {
    const { exitCode, stdout } = run(['-p', fixture('missing-engines')]);
    expect(exitCode).toBe(2);
    expect(stdout).toContain('WARN');
  });

  it('outputs valid JSON with --json flag', () => {
    const { stdout } = run(['--json', '-p', fixture('match')]);
    const parsed = JSON.parse(stdout);
    expect(parsed.status).toBe('pass');
  });

  it('shows version details with --verbose on pass', () => {
    const { stdout } = run(['-v', '-p', fixture('match')]);
    expect(stdout).toContain('engines.node');
    expect(stdout).toContain('@types/node');
  });
});
