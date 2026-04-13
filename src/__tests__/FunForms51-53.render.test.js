/**
 * RENDER TESTS — fun_n_51, fun_n_52, fun_n_53
 *
 * Regression render tests: verify each component mounts without crashing.
 * fun_n_52 imports moment, rsuite/Divider, profesionals.service, HTMLDatalist.
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ─── External mocks ──────────────────────────────────────────────────────────

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

vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  }),
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

// rsuite — fun_n_52 imports Divider from rsuite
vi.mock('rsuite', () => {
  const Nav = ({ children, ...props }) => React.createElement('nav', props, children);
  Nav.Menu = ({ children, title }) => React.createElement('div', null, title, children);
  Nav.Item = ({ children, ...props }) => React.createElement('div', props, children);
  const Navbar = ({ children }) => React.createElement('div', null, children);
  Navbar.Brand = ({ children }) => React.createElement('span', null, children);
  const Tag = ({ children, color }) =>
    React.createElement('span', { 'data-testid': 'rsuite-tag', 'data-color': color }, children);
  const TagGroup = ({ children }) => React.createElement('span', null, children);
  const Divider = ({ children }) => React.createElement('hr', { 'data-testid': 'rsuite-divider' });
  return { Nav, Navbar, Tag, TagGroup, Divider };
});

// moment — used by fun_n_52 via require('moment')
vi.mock('moment', () => {
  const momentFn = (val) => ({
    format: () => '2024-01-01',
    subtract: () => momentFn(val),
    add: () => momentFn(val),
    diff: () => 0,
    isBefore: () => false,
    isAfter: () => false,
    isValid: () => true,
    toDate: () => new Date(),
  });
  momentFn.isMoment = () => false;
  return { default: momentFn, __esModule: true };
});

// ─── Service mocks ───────────────────────────────────────────────────────────

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    create_fun51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_51: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_52: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun53: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_53: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/profesionals.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// ─── UI component mocks ──────────────────────────────────────────────────────

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, className }) =>
    React.createElement('button', { onClick, className }, children),
  MDBTooltip: ({ children }) => React.createElement('span', null, children),
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ data, noDataComponent }) =>
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

vi.mock('../app/components/HTMLDatalist', () => ({
  __esModule: true,
  default: ({ id, list }) =>
    React.createElement('div', { 'data-testid': 'html-datalist-stub', id }),
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUNN51 from '../app/pages/user/fun_forms/fun_n_51';
import FUNN52 from '../app/pages/user/fun_forms/fun_n_52';
import FUNN53 from '../app/pages/user/fun_forms/fun_n_53';

// ─── Shared props ────────────────────────────────────────────────────────────

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

describe('FunForms51-53 — Render (fun_n_51, fun_n_52, fun_n_53)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('fun_n_51 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN51 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_51 renders with titular data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_51s: [
          {
            id: 1,
            type: 'PERSONA NATURAL',
            name: 'Juan',
            surname: 'Pérez',
            id_number: '12345678',
            email: 'juan@test.com',
            nunber: '3001234567',
            role: 'PROPIETARIO',
            active: 1,
            docs: '0,0',
            rep_name: '',
            rep_id_number: '',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN51 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_52 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN52 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_52 renders with professional data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_52s: [
          {
            id: 1,
            type: 'Arquitecto',
            name: 'Ana',
            surname: 'López',
            id_number: '87654321',
            email: 'ana@test.com',
            number: '3109876543',
            registration: 'ARQ-12345',
            registration_date: '2020-01-01',
            active: 1,
            docs: '0,0,0,0',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN52 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_n_53 renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN53 {...baseProps} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
    expect(container.querySelector('fieldset')).toBeTruthy();
  }, 60000);

  test('fun_n_53 renders with responsable data', async () => {
    const props = {
      ...baseProps,
      currentItem: {
        ...minimalCurrentItem,
        fun_53s: [
          {
            id: 1,
            name: 'Carlos',
            surname: 'García',
            id_number: '11223344',
            role: 'APODERADO',
            number: '3001122334',
            email: 'carlos@test.com',
            address: 'Calle 10 #5-20',
            docs: '0,0',
          },
        ],
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNN53 {...props} />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);
});
