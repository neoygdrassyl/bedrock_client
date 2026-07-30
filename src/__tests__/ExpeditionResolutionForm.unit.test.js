import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(
  path.join(projectRoot, 'src/app/pages/user/expeditions/exp._res.component.js'),
  'utf8',
);

describe('expedition resolution form request isolation', () => {
  test('starts persistence with a fresh FormData payload', () => {
    expect(source).toMatch(/let save_exp_res = \(e\) => \{\s*e\.preventDefault\(\);\s*formData = new FormData\(\);/);
  });

  test('downloads the generated resolution through the authenticated PDF helper', () => {
    expect(source).toContain("import { downloadGeneratedPdf } from '../../../utils/pdfDownload';");
    expect(source).toMatch(/return downloadGeneratedPdf\(\s*response\s*,\s*`\/pdf\/expdocres\/\$\{encodeURIComponent\(filename\)\}`\s*,\s*filename\s*\)/);
    expect(source).not.toMatch(/window\.open\([^\n]*\/pdf\/expdocres\//);
  });
});
