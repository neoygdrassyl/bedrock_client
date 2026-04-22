import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { FunDashboardKPIs } from './fun_forms/components/FunDashboardKPIs';
import { FunmanageScatterChart } from './fun_forms/components/FunmanageScatterChart';
import { FunmanageDataTable } from './fun_forms/components/FunmanageDataTable';
import { FunmanagePhaseChart } from './fun_forms/components/FunmanagePhaseChart';
import { FunExpedienteDetail } from './fun_forms/components/FunExpedienteDetail';
import { FunExpedienteWorkspace } from './fun_forms/components/FunExpedienteWorkspace';
import { FilterPanel } from './fun_forms/components/FilterPanel';
import { useDashboard } from './fun_forms/hooks/useDashboard';
import { useAlarmConfig } from './fun_forms/hooks/useAlarmConfig';
import { useBookmarks } from './fun_forms/hooks/useBookmarks';
import { DEFAULT_FILTERS, mergeFilters, hasActiveFilters } from './fun_forms/utils/filters';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function FunManageNewPage({ translation, globals, swaMsg, breadCrums }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 450);

  const [kpiActiveFilterKey, setKpiActiveFilterKey] = useState(null);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [workspaceExpediente, setWorkspaceExpediente] = useState(null);

  useEffect(() => {
    setFilters((prev) => (prev.search === debouncedSearch ? prev : mergeFilters(prev, { search: debouncedSearch })));
  }, [debouncedSearch]);

  const { kpis, chartData, table, loading, error, refetch } = useDashboard(filters);
  const { config: alarmConfig } = useAlarmConfig();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();

  const scatterThresholds = useMemo(() => {
    const s = alarmConfig?.scatterThresholds;
    return {
      warning: Number.isFinite(s?.warning) ? s.warning : 80,
      critical: Number.isFinite(s?.critical) ? s.critical : 95,
      overdue: Number.isFinite(s?.overdue) ? s.overdue : 100,
    };
  }, [alarmConfig]);

  const bookmarkedSet = useMemo(
    () => new Set((bookmarks || []).map((b) => b.fun0Id ?? b.fun_0_id ?? b.id)),
    [bookmarks]
  );

  const handleKPIFilterChange = useCallback(({ status, phase, desistido, causal, key }) => {
    setKpiActiveFilterKey((prev) => {
      if (prev === key) {
        setFilters((f) => mergeFilters(f, { status: null, fase: null, phase: null, desistido: null, causal: null }));
        return null;
      }
      setFilters((f) =>
        mergeFilters(f, {
          status: status || null,
          phase: phase || null,
          fase: null,
          desistido: desistido || null,
          causal: causal || null,
        })
      );
      return key;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput('');
    setKpiActiveFilterKey(null);
  }, []);

  const handleOpenWorkspace = useCallback((expediente) => {
    setSelectedExpediente(null);
    setWorkspaceExpediente(expediente);
  }, []);

  const handleCloseWorkspace = useCallback(() => {
    setWorkspaceExpediente(null);
  }, []);

  const handleSortingChange = useCallback((updater) => {
    const next = typeof updater === 'function' ? updater([]) : updater;
    const sortField = next?.[0]?.id || DEFAULT_FILTERS.sort;
    const sortOrder = next?.[0]?.desc !== undefined ? (next[0].desc ? 'DESC' : 'ASC') : 'DESC';
    setFilters((f) => mergeFilters(f, { sort: sortField, order: sortOrder }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters((f) => ({ ...f, page }));
  }, []);

  const handleToggleBookmark = useCallback(
    (row) => {
      const id = row.fun0Id ?? row.fun_0_id ?? row.id;
      if (!id) return;
      toggleBookmark(id, 'user', bookmarkedSet.has(id)).then(() => refetch());
    },
    [toggleBookmark, bookmarkedSet, refetch]
  );

  const tableData = useMemo(
    () =>
      (table.data || []).map((row) => ({
        ...row,
        _bookmarked: bookmarkedSet.has(row.fun0Id ?? row.fun_0_id ?? row.id),
      })),
    [table.data, bookmarkedSet]
  );

  const sortingState = useMemo(() => {
    if (!filters.sort || filters.sort === DEFAULT_FILTERS.sort) return [];
    return [{ id: filters.sort, desc: filters.order !== 'ASC' }];
  }, [filters.sort, filters.order]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Centro de Operaciones de Licencias</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión y seguimiento del flujo de licencias urbanísticas</p>
      </div>

      <div className="row mb-3 d-flex justify-content-center">
        <div className="col-lg-11 col-md-12">
          <div className="d-flex justify-content-end my-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/legal-flow-guide', '_blank')}
              title="Abrir guía del flujo jurídico en nueva ventana"
            >
              <Icon name="project-diagram" size={16} className="me-1" />
              Ver Guía Legal
            </Button>
          </div>
        </div>

        <div className="col-12 px-1" data-testid="dashboard-section">
          <FilterPanel 
            filters={filters} 
            setFilters={setFilters} 
            clearAllFilters={clearAllFilters} 
            setKpiActiveFilterKey={setKpiActiveFilterKey} 
          />

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Icon name="arrow-left" size={14} className="shrink-0" />
            <a href="/licencias/gestion" className="hover:text-foreground hover:underline underline-offset-2 transition-colors">
              Ver vista clásica
            </a>
          </div>
          <FunDashboardKPIs
            kpis={kpis}
            loading={loading}
            onFilterChange={handleKPIFilterChange}
            activeFilterKey={kpiActiveFilterKey}
          />

          <div className="row g-3 mb-4" data-testid="main-content-row">
            <div className="col-12 col-lg-7 col-xl-8" data-testid="table-section">
              <div className="rounded border p-3 h-100" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                  <h6 className="text-muted mb-0" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                    <Icon name="table" size={16} className="me-2" />Vista de Gestión
                  </h6>
                </div>
                <FunmanageDataTable
                  data={tableData}
                  totalRows={table.total}
                  page={filters.page}
                  pageSize={filters.limit}
                  loading={loading}
                  error={error ? 'No se pudo cargar el dashboard.' : null}
                  search={searchInput}
                  onSearchChange={setSearchInput}
                  sorting={sortingState}
                  onSortingChange={handleSortingChange}
                  onPageChange={handlePageChange}
                  onRetry={refetch}
                  onViewDetail={setSelectedExpediente}
                  onOpenWorkspace={handleOpenWorkspace}
                  onToggleBookmark={handleToggleBookmark}
                />
              </div>
            </div>

            <div className="col-12 col-lg-5 col-xl-4 d-flex flex-column gap-3" data-testid="charts-col">
              <div
                className="rounded border p-3"
                style={{ borderColor: '#e2e8f0', background: '#fff' }}
                data-testid="scatter-section"
              >
                <h6 className="text-muted mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                  <Icon name="circle-nodes" size={16} className="me-2" />Tiempo por Categoría
                </h6>
                <FunmanageScatterChart data={chartData} loading={loading} thresholds={scatterThresholds} />
              </div>

              <div
                className="rounded border p-3"
                style={{ borderColor: '#e2e8f0', background: '#fff' }}
                data-testid="phase-section"
              >
                <h6 className="text-muted mb-2" style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}>
                  <Icon name="chart-bar" size={16} className="me-2" />Distribución de Fases
                </h6>
                <FunmanagePhaseChart
                  porFase={kpis?.por_fase}
                  chartData={chartData}
                  loading={loading}
                  dashboardFilter={{ status: filters.status, fase: filters.fase || filters.phase, desistido: filters.desistido, causal: filters.causal }}
                  onPhaseClick={(phase) => {
                    const LABEL_TO_ID = {
                      'Radicación LDF': 'RAD', 'Estudio y Observaciones': 'EST',
                      'Notificación Observaciones': 'NOT_OBS', 'Correcciones del Solicitante': 'CORR',
                      'Revisión y Viabilidad': 'VIA', 'Notificación Viabilidad': 'NOT_VIA',
                      'Liquidación y Pagos': 'PAG', 'Generación de Resolución': 'RES',
                      'Notificación Resolución': 'NOT_RES', 'Ejecutoria y Recurso': 'EJEC',
                      'Entrega de Licencia': 'ENT',
                      'Resolución Desistida': 'DESIST_RES', 'Notificación Desistimiento': 'DESIST_NOTIF',
                      'Ejecutoria Desistimiento': 'DESIST_EJEC', 'Cerrado por Desistimiento': 'DESIST_CERRADO',
                    };
                    const faseId = LABEL_TO_ID[phase] || null;
                    setFilters((f) => mergeFilters(f, { 
                      phase: f.phase === faseId ? null : faseId, 
                      fase: null,
                      desistido: null, 
                      causal: null 
                    }));
                    setKpiActiveFilterKey(null);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedExpediente && (
        <FunExpedienteDetail
          expediente={selectedExpediente}
          onClose={() => setSelectedExpediente(null)}
          onOpenWorkspace={handleOpenWorkspace}
        />
      )}

      {workspaceExpediente && (
        <FunExpedienteWorkspace
          expediente={workspaceExpediente}
          translation={translation}
          globals={globals}
          swaMsg={swaMsg}
          onClose={handleCloseWorkspace}
          onRefresh={refetch}
        />
      )}
    </div>
  );
}

export default FunManageNewPage;
