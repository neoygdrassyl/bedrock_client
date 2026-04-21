import React from 'react';
import { render, screen } from '@testing-library/react';

function MockPage(name) {
  return () => React.createElement('div', { 'data-testid': `mock-${name}` }, name);
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

vi.mock('../app/pages/home', () => ({
  __esModule: true,
  default: () => (
    <div>
      <h1>Servicios</h1>
      <a href="/normas">Consulta Normatividad</a>
      <a href="/calculadora">Calculadora liquidación expensa</a>
      <a href="/calendario">Agendamiento de citas</a>
    </div>
  ),
}));

vi.mock('../app/layouts/AppShell', () => ({
  AppShell: ({ children }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key, opts) => (opts?.returnObjects ? {} : _key),
    i18n: { changeLanguage: vi.fn() },
  }),
  withTranslation: () => (Component) => (props) => <Component {...props} t={(k) => k} />,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

vi.mock('react-google-recaptcha', () => ({
  default: () => <div data-testid="recaptcha-mock" />,
}));

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

vi.mock('../app/components/jsons/vars', () => ({
  infoCud: {
    name: 'Curaduría Urbana Test',
    city: 'bucaramanga',
    nit: '000-000',
    email: 'test@test.com',
  },
}));

import App from '../app/App';

describe('App home route regression', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/home');
  });

  it('renders the public home actions instead of redirecting to login', async () => {
    render(<App />);

    expect(await screen.findByText('Servicios')).toBeInTheDocument();
    expect(screen.getByText('Consulta Normatividad')).toBeInTheDocument();
    expect(screen.queryByTestId('recaptcha-mock')).not.toBeInTheDocument();
  });
});
