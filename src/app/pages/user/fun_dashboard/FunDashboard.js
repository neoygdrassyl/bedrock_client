import React, { useState, useCallback } from 'react';
import moment from 'moment';
import { useDashboardData } from './useDashboardData';
import { PhaseScatterChart } from './PhaseScatterChart';
import { ProjectsTable } from './ProjectsTable';
import { KPIStrip } from './KPIStrip';
import {
  DashboardWrapper, HeaderBar, HeaderTitle, DateFilterGroup,
  ProjectCountBadge, BodySplit,
} from './dashboard.styles';

/**
 * Centro de Operaciones — Dashboard unificado de licencias.
 * Reemplaza completamente la UI anterior de funmanage_new.
 * Excluye OA y Propiedad Horizontal.
 *
 * Props recibidos del page wrapper (funmanage_new.page.js):
 *  - onProjectClick(project): abre el modal correspondiente
 */
export function FunDashboard({ onProjectClick }) {
  const [dateStart, setDateStart] = useState(
    moment().subtract(12, 'months').format('YYYY-MM-DD')
  );
  const [dateEnd, setDateEnd] = useState(moment().format('YYYY-MM-DD'));

  const { projects, kpis, loading, error, reload } = useDashboardData(dateStart, dateEnd);

  const handleLoad = useCallback(
    (e) => {
      e.preventDefault();
      reload();
    },
    [reload]
  );

  const handleDotClick = useCallback(
    (dot) => {
      onProjectClick?.(dot);
    },
    [onProjectClick]
  );

  const handleRowClick = useCallback(
    (project) => {
      onProjectClick?.(project);
    },
    [onProjectClick]
  );

  return (
    <DashboardWrapper>
      {/* ── Header ── */}
      <HeaderBar>
        <HeaderTitle>Centro de Operaciones</HeaderTitle>
        <DateFilterGroup as="form" onSubmit={handleLoad}>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            required
          />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar'}
          </button>
          <ProjectCountBadge>{projects.length} proyectos</ProjectCountBadge>
        </DateFilterGroup>
      </HeaderBar>

      {/* ── KPI Strip ── */}
      <KPIStrip kpis={kpis} />

      {/* ── Error state ── */}
      {error && (
        <div style={{ padding: 16, textAlign: 'center', color: '#E42313', fontSize: 13 }}>
          {error} — <button onClick={reload} style={{ textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', color: '#E42313' }}>Reintentar</button>
        </div>
      )}

      {/* ── Body: Scatter + Table ── */}
      <BodySplit>
        <PhaseScatterChart projects={projects} onDotClick={handleDotClick} />
        <ProjectsTable projects={projects} onRowClick={handleRowClick} />
      </BodySplit>
    </DashboardWrapper>
  );
}
