import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FUN from '@/app/pages/user/fun';

const { openExpedienteWorkspaceMock } = vi.hoisted(() => ({
  openExpedienteWorkspaceMock: vi.fn(),
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

vi.mock('@/app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({
  default: () => null,
}));

vi.mock('@/app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({
  default: () => null,
}));

vi.mock('@/app/pages/user/fun_forms/components/icon_progress.compoennt', () => ({
  default: () => <div data-testid="progress-icons">icons</div>,
}));

vi.mock('@/app/pages/user/fun_forms/utils/expedienteWorkspaceRoute', () => ({
  LEGACY_MODULE_TO_WORKSPACE: {},
  openExpedienteWorkspace: openExpedienteWorkspaceMock,
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

describe('FUN quick preview sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.user = { id: 1, roleId: 1 };
  });

  it('abre el workspace de expediente al seleccionar una fila', async () => {
    const user = userEvent.setup();

    render(<FUN translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    const radicado = await screen.findByText('68001-1-26-0001');
    await user.click(radicado);

    expect(openExpedienteWorkspaceMock).toHaveBeenCalledWith(funRow, { module: 'general' });
  });
});
