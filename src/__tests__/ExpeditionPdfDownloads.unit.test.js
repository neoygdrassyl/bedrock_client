import { readFileSync } from 'node:fs';

const expeditionDownloadFiles = [
  'src/app/pages/user/expeditions/exp._res.component.js',
  'src/app/pages/user/expeditions/exp_docs.component.js',
  'src/app/pages/user/expeditions/exp_eje.component.js',
];

describe('Expedition PDF downloads', () => {
  test('downloads server-issued artifacts with legacy endpoint fallbacks', () => {
    expeditionDownloadFiles.forEach((file) => {
      const source = readFileSync(file, 'utf8');

      expect(source).toContain('downloadGeneratedPdf');
      expect(source).not.toMatch(/window\.open\([^\n]*\/pdf\//);
      expect(source).not.toMatch(/\bfetch\([^\n]*pdf(?:-generate)?\//);
    });

    const docs = readFileSync('src/app/pages/user/expeditions/exp_docs.component.js', 'utf8');
    const resolution = readFileSync('src/app/pages/user/expeditions/exp._res.component.js', 'utf8');
    const executory = readFileSync('src/app/pages/user/expeditions/exp_eje.component.js', 'utf8');

    for (const route of ['expdoc1', 'expdoc2', 'expdoc3', 'expdoc4', 'expdoc5', 'expdoc6', 'expdoc7', 'expdocfinalnot', 'expdoceje']) {
      expect(docs).toContain(`downloadGeneratedPdf(response, \`/pdf/${route}/`);
    }
    expect(resolution).toContain('downloadGeneratedPdf(response, `/pdf/expdocres/');
    expect(executory).toContain('downloadGeneratedPdf(response, `/pdf/expdoceje/');
  });
});
