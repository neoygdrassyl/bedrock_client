import React, { useMemo, useState, useRef } from 'react';
import { PHASE_COLORS, PHASE_LABELS } from './dashboard.styles';
import { ScatterPanel, ScatterTitle, ScatterLegend, LegendItem, ScatterTooltip } from './dashboard.styles';

const PHASE_ORDER = ['radicacion', 'lydf', 'acta', 'viabilidad', 'expedicion', 'archivado'];
const MARGIN = { top: 24, right: 40, bottom: 32, left: 90 };
const DANGER_THRESHOLD = 30;
const DOT_RADIUS = 5;

/**
 * SVG scatter chart: Y-axis = phase, X-axis = business days elapsed.
 * Dots colored by phase, red outline for alarm items.
 * Danger zone past threshold (red tint).
 */
export function PhaseScatterChart({ projects, onDotClick }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 420 });

  // Observe container size
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const chartW = dimensions.width - MARGIN.left - MARGIN.right;
  const chartH = dimensions.height - MARGIN.top - MARGIN.bottom;

  // X scale: business days (0 to max across projects, at least DANGER_THRESHOLD+10)
  const maxDays = useMemo(() => {
    let m = DANGER_THRESHOLD + 10;
    for (const p of projects) {
      if (p.businessDays > m) m = p.businessDays;
    }
    return m + 5;
  }, [projects]);

  const xScale = (days) => MARGIN.left + (days / maxDays) * chartW;
  const yPhaseCenter = (phaseKey) => {
    const idx = PHASE_ORDER.indexOf(phaseKey);
    if (idx < 0) return MARGIN.top;
    const step = chartH / PHASE_ORDER.length;
    return MARGIN.top + step * idx + step / 2;
  };

  // Jitter dots in same phase to avoid overlap
  const dots = useMemo(() => {
    const phaseGroups = {};
    for (const p of projects) {
      const key = p.phaseKey === 'desistido' ? 'archivado' : p.phaseKey;
      if (!phaseGroups[key]) phaseGroups[key] = [];
      phaseGroups[key].push(p);
    }
    const result = [];
    for (const [key, items] of Object.entries(phaseGroups)) {
      items.forEach((p, i) => {
        const jitter = (i % 5 - 2) * 4;
        result.push({
          ...p,
          cx: xScale(p.businessDays),
          cy: yPhaseCenter(key) + jitter,
          phaseDisplay: key,
        });
      });
    }
    return result;
  }, [projects, maxDays, chartW, chartH]);

  // X-axis ticks
  const xTicks = useMemo(() => {
    const step = maxDays <= 50 ? 5 : maxDays <= 100 ? 10 : 20;
    const ticks = [];
    for (let v = 0; v <= maxDays; v += step) ticks.push(v);
    return ticks;
  }, [maxDays]);

  const handleMouseEnter = (e, dot) => {
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left + 12,
      y: e.clientY - rect.top - 8,
      project: dot,
    });
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <ScatterPanel ref={containerRef} style={{ position: 'relative' }}>
      <ScatterTitle>
        <h3>Seguimiento por Fase</h3>
      </ScatterTitle>

      <svg width={dimensions.width} height={dimensions.height - 44} style={{ flex: 1 }}>
        {/* Danger zone */}
        <rect
          x={xScale(DANGER_THRESHOLD)}
          y={MARGIN.top}
          width={Math.max(0, chartW - (DANGER_THRESHOLD / maxDays) * chartW)}
          height={chartH}
          fill="#E42313"
          opacity={0.04}
        />
        {/* Danger line */}
        <line
          x1={xScale(DANGER_THRESHOLD)}
          y1={MARGIN.top}
          x2={xScale(DANGER_THRESHOLD)}
          y2={MARGIN.top + chartH}
          stroke="#E42313"
          strokeWidth={1}
          strokeDasharray="4,3"
          opacity={0.5}
        />
        <text
          x={xScale(DANGER_THRESHOLD) + 4}
          y={MARGIN.top + chartH + 24}
          fill="#E42313"
          fontSize={9}
          fontFamily="Inter, sans-serif"
          opacity={0.7}
        >
          Límite
        </text>

        {/* Y-axis labels */}
        {PHASE_ORDER.map((key) => (
          <text
            key={key}
            x={MARGIN.left - 8}
            y={yPhaseCenter(key)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#7A7A7A"
            fontSize={10}
            fontFamily="Inter, sans-serif"
          >
            {PHASE_LABELS[key]}
          </text>
        ))}

        {/* Horizontal grid lines */}
        {PHASE_ORDER.map((key) => (
          <line
            key={`grid-${key}`}
            x1={MARGIN.left}
            y1={yPhaseCenter(key)}
            x2={MARGIN.left + chartW}
            y2={yPhaseCenter(key)}
            stroke="#F0F0F0"
            strokeWidth={1}
          />
        ))}

        {/* X-axis ticks */}
        {xTicks.map((v) => (
          <g key={`xt-${v}`}>
            <line
              x1={xScale(v)}
              y1={MARGIN.top + chartH}
              x2={xScale(v)}
              y2={MARGIN.top + chartH + 5}
              stroke="#E8E8E8"
            />
            <text
              x={xScale(v)}
              y={MARGIN.top + chartH + 18}
              textAnchor="middle"
              fill="#B0B0B0"
              fontSize={9}
              fontFamily="Inter, sans-serif"
            >
              {v}d
            </text>
          </g>
        ))}

        {/* Dots */}
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.cx}
            cy={dot.cy}
            r={DOT_RADIUS}
            fill={PHASE_COLORS[dot.phaseDisplay] || '#6B7280'}
            stroke={dot.alarm.severity === 'danger' ? '#E42313' : 'none'}
            strokeWidth={dot.alarm.severity === 'danger' ? 2 : 0}
            opacity={0.85}
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => handleMouseEnter(e, dot)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onDotClick?.(dot)}
          />
        ))}
      </svg>

      {/* Legend */}
      <ScatterLegend>
        {PHASE_ORDER.map((key) => (
          <LegendItem key={key} $color={PHASE_COLORS[key]}>
            <span className="dot" />
            <span className="label">{PHASE_LABELS[key]}</span>
          </LegendItem>
        ))}
        <LegendItem $color={PHASE_COLORS.alarm}>
          <span className="dot" />
          <span className="label">Alarma</span>
        </LegendItem>
      </ScatterLegend>

      {/* Tooltip */}
      {tooltip && (
        <ScatterTooltip style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="tt-title">{tooltip.project.idPublic}</div>
          <div className="tt-row">
            <span>Fase</span>
            <span>{PHASE_LABELS[tooltip.project.phaseDisplay] || tooltip.project.phaseKey}</span>
          </div>
          <div className="tt-row">
            <span>Días hábiles</span>
            <span>{tooltip.project.businessDays}</span>
          </div>
          <div className="tt-row">
            <span>Tipo</span>
            <span>{tooltip.project.type}</span>
          </div>
          {tooltip.project.alarm.severity && (
            <div className="tt-row" style={{ color: '#E42313' }}>
              <span>Alarma</span>
              <span>{tooltip.project.alarm.daysLeft}d restantes</span>
            </div>
          )}
        </ScatterTooltip>
      )}
    </ScatterPanel>
  );
}
