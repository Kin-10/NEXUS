import { BAIYING_REQUEST_OPTIONS_VERSION } from './requestOptionsProtocol';

export const BaiYingThinkingLevel = {
  Off: 'off',
  Minimal: 'minimal',
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  XHigh: 'xhigh',
  Max: 'max',
} as const;

export type BaiYingThinkingLevel =
  typeof BaiYingThinkingLevel[keyof typeof BaiYingThinkingLevel];

export const BaiYingOpenClawThinkingLevel = {
  Off: 'off',
  Minimal: 'minimal',
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  XHigh: 'xhigh',
} as const;

export type BaiYingOpenClawThinkingLevel =
  typeof BaiYingOpenClawThinkingLevel[keyof typeof BaiYingOpenClawThinkingLevel];

export type BaiYingThinkingOption = {
  level: BaiYingThinkingLevel;
  openclawLevel: BaiYingOpenClawThinkingLevel;
};

export type BaiYingThinkingProfile = {
  options: BaiYingThinkingOption[];
  defaultLevel: BaiYingThinkingLevel;
  requestOptionsVersion?: typeof BAIYING_REQUEST_OPTIONS_VERSION;
};

export type BaiYingThinkingProfileMap = Record<string, BaiYingThinkingProfile>;

export type BaiYingOpenClawThinkingProfile = {
  levels: Array<{ id: string; label: string }>;
  defaultLevel: string;
  preserveWhenCatalogReasoningFalse: true;
};

const LEVELS = new Set<string>(Object.values(BaiYingThinkingLevel));
const OPENCLAW_LEVELS = new Set<string>(Object.values(BaiYingOpenClawThinkingLevel));

const isRecord = (value: unknown): value is Record<string, unknown> => (
  !!value && typeof value === 'object' && !Array.isArray(value)
);

const isModelRef = (value: string): boolean => {
  const separatorIndex = value.indexOf('/');
  return separatorIndex > 0
    && separatorIndex < value.length - 1
    && !/\s/.test(value);
};

const parseThinkingProfile = (value: unknown): BaiYingThinkingProfile | undefined => {
  if (!isRecord(value) || !Array.isArray(value.options) || value.options.length === 0) {
    return undefined;
  }
  const options: BaiYingThinkingOption[] = [];
  const seenLevels = new Set<string>();
  const seenOpenClawLevels = new Set<string>();
  for (const rawOption of value.options) {
    if (!isRecord(rawOption)) {
      return undefined;
    }
    const { level, openclawLevel } = rawOption;
    if (
      typeof level !== 'string'
      || !LEVELS.has(level)
      || seenLevels.has(level)
      || typeof openclawLevel !== 'string'
      || !OPENCLAW_LEVELS.has(openclawLevel)
      || seenOpenClawLevels.has(openclawLevel)
      || (level === BaiYingThinkingLevel.Off)
        !== (openclawLevel === BaiYingOpenClawThinkingLevel.Off)
    ) {
      return undefined;
    }
    seenLevels.add(level);
    seenOpenClawLevels.add(openclawLevel);
    options.push({
      level: level as BaiYingThinkingLevel,
      openclawLevel: openclawLevel as BaiYingOpenClawThinkingLevel,
    });
  }
  if (options.length === 1 && options[0]?.level === BaiYingThinkingLevel.Off) {
    return undefined;
  }
  if (typeof value.defaultLevel !== 'string' || !seenLevels.has(value.defaultLevel)) {
    return undefined;
  }
  return {
    options,
    defaultLevel: value.defaultLevel as BaiYingThinkingLevel,
    ...(value.requestOptionsVersion === BAIYING_REQUEST_OPTIONS_VERSION
      ? { requestOptionsVersion: BAIYING_REQUEST_OPTIONS_VERSION }
      : {}),
  };
};

export const parseThinkingProfileMap = (value: unknown): BaiYingThinkingProfileMap => {
  if (!isRecord(value)) return {};
  const result: BaiYingThinkingProfileMap = {};
  for (const [modelRef, rawProfile] of Object.entries(value).sort(([left], [right]) =>
    left.localeCompare(right))) {
    const profile = parseThinkingProfile(rawProfile);
    if (isModelRef(modelRef) && profile) {
      result[modelRef] = profile;
    }
  }
  return result;
};

export const resolveOpenClawThinkingProfile = (
  profile: BaiYingThinkingProfile | undefined,
  hasKimiK3RuntimeProfile: boolean,
): BaiYingOpenClawThinkingProfile | undefined => {
  if (profile) {
    const defaultOpenClawLevel = profile.options.find(
      option => option.level === profile.defaultLevel,
    )?.openclawLevel;
    if (!defaultOpenClawLevel) return undefined;
    return {
      levels: profile.options.map(option => ({
        id: option.openclawLevel,
        label: option.level,
      })),
      defaultLevel: defaultOpenClawLevel,
      preserveWhenCatalogReasoningFalse: true,
    };
  }
  if (!hasKimiK3RuntimeProfile) return undefined;
  return {
    levels: [{ id: 'max', label: 'max' }],
    defaultLevel: 'max',
    preserveWhenCatalogReasoningFalse: true,
  };
};
