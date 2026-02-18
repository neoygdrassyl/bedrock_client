/**
 * SMOKE TESTS — App shell renders
 * Fase 0: Verifica que App.js renderiza sin crash (routing, auth, theme).
 * Las páginas se mockean para aislar el shell del árbol de dependencias.
 *
 * Ejecutar: CI=true npm test -- --testPathPattern="__tests__/App.smoke"
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mock ALL page-level imports from App.js ─────────────────────────────────

function MockPage(name) {
  return (props) => require('react').createElement('div', { 'data-testid': `mock-${name}` }, name);
}

jest.mock('../app/pages/user/pqrs/pqrsadmin', () => ({ __esModule: true, default: MockPage('PQRSADMIN') }));
jest.mock('../app/pages/liquidator/liquidator', () => ({ __esModule: true, default: MockPage('Liquidator') }));
jest.mock('../app/pages/user/dashboard', () => ({ __esModule: true, default: MockPage('Dashboard') }));
jest.mock('../app/pages/user/publish', () => ({ __esModule: true, default: MockPage('Publish') }));
jest.mock('../app/pages/user/seal', () => ({ __esModule: true, default: MockPage('Seals') }));
jest.mock('../app/pages/user/appointments', () => ({ __esModule: true, default: MockPage('Appointments') }));
jest.mock('../app/pages/user/mail', () => ({ __esModule: true, default: MockPage('Mail') }));
jest.mock('../app/pages/user/fun', () => ({ __esModule: true, default: MockPage('FUN') }));
jest.mock('../app/pages/user/osha', () => ({ __esModule: true, default: MockPage('OSHA') }));
jest.mock('../app/pages/user/nomenclature/nomenclature', () => ({ __esModule: true, default: MockPage('NOMENCLATURE') }));
jest.mock('../app/pages/user/submit/submit', () => ({ __esModule: true, default: MockPage('SUBMIT') }));
jest.mock('../app/pages/user/archive/archive.page', () => ({ __esModule: true, default: MockPage('ARCHIVE') }));
jest.mock('../app/pages/user/dictionary.page', () => ({ __esModule: true, default: MockPage('DICTIONARY') }));
jest.mock('../app/pages/user/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE') }));
jest.mock('../app/pages/user/profesionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
jest.mock('../app/pages/user/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
jest.mock('../app/pages/user/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
jest.mock('../app/pages/user/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
jest.mock('../app/pages/user/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
jest.mock('../app/pages/user/zone_use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));

// Mock components used by App
jest.mock('../app/components/footer', () => ({ __esModule: true, default: (props) => require('react').createElement('footer', { id: 'footer-app-main' }, 'Footer') }));
jest.mock('../app/components/navbar', () => ({ __esModule: true, default: (props) => require('react').createElement('nav', { 'data-testid': 'navbar' }, 'Navbar') }));
jest.mock('../app/components/btnStart', () => ({ __esModule: true, default: () => null }));
jest.mock('../app/components/btnChat', () => ({ __esModule: true, default: () => null }));
jest.mock('../app/components/btnAccesibility', () => ({ __esModule: true, default: () => null }));

// ─── Mock de dependencias externas ───────────────────────────────────────────

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.returnObjects) return {};
      return key;
    },
    i18n: { changeLanguage: jest.fn() },
  }),
  withTranslation: () => (Component) => (props) => <Component {...props} t={(k) => k} />,
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

jest.mock('react-google-recaptcha', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: jest.fn(),
    }));
    return <div data-testid="recaptcha-mock" />;
  });
});

jest.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: [] })),
    put: jest.fn(() => Promise.resolve({ data: [] })),
    delete: jest.fn(() => Promise.resolve({ data: [] })),
  },
}));

jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
  close: jest.fn(),
}));
jest.mock('sweetalert2-react-content', () => () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

jest.mock('rsuite', () => {
  const React = require('react');
  const Nav = ({ children, ...props }) => <nav {...props}>{children}</nav>;
  Nav.Menu = ({ children, title }) => <div>{title}{children}</div>;
  Nav.Item = ({ children, ...props }) => <div {...props}>{children}</div>;
  const Navbar = ({ children }) => <div>{children}</div>;
  Navbar.Brand = ({ children }) => <span>{children}</span>;
  return { Nav, Navbar };
});

jest.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
}));

jest.mock('../app/components/global', () => {
  const React = require('react');
  return { GlobalStyles: () => <style data-testid="global-styles" /> };
});

// ─── Import App ──────────────────────────────────────────────────────────────

import App from '../app/App';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Smoke Test Suite — App shell pre-migration baseline', () => {

  beforeAll(() => {
    process.env.REACT_APP_API_URL = 'http://localhost/dovela-backend/public';
    process.env.REACT_APP_GLOBAL_ID = '1';
    process.env.REACT_APP_GOOGLE_CAPTCHA_HTML = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  });

  test('1. App renderiza sin crash', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
    expect(container.querySelector('.App')).toBeInTheDocument();
  });

  test('2. LoginPage se muestra en ruta raíz', () => {
    render(<App />);
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    expect(emailInput || passwordInput).toBeTruthy();
  });

  test('3. Footer está presente', () => {
    const { container } = render(<App />);
    const footer = container.querySelector('#footer-app-main');
    expect(footer).toBeTruthy();
  });

  test('4. Navbar está presente', () => {
    render(<App />);
    const navbar = screen.getByTestId('navbar');
    expect(navbar).toBeTruthy();
  });

  test('5. ThemeProvider envuelve la app (GlobalStyles renderiza)', () => {
    render(<App />);
    const globalStyles = document.querySelector('[data-testid="global-styles"]');
    expect(globalStyles).toBeTruthy();
  });

  test('6. ReCAPTCHA está presente en LoginPage', () => {
    render(<App />);
    const recaptcha = screen.queryByTestId('recaptcha-mock');
    expect(recaptcha).toBeTruthy();
  });
});
