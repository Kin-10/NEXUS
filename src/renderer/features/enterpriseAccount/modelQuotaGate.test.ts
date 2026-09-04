import { ProviderName } from '@shared/providers/constants';
import { describe, expect, test } from 'vitest';

import { EnterpriseQuotaReason } from '../../../shared/enterpriseAccount/constants';
import {
  resolveBlockingEnterpriseQuotaReason,
  usesBaiYingServerQuota,
} from './modelQuotaGate';

const quotaReason = EnterpriseQuotaReason.MemberMonthlyQuotaExhausted;

describe('usesBaiYingServerQuota', () => {
  test('identifies server models by flag or provider key', () => {
    expect(usesBaiYingServerQuota({
      providerKey: ProviderName.OpenAI,
      isServerModel: true,
    })).toBe(true);
    expect(usesBaiYingServerQuota({
      providerKey: ProviderName.BaiyingServer,
    })).toBe(true);
  });

  test('identifies a user-configured model as independent from server quota', () => {
    expect(usesBaiYingServerQuota({
      providerKey: ProviderName.Qwen,
      isServerModel: false,
    })).toBe(false);
  });
});

describe('resolveBlockingEnterpriseQuotaReason', () => {
  test('keeps the quota gate for BaiYing server models', () => {
    expect(resolveBlockingEnterpriseQuotaReason(quotaReason, {
      providerKey: ProviderName.BaiyingServer,
      isServerModel: true,
    })).toBe(quotaReason);
  });

  test('bypasses the quota gate for user-configured models', () => {
    expect(resolveBlockingEnterpriseQuotaReason(quotaReason, {
      providerKey: ProviderName.Qwen,
      isServerModel: false,
    })).toBeNull();
  });

  test('fails closed while model resolution is unavailable', () => {
    expect(resolveBlockingEnterpriseQuotaReason(quotaReason, null)).toBe(quotaReason);
  });

  test('does not gate any model when enterprise quota is available', () => {
    expect(resolveBlockingEnterpriseQuotaReason(null, {
      providerKey: ProviderName.BaiyingServer,
      isServerModel: true,
    })).toBeNull();
  });
});
