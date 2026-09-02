import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import FUN from '@/app/pages/user/fun';

const { funServiceMock, userServiceMock } = vi.hoisted(() => ({
  funServiceMock: {
    getAll_fun: vi.fn(),
    getSearch: vi.fn(() => Promise.resolve({ data: [] })),
    loadSubmit2: vi.fn(() => Promise.resolve({ data: [] })),
  },
  userServiceMock: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

vi.mock('@/app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({ default: () => null }));
vi.mock('@/app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({ default: () => null }));
vi.mock('@/app/services/fun.service', () => ({
  default: new Proxy(funServiceMock, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return () => Promise.resolve({ data: [] });
    },
  }),
}));
vi.mock('@/app/services/users.service', () => ({
  default: userServiceMock,
}));

const funRow = {
  id: 1,
  id_public: '68001-1-26-0001',
  type: 'iii',
  state: 50,
  clock_payment: '2026-01-10',
  clock_date: '2026-01-15',
  clock_pay2: '2026-02-10',
  rules: '0;0',
};

describe('FUN primary load recovery', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1 };
    funServiceMock.getAll_fun.mockReset();
    funServiceMock.getSearch.mockClear();
    funServiceMock.loadSubmit2.mockReset();
    userServiceMock.getAll.mockReset();

    userServiceMock.getAll.mockResolvedValue({ data: [] });
    funServiceMock.loadSubmit2.mockResolvedValue({ data: [] });
  });

  it('shows a retry state when the main FUN list fails and recovers after retrying', async () => {
    const user = userEvent.setup();
    funServiceMock.getAll_fun
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ data: [] });

    render(
      <FUN
        translation={{}}
        globals={{}}
        swaMsg={{ text_btn: 'OK', title_wait: 'Espere...', text_wait: 'Procesando...' }}
        breadCrums={{}}
      />,
    );

    expect(await screen.findByText('No se pudo cargar las solicitudes.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    await waitFor(() => expect(funServiceMock.getAll_fun).toHaveBeenCalledTimes(2));
    await waitFor(() => {
      expect(screen.queryByText('No se pudo cargar las solicitudes.')).not.toBeInTheDocument();
    });
  });

  it('keeps previously loaded rows visible when a refresh fails', async () => {
    const user = userEvent.setup();
    funServiceMock.getAll_fun
      .mockResolvedValueOnce({ data: [funRow] })
      .mockRejectedValueOnce(new Error('network down'));

    render(
      <FUN
        translation={{}}
        globals={{}}
        swaMsg={{ text_btn: 'OK', title_wait: 'Espere...', text_wait: 'Procesando...' }}
        breadCrums={{}}
      />,
    );

    expect(await screen.findByText('68001-1-26-0001')).toBeInTheDocument();

    // An empty query routes the Consultar submit through refreshList() -> retrievePublish().
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    expect(await screen.findByText('No se pudo cargar las solicitudes.')).toBeInTheDocument();
    expect(screen.getByText('68001-1-26-0001')).toBeInTheDocument();
  });
});
