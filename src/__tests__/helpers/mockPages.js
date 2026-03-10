/**
 * Mock compartido para todas las páginas que App.js importa.
 * Usar en cualquier test que renderice <App /> completo.
 *
 * Uso: importar al inicio del archivo de test (antes de cualquier import de componente)
 *   import './helpers/mockPages';
 *
 * O copiar los vi.mock() necesarios si solo se prueban páginas específicas.
 */

function MockPage(name) {
  return (props) => require('react').createElement('div', { 'data-testid': `mock-${name}` }, name);
}

// ─── Páginas de App.js ──────────────────────────────────────────────────────

vi.mock('../../app/pages/user/pqrs/pqrsadmin', () => ({ __esModule: true, default: MockPage('PQRSADMIN') }));
vi.mock('../../app/pages/liquidator/liquidator', () => ({ __esModule: true, default: MockPage('Liquidator') }));
vi.mock('../../app/pages/user/dashboard', () => ({ __esModule: true, default: MockPage('Dashboard') }));
vi.mock('../../app/pages/user/publish', () => ({ __esModule: true, default: MockPage('Publish') }));
vi.mock('../../app/pages/user/seal', () => ({ __esModule: true, default: MockPage('Seals') }));
vi.mock('../../app/pages/user/appointments', () => ({ __esModule: true, default: MockPage('Appointments') }));
vi.mock('../../app/pages/user/mail', () => ({ __esModule: true, default: MockPage('Mail') }));
vi.mock('../../app/pages/user/fun', () => ({ __esModule: true, default: MockPage('FUN') }));
vi.mock('../../app/pages/user/osha', () => ({ __esModule: true, default: MockPage('OSHA') }));
vi.mock('../../app/pages/user/nomenclature/nomenclature', () => ({ __esModule: true, default: MockPage('NOMENCLATURE') }));
vi.mock('../../app/pages/user/submit/submit', () => ({ __esModule: true, default: MockPage('SUBMIT') }));
vi.mock('../../app/pages/user/archive/archive.page', () => ({ __esModule: true, default: MockPage('ARCHIVE') }));
vi.mock('../../app/pages/user/dictionary.page', () => ({ __esModule: true, default: MockPage('DICTIONARY') }));
vi.mock('../../app/pages/user/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE') }));
vi.mock('../../app/pages/user/profesionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../../app/pages/user/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../../app/pages/user/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../../app/pages/user/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../../app/pages/user/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../../app/pages/user/zone_use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));

// ─── Componentes de App shell ───────────────────────────────────────────────

vi.mock('../../app/components/footer', () => ({ __esModule: true, default: (props) => require('react').createElement('footer', { id: 'footer-app-main' }, 'Footer') }));
vi.mock('../../app/components/navbar', () => ({ __esModule: true, default: (props) => require('react').createElement('nav', { 'data-testid': 'navbar' }, 'Navbar') }));
vi.mock('../../app/components/btnStart', () => ({ __esModule: true, default: () => null }));
vi.mock('../../app/components/btnChat', () => ({ __esModule: true, default: () => null }));
vi.mock('../../app/components/btnAccesibility', () => ({ __esModule: true, default: () => null }));
