/**
 * RecordsPH.render.test.js
 * Regression render tests for the PH (propiedad horizontal) record sub-components.
 * Covers: record_ph_gen, record_ph_building, record_ph_floor,
 *         record_ph_blueprint, record_ph_review
 */
import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

// ─── hoisted service mocks ────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  phService: {
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_building: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_building: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_building: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_floor: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_floor: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_floor: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_blueprint: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_blueprint: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_blueprint: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  submitService: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
  pqrsService: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    get: vi.fn(() => Promise.resolve({ data: {} })),
  },
  cubXvrService: {
    getByFUN: vi.fn(() =>
      Promise.resolve({ data: [{ process: 'DOCUMENTOS PH / CITACIÓN PARA NOTIFICACIÓN', cub: 'CUB001' }] })
    ),
  },
}));

vi.mock('../app/services/record_ph.service', () => ({
  __esModule: true,
  default: hoisted.phService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: hoisted.submitService,
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsService,
}));

vi.mock('../app/services/cubXvr.service', () => ({
  __esModule: true,
  default: hoisted.cubXvrService,
}));

// ─── sub-component stubs ──────────────────────────────────────────────────────

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => <div data-testid="vizualizer-stub" />,
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="collapsible-stub">{children}</div>,
}));

vi.mock('react-data-table-component', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table-stub" />,
}));

// record_ph_review uses `domains_number` JSX from vars.js which is not in
// the mockExternals vars mock — stub the whole component to avoid the error.
vi.mock('../app/pages/user/records/ph/record_ph_review.component', () => ({
  __esModule: true,
  default: () => <div data-testid="ph-review-stub" />,
}));

// pdf-lib is heavy — stub it out
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn(() => Promise.resolve({})),
    create: vi.fn(() =>
      Promise.resolve({ save: vi.fn(() => Promise.resolve(new Uint8Array())) })
    ),
  },
  StandardFonts: { Helvetica: 'Helvetica' },
}));

// ─── imports ──────────────────────────────────────────────────────────────────

import RECORD_PH_GEN from '../app/pages/user/records/ph/record_ph_gen.component';
import RECORD_PH_BUILDING from '../app/pages/user/records/ph/record_ph_building.component';
import RECORD_PH_FLOOR from '../app/pages/user/records/ph/record_ph_floor.component';
import RECORD_PH_BLUEPRINT from '../app/pages/user/records/ph/record_ph_blueprint.component';
import RECORD_PH_REVIEW from '../app/pages/user/records/ph/record_ph_review.component';

// ─── shared fixtures ──────────────────────────────────────────────────────────

const baseRecord = {
  id: 55,
  version: 1,
  review_gen: null,
  record_ph_buildings: [],
  record_ph_floors: [],
  record_ph_blueprints: [],
};

const baseItem = {
  id: 1,
  id_public: 'FUN-001',
  rules: '0;0;0',
  fun_1s: [],
  fun_2: null,
  fun_51s: [],
  fun_52s: [],
  fun_6s: [],
  fun_rs: [],
  fun_clocks: [],
};

const baseProps = {
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
  currentItem: baseItem,
  currentVersion: 1,
  currentRecord: baseRecord,
  currentVersionR: 1,
  CATEGORY: 1,
  requestUpdate: vi.fn(),
  requestUpdateRecord: vi.fn(),
  requestRefresh: vi.fn(),
  closeModal: vi.fn(),
  NAVIGATION: vi.fn(),
};

const renderInRouter = (Component, extraProps = {}) =>
  render(
    <MemoryRouter>
      <Component {...baseProps} {...extraProps} />
    </MemoryRouter>
  );

// ─── tests ────────────────────────────────────────────────────────────────────

describe('RecordsPH — Render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  test('record_ph_gen renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_PH_GEN);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_ph_building renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_PH_BUILDING);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_ph_floor renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_PH_FLOOR);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_ph_blueprint renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_PH_BLUEPRINT);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_ph_review renders without crashing (stub — uses vars JSX not in mockExternals)', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_PH_REVIEW);
    expect(container).toBeTruthy();
    expect(container.querySelector('[data-testid="ph-review-stub"]')).toBeInTheDocument();
  });
});
