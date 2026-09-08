const CLIENT_VERSION_PATTERN = /^\d+(?:\.\d+)*(?:-[0-9A-Za-z.-]+)?$/;
const MAX_CLIENT_VERSION_PART = 2_147_483_647;
/** Date-style app versions used YYYY.M.D (e.g. 2026.9.4) before semver. */
const LEGACY_DATE_VERSION_YEAR_FLOOR = 2020;
/** Classic semver majors stay well below calendar years. */
const SEMVER_MAJOR_CEILING = 1000;

interface ParsedClientVersion {
  parts: number[];
  prerelease: string | null;
}

const parseClientVersion = (value: string): ParsedClientVersion | null => {
  const normalized = value.trim().replace(/^v/i, '');
  if (!CLIENT_VERSION_PATTERN.test(normalized)) return null;
  const prereleaseSeparator = normalized.indexOf('-');
  const release = prereleaseSeparator >= 0
    ? normalized.slice(0, prereleaseSeparator)
    : normalized;
  const prerelease = prereleaseSeparator >= 0
    ? normalized.slice(prereleaseSeparator + 1)
    : null;
  const parts = release.split('.').map(Number);
  if (parts.some(part => (
    !Number.isSafeInteger(part) || part > MAX_CLIENT_VERSION_PART
  ))) return null;
  return { parts, prerelease };
};

const isLegacyDateBasedVersion = (parts: number[]): boolean => (
  (parts[0] ?? 0) >= LEGACY_DATE_VERSION_YEAR_FLOOR
);

const isClassicSemverVersion = (parts: number[]): boolean => (
  (parts[0] ?? 0) < SEMVER_MAJOR_CEILING
);

const compareVersionParts = (left: number[], right: number[]): number => {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index] ?? 0;
    const rightPart = right[index] ?? 0;
    if (leftPart !== rightPart) return leftPart > rightPart ? 1 : -1;
  }
  return 0;
};

const comparePrerelease = (left: string | null, right: string | null): number => {
  if (left === null && right === null) return 0;
  // Release without prerelease is newer than the same numbers with prerelease.
  if (left === null) return 1;
  if (right === null) return -1;
  const leftKey = left.toLowerCase();
  const rightKey = right.toLowerCase();
  if (leftKey === rightKey) return 0;
  return leftKey > rightKey ? 1 : -1;
};

/**
 * Compare BaiYing client versions.
 * Returns 1 if `a` is newer, -1 if older, 0 if equal.
 *
 * After migrating off date-based versions (2026.x.y), classic semver
 * (1.0.0) must sort newer than any legacy date version so updates still work.
 */
export const compareClientVersions = (
  a: string | null | undefined,
  b: string | null | undefined,
): number => {
  const left = a ? parseClientVersion(a) : null;
  const right = b ? parseClientVersion(b) : null;
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;

  if (isClassicSemverVersion(left.parts) && isLegacyDateBasedVersion(right.parts)) {
    return 1;
  }
  if (isLegacyDateBasedVersion(left.parts) && isClassicSemverVersion(right.parts)) {
    return -1;
  }

  const releaseOrder = compareVersionParts(left.parts, right.parts);
  if (releaseOrder !== 0) return releaseOrder;
  return comparePrerelease(left.prerelease, right.prerelease);
};

export const isClientVersionAtLeast = (
  currentVersion: string | null | undefined,
  minimumVersion: string | null | undefined,
): boolean => {
  if (!currentVersion || !minimumVersion) return false;
  if (!parseClientVersion(currentVersion) || !parseClientVersion(minimumVersion)) {
    return false;
  }
  return compareClientVersions(currentVersion, minimumVersion) >= 0;
};
