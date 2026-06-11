import { describe, expect, it, vi, beforeEach } from 'vitest';

const { httpGetMock } = vi.hoisted(() => ({
  httpGetMock: vi.fn(),
}));

vi.mock('../../http-common', () => ({
  __esModule: true,
  default: {
    get: httpGetMock,
  },
}));

import FUNService from './fun.service.js';

describe('FUNService missing documents endpoint', () => {
  beforeEach(() => {
    httpGetMock.mockReset();
    httpGetMock.mockResolvedValue({ data: {} });
  });

  it('consulta documentos faltantes con fun_id e id_related en la ruta esperada', () => {
    FUNService.getMissingDocuments('FUN26-2330', 'VR26-2330');

    expect(httpGetMock).toHaveBeenCalledWith('/fun/documents/missing/FUN26-2330/VR26-2330');
  });
});
