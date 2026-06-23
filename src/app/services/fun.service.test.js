import { afterEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('../../http-common', () => ({
  default: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import FUNService from './fun.service';
import { clearPendingRequests } from './requestCache';

afterEach(() => {
  clearPendingRequests();
  vi.clearAllMocks();
});

describe('FUNService request dedupe', () => {
  it('comparte la misma request en vuelo para get_fun_IdPublic', () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    const first = FUNService.get_fun_IdPublic('68001-1-25-0233');
    const second = FUNService.get_fun_IdPublic('68001-1-25-0233');

    expect(second).toBe(first);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith('/fun/get/idpublic/68001-1-25-0233');
  });

  it('comparte la misma request en vuelo para getSummaryByIdPublic', () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    const first = FUNService.getSummaryByIdPublic('68001-1-25-0233');
    const second = FUNService.getSummaryByIdPublic('68001-1-25-0233');

    expect(second).toBe(first);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith('/fun/get/summary/68001-1-25-0233');
  });
});
