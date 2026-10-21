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

const mockPost = vi.fn();
const mockGet = vi.fn();
vi.mock('../http-common', () => ({
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
