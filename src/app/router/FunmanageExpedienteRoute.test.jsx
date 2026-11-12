import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../features/expediente/api/fun.service', () => ({
  __esModule: true,
  default: {
    get_fun_IdPublic: vi.fn(() => Promise.resolve({ data: { id: 1, id_public: '68001-1-26-0231', version: 1 } })),
  },
}));

// Stub workspace: exposes the props the route feeds it and lets the test change section.
vi.mock('../../features/expediente/fun/fun_forms/components/FunExpedienteFullscreen', () => ({
  FunExpedienteFullscreen: ({ initialSection, initialReport, onSectionChange }) => (
    <div>
      <output data-testid="initial-target">{`${initialSection}:${initialReport}`}</output>
      <button type="button" onClick={() => onSectionChange('tiempos')}>tiempos</button>
      <button type="button" onClick={() => onSectionChange('estructural')}>estructural</button>
      <button type="button" onClick={() => onSectionChange('detalles')}>detalles</button>
    </div>
  ),
}));

import FunmanageExpedienteRoute from './FunmanageExpedienteRoute';

let lastLocation;
function LocationProbe() {
  lastLocation = useLocation();
  return null;
}

function renderRoute(initialEntry) {
  return render(
    <MemoryRouter initialEntries={['/dashboard', initialEntry]} initialIndex={1}>
      <Routes>
        <Route path="/funmanage/expediente/:radicado" element={<FunmanageExpedienteRoute translation={{}} globals={{}} swaMsg={{}} />} />
        <Route path="*" element={null} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

describe('FunmanageExpedienteRoute section sync', () => {
  it('reads the initial section from the URL and mirrors section changes with replace', async () => {
    const user = userEvent.setup();
    renderRoute('/funmanage/expediente/68001-1-26-0231?section=chequeo&panel=open');

    expect(await screen.findByTestId('initial-target')).toHaveTextContent('chequeo:juridico');
    const keyBefore = lastLocation.key;

    await user.click(screen.getByRole('button', { name: 'estructural' }));
    await waitFor(() => expect(lastLocation.search).toBe('?section=informes&panel=open&report=estructural'));
    expect(screen.getByTestId('initial-target')).toHaveTextContent('informes:estructural');

    await user.click(screen.getByRole('button', { name: 'tiempos' }));
    await waitFor(() => expect(lastLocation.search).toBe('?section=tiempos&panel=open'));

    await user.click(screen.getByRole('button', { name: 'detalles' }));
    await waitFor(() => expect(lastLocation.search).toBe('?panel=open'));

    // replace navigation: still a single entry for the workspace, so "back" leaves it.
    expect(lastLocation.pathname).toBe('/funmanage/expediente/68001-1-26-0231');
    expect(lastLocation.key).not.toBe(keyBefore);
  });
});
