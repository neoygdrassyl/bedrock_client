import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SETTLE_DEBOUNCE_MS, resetSubmitGuard } from '@/shared/utils/submitGuard';

const { funService } = vi.hoisted(() => ({
  funService: {
    get: vi.fn(),
    loadPQRSxFUN: vi.fn(),
    create_func: vi.fn(),
    update_c: vi.fn(),
    update: vi.fn(),
    create_clock: vi.fn(),
    update_clock: vi.fn(),
  },
}));

vi.mock('../../api/fun.service', () => ({ __esModule: true, default: funService }));
vi.mock('../../../ventanilla/api/submit.service', () => ({
  __esModule: true,
  default: { getIdRelated: vi.fn(() => Promise.resolve({ data: [] })) },
}));
vi.mock('@/shared/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));
vi.mock('./components/fun_doc_confirmlegal', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/fun_doc_confirminc', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/fun_c_clocks.component', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/fun_moduleNav', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/fun_versionNav', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/FunChecklistWindowSwitcher', () => ({ __esModule: true, default: () => null }));
vi.mock('./components/fun_pdf_check', () => ({ __esModule: true, default: () => null }));
vi.mock('./fun_g_checklist', () => ({ __esModule: true, default: () => null }));

import { swalError } from '@/shared/utils/swalAdapter';
import FUNC from './fun_c.jsx';

const swaMsg = {
  title_wait: 'Espere',
  text_wait: 'Procesando',
  generic_success_title: 'OK',
  generic_success_text: 'OK',
  generic_eror_title: 'Error',
  generic_error_text: 'Error',
};

// Past the legal-review states, so "Guardar cambios" sends the checklist record only.
const currentItem = {
  id: 77,
  id_public: 'FUN26-2330',
  state: 50,
  fun_1s: [{ id: 1, version: 1, tipo: 'D', tramite: 'A', m_urb: '', m_sub: '', m_lic: 'A' }],
  fun_53s: [],
  fun_cs: [],
  fun_rs: [],
  fun_clocks: [],
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const elapse = (ms) => vi.setSystemTime(Date.now() + ms);

async function renderChequeo() {
  const user = userEvent.setup();
  render(
    <FUNC
      currentId={77}
      currentVersion={1}
      requestUpdate={vi.fn()}
      requesRefresh={vi.fn()}
      swaMsg={swaMsg}
      translation={{}}
      globals={{}}
    />,
  );
  const save = await screen.findByRole('button', { name: /Guardar cambios/ });
  // The form requires a condition before it submits.
  await user.click(screen.getByRole('radio', { name: 'Radicación incompleta' }));
  return { user, save };
}

describe('Chequeo: "Guardar cambios" is guarded while the save is in flight', () => {
  beforeEach(() => {
    // Only the clock is faked: the guard measures with Date.now(), the UI keeps real timers.
    vi.useFakeTimers({ toFake: ['Date'] });
    resetSubmitGuard();
    Object.values(funService).forEach((mock) => mock.mockReset());
    swalError.mockClear();
    funService.get.mockResolvedValue({ data: currentItem });
    funService.loadPQRSxFUN.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    resetSubmitGuard();
    vi.useRealTimers();
  });

  it('sends one save for two clicks while the request is pending for more than 2 s', async () => {
    const request = deferred();
    funService.create_func.mockReturnValue(request.promise);
    const { user, save } = await renderChequeo();

    await user.click(save);
    expect(funService.create_func).toHaveBeenCalledTimes(1);

    elapse(2500); // well past the legacy 1500 ms window
    await user.click(save);
    await user.click(save);
    expect(funService.create_func).toHaveBeenCalledTimes(1);

    request.resolve({ data: 'OK' });
    await waitFor(() => expect(funService.get).toHaveBeenCalledTimes(2)); // reload after the save
  });

  it('accepts the next click after the save failed', async () => {
    const request = deferred();
    funService.create_func.mockReturnValueOnce(request.promise).mockResolvedValue({ data: 'OK' });
    const { user, save } = await renderChequeo();

    await user.click(save);
    elapse(2500);
    await user.click(save);
    expect(funService.create_func).toHaveBeenCalledTimes(1);

    request.reject(new Error('503'));
    await waitFor(() => expect(swalError).toHaveBeenCalledTimes(1));

    // The handler reports the failure itself, so the guard sees a settled action and only
    // keeps the short post-settle debounce.
    elapse(SETTLE_DEBOUNCE_MS);
    await user.click(save);
    expect(funService.create_func).toHaveBeenCalledTimes(2);
  });
});
