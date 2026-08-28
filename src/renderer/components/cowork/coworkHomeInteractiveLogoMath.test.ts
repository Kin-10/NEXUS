import { describe, expect, test } from 'vitest';

import { computeEyePupilOffsets, pickBlinkDelayMs } from './coworkHomeInteractiveLogoMath';

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
});
