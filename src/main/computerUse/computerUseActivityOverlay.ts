import { BrowserWindow, screen } from 'electron';
import fs from 'fs';
import path from 'path';

import {
  ComputerUseActivityState,
  type ComputerUseActivityState as ComputerUseActivityStateType,
} from '../../shared/computerUse/constants';
import {
  disposeNativeComputerUseStatusBannerHider,
  hideNativeComputerUseStatusBanner,
  startHidingNativeComputerUseStatusBanner,
  stopHidingNativeComputerUseStatusBanner,
} from './computerUseNativeBanner';
import {
  ComputerUseHelperConfig,
  getComputerUseHelperStateHome,
} from './computerUseRuntime';

type DisplayLike = ReturnType<typeof screen.getAllDisplays>[number];

export const ComputerUseActivityOverlayTiming = {
  FadeMs: 320,
  EscPollMs: 200,
  /** Give BaiYing overlay + native hide watcher a head start before helper paints. */
  PreHelperSettleMs: 120,
} as const;

export type ComputerUseActivityControllerOptions = {
  onVisibleChange: (visible: boolean) => void;
};

/**
 * Overlay stays up from first Active until explicit Stopped (Esc).
 * Idle heartbeats from tool end are ignored so the UI remains persistent.
 */
export class ComputerUseActivityController {
  private readonly onVisibleChange: (visible: boolean) => void;
  private visible = false;

  constructor(options: ComputerUseActivityControllerOptions) {
    this.onVisibleChange = options.onVisibleChange;
  }

  get isVisible(): boolean {
    return this.visible;
  }

  setActivity(state: ComputerUseActivityStateType): void {
    if (state === ComputerUseActivityState.Active) {
      this.setVisible(true);
      return;
    }
    if (state === ComputerUseActivityState.Stopped) {
      this.setVisible(false);
      return;
    }
    // Idle: keep showing until Esc / Stopped.
  }

  destroy(): void {
    this.setVisible(false);
  }

  private setVisible(next: boolean): void {
    if (this.visible === next) return;
    this.visible = next;
    this.onVisibleChange(next);
  }
}

const STATUS_BANNER_TEXT = ComputerUseHelperConfig.StatusBanner;

// Soft undulating edge ribbons (Apple Intelligence–style) + bottom white status.
const OVERLAY_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
    }
    #glow {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    .status {
      position: fixed;
      left: 50%;
      bottom: 40px;
      transform: translateX(-50%);
      z-index: 3;
      display: none;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      border-radius: 999px;
      background: #ffffff;
      color: #111111;
      font: 600 14px/1.35 "Segoe UI", "Microsoft YaHei UI", "PingFang SC", sans-serif;
      letter-spacing: 0.01em;
      white-space: nowrap;
      box-shadow:
        0 10px 30px rgba(15, 23, 42, 0.18),
        0 0 0 1px rgba(15, 23, 42, 0.06);
    }
    body.show-status .status {
      display: inline-flex;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.18);
      flex: 0 0 auto;
    }
  </style>
</head>
<body class="__STATUS_CLASS__">
  <canvas id="glow" aria-hidden="true"></canvas>
  <div class="status" role="status">
    <span class="status-dot" aria-hidden="true"></span>
    <span>${STATUS_BANNER_TEXT}</span>
  </div>
  <script>
(function () {
  var canvas = document.getElementById('glow');
  if (!canvas) return;
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var COLORS = [
    [255, 79, 216],
    [168, 85, 247],
    [91, 157, 255],
    [45, 255, 224],
    [255, 210, 74],
    [255, 120, 90],
    [255, 79, 216]
  ];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = 1;
  var w = 0;
  var h = 0;
  var raf = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function colorAt(t, alpha) {
    var n = COLORS.length - 1;
    var x = ((t % 1) + 1) % 1;
    var i = Math.floor(x * n);
    var f = x * n - i;
    var c0 = COLORS[i];
    var c1 = COLORS[Math.min(i + 1, n)];
    return 'rgba(' +
      Math.round(lerp(c0[0], c1[0], f)) + ',' +
      Math.round(lerp(c0[1], c1[1], f)) + ',' +
      Math.round(lerp(c0[2], c1[2], f)) + ',' +
      alpha + ')';
  }

  function wave(t, phase, freq, amp) {
    return Math.sin(t * freq + phase) * amp
      + Math.sin(t * freq * 1.7 + phase * 1.3) * amp * 0.45
      + Math.sin(t * freq * 0.55 + phase * 0.7) * amp * 0.7;
  }

  function sampleEdge(edge, u, time) {
    var breath = 0.78 + 0.22 * Math.sin(time * 1.05 + edge * 0.85);
    // Thickness swells along the edge like Apple Intelligence ribbons.
    var thickness = (14
      + wave(u * Math.PI * 2, time * 1.85 + edge, 1.05, 11)
      + wave(u * Math.PI * 2, time * 2.6 + edge * 1.7, 2.1, 5)
      + 8) * breath;
    var travel = wave(u * Math.PI * 2, time * 1.35 + edge * 1.2, 0.9, 7)
      + wave(u * Math.PI * 2, time * 2.2 + 1.6, 1.75, 3.2);
    var inward = Math.max(4, thickness * 0.42 + travel * 0.35);
    var x;
    var y;
    var nx = 0;
    var ny = 0;
    if (edge === 0) {
      x = u * w;
      y = inward;
      nx = 0;
      ny = 1;
    } else if (edge === 1) {
      x = w - inward;
      y = u * h;
      nx = -1;
      ny = 0;
    } else if (edge === 2) {
      x = u * w;
      y = h - inward;
      nx = 0;
      ny = -1;
    } else {
      x = inward;
      y = u * h;
      nx = 1;
      ny = 0;
    }
    return { x: x, y: y, nx: nx, ny: ny, thickness: Math.max(8, thickness) };
  }

  function fillBand(points, scale, alpha, colorShift) {
    if (points.length < 2) return;
    var outer = [];
    var inner = [];
    var i;
    for (i = 0; i < points.length; i++) {
      var p = points[i];
      var half = p.thickness * scale * 0.5;
      outer.push({ x: p.x - p.nx * half * 0.15, y: p.y - p.ny * half * 0.15 });
      inner.push({ x: p.x + p.nx * half, y: p.y + p.ny * half });
    }
    ctx.beginPath();
    ctx.moveTo(outer[0].x, outer[0].y);
    for (i = 1; i < outer.length; i++) ctx.lineTo(outer[i].x, outer[i].y);
    for (i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i].x, inner[i].y);
    ctx.closePath();

    var mid = points[Math.floor(points.length / 2)];
    var edgeIsHorizontal = Math.abs(points[0].ny) > 0.5;
    var grad = edgeIsHorizontal
      ? ctx.createLinearGradient(0, mid.y, w, mid.y)
      : ctx.createLinearGradient(mid.x, 0, mid.x, h);
    grad.addColorStop(0, colorAt(colorShift, alpha));
    grad.addColorStop(0.22, colorAt(colorShift + 0.16, alpha));
    grad.addColorStop(0.48, colorAt(colorShift + 0.34, alpha));
    grad.addColorStop(0.72, colorAt(colorShift + 0.52, alpha));
    grad.addColorStop(1, colorAt(colorShift + 0.7, alpha));
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function drawRibbon(edge, time, colorShift) {
    var steps = edge % 2 === 0
      ? Math.max(64, Math.floor(w / 8))
      : Math.max(64, Math.floor(h / 8));
    var points = [];
    var i;
    for (i = 0; i <= steps; i++) {
      points.push(sampleEdge(edge, i / steps, time));
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = colorAt(colorShift + 0.25, 0.55);
    ctx.shadowBlur = 28;
    fillBand(points, 1.85, 0.16, colorShift);
    ctx.shadowBlur = 16;
    fillBand(points, 1.25, 0.32, colorShift + 0.08);
    ctx.shadowBlur = 0;
    fillBand(points, 0.78, 0.55, colorShift + 0.14);

    // Bright core line that rides the undulating crest
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (i = 0; i < points.length - 1; i++) {
      var a = points[i];
      var b = points[i + 1];
      var u = i / (points.length - 1);
      ctx.beginPath();
      ctx.moveTo(a.x + a.nx * a.thickness * 0.12, a.y + a.ny * a.thickness * 0.12);
      ctx.lineTo(b.x + b.nx * b.thickness * 0.12, b.y + b.ny * b.thickness * 0.12);
      ctx.strokeStyle = colorAt(colorShift + u * 0.9, 0.95);
      ctx.lineWidth = lerp(a.thickness, b.thickness, 0.5) * 0.28;
      ctx.stroke();
    }
  }

  function frame(now) {
    var time = reduced ? 0 : now / 1000;
    ctx.clearRect(0, 0, w, h);
    var shift = reduced ? 0.15 : (time * 0.08) % 1;
    for (var edge = 0; edge < 4; edge++) {
      drawRibbon(edge, time, shift + edge * 0.12);
    }
    if (!reduced) {
      raf = requestAnimationFrame(frame);
    }
  }

  resize();
  window.addEventListener('resize', function () {
    resize();
    if (reduced) frame(0);
  });
  if (reduced) {
    frame(0);
  } else {
    raf = requestAnimationFrame(frame);
  }
  window.addEventListener('pagehide', function () {
    if (raf) cancelAnimationFrame(raf);
  });
})();
  </script>
</body>
</html>`;

function buildOverlayHtml(showStatus: boolean): string {
  return OVERLAY_HTML.replace('__STATUS_CLASS__', showStatus ? 'show-status' : '');
}

type OverlayWindowEntry = {
  displayId: number;
  showStatus: boolean;
  window: BrowserWindow;
};

let controller: ComputerUseActivityController | null = null;
let overlayEntries: OverlayWindowEntry[] = [];
let displayListenersAttached = false;
let desiredVisible = false;
let visibilityEpoch = 0;
let escWatcherTimer: ReturnType<typeof setInterval> | null = null;
let overlaySessionStartedAt = 0;
let ensureOverlayChain: Promise<void> = Promise.resolve();

function isSupportedPlatform(): boolean {
  return process.platform === 'win32';
}

function destroyOverlayWindows(): void {
  for (const entry of overlayEntries) {
    if (!entry.window.isDestroyed()) {
      entry.window.destroy();
    }
  }
  overlayEntries = [];
}

/** Keep at most one overlay window per display (prewarm + Active can race). */
function dedupeOverlayWindows(): void {
  const byDisplay = new Map<number, OverlayWindowEntry>();
  for (const entry of overlayEntries) {
    if (entry.window.isDestroyed()) continue;
    const existing = byDisplay.get(entry.displayId);
    if (!existing) {
      byDisplay.set(entry.displayId, entry);
      continue;
    }
    // Prefer the window that carries the status bar when colliding.
    const keep = entry.showStatus && !existing.showStatus ? entry : existing;
    const drop = keep === existing ? entry : existing;
    if (!drop.window.isDestroyed()) {
      drop.window.destroy();
    }
    byDisplay.set(entry.displayId, keep);
  }
  overlayEntries = Array.from(byDisplay.values());
}

function listFilesRecursive(rootDir: string): string[] {
  if (!fs.existsSync(rootDir)) return [];
  const out: string[] = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        out.push(fullPath);
      }
    }
  }
  return out;
}

function hasFreshEscInterruptMarker(sinceMs: number): boolean {
  const interruptsRoot = path.join(
    getComputerUseHelperStateHome(),
    'cache',
    'computer-use',
    'interrupts',
  );
  for (const filePath of listFilesRecursive(interruptsRoot)) {
    try {
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs >= sinceMs - 1_000) {
        return true;
      }
    } catch {
      // ignore
    }
  }
  return false;
}

function stopEscInterruptWatcher(): void {
  if (escWatcherTimer) {
    clearInterval(escWatcherTimer);
    escWatcherTimer = null;
  }
}

function startEscInterruptWatcher(): void {
  if (!isSupportedPlatform()) return;
  stopEscInterruptWatcher();
  overlaySessionStartedAt = Date.now();
  escWatcherTimer = setInterval(() => {
    if (!desiredVisible) return;
    if (hasFreshEscInterruptMarker(overlaySessionStartedAt)) {
      console.log('[ComputerUseOverlay] Esc interrupt marker detected, dismissing overlay');
      reportComputerUseActivity(ComputerUseActivityState.Stopped);
    }
  }, ComputerUseActivityOverlayTiming.EscPollMs);
}

async function createOverlayWindowForDisplay(
  display: DisplayLike,
  showStatus: boolean,
): Promise<OverlayWindowEntry | null> {
  const { x, y, width, height } = display.bounds;
  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    skipTaskbar: true,
    focusable: false,
    show: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    thickFrame: false,
    roundedCorners: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      partition: `computer-use-glow-v13-${display.id}-${showStatus ? 'status' : 'glow'}`,
    },
  });

  win.setMenu(null);
  try {
    win.setAlwaysOnTop(true, 'screen-saver', 1);
  } catch {
    win.setAlwaysOnTop(true);
  }
  try {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  } catch {
    // Unsupported on some Windows builds.
  }
  win.setIgnoreMouseEvents(true, { forward: true });

  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(buildOverlayHtml(showStatus))}`);
  } catch (error) {
    console.warn('[ComputerUseOverlay] failed to load glow window:', error);
    if (!win.isDestroyed()) {
      win.destroy();
    }
    return null;
  }

  win.on('closed', () => {
    overlayEntries = overlayEntries.filter(entry => entry.window !== win);
  });

  return { displayId: display.id, showStatus, window: win };
}

async function ensureOverlayWindowsImpl(): Promise<void> {
  if (!isSupportedPlatform()) return;

  const displays = screen.getAllDisplays();
  const primaryId = screen.getPrimaryDisplay().id;
  const wantedIds = new Set(displays.map(display => display.id));
  const stale = overlayEntries.filter(entry => !wantedIds.has(entry.displayId) || entry.window.isDestroyed());
  for (const entry of stale) {
    if (!entry.window.isDestroyed()) {
      entry.window.destroy();
    }
  }
  overlayEntries = overlayEntries.filter(entry => wantedIds.has(entry.displayId) && !entry.window.isDestroyed());
  dedupeOverlayWindows();

  // Recreate any window whose status-bar role no longer matches (primary-only bar).
  for (const entry of [...overlayEntries]) {
    const shouldShowStatus = entry.displayId === primaryId;
    if (entry.showStatus === shouldShowStatus) continue;
    if (!entry.window.isDestroyed()) {
      entry.window.destroy();
    }
    overlayEntries = overlayEntries.filter(item => item.window !== entry.window);
  }

  const existingIds = new Set(overlayEntries.map(entry => entry.displayId));
  for (const display of displays) {
    if (existingIds.has(display.id)) {
      const entry = overlayEntries.find(item => item.displayId === display.id);
      if (entry && !entry.window.isDestroyed()) {
        const { x, y, width, height } = display.bounds;
        entry.window.setBounds({ x, y, width, height });
      }
      continue;
    }
    const created = await createOverlayWindowForDisplay(display, display.id === primaryId);
    if (created) {
      overlayEntries.push(created);
      existingIds.add(display.id);
    }
  }
  dedupeOverlayWindows();
}

function ensureOverlayWindows(): Promise<void> {
  ensureOverlayChain = ensureOverlayChain
    .then(() => ensureOverlayWindowsImpl())
    .catch((error) => {
      console.warn('[ComputerUseOverlay] ensureOverlayWindows failed:', error);
    });
  return ensureOverlayChain;
}

function setOverlayWindowsVisible(visible: boolean): void {
  desiredVisible = visible;
  console.log(
    `[ComputerUseOverlay] setVisible=${visible} windows=${overlayEntries.length}`,
  );
  if (visible) {
    startHidingNativeComputerUseStatusBanner();
    hideNativeComputerUseStatusBanner();
    startEscInterruptWatcher();
  } else {
    stopEscInterruptWatcher();
    stopHidingNativeComputerUseStatusBanner();
  }
  for (const entry of overlayEntries) {
    if (entry.window.isDestroyed()) continue;
    if (visible) {
      try {
        entry.window.setOpacity(1);
      } catch {
        // Older Electron builds may not support setOpacity.
      }
      if (!entry.window.isVisible()) {
        entry.window.showInactive();
      }
      const bounds = entry.window.getBounds();
      entry.window.setBounds({ ...bounds, width: bounds.width + 1 });
      entry.window.setBounds(bounds);
      try {
        entry.window.setAlwaysOnTop(true, 'screen-saver', 1);
      } catch {
        entry.window.setAlwaysOnTop(true);
      }
    } else if (entry.window.isVisible()) {
      const epoch = visibilityEpoch;
      try {
        entry.window.setOpacity(0);
      } catch {
        // Fall through to hide.
      }
      setTimeout(() => {
        if (epoch !== visibilityEpoch || desiredVisible || entry.window.isDestroyed()) {
          return;
        }
        entry.window.hide();
        try {
          entry.window.setOpacity(1);
        } catch {
          // ignore
        }
      }, ComputerUseActivityOverlayTiming.FadeMs);
    }
  }
}

async function rebuildOverlaysForDisplayChange(): Promise<void> {
  if (!controller) return;
  await ensureOverlayWindows();
  if (desiredVisible) {
    setOverlayWindowsVisible(true);
  }
}

function ensureDisplayListeners(): void {
  if (displayListenersAttached || !isSupportedPlatform()) return;
  displayListenersAttached = true;
  const refresh = () => {
    void rebuildOverlaysForDisplayChange();
  };
  screen.on('display-added', refresh);
  screen.on('display-removed', refresh);
  screen.on('display-metrics-changed', refresh);
}

function ensureController(): ComputerUseActivityController {
  if (!controller) {
    ensureDisplayListeners();
    controller = new ComputerUseActivityController({
      onVisibleChange: (visible) => {
        const epoch = ++visibilityEpoch;
        void (async () => {
          try {
            if (visible) {
              // Hide native UI immediately — do not wait for window create.
              startHidingNativeComputerUseStatusBanner();
              hideNativeComputerUseStatusBanner();
              // Reuse existing overlay windows when possible for first-frame speed.
              if (overlayEntries.length > 0) {
                setOverlayWindowsVisible(true);
              }
              await ensureOverlayWindows();
            }
            if (epoch !== visibilityEpoch) return;
            setOverlayWindowsVisible(visible);
          } catch (error) {
            console.warn('[ComputerUseOverlay] failed to update visibility:', error);
          }
        })();
      },
    });
  }
  return controller;
}

export function reportComputerUseActivity(state: ComputerUseActivityStateType): void {
  if (!isSupportedPlatform()) return;
  console.log(`[ComputerUseOverlay] activity=${state}`);
  if (state === ComputerUseActivityState.Active) {
    // Kick the hide watcher before any async overlay work.
    startHidingNativeComputerUseStatusBanner();
  }
  ensureController().setActivity(state);
}

/** Create hidden overlay windows early so the first Active paint is instant. */
export function prewarmComputerUseActivityOverlay(): void {
  if (!isSupportedPlatform()) return;
  ensureController();
  void ensureOverlayWindows().catch((error) => {
    console.debug(
      '[ComputerUseOverlay] prewarm failed:',
      error instanceof Error ? error.message : String(error),
    );
  });
}

export function destroyComputerUseActivityOverlay(): void {
  visibilityEpoch += 1;
  stopEscInterruptWatcher();
  disposeNativeComputerUseStatusBannerHider();
  controller?.destroy();
  controller = null;
  desiredVisible = false;
  destroyOverlayWindows();
}
