import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MDBBreadcrumb, MDBBreadcrumbItem } from '../../components/ui';

// SERVICES
import FunManageDashboardService from '../../services/funmanage_dashboard.service';

// Dashboard components
import { FunDashboardKPIs } from './fun_forms/components/FunDashboardKPIs';
import { FunmanageScatterChart } from './fun_forms/components/FunmanageScatterChart';
import { FunmanageDataTable } from './fun_forms/components/FunmanageDataTable';
import { FunmanagePhaseChart } from './fun_forms/components/FunmanagePhaseChart';
import { FunExpedienteDetail } from './fun_forms/components/FunExpedienteDetail';
import { FunExpedienteWorkspace } from './fun_forms/components/FunExpedienteWorkspace';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// =============================================================================
// Component
// =============================================================================
function FunManageNewPage({ translation, globals, swaMsg, breadCrums }) {
  // ---- Dashboard filter state ----
  const [dashboardFilter, setDashboardFilter] = useState({ status: null, fase: null, desistido: null, causal: null });
  const [kpiActiveFilterKey, setKpiActiveFilterKey] = useState(null);
  const [selectedExpediente, setSelectedExpediente] = useState(null);
  const [workspaceExpediente, setWorkspaceExpediente] = useState(null);

  // ---- Dashboard data (single fetch) ----
  const PAGE_SIZE = 12;
  const [dashData, setDashData]       = useState([]);
  const [dashChartData, setDashChartData] = useState([]);
  const [dashKpis, setDashKpis]       = useState(null);
  const [dashTotal, setDashTotal]     = useState(0);
  const [dashPage, setDashPage]       = useState(1);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError]     = useState(null);
  const [dashSearch, setDashSearch]   = useState('');
  const [dashSorting, setDashSorting] = useState([]);
  const debouncedDashSearch = useDebounce(dashSearch, 450);

  const handleKPIFilterChange = useCallback(({ status, phase, desistido, causal, key }) => {
    setKpiActiveFilterKey(prev => {
      if (prev === key) {
        setDashboardFilter({ status: null, fase: null, desistido: null, causal: null });
        return null;
      }
      setDashboardFilter({
        status: status || null,
        fase: phase || null,
        desistido: desistido || null,
        causal: causal || null,
      });
      return key;
    });
  }, []);

  const clearDashboardFilter = useCallback(() => {
    setDashboardFilter({ status: null, fase: null, desistido: null, causal: null });
    setKpiActiveFilterKey(null);
  }, []);

  const handleOpenWorkspace = useCallback((expediente) => {
    setSelectedExpediente(null);
    setWorkspaceExpediente(expediente);
  }, []);

  // Centralized dashboard fetch
  const fetchDashboard = useCallback(() => {
    setDashLoading(true);
    setDashError(null);

    const sortField = dashSorting[0]?.id || 'fecha_radicacion';
    const sortOrder = dashSorting[0]?.desc !== undefined ? (dashSorting[0].desc ? 'DESC' : 'ASC') : 'DESC';

    FunManageDashboardService.getExpedientes({
      page: dashPage,
      limit: PAGE_SIZE,
      fase: dashboardFilter.fase || undefined,
      status: dashboardFilter.status || undefined,
      desistido: dashboardFilter.desistido || undefined,
      causal: dashboardFilter.causal || undefined,
      search: debouncedDashSearch || undefined,
      sort: sortField,
      order: sortOrder,
    })
      .then(res => {
        const body = res.data;
        setDashKpis(body.kpis || null);
        setDashData(Array.isArray(body.data) ? body.data : []);
        setDashChartData(Array.isArray(body.chartData) ? body.chartData : []);
        setDashTotal(typeof body.total === 'number' ? body.total : 0);
        setDashLoading(false);
      })
      .catch(() => {
        setDashError('No se pudo cargar el dashboard.');
        setDashLoading(false);
      });
  }, [dashPage, dashboardFilter, debouncedDashSearch, dashSorting]);

  const handleCloseWorkspace = useCallback(() => {
    setWorkspaceExpediente(null);
  }, []);

  // Reset page on filter/search/sort change
  useEffect(() => {
    setDashPage(1);
  }, [dashboardFilter, debouncedDashSearch, dashSorting]);

  // Fetch on any change
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="container-fluid p-0">
      {/* ---- Breadcrumb ---- */}
      <div className="col-12 d-flex justify-content-start p-0">
        <MDBBreadcrumb className="mb-0 p-0 ms-0">
          <MDBBreadcrumbItem>
            <Link to="/home">
              <i className="fas fa-home"></i>{' '}
              <label className="text-uppercase">{breadCrums?.bc_01 || 'Inicio'}</label>
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem>
            <Link to="/dashboard">
              <i className="far fa-bookmark"></i>{' '}
              <label className="text-uppercase">{breadCrums?.bc_u1 || 'Panel'}</label>
            </Link>
          </MDBBreadcrumbItem>
          <MDBBreadcrumbItem active>
            <i className="fas fa-layer-group"></i>{' '}
            <label className="text-uppercase">Centro de Operaciones</label>
          </MDBBreadcrumbItem>
        </MDBBreadcrumb>
      </div>

      {/* ---- Title ---- */}
      <div className="row mb-3 d-flex justify-content-center">
        <div className="col-lg-11 col-md-12">
          <h1 className="text-center my-3">CENTRO DE OPERACIONES DE LICENCIAS</h1>
          <hr />
        </div>

        {/* ============================================================= */}
        {/* DASHBOARD: Panel de Control                                  */}
        {/* ============================================================= */}
        <div className="col-12 px-1" data-testid="dashboard-section">

          {/* ─── 1. FILTROS GLOBALES (Barra superior) ─────────────────── */}
          <div
            className="rounded border px-3 py-2 mb-4 d-flex flex-wrap align-items-center gap-3"
            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
            data-testid="filter-bar"
          >
            <span className="text-sm font-semibold text-muted-foreground text-nowrap">
              <i className="fas fa-filter me-1"></i> Filtros:
            </span>

            <Select
              value={dashboardFilter.fase || '__all__'}
              onValueChange={val => {
                setDashboardFilter(f => ({ ...f, fase: val === '__all__' ? null : val, desistido: null, causal: null }));
                setKpiActiveFilterKey(null);
              }}
            >
              <SelectTrigger className="w-48" data-testid="filter-phase">
                <SelectValue placeholder="Fase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas las fases</SelectItem>
                <SelectItem value="RAD">Radicación LDF</SelectItem>
                <SelectItem value="EST">Estudio y Observaciones</SelectItem>
                <SelectItem value="NOT_OBS">Notificación Observaciones</SelectItem>
                <SelectItem value="CORR">Correcciones</SelectItem>
                <SelectItem value="VIA">Revisión y Viabilidad</SelectItem>
                <SelectItem value="NOT_VIA">Notificación Viabilidad</SelectItem>
                <SelectItem value="PAG">Liquidación y Pagos</SelectItem>
                <SelectItem value="RES">Generación de Resolución</SelectItem>
                <SelectItem value="NOT_RES">Notificación Resolución</SelectItem>
                <SelectItem value="EJEC">Ejecutoria y Recurso</SelectItem>
                <SelectItem value="ENT">Entrega de Licencia</SelectItem>
                <SelectItem value="DESIST_RES">Resolución Desistida</SelectItem>
                <SelectItem value="DESIST_NOTIF">Notificación Desistimiento</SelectItem>
                <SelectItem value="DESIST_EJEC">Ejecutoria Desistimiento</SelectItem>
                <SelectItem value="DESIST_CERRADO">Cerrado por Desistimiento</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={dashboardFilter.status || '__all__'}
              onValueChange={val => {
                setDashboardFilter(f => ({ ...f, status: val === '__all__' ? null : val, desistido: null, causal: null }));
                setKpiActiveFilterKey(null);
              }}
            >
              <SelectTrigger className="w-44" data-testid="filter-status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos los estados</SelectItem>
                <SelectItem value="EN_TERMINO">En Término</SelectItem>
                <SelectItem value="PRONTO_A_VENCER">Pronto a Vencer</SelectItem>
                <SelectItem value="ALERTA_VENCIMIENTO">Alerta Vencimiento</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
              </SelectContent>
            </Select>

            {(dashboardFilter.status || dashboardFilter.fase || dashboardFilter.desistido || dashboardFilter.causal) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearDashboardFilter}
                data-testid="filter-clear"
              >
                <i className="fas fa-times me-1"></i> Limpiar filtros
              </Button>
            )}
            {(dashboardFilter.status || dashboardFilter.fase || dashboardFilter.desistido || dashboardFilter.causal) && (
              <span className="text-xs text-muted-foreground ms-auto">
                Activo: {[dashboardFilter.fase, dashboardFilter.status, dashboardFilter.desistido && 'Desistidos', dashboardFilter.causal && `Causal: ${dashboardFilter.causal}`].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>

          {/* ─── 2. TARJETAS DE KPIs ──────────────────────────────────── */}
          <FunDashboardKPIs
            kpis={dashKpis}
            loading={dashLoading}
            onFilterChange={handleKPIFilterChange}
            activeFilterKey={kpiActiveFilterKey}
          />

          {/* ─── 3+4. LAYOUT PRINCIPAL: Tabla (izq) + Gráficos (der) ── */}
          <div className="row g-3 mb-4" data-testid="main-content-row">

            {/* ── Columna izquierda: Tabla de gestión ─────────────────── */}
            <div className="col-12 col-lg-7 col-xl-8" data-testid="table-section">
              <div
                className="rounded border p-3 h-100"
                style={{ borderColor: '#e2e8f0', background: '#fff' }}
              >
                <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
                  <h6
                    className="text-uppercase text-muted mb-0"
                    style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}
                  >
                    <i className="fas fa-table me-2"></i>Vista de Gestión
                  </h6>
                </div>
                <FunmanageDataTable
                  data={dashData}
                  totalRows={dashTotal}
                  page={dashPage}
                  pageSize={PAGE_SIZE}
                  loading={dashLoading}
                  error={dashError}
                  search={dashSearch}
                  onSearchChange={setDashSearch}
                  sorting={dashSorting}
                  onSortingChange={setDashSorting}
                  onPageChange={setDashPage}
                  onRetry={fetchDashboard}
                  onViewDetail={setSelectedExpediente}
                  onOpenWorkspace={handleOpenWorkspace}
                />
              </div>
            </div>

            {/* ── Columna derecha: Gráficos apilados ──────────────────── */}
            <div className="col-12 col-lg-5 col-xl-4 d-flex flex-column gap-3" data-testid="charts-col">

              {/* Scatter: Tiempo por Categoría */}
              <div
                className="rounded border p-3"
                style={{ borderColor: '#e2e8f0', background: '#fff' }}
                data-testid="scatter-section"
              >
                <h6
                  className="text-uppercase text-muted mb-2"
                  style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}
                >
                  <i className="fas fa-circle-nodes me-2"></i>Tiempo por Categoría
                </h6>
                <FunmanageScatterChart data={dashChartData} loading={dashLoading} />
              </div>

              {/* Distribución de Fases */}
              <div
                className="rounded border p-3"
                style={{ borderColor: '#e2e8f0', background: '#fff' }}
                data-testid="phase-section"
              >
                <h6
                  className="text-uppercase text-muted mb-2"
                  style={{ fontSize: '0.78rem', letterSpacing: '0.05em' }}
                >
                  <i className="fas fa-chart-bar me-2"></i>Distribución de Fases
                </h6>
                <FunmanagePhaseChart
                  porFase={dashKpis?.por_fase}
                  chartData={dashChartData}
                  loading={dashLoading}
                  dashboardFilter={dashboardFilter}
                  onPhaseClick={phase => {
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
                    setDashboardFilter(f => ({ ...f, fase: f.fase === faseId ? null : faseId, desistido: null, causal: null }));
                    setKpiActiveFilterKey(null);
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── Panel lateral de detalle ──────────────────────────────── */}
      {selectedExpediente && (
        <FunExpedienteDetail
          expediente={selectedExpediente}
          onClose={() => setSelectedExpediente(null)}
          onOpenWorkspace={handleOpenWorkspace}
        />
      )}

      {/* ── Workspace FUN en pantalla grande ─────────────────────── */}
      {workspaceExpediente && (
        <FunExpedienteWorkspace
          expediente={workspaceExpediente}
          translation={translation}
          globals={globals}
          swaMsg={swaMsg}
          onClose={handleCloseWorkspace}
          onRefresh={fetchDashboard}
        />
      )}
    </div>
  );
}

// =============================================================================
// useDebounce — hook de debounce para búsqueda
// =============================================================================
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default FunManageNewPage;
