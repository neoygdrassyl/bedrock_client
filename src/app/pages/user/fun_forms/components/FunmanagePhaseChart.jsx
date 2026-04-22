import { useMemo } from 'react';
import { Icon } from '@/components/icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Paleta por fase (usa las labels del backend)
const PHASE_COLORS = {
  'Radicación LDF':              '#3b82f6',
  'Estudio y Observaciones':     '#8b5cf6',
  'Notificación Observaciones':  '#a78bfa',
  'Correcciones del Solicitante':'#ef4444',
  'Revisión y Viabilidad':       '#f59e0b',
  'Notificación Viabilidad':     '#fbbf24',
  'Liquidación y Pagos':         '#f97316',
  'Generación de Resolución':    '#10b981',
  'Notificación Resolución':     '#34d399',
  'Ejecutoria y Recurso':        '#6366f1',
  'Entrega de Licencia':         '#14b8a6',
  // Fases de desistimiento
  'Resolución Desistida':        '#be123c',
  'Notificación Desistimiento':  '#e11d48',
  'Ejecutoria Desistimiento':    '#f43f5e',
  'Cerrado por Desistimiento':   '#881337',
  // Otros
  'Sin Iniciar':                 '#94a3b8',
  'Completado':                  '#64748b',
};

// Orden preferido de fases (flujo normal)
const PHASE_ORDER = [
  'Radicación LDF',
  'Estudio y Observaciones',
  'Notificación Observaciones',
  'Correcciones del Solicitante',
  'Revisión y Viabilidad',
  'Notificación Viabilidad',
  'Liquidación y Pagos',
  'Generación de Resolución',
  'Notificación Resolución',
  'Ejecutoria y Recurso',
  'Entrega de Licencia',
];

// Orden de fases desistimiento
const DESIST_PHASE_ORDER = [
  'Resolución Desistida',
  'Notificación Desistimiento',
  'Ejecutoria Desistimiento',
  'Cerrado por Desistimiento',
];

function PhaseTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>{d.phase}</p>
      <p style={{ margin: '2px 0 0', color: '#475569' }}>
        <strong>{d.count}</strong> solicitudes ({d.pct}%)
      </p>
    </div>
  );
}

/**
 * Gráfico de barras horizontales — distribución por fase procesal.
 * Usa chartData (todos los filtrados) para reconstruir distribución,
 * mostrando fases de desistimiento cuando corresponde.
 *
 * @param {{ porFase: Object, chartData: Array, loading: boolean, dashboardFilter: { status: string|null, phase: string|null }, onPhaseClick?: Function }} props
 */
export function FunmanagePhaseChart({ porFase, chartData, loading, dashboardFilter, onPhaseClick }) {
  const computedChartData = useMemo(() => {
    // Si hay chartData, recalcular distribución desde los datos completos
    const source = Array.isArray(chartData) && chartData.length > 0
      ? chartData.reduce((acc, e) => {
          const label = e.fase_label || 'Sin Iniciar';
          acc[label] = (acc[label] || 0) + 1;
          return acc;
        }, {})
      : porFase;

    if (!source || typeof source !== 'object') return [];
    const total = Object.values(source).reduce((a, b) => a + b, 0) || 1;

    // Detectar si hay fases de desistimiento
    const hasDesist = DESIST_PHASE_ORDER.some(p => source[p]);
    const orderList = hasDesist
      ? [...PHASE_ORDER, ...DESIST_PHASE_ORDER]
      : PHASE_ORDER;

    const result = [];
    // Orden fijo primero
    for (const phase of orderList) {
      if (source[phase]) {
        result.push({ phase, count: source[phase], pct: Math.round((source[phase] / total) * 100) });
      }
    }
    // Fases no esperadas
    for (const [phase, count] of Object.entries(source)) {
      if (!orderList.includes(phase)) {
        result.push({ phase, count, pct: Math.round((count / total) * 100) });
      }
    }
    return result;
  }, [porFase, chartData]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
        <span className="text-muted" style={{ fontSize: 13 }}>Cargando…</span>
      </div>
    );
  }

  if (computedChartData.length === 0) {
    return (
      <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
        <Icon name="chart-bar" size={16} className="me-2" />Sin datos disponibles.
      </div>
    );
  }

  return (
    <div data-testid="phase-chart" className="w-100">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={computedChartData}
          layout="vertical"
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis
            type="category"
            dataKey="phase"
            width={110}
            tick={{ fontSize: 12, fill: '#374151' }}
          />
          <Tooltip content={<PhaseTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
            onClick={(data) => onPhaseClick?.(data.phase)}
            cursor="pointer"
          >
            {computedChartData.map((entry, i) => (
              <Cell
                key={i}
                fill={PHASE_COLORS[entry.phase] || '#94a3b8'}
                fillOpacity={dashboardFilter?.phase && dashboardFilter.phase !== entry.phase ? 0.3 : 0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
