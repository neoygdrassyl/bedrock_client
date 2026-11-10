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
  generators: vi.fn(),
  legalMounts: vi.fn(),
  workspaceVariant: vi.fn(),
  inputReloadKey: vi.fn(),
}));
vi.mock('./hooks/useDocumentaryOrigin', () => ({ useDocumentaryOrigin: mocks.origin }));
vi.mock('./hooks/useExpedienteDocumental', () => ({ useExpedienteDocumental: mocks.legacy }));
vi.mock('./ui/organisms/CanonicalDocumentaryWorkspace', async () => {
  const { useEffect } = await import('react');
  return { CanonicalDocumentaryWorkspace: ({ onCountChange, onRequirementsRefreshed, variant = 'input', reloadKey = 0 }) => {
    useEffect(() => { onCountChange?.(variant === 'issued' ? 3 : 7); }, [onCountChange, variant]);
    mocks.workspaceVariant(variant);
    if (variant === 'input') mocks.inputReloadKey(reloadKey);
    if (variant === 'issued') return <div>Expedidos canónicos</div>;
    return <div>Recepción canónica<button type="button" onClick={onRequirementsRefreshed}>Simular actualización de requisitos</button></div>;
  } };
});
vi.mock('./ui/organisms/DocumentaryGovernance', () => ({ DocumentaryGovernance: ({ onSaved }) => <div>Selector de configuración<button type="button" onClick={() => onSaved('Requisitos evaluados', true)}>Simular guardado</button></div> }));
vi.mock('./ui/organisms/DocumentalWorkspaceHeader', () => ({ DocumentalWorkspaceHeader: () => <div>Redesigned documentary workspace</div> }));
vi.mock('../fun/fun_forms/components/fun_docs', () => ({ default: () => { mocks.fund(); return <div>Legacy FUND module</div>; } }));
vi.mock('./shared/UnifiedDocumentEntryModal', () => ({ default: () => null }));
vi.mock('./ui/organisms/LegalFormPanel', () => ({ default: function LegalMock({ onDeclarationChanged, onDataChanged }) { mocks.legalMounts(); return <><button type="button" onClick={onDeclarationChanged}>Panel de legal y debida forma</button><button type="button" onClick={onDataChanged}>Simular cambio documental</button></>; } }));
vi.mock('./ui/organisms/DocumentGeneratorsPanel', () => ({ default: (props) => { mocks.generators(props); return <div>Panel de generadores</div>; } }));
vi.mock('./ui/organisms/DocumentalReviewTable', () => ({ DocumentalReviewTable: ({ summary }) => <div>{summary}</div> }));
vi.mock('@/shared/api/data.service', () => ({ default: { getUserData: mocks.user } }));
vi.mock('@/features/expediente/api/cubXvr.service', () => ({ default: { getByFUN: mocks.cubByFun } }));

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
  expect(screen.getByText('Documentación tradicional')).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Gestión documental' })).not.toBeInTheDocument();
  expect(screen.queryByText('Legacy FUND module')).not.toBeInTheDocument();
  expect(mocks.fund).not.toHaveBeenCalled();
  await settleIssuedCount();
});

it('keeps the origin query error visible with a retry action once the banner is gone', async () => {
  const user = userEvent.setup();
  const refresh = vi.fn();
  mocks.origin.mockReturnValue({ origin: null, error: 'Publicación no disponible', refresh });
  render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
  expect(screen.getByRole('alert')).toHaveTextContent('Publicación no disponible');
  await user.click(screen.getByRole('button', { name: 'Reintentar' }));
  expect(refresh).toHaveBeenCalledTimes(1);
  await settleIssuedCount();
});

it('shows the pending Central activation notice without a banner', async () => {
  mocks.origin.mockReturnValue({ origin: { ...TRADITIONAL, publication: null, warnings: [{ code: 'CENTRAL_ACTIVATION_PENDING', releaseVersion: 3, releaseId: 'rel-a' }] }, refresh: vi.fn() });
  render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
  expect(screen.getByRole('note')).toHaveTextContent('versión 3 (rel-a), pendiente de activación');
  await settleIssuedCount();
});

describe('documentary tabs', () => {
  it.each([['canonical', CANONICAL], ['traditional', TRADITIONAL]])('offers Generar documentos to any role for a %s expediente', async (_, origin) => {
    const user = userEvent.setup();
    vi.stubEnv('VITE_DOCUMENTARY_CONFIGURATION_ACCESS', 'managers');
    mocks.origin.mockReturnValue({ origin, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" currentVersion={2} swaMsg={{ ok: 1 }} />);
    await settleIssuedCount();
    expect(screen.queryByRole('tab', { name: /Configuración documental/ })).not.toBeInTheDocument();
    expect(mocks.generators).not.toHaveBeenCalled();
    await user.click(screen.getByRole('tab', { name: /Generar documentos/ }));
    expect(await screen.findByText('Panel de generadores')).toBeInTheDocument();
    expect(mocks.generators).toHaveBeenCalledWith(expect.objectContaining({ currentId: 1, currentVersion: 2, swaMsg: { ok: 1 } }));
    vi.unstubAllEnvs();
  });

  it('opens on Radicación and hides Configuración documental for roles without access', async () => {
    // The role restriction only applies when the temporary access switch is set to 'managers'.
    vi.stubEnv('VITE_DOCUMENTARY_CONFIGURATION_ACCESS', 'managers');
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    // No module banner: the documentary origin is a compact chip at the end of the tab bar (the radicado lives in the expediente header).
    expect(screen.queryByRole('heading', { name: 'Gestión documental' })).not.toBeInTheDocument();
    expect(screen.queryByText('FUN-1')).not.toBeInTheDocument();
    expect(screen.getByText('Catálogo v1')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Radicación/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveAttribute('aria-selected', 'false');
    expect(screen.queryByRole('tab', { name: /Configuración documental/ })).not.toBeInTheDocument();
    expect(screen.getByText('Recepción canónica')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('tab', { name: /Radicación/ })).toHaveTextContent('7'));
    await settleIssuedCount();
    vi.unstubAllEnvs();
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

  it('shows the issued documents table of the new model above the CUB consecutivos, and counts both', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    mocks.cubByFun.mockResolvedValue({ data: [{ id: 1, cub: 'CUB-0001', process: 'ACTA PARTE 1', vr: 'VR-10', date: '2026-01-05', desc: 'Acta de observaciones' }] });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await waitFor(() => expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveTextContent('1'));
    expect(mocks.workspaceVariant).not.toHaveBeenCalledWith('issued'); // loads only when the tab opens
    await user.click(screen.getByRole('tab', { name: /Expedidos/ }));
    expect(await screen.findByText('Expedidos canónicos')).toBeInTheDocument();
    expect(mocks.workspaceVariant).toHaveBeenCalledWith('issued');
    expect(screen.getByRole('heading', { name: 'Consecutivos de salida (CUB)' })).toBeInTheDocument();
    expect(within(screen.getByRole('table', { name: 'Consecutivos de salida (CUB)' })).getByText('CUB-0001')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('tab', { name: /Expedidos/ })).toHaveTextContent('4'));
  });

  it('does not add an empty CUB card below the issued table of the new model', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Expedidos/ }));
    expect(await screen.findByText('Expedidos canónicos')).toBeInTheDocument();
    expect(screen.queryByText('Aún no hay documentos expedidos para este expediente.')).not.toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('opens Evaluación técnica only for canonical expedientes and tells traditional ones it is unavailable', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    const { unmount } = render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Evaluación técnica/ }));
    expect(await screen.findByRole('group', { name: 'Filtrar controles técnicos por etiqueta' })).toBeInTheDocument();
    await waitFor(() => expect(mocks.workspaceVariant).toHaveBeenCalledWith('technical'));
    expect(screen.queryByText('No disponible para expedientes tradicionales.')).not.toBeInTheDocument();
    unmount();
    mocks.origin.mockReturnValue({ origin: TRADITIONAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Evaluación técnica/ }));
    expect(await screen.findByText('No disponible para expedientes tradicionales.')).toBeInTheDocument();
  });

  it('shows Legal y debida forma for every expediente and reloads the module after a declaration', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh });
    const { unmount } = render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    // Evaluación técnica follows Legal y debida forma, right before Generar documentos.
    const technicalIndex = tabs.findIndex((text) => text.includes('Evaluación técnica'));
    expect(tabs.findIndex((text) => text.includes('Legal y debida forma'))).toBe(technicalIndex - 1);
    expect(technicalIndex).toBe(tabs.findIndex((text) => text.includes('Generar documentos')) - 1);
    await user.click(screen.getByRole('tab', { name: /Legal y debida forma/ }));
    await user.click(await screen.findByRole('button', { name: 'Panel de legal y debida forma' }));
    expect(refresh).toHaveBeenCalledTimes(1);
    // The origin refresh must not unmount the open tab.
    expect(screen.getByRole('tab', { name: /Legal y debida forma/ })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: /Generar documentos/ }));
    expect(await screen.findByText('Panel de generadores')).toBeInTheDocument();
    unmount();
    mocks.origin.mockReturnValue({ origin: TRADITIONAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Legal y debida forma/ }));
    expect(await screen.findByRole('button', { name: 'Panel de legal y debida forma' })).toBeInTheDocument();
  });

  it('reloads Radicación once, when it is shown again, after Legal y debida forma changed documentary data', async () => {
    const user = userEvent.setup();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh: vi.fn() });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    expect(mocks.inputReloadKey).toHaveBeenLastCalledWith(0);
    await user.click(screen.getByRole('tab', { name: /Legal y debida forma/ }));
    await user.click(await screen.findByRole('button', { name: 'Simular cambio documental' }));
    await user.click(screen.getByRole('button', { name: 'Simular cambio documental' }));
    // Hidden Radicación does not reload while Legal y debida forma is open.
    expect(mocks.inputReloadKey).toHaveBeenLastCalledWith(0);
    await user.click(screen.getByRole('tab', { name: /Radicación/ }));
    await waitFor(() => expect(mocks.inputReloadKey).toHaveBeenLastCalledWith(2));
    expect(new Set(mocks.inputReloadKey.mock.calls.map(([key]) => key))).toEqual(new Set([0, 2]));
  });

  it('reloads the origin and remounts Legal y debida forma after the Radicación banner refreshes the requirements', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Legal y debida forma/ }));
    await screen.findByRole('button', { name: 'Panel de legal y debida forma' });
    const mounts = mocks.legalMounts.mock.calls.length;
    await user.click(screen.getByRole('button', { name: 'Simular actualización de requisitos' }));
    expect(refresh).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(mocks.legalMounts.mock.calls.length).toBeGreaterThan(mounts));
  });

  it('reloads the origin when the governance panel refreshes the requirements', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();
    mocks.origin.mockReturnValue({ origin: CANONICAL, refresh });
    render(<FunDocumentalNew currentId={1} currentPublic="FUN-1" />);
    await settleIssuedCount();
    await user.click(screen.getByRole('tab', { name: /Configuración documental/ }));
    await user.click(screen.getByRole('button', { name: 'Simular guardado' }));
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
