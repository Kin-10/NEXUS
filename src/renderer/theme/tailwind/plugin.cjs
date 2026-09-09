/**
 * Tailwind CSS v3 plugin — bridges --baiying-* CSS variables into Tailwind utility classes.
 *
 * Usage in tailwind.config.js:
 *   plugins: [require('./src/renderer/theme/tailwind/plugin.cjs')]
 *
 * Provides: bg-background, text-foreground, bg-primary, border-border, etc.
 * Also provides legacy claude.* aliases for backward compatibility.
 *
 * Colors are wrapped in color-mix() with the <alpha-value> placeholder so that
 * Tailwind opacity modifiers (e.g. text-foreground/90, bg-surface-raised/30)
 * generate working CSS. Without this, var()-based colors silently drop any
 * class that uses an opacity modifier.
 */
const plugin = require('tailwindcss/plugin');

const withAlpha = (variable) =>
  `color-mix(in srgb, var(${variable}) calc(<alpha-value> * 100%), transparent)`;

module.exports = plugin(function () {
  // The plugin itself is a no-op; we only extend the theme below.
}, {
  theme: {
    extend: {
      colors: {
        // === Semantic theme colors (driven by CSS variables) ===
        background:    withAlpha('--baiying-background'),
        foreground:    withAlpha('--baiying-foreground'),
        primary: {
          DEFAULT:     withAlpha('--baiying-primary'),
          foreground:  withAlpha('--baiying-primary-foreground'),
          hover:       withAlpha('--baiying-primary-hover'),
          muted:       withAlpha('--baiying-primary-muted'),
          dark:        withAlpha('--baiying-primary-hover'),  // backward compat alias
        },
        accent: {
          DEFAULT:     withAlpha('--baiying-accent'),
          foreground:  withAlpha('--baiying-accent-foreground'),
        },
        surface: {
          DEFAULT:     withAlpha('--baiying-surface'),
          foreground:  withAlpha('--baiying-surface-foreground'),
          raised:      withAlpha('--baiying-surface-raised'),
          overlay:     withAlpha('--baiying-surface-overlay'),
          inset:       withAlpha('--baiying-surface-raised'),  // alias
        },
        border: {
          DEFAULT:     withAlpha('--baiying-border'),
          subtle:      withAlpha('--baiying-border-subtle'),
          input:       withAlpha('--baiying-input-border'),
        },
        muted:         withAlpha('--baiying-text-muted'),
        destructive: {
          DEFAULT:     withAlpha('--baiying-destructive'),
          foreground:  withAlpha('--baiying-destructive-foreground'),
        },
        success:       withAlpha('--baiying-success'),
        warning:       withAlpha('--baiying-warning'),

        // === Legacy claude.* aliases (map to --baiying-* for backward compat) ===
        claude: {
          bg:                withAlpha('--baiying-background'),
          surface:           withAlpha('--baiying-surface'),
          surfaceHover:      withAlpha('--baiying-surface-raised'),
          surfaceMuted:      withAlpha('--baiying-surface-raised'),
          surfaceInset:      withAlpha('--baiying-surface-raised'),
          border:            withAlpha('--baiying-border'),
          borderLight:       withAlpha('--baiying-border-subtle'),
          text:              withAlpha('--baiying-text-primary'),
          textSecondary:     withAlpha('--baiying-text-secondary'),
          // dark.* aliases point to the same vars — theme handles light/dark
          darkBg:            withAlpha('--baiying-background'),
          darkSurface:       withAlpha('--baiying-surface'),
          darkSurfaceHover:  withAlpha('--baiying-surface-raised'),
          darkSurfaceMuted:  withAlpha('--baiying-surface-raised'),
          darkSurfaceInset:  withAlpha('--baiying-surface-raised'),
          darkBorder:        withAlpha('--baiying-border'),
          darkBorderLight:   withAlpha('--baiying-border-subtle'),
          darkText:          withAlpha('--baiying-text-primary'),
          darkTextSecondary: withAlpha('--baiying-text-secondary'),
          // Accent
          accent:            withAlpha('--baiying-primary'),
          accentHover:       withAlpha('--baiying-primary-hover'),
          accentLight:       withAlpha('--baiying-primary'),
          accentMuted:       withAlpha('--baiying-primary-muted'),
        },
        secondary: {
          DEFAULT: withAlpha('--baiying-text-secondary'),
          dark:    withAlpha('--baiying-border'),
        },
      },
      borderRadius: {
        theme: 'var(--baiying-radius)',
      },
    },
  },
});
