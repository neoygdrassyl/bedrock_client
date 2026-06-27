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
  funServiceMock: { getAll_fun: vi.fn() },
  pqrsMainServiceMock: { getAll: vi.fn() },
  submitServiceMock: { getAll: vi.fn() },
  mailboxServiceMock: { getAll: vi.fn() },
  appointmentsServiceMock: { getAll: vi.fn() },
  bookmarkServiceMock: { list: vi.fn() },
}));

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../app/services/fun.service', () => ({ __esModule: true, default: funServiceMock }));
vi.mock('../app/services/pqrs_main.service', () => ({ __esModule: true, default: pqrsMainServiceMock }));
vi.mock('../app/services/submit.service', () => ({ __esModule: true, default: submitServiceMock }));
vi.mock('../app/services/mailbox.service', () => ({ __esModule: true, default: mailboxServiceMock }));
vi.mock('../app/services/appointments.service', () => ({ __esModule: true, default: appointmentsServiceMock }));
vi.mock('../app/services/bookmark.service', () => ({ __esModule: true, default: bookmarkServiceMock }));

describe('Dashboard count failure states', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    funServiceMock.getAll_fun.mockRejectedValue(new Error('FUN down'));
    pqrsMainServiceMock.getAll.mockRejectedValue(new Error('PQRS down'));
    submitServiceMock.getAll.mockRejectedValue(new Error('Submit down'));
    mailboxServiceMock.getAll.mockRejectedValue(new Error('Mailbox down'));
    appointmentsServiceMock.getAll.mockRejectedValue(new Error('Appointments down'));
    bookmarkServiceMock.list.mockResolvedValue({ data: [] });
  });

  it('shows a visible fallback instead of silent zeroes when count services fail', async () => {
    const { default: Dashboard } = await import('../app/pages/user/dashboard');

    render(
      <MemoryRouter>
        <Dashboard breadCrums={{}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/conteo no disponible/i).length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Nueva radicación').closest('a');
    expect(within(card).queryByText(/^0$/)).not.toBeInTheDocument();
  });
});
