import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('muestra Gestión Nueva como desarrollo sin renderizar información operativa', () => {
    renderPage();

    expect(screen.getByTestId('gestion-nueva-development-state')).toBeInTheDocument();
    expect(screen.getByText('Gestión Licencias Nuevo está en desarrollo')).toBeInTheDocument();
    expect(screen.getByText(/no muestra expedientes, KPI, gráficos ni información/i)).toBeInTheDocument();
    expect(screen.queryByTestId('kpis-stub')).not.toBeInTheDocument();
    expect(screen.queryByTestId('scatter-stub')).not.toBeInTheDocument();
    expect(mockUseDashboard).not.toHaveBeenCalled();
    expect(mockUseBookmarks).not.toHaveBeenCalled();
  });
});
