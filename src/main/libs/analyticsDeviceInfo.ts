import os from 'os';

export type AnalyticsDeviceInfo = {
  osUsername: string;
  macAddress: string;
  localIp: string;
};

const EMPTY_MAC = '00:00:00:00:00:00';

const normalizeMac = (value: string): string => value.trim().toLowerCase().replace(/-/g, ':');

const isUsableMac = (value: string): boolean => {
  const normalized = normalizeMac(value);
  return Boolean(normalized) && normalized !== EMPTY_MAC;
};

/**
 * Resolve OS username / primary MAC / LAN IPv4 for analytics commons.
 * Prefers the first non-internal IPv4 NIC that also exposes a usable MAC.
 */
export const collectAnalyticsDeviceInfo = (options?: {
  networkInterfaces?: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
  username?: string;
}): AnalyticsDeviceInfo => {
  let osUsername = '';
  try {
    osUsername = (options?.username ?? os.userInfo().username ?? '').trim();
  } catch {
    osUsername = (
      process.env.USERNAME
      || process.env.USER
      || process.env.LOGNAME
      || ''
    ).trim();
  }

  const nets = options?.networkInterfaces ?? os.networkInterfaces();
  let localIp = '';
  let macAddress = '';

  for (const entries of Object.values(nets)) {
    if (!entries) continue;
    for (const net of entries) {
      const family = String(net.family);
      if (net.internal || (family !== 'IPv4' && family !== '4')) continue;
      if (!localIp && net.address?.trim()) {
        localIp = net.address.trim();
      }
      if (!macAddress && isUsableMac(net.mac)) {
        macAddress = normalizeMac(net.mac);
      }
      if (localIp && macAddress) {
        return { osUsername, macAddress, localIp };
      }
    }
  }

  if (!macAddress) {
    for (const entries of Object.values(nets)) {
      if (!entries) continue;
      for (const net of entries) {
        if (net.internal) continue;
        if (isUsableMac(net.mac)) {
          macAddress = normalizeMac(net.mac);
          break;
        }
      }
      if (macAddress) break;
    }
  }

  return { osUsername, macAddress, localIp };
};
