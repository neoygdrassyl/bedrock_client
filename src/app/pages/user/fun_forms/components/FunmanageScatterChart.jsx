import { useMemo } from 'react';
import { Icon } from '@/components/icon';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ── Mapeo categoría ↔ eje Y numérico ─────────────────────────────────────────
const CAT_TO_NUM = { I: 1, II: 2, III: 3, IV: 4 };
const NUM_TO_CAT = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

// ── Paleta de colores por estado (nuevos nombres) ─────────────────────────────
const STATUS_COLORS = {
  EN_TERMINO:          '#22c55e',
  PRONTO_A_VENCER:     '#eab308',
  ALERTA_VENCIMIENTO:  '#ef4444',
  VENCIDO:             '#991b1b',
};

const STATUS_LABELS = {
  EN_TERMINO:          'En Término',
  PRONTO_A_VENCER:     'Pronto a Vencer',
  ALERTA_VENCIMIENTO:  'Alerta Vencimiento',
  VENCIDO:             'Vencido',
};

// ── Tick personalizado para el eje Y (categorías) ─────────────────────────────
function CategoryTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#6b7280"
        fontSize={13}
        fontWeight="600"
      >
        {NUM_TO_CAT[payload.value] ?? payload.value}
      </text>
    </g>
  );
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const d = payload[0]?.payload;
  if (!d) return null;

  const statusColor = STATUS_COLORS[d.status] ?? '#94a3b8';
  const statusLabel = STATUS_LABELS[d.status] ?? d.status ?? '—';
  const pctDisplay = d.x != null ? `${d.x}%` : '—';

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
        minWidth: 230,
        pointerEvents: 'none',
      }}
    >
      {/* Radicado */}
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
        <Icon name="file-alt" size={16} style={{ color: '#64748b' }} />
        {d.radicado ?? '—'}
      </p>

      {/* Fase */}
      <p style={{ margin: '5px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Fase:</strong> {d.fase_label ?? '—'}
      </p>

      {/* Categoría */}
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Categoría:</strong> {d.categoria ?? '—'}
      </p>

      {/* % del tiempo usado */}
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Tiempo usado:</strong>{' '}
        <span style={{ fontWeight: 600, color: statusColor }}>{pctDisplay}</span>
      </p>

      {/* Días hábiles detalle */}
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Días:</strong>{' '}
        <span style={{ fontWeight: 600 }}>{d.dias_habiles_usados ?? '—'}</span>
        {d.dias_habiles_limite ? (
          <span style={{ color: '#94a3b8' }}> / {d.dias_habiles_limite} días límite</span>
        ) : null}
      </p>

      {/* Estado (badge) */}
      <p style={{ margin: '6px 0 0' }}>
        <span
          style={{
            backgroundColor: statusColor,
            color: '#fff',
            borderRadius: 4,
            padding: '2px 9px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {statusLabel}
        </span>
      </p>

      {/* Responsable */}
      {d.responsable && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: '#94a3b8' }}>
          <Icon name="user" size={16} className="me-1" />{d.responsable}
        </p>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
// Umbrales por defecto (fallback si no hay configuración de alarmas cargada).
// La verdad operativa vive en el panel admin (alarm_config.configJson.scatterThresholds).
const DEFAULT_THRESHOLDS = { warning: 80, critical: 95, overdue: 100 };

/**
 * Gráfico de dispersión de solicitudes de curaduría.
 *
 * @param {{
 *   data: Array,
 *   loading: boolean,
 *   thresholds?: { warning?: number, critical?: number, overdue?: number }
 * }} props
 */
export function FunmanageScatterChart({ data, loading, thresholds }) {
  const t = {
    warning:  Number.isFinite(thresholds?.warning)  ? thresholds.warning  : DEFAULT_THRESHOLDS.warning,
    critical: Number.isFinite(thresholds?.critical) ? thresholds.critical : DEFAULT_THRESHOLDS.critical,
    overdue:  Number.isFinite(thresholds?.overdue)  ? thresholds.overdue  : DEFAULT_THRESHOLDS.overdue,
  };
  // Transformar datos del backend al formato del scatter chart
  // X-axis: % del tiempo usado (dias_usados / dias_limite * 100)
  const plotData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(d => ({
      ...d,
      x: d.dias_habiles_limite > 0
        ? Math.round((d.dias_habiles_usados / d.dias_habiles_limite) * 100)
        : 0,
      yNum: CAT_TO_NUM[d.categoria] ?? 1,
    }));
  }, [data]);

  // Segmentar por estado para asignar color uniforme por serie
  const byStatus = status => plotData.filter(d => d.status === status);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center gap-3 py-4"
        style={{ minHeight: 300 }}
        data-testid="scatter-chart-loading"
      >
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Cargando gráfico…</span>
          </div>
          <div className="ms-3">
            <div className="fw-semibold text-slate-700">Cargando gráfico…</div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              Preparando la dispersión por categoría y sus divisiones.
            </div>
          </div>
        </div>

        <div
          className="progress overflow-hidden"
          style={{ height: 10, backgroundColor: '#e2e8f0' }}
          aria-label="Progreso de carga del gráfico"
        >
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-info"
            role="progressbar"
            style={{ width: '100%' }}
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="d-flex justify-content-between text-muted" style={{ fontSize: 12 }}>
          <span>Consultando datos del dashboard</span>
          <span>Renderizando puntos</span>
        </div>
      </div>
    );
  }

  if (plotData.length === 0) {
    return (
      <div
        className="text-center text-muted py-4"
        data-testid="scatter-chart-empty"
      >
        <Icon name="chart-bar" size={16} className="me-2" />
        Sin datos para los filtros aplicados.
      </div>
    );
  }

  return (
    <div data-testid="scatter-chart" className="w-100">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          {/* Líneas de referencia: umbrales de semáforo (configurables via panel admin) */}
          <ReferenceLine x={t.warning}  stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${t.warning}%`,  position: 'top', fontSize: 9, fill: '#eab308' }} />
          <ReferenceLine x={t.critical} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${t.critical}%`, position: 'top', fontSize: 9, fill: '#ef4444' }} />
          <ReferenceLine x={t.overdue}  stroke="#991b1b" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `${t.overdue}%`,  position: 'top', fontSize: 9, fill: '#991b1b' }} />

          <XAxis
            type="number"
            dataKey="x"
            name="% Tiempo"
            domain={[0, 'auto']}
            tickCount={8}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            unit="%"
            label={{
              value: '% Tiempo usado',
              position: 'insideBottom',
              offset: -14,
              fontSize: 11,
              fill: '#9ca3af',
            }}
          />

          {/* Eje Y: categorías de curadurías */}
          <YAxis
            type="number"
            dataKey="yNum"
            name="Categoría"
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            tick={<CategoryTick />}
            width={38}
          />

          <Tooltip
            content={<ScatterTooltip />}
            cursor={{ strokeDasharray: '4 4', stroke: '#94a3b8' }}
          />

          <Legend
            verticalAlign="top"
            formatter={value => STATUS_LABELS[value] ?? value}
            wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          />

          {/* Una serie por estado → color uniforme */}
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <Scatter
              key={status}
              name={status}
              data={byStatus(status)}
              fill={color}
              fillOpacity={0.75}
              stroke={color}
              strokeWidth={1}
              shape="circle"
              r={5}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
