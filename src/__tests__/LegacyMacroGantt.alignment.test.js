import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

const { renderedScatterProps, renderedReferenceAreas } = vi.hoisted(() => ({
  renderedScatterProps: [],
  renderedReferenceAreas: [],
}));

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, outline: _outline, ...props }) => React.createElement('button', { onClick, ...props }, children),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser_dateDiff: vi.fn((dateA, dateB, absolute = false) => {
    if (!dateA || !dateB) return '';
    if (dateA === dateB) return 0;
    if (dateA > dateB) return absolute ? 16 : -16;
    return 16;
  }),
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
  ReferenceArea: props => {
    renderedReferenceAreas.push(props);
    return React.createElement('div', null);
  },
  Legend: () => React.createElement('div', null),
  ZAxis: () => React.createElement('div', null),
}));

import FUN_CHART_MACRO_GRANTT from '../app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component';

describe('FUN_CHART_MACRO_GRANTT alignment', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-23T12:00:00Z'));
    renderedScatterProps.length = 0;
    renderedReferenceAreas.length = 0;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('ubica la serie de radicacion con dias transcurridos positivos hacia la derecha', () => {
    render(
      <FUN_CHART_MACRO_GRANTT
        translation={{}}
        swaMsg={{}}
        globals={{}}
        items={[
          { id_public: '26-0001', clock_payment: '2026-04-01', type: 'iii', state: 1, tramite: 'A' },
        ]}
        margin={{ bottom: 45, left: 400 }}
      />
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('legacy-macro-gantt-chart')).toBeInTheDocument();

    const radSeries = renderedScatterProps.find(props => props.name === 'rad');
    expect(radSeries).toBeDefined();
    expect(radSeries.data).toHaveLength(1);
    expect(radSeries.data[0].x).toBe(16);
  });

  test('mantiene en fase la franja blank2 con el inicio de pagos en el modo optimo', () => {
    render(
      <FUN_CHART_MACRO_GRANTT
        translation={{}}
        swaMsg={{}}
        globals={{}}
        items={[]}
        margin={{ bottom: 45, left: 400 }}
      />
    );

    act(() => {
      vi.runAllTimers();
    });

    renderedReferenceAreas.length = 0;

    fireEvent.click(screen.getByRole('button', { name: 'OPTIMO' }));

    const [radArea, eva1Area, blank1Area, eva2Area, via1Area, via2Area, blank2Area, payArea] = renderedReferenceAreas.slice(0, 8);

    expect(radArea).toBeDefined();
    expect(via2Area).toBeDefined();
    expect(blank2Area).toBeDefined();
    expect(payArea).toBeDefined();
    expect(blank2Area.x1).toBe(via2Area.x2);
    expect(blank2Area.x2).toBe(payArea.x1);
  });
});