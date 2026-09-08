import React, { useEffect, useId, useRef } from 'react';

import {
  NOTIF_BLUE,
  NOTIFY_BALL_R,
  NOTIFY_DURATION_S,
  NOTIFY_VIEWBOX_HALF,
  sampleNotifyBadge,
  sampleNotifyEyes,
} from './expertKitsNotifyMath';

/** Same measured face outline as the startup / home mascot. */
const FACE_PATH =
  'M104.24 0.09C104.24 3.49 103.93 6.93 103.37 10.27C102.82 13.61 102.01 16.96 100.92 20.15C99.83 23.35 98.43 26.49 96.84 29.45C95.26 32.41 93.44 35.28 91.41 37.92C89.39 40.57 87.09 43.05 84.7 45.31C82.3 47.57 79.71 49.66 77.03 51.49C74.35 53.31 71.48 54.92 68.59 56.28C65.7 57.64 62.69 58.76 59.7 59.65C56.71 60.54 53.65 61.19 50.65 61.61C47.64 62.04 44.55 62.1 41.67 62.2C38.79 62.29 36.01 62.2 33.38 62.2C30.76 62.2 28.31 62.2 25.92 62.2C23.54 62.2 21.28 62.2 19.05 62.2C16.83 62.2 14.69 62.2 12.58 62.2C10.46 62.2 8.41 62.2 6.35 62.2C4.29 62.2 2.28 62.2 0.24 62.2C-1.79 62.2 -3.81 62.2 -5.86 62.2C-7.92 62.2 -9.97 62.2 -12.09 62.2C-14.21 62.2 -16.34 62.2 -18.56 62.2C-20.79 62.2 -23.05 62.2 -25.44 62.2C-27.83 62.2 -30.27 62.2 -32.9 62.2C-35.52 62.2 -38.31 62.29 -41.18 62.2C-44.06 62.1 -47.16 62.04 -50.16 61.61C-53.17 61.19 -56.22 60.54 -59.22 59.65C-62.21 58.76 -65.22 57.64 -68.11 56.28C-70.99 54.92 -73.86 53.31 -76.54 51.49C-79.23 49.66 -81.81 47.57 -84.21 45.31C-86.61 43.05 -88.9 40.57 -90.93 37.92C-92.95 35.28 -94.77 32.41 -96.36 29.45C-97.94 26.49 -99.34 23.35 -100.43 20.15C-101.52 16.96 -102.33 13.61 -102.89 10.27C-103.44 6.93 -103.76 3.49 -103.76 0.09C-103.76 -3.3 -103.44 -6.74 -102.89 -10.08C-102.33 -13.42 -101.52 -16.77 -100.43 -19.96C-99.34 -23.16 -97.94 -26.3 -96.36 -29.26C-94.77 -32.22 -92.95 -35.09 -90.93 -37.73C-88.9 -40.38 -86.61 -42.86 -84.21 -45.12C-81.81 -47.38 -79.23 -49.47 -76.54 -51.3C-73.86 -53.13 -70.99 -54.73 -68.11 -56.09C-65.22 -57.45 -62.21 -58.57 -59.22 -59.46C-56.22 -60.35 -53.17 -61 -50.16 -61.43C-47.16 -61.85 -44.06 -61.91 -41.18 -62.01C-38.31 -62.11 -35.52 -62.01 -32.9 -62.01C-30.27 -62.01 -27.83 -62.01 -25.44 -62.01C-23.05 -62.01 -20.79 -62.01 -18.56 -62.01C-16.34 -62.01 -14.21 -62.01 -12.09 -62.01C-9.97 -62.01 -7.92 -62.01 -5.86 -62.01C-3.81 -62.01 -1.79 -62.01 0.24 -62.01C2.28 -62.01 4.29 -62.01 6.35 -62.01C8.41 -62.01 10.46 -62.01 12.58 -62.01C14.69 -62.01 16.83 -62.01 19.05 -62.01C21.28 -62.01 23.54 -62.01 25.92 -62.01C28.31 -62.01 30.76 -62.01 33.38 -62.01C36.01 -62.01 38.79 -62.11 41.67 -62.01C44.55 -61.91 47.64 -61.85 50.65 -61.43C53.65 -61 56.71 -60.35 59.7 -59.46C62.69 -58.57 65.7 -57.45 68.59 -56.09C71.48 -54.73 74.35 -53.13 77.03 -51.3C79.71 -49.47 82.3 -47.38 84.7 -45.12C87.09 -42.86 89.39 -40.38 91.41 -37.73C93.44 -35.09 95.26 -32.22 96.84 -29.26C98.43 -26.3 99.83 -23.16 100.92 -19.96C102.01 -16.77 102.82 -13.42 103.37 -10.08C103.93 -6.74 104.24 -3.3 104.24 0.09Z';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VB = NOTIFY_VIEWBOX_HALF;
const REDUCE_MOTION_SPEED = 0.35;

const BLINK_CLOSE_MS = 90;
const BLINK_HOLD_MS = 70;
const BLINK_OPEN_MS = 110;
const BLINK_CLOSED_SCALE = 0.06;
const FIRST_BLINK_DELAY_MS = 900;
const BLINK_GAP_MS = 2800;

type ExpertKitsEmptyIconProps = {
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
};

/**
 * Empty-kits illustration: bloub `notify` loop (gaze away + blue badge pop).
 * DOM-driven SVG so React does not reconcile the animation subtree.
 */
const ExpertKitsEmptyIcon: React.FC<ExpertKitsEmptyIconProps> = ({
  className,
  'aria-hidden': ariaHidden = true,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, '');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    let speed = 1;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        speed = REDUCE_MOTION_SPEED;
      }
    } catch {
      speed = 1;
    }

    const uid = `kits-notify-${reactId}`;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `${-VB} ${-VB} ${VB * 2} ${VB * 2}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-hidden', ariaHidden === false || ariaHidden === 'false' ? 'false' : 'true');
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

    const eyeMaskSlots = [0, 1].map(() => {
      const eye = document.createElementNS(SVG_NS, 'path');
      eye.setAttribute('fill', '#000');
      mask.appendChild(eye);
      return eye;
    });

    const notch = document.createElementNS(SVG_NS, 'circle');
    notch.setAttribute('fill', '#000');
    mask.appendChild(notch);
    defs.appendChild(mask);

    svg.appendChild(defs);

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

    const badge = document.createElementNS(SVG_NS, 'circle');
    badge.setAttribute('fill', NOTIF_BLUE);
    svg.appendChild(badge);

    host.replaceChildren(svg);

    let raf = 0;
    let blinkScaleY = 1;
    let nextBlinkAt = performance.now() + FIRST_BLINK_DELAY_MS / speed;
    let blinkPhase: 'idle' | 'closing' | 'hold' | 'opening' = 'idle';
    let blinkPhaseStarted = 0;
    const started = performance.now();

    const paint = (now: number) => {
      const tSec = ((now - started) / 1000) * speed;
      const badgePose = sampleNotifyBadge(tSec, NOTIFY_BALL_R);
      badge.setAttribute('cx', String(badgePose.x));
      badge.setAttribute('cy', String(badgePose.y));
      badge.setAttribute('r', String(badgePose.r));
      notch.setAttribute('cx', String(badgePose.x));
      notch.setAttribute('cy', String(badgePose.y));
      notch.setAttribute('r', String(badgePose.notchR));

      if (blinkPhase === 'idle' && now >= nextBlinkAt) {
        blinkPhase = 'closing';
        blinkPhaseStarted = now;
      }
      if (blinkPhase === 'closing') {
        const p = Math.min(1, (now - blinkPhaseStarted) / (BLINK_CLOSE_MS / speed));
        blinkScaleY = 1 - (1 - BLINK_CLOSED_SCALE) * p;
        if (p >= 1) {
          blinkPhase = 'hold';
          blinkPhaseStarted = now;
          blinkScaleY = BLINK_CLOSED_SCALE;
        }
      } else if (blinkPhase === 'hold') {
        if (now - blinkPhaseStarted >= BLINK_HOLD_MS / speed) {
          blinkPhase = 'opening';
          blinkPhaseStarted = now;
        }
      } else if (blinkPhase === 'opening') {
        const p = Math.min(1, (now - blinkPhaseStarted) / (BLINK_OPEN_MS / speed));
        blinkScaleY = BLINK_CLOSED_SCALE + (1 - BLINK_CLOSED_SCALE) * p;
        if (p >= 1) {
          blinkPhase = 'idle';
          blinkScaleY = 1;
          nextBlinkAt = now + BLINK_GAP_MS / speed;
        }
      }

      // Soft re-pop cue each cycle start (blink once near badge pop).
      const cycleT = ((tSec % NOTIFY_DURATION_S) + NOTIFY_DURATION_S) % NOTIFY_DURATION_S;
      if (cycleT < 0.05 && blinkPhase === 'idle' && now > started + 200) {
        nextBlinkAt = Math.min(nextBlinkAt, now + 40);
      }

      const eyes = sampleNotifyEyes(NOTIFY_BALL_R, blinkScaleY);
      for (let i = 0; i < eyeMaskSlots.length; i++) {
        const slot = eyeMaskSlots[i];
        const eye = eyes[i];
        if (!slot) continue;
        if (!eye) {
          slot.setAttribute('opacity', '0');
          continue;
        }
        slot.setAttribute('d', eye.d);
        slot.setAttribute('transform', eye.matrix);
        slot.setAttribute('opacity', String(eye.alpha));
      }
    };

    const tick = (now: number) => {
      paint(now);
      raf = requestAnimationFrame(tick);
    };
    paint(performance.now());
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      host.replaceChildren();
    };
  }, [ariaHidden, reactId]);

  return <div ref={hostRef} className={className} />;
};

export default ExpertKitsEmptyIcon;
