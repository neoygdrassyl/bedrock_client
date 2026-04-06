import React from 'react';
import { act, render, screen } from '@testing-library/react';

const { renderedScatterProps } = vi.hoisted(() => ({
  renderedScatterProps: [],
}));

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, ...props }) => React.createElement('button', { onClick, ...props }, children),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser_dateDiff: vi.fn(() => 15),
  dateParser_finalDate: vi.fn(() => '2026-03-01'),
  dateParser_timeLeft: vi.fn(() => 10),
  dateParser_timePassed: vi.fn(() => 5),
  regexChecker_isOA_2: vi.fn(() => false),
}));

vi.mock('recharts', () => ({
  ScatterChart: ({ children }) => React.createElement('div', { 'data-testid': 'legacy-macro-gantt-chart' }, children),
  Scatter: props => {
    renderedScatterProps.push(props);
    return React.createElement('div', { 'data-testid': `scatter-${props.name}` });
  },
  XAxis: () => React.createElement('div', null),
  YAxis: () => React.createElement('div', null),
  CartesianGrid: () => React.createElement('div', null),
  Tooltip: () => React.createElement('div', null),
  ResponsiveContainer: ({ children }) => React.createElement('div', null, children),
  ReferenceArea: () => React.createElement('div', null),
  Legend: () => React.createElement('div', null),
  ZAxis: () => React.createElement('div', null),
}));

import FUN_CHART_MACRO_GRANTT from '../app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component';

describe('FUN_CHART_MACRO_GRANTT loading behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    renderedScatterProps.length = 0;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('shows a loading bar first and disables scatter animations so NO RADICO VALLA does not lag behind', () => {
    render(
      <FUN_CHART_MACRO_GRANTT
        translation={{}}
        swaMsg={{}}
        globals={{}}
        items={[
          { id_public: '26-0001', clock_payment: '2026-03-01', type: 'iii', state: 1 },
          { id_public: '26-0002', clock_payment: '2026-03-01', type: 'iii', state: -102 },
        ]}
        margin={{ bottom: 45, left: 400 }}
      />
    );

    expect(screen.getByTestId('legacy-macro-gantt-loading')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/preparando la dispersión temporal/i)).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('legacy-macro-gantt-chart')).toBeInTheDocument();

    const noRadicoVallaSeries = renderedScatterProps.find(props => props.name === 'des2');
    expect(noRadicoVallaSeries).toBeDefined();
    expect(noRadicoVallaSeries.isAnimationActive).toBe(false);
    expect(noRadicoVallaSeries.animationDuration).toBe(0);
  });
});
