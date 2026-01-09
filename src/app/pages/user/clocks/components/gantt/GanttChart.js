import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles, calcularDiasHabiles } from '../../hooks/useClocksManager';

/**
 * GanttChart (Fixed Alignment Version with Error Lines & Shifted Schedule)
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
  activePhaseId,
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const isSyncing = useRef(false);

  // Sync scroll logic
  useLayoutEffect(() => {
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!headerEl || !bodyEl) return;

    const syncScroll = (source, target) => (event) => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      target.scrollLeft = event.target.scrollLeft;
      requestAnimationFrame(() => {
        isSyncing.current = false;
      });
    };
    
    const headerSync = syncScroll(headerEl, bodyEl);
    const bodySync = syncScroll(bodyEl, headerEl);

    headerEl.addEventListener('scroll', headerSync);
    bodyEl.addEventListener('scroll', bodySync);

    return () => {
      headerEl.removeEventListener('scroll', headerSync);
      bodyEl.removeEventListener('scroll', bodySync);
    };
  }, []);

  const safeInt = (n, fallback = 0) => {
    const v = Number(n);
    return Number.isFinite(v) ? Math.floor(v) : fallback;
  };

  const ensureMinWidth = (n) => Math.max(1, safeInt(n, 1));

  // Determine bar class based on status
  const statusToClass = (status) => {
    if (status === 'COMPLETADO') return 'gantt-bar-completed';
    if (status === 'ACTIVO') return 'gantt-bar-active';
    if (status === 'PAUSADO') return 'gantt-bar-paused';
    if (status === 'VENCIDO') return 'gantt-bar-overdue';
    return 'gantt-bar-pending';
  };

  const ganttData = useMemo(() => {
    if (!ldfDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [] };
    }

    let cumulativeDays = 0; // Posición teórica (sin retrasos acumulados)
    let currentShift = 0;   // Desplazamiento acumulado por retrasos anteriores
    const processedPhases = [];
    const today = moment().format('YYYY-MM-DD');

    phases.forEach((phase, index) => {
      const {
        id,
        totalDays = 0,
        usedDays = 0,
        ganttBlockDays,
        parallelActors,
        relatedStates,
        startDate,
        endDate
      } = phase;

      // Días base (planificados/legales)
      const baseDays = safeInt(ganttBlockDays ?? totalDays, 0);
      
      // Días reales (usados)
      const actualDays = safeInt(usedDays, 0);

      // El ancho del bloque base sigue siendo el planificado o el usado si es mayor,
      // pero para el "empuje" solo nos importa cuánto nos pasamos de lo legal.
      // Para dibujar la caja, usamos el maximo para contener el error visualmente.
      const containerWidth = Math.max(baseDays, actualDays);
      const blockWidth = ensureMinWidth(containerWidth);

      // Lógica de cálculo de retraso (Overdue)
      const calculateOverdue = (uDays, tDays, pStartDate, pEndDate) => {
          let overdue = 0;
          const u = safeInt(uDays, 0);
          const t = safeInt(tDays, 1);
          
          if (pEndDate) {
              // Caso Completado
              if (u > t) overdue = u - t;
          } else if (pStartDate) {
              // Caso Activo
              const limitDate = sumarDiasHabiles(pStartDate, t);
              if (moment(today).isAfter(limitDate)) {
                  overdue = calcularDiasHabiles(limitDate, today);
              }
          }
          return Math.max(0, overdue);
      };

      // Check extra segments
      let hasSuspensionPreActa = false;
      let hasSuspensionPostActa = false;
      let hasExtension = false;

      if (id === 'phase1' && relatedStates?.includes(300)) {
        hasSuspensionPreActa = !!suspensionPreActa?.exists;
        hasExtension = !!extension?.exists;
      }
      if (id === 'phase4' && relatedStates?.includes(301)) {
        hasSuspensionPostActa = !!suspensionPostActa?.exists;
        hasExtension = !!extension?.exists;
      }

      const hasParallelActors = !!parallelActors?.primary && !!parallelActors?.secondary;

      // Posición de inicio: Acumulado teórico + Desplazamiento por errores previos
      const visualStartPosition = cumulativeDays + currentShift;

      const phaseData = {
        ...phase,
        phaseIndex: index + 1,
        startPosition: visualStartPosition,
        blockWidth,
        blockBaseDays: ensureMinWidth(baseDays), // Guardamos la base legal original
        hasParallelActors,
        hasSuspensionPreActa,
        hasSuspensionPostActa,
        hasExtension,
        rows: [],
      };

      // Helper para calcular métricas de fila
      const calculateRowMetrics = (actorUsed, actorTotal) => {
        const u = safeInt(actorUsed, 0);
        const t = safeInt(actorTotal, 1);
        
        // El bloque visual tiene ancho = blockWidth (que es max(u, t))
        // PERO, la barra "Legal" (gris) siempre debe representar 't'.
        // Si 't' es menor que el bloque, la barra gris será más corta que el contenedor.
        
        const refWidth = blockWidth;

        // 1. Ancho del track gris (Límite legal) relativo al contenedor
        const trackPct = (t / refWidth) * 100;

        // 2. Progreso verde DENTRO del track gris
        const progressPctInTrack = (Math.min(u, t) / t) * 100;

        // 3. Cálculo de error
        // Usamos las fechas de la fase general si no hay especificas por actor, 
        // asumiendo que el actor sigue el ciclo de vida de la fase.
        const overdue = calculateOverdue(u, t, startDate, endDate);
        
        // 4. Ancho de la línea roja relativo al contenedor
        const errorPct = (overdue / refWidth) * 100;

        return {
          trackPct,
          progressPctInTrack,
          errorPct,
          overdueDays: overdue
        };
      };

      let maxOverdueInPhase = 0;

      if (hasParallelActors) {
        const row1Metrics = calculateRowMetrics(parallelActors.primary.usedDays, parallelActors.primary.totalDays);
        const row2Metrics = calculateRowMetrics(parallelActors.secondary.usedDays, parallelActors.secondary.totalDays);

        phaseData.rows.push({
          type: 'primary',
          status: parallelActors.primary.status,
          ...row1Metrics
        });

        phaseData.rows.push({
          type: 'secondary',
          status: parallelActors.secondary.status,
          ...row2Metrics
        });

        // El retraso que empuja a la siguiente fase es el máximo retraso de los paralelos
        maxOverdueInPhase = Math.max(row1Metrics.overdueDays, row2Metrics.overdueDays);

      } else {
        const metrics = calculateRowMetrics(usedDays, totalDays);
        phaseData.rows.push({
          type: 'single',
          status: phase.status,
          ...metrics
        });
        
        maxOverdueInPhase = metrics.overdueDays;
      }

      processedPhases.push(phaseData);
      
      // Actualizamos acumuladores para la siguiente iteración
      // 1. La posición teórica avanza lo que debía durar esta fase (su base legal)
      //    OJO: Usamos blockBaseDays (lo legal) para el avance 'normal'.
      //    Si usáramos blockWidth (que incluye el error), estaríamos duplicando el efecto.
      cumulativeDays += ensureMinWidth(baseDays);

      // 2. El desplazamiento (shift) aumenta si hubo error en ESTA fase.
      //    Así la siguiente fase empezará más tarde.
      // currentShift += maxOverdueInPhase;
    });

    // Calcular el ancho total del gráfico para el scroll
    let maxVisualDay = 0;
    if (processedPhases.length > 0) {
        const lastPhase = processedPhases[processedPhases.length - 1];
        // El fin visual es donde empieza la ultima + su ancho + posibles errores visuales remanentes
        // Como blockWidth ya incluye el error (porque es max(u,t)), startPosition + blockWidth es el fin visual.
        maxVisualDay = lastPhase.startPosition + lastPhase.blockWidth;
    }

    const maxDays = maxVisualDay > 0 ? maxVisualDay + 5 : 50; 

    // Header markers
    const dateColumns = [];
    const intervalDays = compactMode ? 10 : 5;

    for (let i = 0; i <= maxDays; i += intervalDays) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(ldfDate, i),
        position: i,
      });
    }
    // Asegurar último marcador
    if (dateColumns.length > 0 && dateColumns[dateColumns.length - 1].day < maxDays) {
        dateColumns.push({
          day: maxDays,
          date: sumarDiasHabiles(ldfDate, maxDays),
          position: maxDays,
        });
    }

    return { phases: processedPhases, maxDays, dateColumns, intervalDays };
  }, [phases, ldfDate, adjustedWidthMode, compactMode, suspensionPreActa, suspensionPostActa, extension]);

  const scaleFactor = useMemo(() => (compactMode ? 3 : 8), [compactMode]);
  const totalWidthPx = ganttData.maxDays * scaleFactor;

  const gridVars = useMemo(() => {
    const majorStepPx = ganttData.intervalDays * scaleFactor;
    return {
      '--gantt-day-width': `${scaleFactor}px`,
      '--gantt-major-step': `${majorStepPx}px`,
      '--gantt-grid-minor-alpha': compactMode ? 0.04 : 0.04,
      '--gantt-grid-major-alpha': compactMode ? 0.12 : 0.10,
    };
  }, [scaleFactor, ganttData.intervalDays, compactMode]);

  const renderExtraSegments = (phase) => {
    if (compactMode) return null;
    const segments = [];
    if (phase.hasSuspensionPreActa) segments.push(<div key="s1" className="gantt-segment gantt-segment-suspension" title="Suspensión" />);
    if (phase.hasSuspensionPostActa) segments.push(<div key="s2" className="gantt-segment gantt-segment-suspension" title="Suspensión" />);
    if (phase.hasExtension) segments.push(<div key="ext" className="gantt-segment gantt-segment-extension" title="Prórroga" />);
    
    if (segments.length === 0) return null;
    return <div className="gantt-extra-segments">{segments}</div>;
  };

  const renderBarWithTrack = (rowInfo) => {
    const barClass = statusToClass(rowInfo.status);
    
    // Ancho del track gris (Límite legal)
    const trackStyle = { width: `${rowInfo.trackPct}%` };
    
    // Ancho del progreso dentro del track
    const fillStyle = { width: `${rowInfo.progressPctInTrack}%` };
    
    // Línea de error
    const hasError = rowInfo.overdueDays > 0;
    const errorStyle = {
        left: `${rowInfo.trackPct}%`, // Empieza al final del track legal
        width: `${rowInfo.errorPct}%` // Ancho del error
    };

    return (
      <div className="gantt-bar-single">
         {/* La barra gris (Límite / Track) */}
         <div className="gantt-bar-bg" style={trackStyle}>
             <div className="gantt-bar-track" />
             <div 
               className={`gantt-bar-fill ${barClass}`} 
               style={fillStyle} 
             />
         </div>
         
         {/* La línea de error (Exceso) */}
         {hasError && (
             <div 
                className="gantt-error-line" 
                style={errorStyle} 
                title={`Exceso: ${rowInfo.overdueDays} días`}
             />
         )}
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

  const ROW_HEIGHT = compactMode ? 34 : 50; 
  const HEADER_HEIGHT = compactMode ? 32 : 56;

  return (
    <div className={`gantt-container ${compactMode ? 'gantt-compact' : ''}`}>
      {/* HEADER SECTION */}
      <div className="gantt-header-wrapper" style={{ height: `${HEADER_HEIGHT}px` }}>
        <div className="gantt-title-column">
          <div className="gantt-title-header">{!compactMode && <span>Fases</span>}</div>
        </div>

        <div className="gantt-chart-column" ref={headerScrollRef}>
          <div className="gantt-header-timeline" style={{ width: `${totalWidthPx}px` }}>
            {ganttData.dateColumns.map((col) => (
              <div
                key={`mk-${col.day}`}
                className="gantt-timeline-marker"
                style={{ left: `${col.position * scaleFactor}px` }}
                onMouseEnter={() => setHoveredDay(col)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className="gantt-timeline-tick" />
                <span className="gantt-timeline-label">
                  {compactMode ? `${col.day}` : `Día ${col.day}`}
                </span>
                {!compactMode && hoveredDay?.day === col.day && (
                  <div className="gantt-timeline-tooltip">{moment(col.date).format('DD/MM/YYYY')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="gantt-body-wrapper">
        
        {/* LEFT COLUMN (Titles) */}
        <div className="gantt-body-titles">
           {ganttData.phases.map((phase) => {
              const isActive = activePhaseId === phase.id;
              return (
                <div
                  key={phase.id}
                  className={`gantt-phase-row-title ${phase.highlightClass || ''} ${isActive ? 'gantt-phase-active' : ''}`}
                  onClick={() => onPhaseClick?.(phase)}
                  style={{ height: `${ROW_HEIGHT}px` }}
                >
                  <div className="gantt-phase-number">{phase.phaseIndex}</div>
                  {!compactMode && <span className="gantt-phase-title-text">{phase.title}</span>}
                </div>
              );
            })}
        </div>

        {/* RIGHT COLUMN (Chart Scrollable) */}
        <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
          <div 
            className="gantt-body-content gantt-grid"
            style={{
                width: `${totalWidthPx}px`,
                height: `${ganttData.phases.length * ROW_HEIGHT}px`,
                ...gridVars,
            }}
          >
            {ganttData.phases.map((phase, index) => {
                const leftPx = phase.startPosition * scaleFactor;
                const widthPx = phase.blockWidth * scaleFactor;
                const topPx = index * ROW_HEIGHT;
                
                const contentHeight = compactMode ? 26 : 40; 
                const barHeight = compactMode ? 10 : 16;
                const paddingY = ((ROW_HEIGHT - contentHeight) / 2) - (compactMode ? 4 : 0);

                return (
                  <div 
                    key={`task-${phase.id}`}
                    className="gantt-task-container"
                    style={{ 
                        left: `${leftPx}px`, 
                        width: `${widthPx}px`, 
                        top: `${topPx}px`, 
                        height: `${ROW_HEIGHT}px`,
                        paddingTop: `${paddingY}px`
                    }}
                    onClick={() => onPhaseClick?.(phase)}
                  >
                    {phase.hasParallelActors ? (
                      <div className="gantt-bar-stack" style={{ gap: compactMode ? '2px' : '4px' }}>
                        <div style={{ height: `${barHeight}px`, width: '100%' }}>
                          {renderBarWithTrack(phase.rows[0])}
                        </div>
                        <div style={{ height: `${barHeight}px`, width: '100%' }}>
                          {renderBarWithTrack(phase.rows[1])}
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: `${barHeight}px`, width: '100%' }}>
                          {renderBarWithTrack(phase.rows[0])}
                      </div>
                    )}
                    
                    {renderExtraSegments(phase)}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};