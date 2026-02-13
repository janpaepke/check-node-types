# check-node-types

Verify that your `@types/node` major version matches your `engines.node` minimum — catch type/runtime mismatches before they hit production.

## The Problem

The `@types/node` major version maps directly to Node.js versions: `@types/node@22` provides types for Node.js 22. If your `engines.node` says `>=20` but `@types/node` is `^22`, TypeScript will happily let you use Node 22 APIs that crash at runtime on Node 20.

No existing linter, ESLint plugin, or package manager catches this drift. This tool does.

## Install

```bash
npm install -D check-node-types
```

Or run directly:

```bash
npx check-node-types
```

## Usage

```bash
# Check the current directory
check-node-types

# Check a specific directory
check-node-types -p ./packages/my-lib

# Show version details on success
check-node-types -v

# JSON output (for CI parsing)
check-node-types --json
```

### As an npm script

```json
{
  "scripts": {
    "check-types": "check-node-types"
  }
}
```

### In CI (GitHub Actions)

```yaml
- name: Verify @types/node matches engines.node
  run: npx check-node-types
```

### With lint-staged / Husky

```json
{
  "lint-staged": {
    "package.json": ["check-node-types"]
  }
}
```

## Options

| Flag | Short | Description | Default |
|---|---|---|---|
| `--path <dir>` | `-p` | Path to directory containing package.json | `.` |
| `--json` | | Output as JSON | `false` |
| `--verbose` | `-v` | Show version details even on success | `false` |
| `--no-color` | | Disable colored output | auto-detect |

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Pass — `@types/node` matches `engines.node` |
| `1` | Fail — major version mismatch |
| `2` | Warning — missing `engines.node`, missing `@types/node`, or unparseable versions |

## Example Output

**Pass (verbose):**

```
check-node-types: PASS
  engines.node: >=20 (minimum major: 20)
  @types/node:  ^20.11.0 (major: 20)
```

**Fail:**

```
check-node-types: FAIL
  engines.node minimum major:  20
  @types/node major:           22

  Fix: npm install -D @types/node@^20
```

## How It Works

1. Reads `package.json` from the target directory
2. Extracts the minimum major version from `engines.node` (e.g. `>=20` → `20`)
3. Extracts the major version from `@types/node` in `devDependencies` or `dependencies`
4. Compares them and reports the result with an actionable fix command on mismatch

## License

MIT
