import { describe, expect, it, vi } from 'vitest';

const fun = vi.hoisted(() => ({ consult_Profesional: vi.fn() }));
vi.mock('./fun.service', () => ({ default: fun }));

import { fromInternal, internalProfessionalSource } from './internalProfessionalSource';

describe('internal professional source', () => {
  it('maps a FUN 5.2 history row null-safely', () => {
    expect(fromInternal({
      name: ' Ana ', surname: 'López', id_number: '876', email: null, number: 300, registration: 'A1',
      registration_date: '2012-03-04T00:00:00.000Z', sanction: 0,
    }, 0)).toEqual({
      key: 'internal:876', source: 'internal', givenNames: 'Ana', surnames: 'López', cc: '876', email: '',
      phone: '300', registration: 'A1', registrationDate: '2012-03-04', sanction: false, nameNeedsReview: false,
    });
    expect(fromInternal({ name: 'Ana' }, 3)).toMatchObject({ key: 'internal:3', surnames: '', sanction: undefined });
  });

  it('searches consult_Profesional quietly and cancellably', async () => {
    const signal = new AbortController().signal;
    fun.consult_Profesional.mockResolvedValue({ data: [{ name: 'Ana', id_number: '1' }] });
    expect((await internalProfessionalSource.search('ana', { signal })).map((item) => item.key)).toEqual(['internal:1']);
    expect(fun.consult_Profesional).toHaveBeenCalledWith('ana', { signal, skipErrorLog: true });
    fun.consult_Profesional.mockResolvedValue({ data: null });
    expect(await internalProfessionalSource.search('ana')).toEqual([]);
  });
});
