import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FunManageDashboardService from '@/app/services/funmanage_dashboard.service';

/**
 * Configuración de los 4 KPIs del dashboard de licencias.
 * statusFilter / phaseFilter → parámetros que se envían al grid/chart al hacer clic.
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
    statusFilter: 'LIMIT',
    phaseFilter: null,
    label: 'En Riesgo',
    icon: 'fas fa-exclamation-triangle',
    colorClass: 'text-red-600',
    ringClass: 'ring-red-500',
    description: 'Superan el 80% del plazo legal',
  },
  {
    key: 'correcciones',
    dataField: 'correcciones',
    statusFilter: null,
    phaseFilter: 'Correcciones',
    label: 'En Correcciones',
    icon: 'fas fa-pencil-alt',
    colorClass: 'text-yellow-600',
    ringClass: 'ring-yellow-500',
    description: 'Esperando respuesta de correcciones',
  },
  {
    key: 'listos',
    dataField: 'listos',
    statusFilter: null,
    phaseFilter: 'Expedición',
    label: 'Listos para Viabilidad',
    icon: 'fas fa-check-circle',
    colorClass: 'text-green-600',
    ringClass: 'ring-green-500',
    description: 'Dentro del plazo óptimo',
  },
];

/**
 * Tarjetas de KPIs para el dashboard de Gestión de Licencias.
 *
 * @param {Object} props
 * @param {Function} props.onFilterChange  - Callback: ({ status, phase, key }) → void
 * @param {string|null} props.activeFilterKey - Clave del KPI activo (o null = sin filtro)
 */
export function FunDashboardKPIs({ onFilterChange, activeFilterKey }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    FunManageDashboardService.getKPIs()
      .then(r => setKpis(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4"
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
              {error ? (
                <div className="text-2xl font-bold text-muted-foreground">—</div>
              ) : (
                <div className={`text-3xl font-bold ${cfg.colorClass}`}>
                  {loading ? (
                    <span className="text-muted-foreground text-xl">...</span>
                  ) : (
                    value ?? 0
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
