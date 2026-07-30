import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import BusinessCalendarPage from './BusinessCalendarPage';

const getYearMock = vi.fn();
const getCustomYearMock = vi.fn();
const createCustomDayMock = vi.fn();
const deleteCustomDayMock = vi.fn();
const addCustomMock = vi.fn();
const removeCustomMock = vi.fn();
const replaceHolidaysMock = vi.fn();
const replaceCustomMock = vi.fn();

vi.mock('@/app/services/business-calendar.service', () => ({
  default: {
    getYear: (...args) => getYearMock(...args),
    getCustomYear: (...args) => getCustomYearMock(...args),
    createCustomDay: (...args) => createCustomDayMock(...args),
    deleteCustomDay: (...args) => deleteCustomDayMock(...args),
  },
}));

vi.mock('@/app/utils/BusinessDaysCol', () => ({
  addBusinessCalendarCustomDay: (...args) => addCustomMock(...args),
  removeBusinessCalendarCustomDay: (...args) => removeCustomMock(...args),
  replaceBusinessCalendarHolidays: (...args) => replaceHolidaysMock(...args),
  replaceBusinessCalendarCustomDays: (...args) => replaceCustomMock(...args),
}));

describe('BusinessCalendarPage', () => {
  const currentYear = new Date().getFullYear();
  const customDate = firstWeekday(currentYear, 8);

  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { roleId: 3, role_short: 'Admin.', role: 'Administrador' };
    getYearMock.mockImplementation(year => Promise.resolve({
      data: {
        year,
        holidays: [{ date: `${year}-07-13`, name: 'Festivo extraordinario' }],
        sync: { status: 'success', executedAt: '2026-07-28T10:00:00Z' },
      },
    }));
    getCustomYearMock.mockResolvedValue({ data: { year: currentYear, customDays: [] } });
    createCustomDayMock.mockResolvedValue({
      data: { date: customDate, reason: 'Cierre institucional', createdByUserName: 'Ana Pérez' },
    });
    deleteCustomDayMock.mockResolvedValue({ data: null });
  }, 15000);

  it('renders the custom legend and keeps official and weekend days non-interactive', async () => {
    render(<BusinessCalendarPage />);

    expect(await screen.findByRole('heading', { name: 'Calendario laboral' })).toBeVisible();
    expect(screen.getByText('Día no hábil personalizado')).toBeVisible();
    expect(screen.getByLabelText(/Festivo extraordinario/i).tagName).not.toBe('BUTTON');
    expect(screen.getAllByLabelText(/sábado o domingo/i)[0].tagName).not.toBe('BUTTON');
    expect(replaceHolidaysMock).toHaveBeenCalledWith([`${currentYear}-07-13`], [currentYear]);
    expect(replaceCustomMock).toHaveBeenCalledWith([], [currentYear]);
  });

  it('keeps business days read-only for non-administrators', async () => {
    const previousUser = window.user;
    window.user = { roleId: 2 };
    try {
      render(<BusinessCalendarPage />);

      expect(await screen.findByRole('heading', { name: 'Calendario laboral' })).toBeVisible();
      expect(screen.queryByRole('button', { name: /día hábil/i })).not.toBeInTheDocument();
    } finally {
      window.user = previousUser;
    }
  });

  it('requires a reason and registers a normal business day', async () => {
    const user = userEvent.setup();
    render(<BusinessCalendarPage />);
    const [businessDay] = await screen.findAllByRole('button', { name: /día hábil/i });

    await user.click(businessDay);
    await user.click(screen.getByRole('button', { name: 'Marcar como día no hábil' }));
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
    await user.type(screen.getByLabelText('Motivo'), 'Cierre institucional');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(createCustomDayMock).toHaveBeenCalledWith(expect.objectContaining({ reason: 'Cierre institucional' })));
    expect(addCustomMock).toHaveBeenCalled();
    expect(getCustomYearMock).toHaveBeenCalledTimes(1);
  }, 15000);

  it('reverts a custom non-business day directly', async () => {
    const user = userEvent.setup();
    getCustomYearMock.mockResolvedValue({
      data: { year: currentYear, customDays: [{ date: customDate, reason: 'Cierre institucional' }] },
    });
    render(<BusinessCalendarPage />);

    await user.click(await screen.findByRole('button', { name: /día no hábil personalizado: Cierre institucional/i }));
    await user.click(screen.getByRole('button', { name: 'Marcar como día hábil' }));

    await waitFor(() => expect(deleteCustomDayMock).toHaveBeenCalledWith(customDate));
    expect(removeCustomMock).toHaveBeenCalledWith(customDate);
    expect(getCustomYearMock).toHaveBeenCalledTimes(1);
  }, 15000);

  it('loads another year from the year navigation', async () => {
    const user = userEvent.setup();
    render(<BusinessCalendarPage />);
    await screen.findByRole('heading', { name: 'Calendario laboral' });

    await user.click(screen.getByRole('button', { name: 'Año siguiente' }));

    expect(getYearMock).toHaveBeenLastCalledWith(currentYear + 1);
    expect(getCustomYearMock).toHaveBeenLastCalledWith(currentYear + 1);
  }, 15000);
});

function firstWeekday(year, month) {
  const date = new Date(Date.UTC(year, month, 1));
  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
