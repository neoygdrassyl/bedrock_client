/**
 * RENDER TESTS — PQRS Reply Components (Regression)
 *
 * Covers:
 *   - pqrs_replies_1  (PQRS_COMPONENT_REPLIES_PROFESIONAL)
 *   - pqrs_replies_2  (PQRS_COMPONENT_REPLIES_TOSOLICITOR)
 *   - pqrs_replies_3  (PQRS_COMPONENT_REPLIES_PROFESIONAL_2)
 *   - pqrs_rteReply   (RTE_PQRS)
 *   - pqrs_setReply   (PQRS_SET_REPLY)
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
    get: vi.fn(() =>
      Promise.resolve({
        data: {
          id: 1,
          id_publico: 'VR-2024-0001',
          id_reply: 'REP-001',
          pqrs_info: { id: 1, reply: 'Respuesta de prueba', radication_channel: 'Email' },
          pqrs_time: { id: 1, time: 15, creation: '2024-03-01 09:00:00', legal: '2024-03-01', reply_formal: null },
          pqrs_law: { id: 1, extension: false },
          pqrs_contacts: [{ id: 1, email: 'test@test.com', notify: true, address: 'Calle 1' }],
          pqrs_solocitors: [{ id: 1, name: 'Juan Prueba' }],
          pqrs_workers: [],
        },
      })
    ),
    getlascub: vi.fn(() => Promise.resolve({ data: [{ cub: 'CUB-2024-0001' }] })),
    formalReply: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsMainService,
}));

// ─── Stub heavy sub-components ───────────────────────────────────────────────

vi.mock('react-quill-new', () => ({
  __esModule: true,
  default: ({ value, onChange, ...props }) => (
    <div data-testid="quill-stub">
      <textarea
        data-testid="quill-editor"
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('react-quill-new/dist/quill.snow.css', () => ({}));

vi.mock('quill-to-pdf', () => ({
  pdfExporter: vi.fn(() => Promise.resolve(new Blob())),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    fromHTML: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
  })),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: vi.fn((d) => d || ''),
  dateParser_finalDate: vi.fn(() => ''),
  dateParser_dateDiff: vi.fn(() => 0),
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'Bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
    serials: { start: 'VR', end: 'CUB' },
    m: 1,
  },
  nomens: 'CUB1',
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

const minimalCurrentItem = {
  id: 1,
  id_publico: 'VR-2024-0001',
  id_global: 'GLOBAL-001',
  id_reply: 'REP-001',
  status: 0,
  type: 'Petición General',
  content: 'Contenido de prueba',
  pqrs_info: {
    id: 1,
    reply: 'Respuesta formal aquí',
    radication_channel: 'Email',
  },
  pqrs_time: {
    id: 1,
    time: 15,
    creation: '2024-03-01 09:00:00',
    legal: '2024-03-01',
    reply_formal: '2024-03-10',
  },
  pqrs_law: {
    id: 1,
    extension: false,
  },
  pqrs_contacts: [
    {
      id: 1,
      email: 'contact@test.com',
      notify: true,
      address: 'Calle 10 # 5-20',
    },
  ],
  pqrs_solocitors: [
    { id: 1, name: 'Carlos Peticionario' },
  ],
  pqrs_workers: [
    {
      id: 1,
      name: 'Profesional Test',
      roleId: 1,
      competence: 'Arquitectura',
      asign: '2024-03-01',
      date_reply: '2024-03-05',
      reply: 'Concepto técnico favorable',
    },
  ],
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PQRS Reply Components — Render', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete window.user;
  });

  // ── pqrs_replies_1 ──────────────────────────────────────────────────────────

  test('pqrs_replies_1 renders without crashing', async () => {
    const { default: PQRS_COMPONENT_REPLIES_PROFESIONAL } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_1.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_PROFESIONAL
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_replies_1 renders with empty workers list', async () => {
    const { default: PQRS_COMPONENT_REPLIES_PROFESIONAL } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_1.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_PROFESIONAL
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={{ ...minimalCurrentItem, pqrs_workers: [] }}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_replies_2 ──────────────────────────────────────────────────────────

  test('pqrs_replies_2 renders without crashing', async () => {
    const { default: PQRS_COMPONENT_REPLIES_TOSOLICITOR } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_2.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_TOSOLICITOR
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_replies_2 renders with no reply_formal date', async () => {
    const { default: PQRS_COMPONENT_REPLIES_TOSOLICITOR } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_2.component'
    );
    const itemNoReply = {
      ...minimalCurrentItem,
      pqrs_time: { ...minimalCurrentItem.pqrs_time, reply_formal: null },
    };
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_TOSOLICITOR
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemNoReply}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_replies_3 ──────────────────────────────────────────────────────────

  test('pqrs_replies_3 renders without crashing', async () => {
    const { default: PQRS_COMPONENT_REPLIES_PROFESIONAL_2 } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_3.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_PROFESIONAL_2
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_replies_3 renders with worker missing reply', async () => {
    const { default: PQRS_COMPONENT_REPLIES_PROFESIONAL_2 } = await import(
      '../app/pages/user/pqrs/components/pqrs_replies_3.component'
    );
    const itemNoWorkerReply = {
      ...minimalCurrentItem,
      pqrs_workers: [
        {
          id: 2,
          name: 'Sin Respuesta',
          roleId: 2,
          competence: 'Ingeniería',
          asign: '2024-03-01',
          date_reply: '2024-03-08',
          reply: null,
        },
      ],
    };
    const { container } = render(
      <MemoryRouter>
        <PQRS_COMPONENT_REPLIES_PROFESIONAL_2
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemNoWorkerReply}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_rteReply ───────────────────────────────────────────────────────────

  test('pqrs_rteReply renders without crashing', async () => {
    const { default: RTE_PQRS } = await import(
      '../app/pages/user/pqrs/components/pqrs_rteReply.component'
    );
    const { container } = render(
      <MemoryRouter>
        <RTE_PQRS currentItem={minimalCurrentItem} />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_rteReply renders with empty contacts and solicitors', async () => {
    const { default: RTE_PQRS } = await import(
      '../app/pages/user/pqrs/components/pqrs_rteReply.component'
    );
    const sparseItem = {
      ...minimalCurrentItem,
      pqrs_contacts: [],
      pqrs_solocitors: [],
    };
    const { container } = render(
      <MemoryRouter>
        <RTE_PQRS currentItem={sparseItem} />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── pqrs_setReply ───────────────────────────────────────────────────────────

  test('pqrs_setReply renders without crashing', async () => {
    const { default: PQRS_SET_REPLY } = await import(
      '../app/pages/user/pqrs/components/pqrs_setReply.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_SET_REPLY
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          hardReset={false}
          currentItem={minimalCurrentItem}
          currentId={1}
          refreshList={vi.fn()}
          retrieveItem={vi.fn()}
          closeModal={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('pqrs_setReply renders while data is loading', async () => {
    // Service returns a never-resolving promise to simulate loading state
    hoisted.pqrsMainService.get.mockReturnValueOnce(new Promise(() => {}));
    const { default: PQRS_SET_REPLY } = await import(
      '../app/pages/user/pqrs/components/pqrs_setReply.component'
    );
    const { container } = render(
      <MemoryRouter>
        <PQRS_SET_REPLY
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          hardReset={false}
          currentItem={minimalCurrentItem}
          currentId={1}
          refreshList={vi.fn()}
          retrieveItem={vi.fn()}
          closeModal={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);
});
