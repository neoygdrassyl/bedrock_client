import React, { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

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
  Button: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
}));

vi.mock('@/components/icon', () => ({
  Icon: () => <span aria-hidden="true" />,
}));

import FunManageNewPage from '../app/pages/user/funmanage_new.page';

describe('FunManageNewPage request lifecycle', () => {
  beforeEach(() => {
    dashboardServiceMock.getExpedientes.mockReset();
  });

  test('ignores stale dashboard failures after a newer load already succeeded', async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();

    dashboardServiceMock.getExpedientes
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise)
      .mockResolvedValue({ data: { kpis: null, data: [], chartData: [], total: 0 } });

    render(
      <StrictMode>
        <FunManageNewPage translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />
      </StrictMode>
    );

    await waitFor(() => expect(dashboardServiceMock.getExpedientes).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondRequest.resolve({
        data: {
          kpis: { total: 1 },
          data: [{ id: 101, radicado: 'CUB-101' }],
          chartData: [],
          total: 1,
        },
      });
      await secondRequest.promise;
    });

    expect(await screen.findByText('rows:1')).toBeInTheDocument();

    await act(async () => {
      firstRequest.reject(new Error('stale dashboard failure'));
      try {
        await firstRequest.promise;
      } catch {
        // expected rejection for the stale request
      }
    });

    expect(screen.queryByText('No se pudo cargar el dashboard.')).not.toBeInTheDocument();
    expect(screen.getByText('rows:1')).toBeInTheDocument();
  });
});
