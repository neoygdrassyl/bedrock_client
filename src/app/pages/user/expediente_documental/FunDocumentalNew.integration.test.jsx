import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FunDocumentalNew from './FunDocumentalNew';

const mocks = vi.hoisted(() => ({
  origin: vi.fn(),
  legacy: vi.fn(),
  fund: vi.fn(),
  user: vi.fn(),
  cubByFun: vi.fn(),
}));
vi.mock('./hooks/useDocumentaryOrigin', () => ({ useDocumentaryOrigin: mocks.origin }));
vi.mock('./hooks/useExpedienteDocumental', () => ({ useExpedienteDocumental: mocks.legacy }));
vi.mock('./ui/organisms/CanonicalDocumentaryWorkspace', async () => {
  const { useEffect } = await import('react');
  return { CanonicalDocumentaryWorkspace: ({ onCountChange }) => { useEffect(() => { onCountChange?.(7); }, [onCountChange]); return <div>Recepción canónica</div>; } };
});
vi.mock('./ui/organisms/DocumentaryGovernance', () => ({ DocumentaryGovernance: () => <div>Selector de configuración</div> }));
vi.mock('./ui/organisms/DocumentalWorkspaceHeader', () => ({ DocumentalWorkspaceHeader: () => <div>Redesigned documentary workspace</div> }));
vi.mock('../fun_forms/components/fun_docs', () => ({ default: () => { mocks.fund(); return <div>Legacy FUND module</div>; } }));
vi.mock('../shared/UnifiedDocumentEntryModal', () => ({ default: () => null }));
vi.mock('./ui/organisms/DocumentalReviewTable', () => ({ DocumentalReviewTable: () => null }));
vi.mock('@/app/services/data.service', () => ({ default: { getUserData: mocks.user } }));
vi.mock('@/app/services/cubXvr.service', () => ({ default: { getByFUN: mocks.cubByFun } }));

const CANONICAL = { mode: 'canonical', project: { fun0Id: 1, idPublic: 'FUN-1' }, publication: { configurationId: 1, releaseVersion: 1 } };
const TRADITIONAL = { mode: 'traditional', project: { fun0Id: 1, idPublic: 'FUN-1' } };
const LEGACY_STATE = { summary: {}, loading: false, error: null, visibleRows: [], filters: {}, vrOptions: [], filteredCount: 0, hasFilters: false, page: 1, pageSize: 10, totalPages: 1, entrySheet: { open: false, openWith: vi.fn(), close: vi.fn() }, refresh: vi.fn() };

// Waits for the CUB registry request so its state update lands inside act().
const settleIssuedCount = () => waitFor(() => expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveTextContent('0'));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockReturnValue({ role_short: 'ADM' });
  mocks.cubByFun.mockResolvedValue({ data: [] });
  mocks.legacy.mockReturnValue(LEGACY_STATE);
});

it('does not call legacy loaders while resolving source or when canonical', async () => {
  mocks.origin.mockReturnValue({ origin: null, loading: true, refresh: vi.fn() });
  const { rerender } = render(<FunDocumentalNew currentId={1} />);
  expect(screen.getByText(/Consultando/)).toBeInTheDocument();
  expect(mocks.legacy).not.toHaveBeenCalled();
  mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
  rerender(<FunDocumentalNew currentId={1} />);
  await waitFor(() => expect(screen.getByText('Recepción canónica')).toBeInTheDocument());
  expect(mocks.legacy).not.toHaveBeenCalled();
});

it('renders the redesigned workspace for a traditional origin and never the legacy module', async () => {
  mocks.origin.mockReturnValue({ origin: TRADITIONAL, refresh: vi.fn() });
  render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
  expect(screen.getByText('Redesigned documentary workspace')).toBeInTheDocument();
  expect(screen.queryByText('Legacy FUND module')).not.toBeInTheDocument();
  expect(mocks.fund).not.toHaveBeenCalled();
  await settleIssuedCount();
});

describe('documentary tabs', () => {
  it('opens on Radicación and hides Configuración documental for roles without access', async () => {
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    expect(screen.getByRole('tab', { name: /Radicación/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveAttribute('aria-selected', 'false');
    expect(screen.queryByRole('tab', { name: /Configuración documental/ })).not.toBeInTheDocument();
    expect(screen.getByText('Recepción canónica')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('tab', { name: /Radicación/ })).toHaveTextContent('7'));
    await settleIssuedCount();
  });

  it('shows Configuración documental for allowed roles and keeps Radicación mounted', async () => {
    const user = userEvent.setup();
    mocks.user.mockReturnValue({ role_short: 'CUR' });
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    expect(screen.queryByText('Selector de configuración')).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: /Configuración documental/ }));
    expect(screen.getByText('Selector de configuración')).toBeInTheDocument();
    // Radicación stays mounted (state preserved) but is no longer the active panel.
    expect(screen.getByText('Recepción canónica').closest('[role="tabpanel"]')).toHaveAttribute('data-state', 'inactive');
  });

  it('lists issued CUB documents read-only for a traditional expediente', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: TRADITIONAL, refresh: vi.fn() });
    mocks.cubByFun.mockResolvedValue({ data: [
      { id: 1, cub: 'CUB-0001', process: 'ACTA PARTE 1', vr: 'VR-10', date: '2026-01-05', desc: 'Acta de observaciones' },
      { id: 2, cub: 'CUB-0002', process: 'RESOLUCION', vr: 'VR-11', date: '2026-02-10T10:00:00.000Z', desc: 'Resolución de licencia' },
    ] });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await waitFor(() => expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveTextContent('2'));
    expect(mocks.cubByFun).toHaveBeenCalledWith('FUN-1');
    await user.click(screen.getByRole('tab', { name: /Expedidos/ }));
    const table = screen.getByRole('table', { name: 'Documentos expedidos' });
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('CUB-0002');
    expect(rows[1]).toHaveTextContent('10 feb 2026');
    expect(rows[2]).toHaveTextContent('CUB-0001');
    expect(rows[2]).toHaveTextContent('ACTA PARTE 1');
    expect(within(table).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/Por ahora se muestran los consecutivos de salida \(CUB\)/)).toBeInTheDocument();
  });

  it('renders null-like CUB values as a dash', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: TRADITIONAL, refresh: vi.fn() });
    mocks.cubByFun.mockResolvedValue({ data: [{ id: 3, cub: 'CUB-0003', process: 'PUBLICIDAD', vr: 'null', date: null, desc: null }] });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await waitFor(() => expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveTextContent('1'));
    await user.click(screen.getByRole('tab', { name: /Expedidos/ }));
    const [, row] = within(screen.getByRole('table', { name: 'Documentos expedidos' })).getAllByRole('row');
    expect(row).not.toHaveTextContent('null');
    expect(within(row).getAllByText('—')).toHaveLength(3);
  });

  it('shows a clean empty state when the expediente has no issued documents', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Expedidos/ }));
    expect(screen.getByText('Aún no hay documentos expedidos para este expediente.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
