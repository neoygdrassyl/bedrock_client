import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardCriticalAlerts from './DashboardCriticalAlerts';

describe('DashboardCriticalAlerts', () => {
  it('no renderiza la tarjeta de alertas urgentes', () => {
    render(
      <MemoryRouter>
        <DashboardCriticalAlerts />
      </MemoryRouter>
    );

    expect(screen.queryByRole('heading', { name: /alertas urgentes/i })).not.toBeInTheDocument();
  });
});
