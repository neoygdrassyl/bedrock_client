import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const filesWithLegacyItemImport = [
  'src/features/professionals/profesionals.page.jsx',
  'src/features/help/guide_user/guide_user.page.jsx',
  'src/features/help/dev_guide/dev_guide.page.jsx',
  'src/features/norms/norms.page.jsx',
  'src/features/certifications/certification.page.jsx',
  'src/features/norms/zone-use/zone_use.page.jsx',
];

describe('legacy wrapper imports', () => {
  it('does not leave orphan Item imports from the removed MDB wrapper API', () => {
    for (const file of filesWithLegacyItemImport) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/import\s*\{\s*Item\s*\}\s*from\s*['\"].*components\/ui['\"]/);
    }
  });
});
