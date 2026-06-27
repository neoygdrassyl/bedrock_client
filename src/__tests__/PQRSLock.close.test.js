import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import './helpers/mockExternals';

const hoisted = vi.hoisted(() => ({
  pqrsService: {
    get: vi.fn(),
    close: vi.fn(),
  },
  swalConfirmMock: vi.fn(() => Promise.resolve({ isConfirmed: true })),
  swalLoadingMock: vi.fn(),
  swalSuccessMock: vi.fn(),
  swalErrorMock: vi.fn(),
}));

vi.mock('../app/services/pqrs_main.service', () => ({
  __esModule: true,
  default: hoisted.pqrsService,
}));

vi.mock('../app/utils/swalAdapter', () => ({
  swalConfirm: hoisted.swalConfirmMock,
  swalLoading: hoisted.swalLoadingMock,
  swalSuccess: hoisted.swalSuccessMock,
  swalError: hoisted.swalErrorMock,
}));

vi.mock('../app/components/Collapsible', () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock('@/components/data-table-bridge', () => ({
  __esModule: true,
  default: () => <div data-testid="datatable-stub" />,
}));

vi.mock('../app/pages/user/pqrs/components/pqrs_replies_3.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_gen.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_clock.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_licence.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_solicitors.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_contancts.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_attach_pro.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_replies_2.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_moduleNav.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_worker_feedback.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_emails.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_genPDF_reply.component', () => ({ __esModule: true, default: () => <div /> }));
vi.mock('../app/pages/user/pqrs/components/pqrs_rteReply.component', () => ({ __esModule: true, default: () => <div /> }));

import PQRSLOCK from '../app/pages/user/pqrs/lockpqrs';

const swaMsg = {
  title_wait: 'Espere...',
  text_wait: 'Procesando...',
  generic_success_title: 'OK',
  generic_success_text: 'Cerrado',
  generic_eror_title: 'Error',
  generic_error_text: 'Fallo',
};

const currentItem = {
  id: 2612,
  id_publico: 'VR26-2207',
  id_global: 'VR26-2207',
  id_reply: null,
  pqrs_attaches: [],
  pqrs_workers: [],
  pqrs_contacts: [],
  pqrs_solocitors: [],
  pqrs_fun: null,
  pqrs_info: {},
  pqrs_law: { extension: false },
  pqrs_time: { id: 44, reply_formal: null },
};

function renderLock() {
  return render(
    <MemoryRouter>
      <PQRSLOCK
        currentId={2612}
        translation={{}}
        swaMsg={swaMsg}
        globals={{ id: '1' }}
        translation_form={{}}
        refreshList={vi.fn()}
        NAVIGATION={vi.fn()}
      />
    </MemoryRouter>
  );
}

describe('PQRSLOCK close flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1, name: 'Admin Test' };
    hoisted.pqrsService.get.mockResolvedValue({ data: currentItem });
    hoisted.pqrsService.close.mockResolvedValue({ data: 'OK' });
  });

  test('does not send reply_formal when the formal date input is missing', async () => {
    renderLock();

    fireEvent.click(await screen.findByRole('button', { name: /cerrar petición/i }));

    await waitFor(() => {
      expect(hoisted.pqrsService.close).toHaveBeenCalledTimes(1);
    });

    const payload = hoisted.pqrsService.close.mock.calls[0][0];

    expect(payload).toBeInstanceOf(FormData);
    expect(payload.get('id_master')).toBe('2612');
    expect(payload.get('time_id')).toBe('44');
    expect(payload.get('reply_formal')).toBeNull();
  });
});
