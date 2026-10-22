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

vi.mock('../../features/pqrs/pqrsadmin', () => ({ __esModule: true, default: MockPage('PQRSADMIN') }));
vi.mock('../../features/liquidator/liquidator', () => ({ __esModule: true, default: MockPage('Liquidator') }));
vi.mock('../../features/dashboard/dashboard', () => ({ __esModule: true, default: MockPage('Dashboard') }));
vi.mock('../../features/publications/publish', () => ({ __esModule: true, default: MockPage('Publish') }));
vi.mock('../../features/seals/seal', () => ({ __esModule: true, default: MockPage('Seals') }));
vi.mock('../../features/appointments/appointments', () => ({ __esModule: true, default: MockPage('Appointments') }));
vi.mock('../../features/messaging/mail', () => ({ __esModule: true, default: MockPage('Mail') }));
vi.mock('../../features/expediente/fun/fun', () => ({ __esModule: true, default: MockPage('FUN') }));
vi.mock('../../features/documentos/osha', () => ({ __esModule: true, default: MockPage('OSHA') }));
vi.mock('../../features/nomenclature/nomenclature', () => ({ __esModule: true, default: MockPage('NOMENCLATURE') }));
vi.mock('../../features/ventanilla/submit', () => ({ __esModule: true, default: MockPage('SUBMIT') }));
vi.mock('../../features/archive/archive.page', () => ({ __esModule: true, default: MockPage('ARCHIVE') }));
vi.mock('../../features/dictionary/dictionary.page', () => ({ __esModule: true, default: MockPage('DICTIONARY') }));
vi.mock('../../features/expediente/fun/funmanage.page', () => ({ __esModule: true, default: MockPage('FUN_MANAGE') }));
vi.mock('../../features/professionals/profesionals.page', () => ({ __esModule: true, default: MockPage('PROFESIONALS') }));
vi.mock('../../features/help/guide_user/guide_user.page', () => ({ __esModule: true, default: MockPage('GUIDE_USER') }));
vi.mock('../../features/help/dev_guide/dev_guide.page', () => ({ __esModule: true, default: MockPage('DEV_GUIDE') }));
vi.mock('../../features/norms/norms.page', () => ({ __esModule: true, default: MockPage('NORMS') }));
vi.mock('../../features/certifications/certification.page', () => ({ __esModule: true, default: MockPage('CERTIFICATE_WORKER') }));
vi.mock('../../features/norms/zone-use/zone_use.page', () => ({ __esModule: true, default: MockPage('ZONE_USE') }));

// ─── Componentes de App shell ───────────────────────────────────────────────

vi.mock('../../app/components/navbar', () => ({ __esModule: true, default: (props) => require('react').createElement('nav', { 'data-testid': 'navbar' }, 'Navbar') }));
vi.mock('../../app/components/btnAccesibility', () => ({ __esModule: true, default: () => null }));
