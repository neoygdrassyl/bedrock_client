import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getSummaryMock } = vi.hoisted(() => ({ getSummaryMock: vi.fn() }));

vi.mock('../api/fun.service', () => ({
  __esModule: true,
  default: { getSummaryByIdPublic: getSummaryMock, getSearch: vi.fn() },
}));
vi.mock('@/shared/api/search.service', () => ({ __esModule: true, default: { search: vi.fn() } }));

import { ExpedienteDock } from './ExpedienteDock';
import { ExpedienteDockMount } from './ExpedienteDockMount';
import { __resetDockStoreForTests, addToDock, getDockSnapshot, setActiveWorkspace } from './expedienteDockStore';
import { __clearQuickSummaryCache } from './quickSummaryCache';

const SUMMARY = {
  id_public: '68001-1-26-0231',
  version: 1,
  solicitante: 'María Pérez',
  categoria: 'III',
  fecha_radicacion: '2026-09-01',
  fecha_limite: '2026-11-15',
  dias_habiles_usados: 10,
  dias_habiles_limite: 45,
  porcentaje_avance: 22,
  status: 'EN_TERMINO',
  fase_label: 'Estudio y observaciones',
};

let lastLocation;
function LocationProbe() {
  lastLocation = useLocation();
  return null;
}

function renderDock(ui = <ExpedienteDock />) {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      {ui}
      <LocationProbe />
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  __resetDockStoreForTests();
  __clearQuickSummaryCache();
  getSummaryMock.mockResolvedValue({ data: { data: SUMMARY } });
});

afterEach(() => vi.clearAllMocks());

describe('ExpedienteDock', () => {
  it('renders nothing while the dock is empty', () => {
    renderDock(<ExpedienteDockMount />);
    expect(screen.queryByTestId('expediente-dock')).not.toBeInTheDocument();
  });

  it('shows a chip and a quick window that loads only the summary endpoint (once per session)', async () => {
    addToDock('68001-1-26-0231');
    renderDock();

    const chip = screen.getByTestId('dock-chip-68001-1-26-0231');
    expect(within(chip).getByText('26-0231')).toBeInTheDocument();

    const quickWindow = screen.getByRole('dialog', { name: '68001-1-26-0231' });
    expect(await within(quickWindow).findByText('María Pérez')).toBeInTheDocument();
    expect(within(quickWindow).getByText('35 días hábiles restantes')).toBeInTheDocument();
    expect(within(quickWindow).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '22');
    // Chip and window share one request.
    expect(getSummaryMock).toHaveBeenCalledTimes(1);
    expect(getSummaryMock).toHaveBeenCalledWith('68001-1-26-0231', expect.objectContaining({ skipErrorLog: true }));
  });

  it('minimizes and closes from the window header', async () => {
    const user = userEvent.setup();
    addToDock('A-1-26-0001');
    renderDock();

    await user.click(screen.getByRole('button', { name: 'Minimizar A-1-26-0001' }));
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'A-1-26-0001' })).not.toBeInTheDocument());
    expect(getDockSnapshot().items[0].open).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Quitar A-1-26-0001 de la barra' }));
    expect(getDockSnapshot().items).toEqual([]);
  });

  it('shows a retryable error state when the summary fails', async () => {
    const user = userEvent.setup();
    getSummaryMock.mockRejectedValueOnce(Object.assign(new Error('boom'), { response: { status: 500 } }));
    addToDock('B-1-26-0002');
    renderDock();

    const quickWindow = screen.getByRole('dialog', { name: 'B-1-26-0002' });
    await user.click(await within(quickWindow).findByRole('button', { name: 'Reintentar' }));
    expect(await within(quickWindow).findByText('María Pérez')).toBeInTheDocument();
  });

  it('expands a quick link into the workspace and swaps the current workspace into the dock', async () => {
    const user = userEvent.setup();
    addToDock('68001-1-26-0231');
    setActiveWorkspace('68001-1-26-0100');
    renderDock();

    const quickWindow = screen.getByRole('dialog', { name: '68001-1-26-0231' });
    await within(quickWindow).findByText('María Pérez');
    await user.click(within(quickWindow).getByRole('button', { name: /inf\. jurídico/i }));

    expect(lastLocation.pathname).toBe('/funmanage/expediente/68001-1-26-0231');
    expect(lastLocation.search).toBe('?section=informes');
    const items = Object.fromEntries(getDockSnapshot().items.map((item) => [item.radicado, item.open]));
    expect(items).toEqual({ '68001-1-26-0231': false, '68001-1-26-0100': false });
  });
});
