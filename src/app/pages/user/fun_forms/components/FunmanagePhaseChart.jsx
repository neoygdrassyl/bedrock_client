import { useState, useEffect, useMemo } from 'react';
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
import FunManageDashboardService from '../../../../services/funmanage_dashboard.service';

// Paleta por fase
const PHASE_COLORS = {
  'Radicación':     '#3b82f6',
  'Revisión Legal': '#8b5cf6',
  'Informes':       '#f59e0b',
  'Correcciones':   '#ef4444',
  'Expedición':     '#10b981',
  'Resolución':     '#6366f1',
};

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
 *
 * @param {{ dashboardFilter: { status: string|null, phase: string|null }, onPhaseClick?: Function }} props
 */
export function FunmanagePhaseChart({ dashboardFilter, onPhaseClick }) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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

  const chartData = useMemo(() => {
    const map = {};
    for (const d of rawData) {
      const phase = d.fase || 'Sin fase';
      map[phase] = (map[phase] || 0) + 1;
    }
    const total = rawData.length || 1;

    // Orden fijo
    const order = ['Radicación', 'Revisión Legal', 'Informes', 'Correcciones', 'Expedición', 'Resolución'];
    const result = [];
    for (const phase of order) {
      if (map[phase]) {
        result.push({ phase, count: map[phase], pct: Math.round((map[phase] / total) * 100) });
        delete map[phase];
      }
    }
    // Fases no esperadas
    for (const [phase, count] of Object.entries(map)) {
      result.push({ phase, count, pct: Math.round((count / total) * 100) });
    }
    return result;
  }, [rawData]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
        <span className="text-muted" style={{ fontSize: 13 }}>Cargando…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning py-2" role="alert" style={{ fontSize: 13 }}>
        <i className="fas fa-exclamation-triangle me-2"></i>{error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
        <i className="fas fa-chart-bar me-2"></i>Sin datos disponibles.
      </div>
    );
  }

  return (
    <div data-testid="phase-chart" className="w-100">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
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
            {chartData.map((entry, i) => (
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
