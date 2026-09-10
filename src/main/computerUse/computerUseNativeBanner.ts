import { type ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import { ComputerUseNativeStatusWindow } from './computerUseRuntime';

const HIDE_POLL_MS = 25;
const WATCH_SCRIPT_NAME = 'hide-native-status-banner-watch.ps1';

/**
 * Persistent watcher: hide every LobsterAI Computer Use status HWND as soon as it
 * appears. Spawning PowerShell per poll is too slow and lets the top bar / frame flash.
 */
const WATCH_SCRIPT = `# Continuously hide native Computer Use status overlay HWNDs.
$ErrorActionPreference = 'SilentlyContinue'
if (-not ('BaiYingCuBannerEnumV5' -as [type])) {
  Add-Type @"
using System;
using System.Text;
using System.Diagnostics;
using System.Runtime.InteropServices;
public static class BaiYingCuBannerEnumV5 {
  public delegate bool EnumProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr lParam);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetClassName(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder sb, int max);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  [DllImport("user32.dll")] public static extern bool MoveWindow(
    IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(
    IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint pid);
  const uint SWP_NOZORDER = 0x0004;
  const uint SWP_NOACTIVATE = 0x0010;
  const uint SWP_HIDEWINDOW = 0x0080;
  static bool IsHelperProcess(uint pid) {
    try {
      var p = Process.GetProcessById((int)pid);
      var name = (p.ProcessName ?? "").ToLowerInvariant();
      return name.Contains("lobster-computer-use")
        || name.Contains("baiying-computer-use");
    } catch { return false; }
  }
  static void Relocate(IntPtr h) {
    ShowWindow(h, 0);
    MoveWindow(h, -32000, -32000, 1, 1, false);
    SetWindowPos(h, IntPtr.Zero, -32000, -32000, 1, 1,
      SWP_HIDEWINDOW | SWP_NOZORDER | SWP_NOACTIVATE);
  }
  public static int HideAll(string className, string title) {
    int hidden = 0;
    EnumWindows((h, l) => {
      var cls = new StringBuilder(256);
      GetClassName(h, cls, 256);
      var text = new StringBuilder(256);
      GetWindowText(h, text, 256);
      var c = cls.ToString();
      var t = text.ToString();
      uint pid = 0;
      GetWindowThreadProcessId(h, out pid);
      bool match = c == className
        || t == title
        || c.IndexOf("ComputerUseStatusOverlay", StringComparison.OrdinalIgnoreCase) >= 0
        || c.IndexOf("LobsterAIComputerUse", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("Computer Use Status Overlay", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("using your computer", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("Esc to cancel", StringComparison.OrdinalIgnoreCase) >= 0
        || t.IndexOf("正在接管你的电脑", StringComparison.Ordinal) >= 0
        || t.IndexOf("正在使用你的电脑", StringComparison.Ordinal) >= 0
        || t.IndexOf("按Esc键退出", StringComparison.Ordinal) >= 0
        || (IsHelperProcess(pid) && IsWindowVisible(h) && (
              c.IndexOf("Overlay", StringComparison.OrdinalIgnoreCase) >= 0
              || c.IndexOf("Status", StringComparison.OrdinalIgnoreCase) >= 0
              || t.IndexOf("Computer Use", StringComparison.OrdinalIgnoreCase) >= 0
              || t.IndexOf("正在接管", StringComparison.Ordinal) >= 0
              || t.IndexOf("正在使用", StringComparison.Ordinal) >= 0
              || t.IndexOf("按Esc", StringComparison.Ordinal) >= 0
           ));
      if (match) {
        Relocate(h);
        hidden++;
      }
      return true;
    }, IntPtr.Zero);
    return hidden;
  }
}
"@
}
$className = '${ComputerUseNativeStatusWindow.ClassName}'
$title = '${ComputerUseNativeStatusWindow.WindowName}'
while ($true) {
  [BaiYingCuBannerEnumV5]::HideAll($className, $title) | Out-Null
  Start-Sleep -Milliseconds ${HIDE_POLL_MS}
}
`;

let watchChild: ChildProcessWithoutNullStreams | null = null;
let scriptPathCache: string | null = null;
let burstTimers: Array<ReturnType<typeof setTimeout>> = [];

function resolveWatchScriptPath(): string {
  if (scriptPathCache && fs.existsSync(scriptPathCache)) {
    const existing = fs.readFileSync(scriptPathCache, 'utf8');
    if (existing === WATCH_SCRIPT) return scriptPathCache;
  }
  const dir = path.join(app.getPath('userData'), 'computer-use', 'bin');
  fs.mkdirSync(dir, { recursive: true });
  const scriptPath = path.join(dir, WATCH_SCRIPT_NAME);
  fs.writeFileSync(scriptPath, WATCH_SCRIPT, 'utf8');
  scriptPathCache = scriptPath;
  return scriptPath;
}

function clearBurstTimers(): void {
  for (const timer of burstTimers) clearTimeout(timer);
  burstTimers = [];
}

function spawnWatchProcess(): void {
  if (process.platform !== 'win32') return;
  if (watchChild && !watchChild.killed) return;

  let scriptPath: string;
  try {
    scriptPath = resolveWatchScriptPath();
  } catch (error) {
    console.debug(
      '[ComputerUseOverlay] failed to prepare native banner watch script:',
      error instanceof Error ? error.message : String(error),
    );
    return;
  }

  try {
    watchChild = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath],
      {
        windowsHide: true,
        stdio: 'ignore',
      },
    );
    watchChild.on('exit', () => {
      watchChild = null;
    });
    watchChild.on('error', (error) => {
      console.debug('[ComputerUseOverlay] native banner watch failed:', error.message);
      watchChild = null;
    });
  } catch (error) {
    console.debug(
      '[ComputerUseOverlay] failed to start native banner watch:',
      error instanceof Error ? error.message : String(error),
    );
    watchChild = null;
  }
}

function killWatchProcess(): void {
  if (!watchChild) return;
  const child = watchChild;
  watchChild = null;
  try {
    child.kill();
  } catch {
    // ignore
  }
}

/** One-shot hide via a short-lived PowerShell call (used for burst / final sweep). */
export function hideNativeComputerUseStatusBanner(): void {
  if (process.platform !== 'win32') return;
  // Prefer the persistent watcher; still poke it awake if needed.
  spawnWatchProcess();
}

/**
 * Start suppressing the native top banner / screen frame for the session.
 * Starts a persistent 25ms hide loop and a short burst of restarts so the
 * first helper paint is caught even if PowerShell warm-up lags.
 */
export function startHidingNativeComputerUseStatusBanner(): void {
  if (process.platform !== 'win32') return;
  spawnWatchProcess();
  clearBurstTimers();
  // Burst-restart the watcher briefly so a failed first spawn still recovers.
  for (const delayMs of [0, 16, 32, 64, 120, 200, 320]) {
    burstTimers.push(setTimeout(() => {
      spawnWatchProcess();
    }, delayMs));
  }
}

export function stopHidingNativeComputerUseStatusBanner(): void {
  clearBurstTimers();
  killWatchProcess();
}

export function disposeNativeComputerUseStatusBannerHider(): void {
  stopHidingNativeComputerUseStatusBanner();
}
