/**
 * RENDER TESTS — fun_clock, fun_c_clocks, fun_clock_control, fun_clocks_events
 *
 * Regression render tests: verify each component mounts without crashing.
 * fun_clock calls FUN_SERVICE.get() on mount; sub-components are stubbed.
 * fun_clocks_events reads window.user.roleId at module init time.
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

vi.mock('react-modal', () => ({
  __esModule: true,
  default: ({ children, isOpen, ariaHideApp, contentLabel, ...props }) => {
    if (!isOpen) return null;
    return React.createElement(
      'div',
      { 'data-testid': 'mock-modal', 'data-label': contentLabel, ...props },
      children
    );
  },
}));

vi.mock('dayjs', () => {
  const dayjsFn = (val) => ({
    format: (fmt) => '2024-01-01',
    subtract: () => dayjsFn(val),
    add: () => dayjsFn(val),
    diff: () => 0,
    isBefore: () => false,
    isAfter: () => false,
    isSameOrBefore: () => false,
    isSameOrAfter: () => false,
    isValid: () => true,
    toDate: () => new Date(),
    valueOf: () => 0,
    startOf: () => dayjsFn(val),
    endOf: () => dayjsFn(val),
    clone: () => dayjsFn(val),
  });
  dayjsFn.extend = () => {};
  dayjsFn.locale = () => {};
  dayjsFn.isDayjs = () => false;
  return { default: dayjsFn, __esModule: true };
});

// ─── Service mocks ───────────────────────────────────────────────────────────

const mockFunItem = {
  id: 1,
  id_public: 'CUB1-2024-0001',
  model: 2022,
  version: 1,
  state: 1,
  clock_payment: '2024-01-10',
  fun_1s: [],
  fun_2: null,
  fun_3s: [],
  fun_4s: [],
  fun_6s: [],
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_clocks: [],
  fun_archive: null,
  record_law: null,
  record_arc: null,
  record_eng: null,
  record_ph: null,
};

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: mockFunItem })),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
    create_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/users.service', () => ({
  __esModule: true,
  default: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getAllWorkers: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
}));

// ─── Sub-component stubs ─────────────────────────────────────────────────────

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-module-nav-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/clocks_control.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'clocks-control-stub' }),
}));

vi.mock('../app/components/emails.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'emails-stub' }),
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
  dateParser_finalDate: (v) => v ?? '',
  dateParser_dateDiff: () => 0,
  dateParser_timePassed: (v) => v ?? '',
  regexChecker_isOA_2: () => false,
  regexChecker_isPh: () => false,
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUNCLOCK from '../app/pages/user/fun_forms/fun_clock';
import FUN_C_CLOCKS from '../app/pages/user/fun_forms/components/fun_c_clocks.component';
import FUN_CLOCK_CONTROL from '../app/pages/user/fun_forms/components/fun_clock_control';
import FUN_CLOCK_EVENTS from '../app/pages/user/fun_forms/components/fun_clocks_events.component';

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
  id_public: 'CUB1-2024-0001',
  model: 2022,
  version: 1,
  state: 1,
  clock_payment: '2024-01-10',
  fun_1s: [],
  fun_2: null,
  fun_3s: [],
  fun_4s: [],
  fun_6s: [],
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_clocks: [],
  fun_archive: null,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FunClocks — Render (fun_clock, fun_c_clocks, fun_clock_control, fun_clocks_events)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('fun_clock renders without crashing (calls service on mount)', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUNCLOCK
            currentId={1}
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentVersion={1}
            requesRefresh={vi.fn()}
            NAVIGATION={vi.fn()}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_c_clocks renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_C_CLOCKS
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_c_clocks renders with clock data', async () => {
    const currentItemWithClocks = {
      ...minimalCurrentItem,
      fun_1s: [{ id: 1, tramite: 'A', tipo: 'D', m_urb: '', m_sub: '', m_lic: 'A', area: 'A' }],
      fun_clocks: [
        { id: 1, state: 1, version: 1, date_start: '2024-01-01', desc: 'Radicación', name: 'Admin' },
        { id: 2, state: 3, version: 1, date_start: '2024-02-01', desc: 'Revisión', name: 'Admin' },
      ],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_C_CLOCKS
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentItem={currentItemWithClocks}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_clock_control renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CLOCK_CONTROL
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_clock_control renders with version history clocks', async () => {
    const itemWithClocks = {
      ...minimalCurrentItem,
      fun_clocks: [
        { id: 1, state: 1, version: 1, date_start: '2024-01-01', desc: 'Radicación' },
        { id: 2, state: 3, version: 1, date_start: '2024-02-01', desc: 'Revisión' },
        { id: 3, state: 5, version: 1, date_start: '2024-03-01', desc: 'Resolución' },
      ],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CLOCK_CONTROL
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={itemWithClocks}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_clocks_events renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CLOCK_EVENTS
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_clocks_events renders with event data', async () => {
    const itemWithEvents = {
      ...minimalCurrentItem,
      fun_clocks: [
        {
          id: 1,
          state: 0,
          version: 1,
          date_start: '2024-01-15',
          desc: 'Evento de prueba',
          name: 'Admin;Solicitante',
        },
      ],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CLOCK_EVENTS
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentItem={itemWithEvents}
            currentVersion={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);
});
