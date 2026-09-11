import {
  buildOvermindCatalogUrl,
  getOvermindBaseUrl,
  isTestModeEnabled,
  LOCAL_BAIYING_BASE_URL,
} from './endpoints';
import { fetchTextUrl } from './fetchTextUrl';

const isTransientCatalogNetworkError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|Request timeout|getaddrinfo|socket hang up/i
    .test(message);
};

/**
 * Fetch an Overmind catalog document. When the primary origin (usually
 * api-overmind.*) fails with a DNS/network error, retry once against the local
 * BYServer so LAN installs still get skill/kit listings.
 *
 * Local BYServer's `test/kit-store` is currently empty while `prod/kit-store`
 * has demo kits — when a LAN kit-store request under test returns no kits,
 * retry prod once so the Expert marketplace is not blank in electron:dev.
 */
export async function fetchOvermindCatalogText(
  catalogKey: string,
  timeoutMs = 10_000,
): Promise<{ text: string; url: string; usedFallback: boolean }> {
  const env = isTestModeEnabled() ? 'test' : 'prod';
  const primaryBase = getOvermindBaseUrl();
  const primaryUrl = buildOvermindCatalogUrl(primaryBase, env, catalogKey);

  let text: string;
  let url = primaryUrl;
  let usedFallback = false;

  try {
    text = await fetchTextUrl(primaryUrl, timeoutMs);
  } catch (error) {
    const fallbackUrl = buildOvermindCatalogUrl(LOCAL_BAIYING_BASE_URL, env, catalogKey);
    if (
      fallbackUrl === primaryUrl
      || !isTransientCatalogNetworkError(error)
    ) {
      throw error;
    }

    console.warn(
      `[Overmind] catalog "${catalogKey}" failed via ${primaryUrl}: `
      + `${error instanceof Error ? error.message : String(error)}; `
      + `retrying ${fallbackUrl}`,
    );
    text = await fetchTextUrl(fallbackUrl, timeoutMs);
    url = fallbackUrl;
    usedFallback = true;
  }

  if (
    catalogKey === 'kit-store'
    && env === 'test'
    && isLocalBaiyingOrigin(url)
    && catalogHasNoKits(text)
  ) {
    const prodUrl = buildOvermindCatalogUrl(LOCAL_BAIYING_BASE_URL, 'prod', catalogKey);
    console.warn(`[Overmind] local test kit-store is empty; retrying ${prodUrl}`);
    text = await fetchTextUrl(prodUrl, timeoutMs);
    url = prodUrl;
    usedFallback = true;
  }

  return { text, url, usedFallback };
}

function isLocalBaiyingOrigin(url: string): boolean {
  try {
    return new URL(url).origin === new URL(LOCAL_BAIYING_BASE_URL).origin;
  } catch {
    return false;
  }
}

function catalogHasNoKits(raw: string): boolean {
  try {
    const json = JSON.parse(raw) as { data?: { value?: unknown } };
    let value = json.data?.value;
    if (typeof value === 'string') {
      value = JSON.parse(value);
    }
    const kits = (value as { kits?: unknown } | undefined)?.kits;
    return !Array.isArray(kits) || kits.length === 0;
  } catch {
    return false;
  }
}
