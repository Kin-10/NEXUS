import { describe, expect, test } from 'vitest';

import { collectReferencedEnvVarNames, pickReferencedSecretEnvVars } from './openclawSecretEnv';

describe('collectReferencedEnvVarNames', () => {
  test('extracts OpenClaw env placeholders from serialized config', () => {
    const refs = collectReferencedEnvVarNames({
      models: {
        providers: {
          openai: { apiKey: '${BAIYING_APIKEY_OPENAI}' },
          server: { apiKey: '${BAIYING_PROXY_TOKEN}' },
        },
      },
      ignored: '${not-uppercase}',
    });

    expect([...refs].sort()).toEqual([
      'BAIYING_APIKEY_OPENAI',
      'BAIYING_PROXY_TOKEN',
    ]);
  });
});

describe('pickReferencedSecretEnvVars', () => {
  test('ignores dynamic secrets that are not referenced by openclaw config', () => {
    const referenced = new Set(['BAIYING_PROXY_TOKEN']);

    const before = pickReferencedSecretEnvVars({
      BAIYING_APIKEY_SERVER: 'old-access-token',
      BAIYING_PROXY_TOKEN: 'stable-proxy-token',
    }, referenced);
    const after = pickReferencedSecretEnvVars({
      BAIYING_APIKEY_SERVER: 'new-access-token',
      BAIYING_PROXY_TOKEN: 'stable-proxy-token',
    }, referenced);

    expect(before).toEqual({ BAIYING_PROXY_TOKEN: 'stable-proxy-token' });
    expect(JSON.stringify(before)).toBe(JSON.stringify(after));
  });

  test('keeps referenced secret changes visible for restart decisions', () => {
    const referenced = new Set(['BAIYING_APIKEY_OPENAI']);

    const before = pickReferencedSecretEnvVars({
      BAIYING_APIKEY_OPENAI: 'sk-old',
      BAIYING_APIKEY_SERVER: 'old-access-token',
    }, referenced);
    const after = pickReferencedSecretEnvVars({
      BAIYING_APIKEY_OPENAI: 'sk-new',
      BAIYING_APIKEY_SERVER: 'new-access-token',
    }, referenced);

    expect(JSON.stringify(before)).not.toBe(JSON.stringify(after));
  });
});
