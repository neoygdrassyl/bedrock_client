import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles, calcularDiasHabiles } from '../../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../../utils/scheduleUtils';

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
  viewMode = 'legal', // 'legal' | 'real'
  onPhaseClick,
  activePhaseId,
  scheduleConfig,
  manager
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
        endDate,
        status
      } = phase;

      // Días base (planificados/legales)
      const baseDays = safeInt(ganttBlockDays ?? totalDays, 0);
      
      // Días reales (usados)
      const actualDays = safeInt(usedDays, 0);

      // --- LOGICA DE VISTAS (LEGAL vs REAL) ---
      let containerWidth = baseDays; // Por defecto Legal

      if (viewMode === 'real') {
         if (status === 'COMPLETADO') {
             // Si terminó, la caja es del tamaño real (si fue menos tiempo, se corta)
             // Si fue más tiempo, la caja crece.
             containerWidth = actualDays;
         } else {
             // Si está activo o pendiente, mostramos el legal O el usado si ya se pasó.
             containerWidth = Math.max(baseDays, actualDays);
         }
      } 
      // En modo 'legal', siempre respetamos el baseDays (el exceso se desborda visualmente pero no empuja la siguiente fase)

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
        markers: [] // Array para los puntos de programación
      };

      // --- CÁLCULO DE MARCADORES DE PROGRAMACIÓN ---
      if (scheduleConfig && scheduleConfig.times && manager && startDate) {
          const markers = [];
          (relatedStates || []).forEach(state => {
              // Si el estado está programado
              if (scheduleConfig.times[state]) {
                  // Obtenemos definición del clock para labels
                  const clockDef = manager.clocksData.find(c => c.state === state);
                  // Usamos el util para calcular fecha
                  const scheduledInfo = calculateScheduledLimitForDisplay(
                      state, 
                      clockDef || { state, allowSchedule: true }, // fallback simple
                      manager.getClock(state),
                      scheduleConfig,
                      manager.getClock,
                      manager.getClockVersion,
                      manager
                  );

                  if (scheduledInfo && scheduledInfo.limitDate) {
                      // Calcular offset en días hábiles desde el inicio de la fase
                      // Nota: usamos startDate de la fase.
                      // Si la fecha programada es ANTES del inicio, offset negativo (no se ve)
                      // Si es DESPUES, se ve.
                      const offset = calcularDiasHabiles(startDate, scheduledInfo.limitDate, false); // false = exlusivo diff
                      
                      // Solo agregar si cae dentro de una ventana razonable (no negativo extremo)
                      if (offset >= 0) {
                          markers.push({
                              state,
                              label: clockDef?.name || `Evento ${state}`,
                              date: scheduledInfo.limitDate,
                              offsetDays: offset,
                              display: scheduledInfo.display
                          });
                      }
                  }
              }
          });
          phaseData.markers = markers;
      }


      // Helper para calcular métricas de fila
      const calculateRowMetrics = (actorUsed, actorTotal) => {
        const u = safeInt(actorUsed, 0);
        const t = safeInt(actorTotal, 1);
        
        // Referencia para porcentajes: Depende de viewMode
        // En Real Mode: La caja es dinámica.
        // En Legal Mode: La caja es fija.
        const refWidth = blockWidth; 

        // 1. Ancho del track gris (Límite legal)
        const trackPct = (t / refWidth) * 100;

        // 2. Progreso verde
        const progressPct = (Math.min(u, t) / refWidth) * 100;

        // 3. Cálculo de error
        const overdue = calculateOverdue(u, t, startDate, endDate);
        
        // 4. Ancho de la línea roja
        // En Real Mode: Si completado y overdue, el error está "dentro" del ancho total (que creció).
        // En Legal Mode: El error se sale de la caja.
        const errorPct = (overdue / refWidth) * 100;

        return {
          trackPct,
          progressPct, // Relativo al container
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
      // viewMode === 'real': Empuja según el ancho real calculado.
      // viewMode === 'legal': Empuja según el ancho legal (estándar).
      cumulativeDays += viewMode === 'real' ? blockWidth : blockBaseDays;

    });

    // Calcular el ancho total del gráfico para el scroll
    let maxVisualDay = 0;
    if (processedPhases.length > 0) {
        const lastPhase = processedPhases[processedPhases.length - 1];
        maxVisualDay = lastPhase.startPosition + lastPhase.blockWidth;
        
        // Margen extra si hay errores en modo legal
        if(viewMode === 'legal' && lastPhase.rows.some(r => r.overdueDays > 0)){
             maxVisualDay += 20; 
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
  }, [phases, ldfDate, viewMode, compactMode, suspensionPreActa, suspensionPostActa, extension, scheduleConfig]);

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

  const renderMarkers = (phase) => {
      if (compactMode || !phase.markers || phase.markers.length === 0) return null;

      return phase.markers.map((marker, i) => {
          // Posición en porcentaje relativo al ancho del bloque visual
          const posPct = (marker.offsetDays / phase.blockWidth) * 100;
          
          // Si el marcador está fuera del bloque visual (ej: programación > tiempo real en vista real)
          // lo ocultamos o lo clippeamos
          if (posPct > 100 && viewMode === 'real') return null;

          const tooltipContent = (
              <div>
                  <strong style={{color: '#fcc419'}}>Programación</strong><br/>
                  <strong>{marker.label}</strong><br/>
                  Fecha: {moment(marker.date).format('DD/MM/YYYY')}<br/>
                  {marker.offsetDays} días desde inicio fase
              </div>
          );

          return (
              <div 
                key={`mk-${i}`}
                className="gantt-scheduled-marker"
                style={{ left: `${posPct}%` }}
                onMouseMove={(e) => {
                    e.stopPropagation();
                    handleMouseMove(e, tooltipContent);
                }}
                onMouseLeave={handleMouseLeave}
              />
          );
      });
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
         </div>

         {/* Renderizamos el fill visual independiente */}
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
                 pointerEvents: 'auto' 
             }} 
             onMouseMove={(e) => {
                 e.stopPropagation(); 
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
                    {renderMarkers(phase)}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};