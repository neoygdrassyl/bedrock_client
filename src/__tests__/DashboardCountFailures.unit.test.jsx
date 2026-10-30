import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const {
  funServiceMock,
  pqrsMainServiceMock,
  submitServiceMock,
  mailboxServiceMock,
  appointmentsServiceMock,
  bookmarkServiceMock,
} = vi.hoisted(() => ({
  // Mocked only to prove the dashboard no longer touches them.
  funServiceMock: { getAll_fun: vi.fn() },
  submitServiceMock: { count: vi.fn() },
  // The dashboard reads counters from the lightweight `/count` endpoints only.
  pqrsMainServiceMock: { count: vi.fn() },
  mailboxServiceMock: { count: vi.fn() },
  appointmentsServiceMock: { count: vi.fn() },
  bookmarkServiceMock: { list: vi.fn() },
}));

vi.mock('@/shared/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../features/expediente/api/fun.service', () => ({ __esModule: true, default: funServiceMock }));
vi.mock('../features/pqrs/api/pqrs_main.service', () => ({ __esModule: true, default: pqrsMainServiceMock }));
vi.mock('../features/ventanilla/api/submit.service', () => ({ __esModule: true, default: submitServiceMock }));
vi.mock('../features/messaging/api/mailbox.service', () => ({ __esModule: true, default: mailboxServiceMock }));
vi.mock('../features/appointments/api/appointments.service', () => ({ __esModule: true, default: appointmentsServiceMock }));
vi.mock('../shared/api/bookmark.service', () => ({ __esModule: true, default: bookmarkServiceMock }));

function kpiTile(label) {
  const list = screen.getByRole('list', { name: 'Indicadores operativos' });
  return within(list).getByText(label).closest('a');
}

async function renderDashboard() {
  const { default: Dashboard } = await import('../features/dashboard/dashboard');
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard count failure states', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();

    pqrsMainServiceMock.count.mockRejectedValue(new Error('PQRS down'));
    mailboxServiceMock.count.mockRejectedValue(new Error('Mailbox down'));
    appointmentsServiceMock.count.mockRejectedValue(new Error('Appointments down'));
    bookmarkServiceMock.list.mockResolvedValue({ data: [] });
  });

  it('shows a dash instead of a silent zero when a count service fails', async () => {
    await renderDashboard();

    await waitFor(() => expect(within(kpiTile('PQRS')).getByText('—')).toBeInTheDocument());
    expect(within(kpiTile('Buzón')).getByText('—')).toBeInTheDocument();
    expect(within(kpiTile('Citas')).getByText('—')).toBeInTheDocument();
    expect(within(kpiTile('PQRS')).queryByText(/^0$/)).not.toBeInTheDocument();
    // Module rows backed by a failed count are flagged as unavailable.
    expect(screen.getAllByTitle('Conteo no disponible').length).toBeGreaterThan(0);
  });

  it('renders the numbers returned by the /count endpoints', async () => {
    // `/count` answers { count: N }, not an array to measure with `.length`.
    pqrsMainServiceMock.count.mockResolvedValue({ data: { count: 1666 } });
    mailboxServiceMock.count.mockResolvedValue({ data: { count: 9 } });
    appointmentsServiceMock.count.mockResolvedValue({ data: { count: 1005 } });

    await renderDashboard();

    await waitFor(() => expect(within(kpiTile('PQRS')).getByText((1666).toLocaleString('es-CO'))).toBeInTheDocument());
    expect(within(kpiTile('Buzón')).getByText('9')).toBeInTheDocument();
    expect(within(kpiTile('Citas')).getByText((1005).toLocaleString('es-CO'))).toBeInTheDocument();
  });

  it('never downloads the FUN list nor counts Ventanilla Única', async () => {
    pqrsMainServiceMock.count.mockResolvedValue({ data: { count: 1 } });

    await renderDashboard();

    await waitFor(() => expect(pqrsMainServiceMock.count).toHaveBeenCalledTimes(1));
    expect(funServiceMock.getAll_fun).not.toHaveBeenCalled();
    expect(submitServiceMock.count).not.toHaveBeenCalled();
  });
});
