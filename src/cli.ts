import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { Command } from 'commander';
import { check } from './checker.js';
import { formatResult, formatJson } from './output.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('check-node-types')
  .description('Verify @types/node major version matches engines.node minimum major')
  .version(pkg.version)
  .option('-p, --path <dir>', 'path to directory containing package.json', process.cwd())
  .option('--json', 'output results as JSON', false)
  .option('-v, --verbose', 'show version details even on success', false)
  .option('--no-color', 'disable colored output')
  .action((options) => {
    const result = check(options.path);
    const useColor = options.color !== false && !process.env.NO_COLOR;

    if (options.json) {
      console.log(formatJson(result));
    } else {
      console.log(formatResult(result, { ...options, color: useColor }));
    }

    const exitCode = result.status === 'pass' ? 0 : result.status === 'fail' ? 1 : 2;
    process.exit(exitCode);
  });

program.parse();
