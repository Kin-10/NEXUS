/**
 * TEMPORARY local/dev switch: disable product login UI and auth gates.
 *
 * When true:
 * - authService injects a local bypass session (treated as logged in)
 * - login / logout browser flows are no-ops
 * - sidebar login entry is hidden
 * - first-launch welcome login gate is skipped
 *
 * Flip back to false before shipping or when real auth is needed again.
 */
export const LOGIN_FEATURE_DISABLED = true;

export function isLoginFeatureEnabled(): boolean {
  return !LOGIN_FEATURE_DISABLED;
}
