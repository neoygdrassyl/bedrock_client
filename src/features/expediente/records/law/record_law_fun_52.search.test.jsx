import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
  fun: { consult_Profesional: vi.fn(), update_52: vi.fn() },
  external: { getByName: vi.fn() },
}));
vi.mock('@/shared/api/http-common', () => ({ default: mocks.http }));
vi.mock('../../api/fun.service', () => ({ default: mocks.fun }));
vi.mock('../../../professionals/api/profesionals.service', () => ({ default: mocks.external }));
vi.mock('../../../../shared/components/vizualizer.component', () => ({ default: () => null }));

import RECORD_LAW_FUN_52 from './record_law_fun_52.component';

const professional = {
  id: 7, name: 'Ana', surname: 'López', id_number: '876', email: '', number: '', role: '', registration: '',
  registration_date: '', supervision: 'NO', sanction: false, expirience: 0, active: 1, docs: '',
};
const props = {
  translation: {}, swaMsg: {}, globals: {}, currentVersion: 1, currentRecord: { id: 1 }, currentVersionR: 1,
  quickModalStyle: {}, currentItem: { id: 1, fun_51s: [], fun_52s: [professional], fun_6s: [] },
};

describe('record_law_fun_52 professional search', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((service) => Object.values(service).forEach((fn) => fn.mockReset()));
    mocks.http.get.mockResolvedValue({ data: { data: [] } });
    mocks.fun.consult_Profesional.mockResolvedValue({
      data: [{ name: 'Luis', surname: 'Mora', id_number: '66', registration_date: '2012-03-04T00:00:00.000Z', sanction: 1 }],
    });
  });

  it('searches BD PROFESIONALES, then the FUN 5.2 history, and never the third-party service', async () => {
    const { container } = render(<MemoryRouter><RECORD_LAW_FUN_52 {...props} /></MemoryRouter>);
    fireEvent.click(container.querySelector('button'));
    const search = document.querySelector('input[name="search_52"]');
    fireEvent.change(search, { target: { value: 'luis' } });

    await waitFor(() => expect(document.querySelectorAll('datalist option')).toHaveLength(1));
    expect(mocks.http.get).toHaveBeenCalledWith(expect.stringMatching(/^\/professional-registry\/lookup\?q=luis/), expect.anything());
    expect(mocks.fun.consult_Profesional).toHaveBeenCalledWith('luis', expect.objectContaining({ skipErrorLog: true }));
    expect(mocks.http.get.mock.invocationCallOrder[0]).toBeLessThan(mocks.fun.consult_Profesional.mock.invocationCallOrder[0]);
    expect(mocks.external.getByName).not.toHaveBeenCalled();

    fireEvent.change(search, { target: { value: 'LUIS MORA · CC 66' } });
    expect(document.getElementById('f_5211').value).toBe('Luis');
    expect(document.getElementById('f_527').value).toBe('2012-03-04');
    expect(document.getElementById('f_5210').value).toBe('1');
  });
});
