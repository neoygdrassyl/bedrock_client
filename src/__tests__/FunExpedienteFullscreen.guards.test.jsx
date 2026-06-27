import React, { StrictMode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

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
vi.mock('../app/pages/user/records/record_arc', () => ({ __esModule: true, default: () => <div data-testid="module-arc" /> }));
vi.mock('../app/pages/user/records/record_law', () => ({ __esModule: true, default: () => <div data-testid="module-law" /> }));
vi.mock('../app/pages/user/records/record_eng', () => ({ __esModule: true, default: () => <div data-testid="module-eng" /> }));
vi.mock('../app/pages/user/records/record_review', () => ({ __esModule: true, default: () => <div data-testid="module-review" /> }));
vi.mock('../app/pages/user/records/record_ph', () => ({ __esModule: true, default: () => <div data-testid="module-ph" /> }));
vi.mock('../app/pages/user/expeditions/expedition.page', () => ({ __esModule: true, default: () => <div data-testid="module-expedition" /> }));

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
});
