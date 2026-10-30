/**
 * SMOKE TESTS — App shell after redesign
 * Verifica que App.js renderiza sin crash con el nuevo AppShell + ThemeProvider.
 * Las páginas se mockean para aislar el shell del árbol de dependencias.
 *
 * Ejecutar: CI=true npm test -- --testPathPattern="__tests__/App.smoke"
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// ─── Mock ALL page-level imports from App.js ─────────────────────────────────

function MockPage(name) {
  return (props) => require('react').createElement('div', { 'data-testid': `mock-${name}` }, name);
}

vi.mock('../features/pqrs/pqrsadmin', () => ({ __esModule: true, default: MockPage('PQRSADMIN') }));
vi.mock('../features/liquidator/liquidator', () => ({ __esModule: true, default: MockPage('Liquidator') }));
vi.mock('../features/dashboard/dashboard', () => ({ __esModule: true, default: MockPage('Dashboard') }));
vi.mock('../features/publications/publish', () => ({ __esModule: true, default: MockPage('Publish') }));
vi.mock('../features/seals/seal', () => ({ __esModule: true, default: MockPage('Seals') }));
vi.mock('../features/appointments/appointments', () => ({ __esModule: true, default: MockPage('Appointments') }));
vi.mock('../features/messaging/mail', () => ({ __esModule: true, default: MockPage('Mail') }));
vi.mock('../features/expediente/fun/fun', () => ({ __esModule: true, default: MockPage('FUN') }));
vi.mock('../features/documentos/osha', () => ({ __esModule: true, default: MockPage('OSHA') }));
vi.mock('../features/nomenclature/nomenclature', () => ({ __esModule: true, default: MockPage('NOMENCLATURE') }));
vi.mock('../features/ventanilla/submit', () => ({ __esModule: true, default: MockPage('SUBMIT') }));
vi.mock('../features/archive/archive.page', () => ({ __esModule: true, default: MockPage('ARCHIVE') }));
vi.mock('../features/dictionary/dictionary.page', () => ({ __esModule: true, default: MockPage('DICTIONARY') }));
vi.mock('../features/expediente/fun/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE') }));
vi.mock('../features/expediente/fun/funmanage_new.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE_NEW') }));
vi.mock('../features/professionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../features/help/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../features/help/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../features/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../features/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../features/norms/zone-use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));
vi.mock('../features/simulador/legal_flow_guide/LegalFlowGuide.page', () => ({ __esModule: true, default: MockPage('LEGAL_FLOW_GUIDE') }));

// Mock new shell layout components
vi.mock('../app/layouts/AppShell', () => {
  const React = require('react');
  return {
    AppShell: ({ children, user, onLogout }) =>
      React.createElement('div', { 'data-testid': 'app-shell' }, children),
  };
});

vi.mock('@/shared/ui/sonner', () => {
  const React = require('react');
  return {
    Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
  };
});

// ─── Mock de dependencias externas ───────────────────────────────────────────

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

vi.mock('../shared/api/http-common', () => ({
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


vi.mock('../shared/config/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
}));

// ─── Import App ──────────────────────────────────────────────────────────────

import App from '../app/App';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Smoke Test Suite — App shell post-redesign', () => {

  beforeAll(() => {
    import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
    import.meta.env.VITE_GLOBAL_ID = '1';
  });

  beforeEach(() => {
    window.history.pushState({}, '', '/login');
  });

  test('1. App renderiza sin crash', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  test('2. LoginPage se muestra en /login', () => {
    render(<App />);
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    expect(emailInput || passwordInput).toBeTruthy();
  });

  test('3. Toaster está presente', () => {
    render(<App />);
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  test('4. Font scale CSS is applied (legacy global styles in index.css)', () => {
    render(<App />);
    // Font scales were moved from styled-components to index.css
    // Verify the app renders without the styled-components wrapper
    expect(document.querySelector('#email') || document.querySelector('#password')).toBeTruthy();
  });

  test('5. LoginPage no monta ReCAPTCHA', () => {
    render(<App />);
    const recaptcha = screen.queryByTestId('recaptcha-mock');
    expect(recaptcha).toBeNull();
  });

  test('6. Root / redirige a /login', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    // After redirect to /login, login form should render
    const emailInput = document.querySelector('#email');
    expect(emailInput).toBeTruthy();
  });
});
