import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles, calcularDiasHabiles } from '../../hooks/useClocksManager';

/**
 * Componente interno para el Tooltip Flotante
 */
const FloatingTooltip = ({ visible, x, y, content }) => {
  if (!visible || !content) return null;
  return (
    <div 
      className="gantt-floating-tooltip"
      style={{ top: y + 15, left: x + 15 }} // Un poco desplazado del mouse
    >
      {content}
    </div>
  );
};

/**
 * GanttChart (Fixed Alignment Version with Interactive Tooltips)
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
  
  // Estado para el tooltip flotante
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

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

  // Manejadores del mouse para el tooltip
  const handleMouseMove = (e, content) => {
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content: content
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const ganttData = useMemo(() => {
    if (!ldfDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [] };
    }

    let cumulativeDays = 0; // Posición acumulada en el eje X
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

      // --- LOGICA DE ANCHO AJUSTADO ---
      // Si adjustedWidthMode es TRUE: La caja contenedora crece para alojar el máximo (Legal o Usado).
      // Si adjustedWidthMode es FALSE: La caja se queda en el tamaño Legal. El exceso se desborda visualmente.
      const containerWidth = adjustedWidthMode 
        ? Math.max(baseDays, actualDays) 
        : baseDays;

      const blockWidth = ensureMinWidth(containerWidth);
      const blockBaseDays = ensureMinWidth(baseDays);

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

      // La posición visual de inicio
      const visualStartPosition = cumulativeDays;

      const phaseData = {
        ...phase,
        phaseIndex: index + 1,
        startPosition: visualStartPosition,
        blockWidth,      // Ancho visual de la caja
        blockBaseDays,   // Ancho lógico legal
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
        
        // Referencia para porcentajes: Si modo ajustado, es max(u,t). Si no, es t.
        const refWidth = blockWidth;

        // 1. Ancho del track gris (Límite legal)
        // Si no estamos en modo ajustado, trackPct será 100% (llenando la caja base)
        // Si estamos en modo ajustado y u > t, trackPct será < 100%
        const trackPct = (t / refWidth) * 100;

        // 2. Progreso verde
        // El progreso es relativo al ancho total de referencia
        const progressPct = (Math.min(u, t) / refWidth) * 100;

        // 3. Cálculo de error
        const overdue = calculateOverdue(u, t, startDate, endDate);
        
        // 4. Ancho de la línea roja
        const errorPct = (overdue / refWidth) * 100;

        return {
          trackPct,
          progressPct, // OJO: Cambiado significado, ahora es relativo al container, no al track
          errorPct,
          overdueDays: overdue,
          actorUsed: u,
          actorTotal: t
        };
      };

      if (hasParallelActors) {
        const row1Metrics = calculateRowMetrics(parallelActors.primary.usedDays, parallelActors.primary.totalDays);
        const row2Metrics = calculateRowMetrics(parallelActors.secondary.usedDays, parallelActors.secondary.totalDays);

        phaseData.rows.push({
          type: 'primary',
          status: parallelActors.primary.status,
          label: parallelActors.primary.name,
          ...row1Metrics
        });

        phaseData.rows.push({
          type: 'secondary',
          status: parallelActors.secondary.status,
          label: parallelActors.secondary.name,
          ...row2Metrics
        });

      } else {
        const metrics = calculateRowMetrics(usedDays, totalDays);
        phaseData.rows.push({
          type: 'single',
          status: phase.status,
          label: 'Progreso',
          ...metrics
        });
      }

      processedPhases.push(phaseData);
      
      // Actualizamos acumuladores para la siguiente fase.
      // Si estamos en modo ajustado, la siguiente fase empieza después de TODO el bloque (incluyendo retrasos).
      // Si no, empieza después del tiempo legal (y los retrasos se solapan visualmente con la siguiente fase).
      cumulativeDays += adjustedWidthMode ? blockWidth : blockBaseDays;
    });

    // Calcular el ancho total del gráfico para el scroll
    let maxVisualDay = 0;
    if (processedPhases.length > 0) {
        const lastPhase = processedPhases[processedPhases.length - 1];
        maxVisualDay = lastPhase.startPosition + lastPhase.blockWidth;
        
        // Si no estamos en modo ajustado y hay errores desbordados en la última fase, sumar un poco más
        if(!adjustedWidthMode && lastPhase.rows.some(r => r.overdueDays > 0)){
             maxVisualDay += 20; // Margen arbitrario para ver el error
        }
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

  // Renderizadores de Elementos Interactivos

  const renderExtraSegments = (phase) => {
    if (compactMode) return null;
    const segments = [];
    
    // Función helper para tooltip de segmentos extra
    const getExtraTooltip = (type, obj) => {
        if(!obj) return "";
        const fechaFin = obj.end?.date_start ? moment(obj.end.date_start).format('DD/MM/YYYY') : 'En curso';
        const fechaIni = obj.start?.date_start ? moment(obj.start.date_start).format('DD/MM/YYYY') : '';
        return (
            <div>
               <strong>{type}</strong><br/>
               <span style={{fontSize:'11px'}}>Inicio: {fechaIni}</span><br/>
               <span style={{fontSize:'11px'}}>Fin: {fechaFin}</span><br/>
               <span style={{fontSize:'11px'}}>Duración: {obj.days} días</span>
            </div>
        );
    };

    if (phase.hasSuspensionPreActa) 
        segments.push(
            <div key="s1" className="gantt-segment gantt-segment-suspension" 
                 onMouseMove={(e) => handleMouseMove(e, getExtraTooltip("Suspensión Pre-Acta", suspensionPreActa))}
                 onMouseLeave={handleMouseLeave}
            />
        );
    
    if (phase.hasSuspensionPostActa) 
        segments.push(
            <div key="s2" className="gantt-segment gantt-segment-suspension"
                 onMouseMove={(e) => handleMouseMove(e, getExtraTooltip("Suspensión Post-Acta", suspensionPostActa))}
                 onMouseLeave={handleMouseLeave}
            />
        );
    
    if (phase.hasExtension) 
        segments.push(
            <div key="ext" className="gantt-segment gantt-segment-extension"
                 onMouseMove={(e) => handleMouseMove(e, getExtraTooltip("Prórroga", extension))}
                 onMouseLeave={handleMouseLeave}
            />
        );
    
    if (segments.length === 0) return null;
    return <div className="gantt-extra-segments">{segments}</div>;
  };

  const renderBarWithTrack = (rowInfo, phaseStartDate) => {
    const barClass = statusToClass(rowInfo.status);
    
    // Ancho del track gris (Límite legal)
    const trackStyle = { width: `${rowInfo.trackPct}%` };
    
    // Ancho del progreso dentro del contenedor
    const fillStyle = { width: `${rowInfo.progressPct}%` };
    
    // Línea de error
    const hasError = rowInfo.overdueDays > 0;
    const errorStyle = {
        left: `${rowInfo.trackPct}%`, // Empieza al final del track legal
        width: `${rowInfo.errorPct}%` // Ancho del error
    };

    // Calculo de fechas para el tooltip
    const dateLimit = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorTotal) : null;
    const dateActual = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorUsed) : null;
    
    // Contenido del tooltip
    const tooltipTrack = (
        <div>
            <strong>Límite Legal</strong><br/>
            Días: {rowInfo.actorTotal}<br/>
            Fecha: {dateLimit ? moment(dateLimit).format('DD/MM/YYYY') : '--'}
        </div>
    );

    const tooltipFill = (
        <div>
            <strong>{rowInfo.label || 'Progreso'}</strong><br/>
            Estado: {rowInfo.status}<br/>
            Días usados: {rowInfo.actorUsed}<br/>
            Fecha Corte: {dateActual ? moment(dateActual).format('DD/MM/YYYY') : '--'}
        </div>
    );

    const tooltipError = hasError ? (
        <div>
            <strong style={{color: '#ff6b6b'}}>Retraso / Exceso</strong><br/>
            Días extra: {rowInfo.overdueDays}<br/>
            Total acumulado: {rowInfo.actorUsed} días
        </div>
    ) : null;

    return (
      <div className="gantt-bar-single">
         {/* La barra gris (Límite / Track) */}
         <div 
            className="gantt-bar-bg" 
            style={trackStyle}
            onMouseMove={(e) => handleMouseMove(e, tooltipTrack)}
            onMouseLeave={handleMouseLeave}
         >
             {/* El relleno de progreso (Verde/Azul) */}
             {/* Nota: Movemos el fill FUERA del track si queremos que sean independientes en z-index o 
                 los ponemos dentro si queremos que se recorte. 
                 En este diseño, el fill debe estar SOBRE el track pero acotado por él si u < t. 
                 Si u > t, en modo ajustado el track es más corto que el container, asi que necesitamos
                 renderizar el fill relativo al container, no al track.
             */}
         </div>

         {/* Renderizamos el fill visual independiente para manejar mejor las capas y tooltips */}
         <div 
             className={`gantt-bar-fill-overlay ${barClass}`} 
             style={{ 
                 ...fillStyle, 
                 position: 'absolute', 
                 top: 0, 
                 left: 0, 
                 height: '100%',
                 borderRadius: '4px',
                 opacity: 0.8,
                 pointerEvents: 'auto' // Para capturar hover
             }} 
             onMouseMove={(e) => {
                 e.stopPropagation(); // Evitar que salte el tooltip del track de abajo
                 handleMouseMove(e, tooltipFill);
             }}
             onMouseLeave={handleMouseLeave}
         />
         
         {/* La línea de error (Exceso) */}
         {hasError && (
             <div 
                className="gantt-error-line" 
                style={errorStyle} 
                onMouseMove={(e) => handleMouseMove(e, tooltipError)}
                onMouseLeave={handleMouseLeave}
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
      {/* Tooltip Global */}
      <FloatingTooltip {...tooltip} />

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
                        <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                          {renderBarWithTrack(phase.rows[0], phase.startDate)}
                        </div>
                        <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                          {renderBarWithTrack(phase.rows[1], phase.startDate)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                          {renderBarWithTrack(phase.rows[0], phase.startDate)}
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