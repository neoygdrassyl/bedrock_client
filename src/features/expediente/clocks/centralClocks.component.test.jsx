import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EXP_CLOCKS from './centralClocks.component';

const clockTestState = vi.hoisted(() => ({
  clocksToShow: [],
  createClock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  updateClock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  getFun: vi.fn(() => Promise.resolve({ data: { id: 1, fun_clocks: [{ id: 77, state: 504, date_start: '2026-07-31' }] } })),
}));

const mockNotificationAlarms = vi.hoisted(() => [
  {
    id: 'alarm-1',
    eventName: 'Notificación por aviso',
    suggestion: 'Revisar fecha pendiente.',
    severity: 'critical',
    type: 'legal',
    typeLabel: 'Legal',
    remainingDays: -7,
  },
]);

vi.mock('./hooks/useClocksManager', () => ({
  calcularDiasHabiles: vi.fn(() => 0),
  sumarDiasHabiles: vi.fn(() => 0),
  useScheduleConfig: vi.fn(() => ({
    scheduleConfig: {},
    saveScheduleConfig: vi.fn(),
    clearScheduleConfig: vi.fn(),
    hasSchedule: false,
  })),
  useClocksManager: vi.fn((_currentItem, clocksData) => {
    const getClock = (state) => clocksData.find(clock => String(clock.state) === String(state)) || null;
    const communicationDate = getClock(504)?.date_start || 'Pendiente';

    return {
      canAddSuspension: false,
      canAddExtension: false,
      isDesisted: false,
      processPhases: [{ id: 'phase-neighbors', endDate: communicationDate }],
      curaduriaDetails: {},
      suspensionPreActa: {},
      suspensionPostActa: {},
      extension: {},
      getClock,
      getClockVersion: vi.fn(() => null),
      availableSuspensionTypes: [],
      totalSuspensionDays: 0,
    };
  }),
}));

vi.mock('./config/clocks.definitions', () => ({
  generateClocks: vi.fn(() => clockTestState.clocksToShow),
}));

vi.mock('./hooks/useAlarms', () => ({
  useAlarms: vi.fn(() => ({
    notificationAlarms: mockNotificationAlarms,
    processAlarms: [],
    allAlarms: mockNotificationAlarms,
  })),
}));

vi.mock('./components/AlarmsWidget', () => ({
  AlarmsWidget: ({ alarms }) => <div data-testid="alarms-widget">Alertas ({alarms.length})</div>,
}));

// Only the row and the header are replaced: the column helpers (grid template, widths,
// column count) stay real so the table is laid out by the same code as in the app.
vi.mock('./components/ClockRow', async (importOriginal) => ({
  ...(await importOriginal()),
  ClockTableHeader: () => <div data-testid="clock-table-header" />,
  ClockRow: ({ value, clock, onSave }) => (
    <div data-testid="clock-row">
      <span data-testid="clock-row-date">{clock?.date_start || 'Pendiente'}</span>
      <button type="button" onClick={() => onSave(value, 0, '2026-07-31')}>Guardar fecha de vecino</button>
      <button type="button" onClick={() => onSave(value, 0, '2026-08-03')}>Guardar otra fecha</button>
      <button type="button" onClick={() => onSave(value, 0, '')}>Borrar fecha</button>
    </div>
  ),
}));

// The term strip reads its figures through the helpers of this module: keep them real.
vi.mock('./components/SidebarInfo', async (importOriginal) => ({
  ...(await importOriginal()),
  SidebarInfo: ({ manager }) => <aside data-testid="sidebar-info">{manager.processPhases[0]?.endDate}</aside>,
}));

vi.mock('./components/HolidayCalendar', () => ({
  HolidayCalendar: () => <div data-testid="holiday-calendar" />,
}));

vi.mock('./components/ControlBar', () => ({
  ControlBar: () => <div data-testid="control-bar" />,
}));

vi.mock('./components/ScheduleModal', () => ({
  ScheduleModal: () => <div data-testid="schedule-modal" />,
}));

vi.mock('./components/ToolsMenu', () => ({
  ToolsMenu: () => <div data-testid="tools-menu" />,
}));

// The Gantt dialog, its legend and the inline chart all receive the one `series` object.
vi.mock('./components/gantt/GanttChart', () => ({
  useGanttSeries: ({ phases }) => ({ phases }),
  GanttChart: ({ series }) => <div data-testid="gantt-chart">{series.phases[0]?.endDate}</div>,
}));

vi.mock('./components/gantt/GanttModal', () => ({
  GanttModal: ({ series }) => <div data-testid="gantt-modal">{series.phases[0]?.endDate}</div>,
  GanttLegend: () => <div data-testid="gantt-legend" />,
}));

vi.mock('../documental/shared/processClosure.helpers', () => ({
  getLicenseCompletionClock: vi.fn(() => ({ dateStart: '', label: '' })),
}));

vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span aria-hidden="true">{name}</span>,
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/shared/ui/checkbox', () => ({
  Checkbox: ({ onCheckedChange, ...props }) => <input type="checkbox" onChange={(event) => onCheckedChange?.(event.target.checked)} {...props} />,
}));

vi.mock('../api/fun.service', () => ({
  default: {
    create_clock: clockTestState.createClock,
    update_clock: clockTestState.updateClock,
    get: clockTestState.getFun,
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_sign: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../shared/utils/swalAdapter', () => ({
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
  swalError: vi.fn(),
  swalConfirm: vi.fn(),
  swalClose: vi.fn(),
  swalFormDialog: vi.fn(),
  Swal: {},
}));

vi.mock('../../../shared/utils/iconSvgString', () => ({
  getIconSvg: vi.fn(() => ''),
}));

const baseProps = {
  swaMsg: {
    title_wait: 'Espere',
    text_wait: 'Guardando',
    publish_success_title: 'Guardado',
    publish_success_text: 'OK',
    text_footer: '',
    generic_eror_title: 'Error',
    generic_error_text: 'Error',
  },
  currentItem: {
    id: 1,
    date: '2026-01-01',
    fun_clocks: [],
    fun_law: { id: 7, sign: '' },
  },
  currentVersion: 0,
  outCodes: [],
  requestUpdate: vi.fn(),
};

describe('EXP_CLOCKS alarm widget', () => {
  it('starts with alarms closed and opens them from the alerts toggle of the term strip', () => {
    render(<EXP_CLOCKS {...baseProps} />);

    expect(screen.queryByTestId('alarms-widget')).not.toBeInTheDocument();

    // The toggle announces how many alerts there are and that the panel is closed.
    const toggle = screen.getByRole('button', { name: 'Alertas de tiempos: 1' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    expect(screen.getByTestId('alarms-widget')).toHaveTextContent('Alertas (1)');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(toggle);

    expect(screen.queryByTestId('alarms-widget')).not.toBeInTheDocument();
  });

  it('updates the row, phase detail and Gantt immediately after saving', async () => {
    clockTestState.clocksToShow = [
      { title: 'Publicidad' },
      { state: 504, name: 'Comunicación a vecinos' },
    ];
    const requestUpdate = vi.fn(() => new Promise(() => {}));

    render(<EXP_CLOCKS {...baseProps} requestUpdate={requestUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar fecha de vecino' }));

    await waitFor(() => {
      expect(screen.getByTestId('clock-row-date')).toHaveTextContent('2026-07-31');
    });
    expect(screen.getByTestId('sidebar-info')).toHaveTextContent('2026-07-31');
    expect(screen.getByTestId('gantt-modal')).toHaveTextContent('2026-07-31');
    expect(screen.getByTestId('gantt-chart')).toHaveTextContent('2026-07-31');
    expect(requestUpdate).toHaveBeenCalledWith(1);
  });

  it('sends one request when the same date is saved twice before the first answer', async () => {
    clockTestState.clocksToShow = [
      { title: 'Publicidad' },
      { state: 504, name: 'Comunicación a vecinos' },
    ];
    clockTestState.createClock.mockClear();
    let answer;
    clockTestState.createClock.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));

    render(<EXP_CLOCKS {...baseProps} />);

    const save = screen.getByRole('button', { name: 'Guardar fecha de vecino' });
    fireEvent.click(save);
    fireEvent.click(save);

    expect(clockTestState.createClock).toHaveBeenCalledTimes(1);

    answer({ data: 'OK' });
    await waitFor(() => {
      expect(screen.getByTestId('clock-row-date')).toHaveTextContent('2026-07-31');
    });
    expect(clockTestState.createClock).toHaveBeenCalledTimes(1);
  });

  const deferredCreate = () => {
    let answer;
    clockTestState.createClock.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
    return () => answer({ data: 'OK' });
  };
  const sentDate = (mockFn, call) => mockFn.mock.calls[call].at(-1).get('date_start');

  it('queues a different date behind the pending save and updates the created clock (never creates twice)', async () => {
    clockTestState.clocksToShow = [{ title: 'Publicidad' }, { state: 504, name: 'Comunicación a vecinos' }];
    clockTestState.createClock.mockClear();
    clockTestState.updateClock.mockClear();
    const answer = deferredCreate();

    render(<EXP_CLOCKS {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar fecha de vecino' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar otra fecha' }));
    // Nothing else is sent while the first save is pending.
    expect(clockTestState.createClock).toHaveBeenCalledTimes(1);
    expect(clockTestState.updateClock).not.toHaveBeenCalled();

    answer();
    await waitFor(() => expect(clockTestState.updateClock).toHaveBeenCalledTimes(1));
    expect(clockTestState.createClock).toHaveBeenCalledTimes(1);
    expect(sentDate(clockTestState.createClock, 0)).toBe('2026-07-31');
    // The follow-up targets the clock created by the first save, with the latest date.
    expect(clockTestState.updateClock.mock.calls[0][0]).toBe(77);
    expect(sentDate(clockTestState.updateClock, 0)).toBe('2026-08-03');
    await waitFor(() => expect(screen.getByTestId('clock-row-date')).toHaveTextContent('2026-08-03'));
  });

  it('keeps only the latest queued date and still sends a revert to the stored value', async () => {
    clockTestState.clocksToShow = [{ title: 'Publicidad' }, { state: 504, name: 'Comunicación a vecinos' }];
    clockTestState.createClock.mockClear();
    clockTestState.updateClock.mockClear();
    let answer;
    clockTestState.updateClock.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
    const stored = { id: 5, state: 504, date_start: '2026-07-31' };

    render(<EXP_CLOCKS {...baseProps} currentItem={{ ...baseProps.currentItem, fun_clocks: [stored] }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar otra fecha' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar fecha' }));
    // Back to the stored date while the change is pending: must not be skipped.
    fireEvent.click(screen.getByRole('button', { name: 'Guardar fecha de vecino' }));
    expect(clockTestState.updateClock).toHaveBeenCalledTimes(1);

    answer({ data: 'OK' });
    await waitFor(() => expect(clockTestState.updateClock).toHaveBeenCalledTimes(2));
    expect(sentDate(clockTestState.updateClock, 0)).toBe('2026-08-03');
    expect(sentDate(clockTestState.updateClock, 1)).toBe('2026-07-31');
    expect(clockTestState.updateClock.mock.calls[1][0]).toBe(5);
    expect(clockTestState.createClock).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('clock-row-date')).toHaveTextContent('2026-07-31'));
  });
});
