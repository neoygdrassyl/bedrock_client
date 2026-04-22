import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplateEngine } from '../app/utils/TemplateEngine';

const createFetchMock = (overrides = {}) => {
  const responses = {
    '/templates/resolution/header/header.html': '<header>HEADER OPEN</header>',
    '/templates/resolution/header/header_des.html': '<header>HEADER DES</header>',
    '/templates/resolution/footer.html': '<footer>FOOTER</footer>',
    '/templates/resolution/main.html': '<html><head></head><body><custom-header></custom-header><considerate-section></considerate-section><resolutive-section></resolutive-section><p>{{name}}</p><p>{{notes}}</p></body></html>',
    '/templates/resolution/considerate/reso_open_cons.html': '<section>CONS OPEN</section>',
    '/templates/resolution/considerate/des_cons.html': '<section>CONS DES</section>',
    '/templates/resolution/resolutive/reso_open_resol.html': '<section>RES OPEN</section>',
    '/templates/resolution/resolutive/des_resol.html': '<section>RES DES</section>',
    '/templates/ActDesist/header.html': '<header>HEADER ACT DESIST</header>',
    '/templates/ActDesist/main.html': '<html><head></head><body><custom-header></custom-header><considerate-section></considerate-section><resolutive-section></resolutive-section><p>{{name}}</p></body></html>',
    '/templates/ActDesist/considerate/considerate.html': '<section>CONS ACT DESIST</section>',
    '/templates/ActDesist/resolutive/resolutive.html': '<section>RES ACT DESIST</section>',
    '/templates/Executory/header.html': '<header>HEADER EXEC</header>',
    '/templates/Executory/main.html': '<html><head></head><body><custom-header></custom-header><considerate-section></considerate-section><resolutive-section></resolutive-section><p>{{name}}</p></body></html>',
    '/templates/Executory/body.html': '<section>BODY EXEC</section>',
    '/templates/Executory/resol_part.html': '<section>RES EXEC</section>',
    '/templates/resolution/considerate/style_part_cons.css': '.x{color:red;}',
    ...overrides,
  };

  return vi.fn((url) => Promise.resolve({ text: () => Promise.resolve(responses[url] || '') }));
};

describe('TemplateEngine.buildTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('construye plantilla open con reemplazos y css embebido', async () => {
    const fetchMock = createFetchMock();

    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate({ name: 'Dovela' }, 'open');

    expect(fetchMock).toHaveBeenCalledWith('/templates/resolution/header/header.html');
    expect(html).toContain('<header>HEADER OPEN</header>');
    expect(html).toContain('<section>CONS OPEN</section>');
    expect(html).toContain('<section>RES OPEN</section>');
    expect(html).toContain('<p>Dovela</p>');
    expect(html).toContain('<style>.x{color:red;}</style>');
  });

  it('usa fallback de modelo open cuando model es desconocido', async () => {
    const fetchMock = createFetchMock();

    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate({}, 'modelo-no-soportado');

    expect(fetchMock).toHaveBeenCalledWith('/templates/resolution/header/header.html');
    expect(html).toContain('<header>HEADER OPEN</header>');
  });

  it('construye plantilla des con rutas de modelo desistimiento de resolucion', async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate({ name: 'Caso DES' }, 'des');

    expect(fetchMock).toHaveBeenCalledWith('/templates/resolution/header/header_des.html');
    expect(fetchMock).toHaveBeenCalledWith('/templates/resolution/considerate/des_cons.html');
    expect(fetchMock).toHaveBeenCalledWith('/templates/resolution/resolutive/des_resol.html');
    expect(html).toContain('HEADER DES');
    expect(html).toContain('CONS DES');
    expect(html).toContain('RES DES');
  });

  it.each(['delete', 'return', 'transfer'])(
    'construye plantilla %s con rutas ActDesist',
    async (model) => {
      const fetchMock = createFetchMock();
      vi.stubGlobal('fetch', fetchMock);

      const html = await TemplateEngine.buildTemplate({ name: 'Acto' }, model);

      expect(fetchMock).toHaveBeenCalledWith('/templates/ActDesist/header.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/ActDesist/main.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/ActDesist/considerate/considerate.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/ActDesist/resolutive/resolutive.html');
      expect(html).toContain('HEADER ACT DESIST');
      expect(html).toContain('CONS ACT DESIST');
      expect(html).toContain('RES ACT DESIST');
    }
  );

  it.each(['eje_open', 'eje_des', 'eje_neg'])(
    'construye plantilla %s con rutas Executory',
    async (model) => {
      const fetchMock = createFetchMock();
      vi.stubGlobal('fetch', fetchMock);

      const html = await TemplateEngine.buildTemplate({ name: 'Ejecutoria' }, model);

      expect(fetchMock).toHaveBeenCalledWith('/templates/Executory/header.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/Executory/main.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/Executory/body.html');
      expect(fetchMock).toHaveBeenCalledWith('/templates/Executory/resol_part.html');
      expect(html).toContain('HEADER EXEC');
      expect(html).toContain('BODY EXEC');
      expect(html).toContain('RES EXEC');
    }
  );

  it('reemplaza caracteres especiales en placeholders sin romper el html', async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate(
      { name: 'Curaduria & "Uno" <Legal>', notes: 'Articulo 29: debido proceso' },
      'open'
    );

    expect(html).toContain('Curaduria & "Uno" <Legal>');
    expect(html).toContain('Articulo 29: debido proceso');
  });

  it('tolera data nula y aun compone la plantilla base', async () => {
    const fetchMock = createFetchMock();
    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate(null, 'open');

    expect(html).toContain('HEADER OPEN');
    expect(html).toContain('CONS OPEN');
    expect(html).toContain('RES OPEN');
  });

  it('tolera secciones considerate y resolutive vacias', async () => {
    const fetchMock = createFetchMock({
      '/templates/resolution/considerate/reso_open_cons.html': '',
      '/templates/resolution/resolutive/reso_open_resol.html': '',
    });
    vi.stubGlobal('fetch', fetchMock);

    const html = await TemplateEngine.buildTemplate({ name: 'Sin Secciones' }, 'open');

    expect(html).toContain('<header>HEADER OPEN</header>');
    expect(html).toContain('<p>Sin Secciones</p>');
    expect(html).not.toContain('<considerate-section>');
    expect(html).not.toContain('<resolutive-section>');
  });
});
