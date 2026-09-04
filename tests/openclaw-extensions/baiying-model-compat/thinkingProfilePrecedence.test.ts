import { describe, expect, test } from 'vitest';

import {
  BaiYingThinkingLevel,
  resolveOpenClawThinkingProfile,
} from '../../../openclaw-extensions/baiying-model-compat/thinkingProfileMapping';

describe('baiying model compatibility thinking profile precedence', () => {
  test('prefers a server thinking profile when a Kimi K3 runtime profile also exists', () => {
    expect(resolveOpenClawThinkingProfile({
      options: [
        { level: BaiYingThinkingLevel.Off, openclawLevel: 'off' },
        { level: BaiYingThinkingLevel.High, openclawLevel: 'high' },
        { level: BaiYingThinkingLevel.Max, openclawLevel: 'xhigh' },
      ],
      defaultLevel: BaiYingThinkingLevel.High,
    }, true)).toEqual({
      levels: [
        { id: 'off', label: 'off' },
        { id: 'high', label: 'high' },
        { id: 'xhigh', label: 'max' },
      ],
      defaultLevel: 'high',
      preserveWhenCatalogReasoningFalse: true,
    });
  });

  test('uses the max-only Kimi K3 fallback when no server thinking profile exists', () => {
    expect(resolveOpenClawThinkingProfile(undefined, true)).toEqual({
      levels: [{ id: 'max', label: 'max' }],
      defaultLevel: 'max',
      preserveWhenCatalogReasoningFalse: true,
    });
  });
});
