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

export function normalizeResponsibleActor(responsable) {
  const normalized = String(responsable || '').trim().toLowerCase();
  if (normalized.includes('curad')) return 'cur';
  if (normalized.includes('sol')) return 'sol';
  return 'cur';
}

function getExpedienteId(row) {
  return row?.fun0Id ?? row?.fun_0_id ?? row?.id ?? null;
}

function createBookmarkState(state = {}) {
  const personal = Boolean(state.personal);
  const team = Boolean(state.team);

  return {
    personal,
    team,
    any: personal || team,
    mode: personal && team ? 'both' : personal ? 'personal' : team ? 'team' : 'none',
  };
}

function mergeBookmarkState(...states) {
  return createBookmarkState(
    states.reduce(
      (acc, state) => ({
        personal: acc.personal || Boolean(state?.personal),
        team: acc.team || Boolean(state?.team),
      }),
      { personal: false, team: false }
    )
  );
}

export function buildCompactTableRow(row, bookmarkState) {
  const rowId = row.fun0Id ?? row.fun_0_id ?? row.id;
  const currentActor = normalizeResponsibleActor(row.responsable);
  const usedDays = Number.isFinite(row.dias_habiles_usados) ? row.dias_habiles_usados : 0;
  const limitDays = Number.isFinite(row.dias_habiles_limite) ? row.dias_habiles_limite : 0;
  const actorValue = `${usedDays}/${limitDays}`;

  return {
    ...row,
    rowId,
    phaseText: row.fase_label ?? 'Sin fase',
    phaseTooltip: row.fase_label ?? 'Sin fase',
    currentActor,
    curValue: currentActor === 'cur' ? actorValue : '0/0',
    solValue: currentActor === 'sol' ? actorValue : '0/0',
    _bookmarkState: bookmarkState,
    _bookmarked: bookmarkState.any,
  };
}

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
  const {
    bookmarks,
    error: bookmarkError,
    setScope: setBookmarkScope,
  } = useBookmarks();

  const scatterThresholds = useMemo(() => {
    const s = alarmConfig?.scatterThresholds;
    return {
      warning: Number.isFinite(s?.warning) ? s.warning : 80,
      critical: Number.isFinite(s?.critical) ? s.critical : 95,
      overdue: Number.isFinite(s?.overdue) ? s.overdue : 100,
    };
  }, [alarmConfig]);

  const bookmarkStateById = useMemo(() => {
    const nextState = new Map();

    (bookmarks || []).forEach((bookmark) => {
      const rowId = getExpedienteId(bookmark);
      if (!rowId) return;

      const current = nextState.get(rowId) || createBookmarkState();
      nextState.set(
        rowId,
        createBookmarkState({
          personal: current.personal || bookmark.scope === 'personal' || bookmark.scope === 'user',
          team: current.team || bookmark.scope === 'team',
        })
      );
    });

    return nextState;
  }, [bookmarks]);

  const getBookmarkState = useCallback(
    (row) => {
      const rowId = getExpedienteId(row);
      const serverState = createBookmarkState(row?.isBookmarked);
      const clientState = rowId ? bookmarkStateById.get(rowId) : null;
      return mergeBookmarkState(serverState, clientState);
    },
    [bookmarkStateById]
  );

  const handleKPIFilterChange = useCallback(({ status, phase, desistido, causal, key, subfiltro, bookmarked, vecinos }) => {
    setKpiActiveFilterKey((prev) => {
      if (prev === key) {
        setFilters((f) => mergeFilters(f, {
          status: null,
          fase: null,
          phase: null,
          desistido: null,
          causal: null,
          subfiltro: null,
          bookmarked: null,
          vecinos: null,
          vecinosState: null,
        }));
        return null;
      }
      setFilters((f) =>
        mergeFilters(f, {
          status: status || null,
          phase: phase || null,
          fase: null,
          desistido: desistido || null,
          causal: causal || null,
          subfiltro: subfiltro || null,
          bookmarked: bookmarked || null,
          vecinos: vecinos || null,
          vecinosState: vecinos || null,
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

  const handleToggleBookmarkScope = useCallback(
    async (row, scope, shouldMark) => {
      const id = getExpedienteId(row);
      if (!id) return;

      await setBookmarkScope(id, scope, shouldMark);
      await refetch();
    },
    [refetch, setBookmarkScope]
  );

  const tableData = useMemo(
    () =>
      (table.data || []).map((row) => buildCompactTableRow(row, getBookmarkState(row))),
    [table.data, getBookmarkState]
  );

  const selectedBookmarkState = useMemo(
    () => getBookmarkState(selectedExpediente),
    [getBookmarkState, selectedExpediente]
  );

  const tableErrorMessage = error
    ? 'No se pudo cargar el dashboard.'
    : bookmarkError
      ? 'No se pudieron sincronizar los destacados.'
      : null;

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
                  error={tableErrorMessage}
                  search={searchInput}
                  onSearchChange={setSearchInput}
                  sorting={sortingState}
                  onSortingChange={handleSortingChange}
                  onPageChange={handlePageChange}
                  onRetry={refetch}
                  onViewDetail={setSelectedExpediente}
                  onOpenWorkspace={handleOpenWorkspace}
                  onToggleBookmarkScope={handleToggleBookmarkScope}
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
          bookmarkState={selectedBookmarkState}
          bookmarkError={bookmarkError}
          onToggleBookmarkScope={handleToggleBookmarkScope}
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
