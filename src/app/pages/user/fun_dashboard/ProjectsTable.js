import React, { useState, useMemo } from 'react';
import {
  TablePanel, TableHeader, SearchInput, ColumnHeaderRow,
  TableBody, TableRow, CellRadicado, CellTipo, CellEstado,
  StateBadge, CellGantt, MiniGanttBar, GanttSegment, CellAlarm,
  STATE_BADGE_MAP,
} from './dashboard.styles';

/**
 * Table with mini-Gantt timeline bars per project.
 * Columns: RADICADO | TIPO | ESTADO | TIMELINE DE FASES | ALARMA
 */
export function ProjectsTable({ projects, onRowClick }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase();
    return projects.filter(
      (p) =>
        (p.idPublic || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.stateLabel || '').toLowerCase().includes(q)
    );
  }, [projects, search]);

  return (
    <TablePanel>
      <TableHeader>
        <h3>Proyectos Activos</h3>
        <SearchInput
          type="text"
          placeholder="Buscar radicado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </TableHeader>

      <ColumnHeaderRow>
        <span style={{ width: 120, flexShrink: 0 }}>RADICADO</span>
        <span style={{ width: 35, flexShrink: 0, textAlign: 'center' }}>TIPO</span>
        <span style={{ width: 70, flexShrink: 0, textAlign: 'center' }}>ESTADO</span>
        <span style={{ flex: 1, textAlign: 'center' }}>TIMELINE DE FASES</span>
        <span style={{ width: 60, flexShrink: 0, textAlign: 'right' }}>ALARMA</span>
      </ColumnHeaderRow>

      <TableBody>
        {filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#B0B0B0', fontSize: 12 }}>
            Sin proyectos encontrados
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectRow key={p.id} project={p} onClick={() => onRowClick?.(p)} />
          ))
        )}
      </TableBody>
    </TablePanel>
  );
}

function ProjectRow({ project, onClick }) {
  const { idPublic, type, stateLabel, ganttSegments, alarm, tramite } = project;
  const badgeInfo = STATE_BADGE_MAP[stateLabel] || { bg: '#6B7280', label: stateLabel };
  const isAlarm = alarm.severity === 'danger';

  // Gantt: total ratio of segments, fill remaining with gray
  const totalRatio = ganttSegments.reduce((sum, s) => sum + s.ratio, 0);

  return (
    <TableRow $highlight={isAlarm} onClick={onClick}>
      <CellRadicado>
        <div className="id">{idPublic}</div>
        <div className="sub">{tramite || ''}</div>
      </CellRadicado>

      <CellTipo>{type}</CellTipo>

      <CellEstado>
        <StateBadge $bg={badgeInfo.bg}>{badgeInfo.label}</StateBadge>
      </CellEstado>

      <CellGantt>
        <MiniGanttBar>
          {ganttSegments.map((seg) => (
            <GanttSegment
              key={seg.key}
              $color={seg.color}
              $width={`${Math.max(2, seg.ratio * 100)}%`}
            />
          ))}
          {totalRatio < 1 && (
            <GanttSegment $color="#E8E8E8" $opacity={0.3} $flex="1" />
          )}
        </MiniGanttBar>
      </CellGantt>

      <CellAlarm $severity={alarm.severity}>
        {alarm.severity ? (
          <>
            <i className={`alarm-icon fas ${alarm.severity === 'danger' ? 'fa-exclamation-triangle' : 'fa-bell'}`} />
            <span className="alarm-text">
              {alarm.daysLeft != null ? `${alarm.daysLeft}d` : '!'}
            </span>
          </>
        ) : (
          <span className="no-alarm">—</span>
        )}
      </CellAlarm>
    </TableRow>
  );
}
