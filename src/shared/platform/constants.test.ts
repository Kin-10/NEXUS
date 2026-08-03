import { describe, expect, test } from 'vitest';

import { PlatformRegistry } from './constants';

describe('PlatformRegistry enabled IM channels', () => {
  test('exposes only product IM bots', () => {
    expect([...PlatformRegistry.platforms]).toEqual([
      'weixin',
      'dingtalk',
      'feishu',
      'wecom',
      'qq',
    ]);
  });

  test('keeps retired platforms resolvable but disabled', () => {
    for (const platform of ['telegram', 'discord', 'popo', 'nim', 'netease-bee', 'email'] as const) {
      expect(PlatformRegistry.isEnabled(platform)).toBe(false);
      expect(PlatformRegistry.allPlatforms).toContain(platform);
      expect(PlatformRegistry.isIMChannel(PlatformRegistry.channelOf(platform))).toBe(true);
      expect(PlatformRegistry.isEnabledIMChannel(PlatformRegistry.channelOf(platform))).toBe(false);
    }
  });

  test('channel options omit retired platforms', () => {
    const values = PlatformRegistry.channelOptions().map(option => option.value);
    expect(values).toEqual([
      'openclaw-weixin',
      'dingtalk-connector',
      'feishu',
      'wecom',
      'qqbot',
    ]);
  });
});
