import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('electron', () => ({
  app: {
    isPackaged: false,
  },
}));

describe('endpoints', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.BAIYING_SERVER_BASE_URL;
    delete process.env.BAIYING_OVERMIND_BASE_URL;
    delete process.env.BAIYING_PORTAL_BASE_URL;
    delete process.env.LOBSTER_SERVER_BASE_URL;
    delete process.env.LOBSTER_OVERMIND_BASE_URL;
    delete process.env.LOBSTER_PORTAL_BASE_URL;
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('buildOvermindCatalogUrl uses baiying product segment', async () => {
    const { buildOvermindCatalogUrl, OVERMIND_PRODUCT } = await import('./endpoints');
    expect(OVERMIND_PRODUCT).toBe('baiying');
    expect(buildOvermindCatalogUrl('http://127.0.0.1:8899', 'test', 'kit-store')).toBe(
      'http://127.0.0.1:8899/openapi/get/luna/hardware/baiying/test/kit-store',
    );
  });

  test('unpackaged dev defaults server and overmind to local BYServer', async () => {
    const {
      getKitStoreUrl,
      getServerApiBaseUrl,
      getOvermindBaseUrl,
      getPortalBaseUrl,
    } = await import('./endpoints');

    expect(getServerApiBaseUrl()).toBe('http://127.0.0.1:8899');
    expect(getOvermindBaseUrl()).toBe('http://127.0.0.1:8899');
    expect(getPortalBaseUrl()).toBe('http://127.0.0.1:8899/portal#');
    expect(getKitStoreUrl()).toBe(
      'http://127.0.0.1:8899/openapi/get/luna/hardware/baiying/test/kit-store',
    );
  });

  test('prefers BAIYING_* env vars over LOBSTER_* legacy names', async () => {
    process.env.BAIYING_SERVER_BASE_URL = 'http://127.0.0.1:18878';
    process.env.LOBSTER_SERVER_BASE_URL = 'http://127.0.0.1:19999';

    const { getServerApiBaseUrl } = await import('./endpoints');
    expect(getServerApiBaseUrl()).toBe('http://127.0.0.1:18878');
  });
});
