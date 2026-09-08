import type { StreamFn } from 'openclaw/plugin-sdk/agent-core';
import { describe, expect, test } from 'vitest';

import {
  createBaiYingRequestOptionsWrapper,
  resolveBaiYingRequestThinkingLevel,
} from '../../../openclaw-extensions/baiying-model-compat/requestOptions';
import {
  BAIYING_REQUEST_OPTIONS_FIELD,
  BAIYING_REQUEST_OPTIONS_VERSION,
} from '../../../openclaw-extensions/baiying-model-compat/requestOptionsProtocol';
import type { BaiYingThinkingProfile } from '../../../openclaw-extensions/baiying-model-compat/thinkingProfileMapping';

const profile: BaiYingThinkingProfile = {
  options: [
    { level: 'off', openclawLevel: 'off' },
    { level: 'high', openclawLevel: 'high' },
    { level: 'max', openclawLevel: 'xhigh' },
  ],
  defaultLevel: 'high',
  requestOptionsVersion: 1,
};

describe('BaiYing request options', () => {
  test('uses an allowed selected level and falls back to the profile default', () => {
    expect(resolveBaiYingRequestThinkingLevel(profile, 'off')).toBe('off');
    expect(resolveBaiYingRequestThinkingLevel(profile, 'xhigh')).toBe('max');
    expect(resolveBaiYingRequestThinkingLevel(profile, 'low')).toBe('high');
    expect(resolveBaiYingRequestThinkingLevel(profile, undefined)).toBe('high');
  });

  test('adds the final semantic thinking intent after the caller payload hook', async () => {
    let forwardedOptions: Parameters<StreamFn>[2] | undefined;
    const baseStreamFn: StreamFn = ((_model, _context, options) => {
      forwardedOptions = options;
      return {} as ReturnType<StreamFn>;
    }) as StreamFn;
    const wrapped = createBaiYingRequestOptionsWrapper(baseStreamFn, 'off');

    await wrapped({} as never, {} as never, {
      onPayload: () => ({
        model: 'deepseek-v4-flash-hzbInner',
        [BAIYING_REQUEST_OPTIONS_FIELD]: {
          version: 999,
          thinking: { level: 'max' },
        },
      }),
    });

    const payload = await forwardedOptions?.onPayload?.({}, {} as never);
    expect(payload).toEqual({
      model: 'deepseek-v4-flash-hzbInner',
      [BAIYING_REQUEST_OPTIONS_FIELD]: {
        version: BAIYING_REQUEST_OPTIONS_VERSION,
        thinking: { level: 'off' },
      },
    });
  });
});
