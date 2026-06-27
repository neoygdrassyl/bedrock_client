import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FUN from '@/app/pages/user/fun';

vi.mock('@/app/pages/user/fun_forms/components/fun_worker_asign.component', () => ({
  default: () => null,
}));
vi.mock('@/app/pages/user/fun_forms/components/table_components/table.component_expanded', () => ({
  default: () => null,
}));
vi.mock('@/app/services/fun.service', () => ({
  default: new Proxy({}, {
    get: () => () => Promise.resolve({ data: [] }),
  }),
}));

describe('FUN page heading contract', () => {
  it('renders the visible h1 used by legacy flows and route-level automation', async () => {
    render(<FUN translation={{}} globals={{}} swaMsg={{}} breadCrums={{}} />);

    expect(await screen.findByRole('heading', { level: 1, name: /RADICACIÓN DE SOLICITUDES/i })).toBeVisible();
  });
});
