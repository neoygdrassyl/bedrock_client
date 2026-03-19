/**
 * RENDER TESTS — PQRS Components (Regression)
 *
 * Covers:
 *   - pqrs_gen          (PQRS_COMPONENT_INFO)
 *   - pqrs_manage_info  (PQRS_EDIT_INFO)
 *   - pqrs_manage_contact (PQRS_EDIT_CONTACT)
 *   - pqrs_manage_fun   (PQRS_EDIT_FUN)
 *
 * Each test verifies the component renders without crashing (regression smoke check).
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

// ─── Hoist service mocks ─────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  pqrsMainService: {
    getlastid: vi.fn(() => Promise.resolve({ data: [{ id_publico: 'VR-2024-0001' }] })),
    getlascub: vi.fn(() => Promise.resolve({ data: [{ cub: 'CUB-2024-0001' }] })),
    update_main: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_contact: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_contact: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_contact: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_fun: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_fun: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsMainService,
}));

// ─── Stub heavy sub-components ───────────────────────────────────────────────

vi.mock('../app/pages/user/pqrs/components/pqrs_emails.component', () => ({
  __esModule: true,
  default: () => <div data-testid="pqrs-emails-stub" />,
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: ({ data = [] }) => <div data-testid="datatable-stub">{data.length}</div>,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: vi.fn((d) => d || ''),
  dateParser_finalDate: vi.fn(() => ''),
  dateParser_dateDiff: vi.fn(() => 0),
  regexChecker_isOA_2: vi.fn(() => false),
  regexChecker_isPh: vi.fn(() => false),
  formsParser1: vi.fn(() => ''),
  _MANAGE_IDS: vi.fn((id) => id),
  _CALCULATE_EXPENSES: vi.fn(() => ({ cf: 0, cv: 0, ct: 0 })),
}));

vi.mock('../app/components/ui', () => ({
  MDBTooltip: ({ children }) => <>{children}</>,
  MDBBtn: ({ children, ...props }) => <button {...props}>{children}</button>,
  MDBCollapse: ({ children }) => <div>{children}</div>,
}));

// ─── Shared props ─────────────────────────────────────────────────────────────

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

const translation_form = {
  form_type_request: ['Petición', 'Queja'],
  form_radication_chanel: ['Email', 'Presencial'],
  form_category_request: ['General', 'Específica'],
};

const minimalCurrentItem = {
  id: 1,
  id_publico: 'VR-2024-0001',
  id_global: 'GLOBAL-001',
  id_correspondency: 'CORR-001',
  id_reply: 'REP-001',
  status: 0,
  type: 'Petición General',
  content: 'Contenido de prueba',
  keywords: 'test,prueba',
  pqrs_info: {
    id: 1,
    reply: '',
    radication_channel: 'Email',
  },
  pqrs_time: {
    id: 1,
    time: 15,
    creation: '2024-03-01 09:00:00',
    legal: '2024-03-01',
    reply_formal: null,
  },
  pqrs_law: {
    id: 1,
    extension: false,
    extension_date: '',
    extension_reason: '',
  },
  pqrs_contacts: [],
  pqrs_workers: [],
  pqrs_solocitors: [],
  pqrs_fun: null,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PQRS Components — Render', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete window.user;
  });

  // ── pqrs_gen ────────────────────────────────────────────────────────────────

  test('pqrs_gen renders without crashing', async () => {
    const { default: PQRS_COMPONENT_INFO } = await import(
      '../app/pages/user/pqrs/components/pqrs_gen.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_INFO
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          translation_form={translation_form}
          currentItem={minimalCurrentItem}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_gen renders with status 0 (ACTIVO)', async () => {
    const { default: PQRS_COMPONENT_INFO } = await import(
      '../app/pages/user/pqrs/components/pqrs_gen.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_INFO
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          translation_form={translation_form}
          currentItem={{ ...minimalCurrentItem, status: 0 }}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  test('pqrs_gen renders with status 1 (CERRADO)', async () => {
    const { default: PQRS_COMPONENT_INFO } = await import(
      '../app/pages/user/pqrs/components/pqrs_gen.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_INFO
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          translation_form={translation_form}
          currentItem={{ ...minimalCurrentItem, status: 1 }}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_manage_info ────────────────────────────────────────────────────────

  test('pqrs_manage_info renders without crashing', async () => {
    const { default: PQRS_EDIT_INFO } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_info.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_INFO
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          translation_form={translation_form}
          currentItem={minimalCurrentItem}
          refreshCurrentItem={vi.fn()}
          refreshList={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_manage_info renders with extension=true', async () => {
    const { default: PQRS_EDIT_INFO } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_info.component'
    );
    const itemWithExtension = {
      ...minimalCurrentItem,
      pqrs_law: {
        id: 1,
        extension: true,
        extension_date: '2024-04-01',
        extension_reason: 'Motivo de prueba',
      },
    };
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_INFO
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          translation_form={translation_form}
          currentItem={itemWithExtension}
          refreshCurrentItem={vi.fn()}
          refreshList={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_manage_contact ─────────────────────────────────────────────────────

  test('pqrs_manage_contact renders without crashing', async () => {
    const { default: PQRS_EDIT_CONTACT } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_contact.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_CONTACT
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          refreshCurrentItem={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_manage_contact renders with existing contacts', async () => {
    const { default: PQRS_EDIT_CONTACT } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_contact.component'
    );
    const itemWithContacts = {
      ...minimalCurrentItem,
      pqrs_contacts: [
        {
          id: 1,
          address: 'Calle 10 # 5-20',
          neighbour: 'Centro',
          phone: '3001234567',
          state: 'Santander',
          county: 'Bucaramanga',
          email: 'contact@test.com',
          notify: true,
          notify_confirm: 0,
          notify_confirm_date: null,
          notify_extension: 0,
          notify_extension_date: null,
          notify_reply: 0,
          notify_date: null,
        },
      ],
    };
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_CONTACT
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemWithContacts}
          refreshCurrentItem={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_manage_fun ─────────────────────────────────────────────────────────

  test('pqrs_manage_fun renders without crashing (no pqrs_fun)', async () => {
    const { default: PQRS_EDIT_FUN } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_fun.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_FUN
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          refreshCurrentItem={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_manage_fun renders with pqrs_fun data', async () => {
    const { default: PQRS_EDIT_FUN } = await import(
      '../app/pages/user/pqrs/components/pqrs_manage_fun.component'
    );
    const itemWithFun = {
      ...minimalCurrentItem,
      pqrs_fun: {
        id: 5,
        id_public: 'CUB-2024-0050',
        person: 'TITULAR DE LA ACTUACIÓN',
        catastral: '123456789',
      },
    };
    const { container } = render(
      <MemoryRouter>
        <PQRS_EDIT_FUN
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemWithFun}
          refreshCurrentItem={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);
});
