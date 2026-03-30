import React from 'react';
import { KPIStripWrapper, KPIItem, PHASE_COLORS } from './dashboard.styles';

const KPI_DEFS = [
  { key: 'incompleto', label: 'Incompletos', color: PHASE_COLORS.radicacion },
  { key: 'lydf', label: 'En LyDF', color: PHASE_COLORS.lydf },
  { key: 'acta', label: 'En Acta', color: PHASE_COLORS.acta },
  { key: 'expedicion', label: 'Expedición', color: PHASE_COLORS.expedicion },
  { key: 'alarma', label: 'Con Alarma', color: PHASE_COLORS.alarm },
  { key: 'desistido', label: 'Desistidos', color: PHASE_COLORS.desistido },
];

/**
 * Horizontal KPI strip showing counts per phase.
 */
export function KPIStrip({ kpis }) {
  return (
    <KPIStripWrapper>
      {KPI_DEFS.map((def) => (
        <KPIItem key={def.key} $color={def.color}>
          <span className="kpi-value">{kpis[def.key] ?? 0}</span>
          <span className="kpi-label">{def.label}</span>
        </KPIItem>
      ))}
    </KPIStripWrapper>
  );
}
