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

export function resolveDevelopmentServerBaseUrl(
  input: ResolveDevelopmentServerBaseUrlInput,
): string {
  const override = input.developmentOverride?.trim();
  if (!override || !input.isDev || input.isPackaged) {
    return input.defaultBaseUrl;
  }

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
