import { isCustomProvider } from '../config';
import type { Model } from '../store/slices/modelSlice';

/**
 * Guest (logged-out) users may only use OpenAI-compatible custom providers
 * (`custom_0` … `custom_N`). Built-in vendors and BaiYing plan models require login.
 */
export function isCustomProviderModel(
  model: Pick<Model, 'providerKey'> | null | undefined,
): boolean {
  const providerKey = model?.providerKey?.trim();
  return Boolean(providerKey && isCustomProvider(providerKey));
}

export function isModelAllowedForAuth(
  model: Pick<Model, 'providerKey' | 'accessible'> | null | undefined,
  isLoggedIn: boolean,
): boolean {
  if (!model || model.accessible === false) return false;
  if (!isLoggedIn) return isCustomProviderModel(model);
  return true;
}

export function pickPreferredGuestModel(models: readonly Model[]): Model | null {
  return models.find(model => isModelAllowedForAuth(model, false)) ?? null;
}

export function isCustomProviderKey(providerKey: string | null | undefined): boolean {
  const key = providerKey?.trim();
  return Boolean(key && isCustomProvider(key));
}
