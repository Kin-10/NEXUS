/**
 * Bloub-style colorful orbit ribbons around the startup mascot.
 * Ported from bloub `src/bot/decor.ts` (RINGS + arcRender) — elliptical arcs
 * with front/back depth so ribbons wrap behind the body.
 */

export const TAU = Math.PI * 2;

/** Round to 2 decimals — keeps path strings short at 60fps. */
export const r2 = (v: number): number => Math.round(v * 100) / 100;

/** Deterministic PRNG (mulberry32) so ring seeds match across splash / React. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Full hue wheel at mid saturation/lightness — same feel as bloub video. */
export function wheel(hue: number, s = 0.55, l = 0.62): string {
  const h = ((hue % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export interface ArcSeed {
  a: number;
  k: number;
  tilt: number;
  speed: number;
  phase: number;
  sweep: number;
  hue: number;
  hueSpan: number;
  width: number;
  cx: number;
  cy: number;
}

export interface ArcRender {
  id: string;
  front: string;
  back: string;
  width: number;
  opacity: number;
  grad: { x1: number; y1: number; x2: number; y2: number; stops: string[] };
}

export type OrbitColorMode = 'rainbow' | 'logo';

/**
 * BaiYing logo ribbon stops — red × blue from `public/logo.svg` (intersecting X).
 */
export const LOGO_RIBBON_STOPS: readonly (readonly string[])[] = [
  ['#ff1524', '#ff3b35', '#f01522'],
  ['#0f5da7', '#2f7ac8', '#115ca5'],
  ['#ff3b35', '#ff1524', '#ff6b5a'],
  ['#2f7ac8', '#0f5da7', '#4a9adb'],
  ['#f01522', '#ff3b35', '#ff1524'],
  ['#115ca5', '#2f7ac8', '#0f5da7'],
] as const;

/**
 * Project a tilted 3D circle orthographically and split by depth so the back
 * half can be drawn under the body silhouette.
 */
export function arcRender(
  seed: ArcSeed,
  t: number,
  scale: number,
  id: string,
  opacity = 1,
  colorMode: OrbitColorMode = 'rainbow',
  paletteIndex = 0,
): ArcRender {
  const spin = seed.phase + t * seed.speed * TAU;
  const cu = Math.cos(seed.tilt);
  const su = Math.sin(seed.tilt);
  const kz = Math.sqrt(Math.max(0, 1 - seed.k * seed.k));

  const N = 64;
  const span = seed.sweep * TAU;
  let front = '';
  let back = '';
  let prev: boolean | null = null;

  for (let i = 0; i <= N; i++) {
    const th = spin + (i / N) * span;
    const ct = Math.cos(th);
    const st = Math.sin(th);
    const x = seed.a * (ct * cu + st * -su * seed.k) + seed.cx;
    const y = seed.a * (ct * su + st * cu * seed.k) + seed.cy;
    const z = seed.a * st * kz;

    const behind = z < 0;
    const sx = r2(x * scale);
    const sy = r2(y * scale);
    const cmd = behind !== prev ? 'M' : 'L';
    if (behind) back += `${cmd}${sx} ${sy}`;
    else front += `${cmd}${sx} ${sy}`;
    prev = behind;
  }

  const gx = Math.cos(seed.tilt) * seed.a * scale;
  const gy = Math.sin(seed.tilt) * seed.a * scale;
  const logoStops = LOGO_RIBBON_STOPS[paletteIndex % LOGO_RIBBON_STOPS.length]!;
  const stops = colorMode === 'logo'
    ? [...logoStops]
    : [
        wheel(seed.hue),
        wheel(seed.hue + seed.hueSpan * 0.5),
        wheel(seed.hue + seed.hueSpan),
      ];
  return {
    id,
    front,
    back,
    width: seed.width * scale,
    opacity,
    grad: {
      x1: r2(seed.cx * scale - gx),
      y1: r2(seed.cy * scale - gy),
      x2: r2(seed.cx * scale + gx),
      y2: r2(seed.cy * scale + gy),
      stops,
    },
  };
}

const RING_RNG = createRng(0xa11ce);

/**
 * Six ribbons, a≈1.30–1.40× ball radius, flat orbits (k≤0.45), ~3.3 turns/s.
 * Seed matches bloub so splash + React look identical.
 */
export const RINGS: ArcSeed[] = Array.from({ length: 6 }, (_, i) => ({
  a: 1.3 + RING_RNG() * 0.1,
  k: 0.05 + RING_RNG() * 0.4,
  tilt: (i / 6) * Math.PI + RING_RNG() * 0.5,
  speed: 3 + RING_RNG() * 0.7,
  phase: RING_RNG() * TAU,
  sweep: 0.6 + RING_RNG() * 0.25,
  hue: (i * 360) / 6 + RING_RNG() * 30,
  hueSpan: 60 + RING_RNG() * 60,
  width: 0.05 + RING_RNG() * 0.012,
  cx: 0,
  cy: 0.1,
}));

/** Ball radius in SVG units — face path ≈ ±104; 100 matches bloub RAYON. */
export const STARTUP_BALL_RADIUS = 100;

/** Half viewBox so rings (≤1.4R) fit with margin. */
export const STARTUP_VIEWBOX_HALF = 158;

/**
 * Sample all orbit ribbons at time `tSeconds`.
 * Staggered fade-in matches bloub `orbit` (one ribbon every ~0.13s).
 */
export function sampleOrbitRings(
  tSeconds: number,
  ballRadius: number = STARTUP_BALL_RADIUS,
  opacity = 1,
  colorMode: OrbitColorMode = 'rainbow',
): ArcRender[] {
  return RINGS.map((seed, i) => {
    const enter = Math.max(0, Math.min(1, (tSeconds - i * 0.13) / 0.3));
    return arcRender(seed, tSeconds, ballRadius, `rg${i}`, opacity * enter, colorMode, i);
  });
}

/** Clamp to [0, 1] — same helper as bloub `math.clamp` for unit intervals. */
export function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** bloub `easings.easeOutQuint` — comet body collapse / regrow. */
export function easeOutQuint(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 5;
}

/* ------------------------------------------------------------------ comet */

/**
 * Unlike a flying particle, the head stays centered and the trail orbits it.
 * a≈0.85, b≈0.15, tilt +34°, 4 ribbons, ~210°/s — ported from bloub `decor.ts`.
 */
const COMET_RNG = createRng(0xc0e7);
export const COMET_RIBBONS: ArcSeed[] = Array.from({ length: 4 }, (_, i) => {
  const d = i - 1.5;
  return {
    a: 0.85 * (1 + d * 0.03),
    // same flatten within ±5%: ribbons form a tight beam
    k: (0.15 / 0.85) * (1 + d * 0.16),
    tilt: (34 * Math.PI) / 180 + d * 0.035,
    speed: 210 / 360,
    // measured phase: 10–20° between ribbons, no more
    phase: -i * 0.045 + COMET_RNG() * 0.012,
    sweep: 0.34,
    hue: i * 85 + COMET_RNG() * 20,
    hueSpan: 80,
    width: 0.095,
    cx: 0,
    cy: 0,
  };
});

/** Comet head radius as a fraction of the ball — measured 0.129 in bloub. */
export const COMET_DOT = 0.129;

/**
 * Home intro comet duration. bloub's reference block is 2.4s; we compress the
 * same pose curve into 0.6s so the home hero stays snappy.
 */
export const HOME_COMET_DURATION_SECONDS = 0.6;

/** Scale factor from bloub's 2.4s comet timeline → home duration. */
const HOME_COMET_TIME_SCALE = HOME_COMET_DURATION_SECONDS / 2.4;

const COMET_COLLAPSE_SECONDS = 0.55 * HOME_COMET_TIME_SCALE;
const COMET_REGROW_START_SECONDS = 1.85 * HOME_COMET_TIME_SCALE;
const COMET_REGROW_SECONDS = 0.6 * HOME_COMET_TIME_SCALE;
const COMET_WOBBLE_SECONDS = 1.7 * HOME_COMET_TIME_SCALE;
const COMET_FADE_IN_START_SECONDS = 0.15 * HOME_COMET_TIME_SCALE;
const COMET_FADE_IN_SECONDS = 0.25 * HOME_COMET_TIME_SCALE;
const COMET_FADE_OUT_START_SECONDS = 1.95 * HOME_COMET_TIME_SCALE;
const COMET_FADE_OUT_SECONDS = 0.3 * HOME_COMET_TIME_SCALE;

/** Home intro ribbon count — bloub comet uses four. */
export const HOME_COMET_RIBBON_COUNT = COMET_RIBBONS.length;

/**
 * Body scale for the comet collapse → regrow curve (bloub `states.ts` comet pose,
 * time-scaled to {@link HOME_COMET_DURATION_SECONDS}).
 */
export function homeCometBodyScale(tSeconds: number): number {
  if (tSeconds <= 0 || tSeconds >= HOME_COMET_DURATION_SECONDS) return 1;
  const collapse = 1 - (1 - COMET_DOT) * easeOutQuint(clamp01(tSeconds / COMET_COLLAPSE_SECONDS));
  const regrow = easeOutQuint(clamp01((tSeconds - COMET_REGROW_START_SECONDS) / COMET_REGROW_SECONDS));
  return collapse + (1 - collapse) * regrow;
}

/**
 * Vertical wobble in ball-radius units while collapsed (bloub: sin(t/1.7·π)·0.035).
 */
export function homeCometBodyCy(tSeconds: number): number {
  if (tSeconds <= 0 || tSeconds >= HOME_COMET_DURATION_SECONDS) return 0;
  return Math.sin(clamp01(tSeconds / COMET_WOBBLE_SECONDS) * Math.PI) * 0.035;
}

/**
 * Home-page one-shot comet: 4 logo-colored trail ribbons (bloub `comet`).
 * Fade curve matches bloub, compressed into {@link HOME_COMET_DURATION_SECONDS}.
 * Spin uses bloub-time so the trail sweeps about as far as the 2.4s reference.
 * Returns null when the block is over so callers can stop the loop.
 */
export function sampleHomeCometRings(
  tSeconds: number,
  ballRadius: number = STARTUP_BALL_RADIUS,
): ArcRender[] | null {
  if (tSeconds >= HOME_COMET_DURATION_SECONDS) return null;

  const fade = clamp01((tSeconds - COMET_FADE_IN_START_SECONDS) / COMET_FADE_IN_SECONDS)
    * clamp01((COMET_FADE_OUT_START_SECONDS - tSeconds) / COMET_FADE_OUT_SECONDS);
  // Keep trail angular travel close to the 2.4s reference despite the shorter block.
  const spinT = tSeconds / HOME_COMET_TIME_SCALE;
  return COMET_RIBBONS.map((seed, i) => (
    arcRender(seed, spinT, ballRadius, `cm${i}`, fade, 'logo', i)
  ));
}
