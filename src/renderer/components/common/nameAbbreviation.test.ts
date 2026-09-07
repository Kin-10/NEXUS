import { describe, expect, test } from 'vitest';

import { getNameAbbreviation } from './nameAbbreviation';

describe('getNameAbbreviation', () => {
  test('uses leading CJK characters', () => {
    expect(getNameAbbreviation('查找技能')).toBe('查找');
    expect(getNameAbbreviation('词')).toBe('词');
  });

  test('uses initials for multi-word english names', () => {
    expect(getNameAbbreviation('Find Skills')).toBe('FS');
    expect(getNameAbbreviation('model-context-protocol')).toBe('MC');
  });

  test('uses leading letters for a single english token', () => {
    expect(getNameAbbreviation('Word')).toBe('WO');
    expect(getNameAbbreviation('excel')).toBe('EX');
  });

  test('splits camelCase into initials', () => {
    expect(getNameAbbreviation('openClaw')).toBe('OC');
  });

  test('falls back for empty input', () => {
    expect(getNameAbbreviation('')).toBe('?');
    expect(getNameAbbreviation('   ')).toBe('?');
  });
});
