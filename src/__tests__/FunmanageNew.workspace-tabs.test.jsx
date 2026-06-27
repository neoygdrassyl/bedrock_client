import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const EXP_A = { id: 101, radicado: 'EXP-101', id_public: '68001-101', version: 3, fase_label: 'Estudio' };
const EXP_B = { id: 202, radicado: 'EXP-202', id_public: '68001-202', version: 5, fase_label: 'Viabilidad' };

const { dashboardServiceMock } = vi.hoisted(() => ({
  dashboardServiceMock: {
    getExpedientes: vi.fn(),
  },
}));

vi.mock('../app/services/funmanage_dashboard.service', () => ({
  __esModule: true,
  default: dashboardServiceMock,
}));

vi.mock('../app/pages/user/fun_forms/components/FunDashboardKPIs', () => ({
  FunDashboardKPIs: () => <div data-testid="fun-dashboard-kpis" />,
}));

vi.mock('../app/pages/user/fun_forms/components/FunmanageScatterChart', () => ({
  FunmanageScatterChart: () => <div data-testid="funmanage-scatter-chart" />,
}));

vi.mock('../app/pages/user/fun_forms/components/FunmanagePhaseChart', () => ({
  FunmanagePhaseChart: () => <div data-testid="funmanage-phase-chart" />,
}));

vi.mock('../app/pages/user/fun_forms/components/FunmanageDataTable', () => ({
  FunmanageDataTable: ({ onViewDetail, onOpenWorkspace }) => (
    <div>
      <button type="button" onClick={() => onViewDetail?.(EXP_A)}>
        Abrir preview A
      </button>
      <button type="button" onClick={() => onOpenWorkspace?.(EXP_B)}>
        Abrir workspace B
      </button>
    </div>
  ),
}));

vi.mock('../app/pages/user/fun_forms/components/FunExpedienteDetail', () => ({
  FunExpedienteDetail: ({ expediente }) => (
    <div data-testid="workspace-summary">drawer:{expediente?.radicado}</div>
  ),
}));

vi.mock('../app/pages/user/fun_forms/components/FunExpedienteWorkspace', () => ({
  FunExpedienteWorkspace: ({ expediente }) => (
    <div data-testid="workspace-state">{expediente?.radicado}:workspace</div>
  ),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children, value }) => <div data-value={value}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, asChild, ...props }) => {
    if (asChild && React.isValidElement(children)) return React.cloneElement(children, props);
    return <button type="button" {...props}>{children}</button>;
  },
}));

vi.mock('@/components/icon', () => ({
  Icon: () => <span aria-hidden="true" />,
}));

import FunManageNewPage from '../app/pages/user/funmanage_new.page';

describe('FunManageNewPage workspace behavior', () => {
  beforeEach(() => {
    dashboardServiceMock.getExpedientes.mockReset();
    dashboardServiceMock.getExpedientes.mockResolvedValue({
      data: { kpis: null, data: [], chartData: [], total: 0 },
    });
  });

  test('mantiene la pantalla nueva cerrada en estado de desarrollo', () => {
    render(
      <MemoryRouter>
        <FunManageNewPage translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('gestion-nueva-development-state')).toBeInTheDocument();
    expect(dashboardServiceMock.getExpedientes).not.toHaveBeenCalled();
    expect(screen.queryByText('Abrir preview A')).not.toBeInTheDocument();
    expect(screen.queryByText('Abrir workspace B')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
