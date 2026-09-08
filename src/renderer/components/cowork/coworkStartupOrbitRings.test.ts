import { describe, expect, test } from 'vitest';

import {
  arcRender,
  COMET_DOT,
  COMET_RIBBONS,
  createRng,
  HOME_COMET_DURATION_SECONDS,
  HOME_PLAY_DURATION_SECONDS,
  homeCometBodyScale,
  r2,
  RINGS,
  sampleHomeCometRings,
  sampleHomePlayRings,
  sampleOrbitRings,
  SWOOSH,
  wheel,
} from './coworkStartupOrbitRings';

describe('coworkStartupOrbitRings', () => {
  test('rng is deterministic for a fixed seed', () => {
    const a = createRng(0xa11ce);
    const b = createRng(0xa11ce);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test('wheel returns a hex color', () => {
    expect(wheel(0)).toMatch(/^#[0-9a-f]{6}$/);
    expect(wheel(120)).toMatch(/^#[0-9a-f]{6}$/);
  });

  test('r2 rounds to two decimals', () => {
    expect(r2(1.234)).toBe(1.23);
    expect(r2(1.235)).toBe(1.24);
  });

  test('defines six orbit ribbons', () => {
    expect(RINGS).toHaveLength(6);
    for (const ring of RINGS) {
      expect(ring.a).toBeGreaterThanOrEqual(1.3);
      expect(ring.a).toBeLessThanOrEqual(1.4);
      expect(ring.k).toBeLessThanOrEqual(0.45);
    }
  });

  test('arcRender splits front and back path segments', () => {
    const arc = arcRender(RINGS[0]!, 0.4, 100, 'rg0', 1);
    expect(arc.front.length + arc.back.length).toBeGreaterThan(0);
    expect(arc.grad.stops).toHaveLength(3);
    expect(arc.width).toBeGreaterThan(0);
  });

  test('sampleOrbitRings staggers opacity on entry', () => {
    const early = sampleOrbitRings(0.05, 100);
    expect(early[0]!.opacity).toBeGreaterThan(0);
    expect(early[5]!.opacity).toBe(0);

    const later = sampleOrbitRings(1.2, 100);
    expect(later.every((a) => a.opacity === 1)).toBe(true);
  });

  test('logo color mode uses brand red/blue palette stops', () => {
    const arcs = sampleOrbitRings(1.2, 100, 1, 'logo');
    expect(arcs[0]!.grad.stops[0]).toBe('#ff1524');
    expect(arcs[1]!.grad.stops[0]).toBe('#0f5da7');
    expect(arcs.every((a) => a.grad.stops.every((c) => c.startsWith('#')))).toBe(true);
  });

  test('defines four play swoosh ribbons', () => {
    expect(SWOOSH).toHaveLength(4);
    for (const ribbon of SWOOSH) {
      expect(ribbon.a).toBeGreaterThanOrEqual(0.78);
      expect(ribbon.a).toBeLessThanOrEqual(1.4);
      expect(ribbon.sweep).toBeCloseTo(0.4);
      expect(ribbon.speed).toBeCloseTo(0.3);
    }
  });

  test('sampleHomePlayRings sweeps then ends (~0.7s)', () => {
    expect(HOME_PLAY_DURATION_SECONDS).toBe(0.7);
    const early = sampleHomePlayRings(0.04, 100);
    expect(early).not.toBeNull();
    expect(early).toHaveLength(4);
    expect(early![0]!.opacity).toBeGreaterThan(0);
    expect(early![0]!.grad.stops[0]).toBe('#ff1524');

    const mid = sampleHomePlayRings(0.28, 100);
    expect(mid!.every((a) => a.opacity > 0.9)).toBe(true);
    // Sweep moves the bouquet leftward (cx decreases over time).
    const midCxHint = mid![0]!.grad.x1 + mid![0]!.grad.x2;
    const late = sampleHomePlayRings(0.52, 100)!;
    const lateCxHint = late[0]!.grad.x1 + late[0]!.grad.x2;
    expect(lateCxHint).toBeLessThan(midCxHint);

    expect(sampleHomePlayRings(0.7, 100)).toBeNull();
  });

  test('defines four comet trail ribbons', () => {
    expect(COMET_RIBBONS).toHaveLength(4);
    for (const ribbon of COMET_RIBBONS) {
      expect(ribbon.a).toBeGreaterThan(0.7);
      expect(ribbon.a).toBeLessThan(1);
      expect(ribbon.sweep).toBeCloseTo(0.34);
      expect(ribbon.speed).toBeCloseTo(210 / 360);
    }
  });

  test('sampleHomeCometRings matches compressed bloub fade (~0.6s)', () => {
    expect(HOME_COMET_DURATION_SECONDS).toBe(0.6);
    expect(sampleHomeCometRings(0.01, 100)!.every((a) => a.opacity === 0)).toBe(true);

    const mid = sampleHomeCometRings(0.25, 100);
    expect(mid).not.toBeNull();
    expect(mid).toHaveLength(4);
    expect(mid!.every((a) => a.opacity > 0.9)).toBe(true);
    expect(mid![0]!.grad.stops[0]).toBe('#ff1524');
    expect(mid![1]!.grad.stops[0]).toBe('#0f5da7');

    const fading = sampleHomeCometRings(0.46, 100);
    expect(fading!.every((a) => a.opacity < 1)).toBe(true);
    expect(fading!.every((a) => a.opacity > 0)).toBe(true);

    expect(sampleHomeCometRings(0.6, 100)).toBeNull();
  });

  test('homeCometBodyScale collapses then regrows like bloub comet', () => {
    expect(homeCometBodyScale(0)).toBe(1);
    expect(homeCometBodyScale(0.55 * (0.6 / 2.4))).toBeCloseTo(COMET_DOT, 2);
    expect(homeCometBodyScale(0.3)).toBeCloseTo(COMET_DOT, 2);
    expect(homeCometBodyScale(0.6)).toBe(1);
    expect(homeCometBodyScale(0.53)).toBeGreaterThan(COMET_DOT);
  });
});
