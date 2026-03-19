/**
 * INTEGRATION TESTS — Módulo Expedición (EXPEDITION)
 *
 * Verifica:
 *   1. Renderizado del componente EXPEDITION con datos mock
 *   2. Carga de datos desde EXPEDITION_SERVICE.getRecord(), FUN_SERVICE.get(), RECORD_LAW_SERVICE.getRecord()
 *   3. Muestra "CARGANDO INFORMACION..." mientras carga
 *   4. Botón "GENERAR EXPEDICION EN BLANCO" cuando no hay record
 *   5. Secciones del expediente: EXP_1, EXP_AREAS, EXP_2, EXP_DOCS, EXP_CLOCKS, EXP_LIC
 *   6. Navegación de versiones (FUN_VERSION_NAV)
 *   7. Navegación de módulos (FUN_MODULE_NAV)
 *   8. Creación de expedición en blanco llama EXPEDITION_SERVICE.create()
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock services ─────────────────────────────────────────────────────────

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
        id: 1,
        id_public: 'CUB1-2024-0001',
        state: 50,
        version: 1,
        clock_payment: '2024-01-15',
        fun_1s: [{
          id: 1, tipo: 'TIPO I', tramite: 'INICIAL',
          m_lic: 'CONSTRUCCIÓN', m_sub: '', m_urb: '',
          usos: 'RESIDENCIAL', area: '100', vivienda: '2',
          cultural: '', regla_1: '', regla_2: '',
        }],
      },
    })),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/expedition.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/record_law.service', () => ({
  __esModule: true,
  default: {
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('../app/services/custom.service', () => ({
  __esModule: true,
  default: {
    loadDictionary_cub_id: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('../app/services/record_eng.js', () => ({
  __esModule: true,
  default: {
    getRecord: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

vi.mock('../app/services/record_arc.js', () => ({
  __esModule: true,
  default: {
    getRecord: vi.fn(() => Promise.resolve({ data: {} })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// ─── Mock sub-components (to isolate unit under test) ──────────────────────

vi.mock('../app/pages/user/expeditions/exp_1.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-1">EXP_1 Info General</div>,
}));

vi.mock('../app/pages/user/expeditions/exp_areas.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-areas">EXP_AREAS Áreas</div>,
}));

vi.mock('../app/pages/user/expeditions/exp_2.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-2">EXP_2 Pagos</div>,
}));

vi.mock('../app/pages/user/expeditions/exp_docs.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-docs">EXP_DOCS Documentos</div>,
}));

vi.mock('../app/pages/user/expeditions/exp_clocks.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-clocks">EXP_CLOCKS Tiempos</div>,
}));

vi.mock('../app/pages/user/expeditions/exp_lic.component', () => ({
  __esModule: true,
  default: (props) => <div data-testid="exp-lic">EXP_LIC Licencia</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_versionNav', () => ({
  __esModule: true,
  default: (props) => <div data-testid="version-nav">Version Nav</div>,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: (props) => <div data-testid="module-nav">Module Nav</div>,
}));

// ─── Mock external libs ────────────────────────────────────────────────────

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.returnObjects) return {};
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) => <Component {...props} t={(k) => k} />,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));
vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  }),
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
  nomens: 'CUB1',
}));

vi.mock('../app/components/global', () => {
  const React = require('react');
  return { GlobalStyles: () => <style data-testid="global-styles" /> };
});

// ─── Import component ──────────────────────────────────────────────────────

import EXPEDITION from '../app/pages/user/expeditions/expedition.page';

// ─── Test helpers ──────────────────────────────────────────────────────────

const defaultProps = {
  translation: {},
  swaMsg: {
    title_wait: 'Espere...',
    text_wait: 'Procesando...',
    generic_eror_title: 'Error',
    generic_error_text: 'Error genérico',
    text_btn: 'OK',
    publish_success_title: 'Éxito',
    publish_success_text: 'Operación exitosa',
    text_footer: 'Footer',
  },
  globals: { id: '1' },
  currentId: 1,
  currentVersion: 1,
  closeModal: vi.fn(),
  requesRefresh: vi.fn(),
  NAVIGATION: vi.fn(),
};

function renderExpedition(props = {}) {
  return render(
    <MemoryRouter>
      <EXPEDITION {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('EXPEDITION — Integración: Módulo Expedición', () => {

  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('1. Renderiza sin crash', async () => {
    const { container } = await act(async () => {
      return renderExpedition();
    });
    expect(container).toBeTruthy();
  });

  test('2. Muestra "CARGANDO INFORMACION..." mientras carga datos', async () => {
    const FUN_SERVICE = (await import('../app/services/fun.service')).default;
    FUN_SERVICE.get.mockReturnValueOnce(new Promise(() => {})); // Never resolves

    await act(async () => {
      renderExpedition();
    });

    expect(screen.getAllByText(/CARGANDO INFORMACION/i).length).toBeGreaterThanOrEqual(1);
  });

  test('3. EXPEDITION_SERVICE.getRecord() se llama al montar', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockClear();

    await act(async () => {
      renderExpedition();
    });

    expect(EXPEDITION_SERVICE.getRecord).toHaveBeenCalledWith(1);
  });

  test('4. FUN_SERVICE.get() se llama con currentId al montar', async () => {
    const FUN_SERVICE = (await import('../app/services/fun.service')).default;
    FUN_SERVICE.get.mockClear();

    await act(async () => {
      renderExpedition();
    });

    expect(FUN_SERVICE.get).toHaveBeenCalledWith(1);
  });

  test('5. RECORD_LAW_SERVICE.getRecord() se llama al montar', async () => {
    const RECORD_LAW_SERVICE = (await import('../app/services/record_law.service')).default;
    RECORD_LAW_SERVICE.getRecord.mockClear();

    await act(async () => {
      renderExpedition();
    });

    expect(RECORD_LAW_SERVICE.getRecord).toHaveBeenCalledWith(1);
  });

  test('6. Muestra botón "GENERAR EXPEDICION EN BLANCO" cuando getRecord devuelve vacío', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      renderExpedition();
    });

    await waitFor(() => {
      expect(screen.getByText(/GENERAR EXPEDICION EN BLANCO/i)).toBeInTheDocument();
    });
  });

  test('7. Click "GENERAR EXPEDICION EN BLANCO" llama EXPEDITION_SERVICE.create()', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockResolvedValueOnce({ data: [] });
    EXPEDITION_SERVICE.create.mockClear();
    EXPEDITION_SERVICE.create.mockResolvedValueOnce({ data: 'OK' });

    await act(async () => {
      renderExpedition();
    });

    const btnGenerar = await screen.findByText(/GENERAR EXPEDICION EN BLANCO/i);
    await act(async () => {
      fireEvent.click(btnGenerar);
    });

    expect(EXPEDITION_SERVICE.create).toHaveBeenCalled();
  });

  test('8. Con record existente, muestra secciones del expediente', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockResolvedValueOnce({
      data: [{ id: 1, fun0Id: 1, version: 1 }],
    });

    await act(async () => {
      renderExpedition();
    });

    await waitFor(() => {
      expect(screen.getByTestId('exp-1')).toBeInTheDocument();
    });
    expect(screen.getByText('EXP_1 Info General')).toBeInTheDocument();
    expect(screen.getByTestId('exp-areas')).toBeInTheDocument();
    expect(screen.getByTestId('exp-2')).toBeInTheDocument();
    expect(screen.getByTestId('exp-docs')).toBeInTheDocument();
    expect(screen.getByTestId('exp-clocks')).toBeInTheDocument();
    expect(screen.getByTestId('exp-lic')).toBeInTheDocument();
  });

  test('9. Navigation components presentes con record existente', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockResolvedValueOnce({
      data: [{ id: 1, fun0Id: 1, version: 1 }],
    });

    await act(async () => {
      renderExpedition();
    });

    await waitFor(() => {
      expect(screen.getByTestId('version-nav')).toBeInTheDocument();
    });
    expect(screen.getByTestId('module-nav')).toBeInTheDocument();
  });

  test('10. FUN_SERVICE.loadPQRSxFUN se llama después de cargar el item', async () => {
    const FUN_SERVICE = (await import('../app/services/fun.service')).default;
    FUN_SERVICE.loadPQRSxFUN.mockClear();

    await act(async () => {
      renderExpedition();
    });

    await waitFor(() => {
      expect(FUN_SERVICE.loadPQRSxFUN).toHaveBeenCalledWith('CUB1-2024-0001');
    });
  });

  test('11. CUSTOM_DATA_SERVICE.loadDictionary_cub_id se llama después de cargar', async () => {
    const CUSTOM_DATA_SERVICE = (await import('../app/services/custom.service')).default;
    CUSTOM_DATA_SERVICE.loadDictionary_cub_id.mockClear();

    await act(async () => {
      renderExpedition();
    });

    await waitFor(() => {
      expect(CUSTOM_DATA_SERVICE.loadDictionary_cub_id).toHaveBeenCalledWith('CUB1-2024-0001');
    });
  });

  test('12. Renderiza correctamente con diferentes currentVersion', async () => {
    const EXPEDITION_SERVICE = (await import('../app/services/expedition.service')).default;
    EXPEDITION_SERVICE.getRecord.mockResolvedValueOnce({
      data: [{ id: 1, fun0Id: 1, version: 2 }],
    });

    await act(async () => {
      renderExpedition({ currentVersion: 2 });
    });

    await waitFor(() => {
      expect(screen.getByTestId('exp-1')).toBeInTheDocument();
    });
  });
});
