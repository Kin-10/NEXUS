import { describe, expect, test } from 'vitest';

import { resolveDevelopmentServerBaseUrl } from './developmentServerBaseUrl';

const defaultBaseUrl = 'https://baiying-server.inner.hzb.com';

describe('developmentServerBaseUrl', () => {
  test('uses a literal loopback or private LAN server with an explicit port in development', () => {
    expect(resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: ' http://127.0.0.1:18878/ ',
      isDev: true,
      isPackaged: false,
    })).toBe('http://127.0.0.1:18878');

    expect(resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: 'https://[::1]:18878',
      isDev: true,
      isPackaged: false,
    })).toBe('https://[::1]:18878');

    expect(resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: 'http://192.168.101.24:8899',
      isDev: true,
      isPackaged: false,
    })).toBe('http://192.168.101.24:8899');
  });

  test('keeps the default server outside an unpackaged development build', () => {
    expect(resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: 'http://127.0.0.1:18878',
      isDev: false,
      isPackaged: false,
    })).toBe(defaultBaseUrl);

    expect(resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: 'http://127.0.0.1:18878',
      isDev: true,
      isPackaged: true,
    })).toBe(defaultBaseUrl);
  });

  test('rejects hostnames, public hosts, non-HTTP URLs and missing ports', () => {
    for (const developmentOverride of [
      'http://localhost:18878',
      'https://server.example:18878',
      'http://8.8.8.8:18878',
      'file:///tmp/server',
    ]) {
      expect(() => resolveDevelopmentServerBaseUrl({
        defaultBaseUrl,
        developmentOverride,
        isDev: true,
        isPackaged: false,
      })).toThrow('literal loopback or private LAN HTTP(S) address');
    }

    expect(() => resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: 'http://127.0.0.1',
      isDev: true,
      isPackaged: false,
    })).toThrow('explicit port');
  });

  test('rejects credentials, paths, queries and fragments', () => {
    for (const developmentOverride of [
      'http://user:secret@127.0.0.1:18878',
      'http://127.0.0.1:18878/prefix',
      'http://127.0.0.1:18878?mode=test',
      'http://127.0.0.1:18878#test',
    ]) {
      expect(() => resolveDevelopmentServerBaseUrl({
        defaultBaseUrl,
        developmentOverride,
        isDev: true,
        isPackaged: false,
      })).toThrow('credential-free origin URL');
    }
  });
});
