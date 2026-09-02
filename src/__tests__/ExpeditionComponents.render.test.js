/**
 * RENDER TESTS — Expedition Components (Regression)
 *
 * Covers:
 *   - exp_1     (EXP_1)
 *   - exp_2     (EXP_2)
 *   - exp_docs  (EXP_DOCS)
 *   - exp_lic   (EXP_LIC)
 *   - exp_areas (EXP_AREAS)
 *   - exp_calc  (EXP_CALC)
 *
 * Each test verifies the component renders without crashing (regression smoke check).
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Swal from 'sweetalert2';
import { RICH_TEXT_PREFIX, serializeRichTextBlocks } from '../app/utils/richTextBlockNote';

// NOTE: We intentionally do NOT import './helpers/mockExternals' here because it
// registers a minimal vars mock that conflicts with the full mock required by
// expedition components (zonesTable, cities, etc.). We replicate the needed
// externals directly in this file instead.

// ─── Hoist service mocks ─────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  expeditionService: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_exp_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_exp_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_exp_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  pqrsMainService: {
    getlascub: vi.fn(() => Promise.resolve({ data: [{ cub: 'CUB-2024-0001' }] })),
  },
  submitService: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
  cubXVrService: {
    getByFUN: vi.fn(() => Promise.resolve({ data: [] })),
    createCubXVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
    updateCubVr: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  recordArcService: {
    getRecord: vi.fn(() => Promise.resolve({ data: {} })),
    update_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

// ─── External library mocks (replaces mockExternals.js) ──────────────────────

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
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

vi.mock('../../http-common', () => ({
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
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) =>
    React.createElement(Component, { ...props, t: (k) => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─── Service mocks ────────────────────────────────────────────────────────────

vi.mock('../app/services/expedition.service', () => ({
  __esModule: true,
  default: hoisted.expeditionService,
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsMainService,
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: hoisted.submitService,
}));

vi.mock('../app/services/cubXvr.service', () => ({
  __esModule: true,
  default: hoisted.cubXVrService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('../app/services/record_arc.service', () => ({
  __esModule: true,
  default: hoisted.recordArcService,
}));

// ─── Stub heavy sub-components ───────────────────────────────────────────────

vi.mock('../app/pages/user/expeditions/exp_calc.component', () => ({
  __esModule: true,
  default: () => <button data-testid="exp-calc-stub">CALCULADORA</button>,
}));

vi.mock('../app/pages/user/expeditions/exp._res.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-res-stub" />,
}));

vi.mock('../app/pages/user/expeditions/exp_res_2.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-res-2-stub" />,
}));

vi.mock('../app/pages/user/expeditions/exp_act_desist.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-act-desist-stub" />,
}));

vi.mock('../app/pages/user/expeditions/exp_eje.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-eje-stub" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas_resumen.component', () => ({
  __esModule: true,
  default: () => <div data-testid="record-arc-areas-resume-stub" />,
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: ({ data = [] }) => <div data-testid="datatable-stub">{data.length}</div>,
}));

vi.mock('../app/components/ui', () => ({
  MDBTooltip: ({ children }) => <>{children}</>,
  MDBBtn: ({ children, onClick, size, outline, color, className, ...props }) => (
    <button onClick={onClick} className={className} {...props}>{children}</button>
  ),
  MDBCollapse: ({ children }) => <div>{children}</div>,
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="collapsible-stub">{children}</div>,
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: vi.fn((d) => d || ''),
  dateParser_finalDate: vi.fn(() => ''),
  regexChecker_isOA_2: vi.fn(() => false),
  regexChecker_isPh: vi.fn(() => false),
  formsParser1: vi.fn(() => ''),
  getJSONFull: vi.fn((v) => (v ? {} : {})),
  _MANAGE_IDS: vi.fn((id) => id || 'CUB-TEST'),
  _CALCULATE_EXPENSES: vi.fn(() => ({ cf: 100, cv: 50, ct: 150, cfi: 1, cvi: 0.5, i: 1, j: 1 })),
  _ADDRESS_SET_FULL: vi.fn(() => ''),
  addDecimalPoints: vi.fn((v) => v),
  get_SMMV: vi.fn(() => 1300000),
  get_UVT: vi.fn(() => 47065),
}));

vi.mock('../app/components/customClasses/funCustomArrays', () => ({
  _FUN_6_PARSER: vi.fn(() => 0),
  _FUN_1_PARSER: vi.fn(() => ''),
  _FUN_4_PARSER: vi.fn(() => ''),
}));

vi.mock('../app/components/jsons/jsonReplacer', () => ({
  __esModule: true,
  default: vi.fn((v) => JSON.stringify(JSON.stringify(v))),
}));

// Override the minimal vars mock from mockExternals.js with a full version
// Both paths resolve to the same module — use the same relative path as mockExternals.js
// so Vitest hoisting merges them correctly (last mock declaration wins)
vi.mock('../../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'Bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
    serials: { start: 'VR', end: 'CUB' },
    m: 1,
    pot: 'POT TEST',
    res_extras: { art1p: 'uso permitido de prueba' },
    exp_rules: { 0: 'Expensas fijas', 1: 'Expensas variables' },
  },
  nomens: 'CUB1',
  zones: [<option key="z0" value="0">Zona 1</option>],
  zonesTable: { '0': 0.1, undefined: 0.1 },
  axis: [<option key="a0" value="5">Eje 5</option>],
  axisVar: [],
  zonesVar: [],
  axisTable: {},
  cities: [],
  domains_number: [],
  rules_opt: [<option key="r0" value="0">Regla 1</option>],
}));

vi.mock('written-number', () => ({
  __esModule: true,
  default: vi.fn((n) => String(n)),
}));

// ─── Shared minimal props ────────────────────────────────────────────────────

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
  id_public: 'CUB-2024-0001',
  state: 50,
  version: 1,
  id_payment: 'FAC-001',
  fun_1s: [
    {
      id: 1,
      tramite: 'INICIAL',
      tipo: 'TIPO I',
      m_lic: 'CONSTRUCCIÓN',
      m_sub: '',
      m_urb: '',
      usos: 'RESIDENCIAL',
      area: '100',
      description: 'Vivienda unifamiliar',
    },
  ],
  fun_2: {
    id: 1,
    direccion: 'Calle 10 # 5-20',
    direccion_ant: '',
    matricula: '12345',
    catastral: '00100200300',
    catastral_2: '',
    suelo: 'Urbano',
    lote_pla: '1',
    barrio: 'Centro',
    vereda: '',
    comuna: '1',
    sector: 'A',
    corregimiento: '',
    lote: 'L1',
    estrato: 3,
    manzana: 'M1',
  },
  fun_clocks: [
    { id: 1, state: 3, date_start: '2024-03-01', name: 'Pago' },
    { id: 2, state: 99, date_start: '2024-04-01', name: 'Licencia' },
    { id: 3, state: 101, date_start: null, name: 'Archivación' },
  ],
  record_arc: {
    id: 1,
    version: 1,
    control: null,
    record_arc_steps: [],
    record_arc_33_areas: [],
    record_arc_34_ks: [],
    record_arc_34_gens: [],
    record_arc_35_parkings: [],
    record_arc_36_infos: [],
    record_arc_37s: [],
    record_arc_35_locations: [],
    record_arc_38s: [],
  },
  record_arc_steps: [],
  // EXP_DOCS requires these additional arrays:
  fun_53s: [{ id: 1 }],
  fun_54s: [{ id: 1 }],
  fun_55s: [{ id: 1 }],
  fun_56s: [{ id: 1 }],
};

const minimalCurrentRecord = {
  id: 1,
  date: '2024-04-01',
  date2: '',
  cub1: 'CUB-2024-0010',
  cub2: '',
  taxes: null,
  tmp: null,
  duty: null,
  control: null,
  exp_areas: [],
};

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

async function flushPromises(times = 4) {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Expedition Components — Render', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1, name: 'Admin', surname: 'Test' };
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete window.user;
  });

  // ── exp_1 ───────────────────────────────────────────────────────────────────

  test('exp_1 renders without crashing', async () => {
    const { default: EXP_1 } = await import(
      '../app/pages/user/expeditions/exp_1.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_1
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_1 renders with empty exp_areas', async () => {
    const { default: EXP_1 } = await import(
      '../app/pages/user/expeditions/exp_1.component'
    );
    const recordNoAreas = { ...minimalCurrentRecord, exp_areas: [] };
    const { container } = render(
      <MemoryRouter>
        <EXP_1
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={recordNoAreas}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  test('exp_1 espera la respuesta OK antes de refrescar datos al guardar cambios', async () => {
    const { default: EXP_1 } = await import(
      '../app/pages/user/expeditions/exp_1.component'
    );
    const expeditionUpdate = createDeferred();
    const requestUpdate = vi.fn();
    const requestUpdateRecord = vi.fn();

    hoisted.expeditionService.update.mockReturnValueOnce(expeditionUpdate.promise);

    render(
      <MemoryRouter>
        <EXP_1
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={requestUpdate}
          requestUpdateRecord={requestUpdateRecord}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(hoisted.cubXVrService.getByFUN).toHaveBeenCalledTimes(1);
    });
    hoisted.cubXVrService.getByFUN.mockClear();
    hoisted.submitService.getIdRelated.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(hoisted.expeditionService.update).toHaveBeenCalledTimes(1);
    });
    await flushPromises();

    expect(hoisted.submitService.getIdRelated).not.toHaveBeenCalled();
    expect(hoisted.cubXVrService.getByFUN).not.toHaveBeenCalled();
    expect(requestUpdateRecord).not.toHaveBeenCalled();
    expect(requestUpdate).not.toHaveBeenCalled();

    expeditionUpdate.resolve({ data: 'OK' });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: 'success',
        title: swaMsg.publish_success_title,
      }));
    });

    expect(requestUpdateRecord).toHaveBeenCalledWith(minimalCurrentItem.id);
    expect(requestUpdate).toHaveBeenCalledWith(minimalCurrentItem.id);
  }, 60000);

  // ── exp_2 ───────────────────────────────────────────────────────────────────

  test('exp_2 renders without crashing', async () => {
    const { default: EXP_2 } = await import(
      '../app/pages/user/expeditions/exp_2.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_2
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_2 renders without record_arc', async () => {
    const { default: EXP_2 } = await import(
      '../app/pages/user/expeditions/exp_2.component'
    );
    const itemNoArc = { ...minimalCurrentItem, record_arc: null, record_arc_steps: [] };
    const { container } = render(
      <MemoryRouter>
        <EXP_2
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemNoArc}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── exp_docs ────────────────────────────────────────────────────────────────

  test('exp_docs renders without crashing', async () => {
    const { default: EXP_DOCS } = await import(
      '../app/pages/user/expeditions/exp_docs.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_DOCS
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          recordArc={null}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_docs renders with recordArc provided', async () => {
    const { default: EXP_DOCS } = await import(
      '../app/pages/user/expeditions/exp_docs.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_DOCS
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          recordArc={minimalCurrentItem.record_arc}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  test('exp_res muestra texto plano de BlockNote en Artículo 4 de resolución', async () => {
    const { default: EXP_RES } = await vi.importActual(
      '../app/pages/user/expeditions/exp._res.component'
    );
    const blockNoteAntecedentes = serializeRichTextBlocks([
      { type: 'paragraph', content: [{ type: 'text', text: 'Antecedente claro para resolución', styles: {} }] },
    ]);
    const blockNoteDescripcion = serializeRichTextBlocks([
      { type: 'paragraph', content: [{ type: 'text', text: 'Descripción clara para resolución', styles: {} }] },
    ]);
    const itemWithRichTextArcStep = {
      ...minimalCurrentItem,
      record_arc_steps: [
        {
          id: 33,
          id_public: 's33',
          value: `${blockNoteAntecedentes};${blockNoteDescripcion}`,
        },
      ],
    };

    render(
      <MemoryRouter>
        <EXP_RES
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemWithRichTextArcStep}
          currentVersion={1}
          currentRecord={{ ...minimalCurrentRecord, id_public: 'RES-TEST-001', model: 'open' }}
          currentVersionR={1}
          recordArc={minimalCurrentItem.record_arc}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );

    const antecedentes = document.getElementById('expedition_doc_res_art_4_1_dv');
    const descripcion = document.getElementById('expedition_doc_res_art_4_2_dv');

    expect(antecedentes.value).toBe('Antecedente claro para resolución');
    expect(descripcion.value).toBe('Descripción clara para resolución');
    expect(antecedentes.value).not.toContain(RICH_TEXT_PREFIX);
    expect(descripcion.value).not.toContain(RICH_TEXT_PREFIX);
  }, 60000);

  test('exp_res no imprime undefined cuando s33 no tiene descripción', async () => {
    const { default: EXP_RES } = await vi.importActual(
      '../app/pages/user/expeditions/exp._res.component'
    );
    const blockNoteAntecedentes = serializeRichTextBlocks([
      { type: 'paragraph', content: [{ type: 'text', text: 'Antecedente sin descripción', styles: {} }] },
    ]);
    const itemWithoutDescription = {
      ...minimalCurrentItem,
      record_arc_steps: [
        {
          id: 33,
          id_public: 's33',
          value: blockNoteAntecedentes,
        },
      ],
    };

    render(
      <MemoryRouter>
        <EXP_RES
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemWithoutDescription}
          currentVersion={1}
          currentRecord={{ ...minimalCurrentRecord, id_public: 'RES-TEST-001', model: 'open' }}
          currentVersionR={1}
          recordArc={minimalCurrentItem.record_arc}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );

    const descripcion = document.getElementById('expedition_doc_res_art_4_2_dv');

    expect(descripcion.value).toBe('');
    expect(descripcion.value).not.toContain('undefined');
  }, 60000);

  // ── exp_lic ─────────────────────────────────────────────────────────────────

  test('exp_lic renders without crashing (state < 99)', async () => {
    const { default: EXP_LIC } = await import(
      '../app/pages/user/expeditions/exp_lic.component'
    );
    // fun_clocks has no clock with state=99 → shows "fecha no disponible" message
    const itemNoClock99 = {
      ...minimalCurrentItem,
      state: 50,
      fun_clocks: [{ id: 1, state: 3, date_start: '2024-03-01', name: 'Pago' }],
    };
    const { container } = render(
      <MemoryRouter>
        <EXP_LIC
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemNoClock99}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          closeModal={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_lic renders with state=100 and license date', async () => {
    const { default: EXP_LIC } = await import(
      '../app/pages/user/expeditions/exp_lic.component'
    );
    const itemWithLicense = {
      ...minimalCurrentItem,
      state: 100,
      fun_clocks: [
        { id: 1, state: 99, date_start: '2024-04-01', name: 'Licencia' },
        { id: 2, state: 101, date_start: null, name: 'Archivación' },
      ],
    };
    const { container } = render(
      <MemoryRouter>
        <EXP_LIC
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemWithLicense}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          closeModal={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  test('exp_lic renders with state=200 (DESISTIDA)', async () => {
    const { default: EXP_LIC } = await import(
      '../app/pages/user/expeditions/exp_lic.component'
    );
    const itemDesistida = {
      ...minimalCurrentItem,
      state: 200,
      fun_clocks: [
        { id: 1, state: 99, date_start: '2024-04-01', name: 'Licencia' },
      ],
    };
    const { container } = render(
      <MemoryRouter>
        <EXP_LIC
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={itemDesistida}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          closeModal={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── exp_areas ───────────────────────────────────────────────────────────────

  test('exp_areas renders without crashing', async () => {
    const { default: EXP_AREAS } = await import(
      '../app/pages/user/expeditions/exp_areas.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_AREAS
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={minimalCurrentRecord}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_areas renders with existing areas', async () => {
    const { default: EXP_AREAS } = await import(
      '../app/pages/user/expeditions/exp_areas.component'
    );
    const recordWithAreas = {
      ...minimalCurrentRecord,
      exp_areas: [
        { id: 1, area: 100, units: 1, charge: 5000, use: 'Residencial (NO VIS)', desc: 'Obra nueva', payment: 0 },
        { id: 2, area: 20, units: 1, charge: 2000, use: 'Comercial y de Servicios', desc: 'Local', payment: 1 },
      ],
    };
    const { container } = render(
      <MemoryRouter>
        <EXP_AREAS
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          currentItem={minimalCurrentItem}
          currentVersion={1}
          currentRecord={recordWithAreas}
          currentVersionR={1}
          requestUpdate={vi.fn()}
          requestUpdateRecord={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);

  // ── exp_calc ────────────────────────────────────────────────────────────────

  test('exp_calc renders without crashing', async () => {
    // Import the real EXP_CALC (un-mocked for this file's own test)
    // We need to reimport without the stub — use a workaround with direct path
    vi.doUnmock('../app/pages/user/expeditions/exp_calc.component');
    const { default: EXP_CALC } = await import(
      '../app/pages/user/expeditions/exp_calc.component?real'
    ).catch(() =>
      // Fallback: if query-string import fails, import normally
      import('../app/pages/user/expeditions/exp_calc.component')
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_CALC
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          domArea="test_area"
          domM2="test_m2"
          domUse="test_use"
          domTipe="test_tipe"
          compact={false}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  }, 60000);

  test('exp_calc renders in compact mode', async () => {
    vi.doUnmock('../app/pages/user/expeditions/exp_calc.component');
    const { default: EXP_CALC } = await import(
      '../app/pages/user/expeditions/exp_calc.component'
    );
    const { container } = render(
      <MemoryRouter>
        <EXP_CALC
          translation={{}}
          swaMsg={swaMsg}
          globals={{ id: '1' }}
          domArea="compact_area"
          domMt="compact_mt"
          compact={true}
        />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  }, 60000);
});
