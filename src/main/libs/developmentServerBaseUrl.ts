interface ResolveDevelopmentServerBaseUrlInput {
  defaultBaseUrl: string;
  developmentOverride?: string;
  isDev: boolean;
  isPackaged: boolean;
}

const LOOPBACK_HOSTNAMES = new Set([
  '127.0.0.1',
  '[::1]',
]);

const IPV4_HOSTNAME_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;

const isPrivateIpv4Hostname = (hostname: string): boolean => {
  if (!IPV4_HOSTNAME_PATTERN.test(hostname)) return false;
  const octets = hostname.split('.').map((part) => Number(part));
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false;
  }
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
};

const isAllowedDevelopmentHostname = (hostname: string): boolean => (
  LOOPBACK_HOSTNAMES.has(hostname) || isPrivateIpv4Hostname(hostname)
);

function parsePrivateLanOrigin(override: string): string {
  let url: URL;
  try {
    url = new URL(override);
  } catch {
    throw new Error('Development server override must be an absolute URL');
  }

  if ((url.protocol !== 'http:' && url.protocol !== 'https:')
      || !isAllowedDevelopmentHostname(url.hostname)) {
    throw new Error(
      'Development server override must use a literal loopback or private LAN HTTP(S) address',
    );
  }
  if (!url.port) {
    throw new Error('Development server override must include an explicit port');
  }
  if (url.username || url.password || url.search || url.hash
      || (url.pathname !== '' && url.pathname !== '/')) {
    throw new Error(
      'Development server override must be a credential-free origin URL',
    );
  }

  return url.origin;
}

/**
 * Resolve an optional private-LAN override for BaiYing / Overmind origins.
 *
 * - Unpackaged development: honor private-LAN overrides (existing behavior).
 * - Packaged builds: also honor explicit private-LAN overrides so installers can
 *   be validated when corporate DNS cannot resolve api-overmind.*.
 * - Never allow public host overrides (keeps production traffic pinned unless
 *   an operator intentionally points at a LAN BYServer).
 */
export function resolveDevelopmentServerBaseUrl(
  input: ResolveDevelopmentServerBaseUrlInput,
): string {
  const override = input.developmentOverride?.trim();
  if (!override) {
    return input.defaultBaseUrl;
  }

  const origin = parsePrivateLanOrigin(override);

  if (input.isPackaged) {
    return origin;
  }

  if (!input.isDev) {
    return input.defaultBaseUrl;
  }

  return origin;
}
