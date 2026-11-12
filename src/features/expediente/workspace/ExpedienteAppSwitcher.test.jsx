import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExpedienteAppSwitcher } from './ExpedienteAppSwitcher';

vi.mock('@/shared/branding/useCuraduriaLogo', () => ({ useCuraduriaLogo: () => ({ logo: 'logo.png' }) }));

function CurrentPath() {
  const location = useLocation();
  return <output data-testid="path">{location.pathname}</output>;
}

function renderSwitcher() {
  return render(
    <MemoryRouter initialEntries={['/funmanage/expediente/68001-1-26-0231']}>
      <ExpedienteAppSwitcher currentRadicado="68001-1-26-0231" />
      <Routes><Route path="*" element={<CurrentPath />} /></Routes>
    </MemoryRouter>
  );
}

afterEach(() => window.localStorage.clear());

describe('ExpedienteAppSwitcher', () => {
  it('lists the app modules and navigates to one of them', async () => {
    renderSwitcher();
    await userEvent.click(screen.getByRole('button', { name: 'Ir a otro módulo o expediente' }));
    const modules = screen.getByRole('group', { name: 'Módulos de Dovela' });
    expect(modules).toHaveTextContent('Panel de control');
    await userEvent.click(screen.getByRole('button', { name: 'Gestión' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/licencias/gestion');
  });

  it('opens another expediente by radicado and lists recent ones except the current', async () => {
    window.localStorage.setItem('dovela.recentExpedientes', JSON.stringify([
      { radicado: '68001-1-26-0231', href: '/funmanage/expediente/68001-1-26-0231' },
      { radicado: '68001-1-26-0105', href: '/funmanage/expediente/68001-1-26-0105' },
    ]));
    renderSwitcher();
    await userEvent.click(screen.getByRole('button', { name: 'Ir a otro módulo o expediente' }));
    const recents = screen.getByRole('group', { name: 'Expedientes recientes' });
    expect(recents).toHaveTextContent('68001-1-26-0105');
    expect(recents).not.toHaveTextContent('68001-1-26-0231');

    await userEvent.type(screen.getByLabelText('Abrir expediente por radicado'), '68001-1-26-0122{Enter}');
    expect(screen.getByTestId('path')).toHaveTextContent('/funmanage/expediente/68001-1-26-0122');
  });
});
