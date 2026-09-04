import type { StreamFn } from 'openclaw/plugin-sdk/agent-core';

import {
  BAIYING_REQUEST_OPTIONS_FIELD,
  BAIYING_REQUEST_OPTIONS_VERSION,
} from './requestOptionsProtocol';
import type {
  BaiYingThinkingLevel,
  BaiYingThinkingProfile,
} from './thinkingProfileMapping';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

const loadDefaultStreamFn = async (): Promise<StreamFn> => {
  const { streamSimple } = await import('openclaw/plugin-sdk/llm');
  return streamSimple as StreamFn;
};

export const resolveBaiYingRequestThinkingLevel = (
  profile: BaiYingThinkingProfile,
  requestedLevel: string | undefined,
): BaiYingThinkingLevel => (
  profile.options.find(option => option.openclawLevel === requestedLevel)?.level
    ?? profile.defaultLevel
);

const applyRequestOptions = (
  payload: unknown,
  thinkingLevel: BaiYingThinkingLevel,
): unknown => {
  if (!isRecord(payload)) return payload;
  payload[BAIYING_REQUEST_OPTIONS_FIELD] = {
    version: BAIYING_REQUEST_OPTIONS_VERSION,
    thinking: {
      level: thinkingLevel,
    },
  };
  return payload;
};

export const createBaiYingRequestOptionsWrapper = (
  baseStreamFn: StreamFn | undefined,
  thinkingLevel: BaiYingThinkingLevel,
): StreamFn => {
  return async (model, context, options) => {
    const underlying = baseStreamFn ?? (await loadDefaultStreamFn());
    const originalOnPayload = options?.onPayload;
    return underlying(model, context, {
      ...options,
      onPayload: (payload, payloadModel) => {
        const result = originalOnPayload?.(payload, payloadModel);
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          return Promise.resolve(result).then(resolved => (
            applyRequestOptions(resolved ?? payload, thinkingLevel)
          ));
        }
        return applyRequestOptions(result ?? payload, thinkingLevel);
      },
    });
  };
};
