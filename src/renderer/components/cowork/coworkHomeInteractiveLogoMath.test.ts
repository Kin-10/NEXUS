import { describe, expect, test } from 'vitest';

import {
  computeEyePupilOffsets,
  computeTourEyeOffsets,
  easeInOutCubic,
  pickBlinkDelayMs,
} from './coworkHomeInteractiveLogoMath';

describe('coworkHomeInteractiveLogoMath', () => {
  test('returns zero pupil offset when the cursor sits on the eye center', () => {
    const result = computeEyePupilOffsets({
      mouseX: 120,
      mouseY: 120,
      containerCenterX: 120,
      containerCenterY: 120,
      leftEyeCenterX: 100,
      leftEyeCenterY: 120,
      rightEyeCenterX: 140,
      rightEyeCenterY: 120,
      maxPupilOffset: 6,
      maxHeadTilt: 8,
    });

    expect(result.left).toEqual({ x: 0, y: 0 });
    expect(result.right).toEqual({ x: 0, y: 0 });
    expect(result.headTilt).toEqual({ x: 0, y: 0 });
  });

  test('moves pupils toward the cursor and tilts the head within bounds', () => {
    const result = computeEyePupilOffsets({
      mouseX: 220,
      mouseY: 80,
      containerCenterX: 120,
      containerCenterY: 120,
      leftEyeCenterX: 100,
      leftEyeCenterY: 120,
      rightEyeCenterX: 140,
      rightEyeCenterY: 120,
      maxPupilOffset: 6,
      maxHeadTilt: 8,
    });

    expect(result.left.x).toBeGreaterThan(0);
    expect(result.right.x).toBeGreaterThan(0);
    expect(result.left.y).toBeLessThan(0);
    expect(result.headTilt.x).toBe(8);
    expect(result.headTilt.y).toBeGreaterThan(0);
  });

  test('schedules blink delays within the expected range', () => {
    expect(pickBlinkDelayMs(() => 0)).toBe(2800);
    expect(pickBlinkDelayMs(() => 1)).toBe(6000);
  });

  test('eases tour progress with ease-in-out cubic endpoints', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBe(0.5);
  });

  test('tour eye offsets start and end at rest with full visibility', () => {
    const start = computeTourEyeOffsets(0);
    const end = computeTourEyeOffsets(1);
    expect(start.left).toEqual({ x: 0, y: 0 });
    expect(start.right).toEqual({ x: 0, y: 0 });
    expect(start.visibility).toBe(1);
    expect(end.left.x).toBeCloseTo(0, 5);
    expect(end.left.y).toBeCloseTo(0, 5);
    expect(end.visibility).toBeCloseTo(1, 5);
  });

  test('tour eye offsets leave the face near the limbs and hide behind', () => {
    const side = computeTourEyeOffsets(0.25, 108);
    expect(Math.abs(side.left.x)).toBeGreaterThan(90);
    const back = computeTourEyeOffsets(0.5, 108);
    expect(back.visibility).toBe(0);
  });
});
