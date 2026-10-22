import React from 'react';
import { render, screen } from '@testing-library/react';

function MockPage(name) {
  return () => <div data-testid={`mock-${name}`}>{name}</div>;
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
vi.mock('../features/expediente/fun/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE_OLD') }));
vi.mock('../features/expediente/fun/funmanage_new.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE_NEW') }));
vi.mock('../features/professionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../features/help/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../features/help/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../features/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../features/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../features/norms/zone-use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));
vi.mock('../features/simulador/legal_flow_guide/LegalFlowGuide.page', () => ({ __esModule: true, default: MockPage('LEGAL_FLOW_GUIDE') }));

vi.mock('../app/layouts/AppShell', () => ({
  AppShell: ({ children }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock('../app/layouts/BusinessCalendarBootstrap', () => ({
  default: ({ children }) => children,
}));

vi.mock('@/shared/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

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

vi.mock('../shared/api/data.service', () => ({
  __esModule: true,
  default: {
    restoreSession: vi.fn(() => true),
    getUserData: vi.fn(() => ({ id: 1, name: 'Test User' })),
    setUserNull: vi.fn(),
  },
}));

import App from '../app/App';

describe('App FUN management routing regression', () => {
  beforeAll(() => {
    import.meta.env.VITE_API_URL = 'http://localhost/dovela-backend/public';
    import.meta.env.VITE_GLOBAL_ID = '1';
    import.meta.env.VITE_GOOGLE_CAPTCHA_HTML = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  });

  test('routes /licencias/gestion to the old FUN management page', async () => {
    window.history.pushState({}, '', '/licencias/gestion');

    render(<App />);

    expect(await screen.findByTestId('mock-FUN_MANAGE_OLD')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-FUN_MANAGE_NEW')).not.toBeInTheDocument();
  });

  test('keeps /licencias/gestion-nueva pointing to the new FUN workspace page', async () => {
    window.history.pushState({}, '', '/licencias/gestion-nueva');

    render(<App />);

    expect(await screen.findByTestId('mock-FUN_MANAGE_NEW')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-FUN_MANAGE_OLD')).not.toBeInTheDocument();
  });
});
