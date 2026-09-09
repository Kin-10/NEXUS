import type { NetworkInterfaceInfo } from 'os';
import { describe, expect, test } from 'vitest';

import { collectAnalyticsDeviceInfo } from './analyticsDeviceInfo';

const iface = (
  partial: Partial<NetworkInterfaceInfo> & Pick<NetworkInterfaceInfo, 'address' | 'mac'>,
): NetworkInterfaceInfo => ({
  address: partial.address,
  netmask: partial.netmask ?? '255.255.255.0',
  family: partial.family ?? 'IPv4',
  mac: partial.mac,
  internal: partial.internal ?? false,
  cidr: partial.cidr ?? null,
});

describe('collectAnalyticsDeviceInfo', () => {
  test('prefers non-internal IPv4 address and matching MAC', () => {
    const info = collectAnalyticsDeviceInfo({
      username: 'alice',
      networkInterfaces: {
        lo: [iface({ address: '127.0.0.1', mac: '00:00:00:00:00:00', internal: true })],
        eth0: [iface({ address: '192.168.1.20', mac: 'AA-BB-CC-DD-EE-FF', internal: false })],
      },
    });

    expect(info).toEqual({
      osUsername: 'alice',
      macAddress: 'aa:bb:cc:dd:ee:ff',
      localIp: '192.168.1.20',
    });
  });

  test('falls back to any non-internal MAC when IPv4 NIC has empty MAC', () => {
    const info = collectAnalyticsDeviceInfo({
      username: 'bob',
      networkInterfaces: {
        eth0: [iface({ address: '10.0.0.2', mac: '00:00:00:00:00:00', internal: false })],
        wlan0: [iface({
          address: 'fe80::1',
          family: 'IPv6',
          mac: '11:22:33:44:55:66',
          internal: false,
        })],
      },
    });

    expect(info.osUsername).toBe('bob');
    expect(info.localIp).toBe('10.0.0.2');
    expect(info.macAddress).toBe('11:22:33:44:55:66');
  });
});
