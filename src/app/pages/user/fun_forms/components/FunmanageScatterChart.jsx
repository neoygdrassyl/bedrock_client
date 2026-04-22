import React, { useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

// ── Fases y orden ─────────────────────────────────────────
const PHASES = [
  'RAD', 'EST', 'NOT_OBS', 'CORR', 'VIA', 'NOT_VIA', 'PAG', 'RES', 'NOT_RES', 'EJEC', 'ENT'
];

const PHASE_LABELS = {
  'RAD': 'Radicación',
  'EST': 'Estudio',
  'NOT_OBS': 'Notificación Obs.',
  'CORR': 'Correcciones',
  'VIA': 'Viabilidad',
  'NOT_VIA': 'Notif. Viabilidad',
  'PAG': 'Pagos',
  'RES': 'Resolución',
  'NOT_RES': 'Notif. Res.',
  'EJEC': 'Ejecutoria',
  'ENT': 'Entrega'
};

const PHASE_TO_NUM = {};
PHASES.forEach((p, i) => { PHASE_TO_NUM[p] = i + 1; });

// ── Tick personalizado para el eje Y (categorías) ─────────────────────────────
function PhaseTick({ x, y, payload }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#6b7280" fontSize={11} fontWeight="600">
        {PHASE_LABELS[PHASES[payload.value - 1]] || payload.value}
      </text>
    </g>
  );
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────
function ScatterTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const d = payload[0]?.payload;
  if (!d) return null;

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
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
        <Icon name="file-alt" size={16} style={{ color: '#64748b' }} className="me-1" />
        {d.radicado ?? '—'}
      </p>
      <p style={{ margin: '5px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Fase:</strong> {d.fase_label ?? '—'}
      </p>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Responsable:</strong> {d.responsable ?? '—'}
      </p>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Días Transcurridos:</strong> <span style={{ fontWeight: 600 }}>{d.dias_habiles_usados ?? 0}</span>
      </p>
      <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
        <strong>Estado:</strong>{' '}
        <span style={{ color: d.fill, fontWeight: 700 }}>
          {d.colorStatus === 'verde' ? 'En término' : d.colorStatus === 'amarillo' ? 'Pronto a vencer' : 'Vencido'}
        </span>
      </p>
    </div>
  );
}

export function FunmanageScatterChart({ data, loading }) {
  const [responsableFilter, setResponsableFilter] = useState('curaduria');

  const plotData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data
      .map(d => {
        const isCuraduria = String(d.responsable || "").toLowerCase().includes("curad");
        const respType = isCuraduria ? 'curaduria' : 'solicitante';
        const phaseNum = PHASE_TO_NUM[d.fase_actual];

        const used = d.dias_habiles_usados || 0;
        const limit = d.dias_habiles_limite || 0;
        const p = limit > 0 ? (used / limit) * 100 : (d.porcentaje_avance || 0);
        
        let colorStatus = 'verde';
        let fill = '#22c55e';
        if (p >= 100) {
          colorStatus = 'rojo';
          fill = '#ef4444';
        } else if (p >= 80) {
          colorStatus = 'amarillo';
          fill = '#eab308';
        }

        return {
          ...d,
          x: used,
          yNum: phaseNum,
          respType,
          colorStatus,
          fill
        };
      })
      .filter(d => d.yNum != null)
      .filter(d => d.respType === responsableFilter);
  }, [data, responsableFilter]);

  const renderChart = (height = 300) => (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 24, bottom: 28, left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number"
          dataKey="x"
          name="Días"
          domain={[0, 'auto']}
          tickCount={8}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          label={{
            value: 'Días transcurridos en fase actual',
            position: 'insideBottom',
            offset: -14,
            fontSize: 11,
            fill: '#9ca3af',
          }}
        />
        <YAxis
          type="number"
          dataKey="yNum"
          name="Fase"
          domain={[0.5, PHASES.length + 0.5]}
          ticks={PHASES.map((_, i) => i + 1)}
          tick={<PhaseTick />}
          width={80}
        />
        <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '4 4', stroke: '#94a3b8' }} />
        
        <Scatter name="Expedientes" data={plotData} shape="circle">
          {plotData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill} 
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center py-4" style={{ minHeight: 300 }}>
        <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        <div className="mt-2 text-muted" style={{ fontSize: 13 }}>Cargando gráfico...</div>
      </div>
    );
  }

  return (
    <div className="w-100 position-relative">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="btn-group" role="group">
          <input type="radio" className="btn-check" name="respRadio" id="respCuraduria" 
            checked={responsableFilter === 'curaduria'} onChange={() => setResponsableFilter('curaduria')} />
          <label className="btn btn-outline-primary btn-sm" htmlFor="respCuraduria">Curaduría</label>

          <input type="radio" className="btn-check" name="respRadio" id="respSolicitante" 
            checked={responsableFilter === 'solicitante'} onChange={() => setResponsableFilter('solicitante')} />
          <label className="btn btn-outline-primary btn-sm" htmlFor="respSolicitante">Solicitante</label>
        </div>
      </div>

      {plotData.length === 0 ? (
        <div className="text-center text-muted py-4"><Icon name="chart-bar" size={16} className="me-2" />Sin datos.</div>
      ) : renderChart(300)}
    </div>
  );
}
