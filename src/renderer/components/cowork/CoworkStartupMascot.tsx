import React, { useEffect, useId, useRef } from 'react';

import {
  computeTourEyeOffsets,
  easeInOutCubic,
  pickBlinkDelayMs,
  type Point2D,
} from './coworkHomeInteractiveLogoMath';
import {
  RINGS,
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

const SVG_NS = 'http://www.w3.org/2000/svg';
const VB = STARTUP_VIEWBOX_HALF;
const REDUCE_MOTION_SPEED = 0.4;
const ZERO: Point2D = { x: 0, y: 0 };

const BLINK_CLOSE_MS = 90;
const BLINK_HOLD_MS = 70;
const BLINK_OPEN_MS = 110;
const BLINK_CLOSED_SCALE = 0.06;
const FIRST_BLINK_DELAY_MS = 1100;
const TOUR_MS = 1400;
const TOUR_GAP_MS = 3200;
const FIRST_TOUR_DELAY_MS = 700;

function eyeMatrix(
  base: typeof LEFT_EYE_BASE,
  offset: Point2D,
  blinkScaleY: number,
): string {
  const tx = base.x + offset.x;
  const ty = base.y + offset.y;
  return `translate(${tx} ${ty}) matrix(${base.sx},${base.kx},${base.ky},${blinkScaleY},0,0)`;
}

interface CoworkStartupMascotProps {
  className?: string;
  'aria-label'?: string;
}

type OrbitSlot = {
  grad: SVGLinearGradientElement;
  stops: SVGStopElement[];
  back: SVGPathElement;
  front: SVGPathElement;
};

/**
 * Startup mascot with bloub orbit ribbons + idle blink / occasional eye tour.
 *
 * Animation is driven by direct SVG DOM updates inside a memoized host.
 * React must not reconcile the SVG subtree each tip/status tick — that was
 * wiping / freezing the ribbon paths on the loading overlay.
 */
const CoworkStartupMascot: React.FC<CoworkStartupMascotProps> = ({
  className,
  'aria-label': ariaLabel = '百应',
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, '');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let speed = 1;
    let reduceMotion = false;
    try {
      reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) speed = REDUCE_MOTION_SPEED;
    } catch {
      speed = 1;
    }

    const uid = `startup-mascot-${reactId}`;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `${-VB} ${-VB} ${VB * 2} ${VB * 2}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', ariaLabel);
    svg.style.overflow = 'visible';
    svg.style.display = 'block';

    const defs = document.createElementNS(SVG_NS, 'defs');
    const mask = document.createElementNS(SVG_NS, 'mask');
    mask.setAttribute('id', `${uid}-mask`);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', String(-VB));
    mask.setAttribute('y', String(-VB));
    mask.setAttribute('width', String(VB * 2));
    mask.setAttribute('height', String(VB * 2));

    const faceMask = document.createElementNS(SVG_NS, 'path');
    faceMask.setAttribute('d', FACE_PATH);
    faceMask.setAttribute('fill', '#fff');
    mask.appendChild(faceMask);

    const leftEye = document.createElementNS(SVG_NS, 'path');
    leftEye.setAttribute('d', EYE_PATH);
    leftEye.setAttribute('fill', '#000');
    mask.appendChild(leftEye);

    const rightEye = document.createElementNS(SVG_NS, 'path');
    rightEye.setAttribute('d', EYE_PATH);
    rightEye.setAttribute('fill', '#000');
    mask.appendChild(rightEye);
    defs.appendChild(mask);

    let eyeOffset = { left: ZERO, right: ZERO };
    let tourActive = false;

    const paintEyes = (left: Point2D, right: Point2D, blink: number) => {
      eyeOffset = { left, right };
      leftEye.setAttribute('transform', eyeMatrix(LEFT_EYE_BASE, left, blink));
      rightEye.setAttribute('transform', eyeMatrix(RIGHT_EYE_BASE, right, blink));
    };
    paintEyes(ZERO, ZERO, 1);

    const backG = document.createElementNS(SVG_NS, 'g');
    backG.setAttribute('fill', 'none');
    backG.setAttribute('stroke-linecap', 'round');

    const frontG = document.createElementNS(SVG_NS, 'g');
    frontG.setAttribute('fill', 'none');
    frontG.setAttribute('stroke-linecap', 'round');

    const slots: OrbitSlot[] = RINGS.map((_, i) => {
      const id = `rg${i}`;
      const grad = document.createElementNS(SVG_NS, 'linearGradient');
      grad.setAttribute('id', `${uid}-${id}`);
      grad.setAttribute('gradientUnits', 'userSpaceOnUse');
      const stops = [0, 0.5, 1].map((offset) => {
        const stop = document.createElementNS(SVG_NS, 'stop');
        stop.setAttribute('offset', String(offset));
        grad.appendChild(stop);
        return stop;
      });
      defs.appendChild(grad);

      const back = document.createElementNS(SVG_NS, 'path');
      back.setAttribute('stroke', `url(#${uid}-${id})`);
      backG.appendChild(back);

      const front = document.createElementNS(SVG_NS, 'path');
      front.setAttribute('stroke', `url(#${uid}-${id})`);
      frontG.appendChild(front);

      return { grad, stops, back, front };
    });

    svg.appendChild(defs);
    svg.appendChild(backG);

    const face = document.createElementNS(SVG_NS, 'path');
    face.setAttribute('d', FACE_PATH);
    face.setAttribute('fill', '#f9f9f9');
    face.setAttribute('stroke', 'rgba(15, 15, 18, 0.08)');
    face.setAttribute('stroke-width', '3');
    svg.appendChild(face);

    const ink = document.createElementNS(SVG_NS, 'g');
    ink.setAttribute('mask', `url(#${uid}-mask)`);
    const inkRect = document.createElementNS(SVG_NS, 'rect');
    inkRect.setAttribute('x', String(-VB));
    inkRect.setAttribute('y', String(-VB));
    inkRect.setAttribute('width', String(VB * 2));
    inkRect.setAttribute('height', String(VB * 2));
    inkRect.setAttribute('fill', '#0a0a0c');
    ink.appendChild(inkRect);
    svg.appendChild(ink);
    svg.appendChild(frontG);

    host.replaceChildren(svg);

    const paintRings = (t: number) => {
      const arcs = sampleOrbitRings(t, STARTUP_BALL_RADIUS, 1);
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        const slot = slots[i];
        if (!arc || !slot) continue;
        slot.grad.setAttribute('x1', String(arc.grad.x1));
        slot.grad.setAttribute('y1', String(arc.grad.y1));
        slot.grad.setAttribute('x2', String(arc.grad.x2));
        slot.grad.setAttribute('y2', String(arc.grad.y2));
        arc.grad.stops.forEach((color, si) => {
          slot.stops[si]?.setAttribute('stop-color', color);
        });
        const width = String(arc.width * 1.25);
        const opacity = String(arc.opacity);
        slot.back.setAttribute('d', arc.back || '');
        slot.back.setAttribute('stroke-width', width);
        slot.back.setAttribute('opacity', opacity);
        slot.front.setAttribute('d', arc.front || '');
        slot.front.setAttribute('stroke-width', width);
        slot.front.setAttribute('opacity', opacity);
      }
    };

    let raf = 0;
    let cancelled = false;
    const started = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      paintRings(((now - started) / 1000) * speed + 1.2);
      raf = window.requestAnimationFrame(tick);
    };
    paintRings(1.2);
    raf = window.requestAnimationFrame(tick);

    // Blink + occasional eye tour (same vocabulary as the home logo).
    let waitTimer = 0;
    let phaseTimer = 0;
    let tourRaf = 0;
    let gapTimer = 0;

    const clearBlinkTimers = () => {
      window.clearTimeout(waitTimer);
      window.clearTimeout(phaseTimer);
    };

    const runBlink = (remaining: number, scheduleNext: (delay?: number) => void) => {
      if (cancelled || remaining <= 0) {
        scheduleNext();
        return;
      }
      if (tourActive) {
        scheduleNext(450);
        return;
      }
      paintEyes(eyeOffset.left, eyeOffset.right, BLINK_CLOSED_SCALE);
      phaseTimer = window.setTimeout(() => {
        if (cancelled) return;
        phaseTimer = window.setTimeout(() => {
          if (cancelled) return;
          paintEyes(eyeOffset.left, eyeOffset.right, 1);
          phaseTimer = window.setTimeout(() => {
            if (cancelled) return;
            runBlink(remaining - 1, scheduleNext);
          }, BLINK_OPEN_MS);
        }, BLINK_HOLD_MS);
      }, BLINK_CLOSE_MS);
    };

    const scheduleBlink = (delayMs = pickBlinkDelayMs()) => {
      clearBlinkTimers();
      waitTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (tourActive) {
          scheduleBlink(450);
          return;
        }
        runBlink(Math.random() < 0.2 ? 2 : 1, scheduleBlink);
      }, delayMs);
    };

    const finishTour = () => {
      tourActive = false;
      paintEyes(ZERO, ZERO, 1);
    };

    const runTour = () => {
      if (cancelled || reduceMotion) return;
      tourActive = true;
      const tourStarted = performance.now();
      const tourTick = (now: number) => {
        if (cancelled) return;
        const raw = Math.min(1, (now - tourStarted) / TOUR_MS);
        const progress = easeInOutCubic(raw);
        const tour = computeTourEyeOffsets(progress);
        paintEyes(
          tour.left,
          tour.right,
          Math.max(BLINK_CLOSED_SCALE, tour.visibility),
        );
        if (raw < 1) {
          tourRaf = window.requestAnimationFrame(tourTick);
          return;
        }
        finishTour();
        paintEyes(ZERO, ZERO, BLINK_CLOSED_SCALE);
        gapTimer = window.setTimeout(() => {
          if (cancelled) return;
          paintEyes(ZERO, ZERO, 1);
          gapTimer = window.setTimeout(() => {
            if (!cancelled) runTour();
          }, TOUR_GAP_MS);
        }, BLINK_CLOSE_MS + BLINK_HOLD_MS);
      };
      tourRaf = window.requestAnimationFrame(tourTick);
    };

    scheduleBlink(FIRST_BLINK_DELAY_MS);
    if (!reduceMotion) {
      gapTimer = window.setTimeout(runTour, FIRST_TOUR_DELAY_MS);
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.cancelAnimationFrame(tourRaf);
      clearBlinkTimers();
      window.clearTimeout(gapTimer);
      host.replaceChildren();
    };
  }, [ariaLabel, reactId]);

  return <div ref={hostRef} className={className} />;
};

export default React.memo(CoworkStartupMascot);
