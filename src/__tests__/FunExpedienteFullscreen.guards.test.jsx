import React, { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { getSummaryByIdPublicMock, getLegalGuideByPhaseMock } = vi.hoisted(() => ({
  getSummaryByIdPublicMock: vi.fn(),
  getLegalGuideByPhaseMock: vi.fn(),
}));

vi.mock('../app/pages/user/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    error: null,
    setScope: vi.fn(),
  }),
}));

vi.mock('../app/pages/user/fun_forms/hooks/useAlarms', () => ({
  useAlarms: () => ({ alarms: [] }),
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: vi.fn(),
    get: vi.fn(),
    getSummaryByIdPublic: getSummaryByIdPublicMock,
  },
}));

vi.mock('../app/services/legalGuide.service', () => ({
  __esModule: true,
  default: {
    getByPhase: getLegalGuideByPhaseMock,
  },
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }) => <>{children}</>,
  DropdownMenuContent: ({ children }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuCheckboxItem: ({ checked, onCheckedChange, children, ...props }) => (
    <button type="button" aria-pressed={checked} onClick={() => onCheckedChange?.(!checked)} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, props);
    }
    return <button type="button" {...props}>{children}</button>;
  },
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../app/pages/user/fun_forms/fun_g', () => ({ __esModule: true, default: () => <div data-testid="module-detalles" /> }));
vi.mock('../app/pages/user/fun_forms/fun_c', () => ({ __esModule: true, default: () => <div data-testid="module-chequeo" /> }));
vi.mock('../app/pages/user/fun_forms/fun_n', () => ({ __esModule: true, default: () => <div data-testid="module-actualizar" /> }));
vi.mock('../app/pages/user/fun_forms/components/fun_docs', () => ({ __esModule: true, default: () => <div data-testid="module-documentos" /> }));
vi.mock('../app/pages/user/fun_forms/fun_alertn', () => ({ __esModule: true, default: () => <div data-testid="module-publicidad" /> }));
vi.mock('../app/pages/user/fun_forms/fun_clock', () => ({ __esModule: true, default: () => <div data-testid="module-tiempos" /> }));
vi.mock('../app/pages/user/records/record_arc', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-arc" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna arquitectura</div> : null}
    </div>
  ),
}));
vi.mock('../app/pages/user/records/record_law', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-law" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna jurídica</div> : null}
    </div>
  ),
}));
vi.mock('../app/pages/user/records/record_eng', () => ({
  __esModule: true,
  default: ({ hideInlineBinnacles }) => (
    <div data-testid="module-eng" data-hide-inline-binnacles={hideInlineBinnacles ? 'true' : 'false'}>
      {!hideInlineBinnacles ? <div data-testid="records-binnacle-inline">Bitácora interna estructural</div> : null}
    </div>
  ),
}));
vi.mock('../app/pages/user/records/record_review', () => ({ __esModule: true, default: () => <div data-testid="module-review" /> }));
vi.mock('../app/pages/user/records/record_ph', () => ({ __esModule: true, default: () => <div data-testid="module-ph" /> }));
vi.mock('../app/pages/user/expeditions/expedition.page', () => ({ __esModule: true, default: () => <div data-testid="module-expedition" /> }));
vi.mock('../app/pages/user/records/records_binnacles.component', () => ({
  __esModule: true,
  default: ({ AIM, compact }) => (
    <div data-testid="records-binnacle" data-aim={AIM} data-compact={compact ? 'true' : 'false'}>
      Bitácora - {AIM}
    </div>
  ),
}));

import { FunExpedienteFullscreen } from '../app/pages/user/fun_forms/components/FunExpedienteFullscreen';

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

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /detalle del expediente/i })).toBeInTheDocument();
    });

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
    const toolbar = panel.firstElementChild;
    const toggle = screen.getByRole('button', { name: /ocultar panel de bitácoras/i });
    expect(panel).toHaveClass('w-[26rem]', 'max-w-[38vw]');
    expect(toolbar).toHaveClass('h-14');
    expect(toolbar).toContainElement(toggle);
    expect(toggle).toHaveClass('static');
    expect(toggle).not.toHaveClass('absolute', '-left-4', 'left-2', 'top-3');

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
    expect(screen.getByRole('button', { name: /mostrar panel de bitácoras/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ocultar panel de bitácoras/i })).not.toBeInTheDocument();
    expect(screen.getByTestId('icon-ChevronLeft')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-ChevronRight')).not.toBeInTheDocument();
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

    expect(screen.getByRole('button', { name: /ocultar panel de bitácoras/i })).toBeInTheDocument();
    expect(screen.getByTestId('icon-ChevronRight')).toBeInTheDocument();
    expect(screen.queryByTestId('icon-ChevronLeft')).not.toBeInTheDocument();
  });
});
