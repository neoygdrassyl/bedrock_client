import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockUseDashboard = vi.fn();
const mockUseAlarmConfig = vi.fn();
const mockUseBookmarks = vi.fn();

vi.mock('@/app/pages/user/fun_forms/hooks/useDashboard', () => ({
  useDashboard: (...args) => mockUseDashboard(...args),
}));

vi.mock('@/app/pages/user/fun_forms/hooks/useAlarmConfig', () => ({
  useAlarmConfig: (...args) => mockUseAlarmConfig(...args),
}));

vi.mock('@/app/pages/user/fun_forms/hooks/useBookmarks', () => ({
  useBookmarks: (...args) => mockUseBookmarks(...args),
}));

vi.mock('@/app/pages/user/fun_forms/components/FunDashboardKPIs', () => ({
  FunDashboardKPIs: () => <div data-testid="kpis-stub">KPIs</div>,
}));

vi.mock('@/app/pages/user/fun_forms/components/FunmanageScatterChart', () => ({
  FunmanageScatterChart: () => <div data-testid="scatter-stub">Scatter</div>,
}));

vi.mock('@/app/pages/user/fun_forms/components/FunmanagePhaseChart', () => ({
  FunmanagePhaseChart: () => <div data-testid="phase-chart-stub">Phase Chart</div>,
}));

vi.mock('@/app/pages/user/fun_forms/components/FilterPanel', () => ({
  FilterPanel: () => <div data-testid="filter-panel-stub">Filters</div>,
}));

import FunManageNewPage, {
  buildCompactTableRow,
  normalizeResponsibleActor,
} from '@/app/pages/user/funmanage_new.page';

const dashboardRow = {
  id: 77,
  fun0Id: 77,
  radicado: '2026-00999',
  fase_label: 'Estudio y Observaciones',
  responsable: 'Curaduria',
  dias_habiles_usados: 6,
  dias_habiles_limite: 15,
  status: 'EN_TERMINO',
  porcentaje_avance: 42,
  isBookmarked: { personal: false, team: false },
};

function renderPage() {
  return render(
    <MemoryRouter>
      <FunManageNewPage translation={{}} globals={{ id: '1' }} swaMsg={{}} breadCrums={{}} />
    </MemoryRouter>
  );
}

describe('FunManageNewPage compact integration', () => {
  beforeEach(() => {
    mockUseAlarmConfig.mockReturnValue({
      config: { scatterThresholds: { warning: 80, critical: 95, overdue: 100 } },
    });

    mockUseDashboard.mockReturnValue({
      kpis: { por_fase: [] },
      chartData: [],
      table: { data: [dashboardRow], total: 1, page: 1, limit: 12 },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUseBookmarks.mockReturnValue({
      bookmarks: [],
      error: null,
      setScope: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('builds compact row values and normalizes responsible actor', () => {
    expect(normalizeResponsibleActor('Curaduria Urbana')).toBe('cur');
    expect(normalizeResponsibleActor('Solicitante')).toBe('sol');
    expect(normalizeResponsibleActor('')).toBe('cur');

    const compactRow = buildCompactTableRow(dashboardRow, {
      personal: true,
      team: false,
      any: true,
      mode: 'personal',
    });

    expect(compactRow.rowId).toBe(77);
    expect(compactRow.currentActor).toBe('cur');
    expect(compactRow.curValue).toBe('6/15');
    expect(compactRow.solValue).toBe('0/0');
    expect(compactRow._bookmarked).toBe(true);
  });

  it('shows bookmark menu only in the approved detail drawer path, not in workspace', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('table-row-0'));

    await waitFor(() => {
      expect(screen.getByLabelText('Detalle del expediente')).toBeInTheDocument();
    });
    expect(screen.getByTestId('detail-bookmark-menu-trigger-77')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Cerrar panel'));

    await waitFor(() => {
      expect(screen.queryByLabelText('Detalle del expediente')).not.toBeInTheDocument();
    });

    await user.click(screen.getByTestId('row-fullscreen-77'));

    await waitFor(() => {
      expect(screen.getByLabelText('Detalle del expediente')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('detail-bookmark-menu-trigger-77')).not.toBeInTheDocument();
  });

  it('toggles bookmark using personal and team scopes from the compact table', async () => {
    const user = userEvent.setup();
    const setScope = vi.fn().mockResolvedValue(undefined);
    const refetch = vi.fn();

    mockUseDashboard.mockReturnValue({
      kpis: { por_fase: [] },
      chartData: [],
      table: { data: [dashboardRow], total: 1, page: 1, limit: 12 },
      loading: false,
      error: null,
      refetch,
    });

    mockUseBookmarks.mockReturnValue({
      bookmarks: [],
      error: null,
      setScope,
    });

    renderPage();

    await user.click(screen.getByTestId('bookmark-menu-trigger-77'));
    await user.click(screen.getByTestId('bookmark-menu-personal-77'));

    await waitFor(() => {
      expect(setScope).toHaveBeenCalledWith(77, 'personal', true);
    });
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });

    setScope.mockClear();
    refetch.mockClear();

    await user.click(screen.getByTestId('bookmark-menu-trigger-77'));
    await user.click(screen.getByTestId('bookmark-menu-team-77'));

    await waitFor(() => {
      expect(setScope).toHaveBeenCalledWith(77, 'team', true);
    });
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });
});
