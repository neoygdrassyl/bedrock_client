import React, { StrictMode } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function buildCurrentItem() {
  return {
    id: 321,
    id_public: 'CUB1-24-0321',
    id_payment: 'PAY-321',
    model: 2022,
    version: 1,
    state: 1,
    type: 'i',
    rules: '0;0',
    fun_1s: [{
      id: 1,
      tipo: '',
      tramite: '',
      description: '',
      m_urb: '',
      m_sub: '',
      m_lic: '',
      usos: '',
      area: '',
      vivienda: '',
      cultural: '',
      regla_1: '',
      regla_2: '',
    }],
    fun_2: null,
    fun_3s: [],
    fun_4s: [],
    fun_51s: [],
    fun_52s: [],
    fun_53s: [],
    fun_6s: [],
    fun_clocks: [],
    fun_law: null,
    fun_archive: null,
  };
}

const { funServiceMock, swalErrorMock } = vi.hoisted(() => ({
  funServiceMock: {
    get: vi.fn(),
    loadPQRSxFUN: vi.fn(() => Promise.resolve({ data: [] })),
  },
  swalErrorMock: vi.fn(),
}));

vi.mock('../app/services/fun.service', () => ({
  __esModule: true,
  default: funServiceMock,
}));

vi.mock('@/app/utils/swalAdapter', () => ({
  swalError: (...args) => swalErrorMock(...args),
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: () => <div data-testid="data-table-bridge" />,
}));

vi.mock('../app/components/customClasses/funCustomArrays', () => ({
  _FUN_1_PARSER: () => '',
  _FUN_2_PARSER: () => '',
  _FUN_3_PARSER: () => '',
  _FUN_4_PARSER: () => '',
  _FUN_5_PARSER: () => '',
  _FUN_6_PARSER: () => '',
  _FUN_7_PARSER: () => '',
  _FUN_8_PARSER: () => '',
  _FUN_9_PARSER: () => '',
  _FUN_101_PARSER: () => '',
  _FUN_102_PARSER: () => '',
  _FUN_24_PARSER: () => '',
  _FUN_25_PARSER: () => '',
}));

vi.mock('../app/components/customClasses/typeParse', () => ({
  dateParser: () => '',
  dateParser_yearsPassed: () => 0,
  regexChecker_isOA_2: () => false,
}));

vi.mock('@/components/icon', () => ({
  default: () => <span aria-hidden="true" />,
  Icon: () => <span aria-hidden="true" />,
}));

vi.mock('../app/pages/user/fun_forms/fun_g_checklist', () => ({
  __esModule: true,
  default: () => <div data-testid="fung-checklist" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_g_nav', () => ({
  __esModule: true,
  default: () => <div data-testid="fung-nav" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_moduleNav', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-module-nav" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_versionNav', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-version-nav" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_3_g_view', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-3-g-view" />,
}));

vi.mock('../app/components/vizualizer.component', () => ({
  __esModule: true,
  default: () => <div data-testid="vizualizer" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_g_mix.component', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-g-mix" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_g_reports.component', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-g-reports" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_archive.component', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-archive" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_g_reportMaster.compoentn', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-g-report-master" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_checklist_n', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-checklist-n" />,
}));

vi.mock('../app/pages/user/archive/arcXfun_view.component', () => ({
  __esModule: true,
  default: () => <div data-testid="archive-fun-view" />,
}));

vi.mock('../app/pages/user/fun_forms/components/fun_duplicate.component', () => ({
  __esModule: true,
  default: () => <div data-testid="fun-duplicate" />,
}));

import FUNG from '../app/pages/user/fun_forms/fun_g';

describe('FUNG detail loading lifecycle', () => {
  beforeEach(() => {
    funServiceMock.get.mockReset();
    funServiceMock.loadPQRSxFUN.mockClear();
    swalErrorMock.mockReset();
  });

  test('ignores stale detail failures after the active request already loaded the item', async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();

    funServiceMock.get
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise)
      .mockResolvedValue({ data: buildCurrentItem() });

    render(
      <StrictMode>
        <FUNG
          translation={{}}
          swaMsg={{}}
          globals={{}}
          currentId={321}
          currentVersion={1}
          NAVIGATION={vi.fn()}
          NAVIGATION_VERSION={vi.fn()}
        />
      </StrictMode>
    );

    await waitFor(() => expect(funServiceMock.get).toHaveBeenCalledTimes(2));

    await act(async () => {
      secondRequest.resolve({ data: buildCurrentItem() });
      await secondRequest.promise;
    });

    expect(await screen.findByText(/RESUMEN DE LA SOLICITUD/i)).toBeInTheDocument();

    await act(async () => {
      firstRequest.reject(new Error('stale detail failure'));
      try {
        await firstRequest.promise;
      } catch {
        // expected rejection for the stale request
      }
    });

    expect(swalErrorMock).not.toHaveBeenCalled();
    expect(screen.getByText(/RESUMEN DE LA SOLICITUD/i)).toBeInTheDocument();
  });
});
