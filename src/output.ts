import chalk, { Chalk } from 'chalk';
import type { CheckResult, CliOptions } from './types.js';
import { sourceLabel } from './version-utils.js';

export function formatResult(result: CheckResult, options: CliOptions): string {
  const c = options.color
    ? new Chalk({ level: Math.max(1, chalk.level) as 1 | 2 | 3 })
    : new Chalk({ level: 0 });

  const label = sourceLabel(result.source);

  // --print: just show detected versions and exit
  if (options.print) {
    const lines: string[] = [];
    lines.push(`${label}: ${result.nodeVersion.raw ?? 'not found'} ${result.nodeVersion.major !== null ? c.dim(`(major: ${result.nodeVersion.major})`) : ''}`);
    lines.push(`@types/node: ${result.typesNode.raw ?? 'not found'} ${result.typesNode.major !== null ? c.dim(`(major: ${result.typesNode.major})`) : ''}`);
    return lines.join('\n');
  }

  // --quiet: suppress output on pass
  if (options.quiet && result.status === 'pass') {
    return '';
  }

  const lines: string[] = [];

  const statusLabel = result.status === 'pass'
    ? c.green('PASS')
    : result.status === 'fail'
      ? c.red('FAIL')
      : c.yellow('WARN');

  lines.push(`${c.bold('check-node-types')}: ${statusLabel}`);

  if (result.status === 'pass') {
    return lines.join('\n');
  }

  if (result.status === 'fail') {
    const engLabel = `${label} major:`;
    const typLabel = `@types/node major:`;
    const pad = Math.max(engLabel.length, typLabel.length);
    lines.push(`  ${engLabel.padEnd(pad)}  ${c.bold(String(result.nodeVersion.major))}`);
    lines.push(`  ${typLabel.padEnd(pad)}  ${c.bold(String(result.typesNode.major))}`);
  } else if (result.status === 'warn') {
    lines.push(`  ${result.message}`);
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
