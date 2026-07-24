import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EXP_CLOCKS from './centralClocks.component';

const clockTestState = vi.hoisted(() => ({
  clocksToShow: [],
  createClock: vi.fn(() => Promise.resolve({ data: 'OK' })),
  updateClock: vi.fn(() => Promise.resolve({ data: 'OK' })),
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

vi.mock('./components/ClockRow', () => ({
  DEFAULT_CLOCK_COLUMN_VISIBILITY: {},
  getClockTableWidth: vi.fn(() => 320),
  ClockTableHeader: () => <div data-testid="clock-table-header" />,
  ClockRow: ({ value, clock, onSave }) => (
    <div data-testid="clock-row">
      <span data-testid="clock-row-date">{clock?.date_start || 'Pendiente'}</span>
      <button type="button" onClick={() => onSave(value, 0, '2026-07-31')}>Guardar fecha de vecino</button>
    </div>
  ),
}));

vi.mock('./components/SidebarInfo', () => ({
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

vi.mock('./components/gantt/GanttModal', () => ({
  GanttModal: ({ phases }) => <div data-testid="gantt-modal">{phases[0]?.endDate}</div>,
}));

vi.mock('../shared/processClosure.helpers', () => ({
  getLicenseCompletionClock: vi.fn(() => ({ dateStart: '', label: '' })),
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span aria-hidden="true">{name}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ onCheckedChange, ...props }) => <input type="checkbox" onChange={(event) => onCheckedChange?.(event.target.checked)} {...props} />,
}));

vi.mock('../../../services/fun.service', () => ({
  default: {
    create_clock: clockTestState.createClock,
    update_clock: clockTestState.updateClock,
    update: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_sign: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));

vi.mock('../../../utils/swalAdapter', () => ({
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
  swalError: vi.fn(),
  swalConfirm: vi.fn(),
  swalClose: vi.fn(),
  swalFormDialog: vi.fn(),
  Swal: {},
}));

vi.mock('../../../utils/iconSvgString', () => ({
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
  it('starts with alarms closed and opens them from the floating button', () => {
    render(<EXP_CLOCKS {...baseProps} />);

    expect(screen.queryByTestId('alarms-widget')).not.toBeInTheDocument();

    const showButton = screen.getByTitle('Mostrar Alertas');
    expect(showButton).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(showButton);

    expect(screen.getByTestId('alarms-widget')).toHaveTextContent('Alertas (1)');
  });

  it('updates the row, phase detail and Gantt immediately after saving', async () => {
    clockTestState.clocksToShow = [{ state: 504, name: 'Comunicación a vecinos' }];
    const requestUpdate = vi.fn(() => new Promise(() => {}));

    render(<EXP_CLOCKS {...baseProps} requestUpdate={requestUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Guardar fecha de vecino' }));

    await waitFor(() => {
      expect(screen.getByTestId('clock-row-date')).toHaveTextContent('2026-07-31');
    });
    expect(screen.getByTestId('sidebar-info')).toHaveTextContent('2026-07-31');
    expect(screen.getByTestId('gantt-modal')).toHaveTextContent('2026-07-31');
    expect(requestUpdate).toHaveBeenCalledWith(1);
  });
});
