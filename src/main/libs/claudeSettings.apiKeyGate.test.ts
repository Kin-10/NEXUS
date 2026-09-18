import { beforeEach, describe, expect, test } from 'vitest';

import { ProviderName } from '../../shared/providers/constants';
import { resolveRawApiConfig, setStoreGetter } from './claudeSettings';

describe('resolveRawApiConfig api-key gate', () => {
  beforeEach(() => {
    setStoreGetter(() => null);
  });

  test('does not resolve TianLong as the active model when its API key is empty', () => {
    setStoreGetter(() => ({
      get: (key: string) => {
        if (key !== 'app_config') return undefined;
        return {
          model: {
            defaultModel: 'latest-intranet',
            defaultModelProvider: ProviderName.TianLong,
          },
          providers: {
            [ProviderName.TianLong]: {
              enabled: true,
              apiKey: '',
              baseUrl: 'http://192.168.1.85:3000/v1',
              apiFormat: 'openai',
              models: [{ id: 'latest-intranet', name: '企业内网模型' }],
            },
          },
        };
      },
    }) as never);

    const resolution = resolveRawApiConfig();
    expect(resolution.config).toBeNull();
    expect(resolution.error).toMatch(/requires an API key/i);
  });
});
