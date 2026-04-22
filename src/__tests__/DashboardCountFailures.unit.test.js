import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/icon', () => ({
  Icon: ({ name }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('../app/services/fun.service', () => ({ default: { getAll_fun: vi.fn(() => Promise.reject(new Error('FUN down'))) } }));
vi.mock('../app/services/pqrs_main.service', () => ({ default: { getAll: vi.fn(() => Promise.reject(new Error('PQRS down'))) } }));
vi.mock('../app/services/submit.service', () => ({ default: { getAll: vi.fn(() => Promise.reject(new Error('Submit down'))) } }));
vi.mock('../app/services/mailbox.service', () => ({ default: { getAll: vi.fn(() => Promise.reject(new Error('Mailbox down'))) } }));
vi.mock('../app/services/appointments.service', () => ({ default: { getAll: vi.fn(() => Promise.reject(new Error('Appointments down'))) } }));

import Dashboard from '../app/pages/user/dashboard';

describe('Dashboard count failure states', () => {
  it('shows a visible fallback instead of silent zeroes when count services fail', async () => {
    render(
      <MemoryRouter>
        <Dashboard breadCrums={{}} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/conteo no disponible/i).length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Radicar Licencias').closest('a');
    expect(within(card).queryByText(/^0$/)).not.toBeInTheDocument();
  });
});
