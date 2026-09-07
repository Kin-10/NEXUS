import React, { useEffect, useId, useRef } from 'react';

import {
  type ArcRender,
  HOME_COMET_DURATION_SECONDS,
  HOME_COMET_RIBBON_COUNT,
  homeCometBodyCy,
  homeCometBodyScale,
  sampleHomeCometRings,
  STARTUP_BALL_RADIUS,
  STARTUP_VIEWBOX_HALF,
} from './coworkStartupOrbitRings';

const SVG_NS = 'http://www.w3.org/2000/svg';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface OrbitLayerHandles {
  grads: SVGLinearGradientElement[];
  stops: SVGStopElement[][];
  paths: SVGPathElement[];
}

/** Build a fixed 4-ribbon SVG layer; attributes are updated imperatively each frame. */
function mountOrbitLayer(svg: SVGSVGElement, uid: string, layer: 'front' | 'back'): OrbitLayerHandles {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const defs = document.createElementNS(SVG_NS, 'defs');
  const group = document.createElementNS(SVG_NS, 'g');
  group.setAttribute('fill', 'none');
  group.setAttribute('stroke-linecap', 'round');

  const grads: SVGLinearGradientElement[] = [];
  const stops: SVGStopElement[][] = [];
  const paths: SVGPathElement[] = [];

  for (let i = 0; i < HOME_COMET_RIBBON_COUNT; i++) {
    const grad = document.createElementNS(SVG_NS, 'linearGradient');
    grad.id = `${uid}-${layer}-${i}`;
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    const stopRow: SVGStopElement[] = [];
    for (let s = 0; s < 3; s++) {
      const stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', String(s / 2));
      stopRow.push(stop);
      grad.appendChild(stop);
    }
    defs.appendChild(grad);
    grads.push(grad);
    stops.push(stopRow);

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('stroke', `url(#${grad.id})`);
    path.style.display = 'none';
    paths.push(path);
    group.appendChild(path);
  }

  svg.appendChild(defs);
  svg.appendChild(group);
  return { grads, stops, paths };
}

function paintOrbitLayer(handles: OrbitLayerHandles, arcs: ArcRender[], side: 'front' | 'back'): void {
  for (let i = 0; i < HOME_COMET_RIBBON_COUNT; i++) {
    const arc = arcs[i];
    const path = handles.paths[i]!;
    const grad = handles.grads[i]!;
    const stopRow = handles.stops[i]!;
    const d = side === 'front' ? arc?.front : arc?.back;

    if (!arc || !d || arc.opacity <= 0.001) {
      path.style.display = 'none';
      continue;
    }

    grad.setAttribute('x1', String(arc.grad.x1));
    grad.setAttribute('y1', String(arc.grad.y1));
    grad.setAttribute('x2', String(arc.grad.x2));
    grad.setAttribute('y2', String(arc.grad.y2));
    arc.grad.stops.forEach((color, si) => {
      const stop = stopRow[si];
      if (stop) stop.setAttribute('stop-color', color);
    });

    path.setAttribute('d', d);
    path.setAttribute('stroke-width', String(arc.width));
    path.setAttribute('opacity', String(arc.opacity));
    path.style.display = '';
  }
}

interface HomeLogoOrbitRibbonsProps {
  children: React.ReactNode;
}

/**
 * Home intro = bloub `comet`: body collapses to a point, 4 trail ribbons orbit
 * (~0.6s), then body regrows. RAF paints path `d` — no React state.
 */
const HomeLogoOrbitRibbons: React.FC<HomeLogoOrbitRibbonsProps> = ({ children }) => {
  const uid = useId().replace(/:/g, '');
  const backRef = useRef<SVGSVGElement>(null);
  const frontRef = useRef<SVGSVGElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const vb = STARTUP_VIEWBOX_HALF;
  const viewBox = `${-vb} ${-vb} ${vb * 2} ${vb * 2}`;

  useEffect(() => {
    const backSvg = backRef.current;
    const frontSvg = frontRef.current;
    const body = bodyRef.current;
    if (!backSvg || !frontSvg || !body) return undefined;

    if (prefersReducedMotion()) {
      body.style.transform = '';
      return undefined;
    }

    const back = mountOrbitLayer(backSvg, uid, 'back');
    const front = mountOrbitLayer(frontSvg, uid, 'front');

    let cancelled = false;
    let raf = 0;
    const started = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const tSeconds = (now - started) / 1000;
      const scale = homeCometBodyScale(tSeconds);
      const cy = homeCometBodyCy(tSeconds) * STARTUP_BALL_RADIUS;
      // cy is in SVG units; map roughly to CSS px via current body height.
      const pxPerUnit = body.clientHeight / (2 * 125);
      body.style.transform = `translateY(${cy * pxPerUnit}px) scale(${scale})`;

      const arcs = sampleHomeCometRings(tSeconds, STARTUP_BALL_RADIUS);
      if (!arcs) {
        paintOrbitLayer(back, [], 'back');
        paintOrbitLayer(front, [], 'front');
        body.style.transform = '';
        return;
      }
      paintOrbitLayer(back, arcs, 'back');
      paintOrbitLayer(front, arcs, 'front');

      if (tSeconds < HOME_COMET_DURATION_SECONDS) {
        raf = window.requestAnimationFrame(tick);
      } else {
        body.style.transform = '';
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      body.style.transform = '';
    };
  }, [uid]);

  return (
    <div className="cowork-home-orbit-shell relative h-full w-full overflow-visible">
      <svg
        ref={backRef}
        className="cowork-home-orbit-layer cowork-home-orbit-layer-back"
        viewBox={viewBox}
        aria-hidden
      />
      <div
        ref={bodyRef}
        className="relative z-[1] h-full w-full"
        style={{ transformOrigin: '50% 50%' }}
      >
        {children}
      </div>
      <svg
        ref={frontRef}
        className="cowork-home-orbit-layer cowork-home-orbit-layer-front"
        viewBox={viewBox}
        aria-hidden
      />
    </div>
  );
};

export default HomeLogoOrbitRibbons;
