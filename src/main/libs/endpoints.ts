import { app } from 'electron';

import { HtmlSharePublicRoute } from '../../shared/htmlShare/constants';
import type { SqliteStore } from '../sqliteStore';
import { resolveDevelopmentServerBaseUrl } from './developmentServerBaseUrl';

let cachedTestMode: boolean | null = null;
let loggedDevelopmentServerBaseUrl: string | null = null;
let loggedDevelopmentOvermindBaseUrl: string | null = null;

/**
 * Read testMode from store and cache it.
 * Call once at startup and again whenever app_config changes.
 */
export function refreshEndpointsTestMode(store: SqliteStore): void {
  const appConfig = store.get<any>('app_config');
  cachedTestMode = appConfig?.app?.testMode === true;
}

/**
 * Whether the app is in test mode.
 * Uses cached value after init; falls back to !app.isPackaged before init.
 */
export const isTestModeEnabled = (): boolean => {
  return cachedTestMode ?? !app.isPackaged;
};

/**
 * Server API base URL — switches based on testMode.
 * Used for auth exchange/refresh, models, proxy, etc.
 */
export const getServerApiBaseUrl = (): string => {
  const defaultBaseUrl = isTestModeEnabled()
    ? 'https://lobsterai-server.inner.youdao.com'
    : 'https://lobsterai-server.youdao.com';
  const serverBaseUrl = resolveDevelopmentServerBaseUrl({
    defaultBaseUrl,
    developmentOverride: process.env.LOBSTER_SERVER_BASE_URL,
    isDev: process.env.NODE_ENV === 'development',
    isPackaged: app.isPackaged,
  });
  if (serverBaseUrl !== defaultBaseUrl
      && loggedDevelopmentServerBaseUrl !== serverBaseUrl) {
    console.warn(
      `[Endpoints] routing all Lobster server traffic to development origin ${serverBaseUrl}`,
    );
    loggedDevelopmentServerBaseUrl = serverBaseUrl;
  }
  return serverBaseUrl;
};

/**
 * Overmind openapi origin. Prefers LOBSTER_OVERMIND_BASE_URL, then falls back to
 * LOBSTER_SERVER_BASE_URL in development so BYServer can host both API + Overmind.
 */
export const getOvermindBaseUrl = (): string => {
  const defaultBaseUrl = 'https://api-overmind.youdao.com';
  const preferred = process.env.LOBSTER_OVERMIND_BASE_URL?.trim()
    || process.env.LOBSTER_SERVER_BASE_URL?.trim();
  if (!preferred) return defaultBaseUrl;

  try {
    const resolved = resolveDevelopmentServerBaseUrl({
      defaultBaseUrl,
      developmentOverride: preferred,
      isDev: process.env.NODE_ENV === 'development',
      isPackaged: app.isPackaged,
    });
    if (resolved !== defaultBaseUrl && loggedDevelopmentOvermindBaseUrl !== resolved) {
      console.warn(`[Endpoints] routing Overmind traffic to development origin ${resolved}`);
      loggedDevelopmentOvermindBaseUrl = resolved;
    }
    return resolved;
  } catch (error) {
    console.warn('[Endpoints] invalid Overmind development override, using default:', error);
    return defaultBaseUrl;
  }
};

const overmindPath = (key: string): string => {
  const env = isTestModeEnabled() ? 'test' : 'prod';
  return `${getOvermindBaseUrl()}/openapi/get/luna/hardware/lobsterai/${env}/${key}`;
};

export const getHtmlSharePublicBaseUrl = (): string => {
  return `${getServerApiBaseUrl()}${HtmlSharePublicRoute.Root}`;
};

export const getUpdateCheckUrl = (): string => overmindPath('update');

export const getManualUpdateCheckUrl = (): string => overmindPath('update-manual');

export const getFallbackDownloadUrl = (): string => (
  isTestModeEnabled()
    ? 'https://lobsterai.inner.youdao.com/#/download-list'
    : 'https://lobsterai.youdao.com/#/download-list'
);

export const getSkillStoreUrl = (): string => overmindPath('skill-store');

export const getLoginOvermindUrl = (): string => overmindPath('login-url');

export const getMcpMarketplaceUrl = (): string => overmindPath('mcp-marketplace');

/**
 * Portal web base (`.../portal#`). In local BYServer mode, points at the local
 * portal pages under `${LOBSTER_SERVER_BASE_URL}/portal#`.
 */
export const getPortalBaseUrl = (): string => {
  const defaultBaseUrl = isTestModeEnabled()
    ? 'https://lobsterai.inner.youdao.com/portal#'
    : 'https://lobsterai.youdao.com/portal#';
  const preferred = process.env.LOBSTER_PORTAL_BASE_URL?.trim()
    || process.env.LOBSTER_SERVER_BASE_URL?.trim();
  if (!preferred) return defaultBaseUrl;

  try {
    const origin = resolveDevelopmentServerBaseUrl({
      defaultBaseUrl: 'https://lobsterai.youdao.com',
      developmentOverride: preferred,
      isDev: process.env.NODE_ENV === 'development',
      isPackaged: app.isPackaged,
    });
    if (origin === 'https://lobsterai.youdao.com') return defaultBaseUrl;
    return `${origin}/portal#`;
  } catch (error) {
    console.warn('[Endpoints] invalid Portal development override, using default:', error);
    return defaultBaseUrl;
  }
};

// Portal 页面
export const getPortalTasksUrl = (): string => `${getPortalBaseUrl()}/profile/detail?tab=tasks`;

export const getKitStoreUrl = (): string => overmindPath('kit-store');
