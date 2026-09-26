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

  test('keeps the Executory title compact and the appointment call smaller', () => {
    const header = readFileSync('public/templates/Executory/header.html', 'utf8');
    const main = readFileSync('public/templates/Executory/main.html', 'utf8');

    expect(header).toContain('style="text-align:center; width: 38%; font-weight:bold;" id="exec-act-reso-header"');
    expect(main).toContain('custom-header {\n            display: block;\n            margin: 0;\n        }');
    expect(main).toContain('.document-title {\n            margin-top: 0.5rem;\n        }');
    expect(main).toContain('class="text-center bold mx-auto text-size-smaller"');
    expect(main).toContain('.executory-signature {\n            margin-top: 4.8em;\n        }');
    expect(main).toContain('#exec-act-header-call {\n            font-size: 9pt !important;\n            line-height: 1.2;\n            white-space: pre-line;\n            margin: 0.25rem auto 0 !important;\n            padding: 0 !important;\n        }');
  });
});
