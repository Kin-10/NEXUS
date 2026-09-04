export const BaiYingRequestCapability = {
  OptionsV1: 'baiying-options-v1',
} as const;

export type BaiYingRequestCapability =
  typeof BaiYingRequestCapability[keyof typeof BaiYingRequestCapability];

export const BAIYING_REQUEST_OPTIONS_FIELD = 'baiying_options';
export const BAIYING_REQUEST_OPTIONS_VERSION = 1;

const BAIYING_REQUEST_CAPABILITY_VALUES = new Set<string>(
  Object.values(BaiYingRequestCapability),
);

export const parseBaiYingRequestCapabilities = (
  value: unknown,
): BaiYingRequestCapability[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  const result: BaiYingRequestCapability[] = [];
  const seen = new Set<BaiYingRequestCapability>();
  for (const candidate of value) {
    if (
      typeof candidate !== 'string'
      || !BAIYING_REQUEST_CAPABILITY_VALUES.has(candidate)
    ) {
      continue;
    }
    const capability = candidate as BaiYingRequestCapability;
    if (!seen.has(capability)) {
      seen.add(capability);
      result.push(capability);
    }
  }
  return result.length > 0 ? result : undefined;
};

export const supportsBaiYingRequestOptionsV1 = (
  capabilities: readonly BaiYingRequestCapability[] | undefined,
): boolean => capabilities?.includes(BaiYingRequestCapability.OptionsV1) === true;
