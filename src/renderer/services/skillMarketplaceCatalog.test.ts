import { describe, expect, test } from 'vitest';

import { resolveSkillStoreCatalog } from './skill';

describe('resolveSkillStoreCatalog', () => {
  test('accepts Baiying envelope string and reads marketplace entries', () => {
    const raw = JSON.stringify({
      code: 0,
      message: 'success',
      data: {
        value: {
          localSkill: [],
          marketplace: [{
            id: 'research-starter',
            name: 'research-starter',
            description: { zh: '研究', en: 'Research' },
            tags: ['research'],
            url: 'http://127.0.0.1:8899/research-starter.zip',
            version: '1.0.0',
            source: { from: 'Baiying', url: 'https://example.com', author: 'Baiying' },
          }],
          marketTags: [{ id: 'research', zh: '研究', en: 'Research' }],
        },
      },
    });

    const catalog = resolveSkillStoreCatalog(raw);
    expect(catalog.marketplace).toHaveLength(1);
    expect(catalog.marketplace?.[0]?.id).toBe('research-starter');
    expect(catalog.marketTags?.[0]?.id).toBe('research');
  });

  test('accepts already-parsed catalog object from main process', () => {
    const catalog = resolveSkillStoreCatalog({
      localSkill: [],
      marketplace: [{
        id: 'office-writer',
        name: 'office-writer',
        description: 'writer',
        url: 'https://example.com/a.zip',
        version: '2.0.0',
        source: { from: 'Baiying', url: 'https://example.com' },
      }],
      marketTags: [],
    });
    expect(catalog.marketplace?.[0]?.id).toBe('office-writer');
  });
});
