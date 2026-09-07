import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import {
  computeEyePupilOffsets,
  computeTourEyeOffsets,
  easeInOutCubic,
  pickBlinkDelayMs,
  type Point2D,
} from './coworkHomeInteractiveLogoMath';
import {
  type ArcRender,
  sampleOrbitRings,
  STARTUP_BALL_RADIUS,
  STARTUP_VIEWBOX_HALF,
} from './coworkStartupOrbitRings';

const FACE_PATH =
  'M104.24 0.09C104.24 3.49 103.93 6.93 103.37 10.27C102.82 13.61 102.01 16.96 100.92 20.15C99.83 23.35 98.43 26.49 96.84 29.45C95.26 32.41 93.44 35.28 91.41 37.92C89.39 40.57 87.09 43.05 84.7 45.31C82.3 47.57 79.71 49.66 77.03 51.49C74.35 53.31 71.48 54.92 68.59 56.28C65.7 57.64 62.69 58.76 59.7 59.65C56.71 60.54 53.65 61.19 50.65 61.61C47.64 62.04 44.55 62.1 41.67 62.2C38.79 62.29 36.01 62.2 33.38 62.2C30.76 62.2 28.31 62.2 25.92 62.2C23.54 62.2 21.28 62.2 19.05 62.2C16.83 62.2 14.69 62.2 12.58 62.2C10.46 62.2 8.41 62.2 6.35 62.2C4.29 62.2 2.28 62.2 0.24 62.2C-1.79 62.2 -3.81 62.2 -5.86 62.2C-7.92 62.2 -9.97 62.2 -12.09 62.2C-14.21 62.2 -16.34 62.2 -18.56 62.2C-20.79 62.2 -23.05 62.2 -25.44 62.2C-27.83 62.2 -30.27 62.2 -32.9 62.2C-35.52 62.2 -38.31 62.29 -41.18 62.2C-44.06 62.1 -47.16 62.04 -50.16 61.61C-53.17 61.19 -56.22 60.54 -59.22 59.65C-62.21 58.76 -65.22 57.64 -68.11 56.28C-70.99 54.92 -73.86 53.31 -76.54 51.49C-79.23 49.66 -81.81 47.57 -84.21 45.31C-86.61 43.05 -88.9 40.57 -90.93 37.92C-92.95 35.28 -94.77 32.41 -96.36 29.45C-97.94 26.49 -99.34 23.35 -100.43 20.15C-101.52 16.96 -102.33 13.61 -102.89 10.27C-103.44 6.93 -103.76 3.49 -103.76 0.09C-103.76 -3.3 -103.44 -6.74 -102.89 -10.08C-102.33 -13.42 -101.52 -16.77 -100.43 -19.96C-99.34 -23.16 -97.94 -26.3 -96.36 -29.26C-94.77 -32.22 -92.95 -35.09 -90.93 -37.73C-88.9 -40.38 -86.61 -42.86 -84.21 -45.12C-81.81 -47.38 -79.23 -49.47 -76.54 -51.3C-73.86 -53.13 -70.99 -54.73 -68.11 -56.09C-65.22 -57.45 -62.21 -58.57 -59.22 -59.46C-56.22 -60.35 -53.17 -61 -50.16 -61.43C-47.16 -61.85 -44.06 -61.91 -41.18 -62.01C-38.31 -62.11 -35.52 -62.01 -32.9 -62.01C-30.27 -62.01 -27.83 -62.01 -25.44 -62.01C-23.05 -62.01 -20.79 -62.01 -18.56 -62.01C-16.34 -62.01 -14.21 -62.01 -12.09 -62.01C-9.97 -62.01 -7.92 -62.01 -5.86 -62.01C-3.81 -62.01 -1.79 -62.01 0.24 -62.01C2.28 -62.01 4.29 -62.01 6.35 -62.01C8.41 -62.01 10.46 -62.01 12.58 -62.01C14.69 -62.01 16.83 -62.01 19.05 -62.01C21.28 -62.01 23.54 -62.01 25.92 -62.01C28.31 -62.01 30.76 -62.01 33.38 -62.01C36.01 -62.01 38.79 -62.11 41.67 -62.01C44.55 -61.91 47.64 -61.85 50.65 -61.43C53.65 -61 56.71 -60.35 59.7 -59.46C62.69 -58.57 65.7 -57.45 68.59 -56.09C71.48 -54.73 74.35 -53.13 77.03 -51.3C79.71 -49.47 82.3 -47.38 84.7 -45.12C87.09 -42.86 89.39 -40.38 91.41 -37.73C93.44 -35.09 95.26 -32.22 96.84 -29.26C98.43 -26.3 99.83 -23.16 100.92 -19.96C102.01 -16.77 102.82 -13.42 103.37 -10.08C103.93 -6.74 104.24 -3.3 104.24 0.09Z';

const EYE_PATH =
  'M-22.5 -1A22.5 22.5 0 0 1 0 -23.5L0 -23.5A22.5 22.5 0 0 1 22.5 -1L22.5 1A22.5 22.5 0 0 1 0 23.5L0 23.5A22.5 22.5 0 0 1 -22.5 1Z';

const LEFT_EYE_BASE = { x: -26.34, y: 2.63, sx: 0.97, kx: 0.02, ky: -0.01 };
const RIGHT_EYE_BASE = { x: 40.99, y: 3.19, sx: 0.92, kx: 0, ky: -0.01 };

const MAX_PUPIL_OFFSET = 26;
const MAX_HEAD_TILT = 10;
const BLINK_CLOSE_MS = 90;
const BLINK_HOLD_MS = 70;
const BLINK_OPEN_MS = 110;
/** Collapse eye height around its own center (not the SVG origin). */
const BLINK_CLOSED_SCALE = 0.06;
const IDLE_BEFORE_BLINK_MS = 900;
const FIRST_BLINK_DELAY_MS = 1100;
const POINTER_MOVE_EPSILON_PX = 2.5;

const STARTUP_APPEAR_MS = 520;
const STARTUP_TOUR_MS = 1400;
const STARTUP_TOUR_GAP_MS = 2600;
const STARTUP_FIRST_TOUR_DELAY_MS = 180;

const ZERO: Point2D = { x: 0, y: 0 };

export type CoworkHomeLogoMotion = 'none' | 'pointer' | 'startup' | 'home';

interface CoworkHomeInteractiveLogoProps {
  className?: string;
  /**
   * When true, eyes / head track the pointer (same as motion="pointer").
   * Ignored when `motion` is set explicitly.
   */
  interactive?: boolean;
  /**
   * `startup`: soft appear + looping eye-orbit tour + idle blinks (loading).
   * `home`: blink + pointer track (alias for pointer-style interaction).
   * `pointer`: track cursor + blink.
   * `none`: static face.
   */
  motion?: CoworkHomeLogoMotion;
  'aria-label'?: string;
}

/**
 * Path is centered at origin; translate to the eye, then scale locally so
 * blinking collapses through the pupil instead of toward (0,0).
 */
function eyeMatrix(
  base: typeof LEFT_EYE_BASE,
  offset: Point2D,
  blinkScaleY: number,
): string {
  const tx = base.x + offset.x;
  const ty = base.y + offset.y;
  return `translate(${tx} ${ty}) matrix(${base.sx},${base.kx},${base.ky},${blinkScaleY},0,0)`;
}

const prefersReducedMotion = (): boolean => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

const CoworkHomeInteractiveLogo: React.FC<CoworkHomeInteractiveLogoProps> = ({
  className,
  interactive = false,
  motion: motionProp,
  'aria-label': ariaLabel = '百应',
}) => {
  const motion: CoworkHomeLogoMotion = motionProp ?? (interactive ? 'pointer' : 'none');
  const reactId = useId();
  const maskId = `cowork-home-bot-mask-${reactId.replace(/:/g, '')}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const leftEyeRef = useRef<SVGPathElement>(null);
  const rightEyeRef = useRef<SVGPathElement>(null);
  const [headTilt, setHeadTilt] = useState<Point2D>(ZERO);
  const rafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastClientRef = useRef<{ x: number; y: number } | null>(null);
  const blinkScaleRef = useRef(1);
  const lastPointerAtRef = useRef(0);
  const eyeOffsetRef = useRef<{ left: Point2D; right: Point2D }>({
    left: ZERO,
    right: ZERO,
  });
  const tourActiveRef = useRef(false);
  const [orbitArcs, setOrbitArcs] = useState<ArcRender[]>([]);

  const paintEyes = useCallback((left: Point2D, right: Point2D, blink: number) => {
    eyeOffsetRef.current = { left, right };
    blinkScaleRef.current = blink;
    if (leftEyeRef.current) {
      leftEyeRef.current.setAttribute('transform', eyeMatrix(LEFT_EYE_BASE, left, blink));
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.setAttribute('transform', eyeMatrix(RIGHT_EYE_BASE, right, blink));
    }
  }, []);

  const setBlink = useCallback((scale: number) => {
    paintEyes(eyeOffsetRef.current.left, eyeOffsetRef.current.right, scale);
  }, [paintEyes]);

  useLayoutEffect(() => {
    // Re-apply after every React commit so JSX never clobbers imperative blink/look.
    paintEyes(eyeOffsetRef.current.left, eyeOffsetRef.current.right, blinkScaleRef.current);
  });

  // Soft appear when used as the loading mascot.
  useEffect(() => {
    if (motion !== 'startup') return undefined;
    const el = rootRef.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
      return undefined;
    }

    const appear = el.animate(
      [
        { opacity: 0, transform: 'scale(0.9)' },
        { opacity: 1, transform: 'scale(1.04)', offset: 0.72 },
        { opacity: 1, transform: 'scale(1)' },
      ],
      {
        duration: STARTUP_APPEAR_MS,
        easing: 'cubic-bezier(0.18, 0.88, 0.26, 1)',
        fill: 'both',
      },
    );

    return () => {
      appear.cancel();
    };
  }, [motion]);

  // Startup orbit ribbons via React state.
  useEffect(() => {
    if (motion !== 'startup') {
      setOrbitArcs([]);
      return undefined;
    }

    if (prefersReducedMotion()) {
      setOrbitArcs(sampleOrbitRings(1.5, STARTUP_BALL_RADIUS, 0.85));
      return () => {
        setOrbitArcs([]);
      };
    }

    let cancelled = false;
    let raf = 0;
    const started = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      setOrbitArcs(sampleOrbitRings(((now - started) / 1000) + 1, STARTUP_BALL_RADIUS, 1));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      setOrbitArcs([]);
    };
  }, [motion]);

  // Startup: looping eye-orbit tour with idle gaps (bloub-style spin stand-in).
  useEffect(() => {
    if (motion !== 'startup') return undefined;

    let cancelled = false;
    let gapTimer = 0;
    let tourRaf = 0;

    const finishTourToRest = () => {
      tourActiveRef.current = false;
      paintEyes(ZERO, ZERO, 1);
    };

    const runTour = () => {
      if (cancelled) return;
      if (prefersReducedMotion()) {
        finishTourToRest();
        return;
      }

      tourActiveRef.current = true;
      const started = performance.now();

      const tick = (now: number) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - started) / STARTUP_TOUR_MS);
        const progress = easeInOutCubic(raw);
        const tour = computeTourEyeOffsets(progress);
        const blink = Math.max(BLINK_CLOSED_SCALE, tour.visibility);
        paintEyes(tour.left, tour.right, blink);

        if (raw < 1) {
          tourRaf = window.requestAnimationFrame(tick);
          return;
        }

        finishTourToRest();
        // Settling blink after each tour — “alive” beat without another spin.
        setBlink(BLINK_CLOSED_SCALE);
        gapTimer = window.setTimeout(() => {
          if (cancelled) return;
          setBlink(1);
          gapTimer = window.setTimeout(() => {
            if (!cancelled) runTour();
          }, STARTUP_TOUR_GAP_MS);
        }, BLINK_CLOSE_MS + BLINK_HOLD_MS);
      };

      tourRaf = window.requestAnimationFrame(tick);
    };

    gapTimer = window.setTimeout(runTour, STARTUP_FIRST_TOUR_DELAY_MS + STARTUP_APPEAR_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(gapTimer);
      if (tourRaf) window.cancelAnimationFrame(tourRaf);
      tourActiveRef.current = false;
      paintEyes(ZERO, ZERO, 1);
    };
  }, [motion, paintEyes, setBlink]);

  useEffect(() => {
    if (motion !== 'pointer' && motion !== 'home') {
      if (motion === 'none') {
        paintEyes(ZERO, ZERO, 1);
        setHeadTilt(ZERO);
      }
      return undefined;
    }

    lastPointerAtRef.current = performance.now();
    lastClientRef.current = null;

    const applyPointer = (clientX: number, clientY: number) => {
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const prev = lastClientRef.current;
      if (
        !prev
        || Math.hypot(clientX - prev.x, clientY - prev.y) >= POINTER_MOVE_EPSILON_PX
      ) {
        lastPointerAtRef.current = performance.now();
        lastClientRef.current = { x: clientX, y: clientY };
        if (blinkScaleRef.current < 0.95) {
          setBlink(1);
        }
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const scale = rect.width / 250;

      const next = computeEyePupilOffsets({
        mouseX: clientX,
        mouseY: clientY,
        containerCenterX: centerX,
        containerCenterY: centerY,
        leftEyeCenterX: centerX + LEFT_EYE_BASE.x * scale,
        leftEyeCenterY: centerY + LEFT_EYE_BASE.y * scale,
        rightEyeCenterX: centerX + RIGHT_EYE_BASE.x * scale,
        rightEyeCenterY: centerY + RIGHT_EYE_BASE.y * scale,
        maxPupilOffset: MAX_PUPIL_OFFSET,
        maxHeadTilt: MAX_HEAD_TILT,
      });

      paintEyes(next.left, next.right, blinkScaleRef.current);
      setHeadTilt(next.headTilt);
    };

    const flushPointer = () => {
      rafRef.current = null;
      const pending = pendingPointerRef.current;
      if (!pending) return;
      applyPointer(pending.x, pending.y);
    };

    const onPointerMove = (event: PointerEvent | MouseEvent) => {
      pendingPointerRef.current = { x: event.clientX, y: event.clientY };
      if (rafRef.current == null) {
        rafRef.current = window.requestAnimationFrame(flushPointer);
      }
    };

    document.addEventListener('pointermove', onPointerMove, { passive: true, capture: true });
    document.addEventListener('mousemove', onPointerMove, { passive: true, capture: true });
    return () => {
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('mousemove', onPointerMove, true);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [motion, paintEyes, setBlink]);

  useEffect(() => {
    // Idle blinks for pointer, home intro, and startup gaps (skip mid-tour).
    if (motion !== 'pointer' && motion !== 'startup' && motion !== 'home') return undefined;

    let cancelled = false;
    let waitTimer = 0;
    let phaseTimer = 0;

    const clearTimers = () => {
      window.clearTimeout(waitTimer);
      window.clearTimeout(phaseTimer);
    };

    const runBlink = (remaining: number) => {
      if (cancelled || remaining <= 0) {
        scheduleNext();
        return;
      }
      if (tourActiveRef.current) {
        scheduleNext(450);
        return;
      }

      setBlink(BLINK_CLOSED_SCALE);
      phaseTimer = window.setTimeout(() => {
        if (cancelled) return;
        phaseTimer = window.setTimeout(() => {
          if (cancelled) return;
          setBlink(1);
          phaseTimer = window.setTimeout(() => {
            if (cancelled) return;
            runBlink(remaining - 1);
          }, BLINK_OPEN_MS);
        }, BLINK_HOLD_MS);
      }, BLINK_CLOSE_MS);
    };

    const scheduleNext = (delayMs = pickBlinkDelayMs()) => {
      clearTimers();
      waitTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (tourActiveRef.current) {
          waitTimer = window.setTimeout(() => {
            if (!cancelled) scheduleNext(450);
          }, 450);
          return;
        }
        if (motion === 'pointer' || motion === 'home') {
          const idleFor = performance.now() - lastPointerAtRef.current;
          if (idleFor < IDLE_BEFORE_BLINK_MS) {
            waitTimer = window.setTimeout(() => {
              if (!cancelled) scheduleNext(450);
            }, 450);
            return;
          }
        }
        runBlink(Math.random() < 0.2 ? 2 : 1);
      }, delayMs);
    };

    scheduleNext(
      motion === 'startup'
        ? STARTUP_APPEAR_MS + FIRST_BLINK_DELAY_MS
        : motion === 'home'
          ? 700
          : FIRST_BLINK_DELAY_MS,
    );
    return () => {
      cancelled = true;
      clearTimers();
      setBlink(1);
    };
  }, [motion, setBlink]);

  const wrapperStyle = (motion === 'pointer' || motion === 'home')
    ? {
        transform: `translate(${headTilt.x * 0.35}px, ${-headTilt.y * 0.35}px) rotate(${headTilt.x * 0.45}deg)`,
        transition: 'transform 40ms linear',
      }
    : undefined;

  const showStartupOrbit = motion === 'startup' && orbitArcs.length > 0;
  const vb = motion === 'startup' ? STARTUP_VIEWBOX_HALF : 125;
  const viewBox = `${-vb} ${-vb} ${vb * 2} ${vb * 2}`;

  return (
    <div ref={rootRef} className={className} style={wrapperStyle}>
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        role="img"
        aria-label={ariaLabel}
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-[1] h-full w-full overflow-visible"
      >
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-vb}
            y={-vb}
            width={vb * 2}
            height={vb * 2}
          >
            <path d={FACE_PATH} fill="#fff" />
            <path
              ref={leftEyeRef}
              d={EYE_PATH}
              fill="#000"
            />
            <path
              ref={rightEyeRef}
              d={EYE_PATH}
              fill="#000"
            />
          </mask>
          {showStartupOrbit && orbitArcs.map((arc) => (
            <linearGradient
              key={`grad-${arc.id}`}
              id={`${maskId}-${arc.id}`}
              gradientUnits="userSpaceOnUse"
              x1={arc.grad.x1}
              y1={arc.grad.y1}
              x2={arc.grad.x2}
              y2={arc.grad.y2}
            >
              {arc.grad.stops.map((color, i) => (
                <stop
                  key={`${arc.id}-${i}`}
                  offset={i / Math.max(1, arc.grad.stops.length - 1)}
                  stopColor={color}
                />
              ))}
            </linearGradient>
          ))}
        </defs>

        {/* Back half of ribbons — under the body so they wrap behind. */}
        {showStartupOrbit && (
          <g fill="none" strokeLinecap="round">
            {orbitArcs.map((arc) => (
              arc.back ? (
                <path
                  key={`b-${arc.id}`}
                  d={arc.back}
                  stroke={`url(#${maskId}-${arc.id})`}
                  strokeWidth={arc.width}
                  opacity={arc.opacity}
                />
              ) : null
            ))}
          </g>
        )}

        {/* Opaque face under the eye mask so back ribbons never show through eyes. */}
        <path
          d={FACE_PATH}
          fill="#f9f9f9"
          stroke="rgba(15, 15, 18, 0.08)"
          strokeWidth="3"
        />
        <g mask={`url(#${maskId})`}>
          <rect x={-vb} y={-vb} width={vb * 2} height={vb * 2} fill="#0a0a0c" />
        </g>

        {/* Front half of ribbons — over the body. */}
        {showStartupOrbit && (
          <g fill="none" strokeLinecap="round">
            {orbitArcs.map((arc) => (
              arc.front ? (
                <path
                  key={`f-${arc.id}`}
                  d={arc.front}
                  stroke={`url(#${maskId}-${arc.id})`}
                  strokeWidth={arc.width}
                  opacity={arc.opacity}
                />
              ) : null
            ))}
          </g>
        )}
      </svg>
    </div>
  );
};

export default CoworkHomeInteractiveLogo;
