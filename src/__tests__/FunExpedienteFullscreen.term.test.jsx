import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getFunByPublicMock, getFunMock, getSummaryByIdPublicMock } = vi.hoisted(() => ({
  getFunByPublicMock: vi.fn(),
  getFunMock: vi.fn(),
  getSummaryByIdPublicMock: vi.fn(),
}));

vi.mock('../features/expediente/fun/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: () => ({ bookmarks: [], error: null, setScope: vi.fn() }),
}));
vi.mock('../features/expediente/fun/fun_forms/hooks/useAlarms', () => ({
  useAlarms: () => ({ alarms: [] }),
}));
vi.mock('../features/expediente/api/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: getFunByPublicMock,
    get: getFunMock,
    getSummaryByIdPublic: getSummaryByIdPublicMock,
  },
}));
vi.mock('../features/expediente/api/legalGuide.service', () => ({
  __esModule: true,
  default: { getByPhase: vi.fn() },
}));
vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ onSelect, disabled, children }) => (
    <button type="button" role="menuitem" disabled={disabled} onClick={() => onSelect?.()}>{children}</button>
  ),
  DropdownMenuCheckboxItem: ({ checked, onCheckedChange, children }) => (
    <button type="button" role="menuitemcheckbox" aria-checked={Boolean(checked)} onClick={() => onCheckedChange?.(!checked)}>{children}</button>
  ),
}));
vi.mock('@/shared/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>,
}));
vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));
// The Tiempos module asks the workspace to refresh after a save (`requesRefresh`).
vi.mock('../features/expediente/fun/fun_forms/fun_clock', () => ({
  __esModule: true,
  default: ({ requesRefresh }) => <button type="button" onClick={() => requesRefresh()}>module-save</button>,
}));
vi.mock('../features/expediente/fun/fun_forms/fun_g', () => ({ __esModule: true, default: () => <div data-testid="module-detalles" /> }));
vi.mock('../features/expediente/records/RecordsBinnacleStack', () => ({ __esModule: true, default: () => null }));

import { FunExpedienteFullscreen } from '../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen';
import { useExpedienteTerm } from '../features/expediente/workspace/useExpedienteTerm';
import { notifyClockWritten } from '../features/expediente/api/clockWriteEvents';
import { __resetDockStoreForTests } from '../features/expediente/dock/expedienteDockStore';
import { __clearComputedTerms, getComputedTerm } from '../features/expediente/dock/computedTermStore';

const LDF = { id: 1, state: 5, date_start: '2026-01-05' };
const ACTA = { id: 2, state: 30, date_start: '2026-02-02', desc: 'ACTA PARTE 1 OBSERVACIONES: NO CUMPLE' };
const NOTIFIED = { id: 3, state: 32, date_start: '2026-02-10' };

const buildExpediente = (clocks) => ({
  id: 123,
  id_public: '68001-1-26-9950',
  version: 1,
  state: 5,
  type: 'i',
  date: '2026-01-02',
  rules: '0;0',
  fun_1s: [{ tipo: 'D', tramite: 'A', m_lic: '', m_urb: '', m_sub: '' }],
  fun_clocks: clocks,
  // Backend summary fields that disagree with Tiempos: they must never reach the header.
  fase_actual: 'EST',
  fase_label: 'Estudio y Observaciones',
  status: 'EN_TERMINO',
  dias_habiles_usados: 7,
  dias_habiles_limite: 45,
});

const expectedTerm = (item) => renderHook(() => useExpedienteTerm(item)).result.current;

function renderWorkspace(item, props = {}) {
  return render(
    <FunExpedienteFullscreen expediente={item} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} {...props} />
  );
}

// Compute `expectedTerm` OUTSIDE `waitFor`: its `renderHook` mutates the DOM, which re-runs the
// `waitFor` callback through its MutationObserver and starves the timers (the test hangs).
function expectHeaderShows(term) {
  const indicator = screen.getByTestId('expediente-term-indicator');
  expect(within(indicator).getByTestId('expediente-term-text')).toHaveTextContent(term.text);
  expect(within(indicator).getByTestId('expediente-term-ratio')).toHaveTextContent(term.ratioText);
  expect(within(indicator).getByTestId('expediente-term-phase')).toHaveTextContent(term.phaseTitle);
  expect(indicator).toHaveAttribute('title', term.description);
  expect(screen.getByTestId('expediente-header-identity')).toHaveTextContent(term.statusMeta.label);
  return indicator;
}

afterEach(() => {
  vi.clearAllMocks();
  __resetDockStoreForTests();
  __clearComputedTerms();
  document.body.className = '';
  document.body.style.overflow = '';
});

describe('FunExpedienteFullscreen legal term (header)', () => {
  it('renders the Tiempos term (not the backend summary) as display-only text', () => {
    const item = buildExpediente([LDF, ACTA]);
    const term = expectedTerm(item);
    expect(term.phaseTitle).toBe('Notificación Observaciones');

    renderWorkspace(item);

    const indicator = expectHeaderShows(term);
    expect(indicator).not.toHaveTextContent('7/45 d');
    // Nothing in the term area can be focused or edited.
    expect(indicator.querySelectorAll('input, select, textarea, button, a, [tabindex], [contenteditable="true"]')).toHaveLength(0);
    // The dock reads the same computed value.
    expect(getComputedTerm('68001-1-26-9950')).toStrictEqual(term);
  });

  it('updates when the expediente arrives with new clocks', () => {
    const before = buildExpediente([LDF, ACTA]);
    const after = buildExpediente([LDF, ACTA, NOTIFIED]);
    const termBefore = expectedTerm(before);
    const termAfter = expectedTerm(after);
    expect(termAfter.phaseTitle).toBe('Correcciones del Solicitante');

    const { rerender } = renderWorkspace(before);
    expectHeaderShows(termBefore);

    rerender(<FunExpedienteFullscreen expediente={after} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} />);
    expectHeaderShows(termAfter);
  });

  it('reloads the detail once when any module writes a clock of this expediente', async () => {
    const before = buildExpediente([LDF, ACTA]);
    const after = buildExpediente([LDF, ACTA, NOTIFIED]);
    getFunByPublicMock.mockResolvedValue({ data: after });

    renderWorkspace(before);
    expectHeaderShows(expectedTerm(before));

    // A clock of another expediente is ignored.
    act(() => notifyClockWritten({ fun0Id: 999 }));
    expect(getFunByPublicMock).not.toHaveBeenCalled();

    const write = new FormData();
    write.set('fun0Id', '123');
    act(() => notifyClockWritten(write));
    const termAfter = expectedTerm(after);
    await waitFor(() => expectHeaderShows(termAfter));
    expect(getFunByPublicMock).toHaveBeenCalledTimes(1);
    expect(getFunByPublicMock).toHaveBeenCalledWith('68001-1-26-9950', undefined, { force: true });
  });

  it('a module refresh of the same expediente reloads the detail without an extra GET /fun/:id', async () => {
    const user = userEvent.setup();
    const before = buildExpediente([LDF, ACTA]);
    const after = buildExpediente([LDF, ACTA, NOTIFIED]);
    getFunByPublicMock.mockResolvedValue({ data: after });
    getSummaryByIdPublicMock.mockResolvedValue({ data: null });

    renderWorkspace(before, { initialSection: 'tiempos' });
    await user.click(await screen.findByRole('button', { name: 'module-save' }));

    const termAfter = expectedTerm(after);

    await waitFor(() => expectHeaderShows(termAfter));
    expect(getFunMock).not.toHaveBeenCalled();
    expect(getFunByPublicMock).toHaveBeenCalledTimes(1);
  });

  const deferred = () => {
    let resolve;
    const promise = new Promise((res) => { resolve = res; });
    return { promise, resolve };
  };

  it('a clock write while a pre-write GET is pending ends with the post-write term', async () => {
    const user = userEvent.setup();
    const before = buildExpediente([LDF, ACTA]);
    const after = buildExpediente([LDF, ACTA, NOTIFIED]);
    const preWrite = deferred();
    const postWrite = deferred();
    getFunByPublicMock.mockReturnValueOnce(preWrite.promise).mockReturnValueOnce(postWrite.promise);
    getSummaryByIdPublicMock.mockResolvedValue({ data: null });

    renderWorkspace(before, { initialSection: 'tiempos' });
    // A module reload starts a GET (pending) ...
    await user.click(await screen.findByRole('button', { name: 'module-save' }));
    expect(getFunByPublicMock).toHaveBeenCalledTimes(1);

    // ... then a clock is written: its reload must not join that GET.
    act(() => notifyClockWritten({ fun0Id: 123 }));
    await waitFor(() => expect(getFunByPublicMock).toHaveBeenCalledTimes(2));
    expect(getFunByPublicMock).toHaveBeenLastCalledWith('68001-1-26-9950', undefined, { force: true });

    await act(async () => { postWrite.resolve({ data: after }); });
    const termAfter = expectedTerm(after);
    await waitFor(() => expectHeaderShows(termAfter));
    // The pre-write response arriving last never overwrites the newer term.
    await act(async () => { preWrite.resolve({ data: { ...before } }); });
    expectHeaderShows(expectedTerm(after));
  });

  it('a pending reload of expediente A never overwrites expediente B after a switch', async () => {
    const itemA = buildExpediente([LDF, ACTA]);
    const itemAAfter = buildExpediente([LDF, ACTA, NOTIFIED]);
    const itemB = { ...buildExpediente([LDF]), id: 456, id_public: '68001-1-26-9951' };
    const pendingA = deferred();
    getFunByPublicMock.mockReturnValueOnce(pendingA.promise);

    const { rerender } = renderWorkspace(itemA);
    act(() => notifyClockWritten({ fun0Id: 123 }));
    await waitFor(() => expect(getFunByPublicMock).toHaveBeenCalledTimes(1));

    rerender(<FunExpedienteFullscreen expediente={itemB} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} />);
    const termB = expectedTerm(itemB);
    expectHeaderShows(termB);

    await act(async () => { pendingA.resolve({ data: itemAAfter }); });
    expectHeaderShows(termB);
  });

  it('coalesces a burst of clock writes into one reload and ignores other expedientes', async () => {
    const before = buildExpediente([LDF, ACTA]);
    const after = buildExpediente([LDF, ACTA, NOTIFIED]);
    getFunByPublicMock.mockResolvedValue({ data: after });

    renderWorkspace(before);
    act(() => {
      for (let index = 0; index < 5; index += 1) notifyClockWritten({ fun0Id: 123 });
      notifyClockWritten({ fun0Id: 999 });
    });

    const termAfter = expectedTerm(after);

    await waitFor(() => expectHeaderShows(termAfter));
    // Past the coalescing window nothing else is requested.
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getFunByPublicMock).toHaveBeenCalledTimes(1);
  });

  it('a write for another expediente triggers no reload', async () => {
    renderWorkspace(buildExpediente([LDF, ACTA]));
    act(() => notifyClockWritten({ fun0Id: 999 }));
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(getFunByPublicMock).not.toHaveBeenCalled();
  });

  it('without clocks it shows a neutral "Sin estado", never a summary number', () => {
    const { fun_clocks: _clocks, ...withoutClocks } = buildExpediente([]);

    renderWorkspace(withoutClocks);

    const identity = screen.getByTestId('expediente-header-identity');
    expect(identity).toHaveTextContent('Sin estado');
    expect(identity).not.toHaveTextContent('En término');
    expect(identity).not.toHaveTextContent('7/45');
  });
});
