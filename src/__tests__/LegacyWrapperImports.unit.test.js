import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const filesWithLegacyItemImport = [
  'src/app/pages/user/profesionals/profesionals.page.js',
  'src/app/pages/user/profesionals/email.page.js',
  'src/app/pages/user/profesionals/public.page.js',
  'src/app/pages/user/guide_user/guide_user.page.js',
  'src/app/pages/user/dev_guide/dev_guide.page.js',
  'src/app/pages/user/norms/norms.page.js',
  'src/app/pages/user/certifications/certification.page.js',
  'src/app/pages/user/zone_use/zone_use.page.js',
];

describe('legacy wrapper imports', () => {
  it('does not leave orphan Item imports from the removed MDB wrapper API', () => {
    for (const file of filesWithLegacyItemImport) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/import\s*\{\s*Item\s*\}\s*from\s*['\"].*components\/ui['\"]/);
    }
  });
});
