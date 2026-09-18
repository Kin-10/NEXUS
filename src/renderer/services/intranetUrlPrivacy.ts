/**
 * Privacy helpers for RFC1918 intranet URLs (10/8, 172.16/12, 192.168/16).
 * Used to keep real URLs for preview loading while redacting them in UI text.
 */

const PRIVATE_INTRANET_HOST_RE =
  /^(?:10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})$/i;

const PRIVATE_INTRANET_HOST_PATTERN =
  '(?:10(?:\\.\\d{1,3}){3}|172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2}|192\\.168(?:\\.\\d{1,3}){2})';

const PRIVATE_INTRANET_URL_RE = new RegExp(
  `https?:\\/\\/${PRIVATE_INTRANET_HOST_PATTERN}(?::\\d{1,5})?(?:\\/[^\\s<>"'\\\`\\)\\]]*)?`,
  'gi',
);

const PRIVATE_INTRANET_MARKDOWN_LINK_RE = new RegExp(
  `\\[([^\\]]*)\\]\\((https?:\\/\\/${PRIVATE_INTRANET_HOST_PATTERN}[^)\\s]*)\\)`,
  'gi',
);

export const isPrivateIntranetHostname = (hostname: string | null | undefined): boolean => {
  if (!hostname) return false;
  const normalized = hostname.trim().replace(/^\[|\]$/g, '').toLowerCase();
  return PRIVATE_INTRANET_HOST_RE.test(normalized);
};

export const isPrivateIntranetUrl = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      return isPrivateIntranetHostname(new URL(trimmed).hostname);
    }
    // Bare host or host:port[/path]
    const hostPart = trimmed.split('/')[0]?.split('?')[0]?.split('#')[0] ?? '';
    const hostname = hostPart.includes(':') && !hostPart.startsWith('[')
      ? hostPart.slice(0, hostPart.lastIndexOf(':'))
      : hostPart;
    return isPrivateIntranetHostname(hostname);
  } catch {
    return false;
  }
};

export const looksLikePrivateIntranetReference = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (isPrivateIntranetUrl(trimmed)) return true;
  if (isPrivateIntranetHostname(trimmed)) return true;
  // Titles like "192.168.1.85:3000" or path segments that still embed the host.
  const hostOrUrlRe = new RegExp(
    `(?:https?:\\/\\/)?${PRIVATE_INTRANET_HOST_PATTERN}(?::\\d{1,5})?(?:\\/\\S*)?`,
    'i',
  );
  return hostOrUrlRe.test(trimmed);
};

export const redactPrivateIntranetUrlsInText = (
  text: string,
  replacement: string,
): string => {
  if (!text || !replacement) return text;
  let next = text.replace(PRIVATE_INTRANET_MARKDOWN_LINK_RE, (_match, label: string) => {
    const trimmedLabel = typeof label === 'string' ? label.trim() : '';
    if (trimmedLabel && !/^https?:\/\//i.test(trimmedLabel) && !isPrivateIntranetUrl(trimmedLabel)) {
      return trimmedLabel;
    }
    return replacement;
  });
  next = next.replace(PRIVATE_INTRANET_URL_RE, replacement);
  // Reset lastIndex for global regex reuse safety.
  PRIVATE_INTRANET_URL_RE.lastIndex = 0;
  PRIVATE_INTRANET_MARKDOWN_LINK_RE.lastIndex = 0;
  return next;
};

export const getPrivateIntranetAddressDisplay = (
  value: string | null | undefined,
  replacement: string,
): string | null => {
  if (!value || !replacement) return null;
  return isPrivateIntranetUrl(value) ? replacement : null;
};
