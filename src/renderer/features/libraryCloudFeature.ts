/**
 * TEMPORARY local/dev switch: hide cloud library UI and navigation.
 *
 * When true:
 * - "我的文件" source tabs only show Local
 * - OpenCloud navigation falls back to Local library
 *
 * Flip back to false when cloud library should be available again.
 */
export const LIBRARY_CLOUD_DISABLED = true;

export function isLibraryCloudEnabled(): boolean {
  return !LIBRARY_CLOUD_DISABLED;
}
