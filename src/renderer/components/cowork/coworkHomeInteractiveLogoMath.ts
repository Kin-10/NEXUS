export type Point2D = {
  x: number;
  y: number;
};

export type EyePupilOffsetInput = {
  mouseX: number;
  mouseY: number;
  containerCenterX: number;
  containerCenterY: number;
  leftEyeCenterX: number;
  leftEyeCenterY: number;
  rightEyeCenterX: number;
  rightEyeCenterY: number;
  maxPupilOffset: number;
  maxHeadTilt: number;
};

export type EyePupilOffsetResult = {
  left: Point2D;
  right: Point2D;
  headTilt: Point2D;
};

/** Pixel distance that maps to full pupil / head tilt travel. */
const TRACK_RANGE_PX = 72;

const clampMagnitude = (value: number, max: number): number =>
  Math.max(-max, Math.min(max, value));

/**
 * Map pointer position to shared pupil offsets and a light head tilt.
 * Neutral (looking forward) when the cursor sits on the logo center.
 */
export function computeEyePupilOffsets(
  input: EyePupilOffsetInput,
): EyePupilOffsetResult {
  const dx = input.mouseX - input.containerCenterX;
  const dy = input.mouseY - input.containerCenterY;
  const dist = Math.hypot(dx, dy);

  if (dist < 0.001) {
    return {
      left: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      headTilt: { x: 0, y: 0 },
    };
  }

  const pupil = {
    x: clampMagnitude((dx / TRACK_RANGE_PX) * input.maxPupilOffset, input.maxPupilOffset),
    y: clampMagnitude((dy / TRACK_RANGE_PX) * input.maxPupilOffset, input.maxPupilOffset),
  };

  // Subtle convergence: each eye leans a little toward the cursor.
  const leftConvergence = clampMagnitude(
    (input.mouseX - input.leftEyeCenterX) / TRACK_RANGE_PX,
    0.35,
  );
  const rightConvergence = clampMagnitude(
    (input.mouseX - input.rightEyeCenterX) / TRACK_RANGE_PX,
    0.35,
  );

  return {
    left: {
      x: clampMagnitude(pupil.x + leftConvergence, input.maxPupilOffset),
      y: pupil.y,
    },
    right: {
      x: clampMagnitude(pupil.x + rightConvergence, input.maxPupilOffset),
      y: pupil.y,
    },
    headTilt: {
      x: clampMagnitude((dx / TRACK_RANGE_PX) * input.maxHeadTilt, input.maxHeadTilt),
      // Screen Y grows downward; positive tilt = looking up toward the cursor.
      y: clampMagnitude((-dy / TRACK_RANGE_PX) * input.maxHeadTilt, input.maxHeadTilt),
    },
  };
}

const BLINK_DELAY_MIN_MS = 2800;
const BLINK_DELAY_SPAN_MS = 3200;

/** Next blink wait in [2800, 6000] ms. */
export function pickBlinkDelayMs(random: () => number = Math.random): number {
  return BLINK_DELAY_MIN_MS + random() * BLINK_DELAY_SPAN_MS;
}

/** Ease-in-out cubic — same family as bloub’s tour (object spinning, not settling). */
export function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
}

export type TourEyeOffsetResult = {
  left: Point2D;
  right: Point2D;
  /** 1 = fully visible (front), 0 = hidden behind the silhouette. */
  visibility: number;
};

/**
 * Map a full “eyes orbit the sphere” tour to 2D mask-logo offsets.
 * `progress` 0 → 1 is one revolution; eyes leave the face at the limbs and
 * vanish on the back half, then reappear — the flat stand-in for bloub spin.
 */
export function computeTourEyeOffsets(
  progress: number,
  orbitRadius = 108,
): TourEyeOffsetResult {
  const p = ((progress % 1) + 1) % 1;
  const angle = p * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  // Front at progress 0: offset (0,0). Horizontal spin; slight vertical lift.
  const offset: Point2D = {
    x: sin * orbitRadius,
    y: (1 - cos) * orbitRadius * 0.12,
  };
  // Visible on the front hemisphere; soft falloff near the limbs.
  const visibility = Math.max(0, Math.min(1, (cos + 0.15) / 1.15));

  return {
    left: offset,
    right: offset,
    visibility,
  };
}
