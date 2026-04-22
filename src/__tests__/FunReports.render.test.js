/**
 * RENDER TESTS — fun_g_reports, fun_g_reportMaster, fun_report_data
 *
 * Regression render tests: verify each component mounts without crashing.
 * These are pure display/report components — no service calls on mount.
 * They receive currentItem directly as a prop.
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

// ─── UI component mocks ──────────────────────────────────────────────────────

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'vizualizer-stub' }),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (v) => v ?? '',
  dateParser_finalDate: (v) => v ?? '',
  dateParser_dateDiff: () => 0,
  dateParser_timePassed: (v) => v ?? '',
  regexChecker_isPh: () => false,
  regexChecker_movTierra: () => false,
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUN_G_REPORTS from '../app/pages/user/fun_forms/components/fun_g_reports.component';
import FUN_G_REPORT_MASTER from '../app/pages/user/fun_forms/components/fun_g_reportMaster.compoentn';
import FUN_REPORT_DATA from '../app/pages/user/fun_forms/components/fun_report_data';

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
  fun_1s: [],
  fun_2: null,
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
  fun_6s: [],
  fun_clocks: [],
  fun_law: null,
  record_law: null,
  record_arc: null,
  record_eng: null,
  record_ph: null,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FunReports — Render (fun_g_reports, fun_g_reportMaster, fun_report_data)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  // ── fun_g_reports ─────────────────────────────────────────────────────────

  test('fun_g_reports renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_G_REPORTS
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
            nomenclature="CUB1-2024-0001"
            noLaw={false}
            noArc={false}
            noEng={false}
            id={1}
            textAlign="left"
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_g_reports renders with full currentItem data', async () => {
    const fullItem = {
      ...minimalCurrentItem,
      fun_1s: [
        {
          id: 1,
          tipo: 'D',
          tramite: 'A',
          m_urb: '',
          m_sub: '',
          m_lic: 'A',
          usos: 'A',
          area: 'A',
          vivienda: 'A',
          cultural: 'B',
          regla_1: '',
          regla_2: '',
        },
      ],
      fun_clocks: [
        { id: 1, state: 1, version: 1, date_start: '2024-01-01', desc: 'Radicación' },
        { id: 2, state: 3, version: 1, date_start: '2024-02-01', desc: 'Visita' },
        { id: 3, state: 30, version: 1, date_start: '2024-03-01', desc: 'CUMPLE' },
        { id: 4, state: 50, version: 1, date_start: '2024-04-01', desc: 'Resolución' },
      ],
      record_law: {
        version: 1,
        worker_name: 'Abogado Test',
        worker_id: 'A001',
        date_asign: '2024-01-05',
        worker_prev: '',
        record_law_reviews: [{ id: 1, desc: 'CUMPLE' }],
      },
      record_arc: {
        version: 1,
        worker_name: 'Arq Test',
        worker_id: 'R001',
        date_asign: '2024-01-05',
        worker_prev: '',
        record_arc_38s: [{ id: 1, desc: 'CUMPLE' }],
      },
      record_eng: {
        version: 1,
        worker_name: 'Ing Test',
        worker_id: 'E001',
        date_asign: '2024-01-05',
        worker_prev: '',
        record_eng_reviews: [{ id: 1, desc: 'CUMPLE' }],
      },
      record_ph: [],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_G_REPORTS
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={fullItem}
            currentVersion={1}
            nomenclature="CUB1-2024-0001"
            noLaw={false}
            noArc={false}
            noEng={false}
            id={1}
            textAlign="left"
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  // ── fun_g_reportMaster ────────────────────────────────────────────────────

  test('fun_g_reportMaster renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_G_REPORT_MASTER
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
            nomenclature="CUB1-2024-0001"
            noLaw={false}
            noArc={false}
            noEng={false}
            id={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_g_reportMaster renders with clock state 30 data', async () => {
    const itemWithClock30 = {
      ...minimalCurrentItem,
      fun_1s: [{ id: 1, tipo: 'D', tramite: 'A', m_urb: '', m_sub: '', m_lic: 'A', area: 'A' }],
      fun_clocks: [
        { id: 1, state: 30, version: 1, date_start: '2024-03-01', desc: 'CUMPLE - Aprobado' },
        { id: 2, state: 50, version: 1, date_start: '2024-04-15', desc: 'Resolución Emitida' },
        { id: 3, state: 5, version: 1, date_start: '2024-04-20', desc: 'Notificado' },
      ],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_G_REPORT_MASTER
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={itemWithClock30}
            currentVersion={1}
            nomenclature="CUB1-2024-0001"
            noLaw={false}
            noArc={false}
            noEng={false}
            id={1}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  // ── fun_report_data ───────────────────────────────────────────────────────

  test('fun_report_data renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_REPORT_DATA
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_report_data renders with fun_law report data', async () => {
    const itemWithLaw = {
      ...minimalCurrentItem,
      fun_6s: [
        { id: 10, description: 'Oficio SPM', path: 'uploads/fun', filename: 'doc.pdf' },
      ],
      fun_law: {
        id: 1,
        report_data: '1,CUB1-2024-OFI-001,2024-01-20,0,0,0',
        report_cub: 'CUB1-2024-OFI-001',
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_REPORT_DATA
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={itemWithLaw}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_report_data renders with null fun_law gracefully', async () => {
    const itemNullLaw = {
      ...minimalCurrentItem,
      fun_law: null,
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_REPORT_DATA
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={itemNullLaw}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);
});
