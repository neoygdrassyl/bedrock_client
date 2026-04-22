import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FUN from '@/app/pages/user/fun';

vi.mock('@/app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({ default: () => null }));
vi.mock('@/app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({ default: () => null }));
vi.mock('@/app/services/fun.service', () => ({
  default: new Proxy({}, {
    get: (_target, prop) => {
      if (prop === 'getAll_fun') return () => Promise.resolve({ data: [] });
      if (prop === 'getSearch') return () => Promise.resolve({ data: [] });
      if (prop === 'getSearch_fun') return () => Promise.resolve({ data: [] });
      return () => Promise.resolve({ data: [] });
    },
  }),
}));
vi.mock('@/app/services/users.service', () => ({
  default: new Proxy({}, { get: () => () => Promise.resolve({ data: [] }) }),
}));

describe('FUN search empty state', () => {
  it('shows a visible empty-state result after a search with no matches', async () => {
    const user = userEvent.setup();
    render(<FUN translation={{}} globals={{}} swaMsg={{ text_btn: 'OK' }} breadCrums={{}} />);

    const queryInput = document.getElementById('search_1');
    expect(queryInput).toBeTruthy();
    await user.type(queryInput, 'ZZZ-NO-RESULT');
    await user.click(screen.getByRole('button', { name: /consultar/i }));

    await waitFor(() => {
      expect(document.body.textContent).toMatch(/Resultado de la B[uú]squeda/i);
      expect(screen.getAllByText(/NO HAY SOLICITUDES/i).length).toBeGreaterThan(0);
    });
  });
});
