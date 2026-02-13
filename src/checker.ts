import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CheckResult } from './types.js';
import { getMinMajorFromRange, getMajorFromSpecifier } from './version-utils.js';

export function check(dir: string): CheckResult {
  const pkgPath = resolve(dir, 'package.json');
  let pkg: Record<string, unknown>;

  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  } catch {
    return {
      status: 'warn',
      enginesNode: { raw: null, minMajor: null },
      typesNode: { raw: null, major: null, location: null },
      message: `Could not read or parse ${pkgPath}`,
      fix: null,
    };
  }

  // Extract engines.node
  const engines = pkg.engines as Record<string, string> | undefined;
  const enginesNodeRaw = engines?.node ?? null;
  const minMajor = enginesNodeRaw ? getMinMajorFromRange(enginesNodeRaw) : null;

  // Extract @types/node — check devDependencies first, then dependencies
  let typesNodeRaw: string | null = null;
  let typesLocation: 'devDependencies' | 'dependencies' | null = null;

  const devDeps = pkg.devDependencies as Record<string, string> | undefined;
  const deps = pkg.dependencies as Record<string, string> | undefined;

  if (devDeps?.['@types/node']) {
    typesNodeRaw = devDeps['@types/node'];
    typesLocation = 'devDependencies';
  } else if (deps?.['@types/node']) {
    typesNodeRaw = deps['@types/node'];
    typesLocation = 'dependencies';
  }

  const typesNodeMajor = typesNodeRaw ? getMajorFromSpecifier(typesNodeRaw) : null;

  // Neither field present
  if (!enginesNodeRaw && !typesNodeRaw) {
    return {
      status: 'warn',
      enginesNode: { raw: null, minMajor: null },
      typesNode: { raw: null, major: null, location: null },
      message: 'Neither "engines.node" nor "@types/node" found in package.json.',
      fix: null,
    };
  }

  // Missing engines.node
  if (!enginesNodeRaw) {
    return {
      status: 'warn',
      enginesNode: { raw: null, minMajor: null },
      typesNode: { raw: typesNodeRaw, major: typesNodeMajor, location: typesLocation },
      message: 'No "engines.node" field found. Cannot verify @types/node compatibility.',
      fix: 'Add "engines": { "node": ">=XX" } to your package.json.',
    };
  }

  // Missing @types/node
  if (!typesNodeRaw) {
    return {
      status: 'warn',
      enginesNode: { raw: enginesNodeRaw, minMajor },
      typesNode: { raw: null, major: null, location: null },
      message: '@types/node is not installed. Cannot verify compatibility.',
      fix: minMajor ? `npm install -D @types/node@^${minMajor}` : null,
    };
  }

  // Could not parse engines.node
  if (minMajor === null) {
    return {
      status: 'warn',
      enginesNode: { raw: enginesNodeRaw, minMajor: null },
      typesNode: { raw: typesNodeRaw, major: typesNodeMajor, location: typesLocation },
      message: `Could not parse minimum version from engines.node: "${enginesNodeRaw}"`,
      fix: null,
    };
  }

  // Could not parse @types/node
  if (typesNodeMajor === null) {
    return {
      status: 'warn',
      enginesNode: { raw: enginesNodeRaw, minMajor },
      typesNode: { raw: typesNodeRaw, major: null, location: typesLocation },
      message: `Could not parse major version from @types/node: "${typesNodeRaw}"`,
      fix: null,
    };
  }

  // Both parsed — compare
  if (minMajor === typesNodeMajor) {
    return {
      status: 'pass',
      enginesNode: { raw: enginesNodeRaw, minMajor },
      typesNode: { raw: typesNodeRaw, major: typesNodeMajor, location: typesLocation },
      message: `@types/node major (${typesNodeMajor}) matches engines.node minimum major (${minMajor}).`,
      fix: null,
    };
  }

  return {
    status: 'fail',
    enginesNode: { raw: enginesNodeRaw, minMajor },
    typesNode: { raw: typesNodeRaw, major: typesNodeMajor, location: typesLocation },
    message: `@types/node major (${typesNodeMajor}) does not match engines.node minimum major (${minMajor}).`,
    fix: `npm install -D @types/node@^${minMajor}`,
  };
}
