import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';

// ── Tarjetas simples ─────────────────────────────────────────────────────────
const SIMPLE_KPIS = [
  {
    key: 'total',
    dataField: 'total',
    label: 'Total Solicitudes',
    icon: 'fas fa-layer-group',
    colorClass: 'text-blue-600',
    ringClass: 'ring-blue-500',
    description: 'Solicitudes activas en el sistema',
    filter: {},
  },
  {
    key: 'en_riesgo',
    dataField: 'en_riesgo',
    label: 'En Riesgo',
    icon: 'fas fa-exclamation-triangle',
    colorClass: 'text-red-600',
    ringClass: 'ring-red-500',
    description: 'Alerta de vencimiento o vencido',
    filter: { status: 'ALERTA_VENCIMIENTO' },
  },
  {
    key: 'correcciones',
    dataField: 'en_correcciones',
    label: 'En Correcciones',
    icon: 'fas fa-pencil-alt',
    colorClass: 'text-yellow-600',
    ringClass: 'ring-yellow-500',
    description: 'Esperando respuesta de correcciones',
    filter: { phase: 'CORR' },
  },
  {
    key: 'en_expedicion',
    dataField: 'en_expedicion',
    label: 'En Expedición',
    icon: 'fas fa-check-circle',
    colorClass: 'text-green-600',
    ringClass: 'ring-green-500',
    description: 'Resolución, notificación o entrega',
    filter: { phase: 'RES,NOT_RES,EJEC,ENT' },
  },
];

/**
 * Tarjetas de KPIs para el dashboard de Gestión de Licencias.
 *
 * @param {Object} props
 * @param {Object}       props.kpis
 * @param {boolean}      props.loading
 * @param {Function}     props.onFilterChange - ({ status?, phase?, desistido?, key }) → void
 * @param {string|null}  props.activeFilterKey
 */
export function FunDashboardKPIs({ kpis, loading, onFilterChange, activeFilterKey }) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-4"
      data-testid="dashboard-kpis"
    >
      {/* Tarjetas simples (Total, En Riesgo, Correcciones, Expedición) */}
      {SIMPLE_KPIS.map(cfg => (
        <SimpleKPICard
          key={cfg.key}
          cfg={cfg}
          value={kpis?.[cfg.dataField]}
          loading={loading}
          isActive={activeFilterKey === cfg.key}
          onFilterChange={onFilterChange}
        />
      ))}

      {/* Tarjeta compuesta: En Estudio */}
      <EstudioKPICard
        kpis={kpis}
        loading={loading}
        activeFilterKey={activeFilterKey}
        onFilterChange={onFilterChange}
      />

      {/* Tarjeta unificada: Desistidos */}
      <DesistidosKPICard
        kpis={kpis}
        loading={loading}
        activeFilterKey={activeFilterKey}
        onFilterChange={onFilterChange}
      />
    </div>
  );
}

// ── Tarjeta KPI simple ───────────────────────────────────────────────────────

function SimpleKPICard({ cfg, value, loading, isActive, onFilterChange }) {
  const handleClick = () => onFilterChange({ ...cfg.filter, key: cfg.key });
  return (
    <Card
      data-testid={`kpi-card-${cfg.key}`}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      className={[
        'cursor-pointer select-none transition-all duration-150',
        'hover:shadow-md hover:-translate-y-0.5',
        isActive ? `ring-2 ring-offset-2 ${cfg.ringClass} shadow-md` : '',
      ].join(' ')}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {cfg.label}
        </CardTitle>
        <Icon name={cfg.icon} size={16} className={cfg.colorClass} aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${cfg.colorClass}`}>
          {loading ? <span className="text-muted-foreground text-xl">...</span> : (value ?? 0)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{cfg.description}</p>
      </CardContent>
    </Card>
  );
}

// ── Tarjeta compuesta: En Estudio ────────────────────────────────────────────

function EstudioKPICard({ kpis, loading, activeFilterKey, onFilterChange }) {
  const total = kpis?.en_estudio ?? 0;
  const revision = kpis?.en_estudio_revision ?? 0;
  const viabilidad = kpis?.en_estudio_viabilidad ?? 0;
  const isMainActive = activeFilterKey === 'en_estudio';
  const isRevActive = activeFilterKey === 'en_estudio_revision';
  const isViaActive = activeFilterKey === 'en_estudio_viabilidad';
  const isAnyActive = isMainActive || isRevActive || isViaActive;

  return (
    <Card
      data-testid="kpi-card-en_estudio"
      role="button"
      tabIndex={0}
      aria-pressed={isMainActive}
      className={[
        'cursor-pointer select-none transition-all duration-150',
        'hover:shadow-md hover:-translate-y-0.5',
        isAnyActive ? 'ring-2 ring-offset-2 ring-indigo-500 shadow-md' : '',
      ].join(' ')}
      onClick={() => onFilterChange({ phase: 'EST,NOT_OBS,VIA,NOT_VIA', key: 'en_estudio' })}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFilterChange({ phase: 'EST,NOT_OBS,VIA,NOT_VIA', key: 'en_estudio' });
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          En Estudio
        </CardTitle>
        <Icon name="search" size={16} className="text-indigo-600" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-indigo-600">
          {loading ? <span className="text-muted-foreground text-xl">...</span> : total}
        </div>
        <div className="d-flex gap-2 mt-2">
          <SubCard
            label="Estudio y Obs."
            value={revision}
            loading={loading}
            isActive={isRevActive}
            onClick={e => {
              e.stopPropagation();
              onFilterChange({ phase: 'EST,NOT_OBS', key: 'en_estudio_revision' });
            }}
            color="#6366f1"
          />
          <SubCard
            label="Viabilidad"
            value={viabilidad}
            loading={loading}
            isActive={isViaActive}
            onClick={e => {
              e.stopPropagation();
              onFilterChange({ phase: 'VIA,NOT_VIA', key: 'en_estudio_viabilidad' });
            }}
            color="#818cf8"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Tarjeta unificada: Desistidos ────────────────────────────────────────────

function DesistidosKPICard({ kpis, loading, activeFilterKey, onFilterChange }) {
  const total = kpis?.desistidos_total ?? 0;
  const porCausal = kpis?.por_causal || {};
  const causales = Object.entries(porCausal).sort((a, b) => b[1] - a[1]);
  const isActive = activeFilterKey === 'desistidos';

  return (
    <Card
      data-testid="kpi-card-desistidos"
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      className={[
        'cursor-pointer select-none transition-all duration-150',
        'hover:shadow-md hover:-translate-y-0.5',
        isActive ? 'ring-2 ring-offset-2 ring-rose-500 shadow-md' : '',
      ].join(' ')}
      onClick={() => onFilterChange({ desistido: true, key: 'desistidos' })}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFilterChange({ desistido: true, key: 'desistidos' });
        }
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Desistidos
        </CardTitle>
        <Icon name="times-circle" size={16} className="text-rose-600" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-rose-600">
          {loading ? <span className="text-muted-foreground text-xl">...</span> : total}
        </div>
        {causales.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mt-2">
            {causales.map(([causal, count]) => (
              <span
                key={causal}
                role="button"
                tabIndex={0}
                className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-0 text-xs cursor-pointer transition-all hover:shadow-sm"
                style={{
                  backgroundColor: '#fff1f2',
                  color: '#9f1239',
                  border: '1px solid #fecdd3',
                  fontSize: '0.65rem',
                  lineHeight: '1.6',
                }}
                onClick={e => {
                  e.stopPropagation();
                  onFilterChange({ desistido: true, causal, key: `desistidos_${causal}` });
                }}
                title={`Filtrar por causal: ${causal}`}
              >
                {causal} <strong>{count}</strong>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">Todos los procesos de desistimiento</p>
      </CardContent>
    </Card>
  );
}

// ── Sub-tarjeta para En Estudio ──────────────────────────────────────────────

function SubCard({ label, value, loading, isActive, onClick, color }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        'flex-1 rounded px-2 py-1 text-center cursor-pointer transition-all',
        'hover:shadow-sm',
        isActive ? 'ring-2 ring-offset-1' : '',
      ].join(' ')}
      style={{
        backgroundColor: `${color}11`,
        border: `1px solid ${color}33`,
        ...(isActive ? { ringColor: color } : {}),
      }}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } }}
    >
      <span className="d-block text-xs text-muted-foreground" style={{ fontSize: '0.65rem' }}>
        {label}
      </span>
      <span className="d-block font-bold text-sm" style={{ color }}>
        {loading ? '...' : value}
      </span>
    </div>
  );
}
