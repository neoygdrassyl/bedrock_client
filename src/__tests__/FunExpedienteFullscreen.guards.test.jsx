import React, { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getSummaryByIdPublicMock, getLegalGuideByPhaseMock } = vi.hoisted(() => ({
  getSummaryByIdPublicMock: vi.fn(),
  getLegalGuideByPhaseMock: vi.fn(),
}));

vi.mock('../features/expediente/fun/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    error: null,
    setScope: vi.fn(),
  }),
}));

vi.mock('../features/expediente/fun/fun_forms/hooks/useAlarms', () => ({
  useAlarms: () => ({ alarms: [] }),
}));

vi.mock('../features/expediente/api/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: vi.fn(),
    get: vi.fn(),
    getSummaryByIdPublic: getSummaryByIdPublicMock,
  },
}));

vi.mock('../features/expediente/api/legalGuide.service', () => ({
  __esModule: true,
  default: {
    getByPhase: getLegalGuideByPhaseMock,
  },
}));

vi.mock('@/shared/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  // Menus are rendered open so their items can be reached without driving the popover.
  DropdownMenuItem: ({ onSelect, disabled, children }) => (
    <button type="button" role="menuitem" disabled={disabled} onClick={() => onSelect?.()}>
      {children}
    </button>
  ),
  DropdownMenuCheckboxItem: ({ checked, onCheckedChange, disabled, children, className: _className, ...props }) => (
    <button type="button" role="menuitemcheckbox" aria-checked={Boolean(checked)} disabled={disabled} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return <button type="button" {...props}>{children}</button>;
  },
}));

vi.mock('@/shared/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

vi.mock('@/shared/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../features/expediente/fun/fun_forms/fun_g', () => ({ __esModule: true, default: () => <div data-testid="module-detalles" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_c', () => ({ __esModule: true, default: () => <div data-testid="module-chequeo" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_n', () => ({ __esModule: true, default: () => <div data-testid="module-actualizar" /> }));
vi.mock('../features/expediente/fun/fun_forms/components/fun_docs', () => ({ __esModule: true, default: () => <div data-testid="module-documentos" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_alertn', () => ({ __esModule: true, default: () => <div data-testid="module-publicidad" /> }));
vi.mock('../features/expediente/fun/fun_forms/fun_clock', () => ({ __esModule: true, default: () => <div data-testid="module-tiempos" /> }));
vi.mock('../features/expediente/records/record_arc', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-arc" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna arquitectura</div> : null}
    </div>
  ),
}));
vi.mock('../features/expediente/records/record_law', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-law" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna jurídica</div> : null}
    </div>
  ),
}));
vi.mock('../features/expediente/records/record_eng', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-eng" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna estructural</div> : null}
    </div>
  ),
}));
vi.mock('../features/expediente/records/record_review', () => ({ __esModule: true, default: () => <div data-testid="module-review" /> }));
vi.mock('../features/expediente/records/record_ph', () => ({ __esModule: true, default: () => <div data-testid="module-ph" /> }));
vi.mock('../features/expediente/expeditions/expedition.page', () => ({ __esModule: true, default: () => <div data-testid="module-expedition" /> }));
vi.mock('../features/expediente/records/records_binnacles.component', () => ({
  __esModule: true,
  default: ({ AIM, compact }) => (
    <div data-testid="records-binnacle" data-aim={AIM} data-compact={compact ? 'true' : 'false'}>
      Bitácora - {AIM}
    </div>
  ),
}));

import { FunExpedienteFullscreen } from '../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen';
import { __resetDockStoreForTests, addToDock, getDockSnapshot } from '../features/expediente/dock/expedienteDockStore';

const expediente = {
  id: 123,
  id_public: '2026-00123',
  version: 1,
  state: 10,
  rules: '0;0',
  fun_1s: [{ tipo: 'D', tramite: 'A', m_lic: '', m_urb: '', m_sub: '' }],
  fase_actual: 'EST',
  fase_label: 'Estudio y Observaciones',
  status: 'EN_TERMINO',
  porcentaje_avance: 35,
  dias_habiles_usados: 7,
  dias_habiles_limite: 20,
  fecha_radicacion: '2026-04-01',
  fecha_limite: '2026-05-01',
};

describe('FunExpedienteFullscreen runtime guards', () => {
  it('omite la recarga del resumen legal cuando el expediente inicial ya trae metadatos suficientes', async () => {
    getSummaryByIdPublicMock.mockResolvedValue({ data: null });

    render(
      <StrictMode>
        <FunExpedienteFullscreen
          expediente={expediente}
          translation={{}}
          globals={{}}
          swaMsg={{}}
          onClose={vi.fn()}
        />
      </StrictMode>
    );

    // The workspace is a landmark of the page (it lives inside the app shell), not a modal dialog.
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /detalle del expediente/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    expect(getSummaryByIdPublicMock).not.toHaveBeenCalled();
  });

  it('no consulta la guia legal cuando el workspace abre directo en Chequeo', async () => {
    getLegalGuideByPhaseMock.mockResolvedValue({ data: null });

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        defaultRightPanelOpen
        initialSection="chequeo"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('module-chequeo')).toBeInTheDocument();
    });

    expect(getLegalGuideByPhaseMock).not.toHaveBeenCalled();
  });

  it('muestra solo las tres bitacoras profesionales en el panel lateral derecho', async () => {
    getLegalGuideByPhaseMock.mockResolvedValue({ data: null });

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        defaultRightPanelOpen
        initialSection="juridico"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('records-binnacle')).toHaveLength(3);
      expect(screen.getByTestId('module-law')).toBeInTheDocument();
    });

    expect(screen.getByText('Bitácora - Jurídico')).toBeInTheDocument();
    expect(screen.getByText('Bitácora - Arquitectura')).toBeInTheDocument();
    expect(screen.getByText('Bitácora - Estructural')).toBeInTheDocument();
    expect(screen.getAllByTestId('records-binnacle').every((node) => node.dataset.compact === 'true')).toBe(true);
    expect(screen.getByTestId('module-law')).toHaveAttribute('data-hide-inline-binnacles', 'true');
    expect(screen.queryAllByTestId('records-binnacle-inline')).toHaveLength(0);
    const panel = screen.getByRole('complementary', { name: /bitácoras profesionales/i });
    const toggle = screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' });
    // The single panel toggle lives in the "Más" menu of the workspace, not inside the panel.
    expect(panel).not.toContainElement(toggle);
    expect(toggle).toBeChecked();

    expect(screen.queryByText(/Estado y términos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bitácora operativa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Alertas y anuncios/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Actividad reciente/i)).not.toBeInTheDocument();
  });

  it('mantiene cerrado el panel lateral por defecto al entrar en Tiempos', async () => {
    getLegalGuideByPhaseMock.mockResolvedValue({ data: null });

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="tiempos"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('module-tiempos')).toBeInTheDocument();
    });

    expect(screen.queryAllByTestId('records-binnacle')).toHaveLength(0);
    expect(screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' })).not.toBeChecked();
    expect(screen.queryByRole('complementary', { name: /bitácoras profesionales/i })).not.toBeInTheDocument();
  });

  it('abre el panel lateral al navegar desde un modulo cerrado hacia Inf. Jur', async () => {
    const user = userEvent.setup();
    getLegalGuideByPhaseMock.mockResolvedValue({ data: null });

    render(
      <FunExpedienteFullscreen
        expediente={expediente}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="publicidad"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('module-publicidad')).toBeInTheDocument();
    });

    expect(screen.queryAllByTestId('records-binnacle')).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: /informe jur/i }));

    await waitFor(() => {
      expect(screen.getAllByTestId('records-binnacle')).toHaveLength(3);
    });

    expect(screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' })).toBeChecked();
    expect(screen.getByRole('complementary', { name: /bitácoras profesionales/i })).toBeInTheDocument();
  });

  it('reports section changes so the route can sync the URL', async () => {
    const user = userEvent.setup();
    const onSectionChange = vi.fn();
    render(
      <FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} onSectionChange={onSectionChange} />
    );

    expect(onSectionChange).toHaveBeenLastCalledWith('detalles');
    await user.click(screen.getByRole('button', { name: 'Tiempos' }));
    expect(onSectionChange).toHaveBeenLastCalledWith('tiempos');
    // The module area is the landmark named after the active module (there is no page heading).
    expect(await screen.findByTestId('module-tiempos')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Tiempos' })).toContainElement(screen.getByTestId('module-tiempos'));
    expect(screen.getByRole('button', { name: 'Tiempos' })).toHaveAttribute('aria-current', 'page');
  });

  it('minimiza el expediente a una ventana del dock y cierra el workspace', async () => {
    const user = userEvent.setup();
    window.localStorage.clear();
    __resetDockStoreForTests();
    const onClose = vi.fn();
    render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={onClose} />);

    expect(getDockSnapshot().activeWorkspace).toBe('2026-00123');
    await user.click(within(screen.getByRole('group', { name: 'Ventana del expediente' })).getByRole('button', { name: 'Minimizar' }));

    expect(getDockSnapshot().items).toEqual([expect.objectContaining({ radicado: '2026-00123', open: true })]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('cierra el workspace desde el control Cerrar de la ventana', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={onClose} />);

    const windowControls = screen.getByRole('group', { name: 'Ventana del expediente' });
    expect(within(windowControls).getByRole('button', { name: /expedientes abiertos/i })).toBeInTheDocument();
    await user.click(within(windowControls).getByRole('button', { name: 'Cerrar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('oculta y vuelve a mostrar las bitácoras desde Panel de bitácoras', async () => {
    const user = userEvent.setup();
    render(
      <FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} initialSection="juridico" />
    );

    const toggle = screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' });
    await waitFor(() => expect(screen.getAllByTestId('records-binnacle')).toHaveLength(3));
    // The module is lazy: wait for it before toggling the panel.
    expect(await screen.findByTestId('module-law')).toBeInTheDocument();
    expect(toggle).toBeChecked();

    await user.click(toggle);

    expect(screen.queryByRole('complementary', { name: /bitácoras profesionales/i })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' })).not.toBeChecked();
    // The module stays mounted while the panel is hidden.
    expect(screen.getByTestId('module-law')).toBeInTheDocument();

    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Panel de bitácoras' }));

    expect(screen.getByRole('complementary', { name: /bitácoras profesionales/i })).toBeInTheDocument();
  });

  it('minimiza la ventana rápida del mismo expediente al abrir el workspace', () => {
    window.localStorage.clear();
    __resetDockStoreForTests();
    addToDock('2026-00123', { open: true });

    const { unmount } = render(<FunExpedienteFullscreen expediente={expediente} translation={{}} globals={{}} swaMsg={{}} onClose={vi.fn()} />);
    expect(getDockSnapshot().items[0].open).toBe(false);

    unmount();
    expect(getDockSnapshot().activeWorkspace).toBeNull();
  });

  it('sin informe estructural (regla x;1) oculta el módulo y un enlace directo cae en el primer informe', async () => {
    render(
      <FunExpedienteFullscreen
        expediente={{ ...expediente, rules: '0;1' }}
        translation={{}}
        globals={{}}
        swaMsg={{}}
        onClose={vi.fn()}
        initialSection="informes"
        initialReport="estructural"
      />
    );

    expect(await screen.findByTestId('module-law')).toBeInTheDocument();
    expect(screen.queryByTestId('module-eng')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Informe arquitectónico' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Informe estructural' })).not.toBeInTheDocument();
  });
});
