import React, { useMemo, useState } from 'react';
import moment from 'moment';
import { sumarDiasHabiles } from '../hooks/useClocksManager';

/**
 * GanttChart - Componente principal del diagrama de Gantt
 * 
 * @param {Array} phases - Lista de fases del proceso desde useProcessPhases
 * @param {String} ldfDate - Fecha de radicación legal y debida forma (fecha base)
 * @param {Object} suspensionPreActa - Información de suspensión pre-acta
 * @param {Object} suspensionPostActa - Información de suspensión post-acta
 * @param {Object} extension - Información de prórroga
 * @param {Boolean} compactMode - Modo compacto (vista previa pequeña)
 * @param {Boolean} adjustedWidthMode - Modo de ancho ajustado (Regla 14)
 * @param {Function} onPhaseClick - Callback cuando se hace click en una fase
 */
export const GanttChart = ({ 
  phases = [], 
  ldfDate, 
  suspensionPreActa,
  suspensionPostActa,
  extension,
  compactMode = false,
  adjustedWidthMode = false,
  onPhaseClick
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Calcular datos del diagrama
  const ganttData = useMemo(() => {
    if (!ldfDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [] };
    }

    let cumulativeDays = 0;
    const processedPhases = [];

    phases.forEach((phase, index) => {
      const { 
        id, 
        title, 
        totalDays = 0, 
        usedDays = 0,
        parallelActors,
        startDate,
        endDate,
        status,
        highlightClass,
        relatedStates
      } = phase;

      // Calcular ancho del bloque según Regla 14
      let blockWidth = totalDays;
      if (adjustedWidthMode && endDate) {
        blockWidth = usedDays;
      } else if (adjustedWidthMode && !endDate && totalDays > 0) {
        blockWidth = totalDays;
      }

      // Determinar si tiene actores paralelos (Regla 2)
      const hasParallelActors = !!parallelActors?.primary && !!parallelActors?.secondary;

      // Identificar suspensiones y prórrogas para esta fase (Regla 7 y 8)
      let hasSuspensionPreActa = false;
      let hasSuspensionPostActa = false;
      let hasExtension = false;

      if (id === 'phase1' && relatedStates?.includes(300)) {
        hasSuspensionPreActa = suspensionPreActa?.exists;
        hasExtension = extension?.exists;
      }
      if (id === 'phase4' && relatedStates?.includes(301)) {
        hasSuspensionPostActa = suspensionPostActa?.exists;
        hasExtension = extension?.exists;
      }

      const phaseData = {
        ...phase,
        phaseIndex: index + 1,
        startPosition: cumulativeDays,
        blockWidth: blockWidth || 1, // Mínimo 1 día de ancho
        hasParallelActors,
        hasSuspensionPreActa,
        hasSuspensionPostActa,
        hasExtension,
        rows: []
      };

      // Construir filas (Regla 2 y 3)
      if (hasParallelActors) {
        // Dos actores paralelos = dos filas
        phaseData.rows.push({
          type: 'primary',
          actor: parallelActors.primary,
          totalDays: parallelActors.primary.totalDays,
          usedDays: parallelActors.primary.usedDays,
          status: parallelActors.primary.status
        });
        phaseData.rows.push({
          type: 'secondary',
          actor: parallelActors.secondary,
          totalDays: parallelActors.secondary.totalDays,
          usedDays: parallelActors.secondary.usedDays,
          status: parallelActors.secondary.status
        });
      } else {
        // Un solo actor = una fila
        phaseData.rows.push({
          type: 'single',
          actor: { name: phase.responsible },
          totalDays: totalDays,
          usedDays: usedDays,
          status: status
        });
      }

      processedPhases.push(phaseData);
      cumulativeDays += blockWidth;
    });

    // Calcular columnas de días (Regla 11)
    const maxDays = cumulativeDays;
    const dateColumns = [];
    
    // Generar marcadores de días cada 5 días hábiles
    const interval = compactMode ? 10 : 5;
    for (let i = 0; i <= maxDays; i += interval) {
      const date = sumarDiasHabiles(ldfDate, i);
      dateColumns.push({
        day: i,
        date: date,
        position: i
      });
    }

    return {
      phases: processedPhases,
      maxDays,
      dateColumns
    };
  }, [phases, ldfDate, adjustedWidthMode, compactMode, suspensionPreActa, suspensionPostActa, extension]);

  // Calcular el factor de escala para que el diagrama quepa en el 100% del ancho
  const scaleFactor = useMemo(() => {
    if (ganttData.maxDays === 0) return 1;
    // En modo compacto usamos menos espacio, en modo normal más
    const basePixelsPerDay = compactMode ? 2 : 8;
    return basePixelsPerDay;
  }, [ganttData.maxDays, compactMode]);

  // Renderizar barra de progreso con estados (Regla 5 y 6)
  const renderProgressBar = (row, blockWidth) => {
    const { totalDays, usedDays, status } = row;
    const progress = totalDays > 0 ? Math.min(100, (usedDays / totalDays) * 100) : 0;

    // Colores según estado (Regla 6)
    let statusClass = 'gantt-progress-pending';
    if (status === 'COMPLETADO') statusClass = 'gantt-progress-completed';
    else if (status === 'ACTIVO') statusClass = 'gantt-progress-active';
    else if (status === 'PAUSADO') statusClass = 'gantt-progress-paused';
    else if (status === 'VENCIDO') statusClass = 'gantt-progress-overdue';

    return (
      <div className="gantt-progress-container">
        <div 
          className={`gantt-progress-bar ${statusClass}`}
          style={{ width: `${progress}%` }}
        />
        {!compactMode && (
          <span className="gantt-progress-text">
            {usedDays}/{totalDays}d
          </span>
        )}
      </div>
    );
  };

  // Renderizar segmentos de suspensión/prórroga (Regla 7 y 8)
  const renderExtraSegments = (phase) => {
    if (compactMode) return null;
    
    const segments = [];
    
    // Determinar si fue antes o después del acta (Regla 8)
    if (phase.hasSuspensionPreActa) {
      segments.push(
        <div 
          key="susp-pre" 
          className="gantt-segment gantt-segment-suspension"
          title="Suspensión antes del acta"
        />
      );
    }
    
    if (phase.hasSuspensionPostActa) {
      segments.push(
        <div 
          key="susp-post" 
          className="gantt-segment gantt-segment-suspension"
          title="Suspensión después del acta"
        />
      );
    }
    
    if (phase.hasExtension) {
      segments.push(
        <div 
          key="extension" 
          className="gantt-segment gantt-segment-extension"
          title="Prórroga"
        />
      );
    }

    return segments.length > 0 ? (
      <div className="gantt-extra-segments">
        {segments}
      </div>
    ) : null;
  };

  // Renderizar conectores entre fases (Regla 12)
  const renderConnector = (index) => {
    if (index === ganttData.phases.length - 1) return null;
    return (
      <div className="gantt-phase-connector">
        <div className="gantt-connector-line" />
        <div className="gantt-connector-arrow">
          <i className="fas fa-chevron-down" />
        </div>
      </div>
    );
  };

  if (!ldfDate || ganttData.phases.length === 0) {
    return (
      <div className="gantt-empty">
        <i className="fas fa-calendar-times" />
        <p>No hay datos disponibles para el diagrama</p>
      </div>
    );
  }

  const totalWidth = ganttData.maxDays * scaleFactor;

  return (
    <div className={`gantt-container ${compactMode ? 'gantt-compact' : ''}`}>
      {/* Encabezado con días y fechas (Regla 11) */}
      <div className="gantt-header" style={{ width: `${totalWidth}px` }}>
        <div className="gantt-timeline">
          {ganttData.dateColumns.map((col) => (
            <div
              key={col.day}
              className="gantt-timeline-marker"
              style={{ left: `${col.position * scaleFactor}px` }}
              onMouseEnter={() => setHoveredDay(col)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div className="gantt-timeline-tick" />
              <span className="gantt-timeline-label">
                {compactMode ? `${col.day}d` : `Día ${col.day}`}
              </span>
              {/* Tooltip con fecha (Regla 11) */}
              {!compactMode && hoveredDay?.day === col.day && (
                <div className="gantt-timeline-tooltip">
                  {moment(col.date).format('DD/MM/YYYY')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cuerpo del diagrama con fases (Regla 1, 2, 3, 4) */}
      <div className="gantt-body">
        {ganttData.phases.map((phase, phaseIndex) => (
          <React.Fragment key={phase.id}>
            {/* Fase principal (Regla 1) */}
            <div 
              className={`gantt-phase ${phase.highlightClass || ''}`}
              onClick={() => onPhaseClick?.(phase)}
            >
              {/* Etiqueta de la fase */}
              <div className="gantt-phase-label">
                {compactMode ? (
                  <span className="gantt-phase-number">{phase.phaseIndex}</span>
                ) : (
                  <>
                    <span className="gantt-phase-number">{phase.phaseIndex}</span>
                    <span className="gantt-phase-title">{phase.title}</span>
                  </>
                )}
              </div>

              {/* Área de barras */}
              <div 
                className="gantt-phase-bars"
                style={{ width: `${totalWidth}px` }}
              >
                {/* Contenedor del bloque (Regla 10 y 13) */}
                <div
                  className="gantt-block"
                  style={{
                    left: `${phase.startPosition * scaleFactor}px`,
                    width: `${phase.blockWidth * scaleFactor}px`
                  }}
                >
                  {/* Filas dentro del bloque (Regla 2 y 3) */}
                  {phase.rows.map((row, rowIndex) => (
                    <div 
                      key={rowIndex}
                      className={`gantt-row gantt-row-${row.type}`}
                    >
                      {!compactMode && (
                        <span className="gantt-row-label">
                          {row.actor.name}
                        </span>
                      )}
                      {renderProgressBar(row, phase.blockWidth)}
                    </div>
                  ))}

                  {/* Segmentos de suspensión/prórroga (Regla 7) */}
                  {renderExtraSegments(phase)}
                </div>
              </div>
            </div>

            {/* Conector a la siguiente fase (Regla 12) */}
            {renderConnector(phaseIndex)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
