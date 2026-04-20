import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';

import './helpers/mockExternals';
import { defaultProps, setWindowUser } from './helpers/renderHelpers';

const hoisted = vi.hoisted(() => ({
  mySwalFire: vi.fn(() => Promise.resolve({ isConfirmed: true, value: { 5: { type: 'days', value: 3 } } })),
  mockFunService: {
    create_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_clock: vi.fn(() => Promise.resolve({ data: 'OK' })),
    update_sign: vi.fn(() => Promise.resolve({ data: 'OK' })),
    updateSchedule: vi.fn(() => Promise.resolve({ data: 'OK' })),
  },
}));


vi.mock('sweetalert2', () => ({
  default: {
    fire: hoisted.mySwalFire,
    close: vi.fn(),
    showValidationMessage: vi.fn(),
  },
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: hoisted.mockFunService,
}));

vi.mock('../app/services/fun.service.js', () => ({
  __esModule: true,
  default: hoisted.mockFunService,
}));

vi.mock('../app/pages/user/clocks/components/ClockRow', () => ({
  ClockTableHeader: () => <div data-testid='clock-table-header'>Clock table header</div>,
  ClockRow: ({ value, clock }) => {
    if (value?.title) return null;
    return (
      <div data-testid='clock-row'>
        <span>{value?.name}</span>
        <span data-testid='clock-state'>{String(value?.state)}</span>
        <span data-testid='clock-date'>{clock?.date_start || value?.manualDate || ''}</span>
      </div>
    );
  },
}));

vi.mock('../app/pages/user/clocks/components/SidebarInfo', () => ({
  SidebarInfo: ({ manager }) => (
    <aside data-testid='sidebar-info-mock'>
      <div data-testid='curaduria-status'>{manager?.curaduriaDetails?.status || 'N/A'}</div>
      <ul>
        {(manager?.processPhases || []).map((phase) => (
          <li key={phase.id} data-testid='phase-item'>
            {phase.title}::{phase.status}
          </li>
        ))}
      </ul>
    </aside>
  ),
}));

vi.mock('../app/pages/user/clocks/components/HolidayCalendar', () => ({
  HolidayCalendar: () => <div data-testid='holiday-calendar-mock' />,
}));

vi.mock('../app/pages/user/clocks/components/ControlBar', () => ({
  ControlBar: () => <div data-testid='control-bar-mock' />,
}));

vi.mock('../app/pages/user/clocks/components/ScheduleModal', () => ({
  ScheduleModal: () => <div data-testid='schedule-modal-mock' />,
}));

vi.mock('../app/pages/user/clocks/components/AlarmsWidget', () => ({
  AlarmsWidget: ({ alarms = [] }) => <div data-testid='alarms-widget-mock'>alarmas:{alarms.length}</div>,
}));

vi.mock('../app/pages/user/clocks/components/gantt/GanttModal', () => ({
  GanttModal: () => <div data-testid='gantt-modal-mock' />,
}));

vi.mock('../app/pages/user/clocks/components/ToolsMenu', () => ({
  ToolsMenu: ({ onAction }) => (
    <div data-testid='tools-menu-mock'>
      <button data-testid='tool-action-schedule' onClick={() => onAction('schedule')}>
        Programar Tiempos
      </button>
    </div>
  ),
}));

import EXP_CLOCKS from '../app/pages/user/clocks/centralClocks.component';

const TODAY = dayjs().format('YYYY-MM-DD');

const baseCurrentItem = {
  id: 1,
  type: 'ii',
  date: TODAY,
  fun_6s: [],
  fun_law: { id: 11, sign: '-1,' },
  fun_clocks: [],
};

const makeProps = (overrides = {}) => ({
  ...defaultProps,
  outCodes: [],
  currentVersion: 1,
  requestUpdate: vi.fn(),
  currentItem: {
    ...baseCurrentItem,
    ...overrides,
  },
});

describe('CLOCKS — Integración profunda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setWindowUser({ roleId: 1, id: 1, name: 'Admin Test' });
  });

  afterEach(() => {
    window.user = null;
  });

  it('renderiza timeline sin crash', async () => {
    // Arrange
    const props = makeProps();

    // Act
    render(<EXP_CLOCKS {...props} />);

    // Assert
    expect(await screen.findByTestId('clock-table-header')).toBeInTheDocument();
    const rows = await screen.findAllByTestId('clock-row');
    expect(rows.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Radicación/i).length).toBeGreaterThan(0);
  });

  it('muestra transición de fases según clocks mock', async () => {
    // Arrange
    const startProps = makeProps({
      fun_clocks: [
        { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      ],
    });

    // Act
    const { rerender } = render(<EXP_CLOCKS {...startProps} />);
    await screen.findByTestId('sidebar-info-mock');

    // Assert inicial
    expect(screen.getByText(/Estudio y Observaciones::ACTIVO/i)).toBeInTheDocument();

    // Act: avanzar flujo hacia correcciones
    const progressedProps = makeProps({
      fun_clocks: [
        { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
        { id: 2, state: 30, date_start: '2026-01-30', version: '1', desc: 'ACTA PARTE 1 OBSERVACIONES: NO CUMPLE' },
        { id: 3, state: 32, date_start: '2026-02-05', version: '1' },
        { id: 4, state: 35, date_start: '2026-02-20', version: '1' },
      ],
    });
    rerender(<EXP_CLOCKS {...progressedProps} />);

    // Assert final
    const correctionPhaseLabels = await screen.findAllByText(/Correcciones del Solicitante/i);
    expect(correctionPhaseLabels.length).toBeGreaterThan(0);
  });

  it('maneja error de service sin crash y muestra feedback', async () => {
    // Arrange
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    hoisted.mockFunService.update_sign.mockRejectedValueOnce(new Error('sync sign down'));

    const props = makeProps({
      fun_law: { id: 11, sign: '-1,' },
      fun_clocks: [
        { id: 1, state: 5, date_start: TODAY, version: '1' },
        { id: 2, state: 503, date_start: TODAY, version: '1' },
      ],
    });

    // Act
    render(<EXP_CLOCKS {...props} />);

    // Assert
    await waitFor(() => {
      expect(hoisted.mockFunService.update_sign).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(screen.getByTestId('clock-table-header')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it.each([
    ['ACTIVO', [
      { id: 1, state: 5, date_start: TODAY, version: '1' },
    ]],
    ['PAUSADO', [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: 300, date_start: '2026-01-25', version: '1' },
    ]],
    ['VENCIDO', [
      { id: 1, state: 5, date_start: '2025-01-10', version: '1' },
    ]],
    ['DESISTIDO', [
      { id: 1, state: 5, date_start: '2026-01-20', version: '1' },
      { id: 2, state: -50, date_start: '2026-01-25', version: '-5' },
    ]],
  ])('valida estado crítico %s', async (expectedStatus, clocks) => {
    // Arrange
    const props = makeProps({ fun_clocks: clocks });

    // Act
    render(<EXP_CLOCKS {...props} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId('curaduria-status')).toHaveTextContent(expectedStatus);
    });
  });
});
