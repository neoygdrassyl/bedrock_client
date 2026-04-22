/**
 * RecordsLaw.render.test.js
 * Regression render tests for the law record sub-components.
 * Covers: record_law_step1, record_law_fun_1, record_law_fun_2,
 *         record_law_fun_51, record_law_fun_52, record_law_fun_53,
 *         record_law_review
 */
import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

// ─── hoisted service mocks ────────────────────────────────────────────────────

const hoisted = vi.hoisted(() => ({
  lawService: {
    getRecord: vi.fn(() => Promise.resolve({ data: [] })),
    create: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    create_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_step: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
  funService: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
  },
  submitService: {
    getIdRelated: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('../app/services/record_law.service', () => ({
  __esModule: true,
  default: hoisted.lawService,
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.funService,
}));

vi.mock('../app/services/submit.service', () => ({
  __esModule: true,
  default: hoisted.submitService,
}));

// ─── sub-component stubs ──────────────────────────────────────────────────────

vi.mock('../app/pages/user/fun_forms/fun_n_1', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-n-1-stub" />,
}));

vi.mock('../app/pages/user/fun_forms/fun_n_2', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-n-2-stub" />,
}));

vi.mock('../app/pages/user/fun_forms/fun_n_53', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-n-53-stub" />,
}));

vi.mock('../app/pages/user/records/law/record_law_pdf', () => ({
  __esModule: true,
  default: () => <div data-testid="law-pdf-stub" />,
}));

vi.mock('../app/pages/user/records/record_docVersion.component', () => ({
  __esModule: true,
  default: () => <div data-testid="doc-version-stub" />,
}));

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => <div data-testid="vizualizer-stub" />,
}));

vi.mock('../app/components/HTMLDatalist', () => ({
  __esModule: true,
  default: () => <div data-testid="html-datalist-stub" />,
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="collapsible-stub">{children}</div>,
}));

// ─── imports ──────────────────────────────────────────────────────────────────

import RECORD_LAW_STEP_1 from '../app/pages/user/records/law/record_law_step1.cmponent';
import RECORD_LAW_FUN_1 from '../app/pages/user/records/law/record_law_fun_1.component';
import RECORD_LAW_FUN_2 from '../app/pages/user/records/law/record_law_fun_2.component';
import RECORD_LAW_FUN_51 from '../app/pages/user/records/law/record_law_fun_51.component';
import RECORD_LAW_FUN_52 from '../app/pages/user/records/law/record_law_fun_52.component';
import RECORD_LAW_FUN_53 from '../app/pages/user/records/law/record_law_fun_53.component';
import RECORD_LAW_EVALUATION from '../app/pages/user/records/law/record_law_review';

// ─── shared fixtures ──────────────────────────────────────────────────────────

const baseRecord = {
  id: 99,
  version: 1,
  record_law_steps: [],
};

const baseItem = {
  id: 1,
  id_public: 'FUN-001',
  rules: '0;0;0',
  model: 2016,
  fun_1s: [],
  fun_2: null,
  fun_51s: [],
  fun_52s: [],
  fun_53s: [],
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
  quickModalStyle: {},
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

describe('RecordsLaw — Render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
  });

  afterEach(() => {
    window.user = null;
  });

  test('record_law_step1 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_STEP_1);
    expect(container).toBeTruthy();
    expect(container.querySelector('.record_law_step_1')).toBeInTheDocument();
  });

  test('record_law_fun_1 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_FUN_1);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_law_fun_2 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_FUN_2);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_law_fun_51 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_FUN_51);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_law_fun_52 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_FUN_52);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_law_fun_53 renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_FUN_53);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });

  test('record_law_review renders without crashing', { timeout: 60000 }, async () => {
    const { container } = renderInRouter(RECORD_LAW_EVALUATION);
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });
});
