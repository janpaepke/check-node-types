import chalk, { Chalk } from 'chalk';
import type { CheckResult, CliOptions } from './types.js';

export function formatResult(result: CheckResult, options: CliOptions): string {
  const c = options.color
    ? new Chalk({ level: Math.max(1, chalk.level) as 1 | 2 | 3 })
    : new Chalk({ level: 0 });
  const lines: string[] = [];

  const label = result.status === 'pass'
    ? c.green('PASS')
    : result.status === 'fail'
      ? c.red('FAIL')
      : c.yellow('WARN');

  lines.push(`${c.bold('check-node-types')}: ${label}`);

  if (result.status === 'pass' && !options.verbose) {
    return lines.join('\n');
  }

  if (result.status === 'fail') {
    const engLabel = `engines.node minimum major:`;
    const typLabel = `@types/node major:`;
    const pad = Math.max(engLabel.length, typLabel.length);
    lines.push(`  ${engLabel.padEnd(pad)}  ${c.bold(String(result.enginesNode.minMajor))}`);
    lines.push(`  ${typLabel.padEnd(pad)}  ${c.bold(String(result.typesNode.major))}`);
  } else if (result.status === 'warn') {
    lines.push(`  ${result.message}`);
  }

  if (options.verbose && result.status === 'pass') {
    lines.push(`  engines.node: ${result.enginesNode.raw} ${c.dim(`(minimum major: ${result.enginesNode.minMajor})`)}`);
    lines.push(`  @types/node:  ${result.typesNode.raw} ${c.dim(`(major: ${result.typesNode.major})`)}`);
  }

  if (result.fix) {
    lines.push('');
    lines.push(`  Fix: ${c.bold(result.fix)}`);
  }

  return lines.join('\n');
}

export function formatJson(result: CheckResult): string {
  return JSON.stringify(result, null, 2);
}
