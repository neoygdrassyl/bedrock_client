import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

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
  Button: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
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

  test('opens preview in detail drawer and workspace as separate fullscreen flow', async () => {
    render(<FunManageNewPage translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    await waitFor(() => expect(dashboardServiceMock.getExpedientes).toHaveBeenCalled());

    fireEvent.click(screen.getByText('Abrir preview A'));
    expect(screen.getByTestId('workspace-summary')).toHaveTextContent('drawer:EXP-101');
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Abrir workspace B'));

    expect(screen.getByTestId('workspace-state')).toHaveTextContent('EXP-202:workspace');
    expect(screen.queryByTestId('workspace-summary')).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });
});
