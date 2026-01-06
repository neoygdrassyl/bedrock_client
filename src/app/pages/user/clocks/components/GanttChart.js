import React, { useMemo, useState, useRef, useLayoutEffect } from 'react'; // Añadir useRef y useLayoutEffect
import moment from 'moment';
import { sumarDiasHabiles } from '../hooks/useClocksManager';

/**
 * GanttChart - Componente principal del diagrama de Gantt MEJORADO
 * 
 * @param {Array} phases - Lista de fases del proceso desde useProcessPhases
 * @param {String} ldfDate - Fecha de radicación legal y debida forma (fecha base)
 * @param {Object} suspensionPreActa - Información de suspensión pre-acta
 * @param {Object} suspensionPostActa - Información de suspensión post-acta
 * @param {Object} extension - Información de prórroga
 * @param {Boolean} compactMode - Modo compacto (vista previa pequeña)
 * @param {Boolean} adjustedWidthMode - Modo de ancho ajustado
 * @param {Function} onPhaseClick - Callback cuando se hace click en una fase
 * @param {String} activePhaseId - ID de la fase actualmente activa en el sidebar
 */
export const GanttChart = ({
  phases = [],
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  compactMode = false,
  adjustedWidthMode = false,
  onPhaseClick,
  activePhaseId
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  // CORRECCIÓN: Refs para sincronizar el scroll
  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);

  // CORRECCIÓN: Efecto para sincronizar los scrolls
  useLayoutEffect(() => {
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;

    if (!headerEl || !bodyEl) return;

    const syncScroll = (e) => {
      if (e.target === headerEl) {
        bodyEl.scrollLeft = headerEl.scrollLeft;
      } else {
        headerEl.scrollLeft = bodyEl.scrollLeft;
      }
    };
    
    headerEl.addEventListener('scroll', syncScroll);
    bodyEl.addEventListener('scroll', syncScroll);

    return () => {
      headerEl.removeEventListener('scroll', syncScroll);
      bodyEl.removeEventListener('scroll', syncScroll);
    };
  }, []);


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

      // Calcular ancho del bloque
      let blockWidth = totalDays;
      if (adjustedWidthMode && endDate) {
        blockWidth = usedDays;
      } else if (adjustedWidthMode && !endDate && totalDays > 0) {
        blockWidth = totalDays;
      }

      // Determinar si tiene actores paralelos
      const hasParallelActors = !!parallelActors?.primary && !!parallelActors?.secondary;

      // Identificar suspensiones y prórrogas para esta fase
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
        blockWidth: blockWidth || 1,
        hasParallelActors,
        hasSuspensionPreActa,
        hasSuspensionPostActa,
        hasExtension,
        rows: []
      };

      // Construir filas
      if (hasParallelActors) {
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

    // Calcular columnas de días
    const maxDays = cumulativeDays;
    const dateColumns = [];
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

  // Calcular el factor de escala
  const scaleFactor = useMemo(() => {
    if (ganttData.maxDays === 0) return 1;
    const basePixelsPerDay = compactMode ? 2 : 8;
    return basePixelsPerDay;
  }, [ganttData.maxDays, compactMode]);

  // Renderizar barra de progreso SIN TEXTO DE ACTOR
  const renderProgressBar = (row, blockWidth) => {
    const { totalDays, usedDays, status } = row;
    const progress = totalDays > 0 ? Math.min(100, (usedDays / totalDays) * 100) : 0;

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
      </div>
    );
  };

  // Renderizar segmentos de suspensión/prórroga
  const renderExtraSegments = (phase) => {
    if (compactMode) return null;

    const segments = [];
    
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
      <div className="gantt-extra-segments">{segments}</div>
    ) : null;
  };

  // Renderizar conectores entre fases
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
      {/* Encabezado con línea de tiempo */}
      <div className="gantt-header-wrapper">
        <div className="gantt-title-column">
          <div className="gantt-title-header">
            {!compactMode && <span>Fases</span>}
          </div>
        </div>
        {/* CORRECCIÓN: Contenedor de scroll para el header */}
        <div className="gantt-chart-column" ref={headerScrollRef}>
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
                  {!compactMode && hoveredDay?.day === col.day && (
                    <div className="gantt-timeline-tooltip">
                      {moment(col.date).format('DD/MM/YYYY')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CORRECCIÓN: Contenedor de scroll para el cuerpo */}
      <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
        {ganttData.phases.map((phase, phaseIndex) => (
          <React.Fragment key={phase.id}>
            {/* Fase principal con columnas fijas */}
            <div
              className={`gantt-phase ${
                activePhaseId === phase.id ? 'gantt-phase-active' : ''
              }`}
              onClick={() => onPhaseClick?.(phase)}
            >
              {/* Columna de título FIJA */}
              <div className="gantt-phase-title-column">
                <div className="gantt-phase-number">{phase.phaseIndex}</div>
                <span className="gantt-phase-title">{phase.title}</span>
              </div>

              {/* CORRECCIÓN: Contenedor de barras ahora es solo un div */}
              <div className="gantt-phase-bars-container">
                <div className="gantt-phase-bars" style={{ width: `${totalWidth}px` }}>
                  {/* Contenedor del bloque */}
                  <div
                    className="gantt-block"
                    style={{
                      left: `${phase.startPosition * scaleFactor}px`,
                      width: `${phase.blockWidth * scaleFactor}px`
                    }}
                  >
                    {/* ✅ MODIFICACIÓN: Contenedor para filas paralelas */}
                    <div className={phase.hasParallelActors ? 'gantt-row-parallel-container' : ''}>
                      {phase.rows.map((row, rowIndex) => (
                        <div
                          key={rowIndex}
                          className={`gantt-row gantt-row-${row.type}`}
                        >
                          {renderProgressBar(row, phase.blockWidth)}
                        </div>
                      ))}
                    </div>
                    {renderExtraSegments(phase)}
                  </div>
                </div>
              </div>
            </div>

            {/* Conector a la siguiente fase */}
            {renderConnector(phaseIndex)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};