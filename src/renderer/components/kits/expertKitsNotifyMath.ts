/**
 * Bloub `notify` pose math — badge pop + spherical eye placement.
 * Ported from bloub `src/bot/{face,decor,shape,states,math}.ts`.
 */

export const NOTIF_BLUE = '#2496e8';
export const NOTIF_ANGLE_DEG = -42;
export const NOTIF_DIST = 1.003;
export const NOTIF_R = 0.15;
export const NOTIF_POP = 1.14;
export const NOTIF_MARGIN = 0.054;

/** Notify cycle length (seconds) — bloub state duration. */
export const NOTIFY_DURATION_S = 2.2;
/** Badge pop settles by this time (seconds). */
export const NOTIFY_POP_S = 0.45;

export const NOTIFY_GAZE = { yaw: -21.94, pitch: -5.82, roll: -12.2 } as const;
export const NOTIFY_SPLIT = 18.89;
export const NOTIFY_EYE_W = 0.505;
export const NOTIFY_EYE_H = 0.498;

/** Ball radius in viewBox units — bloub `RAYON`. */
export const NOTIFY_BALL_R = 100;
/** Half viewBox — room for the badge on the rim. */
export const NOTIFY_VIEWBOX_HALF = 158;

type Vec3 = [number, number, number];

export type EyePose = {
  x: number;
  y: number;
  a: number;
  b: number;
  c: number;
  d: number;
  depth: number;
};

export type RenderedEye = {
  d: string;
  matrix: string;
  alpha: number;
};

export type NotifyBadge = {
  x: number;
  y: number;
  r: number;
  notchR: number;
};

const deg = (d: number): number => (d * Math.PI) / 180;

export const r2 = (v: number): number => Math.round(v * 100) / 100;

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

function spin(u: Vec3, v: Vec3, angle: number): [Vec3, Vec3] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [
    [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s],
    [v[0] * c - u[0] * s, v[1] * c - u[1] * s, v[2] * c - u[2] * s],
  ];
}

/** Eyes on a unit sphere, projected orthographically — bloub `eyePoses`. */
export function eyePoses(
  gaze: { yaw: number; pitch: number; roll: number },
  scale: number,
  split: number,
): [EyePose, EyePose] {
  let f: Vec3 = [0, 0, 1];
  let right: Vec3 = [1, 0, 0];
  let down: Vec3 = [0, 1, 0];

  const yawed = spin(f, right, deg(gaze.yaw));
  f = yawed[0];
  right = yawed[1];
  const pitched = spin(down, f, deg(gaze.pitch));
  down = pitched[0];
  f = pitched[1];
  const rolled = spin(right, down, deg(gaze.roll));
  right = rolled[0];
  down = rolled[1];

  const build = (side: number): EyePose => {
    const [ef, er] = spin(f, right, deg(split * side));
    return {
      x: ef[0] * scale,
      y: ef[1] * scale,
      a: er[0],
      b: er[1],
      c: down[0],
      d: down[1],
      depth: ef[2],
    };
  };

  return [build(-1), build(1)];
}

/** Capsule centered at origin — bloub eye silhouette. */
export function capsulePath(w: number, h: number): string {
  const hw = Math.max(w, 0.01) / 2;
  const hh = Math.max(h, 0.01) / 2;
  const radius = Math.min(hw, hh);
  return (
    `M${r2(-hw)} ${r2(-hh + radius)}`
    + `A${r2(radius)} ${r2(radius)} 0 0 1 ${r2(-hw + radius)} ${r2(-hh)}`
    + `L${r2(hw - radius)} ${r2(-hh)}`
    + `A${r2(radius)} ${r2(radius)} 0 0 1 ${r2(hw)} ${r2(-hh + radius)}`
    + `L${r2(hw)} ${r2(hh - radius)}`
    + `A${r2(radius)} ${r2(radius)} 0 0 1 ${r2(hw - radius)} ${r2(hh)}`
    + `L${r2(-hw + radius)} ${r2(hh)}`
    + `A${r2(radius)} ${r2(radius)} 0 0 1 ${r2(-hw)} ${r2(hh - radius)}Z`
  );
}

/**
 * Notification badge radius in ball-radius units.
 * Pop peaks ~+14% near 0.3s then settles — bloub `notify` pose.
 */
export function sampleNotifyRadius(tSeconds: number): number {
  const t = ((tSeconds % NOTIFY_DURATION_S) + NOTIFY_DURATION_S) % NOTIFY_DURATION_S;
  const p = clamp01(t / NOTIFY_POP_S);
  const pop = 1 + (NOTIF_POP - 1) * Math.sin(p * Math.PI) * (1 - p * 0.35);
  return NOTIF_R * (p < 1 ? pop : 1);
}

export function sampleNotifyBadge(tSeconds: number, ballR = NOTIFY_BALL_R): NotifyBadge {
  const a = deg(NOTIF_ANGLE_DEG);
  const unitR = sampleNotifyRadius(tSeconds);
  return {
    x: Math.cos(a) * NOTIF_DIST * ballR,
    y: Math.sin(a) * NOTIF_DIST * ballR,
    r: unitR * ballR,
    notchR: (unitR + NOTIF_MARGIN) * ballR,
  };
}

export function sampleNotifyEyes(ballR = NOTIFY_BALL_R, blinkScaleY = 1): RenderedEye[] {
  const poses = eyePoses(NOTIFY_GAZE, ballR, NOTIFY_SPLIT);
  const d = capsulePath(NOTIFY_EYE_W * ballR, NOTIFY_EYE_H * ballR);
  const k = blinkScaleY;
  const out: RenderedEye[] = [];
  for (let i = 0; i < 2; i++) {
    const e = poses[i];
    if (!e || e.depth <= 0.02) continue;
    out.push({
      d,
      matrix: `matrix(${r2(e.a)},${r2(e.b * k)},${r2(e.c)},${r2(e.d * k)},${r2(e.x)},${r2(e.y)})`,
      alpha: clamp01(e.depth / 0.12),
    });
  }
  return out;
}
