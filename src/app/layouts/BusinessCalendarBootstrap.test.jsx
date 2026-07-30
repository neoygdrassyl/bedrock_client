import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import BusinessCalendarBootstrap from './BusinessCalendarBootstrap';

const getBootstrapMock = vi.fn();
const replaceMock = vi.fn();
const replaceCustomMock = vi.fn();
const captureHttpErrorMock = vi.fn();

vi.mock('@/app/services/business-calendar.service', () => ({
  default: {
    getBootstrap: (...args) => getBootstrapMock(...args),
  },
}));

vi.mock('@/app/utils/BusinessDaysCol', () => ({
  replaceBusinessCalendarHolidays: (...args) => replaceMock(...args),
  replaceBusinessCalendarCustomDays: (...args) => replaceCustomMock(...args),
}));

vi.mock('@/app/utils/errorReporting', () => ({
  captureDovelaHttpError: (...args) => captureHttpErrorMock(...args),
}));

beforeEach(() => {
  getBootstrapMock.mockReset();
  replaceMock.mockReset();
  replaceCustomMock.mockReset();
  captureHttpErrorMock.mockReset();
});

it('hydrates every supported fallback year through the canonical API', async () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, index) => 2021 + index);
  getBootstrapMock.mockResolvedValue({ data: {
    years: years.map(year => ({ year, holidays: [{ date: `${year}-01-01` }] })),
    customDays: years.map(year => ({ date: `${year}-09-04`, reason: 'Cierre' })),
  } });

  render(<BusinessCalendarBootstrap><div>Private content</div></BusinessCalendarBootstrap>);

  expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
  expect(screen.getByText('Private content')).toBeInTheDocument();
  expect(getBootstrapMock).toHaveBeenCalledWith(2021, currentYear + 1);
  expect(replaceMock).toHaveBeenCalledWith(years.map(year => `${year}-01-01`), years);
  expect(replaceCustomMock).toHaveBeenCalledWith(
    years.map(year => ({ date: `${year}-09-04`, reason: 'Cierre' })),
    years,
  );
});

it.each([
  ['a timeout', { code: 'ECONNABORTED' }],
  ['a server error', { response: { status: 503 } }],
])('keeps private content available with visible degradation after %s', async (_label, error) => {
  getBootstrapMock.mockRejectedValue(error);

  render(<BusinessCalendarBootstrap><div>Private content</div></BusinessCalendarBootstrap>);

  expect(await screen.findByRole('alert')).toHaveTextContent('El calendario laboral no pudo actualizarse.');
  expect(screen.getByText('Private content')).toBeInTheDocument();
  expect(captureHttpErrorMock).toHaveBeenCalledOnce();
  expect(captureHttpErrorMock).toHaveBeenCalledWith(error);
  expect(replaceMock).not.toHaveBeenCalled();
  expect(replaceCustomMock).not.toHaveBeenCalled();
});
