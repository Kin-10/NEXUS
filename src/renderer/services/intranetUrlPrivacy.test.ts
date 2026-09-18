import { describe, expect, test } from 'vitest';

import {
  getPrivateIntranetAddressDisplay,
  isPrivateIntranetHostname,
  isPrivateIntranetUrl,
  looksLikePrivateIntranetReference,
  redactPrivateIntranetUrlsInText,
} from './intranetUrlPrivacy';

describe('intranetUrlPrivacy', () => {
  test('detects RFC1918 hostnames and urls', () => {
    expect(isPrivateIntranetHostname('10.0.0.1')).toBe(true);
    expect(isPrivateIntranetHostname('172.16.5.9')).toBe(true);
    expect(isPrivateIntranetHostname('192.168.1.85')).toBe(true);
    expect(isPrivateIntranetHostname('localhost')).toBe(false);
    expect(isPrivateIntranetHostname('8.8.8.8')).toBe(false);
    expect(isPrivateIntranetUrl('http://192.168.1.85:3000/v1')).toBe(true);
    expect(isPrivateIntranetUrl('http://localhost:3000')).toBe(false);
  });

  test('redacts private intranet urls in plaintext and markdown', () => {
    expect(
      redactPrivateIntranetUrlsInText(
        '打开 http://192.168.1.85:3000/v1 查看',
        '内网服务',
      ),
    ).toBe('打开 内网服务 查看');
    expect(
      redactPrivateIntranetUrlsInText(
        '见 [门户](http://10.0.0.8:8080) 与 http://172.16.1.2/',
        '内网服务',
      ),
    ).toBe('见 门户 与 内网服务');
  });

  test('builds address display and reference helpers', () => {
    expect(getPrivateIntranetAddressDisplay('http://192.168.1.85:3000', '内网服务'))
      .toBe('内网服务');
    expect(getPrivateIntranetAddressDisplay('http://localhost:3000', '内网服务'))
      .toBeNull();
    expect(looksLikePrivateIntranetReference('192.168.1.85:3000')).toBe(true);
    expect(looksLikePrivateIntranetReference('login-react.html')).toBe(false);
  });
});
