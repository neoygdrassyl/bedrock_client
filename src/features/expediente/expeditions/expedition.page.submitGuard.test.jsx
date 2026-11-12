import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SETTLE_DEBOUNCE_MS, resetSubmitGuard } from '@/shared/utils/submitGuard';

const { expeditionService, funService } = vi.hoisted(() => ({
  expeditionService: { getRecord: vi.fn(), create: vi.fn() },
  funService: { get: vi.fn(), loadPQRSxFUN: vi.fn() },
}));

vi.mock('../api/expedition.service', () => ({ __esModule: true, default: expeditionService }));
vi.mock('../api/fun.service', () => ({ __esModule: true, default: funService }));
vi.mock('../api/record_law.service', () => ({
  __esModule: true,
  default: { getRecord: vi.fn(() => Promise.resolve({ data: [] })) },
}));
vi.mock('../../../shared/api/custom.service', () => ({
  __esModule: true,
  default: { loadDictionary_cub_id: vi.fn(() => Promise.resolve({ data: [] })) },
}));
vi.mock('@/shared/utils/swalAdapter', () => ({
  swalClose: vi.fn(),
  swalError: vi.fn(),
  swalLoading: vi.fn(),
  swalSuccess: vi.fn(),
}));
vi.mock('./exp_1.component', () => ({ __esModule: true, default: () => null }));
vi.mock('./exp_2.component', () => ({ __esModule: true, default: () => null }));
vi.mock('./exp_areas.component', () => ({ __esModule: true, default: () => null }));
vi.mock('./exp_docs.component', () => ({ __esModule: true, default: () => null }));
vi.mock('./exp_lic.component', () => ({ __esModule: true, default: () => null }));
vi.mock('../fun/fun_forms/components/fun_versionNav', () => ({ __esModule: true, default: () => null }));
vi.mock('../fun/fun_forms/components/fun_moduleNav', () => ({ __esModule: true, default: () => null }));

import { swalError, swalSuccess } from '@/shared/utils/swalAdapter';
import EXPEDITION from './expedition.page.jsx';

const swaMsg = {
  publish_success_title: 'OK',
  publish_success_text: 'OK',
  text_footer: '',
  generic_eror_title: 'Error',
  generic_error_text: 'Error',
};

const currentItem = {
  id: 77,
  id_public: 'FUN26-2330',
  fun_1s: [{ id: 1, version: 1, tipo: 'D', tramite: 'A', m_urb: '', m_sub: '', m_lic: 'A' }],
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const elapse = (ms) => vi.setSystemTime(Date.now() + ms);

async function renderExpedition() {
  const user = userEvent.setup();
  render(
    <EXPEDITION
      currentId={77}
      currentVersion={1}
      swaMsg={swaMsg}
      translation={{}}
      globals={{}}
      closeModal={vi.fn()}
      requesRefresh={vi.fn()}
    />,
  );
  const generate = await screen.findByRole('button', { name: 'Generar expedición en blanco' });
  return { user, generate };
}

describe('Expedición: "Generar expedición en blanco" creates one record per click', () => {
  beforeEach(() => {
    // Only the clock is faked: the guard measures with Date.now(), the UI keeps real timers.
    vi.useFakeTimers({ toFake: ['Date'] });
    resetSubmitGuard();
    [...Object.values(expeditionService), ...Object.values(funService), swalError, swalSuccess].forEach((mock) => mock.mockReset());
    expeditionService.getRecord.mockResolvedValue({ data: [] });
    funService.get.mockResolvedValue({ data: currentItem });
    funService.loadPQRSxFUN.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    resetSubmitGuard();
    vi.useRealTimers();
  });

  it('creates once for repeated clicks while the request is pending, even past the 4 s window', async () => {
    const request = deferred();
    expeditionService.create.mockReturnValue(request.promise);
    const { user, generate } = await renderExpedition();

    await user.dblClick(generate);
    expect(expeditionService.create).toHaveBeenCalledTimes(1);

    elapse(2500);
    await user.click(generate);
    elapse(2500); // 5 s in flight: the old time window (4 s) would have let this one through
    await user.click(generate);
    expect(expeditionService.create).toHaveBeenCalledTimes(1);

    request.resolve({ data: 'OK' });
    await waitFor(() => expect(swalSuccess).toHaveBeenCalledTimes(1));
    expect(expeditionService.create).toHaveBeenCalledTimes(1);
  });

  it('creates again on the next click after the request failed', async () => {
    const request = deferred();
    expeditionService.create.mockReturnValueOnce(request.promise).mockResolvedValue({ data: 'OK' });
    const { user, generate } = await renderExpedition();

    await user.click(generate);
    elapse(2500);
    await user.click(generate);
    expect(expeditionService.create).toHaveBeenCalledTimes(1);

    request.reject(new Error('503'));
    await waitFor(() => expect(swalError).toHaveBeenCalledTimes(1));

    // The handler reports the failure itself, so the guard sees a settled action and only
    // keeps the short post-settle debounce; the 4 s window no longer blocks the retry.
    elapse(SETTLE_DEBOUNCE_MS);
    await user.click(generate);
    expect(expeditionService.create).toHaveBeenCalledTimes(2);
  });
});
