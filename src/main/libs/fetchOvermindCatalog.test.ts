import { afterEach, describe, expect, test, vi } from 'vitest';

const fetchTextUrl = vi.fn();
const getOvermindBaseUrl = vi.fn(() => 'https://api-overmind.hzb.com');
const isTestModeEnabled = vi.fn(() => false);

vi.mock('./fetchTextUrl', () => ({
  fetchTextUrl: (...args: unknown[]) => fetchTextUrl(...args),
}));

vi.mock('./endpoints', () => ({
  LOCAL_BAIYING_BASE_URL: 'http://192.168.101.24:8899',
  buildOvermindCatalogUrl: (baseUrl: string, env: string, key: string) => (
    `${baseUrl}/openapi/get/luna/hardware/baiying/${env}/${key}`
  ),
  getOvermindBaseUrl: () => getOvermindBaseUrl(),
  isTestModeEnabled: () => isTestModeEnabled(),
}));

describe('fetchOvermindCatalogText', () => {
  afterEach(() => {
    vi.clearAllMocks();
    getOvermindBaseUrl.mockReturnValue('https://api-overmind.hzb.com');
    isTestModeEnabled.mockReturnValue(false);
  });

  test('returns primary catalog when reachable', async () => {
    fetchTextUrl.mockResolvedValueOnce('{"code":0}');
    const { fetchOvermindCatalogText } = await import('./fetchOvermindCatalog');
    const result = await fetchOvermindCatalogText('skill-store');
    expect(result.usedFallback).toBe(false);
    expect(result.url).toContain('api-overmind.hzb.com');
    expect(result.url).toContain('/prod/skill-store');
    expect(fetchTextUrl).toHaveBeenCalledTimes(1);
  });

  test('falls back to local BYServer on DNS failure', async () => {
    fetchTextUrl
      .mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND api-overmind.hzb.com'))
      .mockResolvedValueOnce('{"code":0,"data":{"value":{"marketplace":[]}}}');

    const { fetchOvermindCatalogText } = await import('./fetchOvermindCatalog');
    const result = await fetchOvermindCatalogText('skill-store');
    expect(result.usedFallback).toBe(true);
    expect(result.url).toBe(
      'http://192.168.101.24:8899/openapi/get/luna/hardware/baiying/prod/skill-store',
    );
    expect(fetchTextUrl).toHaveBeenCalledTimes(2);
  });
});
