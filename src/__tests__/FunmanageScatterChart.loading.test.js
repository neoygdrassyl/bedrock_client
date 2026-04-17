import React from 'react';
import { render, screen } from '@testing-library/react';

const { dashboardServiceMock } = vi.hoisted(() => ({
  dashboardServiceMock: {
    getChartData: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock('../app/services/funmanage_dashboard.service', () => ({
  __esModule: true,
  default: dashboardServiceMock,
}));

vi.mock('recharts', () => ({
  ScatterChart: ({ children }) => React.createElement('div', null, children),
  Scatter: ({ children }) => React.createElement('div', null, children),
  XAxis: () => React.createElement('div', null),
  YAxis: () => React.createElement('div', null),
  CartesianGrid: () => React.createElement('div', null),
  Tooltip: () => React.createElement('div', null),
  Legend: () => React.createElement('div', null),
  ResponsiveContainer: ({ children }) => React.createElement('div', null, children),
  ReferenceLine: () => React.createElement('div', null),
}));

import { FunmanageScatterChart } from '../app/pages/user/fun_forms/components/FunmanageScatterChart';

describe('FunmanageScatterChart loading state', () => {
  beforeEach(() => {
    dashboardServiceMock.getChartData.mockClear();
  });

  test('shows a visible loading bar while the scatter data is still loading', () => {
    render(
      <FunmanageScatterChart
        dashboardFilter={{ status: null, phase: null }}
        loading={true}
      />
    );

    expect(screen.getByTestId('scatter-chart-loading')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/preparando la dispersión por categoría/i)).toBeInTheDocument();
  });
});
