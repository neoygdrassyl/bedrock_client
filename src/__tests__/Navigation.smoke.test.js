/**
 * SMOKE TESTS — Navegación y rutas clave
 * Fase 0: Verifica que las rutas públicas y privadas responden sin crash.
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
vi.mock('../app/pages/user/profesionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../app/pages/user/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../app/pages/user/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../app/pages/user/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../app/pages/user/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../app/pages/user/zone_use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));

vi.mock('../app/components/footer', () => ({ __esModule: true, default: (props) => require('react').createElement('footer', { id: 'footer-app-main' }, 'Footer') }));
vi.mock('../app/components/navbar', () => ({ __esModule: true, default: (props) => require('react').createElement('nav', { 'data-testid': 'navbar' }, 'Navbar') }));
vi.mock('../app/components/btnStart', () => ({ __esModule: true, default: () => null }));
vi.mock('../app/components/btnChat', () => ({ __esModule: true, default: () => null }));
vi.mock('../app/components/btnAccesibility', () => ({ __esModule: true, default: () => null }));

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
  const ReCAPTCHA = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({
      execute: () => Promise.resolve('mock-token'),
      reset: vi.fn(),
    }));
    return <div data-testid="recaptcha-mock" />;
  });
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

vi.mock('rsuite', () => {
  const React = require('react');
  const Nav = ({ children, ...props }) => <nav {...props}>{children}</nav>;
  Nav.Menu = ({ children, title }) => <div>{title}{children}</div>;
  Nav.Item = ({ children, ...props }) => <div {...props}>{children}</div>;
  const Navbar = ({ children }) => <div>{children}</div>;
  Navbar.Brand = ({ children }) => <span>{children}</span>;
  return { Nav, Navbar };
});

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

describe('Navegación — Pre-migration baseline', () => {

  beforeAll(() => {
    import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
    import.meta.env.VITE_GLOBAL_ID = '1';
    import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  });

  const publicRoutes = [
    { path: '/', name: 'raíz (login)' },
    { path: '/home', name: '/home' },
    { path: '/login', name: '/login' },
    { path: '/norms', name: '/norms' },
    { path: '/certs', name: '/certs' },
    { path: '/zone_use', name: '/zone_use' },
    { path: '/dev-guide', name: '/dev-guide' },
  ];

  publicRoutes.forEach(({ path, name }) => {
    test(`Ruta pública ${name} renderiza sin crash`, () => {
      window.history.pushState({}, '', path);
      const { container } = render(<App />);
      expect(container.querySelector('.App')).toBeInTheDocument();
    });
  });

  const privateRoutes = [
    '/dashboard', '/fun', '/funmanage', '/pqrsadmin',
    '/nomenclature', '/submit', '/mail', '/appointments',
    '/publish', '/seals', '/calculator', '/archive',
    '/dictionary', '/profesionals', '/guide_user',
  ];

  privateRoutes.forEach((path) => {
    test(`Ruta privada ${path} redirige a login sin auth`, () => {
      window.history.pushState({}, '', path);
      const { container } = render(<App />);
      // Should redirect to login — login form email input should appear
      const emailInput = container.querySelector('#email');
      expect(emailInput).toBeTruthy();
    });
  });

  test('Ruta desconocida cae en catch-all (LoginPage)', () => {
    window.history.pushState({}, '', '/ruta-que-no-existe');
    const { container } = render(<App />);
    expect(container.querySelector('.App')).toBeInTheDocument();
  });
});
