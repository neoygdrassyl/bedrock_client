import { beforeEach, expect, it, vi } from 'vitest';
import BusinessCalendarService from './business-calendar.service';

const { getMock, postMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock('../../http-common', () => ({
  default: { get: getMock, post: postMock, delete: deleteMock },
}));

beforeEach(() => {
  getMock.mockReset();
  postMock.mockReset();
  deleteMock.mockReset();
  BusinessCalendarService.clearBootstrapCache();
});

it('deduplicates the authenticated calendar bootstrap request', async () => {
  let resolveRequest;
  getMock.mockReturnValue(new Promise(resolve => { resolveRequest = resolve; }));

  const first = BusinessCalendarService.getBootstrap(2021, 2027);
  const second = BusinessCalendarService.getBootstrap(2021, 2027);

  expect(getMock).toHaveBeenCalledTimes(1);
  expect(getMock).toHaveBeenCalledWith(
    '/business-calendar/bootstrap?startYear=2021&endYear=2027',
    { timeout: 10000, skipDovelaErrorCapture: true },
  );
  resolveRequest({ data: { years: [], customDays: [] } });
  await expect(Promise.all([first, second])).resolves.toHaveLength(2);

  getMock.mockResolvedValue({ data: { years: [], customDays: [] } });
  await BusinessCalendarService.getBootstrap(2021, 2027);
  expect(getMock).toHaveBeenCalledTimes(2);
});

it('keeps all expected legacy 404 fallbacks out of global error capture', async () => {
  getMock
    .mockRejectedValueOnce({ response: { status: 404 } })
    .mockResolvedValueOnce({ data: { holidays: [{ date: '2026-07-20' }] } })
    .mockRejectedValueOnce({ response: { status: 404 } });

  const response = await BusinessCalendarService.getBootstrap(2026, 2026);

  expect(response.data.years[0].holidays[0].date).toBe('2026-07-20');
  expect(response.data.customDays).toEqual([]);
  expect(getMock.mock.calls[1][1]).toEqual({ timeout: 10000, skipDovelaErrorCapture: true });
  expect(getMock.mock.calls[2][1]).toEqual({ timeout: 10000, skipDovelaErrorCapture: true });
});

it('rejects the legacy bootstrap when an official year fails unexpectedly', async () => {
  const serverError = { response: { status: 503 } };
  getMock
    .mockRejectedValueOnce({ response: { status: 404 } })
    .mockRejectedValueOnce(serverError)
    .mockResolvedValueOnce({ data: { customDays: [] } });

  await expect(BusinessCalendarService.getBootstrap(2026, 2026)).rejects.toBe(serverError);
});

it('calls the custom-day API contracts with a bounded timeout', async () => {
  getMock.mockResolvedValue({ data: { customDays: [] } });
  BusinessCalendarService.getCustomYear(2026);
  BusinessCalendarService.createCustomDay({ date: '2026-09-04', reason: 'Cierre' });
  BusinessCalendarService.deleteCustomDay('2026-09-04');

  expect(getMock).toHaveBeenCalledWith('/business-calendar/custom-days?year=2026', { timeout: 10000 });
  expect(postMock).toHaveBeenCalledWith(
    '/business-calendar/custom-days',
    { date: '2026-09-04', reason: 'Cierre' },
    { timeout: 10000, headers: { 'Content-Type': 'application/json' } },
  );
  expect(deleteMock).toHaveBeenCalledWith('/business-calendar/custom-days/2026-09-04', { timeout: 10000 });
});

it('treats a missing custom-day endpoint as an empty calendar for older backends', async () => {
  getMock.mockRejectedValue({ response: { status: 404 } });

  await expect(BusinessCalendarService.getCustomYear(2026)).resolves.toEqual({
    data: { year: 2026, customDays: [] },
  });
});
