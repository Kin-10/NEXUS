import { afterEach, describe, expect, test, vi } from 'vitest';

describe('getPlatformLogoSrc', () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  test('prefixes Vite BASE_URL in development', async () => {
    vi.stubEnv('BASE_URL', '/');
    const { getPlatformLogoSrc } = await import('./platformLogo');
    expect(getPlatformLogoSrc('weixin')).toBe('/weixin.png');
    expect(getPlatformLogoSrc('dingtalk')).toBe('/dingding.png');
  });

  test('prefixes relative BASE_URL for packaged Electron', async () => {
    vi.stubEnv('BASE_URL', './');
    const { getPlatformLogoSrc } = await import('./platformLogo');
    expect(getPlatformLogoSrc('feishu')).toBe('./feishu.png');
    expect(getPlatformLogoSrc('qq')).toBe('./qq_bot.jpeg');
  });
});
