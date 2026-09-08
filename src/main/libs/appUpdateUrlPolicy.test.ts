import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
  },
}));

import { APP_UPDATE_URL_UNTRUSTED_ERROR } from '../../shared/appUpdate/constants';
import {
  assertTrustedWindowsInstallerUrl,
  isSecureWindowsInstallerOrigin,
  validateWindowsInstallerUrl,
  WindowsInstallerUrlPolicyFailure,
} from './appUpdateUrlPolicy';

describe('Windows installer URL policy', () => {
  afterEach(() => {
    delete process.env.BAIYING_ALLOW_LOCAL_UPDATE_HTTP;
    process.env.NODE_ENV = 'development';
  });

  test.each([
    'https://downloads.example.com/releases/BaiYing.EXE?channel=prod',
    'https://replacement-cdn.example.net/releases/BaiYing.exe',
  ])('accepts a transport-safe HTTPS exe URL without pinning its origin: %s', url => {
    expect(validateWindowsInstallerUrl(url)).toMatchObject({ trusted: true });
  });

  test('accepts loopback HTTP exe URLs in unpackaged development', () => {
    process.env.NODE_ENV = 'development';
    const url = 'http://127.0.0.1:59004/updates/test/BaiYing-Setup.exe';
    expect(validateWindowsInstallerUrl(url)).toMatchObject({ trusted: true });
    expect(isSecureWindowsInstallerOrigin('http://127.0.0.1:59004')).toBe(true);
  });

  test.each([
    ['http://downloads.example.com/setup.exe', WindowsInstallerUrlPolicyFailure.InsecureProtocol],
    [
      'https://user:secret@downloads.example.com/setup.exe',
      WindowsInstallerUrlPolicyFailure.CredentialsPresent,
    ],
    [
      'https://downloads.example.com/setup.exe#open',
      WindowsInstallerUrlPolicyFailure.FragmentPresent,
    ],
    [
      'https://downloads.example.com:8443/setup.exe',
      WindowsInstallerUrlPolicyFailure.UnapprovedPort,
    ],
    [
      'https://downloads.example.com/setup.dmg',
      WindowsInstallerUrlPolicyFailure.InvalidExtension,
    ],
  ])('rejects %s', (url, reason) => {
    expect(validateWindowsInstallerUrl(url)).toEqual({
      trusted: false,
      reason,
    });
  });

  test('validates dynamic receipt origins without treating them as an allowlist', () => {
    expect(isSecureWindowsInstallerOrigin('https://downloads.example.com')).toBe(true);
    expect(isSecureWindowsInstallerOrigin('https://replacement-cdn.example.net')).toBe(true);
    expect(isSecureWindowsInstallerOrigin('http://downloads.example.com')).toBe(false);
    expect(isSecureWindowsInstallerOrigin('https://downloads.example.com:8443')).toBe(false);
  });

  test('throws the stable cross-process error marker', () => {
    expect(() =>
      assertTrustedWindowsInstallerUrl('http://downloads.example.com/setup.exe'),
    ).toThrow(APP_UPDATE_URL_UNTRUSTED_ERROR);
  });
});
