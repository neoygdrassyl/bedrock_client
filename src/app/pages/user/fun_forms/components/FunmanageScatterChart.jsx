import { useState, useEffect, useMemo } from 'react';
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
import FunManageDashboardService from '../../../../services/funmanage_dashboard.service';

// ── Mapeo categoría ↔ eje Y numérico ─────────────────────────────────────────
const CAT_TO_NUM = { I: 1, II: 2, III: 3, IV: 4, OA: 5 };
const NUM_TO_CAT = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'OA' };

// ── Paleta de colores por estado ──────────────────────────────────────────────
const STATUS_COLORS = {
  OPTIMAL: '#22c55e',
  AVERAGE: '#eab308',
  LIMIT:   '#ef4444',
};

const STATUS_LABELS = {
  OPTIMAL: 'Óptimo',
  AVERAGE: 'Promedio',
  LIMIT:   'En Riesgo',
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
  const catLabel    = d.categoria ?? (typeof d.y === 'string' ? d.y : (NUM_TO_CAT[d.y] ?? '—'));

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
        minWidth: 210,
        pointerEvents: 'none',
      }}
    >
      {/* Radicado */}
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
        <i className="fas fa-file-alt me-1" style={{ color: '#64748b' }}></i>
        {d.radicado ?? '—'}
      </p>

      {/* Fase */}
      <p style={{ margin: '5px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Fase:</strong> {d.fase ?? '—'}
      </p>

      {/* Categoría */}
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Categoría:</strong> {catLabel}
      </p>

      {/* Días transcurridos */}
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Días transcurridos:</strong>{' '}
        <span style={{ fontWeight: 600 }}>{d.x ?? '—'}</span>
        {d.maxDays ? (
          <span style={{ color: '#94a3b8' }}> / {d.maxDays} máx.</span>
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

      {/* Trámite / Responsable */}
      {d.tramite && (
        <p style={{ margin: '5px 0 0', fontSize: 11, color: '#94a3b8' }}>
          <i className="fas fa-user me-1"></i>{d.tramite}
        </p>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * Gráfico de dispersión de solicitudes de curaduría.
 *
 * @param {{ dashboardFilter: { status: string|null, phase: string|null } }} props
 */
export function FunmanageScatterChart({ dashboardFilter }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-fetch cuando cambia el filtro activo
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    FunManageDashboardService.getChartData(dashboardFilter)
      .then(res => {
        if (!cancelled) {
          setRawData(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo cargar el gráfico.');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [dashboardFilter]);

  // Transformación + filtrado client-side (doble seguridad si backend no filtra)
  const plotData = useMemo(() => {
    return rawData
      .filter(d => {
        if (dashboardFilter?.status && d.status !== dashboardFilter.status) return false;
        if (dashboardFilter?.phase  && d.fase  !== dashboardFilter.phase)  return false;
        return true;
      })
      .map(d => {
        // Normalizar yNum — soporta y numérico o categórico ("I","II","III","IV")
        let yNum = typeof d.y === 'number'
          ? d.y
          : CAT_TO_NUM[d.y] ?? CAT_TO_NUM[d.categoria] ?? 1;
        return { ...d, yNum };
      });
  }, [rawData, dashboardFilter]);

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

  if (error) {
    return (
      <div
        className="alert alert-warning d-flex align-items-center py-3"
        role="alert"
        data-testid="scatter-chart-error"
      >
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  if (plotData.length === 0) {
    return (
      <div
        className="text-center text-muted py-4"
        data-testid="scatter-chart-empty"
      >
        <i className="fas fa-chart-bar me-2"></i>
        Sin datos para los filtros aplicados.
      </div>
    );
  }

  return (
    <div data-testid="scatter-chart" className="w-100">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          {/* Eje X: días transcurridos */}
          {/* Líneas de referencia: plazos legales por categoría */}
          <ReferenceLine x={20}  stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '20d', position: 'top', fontSize: 9, fill: '#22c55e' }} />
          <ReferenceLine x={45}  stroke="#eab308" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: '45d', position: 'top', fontSize: 9, fill: '#eab308' }} />

          <XAxis
            type="number"
            dataKey="x"
            name="Días"
            domain={[0, 'auto']}
            tickCount={8}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{
              value: 'Días transcurridos',
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
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
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
