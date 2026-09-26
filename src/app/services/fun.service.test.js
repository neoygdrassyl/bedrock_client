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

  it('permite declarar silencioso un lookup exacto especulativo', () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    FUNService.get_fun_IdPublic('68001-1-25-0233', { skipDovelaErrorCapture: true });

    expect(getMock).toHaveBeenCalledWith(
      '/fun/get/idpublic/68001-1-25-0233',
      { skipDovelaErrorCapture: true },
    );
  });

  it('comparte la misma request en vuelo para getSummaryByIdPublic', () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    const first = FUNService.getSummaryByIdPublic('68001-1-25-0233');
    const second = FUNService.getSummaryByIdPublic('68001-1-25-0233');

    expect(second).toBe(first);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith('/fun/get/summary/68001-1-25-0233');
  });

  it('permite silenciar el summary opcional y codifica los términos de búsqueda', () => {
    getMock.mockImplementation(() => new Promise(() => {}));

    FUNService.getSummaryByIdPublic('68001-1-25-0233', { skipDovelaErrorCapture: true });
    FUNService.getSearch('4', 'Calle 12 # 34/56 & local');

    expect(getMock).toHaveBeenCalledWith(
      '/fun/get/summary/68001-1-25-0233',
      { skipDovelaErrorCapture: true },
    );
    expect(getMock).toHaveBeenCalledWith('/fun/getsearch/4&Calle%2012%20%23%2034%2F56%20%26%20local');
  });
});
