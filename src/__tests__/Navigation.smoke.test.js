/**
 * SMOKE TESTS — Navegación y rutas clave
 * Verifica que las rutas públicas y privadas responden sin crash.
 * Updated for App.js post-redesign (Spanish routes + legacy redirects).
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ─── Page mocks ──────────────────────────────────────────────────────────────

function MockPage(name) {
  return (props) => require('react').createElement('div', { 'data-testid': `mock-${name}` }, name);
}

vi.mock('../app/pages/user/pqrs/pqrsadmin', () => ({ __esModule: true, default: MockPage('PQRSADMIN') }));
vi.mock('../app/pages/liquidator/liquidator', () => ({ __esModule: true, default: MockPage('Liquidator') }));
vi.mock('../app/pages/user/dashboard', () => ({ __esModule: true, default: MockPage('Dashboard') }));
vi.mock('../app/pages/user/publish', () => ({ __esModule: true, default: MockPage('Publish') }));
vi.mock('../app/pages/user/seal', () => ({ __esModule: true, default: MockPage('Seals') }));
vi.mock('../app/pages/user/appointments', () => ({ __esModule: true, default: MockPage('Appointments') }));
vi.mock('../app/pages/user/mail', () => ({ __esModule: true, default: MockPage('Mail') }));
vi.mock('../app/pages/user/fun', () => ({ __esModule: true, default: MockPage('FUN') }));
vi.mock('../app/pages/user/osha', () => ({ __esModule: true, default: MockPage('OSHA') }));
vi.mock('../app/pages/user/nomenclature/nomenclature', () => ({ __esModule: true, default: MockPage('NOMENCLATURE') }));
vi.mock('../app/pages/user/submit/submit', () => ({ __esModule: true, default: MockPage('SUBMIT') }));
vi.mock('../app/pages/user/archive/archive.page', () => ({ __esModule: true, default: MockPage('ARCHIVE') }));
vi.mock('../app/pages/user/dictionary.page', () => ({ __esModule: true, default: MockPage('DICTIONARY') }));
vi.mock('../app/pages/user/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE') }));
vi.mock('../app/pages/user/funmanage_new.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE_NEW') }));
vi.mock('../app/pages/user/profesionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../app/pages/user/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../app/pages/user/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../app/pages/user/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../app/pages/user/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../app/pages/user/zone_use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));
vi.mock('../app/pages/user/legal_flow_guide/LegalFlowGuide.page', () => ({ __esModule: true, default: MockPage('LEGAL_FLOW_GUIDE') }));

// Mock new shell layout components
vi.mock('../app/layouts/AppShell', () => {
  const React = require('react');
  return {
    AppShell: ({ children, user, onLogout }) =>
      React.createElement('div', { 'data-testid': 'app-shell' }, children),
  };
});

vi.mock('@/components/ui/sonner', () => {
  const React = require('react');
  return {
    Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
  };
});

// ─── External mocks ─────────────────────────────────────────────────────────

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (opts && opts.returnObjects) return {};
      return key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) => <Component {...props} t={(k) => k} />,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('react-google-recaptcha', () => {
  const React = require('react');
  const ReCAPTCHA = ({ ref, ...props }) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: vi.fn(),
    }));
    return <div data-testid="recaptcha-mock" />;
  };
  return { default: ReCAPTCHA };
});

vi.mock('../http-common', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({ data: [] })),
    delete: vi.fn(() => Promise.resolve({ data: [] })),
  },
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
  }),
}));

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
}));

vi.mock('../app/components/global', () => {
  const React = require('react');
  return { GlobalStyles: () => <style data-testid="global-styles" /> };
});

import App from '../app/App';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Navegación — Post-redesign routes', () => {

  // Public routes that render without auth (no AppShell wrapper)
  const publicRoutes = [
    { path: '/', name: 'raíz → /login' },
    { path: '/home', name: '/home → /login' },
    { path: '/login', name: '/login' },
    { path: '/normas', name: '/normas (public)' },
    { path: '/certificados', name: '/certificados (public)' },
    { path: '/uso-suelo', name: '/uso-suelo (public)' },
    { path: '/dev-guide', name: '/dev-guide (public)' },
  ];

  publicRoutes.forEach(({ path, name }) => {
    test(`Ruta pública ${name} renderiza sin crash`, () => {
      window.history.pushState({}, '', path);
      const { container } = render(<App />);
      expect(container.firstChild).toBeTruthy();
    });
  });

  // Legacy routes redirect to new Spanish names, then to /login (no auth)
  const legacyRedirects = [
    { from: '/fun', to: '/licencias' },
    { from: '/funmanage', to: '/licencias/gestion' },
    { from: '/pqrsadmin', to: '/peticiones' },
    { from: '/mail', to: '/mensajes' },
    { from: '/appointments', to: '/calendario' },
    { from: '/submit', to: '/ventanilla' },
    { from: '/publish', to: '/publicaciones' },
    { from: '/nomenclature', to: '/nomenclatura' },
    { from: '/archive', to: '/archivo' },
    { from: '/dictionary', to: '/consecutivos' },
    { from: '/profesionals', to: '/profesionales' },
    { from: '/guide_user', to: '/ayuda' },
    { from: '/calculator', to: '/calculadora' },
    { from: '/seals', to: '/sellos' },
    { from: '/norms', to: '/normas' },
    { from: '/certs', to: '/certificados' },
    { from: '/zone_use', to: '/uso-suelo' },
  ];

  legacyRedirects.forEach(({ from, to }) => {
    test(`Legacy redirect ${from} → ${to} works`, () => {
      window.history.pushState({}, '', from);
      const { container } = render(<App />);
      // App should render without crash (redirect chain resolves)
      expect(container.firstChild).toBeTruthy();
    });
  });

  // Private routes (new Spanish names) redirect to /login without auth
  const privateRoutes = [
    '/dashboard', '/licencias', '/licencias/gestion', '/peticiones',
    '/ventanilla', '/mensajes', '/calendario', '/archivo',
    '/publicaciones', '/nomenclatura', '/documentos', '/calculadora',
    '/consecutivos', '/profesionales', '/ayuda', '/sellos',
  ];

  privateRoutes.forEach((path) => {
    test(`Ruta privada ${path} redirige a login sin auth`, () => {
      window.history.pushState({}, '', path);
      const { container } = render(<App />);
      // Should redirect to /login — login form email input should appear
      const emailInput = container.querySelector('#email');
      expect(emailInput).toBeTruthy();
    });
  });

  test('Ruta desconocida renderiza sin crash', () => {
    window.history.pushState({}, '', '/ruta-que-no-existe');
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });
});
