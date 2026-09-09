/**
 * Token Contract — defines all semantic variables a theme must provide.
 *
 * Naming: --baiying-{category}-{name}
 * Convention: shadcn/ui background/foreground pairing + Radix 12-step gray scale
 *
 * Every theme (ThemeDefinition.tokens) must supply a value for each key.
 */
export const TOKEN_CONTRACT = {
  // ── Brand ──
  'primary':            '--baiying-primary',
  'primary-foreground': '--baiying-primary-foreground',
  'primary-hover':      '--baiying-primary-hover',
  'primary-muted':      '--baiying-primary-muted',

  // ── Accent ──
  'accent':             '--baiying-accent',
  'accent-foreground':  '--baiying-accent-foreground',

  // ── Surface / Background ──
  'background':         '--baiying-background',
  'foreground':         '--baiying-foreground',
  'surface':            '--baiying-surface',
  'surface-foreground': '--baiying-surface-foreground',
  'surface-raised':     '--baiying-surface-raised',
  'surface-overlay':    '--baiying-surface-overlay',

  // ── Chat bubbles ──
  'chat-user':              '--baiying-chat-user',
  'chat-user-foreground':   '--baiying-chat-user-foreground',
  'chat-bot':               '--baiying-chat-bot',
  'chat-bot-foreground':    '--baiying-chat-bot-foreground',

  // ── Text hierarchy ──
  'text-primary':       '--baiying-text-primary',
  'text-secondary':     '--baiying-text-secondary',
  'text-muted':         '--baiying-text-muted',

  // ── Borders ──
  'border':             '--baiying-border',
  'border-subtle':      '--baiying-border-subtle',
  'input-border':       '--baiying-input-border',

  // ── Scrollbar ──
  'scroll-thumb':       '--baiying-scroll-thumb',
  'scroll-thumb-hover': '--baiying-scroll-thumb-hover',

  // ── Decorative gradients ──
  'gradient-1':         '--baiying-gradient-1',
  'gradient-2':         '--baiying-gradient-2',

  // ── Status ──
  'destructive':            '--baiying-destructive',
  'destructive-foreground': '--baiying-destructive-foreground',
  'success':                '--baiying-success',
  'warning':                '--baiying-warning',

  // ── Gray scale 11 steps (gray-1=lightest → gray-11=darkest, all themes) ──
  'gray-1':  '--baiying-gray-1',
  'gray-2':  '--baiying-gray-2',
  'gray-3':  '--baiying-gray-3',
  'gray-4':  '--baiying-gray-4',
  'gray-5':  '--baiying-gray-5',
  'gray-6':  '--baiying-gray-6',
  'gray-7':  '--baiying-gray-7',
  'gray-8':  '--baiying-gray-8',
  'gray-9':  '--baiying-gray-9',
  'gray-10': '--baiying-gray-10',
  'gray-11': '--baiying-gray-11',

  // ── Radius ──
  'radius':  '--baiying-radius',
} as const;

export type TokenName = keyof typeof TOKEN_CONTRACT;
export type CSSVarName = (typeof TOKEN_CONTRACT)[TokenName];

/** All token keys as an array */
export const TOKEN_NAMES = Object.keys(TOKEN_CONTRACT) as TokenName[];
