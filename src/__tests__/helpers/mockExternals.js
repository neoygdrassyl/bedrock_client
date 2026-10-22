/**
 * Mocks compartidos para dependencias externas.
 * Importar al inicio de cualquier test de integración.
 *
 * Uso: import './helpers/mockExternals';
 */

import React from 'react';

// ─── react-i18next ──────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.returnObjects) return {};
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) =>
    React.createElement(Component, { ...props, t: (k) => k }),
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// ─── http-common (Axios instance) ───────────────────────────────────────────

vi.mock('../../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

// ─── sweetalert2 ────────────────────────────────────────────────────────────

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  },
}));

// ─── rsuite ─────────────────────────────────────────────────────────────────

// ─── react-modal ────────────────────────────────────────────────────────────

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

// ─── vars (datos sensibles) ─────────────────────────────────────────────────

vi.mock('../../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
  nomens: 'CUB1',
  cities: [React.createElement('option', { key: 'bga', value: 'Bucaramanga' }, 'Bucaramanga')],
  domains_number: [React.createElement('option', { key: 'cur1', value: 'Curaduria 1' }, 'Curaduria 1')],
}));

// ─── GlobalStyles ───────────────────────────────────────────────────────────

vi.mock('../../app/components/global', () => ({
  GlobalStyles: () => React.createElement('style', { 'data-testid': 'global-styles' }),
}));
