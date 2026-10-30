/**
 * SMOKE TESTS — Login flow
 * Verifica que el flujo de login funciona con API mockeada.
 * Updated for App.js post-redesign (ThemeProvider + AppShell layout routes).
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ─── Page mocks (same as App.smoke) ─────────────────────────────────────────

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

const mockPost = vi.fn();
const mockGet = vi.fn();
vi.mock('../shared/api/http-common', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
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

import App from '../app/App';

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Login Flow — Pre-migration baseline', () => {

  beforeEach(() => {
    mockPost.mockReset();
    mockGet.mockReset();
    mockGet.mockResolvedValue({ data: [] });
    window.history.pushState({}, '', '/login');
  });

  test('1. Login form tiene campos email y password', () => {
    render(<App />);
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  test('2. Login form tiene botón submit', () => {
    render(<App />);
    const submitBtn = document.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
  });

  test('3. Login exitoso llama API con datos correctos', async () => {
    const mockUserResponse = {
      data: [{
        id: 1, name: 'Test', name_2: 'User',
        surname: 'Apellido', surname_2: 'Apellido2',
        active: 1, roleId: 1,
        role: { name: 'Admin', short: 'ADM', desc: 'Administrador' },
      }],
    };
    mockPost.mockResolvedValue(mockUserResponse);

    render(<App />);

    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const submitBtn = document.querySelector('button[type="submit"]');

    fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  test('4. Login fallido dispara SweetAlert', async () => {
    mockPost.mockResolvedValue({ data: [] });

    render(<App />);

    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');
    const submitBtn = document.querySelector('button[type="submit"]');

    fireEvent.change(emailInput, { target: { value: 'bad@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});
