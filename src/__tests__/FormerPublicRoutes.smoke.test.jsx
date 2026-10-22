import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

function MockPage(name) {
  return () => require('react').createElement('div', { 'data-testid': `mock-${name}` }, name);
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

vi.mock('../app/layouts/BusinessCalendarBootstrap', () => ({
  default: ({ children }) => children,
}));

vi.mock('../app/layouts/AppShell', () => {
  const React = require('react');
  return {
    AppShell: ({ children }) => React.createElement('div', { 'data-testid': 'app-shell' }, children),
  };
});

vi.mock('@/shared/ui/sonner', () => {
  const React = require('react');
  return { Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }) };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, opts) => (opts && opts.returnObjects ? {} : key),
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

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn(() => Promise.resolve({ isConfirmed: true })), close: vi.fn() } }));
vi.mock('../shared/config/jsons/vars', () => ({ infoCud: { name: 'Curaduría Urbana Test', city: 'bucaramanga', nit: '000-000', email: 'test@test.com' } }));

import App from '../app/App';

function seedSession() {
  const user = {
    id: 1,
    name: 'Admin',
    surname: 'Test',
    role: 'Administrador',
    role_short: 'ADMIN',
    roleDesc: 'Admin completo',
    active: 1,
    roleId: 1,
    name_short: 'Admin Test',
    name_full: 'Admin Test',
  };
  localStorage.setItem('dovela_token', 'token');
  localStorage.setItem('dovela_user', JSON.stringify(user));
  window.user = user;
}

// /normas, /certificados, /uso-suelo and /dev-guide used to be public leftovers
// of the citizen website. They keep their URLs but now live behind the same
// session guard (PrivateLayout) as every other backoffice module.
describe('Former public routes require a session', () => {
  beforeEach(() => {
    import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
    import.meta.env.VITE_GLOBAL_ID = '1';
    localStorage.clear();
    window.user = null;
  });

  it.each([
    ['/normas', 'NORMS'],
    ['/certificados', 'CERTIFICATE_WORKER'],
    ['/uso-suelo', 'ZONE_USE'],
    ['/dev-guide', 'DEV_GUIDE'],
  ])('renders %s inside AppShell when a session exists', async (path, label) => {
    seedSession();
    window.history.pushState({}, '', path);
    render(<App />);
    expect(await screen.findByTestId('app-shell')).toBeInTheDocument();
    expect(await screen.findByTestId(`mock-${label}`)).toBeInTheDocument();
  });

  it.each(['/normas', '/certificados', '/uso-suelo', '/dev-guide'])(
    'redirects %s to /login without a session',
    async (path) => {
      window.history.pushState({}, '', path);
      const { container } = render(<App />);
      await waitFor(() => expect(window.location.pathname).toBe('/login'));
      expect(container.querySelector('#email')).toBeTruthy();
      expect(screen.queryByTestId('app-shell')).toBeNull();
    },
  );
});
