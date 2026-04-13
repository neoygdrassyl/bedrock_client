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

// ─── react-google-recaptcha ─────────────────────────────────────────────────

vi.mock('react-google-recaptcha', () => {
  const ReCAPTCHA = ({ ref, ...props }) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: vi.fn(),
    }));
    return React.createElement('div', { 'data-testid': 'recaptcha-mock' });
  };
  return { default: ReCAPTCHA };
});

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

vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    close: vi.fn(),
  }),
}));

// ─── rsuite ─────────────────────────────────────────────────────────────────

vi.mock('rsuite', () => {
  const Nav = ({ children, ...props }) =>
    React.createElement('nav', props, children);
  Nav.Menu = ({ children, title }) =>
    React.createElement('div', null, title, children);
  Nav.Item = ({ children, ...props }) =>
    React.createElement('div', props, children);
  const Navbar = ({ children }) => React.createElement('div', null, children);
  Navbar.Brand = ({ children }) => React.createElement('span', null, children);
  const Tag = ({ children, color }) =>
    React.createElement('span', { 'data-testid': 'rsuite-tag', 'data-color': color }, children);
  const TagGroup = ({ children }) => React.createElement('span', null, children);
  return { Nav, Navbar, Tag, TagGroup };
});

// ─── react-modal ────────────────────────────────────────────────────────────

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

// ─── vars (datos sensibles) ─────────────────────────────────────────────────

vi.mock('../../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
  nomens: 'CUB1',
}));

// ─── GlobalStyles ───────────────────────────────────────────────────────────

vi.mock('../../app/components/global', () => ({
  GlobalStyles: () => React.createElement('style', { 'data-testid': 'global-styles' }),
}));
