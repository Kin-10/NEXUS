import { describe, expect, test } from 'vitest';

import {
  NOTIF_POP,
  NOTIF_R,
  NOTIFY_POP_S,
  sampleNotifyBadge,
  sampleNotifyEyes,
  sampleNotifyRadius,
} from './expertKitsNotifyMath';

describe('expertKitsNotifyMath', () => {
  test('badge starts near zero progress then pops above rest radius', () => {
    expect(sampleNotifyRadius(0)).toBeCloseTo(NOTIF_R, 5);
    const mid = sampleNotifyRadius(NOTIFY_POP_S * 0.3);
    expect(mid).toBeGreaterThan(NOTIF_R);
    expect(mid).toBeLessThanOrEqual(NOTIF_R * NOTIF_POP + 1e-6);
  });

  test('badge settles to rest radius after pop window', () => {
    expect(sampleNotifyRadius(NOTIFY_POP_S)).toBeCloseTo(NOTIF_R, 5);
    expect(sampleNotifyRadius(1.5)).toBeCloseTo(NOTIF_R, 5);
  });

  test('badge sits on the upper-right rim (eyes look the other way)', () => {
    const badge = sampleNotifyBadge(1);
    expect(badge.x).toBeGreaterThan(0);
    expect(badge.y).toBeLessThan(0);
    expect(badge.notchR).toBeGreaterThan(badge.r);
  });

  test('notify eyes render two visible capsules', () => {
    const eyes = sampleNotifyEyes();
    expect(eyes).toHaveLength(2);
    expect(eyes[0]?.d.startsWith('M')).toBe(true);
    expect(eyes[0]?.matrix.startsWith('matrix(')).toBe(true);
  });
});
