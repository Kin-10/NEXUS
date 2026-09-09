import type { LocalizedText } from '../kit/constants';

export const ComputerUseKitId = {
  BuiltIn: 'computer-use',
} as const;
export type ComputerUseKitId = typeof ComputerUseKitId[keyof typeof ComputerUseKitId];

export const ComputerUseSkillId = {
  BuiltIn: 'computer-use',
} as const;
export type ComputerUseSkillId = typeof ComputerUseSkillId[keyof typeof ComputerUseSkillId];

export const ComputerUseKitBundle = {
  BuiltIn: 'https://ydhardwarebusiness.nosdn.127.net/2fa564627a3f1a0f3acedbc771d15f12.zip',
} as const;
export type ComputerUseKitBundle =
  typeof ComputerUseKitBundle[keyof typeof ComputerUseKitBundle];

export const ComputerUseKitBundleIntegrity = {
  Sha256: '8e214e06aef9d764d13351d9739ff0049d324dedecf29fa82d8d3a39d1e9da03',
  SizeBytes: 3149,
} as const;
export type ComputerUseKitBundleIntegrity =
  typeof ComputerUseKitBundleIntegrity[keyof typeof ComputerUseKitBundleIntegrity];

export const ComputerUseKitMetadata = {
  Name: {
    en: 'Computer Use',
    zh: '电脑操作',
  } satisfies LocalizedText,
  Description: {
    en: 'Control local Windows desktop applications with screenshots, accessibility text, clicks, typing, scrolling, and app launching.',
    zh: '通过截图、可访问性文本、点击、输入、滚动和应用启动来操作本地 Windows 桌面应用。',
  } satisfies LocalizedText,
  SkillName: {
    en: 'Computer Use',
    zh: '电脑操作',
  } satisfies LocalizedText,
  SkillDescription: {
    en: 'Use 百应 Computer Use tools to inspect and control Windows desktop applications.',
    zh: '使用百应电脑操作工具检查和操作 Windows 桌面应用。',
  } satisfies LocalizedText,
} as const;

export const ComputerUseBridgePath = {
  Activity: '/computer-use/activity',
} as const;
export type ComputerUseBridgePath =
  typeof ComputerUseBridgePath[keyof typeof ComputerUseBridgePath];

export const ComputerUseActivityState = {
  Active: 'active',
  /** @deprecated Tool-end idle no longer hides the overlay; use Stopped for Esc. */
  Idle: 'idle',
  /** User pressed Esc (or equivalent cancel). Hides bottom banner + ribbons. */
  Stopped: 'stopped',
} as const;
export type ComputerUseActivityState =
  typeof ComputerUseActivityState[keyof typeof ComputerUseActivityState];

export const ComputerUseToolName = {
  ListWindows: 'list_windows',
  ListApps: 'list_apps',
  LaunchApp: 'launch_app',
  GetWindow: 'get_window',
  GetWindowState: 'get_window_state',
  ActivateWindow: 'activate_window',
  Click: 'click',
  PressKey: 'press_key',
  TypeText: 'type_text',
  Scroll: 'scroll',
  Drag: 'drag',
  SetValue: 'set_value',
  PerformSecondaryAction: 'perform_secondary_action',
} as const;
export type ComputerUseToolName =
  typeof ComputerUseToolName[keyof typeof ComputerUseToolName];

const COMPUTER_USE_TOOL_NAME_SET = new Set<string>(Object.values(ComputerUseToolName));

export function isComputerUseToolName(toolName: string | undefined | null): boolean {
  if (!toolName) return false;
  const normalized = toolName.trim().toLowerCase();
  if (!normalized) return false;
  if (COMPUTER_USE_TOOL_NAME_SET.has(normalized)) return true;
  // OpenClaw may prefix MCP tools as "computer-use__click" / "mcp__computer-use__click".
  const suffix = normalized.split(/__+/).pop() || normalized;
  return COMPUTER_USE_TOOL_NAME_SET.has(suffix);
}
