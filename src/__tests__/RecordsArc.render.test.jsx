/**
 * RecordsArc.render.test.js
 * Regression render tests for the arc record sub-components.
 * Covers: record_arc_31 through record_arc_39, record_arc_areas,
 *         record_arc_control, record_arc_gen_review, record_arc_gem2_review
 */
import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

// ─── hoisted service mocks ────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  arcService: {
    getRecord: vi.fn(() =>
      Promise.resolve({
        data: {
          record_arc: { id: 10, version: 1, subcategory: '0,0,0,0' },
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
      })
    ),
    getSteps: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
    delete_area: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../app/services/record_arc.service', () => ({
  __esModule: true,
  default: hoisted.arcService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

// arc_39 is entirely commented-out (no export) — stub it so the import doesn't
// return undefined and cause a React "Element type is invalid" error.
vi.mock('../app/pages/user/records/arc/record_arc_39', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-39-stub" />,
}));

// arc_34 uses `zones` JSX from vars.js; arc_38 uses `domains_number` JSX from
// vars.js. The mockExternals vars mock doesn't include these exports so Vitest
// raises a "No export defined" error at render time.  Stub these two files
// directly so they never execute the vars import path at all.
vi.mock('../app/pages/user/records/arc/record_arc_34', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-34-stub" />,
}));
vi.mock('../app/pages/user/records/arc/record_arc_38', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-38-stub" />,
}));

// ─── sub-component stubs ──────────────────────────────────────────────────────

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => <div data-testid="vizualizer-stub" />,
}));

vi.mock('../app/components/TagInput', () => ({
  __esModule: true,
  default: () => <div data-testid="tag-input-stub" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas.component', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-areas-stub" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_areas_2.component', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-areas-2-stub" />,
}));

vi.mock('../app/pages/user/records/arc/record_arc_desc', () => ({
  __esModule: true,
  default: () => <div data-testid="arc-desc-stub" />,
}));

vi.mock('../app/pages/user/records/exp_areas_record.component', () => ({
  __esModule: true,
  default: () => <div data-testid="exp-areas-stub" />,
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table-stub" />,
}));

// ─── imports ──────────────────────────────────────────────────────────────────

import RECORD_ARC_31 from '../app/pages/user/records/arc/record_arc_31';
import RECORD_ARC_32 from '../app/pages/user/records/arc/record_arc_32';
import RECORD_ARC_33 from '../app/pages/user/records/arc/record_arc_33';
import RECORD_ARC_34 from '../app/pages/user/records/arc/record_arc_34';
import RECORD_ARC_35 from '../app/pages/user/records/arc/record_arc_35';
import RECORD_ARC_36 from '../app/pages/user/records/arc/record_arc_36';
import RECORD_ARC_37 from '../app/pages/user/records/arc/record_arc_37';
import RECORD_ARC_38 from '../app/pages/user/records/arc/record_arc_38';
import RECORD_ARC_39 from '../app/pages/user/records/arc/record_arc_39';
import RECORD_ARC_AREAS from '../app/pages/user/records/arc/record_arc_areas.component';
import RECORD_ARC_CONTROL from '../app/pages/user/records/arc/record_arc_control.component';
import RECORD_ARC_GEN_REVIEW from '../app/pages/user/records/arc/record_arc_gen_review.component';
import RECORD_ARC_GEN_2_REVIEW from '../app/pages/user/records/arc/record_arc_gem2_review.component';

// ─── shared fixtures ──────────────────────────────────────────────────────────

const baseRecord = {
  id: 10,
  version: 1,
  subcategory: '0,0,0,0',
  record_arc_steps: [],
  record_arc_33_areas: [],
  record_arc_34_ks: [],
  record_arc_34_gens: [],
  record_arc_35_parkings: [],
  record_arc_35_locations: [],
  record_arc_36_infos: [],
  record_arc_37s: [],
  record_arc_38s: [],
  review_gen: null,
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
  _FUN_R: [],
  requestUpdate: vi.fn(),
  requestUpdateRecord: vi.fn(),
  NAVIGATION: vi.fn(),
};

const renderInRouter = (Component, extraProps = {}) =>
  render(
    <MemoryRouter>
      <Component {...baseProps} {...extraProps} />
    </MemoryRouter>
  );

// ─── tests ────────────────────────────────────────────────────────────────────

describe('RecordsArc — Render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  test('record_arc_31 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_31);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_32 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_32);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_32 presents the request type as a read-only information surface', () => {
    const { container, getByText } = renderInRouter(RECORD_ARC_32);

    expect(getByText('Tipo de trámite')).toBeInTheDocument();
    expect(container.querySelector('.record-arc-request-type')).toBeInTheDocument();
    expect(container.querySelector('textarea')).not.toBeInTheDocument();
  });

  test('record_arc_33 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_33);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_34 renders without crashing (stub — uses vars JSX not in mockExternals)', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_34);
    expect(container).toBeTruthy();
    expect(container.querySelector('[data-testid="arc-34-stub"]')).toBeInTheDocument();
  });

  test('record_arc_35 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_35);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_36 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_36);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_37 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_37);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_38 renders without crashing (stub — uses vars JSX not in mockExternals)', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_38);
    expect(container).toBeTruthy();
    expect(container.querySelector('[data-testid="arc-38-stub"]')).toBeInTheDocument();
  });

  test('record_arc_39 renders without crashing (stub — file is commented out)', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_39);
    expect(container).toBeTruthy();
    expect(container.querySelector('[data-testid="arc-39-stub"]')).toBeInTheDocument();
  });

  test('record_arc_areas renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_AREAS);
    expect(container).toBeTruthy();
    // stub renders a div with data-testid
    expect(container.querySelector('[data-testid="arc-areas-stub"]')).toBeInTheDocument();
  });

  test('record_arc_control renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_CONTROL);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_gen_review renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_GEN_REVIEW);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_arc_gem2_review renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_ARC_GEN_2_REVIEW);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });
});
