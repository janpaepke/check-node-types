import semver from 'semver';

/**
 * Extract the minimum major version from an engines.node range string.
 * ">=20" -> 20, "^20.0.0" -> 20, ">=18 <22" -> 18, "20.x" -> 20
 */
export function getMinMajorFromRange(range: string): number | null {
  try {
    const min = semver.minVersion(range);
    if (min) return min.major;
  } catch {
    // Invalid range — fall through to coerce
  }

  const coerced = semver.coerce(range);
  if (coerced) return coerced.major;

  return null;
}

/**
 * Extract the major version from a dependency version specifier.
 * "^22.1.0" -> 22, "~20.0.0" -> 20, "22.x" -> 22
 * Returns null for "*", "latest", or unparseable values.
 */
export function getMajorFromSpecifier(specifier: string): number | null {
  if (specifier === '*' || specifier === 'latest') return null;

  const coerced = semver.coerce(specifier);
  if (coerced) return coerced.major;

  return null;
}
