/**
 * Derive a short display abbreviation for avatar-style tiles when no icon exists.
 * Handles CJK names, spaced / hyphenated English, and camelCase ids.
 */
export function getNameAbbreviation(name: string, maxChars = 2): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';

  const limit = Math.max(1, Math.min(3, maxChars));

  // Prefer grapheme-aware slicing when available (emoji / composed CJK).
  // Intl.Segmenter is runtime-available in Chromium but not in our ES2020 lib types.
  const graphemes = (() => {
    try {
      const IntlWithSegmenter = Intl as typeof Intl & {
        Segmenter?: new (
          locales?: string | string[],
          options?: { granularity?: 'grapheme' | 'word' | 'sentence' },
        ) => { segment: (input: string) => Iterable<{ segment: string }> };
      };
      if (typeof IntlWithSegmenter.Segmenter === 'function') {
        const segmenter = new IntlWithSegmenter.Segmenter(undefined, {
          granularity: 'grapheme',
        });
        return Array.from(segmenter.segment(trimmed), (s) => s.segment);
      }
    } catch {
      /* fall through */
    }
    return Array.from(trimmed);
  })();

  const hasCjk = /[\u3400-\u9fff\uf900-\ufaff]/.test(trimmed);
  if (hasCjk) {
    return graphemes.slice(0, Math.min(limit, graphemes.length)).join('');
  }

  const tokens = trimmed
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s_\-./\\]+/)
    .map((t) => t.replace(/[^A-Za-z0-9]/g, ''))
    .filter(Boolean);

  if (tokens.length >= 2) {
    return tokens
      .slice(0, limit)
      .map((t) => t[0]!.toUpperCase())
      .join('');
  }

  if (tokens.length === 1) {
    return tokens[0]!.slice(0, limit).toUpperCase();
  }

  return graphemes.slice(0, limit).join('').toUpperCase() || '?';
}
