/**
 * RENDER TESTS — fun_n_1, fun_n_2, fun_n_3, fun_n_4
 *
 * Regression render tests: verify each component mounts without crashing.
 * Services, heavy sub-components, and external libs are all stubbed out.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── External mocks (react-i18next, swal, rsuite, react-modal, vars, etc.) ──
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.returnObjects ? {} : key),
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) =>
    React.createElement(Component, { ...props, t: (k) => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: { name: 'Test', city: 'test', nit: '0', email: 'test@test.com' },
  nomens: 'CUB1',
}));

// ─── Service mocks ───────────────────────────────────────────────────────────

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create_fun1: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_1: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun2: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_2: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun3: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_3: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_3: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun4: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_4: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

// ─── UI component mocks ──────────────────────────────────────────────────────

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, className }) =>
    React.createElement('button', { onClick, className }, children),
  MDBTooltip: ({ children }) => React.createElement('span', null, children),
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: ({ data, columns, noDataComponent }) =>
    React.createElement('div', { 'data-testid': 'datatable-stub' }, noDataComponent),
}));

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'vizualizer-stub' }),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (v) => v ?? '',
  dateParser_timePassed: (v) => v ?? '',
  dateParser_yearsPassed: (v) => v ?? '',
  dateParser_finalDate: (v) => v ?? '',
  dateParser_dateDiff: () => 0,
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUNN1 from '../app/pages/user/fun_forms/fun_n_1';
import FUNN2 from '../app/pages/user/fun_forms/fun_n_2';
import FUNN3 from '../app/pages/user/fun_forms/fun_n_3';
import FUNN4 from '../app/pages/user/fun_forms/fun_n_4';

// ─── Minimal props shared by all fun_n_* components ─────────────────────────

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  generic_eror_title: 'Error',
  generic_error_text: 'Error genérico',
  text_btn: 'OK',
  publish_success_title: 'Éxito',
  publish_success_text: 'Operación exitosa',
  text_footer: 'Footer',
};

const minimalCurrentItem = {
  id: 1,
  model: 2022,
  version: 1,
  fun_1s: [],
  fun_2: null,
  fun_3s: [],
  fun_4s: [],
  fun_6s: [],
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_clocks: [],
};

const baseProps = {
  translation: {},
  swaMsg,
  globals: { id: '1' },
  currentItem: minimalCurrentItem,
  currentVersion: 1,
  requestUpdate: vi.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FunForms — Render (fun_n_1 through fun_n_4)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('fun_n_1 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN1 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_1 renders with currentItem that has fun_1s data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_1s: [{ id: 10, tipo: 'AD', tramite: 'A', m_urb: 'A', m_sub: '', m_lic: 'A', usos: 'A', area: 'A', vivienda: 'A', cultural: 'A', regla_1: 'A', regla_2: 'A' }],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN1 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_2 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN2 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_2 renders with currentItem that has fun_2 data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_2: {
          id: 20,
          direccion: 'Calle 1',
          direccion_ant: '',
          matricula: '001-001',
          catastral: '001-01-0001-0001-001',
          catastral_2: '',
          suelo: 'A',
          lote_pla: 'A',
          barrio: 'Centro',
          vereda: '',
          comuna: '1',
          sector: '',
          corregimiento: '',
          lote: '1',
          estrato: 3,
          manzana: '5',
        },
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN2 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_3 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN3 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_3 renders with neighbour data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_3s: [
          { id: 1, direccion_1: 'Calle Norte 1', direccion_2: 'Ap 101', part: 'SI', part_id: 'CUB1-2024-0001', state: 1, alerted: '2024-01-15', alters_info: '', id_6: null, id_cub: '', extra: false },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN3 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_4 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN4 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_4 renders with lindero data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_4s: [
          { id: 1, coord: 'NORTE', longitud: '10.5', colinda: 'Calle 1' },
          { id: 2, coord: 'SUR', longitud: '10.5', colinda: 'Carrera 2' },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN4 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);
});
