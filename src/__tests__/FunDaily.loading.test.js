import React from 'react';
import { render, screen } from '@testing-library/react';

const { funServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    loadMacroRange: vi.fn(() => new Promise(() => {})),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('../app/components/jsons/vars', () => ({
  nomens: 'CUB1',
}));

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  },
}));

vi.mock('sweetalert2-react-content', () => ({
  default: () => ({
    fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  }),
}));

vi.mock('../app/components/ui', () => ({
  MDBBtn: ({ children, onClick, ...props }) => React.createElement('button', { onClick, ...props }, children),
}));

vi.mock('../app/components/ChartErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('../app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'macro-gantt-chart-stub' }),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser_dateDiff: vi.fn(() => 0),
  dateParser_finalDate: vi.fn(() => '2024-01-01'),
  dateParser_timeLeft: vi.fn(() => 10),
  dateParser_timePassed: vi.fn(() => 5),
  regexChecker_isOA_2: vi.fn(() => false),
  regexChecker_isOA_3: vi.fn(() => false),
  regexChecker_isPh: vi.fn(() => false),
  VR_DOCUMENTS_OF_INTEREST: [],
  _SET_PRIORITY: vi.fn(() => []),
  formsParser1: vi.fn(() => 'I'),
}));

import FUN_DAILY_COMPONENT from '../app/pages/user/fun_forms/components/fun_daily.component';

describe('FUN_DAILY_COMPONENT loading state', () => {
  beforeEach(() => {
    funServiceMock.loadMacroRange.mockClear();
  });

  test('shows a visible loading bar while the legacy chart data is loading', () => {
    render(
      <FUN_DAILY_COMPONENT
        translation={{}}
        swaMsg={{ text_btn: 'OK' }}
        globals={{}}
      />
    );

    expect(screen.getByTestId('legacy-chart-loading')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/cargando gráfico legacy/i, { selector: 'div' })).toBeInTheDocument();
  });
});
