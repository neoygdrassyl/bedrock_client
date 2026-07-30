import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FUN from '@/app/pages/user/fun';

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

vi.mock('@/app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({
  default: () => null,
}));

vi.mock('@/app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({
  default: () => null,
}));

vi.mock('@/app/pages/user/fun_forms/components/icon_progress.compoennt', () => ({
  default: () => <div data-testid="progress-icons">icons</div>,
}));

vi.mock('@/app/services/users.service', () => ({
  default: {
    getAll: () => Promise.resolve({ data: [] }),
  },
}));

vi.mock('@/app/services/fun.service', () => ({
  default: {
    getAll_fun: () => Promise.resolve({ data: [funRow] }),
    loadSubmit2: () => Promise.resolve({ data: [] }),
    getLastIdPublic: () => Promise.resolve({ data: [{ id: '68001-1-26-0000' }] }),
    create: () => Promise.resolve({ data: 'OK' }),
    getSearch: () => Promise.resolve({ data: [funRow] }),
    get: () => Promise.resolve({ data: funRow }),
    loadMacroSingle: () => Promise.resolve({ data: [] }),
  },
}));

vi.mock('@/app/components/customClasses/typeParse', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    dateParser: (value) => value,
    dateParser_finalDate: () => '2026-02-09',
    dateParser_timePassed: () => 5,
    dateParser_timeLeft: () => 25,
    formsParser1: () => 'LICENCIA DE CONSTRUCCION, INICIAL, OBRA NUEVA',
    regexChecker_isPh: () => false,
    regexChecker_isOA: () => false,
    regexChecker_isOA_2: () => false,
  };
});

describe('FUN row action menu workspace opening', () => {
  beforeEach(() => {
    window.user = { id: 1, roleId: 1 };
    window.open = vi.fn(() => ({}));
  });

  it('keeps row open and action menu open isolated', async () => {
    const user = userEvent.setup();

    render(<FUN translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    const radicado = await screen.findByText('68001-1-26-0001');
    await user.click(radicado);

    expect(window.open).toHaveBeenNthCalledWith(
      1,
      '/funmanage/expediente/68001-1-26-0001',
      '_blank',
      'noopener,noreferrer',
    );

    const actionToggle = await waitFor(() => document.querySelector('.fun-action-toggle'));
    expect(actionToggle).toBeTruthy();

    await user.click(actionToggle);
    expect(window.open).toHaveBeenCalledTimes(1);

    await user.click(await screen.findByText('Tiempos'));

    expect(window.open).toHaveBeenCalledTimes(2);
    expect(window.open).toHaveBeenNthCalledWith(
      2,
      '/funmanage/expediente/68001-1-26-0001?section=tiempos',
      '_blank',
      'noopener,noreferrer',
    );
  }, 10_000);

  it('opens actualizar in the workspace', async () => {
    const user = userEvent.setup();

    render(<FUN translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    await screen.findByText('68001-1-26-0001');

    const actionToggle = await waitFor(() => document.querySelector('.fun-action-toggle'));
    expect(actionToggle).toBeTruthy();

    await user.click(actionToggle);
    await user.click(await screen.findByText('Actualizar'));

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenNthCalledWith(
      1,
      '/funmanage/expediente/68001-1-26-0001?section=actualizar',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('opens publicidad in the workspace', async () => {
    const user = userEvent.setup();

    render(<FUN translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    await screen.findByText('68001-1-26-0001');

    const actionToggle = await waitFor(() => document.querySelector('.fun-action-toggle'));
    expect(actionToggle).toBeTruthy();

    await user.click(actionToggle);
    await user.click(await screen.findByText('Publicidad'));

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenNthCalledWith(
      1,
      '/funmanage/expediente/68001-1-26-0001?section=publicidad',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
