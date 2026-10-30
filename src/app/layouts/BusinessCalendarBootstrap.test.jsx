import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import BusinessCalendarBootstrap from './BusinessCalendarBootstrap';

const getBootstrapMock = vi.fn();
const replaceMock = vi.fn();
const replaceCustomMock = vi.fn();
const logHttpErrorMock = vi.fn();

vi.mock('@/features/business-calendar/api/business-calendar.service', () => ({
  default: {
    getBootstrap: (...args) => getBootstrapMock(...args),
  },
}));

vi.mock('@/shared/utils/BusinessDaysCol', () => ({
  replaceBusinessCalendarHolidays: (...args) => replaceMock(...args),
  replaceBusinessCalendarCustomDays: (...args) => replaceCustomMock(...args),
}));

vi.mock('@/shared/observability/logger', () => ({
  logHttpError: (...args) => logHttpErrorMock(...args),
  getRequestIdFromError: (error) => error?.response?.data?.requestId ?? null,
}));

vi.mock('@/shared/config/jsons/vars', () => ({ infoCud: { name: 'Curaduría Test' } }));

beforeEach(() => {
  getBootstrapMock.mockReset();
  replaceMock.mockReset();
  replaceCustomMock.mockReset();
  logHttpErrorMock.mockReset();
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
  ['a timeout', { isAxiosError: true, code: 'ECONNABORTED', request: {} }],
  // A real Dovela 5xx (it carries the backend request id): the rest of the app keeps working.
  ['a server error', { isAxiosError: true, response: { status: 500, headers: { 'x-dovela-request-id': 'req_srv_12345678' } } }],
])('keeps private content available with visible degradation after %s', async (_label, error) => {
  getBootstrapMock.mockRejectedValue(error);

  render(<BusinessCalendarBootstrap><div>Private content</div></BusinessCalendarBootstrap>);

  expect(await screen.findByRole('alert')).toHaveTextContent('El calendario laboral no pudo actualizarse.');
  expect(screen.getByText('Private content')).toBeInTheDocument();
  expect(logHttpErrorMock).toHaveBeenCalledOnce();
  expect(logHttpErrorMock).toHaveBeenCalledWith(error);
  expect(replaceMock).not.toHaveBeenCalled();
  expect(replaceCustomMock).not.toHaveBeenCalled();
});

it.each([
  ['a network failure', { isAxiosError: true, code: 'ERR_NETWORK', request: {} }, null],
  ['a 503 from the proxy', { isAxiosError: true, response: { status: 503, data: { requestId: 'req_abc123_k3j4h5g6' } } }, 'req_abc123_k3j4h5g6'],
  ['an empty 500 from a gateway (backend down behind the dev proxy)', { isAxiosError: true, response: { status: 500, headers: {} } }, null],
])('shows the unavailable screen after %s and retries the bootstrap', async (_label, error, reference) => {
  getBootstrapMock.mockRejectedValueOnce(error).mockResolvedValueOnce({ data: { years: [], customDays: [] } });

  render(<BusinessCalendarBootstrap><div>Private content</div></BusinessCalendarBootstrap>);

  expect(await screen.findByRole('heading', { level: 1, name: 'No pudimos conectar con el servidor' })).toBeInTheDocument();
  expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  expect(logHttpErrorMock).toHaveBeenCalledWith(error);
  if (reference) expect(screen.getByTestId('error-reference')).toHaveTextContent(reference);
  else expect(screen.queryByTestId('error-reference')).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

  expect(await screen.findByText('Private content')).toBeInTheDocument();
  expect(getBootstrapMock).toHaveBeenCalledTimes(2);
});
