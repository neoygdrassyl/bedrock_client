import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Configuración de los KPIs del dashboard de licencias.
 * statusFilter / phaseFilter → parámetros que se propagan al filtrar.
 * key → identificador interno para el toggle activo.
 */
const KPI_CONFIG = [
  {
    key: 'total',
    dataField: 'total',
    statusFilter: null,
    phaseFilter: null,
    label: 'Total Solicitudes',
    icon: 'fas fa-layer-group',
    colorClass: 'text-blue-600',
    ringClass: 'ring-blue-500',
    description: 'Solicitudes activas en el sistema',
  },
  {
    key: 'en_riesgo',
    dataField: 'en_riesgo',
    statusFilter: 'ALERTA_VENCIMIENTO',
    phaseFilter: null,
    label: 'En Riesgo',
    icon: 'fas fa-exclamation-triangle',
    colorClass: 'text-red-600',
    ringClass: 'ring-red-500',
    description: 'Alerta de vencimiento o vencido',
  },
  {
    key: 'correcciones',
    dataField: 'en_correcciones',
    statusFilter: null,
    phaseFilter: 'CORR',
    label: 'En Correcciones',
    icon: 'fas fa-pencil-alt',
    colorClass: 'text-yellow-600',
    ringClass: 'ring-yellow-500',
    description: 'Esperando respuesta de correcciones',
  },
  {
    key: 'en_expedicion',
    dataField: 'en_expedicion',
    statusFilter: null,
    phaseFilter: null,
    label: 'En Expedición',
    icon: 'fas fa-check-circle',
    colorClass: 'text-green-600',
    ringClass: 'ring-green-500',
    description: 'Resolución, notificación o entrega',
  },
  {
    key: 'en_desistimiento',
    dataField: 'en_desistimiento',
    statusFilter: null,
    phaseFilter: 'DESIST_RES',
    label: 'En Desistimiento',
    icon: 'fas fa-hourglass-half',
    colorClass: 'text-orange-600',
    ringClass: 'ring-orange-500',
    description: 'Proceso de desistimiento en curso',
  },
  {
    key: 'desistidos',
    dataField: 'desistidos',
    statusFilter: null,
    phaseFilter: 'DESIST_CERRADO',
    label: 'Desistidos',
    icon: 'fas fa-times-circle',
    colorClass: 'text-slate-600',
    ringClass: 'ring-slate-500',
    description: 'Cerrados por desistimiento',
  },
];

/**
 * Tarjetas de KPIs para el dashboard de Gestión de Licencias.
 *
 * @param {Object} props
 * @param {{ total, en_riesgo, en_correcciones, en_expedicion, en_desistimiento, desistidos }} props.kpis
 * @param {boolean}       props.loading
 * @param {Function}      props.onFilterChange  - ({ status, phase, key }) → void
 * @param {string|null}   props.activeFilterKey  - Clave del KPI activo (o null)
 */
export function FunDashboardKPIs({ kpis, loading, onFilterChange, activeFilterKey }) {

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-4"
      data-testid="dashboard-kpis"
    >
      {KPI_CONFIG.map(cfg => {
        const value = kpis?.[cfg.dataField];
        const isActive = activeFilterKey === cfg.key;

        return (
          <Card
            key={cfg.key}
            data-testid={`kpi-card-${cfg.key}`}
            role="button"
            tabIndex={0}
            aria-pressed={isActive}
            className={[
              'cursor-pointer select-none transition-all duration-150',
              'hover:shadow-md hover:-translate-y-0.5',
              isActive ? `ring-2 ring-offset-2 ${cfg.ringClass} shadow-md` : '',
            ].join(' ')}
            onClick={() =>
              onFilterChange({
                status: cfg.statusFilter,
                phase: cfg.phaseFilter,
                key: cfg.key,
              })
            }
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFilterChange({
                  status: cfg.statusFilter,
                  phase: cfg.phaseFilter,
                  key: cfg.key,
                });
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {cfg.label}
              </CardTitle>
              <i
                className={`${cfg.icon} ${cfg.colorClass} text-base`}
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${cfg.colorClass}`}>
                {loading ? (
                  <span className="text-muted-foreground text-xl">...</span>
                ) : (
                  value ?? 0
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
