import { afterEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('../../../shared/api/http-common', () => ({
  default: {
    get: getMock,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import FUNService from './fun.service';
import { clearPendingRequests } from '../../../shared/api/requestCache';

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

    FUNService.get_fun_IdPublic('68001-1-25-0233', { skipErrorLog: true });

    expect(getMock).toHaveBeenCalledWith(
      '/fun/get/idpublic/68001-1-25-0233',
      { skipErrorLog: true },
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

    FUNService.getSummaryByIdPublic('68001-1-25-0233', { skipErrorLog: true });
    FUNService.getSearch('4', 'Calle 12 # 34/56 & local');

    expect(getMock).toHaveBeenCalledWith(
      '/fun/get/summary/68001-1-25-0233',
      { skipErrorLog: true },
    );
    expect(getMock).toHaveBeenCalledWith('/fun/getsearch/4&Calle%2012%20%23%2034%2F56%20%26%20local');
  });
});

describe('FUN 5.2 read-only fields', () => {
  it('never sends docs, active and the other backend-owned fields on create or update', async () => {
    const { default: http } = await import('../../../shared/api/http-common');
    const { FUN52_READ_ONLY_FIELDS } = await import('./fun.service');
    const data = new FormData();
    data.set('fun0Id', '7'); data.set('name', 'Eva'); data.set('docs', '-1,-1,-1,-1,-1,-1'); data.set('active', '1'); data.set('registration_validity', '1');
    await FUNService.create_fun52(data);
    const created = http.post.mock.calls.at(-1);
    expect(created[0]).toBe('/fun/fun52');
    expect(Array.from(created[1].keys())).toEqual(['fun0Id', 'name']);
    await FUNService.update_52(3, { name: 'Eva', docs: '0,0,0,0,0,0', postgraduate: 1 });
    expect(http.put.mock.calls.at(-1)).toEqual(['/fun/fun52A/3', { name: 'Eva' }]);
    expect(FUN52_READ_ONLY_FIELDS).toContain('docs');
  });
});
