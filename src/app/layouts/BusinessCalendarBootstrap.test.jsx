import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import BusinessCalendarBootstrap, { BusinessCalendarSyncNotice, RETRY_DELAYS_MS } from './BusinessCalendarBootstrap';

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
}));

const EMPTY_BOOTSTRAP = { data: { years: [], customDays: [] } };
const NOTICE_TEXT = 'No se pudieron sincronizar los días hábiles.';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

// The shell mounts the notice next to the routed content.
function renderBootstrap() {
  return render(
    <BusinessCalendarBootstrap>
      <BusinessCalendarSyncNotice />
      <div>Private content</div>
    </BusinessCalendarBootstrap>,
  );
}

beforeEach(() => {
  getBootstrapMock.mockReset();
  replaceMock.mockReset();
  replaceCustomMock.mockReset();
  logHttpErrorMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

it('hydrates every supported fallback year through the canonical API', async () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2019 }, (_, index) => 2021 + index);
  getBootstrapMock.mockResolvedValue({ data: {
    years: years.map(year => ({ year, holidays: [{ date: `${year}-01-01` }] })),
    customDays: years.map(year => ({ date: `${year}-09-04`, reason: 'Cierre' })),
  } });

  renderBootstrap();

  expect(screen.queryByText('Private content')).not.toBeInTheDocument();
  await waitFor(() => expect(replaceMock).toHaveBeenCalledTimes(1));
  expect(screen.getByText('Private content')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(getBootstrapMock).toHaveBeenCalledWith(2021, currentYear + 1);
  expect(replaceMock).toHaveBeenCalledWith(years.map(year => `${year}-01-01`), years);
  expect(replaceCustomMock).toHaveBeenCalledWith(
    years.map(year => ({ date: `${year}-09-04`, reason: 'Cierre' })),
    years,
  );
});

it('skips years the source marks as unavailable', async () => {
  getBootstrapMock.mockResolvedValue({ data: {
    years: [
      { year: 2024, holidays: [{ date: '2024-01-01' }] },
      { year: 2025, available: false, holidays: [{ date: '2025-01-01' }] },
    ],
    customDays: [],
  } });

  renderBootstrap();

  await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(['2024-01-01'], [2024]));
});

describe('when the sync fails', () => {
  it.each([
    ['a timeout', { isAxiosError: true, code: 'ECONNABORTED', request: {} }],
    ['a network failure', { isAxiosError: true, code: 'ERR_NETWORK', request: {} }],
    ['a server error', { isAxiosError: true, response: { status: 500, headers: { 'x-dovela-request-id': 'req_srv_12345678' } } }],
    ['a 503 from the proxy', { isAxiosError: true, response: { status: 503 } }],
  ])('renders the app with the bundled holidays and a calm notice after %s', async (_label, error) => {
    getBootstrapMock.mockRejectedValue(error);

    renderBootstrap();

    const notice = await screen.findByRole('status');
    expect(notice).toHaveTextContent(NOTICE_TEXT);
    expect(notice).toHaveTextContent('Los cálculos de términos usan los festivos predeterminados.');
    expect(screen.getByText('Private content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveAttribute('aria-busy', 'false');
    expect(logHttpErrorMock).toHaveBeenCalledOnce();
    expect(logHttpErrorMock).toHaveBeenCalledWith(error, { data: { attempt: 1, trigger: 'initial' } });
    expect(replaceMock).not.toHaveBeenCalled();
    expect(replaceCustomMock).not.toHaveBeenCalled();
  });

  it('retries on click, shows progress, and hides the notice once the sync succeeds', async () => {
    const retry = deferred();
    getBootstrapMock.mockRejectedValueOnce(new Error('down')).mockReturnValueOnce(retry.promise);

    renderBootstrap();
    const button = await screen.findByRole('button', { name: 'Reintentar' });

    await userEvent.click(button);

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
    expect(getBootstrapMock).toHaveBeenCalledTimes(2);

    await act(async () => retry.resolve(EMPTY_BOOTSTRAP));

    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.getByText('Private content')).toBeInTheDocument();
    expect(replaceCustomMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the notice and logs the manual attempt when the retry fails again', async () => {
    getBootstrapMock.mockRejectedValue(new Error('still down'));

    renderBootstrap();
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));

    await waitFor(() => expect(logHttpErrorMock).toHaveBeenCalledTimes(2));
    expect(logHttpErrorMock).toHaveBeenLastCalledWith(expect.any(Error), { data: { attempt: 2, trigger: 'manual' } });
    expect(screen.getByRole('status')).toHaveTextContent(NOTICE_TEXT);
    expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveAttribute('aria-busy', 'false');
  });

  it('keeps retrying silently in the background at 15 s, 1 min and 5 min, then stops', async () => {
    vi.useFakeTimers();
    getBootstrapMock.mockRejectedValue(new Error('down'));

    renderBootstrap();
    await act(async () => {});
    expect(getBootstrapMock).toHaveBeenCalledTimes(1);

    for (const [index, delay] of RETRY_DELAYS_MS.entries()) {
      await act(async () => { vi.advanceTimersByTime(delay - 1); });
      expect(getBootstrapMock).toHaveBeenCalledTimes(index + 1);
      await act(async () => { vi.advanceTimersByTime(1); });
      expect(getBootstrapMock).toHaveBeenCalledTimes(index + 2);
    }
    expect(logHttpErrorMock).toHaveBeenLastCalledWith(expect.any(Error), { data: { attempt: 4, trigger: 'background' } });

    await act(async () => { vi.advanceTimersByTime(60 * 60 * 1000); });
    expect(getBootstrapMock).toHaveBeenCalledTimes(RETRY_DELAYS_MS.length + 1);
    expect(screen.getByRole('status')).toHaveTextContent(NOTICE_TEXT);
  });

  it('hides the notice when a background retry succeeds and stops scheduling more', async () => {
    vi.useFakeTimers();
    getBootstrapMock.mockRejectedValueOnce(new Error('down')).mockResolvedValue(EMPTY_BOOTSTRAP);

    renderBootstrap();
    await act(async () => {});
    expect(screen.getByRole('status')).toBeInTheDocument();

    await act(async () => { vi.advanceTimersByTime(RETRY_DELAYS_MS[0]); });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    await act(async () => { vi.advanceTimersByTime(60 * 60 * 1000); });
    expect(getBootstrapMock).toHaveBeenCalledTimes(2);
  });

  it('cancels pending background retries on unmount', async () => {
    vi.useFakeTimers();
    getBootstrapMock.mockRejectedValue(new Error('down'));

    const { unmount } = renderBootstrap();
    await act(async () => {});
    unmount();

    await act(async () => { vi.advanceTimersByTime(60 * 60 * 1000); });
    expect(getBootstrapMock).toHaveBeenCalledTimes(1);
  });
});

it('renders no notice outside the bootstrap provider', () => {
  render(<BusinessCalendarSyncNotice />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
