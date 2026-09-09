import { app } from 'electron';

import { HtmlSharePublicRoute } from '../../shared/htmlShare/constants';
import type { SqliteStore } from '../sqliteStore';
import { resolveDevelopmentServerBaseUrl } from './developmentServerBaseUrl';

let cachedTestMode: boolean | null = null;
let loggedDevelopmentServerBaseUrl: string | null = null;
let loggedDevelopmentOvermindBaseUrl: string | null = null;

/** Local BYServer default for unpackaged dev builds (API + Overmind + Portal). */
export const LOCAL_BAIYING_BASE_URL = 'http://192.168.101.24:8899';

/** @deprecated Use {@link LOCAL_BAIYING_BASE_URL}. */
export const LOCAL_OVERMIND_BASE_URL = LOCAL_BAIYING_BASE_URL;

/** Overmind product segment per Baiying Server integration guide. */
export const OVERMIND_PRODUCT = 'baiying';

const readEnvWithLegacy = (baiyingKey: string, lobsterKey: string): string | undefined => {
  const baiying = process.env[baiyingKey]?.trim();
  if (baiying) return baiying;
  return process.env[lobsterKey]?.trim();
};

const isUnpackagedDevelopment = (): boolean => (
  process.env.NODE_ENV === 'development' && !app.isPackaged
);

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

const resolveDevServerOverride = (): string | undefined => {
  const fromEnv = readEnvWithLegacy('BAIYING_SERVER_BASE_URL', 'LOBSTER_SERVER_BASE_URL');
  if (fromEnv) return fromEnv;
  return isUnpackagedDevelopment() ? LOCAL_BAIYING_BASE_URL : undefined;
};

/**
 * Server API base URL — switches based on testMode.
 * Used for auth exchange/refresh, banners, activities, installations, etc.
 */
export const getServerApiBaseUrl = (): string => {
  const defaultBaseUrl = isTestModeEnabled()
    ? 'https://baiying-server.inner.hzb.com'
    : 'https://baiying-server.hzb.com';
  const serverBaseUrl = resolveDevelopmentServerBaseUrl({
    defaultBaseUrl,
    developmentOverride: resolveDevServerOverride(),
    isDev: process.env.NODE_ENV === 'development',
    isPackaged: app.isPackaged,
  });
  if (serverBaseUrl !== defaultBaseUrl
      && loggedDevelopmentServerBaseUrl !== serverBaseUrl) {
    console.warn(
      `[Endpoints] routing Baiying server traffic to development origin ${serverBaseUrl}`,
    );
    loggedDevelopmentServerBaseUrl = serverBaseUrl;
  }
  return serverBaseUrl;
};

/**
 * Overmind openapi origin. Prefers BAIYING_OVERMIND_BASE_URL (LOBSTER_* legacy),
 * then server base URL in development so BYServer can host both API + Overmind.
 * Unpackaged dev builds default to {@link LOCAL_BAIYING_BASE_URL}.
 */
export const getOvermindBaseUrl = (): string => {
  const defaultBaseUrl = 'https://api-overmind.hzb.com';
  const preferred = readEnvWithLegacy('BAIYING_OVERMIND_BASE_URL', 'LOBSTER_OVERMIND_BASE_URL')
    || readEnvWithLegacy('BAIYING_SERVER_BASE_URL', 'LOBSTER_SERVER_BASE_URL')
    || (isUnpackagedDevelopment() ? LOCAL_BAIYING_BASE_URL : undefined);
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

export const buildOvermindCatalogUrl = (baseUrl: string, env: 'test' | 'prod', key: string): string => (
  `${baseUrl}/openapi/get/luna/hardware/${OVERMIND_PRODUCT}/${env}/${key}`
);

const overmindPath = (key: string): string => {
  const env = isTestModeEnabled() ? 'test' : 'prod';
  return buildOvermindCatalogUrl(getOvermindBaseUrl(), env, key);
};

export const getHtmlSharePublicBaseUrl = (): string => {
  return `${getServerApiBaseUrl()}${HtmlSharePublicRoute.Root}`;
};

export const getUpdateCheckUrl = (): string => overmindPath('update');

export const getManualUpdateCheckUrl = (): string => overmindPath('update-manual');

export const getFallbackDownloadUrl = (): string => (
  isTestModeEnabled()
    ? 'https://baiying.inner.hzb.com/#/download-list'
    : 'https://baiying.hzb.com/#/download-list'
);

export const getSkillStoreUrl = (): string => overmindPath('skill-store');

export const getLoginOvermindUrl = (): string => overmindPath('login-url');

export const getMcpMarketplaceUrl = (): string => overmindPath('mcp-marketplace');

/**
 * Portal web base (`.../portal#`). In local BYServer mode, points at the local
 * portal pages under `${BAIYING_SERVER_BASE_URL}/portal#`.
 */
export const getPortalBaseUrl = (): string => {
  const defaultBaseUrl = isTestModeEnabled()
    ? 'https://baiying.inner.hzb.com/portal#'
    : 'https://baiying.hzb.com/portal#';
  const preferred = readEnvWithLegacy('BAIYING_PORTAL_BASE_URL', 'LOBSTER_PORTAL_BASE_URL')
    || readEnvWithLegacy('BAIYING_SERVER_BASE_URL', 'LOBSTER_SERVER_BASE_URL')
    || (isUnpackagedDevelopment() ? LOCAL_BAIYING_BASE_URL : undefined);
  if (!preferred) return defaultBaseUrl;

  try {
    const origin = resolveDevelopmentServerBaseUrl({
      defaultBaseUrl: 'https://baiying.hzb.com',
      developmentOverride: preferred,
      isDev: process.env.NODE_ENV === 'development',
      isPackaged: app.isPackaged,
    });
    if (origin === 'https://baiying.hzb.com') return defaultBaseUrl;
    return `${origin}/portal#`;
  } catch (error) {
    console.warn('[Endpoints] invalid Portal development override, using default:', error);
    return defaultBaseUrl;
  }
};

// Portal 页面
export const getPortalTasksUrl = (): string => `${getPortalBaseUrl()}/profile/detail?tab=tasks`;

export const getKitStoreUrl = (): string => overmindPath('kit-store');
