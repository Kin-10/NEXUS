import type { Platform } from '@shared/platform';
import { PlatformRegistry } from '@shared/platform';

/**
 * Resolve an IM platform logo URL for the renderer.
 * Assets live in Vite `public/` (e.g. public/weixin.png) and must respect `base`
 * (`/` in dev, `./` in packaged Electron builds).
 */
export function getPlatformLogoSrc(platform: Platform): string {
  const file = PlatformRegistry.logo(platform);
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${file}`;
}
