import React, { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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
  FunmanageDataTable: ({ loading, error, data }) => (
    <div data-testid="funmanage-table-state">{loading ? 'loading' : error || `rows:${data.length}`}</div>
  ),
}));

vi.mock('../app/pages/user/fun_forms/components/FunExpedienteDetail', () => ({
  FunExpedienteDetail: () => <div data-testid="fun-expediente-detail" />,
}));

vi.mock('../app/pages/user/fun_forms/components/FunExpedienteWorkspace', () => ({
  FunExpedienteWorkspace: () => <div data-testid="fun-expediente-workspace" />,
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

describe('FunManageNewPage request lifecycle', () => {
  beforeEach(() => {
    dashboardServiceMock.getExpedientes.mockReset();
  });

  test('does not start dashboard requests while development state is active', () => {
    render(
      <StrictMode>
        <MemoryRouter>
          <FunManageNewPage translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />
        </MemoryRouter>
      </StrictMode>
    );

    expect(screen.getByTestId('gestion-nueva-development-state')).toBeInTheDocument();
    expect(dashboardServiceMock.getExpedientes).not.toHaveBeenCalled();
    expect(screen.queryByTestId('funmanage-table-state')).not.toBeInTheDocument();
  });
});
