import { BrowserWindow, globalShortcut, screen } from 'electron';
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
} as const;

const RIBBON_PX = 10;
const BANNER_HEIGHT = 44;

export type ComputerUseActivityControllerOptions = {
  onVisibleChange: (visible: boolean) => void;
};

/**
 * Esc-latched activity controller:
 * - active → show and keep showing
 * - idle → ignored (tools finishing must not dismiss UI)
 * - stopped → hide immediately (Esc / cancel)
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
    // Idle from tool completion is intentionally ignored.
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

/** Opaque ribbon strip — avoids Windows DWM white-edge artifacts from fullscreen transparent windows. */
function buildRibbonHtml(axis: 'x' | 'y'): string {
  const gradient = axis === 'x'
    ? `linear-gradient(90deg,#ff4fd8 0%,#5b9dff 25%,#2dffe0 50%,#ffd24a 75%,#ff4fd8 100%)`
    : `linear-gradient(180deg,#ff4fd8 0%,#5b9dff 25%,#2dffe0 50%,#ffd24a 75%,#ff4fd8 100%)`;
  const size = axis === 'x' ? '220% 100%' : '100% 220%';
  const flow = axis === 'x' ? 'flow-x' : 'flow-y';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#111;}
.core{position:absolute;inset:0;background:${gradient};background-size:${size};animation:${flow} 2.8s linear infinite,pulse 2.2s ease-in-out infinite;}
@keyframes flow-x{0%{background-position:0% 50%}100%{background-position:220% 50%}}
@keyframes flow-y{0%{background-position:50% 0%}100%{background-position:50% 220%}}
@keyframes pulse{0%,100%{opacity:.9}50%{opacity:1}}
@media (prefers-reduced-motion:reduce){.core{animation:none}}
</style></head><body><div class="core"></div></body></html>`;
}

const BANNER_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #ffffff;
    }
    .status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 0 20px;
      color: #111111;
      font: 600 14px/1.35 "Segoe UI", "Microsoft YaHei UI", "PingFang SC", sans-serif;
      letter-spacing: 0.01em;
      white-space: nowrap;
      border-top: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.12);
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
<body>
  <div class="status" role="status">
    <span class="status-dot" aria-hidden="true"></span>
    <span>${STATUS_BANNER_TEXT}</span>
  </div>
</body>
</html>`;

type OverlayPart = 'top' | 'right' | 'bottom' | 'left' | 'banner';

type OverlayWindowEntry = {
  displayId: number;
  part: OverlayPart;
  window: BrowserWindow;
};

let controller: ComputerUseActivityController | null = null;
let overlayEntries: OverlayWindowEntry[] = [];
let displayListenersAttached = false;
let desiredVisible = false;
let visibilityEpoch = 0;

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

function boundsForPart(
  display: DisplayLike,
  part: OverlayPart,
): { x: number; y: number; width: number; height: number } {
  const { x, y, width, height } = display.bounds;
  switch (part) {
    case 'top':
      return { x, y, width, height: RIBBON_PX };
    case 'bottom':
      return { x, y: y + height - RIBBON_PX, width, height: RIBBON_PX };
    case 'left':
      return { x, y, width: RIBBON_PX, height };
    case 'right':
      return { x: x + width - RIBBON_PX, y, width: RIBBON_PX, height };
    case 'banner':
      return {
        x,
        y: y + height - RIBBON_PX - BANNER_HEIGHT,
        width,
        height: BANNER_HEIGHT,
      };
    default: {
      const _exhaustive: never = part;
      return _exhaustive;
    }
  }
}

function htmlForPart(part: OverlayPart): string {
  switch (part) {
    case 'top':
    case 'bottom':
      return buildRibbonHtml('x');
    case 'left':
    case 'right':
      return buildRibbonHtml('y');
    case 'banner':
      return BANNER_HTML;
    default: {
      const _exhaustive: never = part;
      return _exhaustive;
    }
  }
}

async function createOverlayPartWindow(
  display: DisplayLike,
  part: OverlayPart,
): Promise<OverlayWindowEntry | null> {
  const bounds = boundsForPart(display, part);
  // Opaque strip windows: no transparent:true — that is what produced white perimeter bars on Windows.
  const win = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: false,
    backgroundColor: part === 'banner' ? '#ffffff' : '#111111',
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
      partition: `computer-use-glow-v4-${display.id}-${part}`,
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
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlForPart(part))}`);
  } catch (error) {
    console.warn(`[ComputerUseOverlay] failed to load ${part} window:`, error);
    if (!win.isDestroyed()) {
      win.destroy();
    }
    return null;
  }

  win.on('closed', () => {
    overlayEntries = overlayEntries.filter(entry => entry.window !== win);
  });

  return { displayId: display.id, part, window: win };
}

const OVERLAY_PARTS: OverlayPart[] = ['top', 'right', 'bottom', 'left', 'banner'];

async function ensureOverlayWindows(): Promise<void> {
  if (!isSupportedPlatform()) return;

  const displays = screen.getAllDisplays();
  const wantedKeys = new Set(
    displays.flatMap(display => OVERLAY_PARTS.map(part => `${display.id}:${part}`)),
  );
  const stale = overlayEntries.filter(
    entry => !wantedKeys.has(`${entry.displayId}:${entry.part}`) || entry.window.isDestroyed(),
  );
  for (const entry of stale) {
    if (!entry.window.isDestroyed()) {
      entry.window.destroy();
    }
  }
  overlayEntries = overlayEntries.filter(
    entry => wantedKeys.has(`${entry.displayId}:${entry.part}`) && !entry.window.isDestroyed(),
  );

  const existingKeys = new Set(
    overlayEntries.map(entry => `${entry.displayId}:${entry.part}`),
  );
  for (const display of displays) {
    for (const part of OVERLAY_PARTS) {
      const key = `${display.id}:${part}`;
      if (existingKeys.has(key)) {
        const entry = overlayEntries.find(
          item => item.displayId === display.id && item.part === part,
        );
        if (entry && !entry.window.isDestroyed()) {
          entry.window.setBounds(boundsForPart(display, part));
        }
        continue;
      }
      const created = await createOverlayPartWindow(display, part);
      if (created) {
        overlayEntries.push(created);
      }
    }
  }
}

function setOverlayWindowsVisible(visible: boolean): void {
  desiredVisible = visible;
  console.log(
    `[ComputerUseOverlay] setVisible=${visible} windows=${overlayEntries.length}`,
  );
  if (visible) {
    startHidingNativeComputerUseStatusBanner();
    hideNativeComputerUseStatusBanner();
    startEscCancelWatchers();
  } else {
    stopEscCancelWatchers();
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

function hasHelperInterruptMarker(): boolean {
  try {
    const interruptsRoot = path.join(
      getComputerUseHelperStateHome(),
      'cache',
      'computer-use',
      'interrupts',
    );
    if (!fs.existsSync(interruptsRoot)) return false;
    const sessions = fs.readdirSync(interruptsRoot);
    for (const session of sessions) {
      const sessionDir = path.join(interruptsRoot, session);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(sessionDir);
      } catch {
        continue;
      }
      if (stat.isFile()) return true;
      if (!stat.isDirectory()) continue;
      if (fs.readdirSync(sessionDir).length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function dismissComputerUseOverlayFromEsc(source: string): void {
  console.log(`[ComputerUseOverlay] dismissed by Esc (${source})`);
  reportComputerUseActivity(ComputerUseActivityState.Stopped);
}

let escPollTimer: ReturnType<typeof setInterval> | null = null;
let escShortcutRegistered = false;

function startEscCancelWatchers(): void {
  if (!escShortcutRegistered) {
    try {
      const ok = globalShortcut.register('Escape', () => {
        dismissComputerUseOverlayFromEsc('global-shortcut');
      });
      escShortcutRegistered = ok;
      if (!ok) {
        console.warn('[ComputerUseOverlay] failed to register Escape shortcut');
      }
    } catch (error) {
      console.warn('[ComputerUseOverlay] Escape shortcut registration error:', error);
    }
  }

  if (escPollTimer) return;
  escPollTimer = setInterval(() => {
    if (!desiredVisible) return;
    hideNativeComputerUseStatusBanner();
    if (hasHelperInterruptMarker()) {
      dismissComputerUseOverlayFromEsc('helper-interrupt');
    }
  }, ComputerUseActivityOverlayTiming.EscPollMs);
}

function stopEscCancelWatchers(): void {
  if (escPollTimer) {
    clearInterval(escPollTimer);
    escPollTimer = null;
  }
  if (escShortcutRegistered) {
    try {
      globalShortcut.unregister('Escape');
    } catch {
      // ignore
    }
    escShortcutRegistered = false;
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
              destroyOverlayWindows();
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
  ensureController().setActivity(state);
}

export function destroyComputerUseActivityOverlay(): void {
  visibilityEpoch += 1;
  stopEscCancelWatchers();
  disposeNativeComputerUseStatusBannerHider();
  controller?.destroy();
  controller = null;
  desiredVisible = false;
  destroyOverlayWindows();
}
