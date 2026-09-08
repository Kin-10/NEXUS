import { app } from 'electron';
import path from 'path';

import { APP_UPDATE_URL_UNTRUSTED_ERROR } from '../../shared/appUpdate/constants';

export const WindowsInstallerUrlPolicyFailure = {
  InvalidUrl: 'invalid-url',
  InsecureProtocol: 'insecure-protocol',
  CredentialsPresent: 'credentials-present',
  FragmentPresent: 'fragment-present',
  UnapprovedPort: 'unapproved-port',
  InvalidExtension: 'invalid-extension',
} as const;

export type WindowsInstallerUrlPolicyFailure =
  typeof WindowsInstallerUrlPolicyFailure[keyof typeof WindowsInstallerUrlPolicyFailure];

export type WindowsInstallerUrlPolicyResult =
  | { trusted: true; url: URL }
  | { trusted: false; reason: WindowsInstallerUrlPolicyFailure };

export const WINDOWS_INSTALLER_URL_POLICY_VERSION = 2 as const;

export interface WindowsInstallerUrlPolicyReceipt {
  policyVersion: typeof WINDOWS_INSTALLER_URL_POLICY_VERSION;
  /**
   * Transport provenance for a request that disallows HTTP redirects.
   * `finalOrigin` is retained for persisted-record compatibility and must equal
   * `inputOrigin`; neither value proves publisher authenticity.
   */
  inputOrigin: string;
  finalOrigin: string;
}

const isLoopbackHostname = (hostname: string): boolean => {
  const host = hostname.trim().toLowerCase();
  return host === 'localhost'
    || host === '127.0.0.1'
    || host === '::1'
    || host === '[::1]';
};

/**
 * Local BYServer serves installers over http://127.0.0.1:<ephemeral-port>/.
 * Allow that only for unpackaged development (or an explicit escape hatch),
 * never for packaged production clients talking to public CDNs.
 */
export const allowsLocalDevelopmentInstallerHttp = (): boolean => {
  if (process.env.BAIYING_ALLOW_LOCAL_UPDATE_HTTP === '1') {
    return true;
  }
  try {
    return process.env.NODE_ENV === 'development' && !app.isPackaged;
  } catch {
    return false;
  }
};

const hasDisallowedUserinfoOrFragment = (url: URL): boolean => (
  Boolean(url.username || url.password || url.hash)
);

/**
 * Enforce the transport-level policy that is stable across CDN changes.
 * This deliberately does not authenticate the publisher or pin an origin;
 * signed release metadata and Authenticode verification are separate work.
 */
export function validateWindowsInstallerUrl(
  rawUrl: string,
): WindowsInstallerUrlPolicyResult {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.InvalidUrl };
  }

  if (hasDisallowedUserinfoOrFragment(url)) {
    if (url.username || url.password) {
      return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.CredentialsPresent };
    }
    return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.FragmentPresent };
  }

  const isLoopbackHttp = url.protocol === 'http:'
    && isLoopbackHostname(url.hostname)
    && allowsLocalDevelopmentInstallerHttp();

  if (!isLoopbackHttp && url.protocol !== 'https:') {
    return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.InsecureProtocol };
  }

  // Public HTTPS installers must use the default port. Loopback HTTP may use
  // an ephemeral BYServer artifact port (e.g. 127.0.0.1:59004).
  if (!isLoopbackHttp && url.port) {
    return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.UnapprovedPort };
  }

  if (path.posix.extname(url.pathname).toLowerCase() !== '.exe') {
    return { trusted: false, reason: WindowsInstallerUrlPolicyFailure.InvalidExtension };
  }

  return { trusted: true, url };
}

/** Validate a canonical origin previously emitted by URL.origin. */
export function isSecureWindowsInstallerOrigin(rawOrigin: string): boolean {
  try {
    const url = new URL(rawOrigin);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
      return false;
    }
    if (url.origin !== rawOrigin) {
      return false;
    }

    if (url.protocol === 'https:') {
      return !url.port;
    }

    return url.protocol === 'http:'
      && isLoopbackHostname(url.hostname)
      && allowsLocalDevelopmentInstallerHttp();
  } catch {
    return false;
  }
}

export class AppUpdateUrlUntrustedError extends Error {
  readonly reason: WindowsInstallerUrlPolicyFailure;

  constructor(reason: WindowsInstallerUrlPolicyFailure) {
    super(APP_UPDATE_URL_UNTRUSTED_ERROR);
    this.name = 'AppUpdateUrlUntrustedError';
    this.reason = reason;
  }
}

export function assertTrustedWindowsInstallerUrl(
  rawUrl: string,
): URL {
  const result = validateWindowsInstallerUrl(rawUrl);
  if ('reason' in result) {
    throw new AppUpdateUrlUntrustedError(result.reason);
  }
  return result.url;
}
