import { describe, expect, test } from 'vitest';

import { compareClientVersions, isClientVersionAtLeast } from './clientVersion';

describe('client version comparison', () => {
  test('compares date-based versions numerically', () => {
    expect(isClientVersionAtLeast('2026.8.26', '2026.8.26')).toBe(true);
    expect(isClientVersionAtLeast('2026.10.1', '2026.8.26')).toBe(true);
    expect(isClientVersionAtLeast('2026.8.25', '2026.8.26')).toBe(false);
  });

  test('compares classic semver versions numerically', () => {
    expect(isClientVersionAtLeast('1.0.0', '1.0.0')).toBe(true);
    expect(isClientVersionAtLeast('1.2.0', '1.0.9')).toBe(true);
    expect(isClientVersionAtLeast('1.0.0', '1.0.1')).toBe(false);
    expect(compareClientVersions('1.0.1', '1.0.0')).toBe(1);
    expect(compareClientVersions('v1.0.0', '1.0.0')).toBe(0);
  });

  test('treats classic semver as newer than legacy date versions', () => {
    expect(compareClientVersions('1.0.0', '2026.9.4')).toBe(1);
    expect(compareClientVersions('2026.9.4', '1.0.0')).toBe(-1);
    expect(isClientVersionAtLeast('1.0.0', '2026.9.4')).toBe(true);
    expect(isClientVersionAtLeast('2026.9.4', '1.0.0')).toBe(false);
  });

  test('treats a prerelease as older than its release', () => {
    expect(isClientVersionAtLeast('1.0.0-beta.1', '1.0.0')).toBe(false);
    expect(isClientVersionAtLeast('1.0.0', '1.0.0-beta.1')).toBe(true);
    expect(isClientVersionAtLeast('2026.8.26-beta.1', '2026.8.26')).toBe(false);
    expect(isClientVersionAtLeast('2026.8.26', '2026.8.26-beta.1')).toBe(true);
  });

  test('rejects missing and malformed versions', () => {
    expect(isClientVersionAtLeast(undefined, '1.0.0')).toBe(false);
    expect(isClientVersionAtLeast('latest', '1.0.0')).toBe(false);
    expect(isClientVersionAtLeast('1.0.0', '1..0')).toBe(false);
    expect(isClientVersionAtLeast('1.0.0', '1.2147483648.1')).toBe(false);
  });
});
