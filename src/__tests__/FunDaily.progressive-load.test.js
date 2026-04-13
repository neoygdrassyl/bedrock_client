import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { funServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    loadMacroRange: vi.fn(),
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
  MDBPopover: ({ btnChildren, onClick }) => React.createElement('button', { onClick }, btnChildren),
  MDBPopoverBody: ({ children }) => React.createElement('div', null, children),
}));

vi.mock('../app/components/ChartErrorBoundary', () => ({
  __esModule: true,
  default: ({ children }) => React.createElement(React.Fragment, null, children),
}));

vi.mock('../app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'macro-gantt-chart-stub' }, 'legacy scatter'),
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser_dateDiff: vi.fn(() => 15),
  dateParser_finalDate: vi.fn(() => '2026-03-01'),
  dateParser_timeLeft: vi.fn(() => 10),
  dateParser_timePassed: vi.fn(() => 5),
  regexChecker_isOA_2: vi.fn(() => false),
  regexChecker_isOA_3: vi.fn(() => false),
  regexChecker_isPh: vi.fn(() => false),
  VR_DOCUMENTS_OF_INTEREST: [],
  _SET_PRIORITY: vi.fn(value => value),
  formsParser1: vi.fn(() => 'I'),
}));

import FUN_DAILY_COMPONENT from '../app/pages/user/fun_forms/components/fun_daily.component';

describe('FUN_DAILY_COMPONENT progressive load', () => {
  beforeEach(() => {
    funServiceMock.loadMacroRange.mockResolvedValue({
      data: Array.from({ length: 9 }, (_, index) => ({
        id_public: `68001-1-26-000${index + 1}`,
        state: 5,
        type: 'iii',
        rules: '0;0',
        clock_payment: '2026-03-01',
        clock_license: null,
        sign: null,
      })),
    });
  });

  test('defers heavy valla sections until expanded while keeping the legacy scatter mounted', async () => {
    const user = userEvent.setup();

    render(
      <FUN_DAILY_COMPONENT
        translation={{}}
        swaMsg={{ text_btn: 'OK' }}
        globals={{}}
      />
    );

    const lydfHeading = await screen.findByText(/Sin radicar Valla LyDF \(?9\)?/i);
    const lydfSection = lydfHeading.closest('.col');

    expect(screen.getByTestId('macro-gantt-chart-stub')).toBeInTheDocument();
    expect(within(lydfSection).getByRole('button', { name: /ver 9 solicitudes/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /26-0001/i })).not.toBeInTheDocument();

    await user.click(within(lydfSection).getByRole('button', { name: /ver 9 solicitudes/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /26-0001/i })).toBeInTheDocument();
    });
  });
});
