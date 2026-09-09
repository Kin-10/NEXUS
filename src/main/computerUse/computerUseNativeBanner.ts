import { execFile } from 'child_process';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import { ComputerUseNativeStatusWindow } from './computerUseRuntime';

const HIDE_POLL_MS = 100;
const HIDE_AFTER_IDLE_MS = 8_000;
const HIDE_SCRIPT_NAME = 'hide-native-status-banner.ps1';

const HIDE_SCRIPT = `# Hide every LobsterAI / Computer Use native status overlay HWND.
$ErrorActionPreference = 'SilentlyContinue'
if (-not ('BaiYingCuBannerEnum' -as [type])) {
  Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class BaiYingCuBannerEnum {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetClassName(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(
    IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  const uint SWP_NOSIZE = 0x0001;
  const uint SWP_NOZORDER = 0x0004;
  const uint SWP_HIDEWINDOW = 0x0080;
  const uint SWP_NOACTIVATE = 0x0010;
  public static int HideAll(string className, string title) {
    int hidden = 0;
    EnumWindows((h, l) => {
      var cls = new StringBuilder(256);
      GetClassName(h, cls, 256);
      var text = new StringBuilder(256);
      GetWindowText(h, text, 256);
      var c = cls.ToString();
      var t = text.ToString();
      bool match = c == className
        || t == title
        || c.IndexOf("ComputerUseStatusOverlay", StringComparison.OrdinalIgnoreCase) >= 0
        || c.IndexOf("LobsterAIComputerUse", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("using your computer", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("Status Overlay", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("正在接管你的电脑", StringComparison.Ordinal) >= 0
        || t.IndexOf("正在使用你的电脑", StringComparison.Ordinal) >= 0;
      if (match) {
        ShowWindow(h, 0);
        SetWindowPos(h, IntPtr.Zero, -32000, -32000, 0, 0,
          SWP_HIDEWINDOW | SWP_NOSIZE | SWP_NOZORDER | SWP_NOACTIVATE);
        hidden++;
      }
      return true;
    }, IntPtr.Zero);
    return hidden;
  }
}
"@
}
[BaiYingCuBannerEnum]::HideAll(
  '${ComputerUseNativeStatusWindow.ClassName}',
  '${ComputerUseNativeStatusWindow.WindowName}'
) | Out-Null
`;

let hideTimer: ReturnType<typeof setInterval> | null = null;
let afterIdleTimer: ReturnType<typeof setTimeout> | null = null;
let hideInFlight = false;
let scriptPathCache: string | null = null;

function resolveHideScriptPath(): string {
  if (scriptPathCache) return scriptPathCache;
  const dir = path.join(app.getPath('userData'), 'computer-use', 'bin');
  fs.mkdirSync(dir, { recursive: true });
  const scriptPath = path.join(dir, HIDE_SCRIPT_NAME);
  const existing = fs.existsSync(scriptPath) ? fs.readFileSync(scriptPath, 'utf8') : '';
  if (existing !== HIDE_SCRIPT) {
    fs.writeFileSync(scriptPath, HIDE_SCRIPT, 'utf8');
  }
  scriptPathCache = scriptPath;
  return scriptPath;
}

/**
 * Hide every native helper status banner window.
 * Multi-monitor setups create one HWND per display; FindWindow only returns one.
 */
export function hideNativeComputerUseStatusBanner(): void {
  if (process.platform !== 'win32') return;
  if (hideInFlight) return;
  hideInFlight = true;

  let scriptPath: string;
  try {
    scriptPath = resolveHideScriptPath();
  } catch (error) {
    hideInFlight = false;
    console.debug(
      '[ComputerUseOverlay] failed to prepare native banner hide script:',
      error instanceof Error ? error.message : String(error),
    );
    return;
  }

  execFile(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
    {
      windowsHide: true,
      timeout: 4_000,
    },
    (error) => {
      hideInFlight = false;
      if (error) {
        console.debug('[ComputerUseOverlay] hide native banner failed:', error.message);
      }
    },
  );
}

export function startHidingNativeComputerUseStatusBanner(): void {
  if (process.platform !== 'win32') return;
  if (afterIdleTimer) {
    clearTimeout(afterIdleTimer);
    afterIdleTimer = null;
  }
  hideNativeComputerUseStatusBanner();
  if (hideTimer) return;
  // Helper recreates one banner per display on each tool call.
  hideTimer = setInterval(() => {
    hideNativeComputerUseStatusBanner();
  }, HIDE_POLL_MS);
}

/**
 * Keep sweeping native top banners briefly after BaiYing overlay hides,
 * so a leftover helper HWND does not stick around after the turn ends.
 */
export function stopHidingNativeComputerUseStatusBanner(): void {
  if (afterIdleTimer) {
    clearTimeout(afterIdleTimer);
    afterIdleTimer = null;
  }
  hideNativeComputerUseStatusBanner();
  afterIdleTimer = setTimeout(() => {
    afterIdleTimer = null;
    if (hideTimer) {
      clearInterval(hideTimer);
      hideTimer = null;
    }
    // Final sweep in case helper paints one last frame.
    hideNativeComputerUseStatusBanner();
  }, HIDE_AFTER_IDLE_MS);
}

export function disposeNativeComputerUseStatusBannerHider(): void {
  if (afterIdleTimer) {
    clearTimeout(afterIdleTimer);
    afterIdleTimer = null;
  }
  if (hideTimer) {
    clearInterval(hideTimer);
    hideTimer = null;
  }
  hideNativeComputerUseStatusBanner();
}
