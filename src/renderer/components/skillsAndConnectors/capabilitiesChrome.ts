/**
 * Shared visual chrome for Skills / Connectors (Capabilities) marketplace pages.
 * Flat / Swiss-minimal: search-first, no heavy shadows, color-only hover (150–200ms).
 * Uses BaiYing theme tokens — do not introduce a separate purple marketplace palette.
 */

/** Sticky filter band behind search + tabs. */
export const CAPABILITIES_TOOLBAR_CLASS =
  'sticky top-0 z-10 space-y-3 bg-background/95 pb-3 pt-1 backdrop-blur-sm';

/** Hero search field — primary CTA of the directory pattern. */
export const CAPABILITIES_SEARCH_INPUT_CLASS =
  'h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-9 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-secondary/70 focus:border-primary focus:ring-2 focus:ring-primary/20';

/** Secondary / outline action next to search (Add skill / Add connector). */
export const CAPABILITIES_SECONDARY_ACTION_CLASS =
  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-surface-raised';

/** Primary filled action when emphasis is needed. */
export const CAPABILITIES_PRIMARY_ACTION_CLASS =
  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover';

/** Underline tab row container. */
export const CAPABILITIES_TAB_ROW_CLASS =
  'flex items-center gap-0.5 border-b border-border';

export const capabilitiesTabButtonClass = (active: boolean): string =>
  `relative cursor-pointer px-3 pb-2.5 pt-1 text-[length:calc(var(--baiying-ui-font-size)_-_0.5px)] font-semibold transition-colors duration-200 ${
    active ? 'text-foreground' : 'text-secondary hover:text-foreground'
  }`;

export const capabilitiesTabIndicatorClass = (active: boolean): string =>
  `absolute bottom-[-1px] left-1 right-1 h-0.5 rounded-full transition-colors duration-200 ${
    active ? 'bg-primary' : 'bg-transparent'
  }`;

/** Category / market tag chip. */
export const capabilitiesChipClass = (active: boolean): string =>
  `cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
    active
      ? 'bg-primary text-white'
      : 'bg-surface-raised text-secondary hover:bg-surface-raised hover:text-foreground'
  }`;

/** Directory card — flat, no layout-shifting hover. */
export const CAPABILITIES_CARD_CLASS =
  'group flex cursor-pointer flex-col rounded-xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-surface-raised/50 focus-within:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
