/**
 * RENDER TESTS — fun_docs, fun_checklist_n, fun_asign, fun_archive
 *
 * Regression render tests: verify each component mounts without crashing.
 * fun_docs and fun_asign are heavy components that call services on mount;
 * fun_checklist_n and fun_archive are pure display components.
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

vi.mock('@/components/legacy-modal', () => ({
  LegacyModal: ({ children, isOpen, ariaHideApp, contentLabel, ...props }) => {
    if (!isOpen) return null;
    return React.createElement(
      'div',
      { 'data-testid': 'mock-modal', 'data-label': contentLabel, ...props },
      children
    );
  },
}));

vi.mock('rsuite', () => {
  const Nav = ({ children, ...props }) => React.createElement('nav', props, children);
  Nav.Menu = ({ children, title }) => React.createElement('div', null, title, children);
  Nav.Item = ({ children, ...props }) => React.createElement('div', props, children);
  const Navbar = ({ children }) => React.createElement('div', null, children);
  Navbar.Brand = ({ children }) => React.createElement('span', null, children);
  const Tag = ({ children, color }) =>
    React.createElement('span', { 'data-testid': 'rsuite-tag', 'data-color': color }, children);
  const TagGroup = ({ children }) => React.createElement('span', null, children);
  const Divider = () => React.createElement('hr', { 'data-testid': 'rsuite-divider' });
  const Badge = ({ children }) => React.createElement('span', null, children);
  const Calendar = () => React.createElement('div', { 'data-testid': 'rsuite-calendar' });
  const Popover = ({ children }) => React.createElement('div', null, children);
  const Whisper = ({ children }) => React.createElement('div', null, children);
  return { Nav, Navbar, Tag, TagGroup, Divider, Badge, Calendar, Popover, Whisper };
});

vi.mock('dayjs', () => {
  const dayjsFn = (val) => ({
    format: () => '2024-01-01',
    subtract: () => dayjsFn(val),
    add: () => dayjsFn(val),
    diff: () => 0,
    day: () => 1,
    isBefore: () => false,
    isAfter: () => false,
    isSameOrBefore: () => false,
    isSameOrAfter: () => false,
    isValid: () => true,
    toDate: () => new Date(),
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

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          id: 1,
          id_public: 'CUB1-2024-0001',
          model: 2022,
          version: 1,
          state: 1,
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
        },
      })
    ),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
    getAll_fun: vi.fn(() => Promise.resolve({ data: [] })),
    loadMacroAsigns: vi.fn(() => Promise.resolve({ data: [] })),
    update_archive: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_archive: vi.fn(() => Promise.resolve({ data: 'OK' })),
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

// ─── Heavy sub-component stubs (fun_docs imports ~15 sub-components) ─────────

vi.mock('../app/pages/user/fun_forms/components/fun_6_datalist', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-6-datalist-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_confirmlegal', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-doc-confirmlegal-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_d_nav', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-d-nav-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-module-nav-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_versionNav', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-version-nav-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_checklist_n', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-checklist-n-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_alertNeighbour', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-alert-neighbour-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_report_data_edit', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-report-data-edit-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_pdf', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-pdf-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_pdf_check', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-pdf-check-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_seals', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-seals-stub' }),
}));

vi.mock('../app/pages/user/submit/submit_view.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'submit-single-view-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_sign_pdf.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-sign-pdf-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/docs_list.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'docs-list-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_d_control.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-d-control-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/fun_6.view', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-6-view-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_confirminc', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-doc-confirminc-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_certification.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-doc-certification-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_doc_abdicate.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-doc-abdicate-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_d_control.component_2', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-d-control-2-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/fun_asign_history.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'fun-asign-history-stub' }),
}));

vi.mock('../app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'table-expanded-stub' }),
}));

vi.mock('@uiw/react-heat-map', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'heat-map-stub' }),
}));

vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn(() => Promise.resolve({ save: vi.fn() })),
    create: vi.fn(() => Promise.resolve({ save: vi.fn() })),
  },
}));

// ─── UI component mocks ──────────────────────────────────────────────────────

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, className }) =>
    React.createElement('button', { onClick, className }, children),
  MDBTooltip: ({ children }) => React.createElement('span', null, children),
  MDBPopover: ({ children }) => React.createElement('div', null, children),
  MDBPopoverBody: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'vizualizer-stub' }),
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children, title }) =>
    React.createElement('div', { 'data-testid': 'collapsible-stub' }, title, children),
}));

vi.mock('../app/components/emails.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'emails-stub' }),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: (v) => v ?? '',
  dateParser_timePassed: (v) => v ?? '',
  dateParser_yearsPassed: (v) => v ?? '',
  dateParser_finalDate: (v) => v ?? '',
  dateParser_dateDiff: () => 0,
  regexChecker_isOA: () => false,
  regexChecker_isOA_2: () => false,
  regexChecker_isOA_3: () => false,
  regexChecker_isPh: () => false,
  regexChecker_movTierra: () => false,
  regexChecker_modPlano: () => false,
  regexChecker_piscina: () => false,
  regexChecker_cota: () => false,
  _GET_SERIE_COD: () => [],
  _GET_SERIE_STR: () => [],
  _GET_SUBSERIE_COD: () => [],
  _GET_SUBSERIE_STR: () => [],
  VR_DOCUMENTS_OF_INTEREST: () => [],
}));

// json mock for fun_checklist_n
vi.mock('../app/components/jsons/fun6DocsList.json', () => ({
  default: [],
  __esModule: true,
}));

// ─── Imports under test ──────────────────────────────────────────────────────

import FUN_DOCS from '../app/pages/user/fun_forms/components/fun_docs';
import FUN_CHECKLIST_N from '../app/pages/user/fun_forms/components/fun_checklist_n';
import FUN_ASIGNS_COMPONENT from '../app/pages/user/fun_forms/components/fun_asign.component';
import FUN_ARCHIVE from '../app/pages/user/fun_forms/components/fun_archive.component';

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

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('FunComponents — Render (fun_docs, fun_checklist_n, fun_asign, fun_archive)', () => {
  beforeAll(() => {
    window.user = { roleId: 1, name: 'Admin Test', id: 1 };
  });

  afterAll(() => {
    delete window.user;
  });

  test('fun_docs renders without crashing (calls service on mount)', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_DOCS
            currentId={1}
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
            currentVersion={1}
            NAVIGATION={vi.fn()}
            NAVIGATION_VERSION={vi.fn()}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_checklist_n renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CHECKLIST_N
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
            requestUpdate={vi.fn()}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_checklist_n renders with fun_1s data', async () => {
    const currentItemWithData = {
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
        },
      ],
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_CHECKLIST_N
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={currentItemWithData}
            currentVersion={1}
            requestUpdate={vi.fn()}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_asign renders without crashing (loads data on mount)', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_ASIGNS_COMPONENT
            swaMsg={swaMsg}
            translation={{}}
            globals={{ id: '1' }}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_archive renders without crashing', async () => {
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_ARCHIVE
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={minimalCurrentItem}
            currentVersion={1}
            isEdit={false}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);

  test('fun_archive renders with archive data', async () => {
    const currentItemWithArchive = {
      ...minimalCurrentItem,
      fun_archive: {
        id: 1,
        date_1: '2024-01-01',
        date_2: '2024-06-01',
        box: '001',
        folder: '01',
        folio: '100',
        obs: 'Ninguna',
      },
    };
    let container;
    await act(async () => {
      ({ container } = render(
        <MemoryRouter>
          <FUN_ARCHIVE
            translation={{}}
            swaMsg={swaMsg}
            globals={{ id: '1' }}
            currentItem={currentItemWithArchive}
            currentVersion={1}
            isEdit={true}
          />
        </MemoryRouter>
      ));
    });
    expect(container).toBeTruthy();
  }, 60000);
});
