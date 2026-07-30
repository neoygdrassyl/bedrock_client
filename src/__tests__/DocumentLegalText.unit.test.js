import { readFileSync } from 'node:fs';

const sources = [
  'src/app/components/jsons/vars.js',
  'src/app/pages/user/expeditions/exp._res.component.js',
  'src/app/utils/ExecEngineTemp.js',
  'src/app/utils/ResoEngineTemplate.js',
  'src/app/utils/ActDesistEngineTemp.js',
  'src/app/utils/TemplateModifier.js',
  'public/templates/resolution/header/header.html',
  'public/templates/resolution/header/header_des.html',
  'public/templates/Executory/header.html',
  'public/templates/ActDesist/header.html',
  'public/templates/ActDesist/main.html',
];

describe('document legal text', () => {
  test('does not emit legacy PBOT terminology', () => {
    sources.forEach((file) => {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/P\.?B\.?O\.?T\.?/i);
    });
  });

  test('uses the current curator header and signature fallback', () => {
    const vars = readFileSync('src/app/components/jsons/vars.js', 'utf8');
    const desist = readFileSync('public/templates/ActDesist/main.html', 'utf8');

    expect(vars).toContain("job: 'CURADOR URBANO UNO DE BUCARAMANGA (P)'");
    expect(vars).toContain("signature_job: 'Curador Urbano Uno de Bucaramanga (P)'");
    expect(vars).toContain('Nombramiento Decreto municipal 0114 de 3 de junio de 2026');
    expect(vars).toContain('Diligencia de posesión N° 0119 de 9 de junio de 2026');
    expect(desist).toContain('Curador Urbano Uno de Bucaramanga (P)');
  });
});
