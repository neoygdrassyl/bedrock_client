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
      style={{ top: y + 15, left: x + 15 }} 
    >
      {content}
    </div>
  );
};

/**
 * GanttChart (Updated: Real Waterfall Logic + Today Line + Precision Header)
 */
export const GanttChart = ({
  phases = [],
  radDate, // Cambio: ldfDate -> radDate
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
  
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const isSyncing = useRef(false);

  // Fecha del sistema (Hoy emulado o real)
  const systemToday = useMemo(() => {
      return manager?.systemDate ? moment(manager.systemDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }, [manager]);

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

  const statusToClass = (status) => {
    if (status === 'COMPLETADO') return 'gantt-bar-completed';
    if (status === 'ACTIVO') return 'gantt-bar-active';
    if (status === 'PAUSADO') return 'gantt-bar-paused';
    if (status === 'VENCIDO') return 'gantt-bar-overdue';
    return 'gantt-bar-pending';
  };

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
    if (!radDate || phases.length === 0) { // Cambio: ldfDate -> radDate
      return { phases: [], maxDays: 0, dateColumns: [], todayOffset: -1 };
    }

    let cumulativeDays = 0; // Posición de inicio para la siguiente fase
    const processedPhases = [];
    const today = systemToday;

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

      const baseDays = safeInt(ganttBlockDays ?? totalDays, 0); // Límite Legal
      const actualDays = safeInt(usedDays, 0); // Tiempo Real

      // --- LOGICA DE VISTAS ---
      let containerWidth = baseDays; 

      if (viewMode === 'real') {
         // En vista REAL: El contenedor crece si nos pasamos, o se encoge si terminamos antes.
         if (status === 'COMPLETADO') {
             containerWidth = actualDays;
         } else {
             containerWidth = Math.max(baseDays, actualDays);
         }
      } 
      // En vista LEGAL: containerWidth siempre es baseDays (el límite legal), 
      // a menos que queramos mostrar el desborde visualmente (lo cual maneja el CSS con overflow visible).
      // Aquí mantenemos baseDays para que la barra gris represente la norma.

      const blockWidth = ensureMinWidth(containerWidth);
      const blockBaseDays = ensureMinWidth(baseDays);

      // --- LÓGICA DE CONTINUIDAD (Shift de la siguiente fase) ---
      // Calculamos cuánto tiempo "real" consumió esta fase para saber dónde empieza la siguiente.
      let shiftDays = 0;

      if (viewMode === 'legal') {
          // MODIFICACIÓN SOLICITADA:
          // En modo legal, la barra conserva su ancho (legal), PERO el inicio de la siguiente
          // fase depende de cuándo terminó REALMENTE la actual.
          
          if (status === 'COMPLETADO') {
              // Si terminó, la siguiente empieza cuando esta acabó (sea antes o después del límite).
              // Lógica para paralelos: Tomar el mayor tiempo usado.
              if (parallelActors) {
                  const p1Used = safeInt(parallelActors.primary?.usedDays, 0);
                  const p2Used = safeInt(parallelActors.secondary?.usedDays, 0);
                  
                  // Caso especial Ejecutoria (phase9_exec): Si existen ambos, el mayor.
                  // (La lógica general de Math.max funciona bien para Ejecutoria y Recurso también)
                  shiftDays = Math.max(p1Used, p2Used);
              } else {
                  shiftDays = actualDays;
              }
          } else {
              // Si NO ha terminado (Activo/Pendiente), en el diagrama Legal solemos proyectar 
              // el espacio legal completo para no "superponer" prematuramente el futuro.
              // O si está activo, usamos lo que lleve (max(used, base)).
              // Para mantener el orden visual limpio de lo pendiente:
              shiftDays = baseDays; 
          }
      } else {
          // Modo Real: El desplazamiento es igual al ancho del bloque visualizado.
          shiftDays = blockWidth;
      }

      // Cálculo de Overdue (igual que antes)
      const calculateOverdue = (uDays, tDays, pStartDate, pEndDate) => {
          let overdue = 0;
          const u = safeInt(uDays, 0);
          const t = safeInt(tDays, 1);
          if (pEndDate) {
              if (u > t) overdue = u - t;
          } else if (pStartDate) {
              const limitDate = sumarDiasHabiles(pStartDate, t);
              if (moment(today).isAfter(limitDate)) {
                  overdue = calcularDiasHabiles(limitDate, today);
              }
          }
          return Math.max(0, overdue);
      };

      // Segmentos extra
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
      const visualStartPosition = cumulativeDays;

      const phaseData = {
        ...phase,
        phaseIndex: index + 1,
        startPosition: visualStartPosition,
        blockWidth,      
        blockBaseDays,   
        hasParallelActors,
        hasSuspensionPreActa,
        hasSuspensionPostActa,
        hasExtension,
        rows: [],
        markers: []
      };

      // Marcadores (Schedule)
      if (scheduleConfig && scheduleConfig.times && manager && startDate) {
          const markers = [];
          (relatedStates || []).forEach(state => {
              if (scheduleConfig.times[state]) {
                  const clockDef = manager.clocksData.find(c => c.state === state);
                  const scheduledInfo = calculateScheduledLimitForDisplay(
                      state, 
                      clockDef || { state, allowSchedule: true },
                      manager.getClock(state),
                      scheduleConfig,
                      manager.getClock,
                      manager.getClockVersion,
                      manager
                  );

                  if (scheduledInfo && scheduledInfo.limitDate) {
                      const offset = calcularDiasHabiles(startDate, scheduledInfo.limitDate, false);
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

      // Métricas de fila
      const calculateRowMetrics = (actorUsed, actorTotal) => {
        const u = safeInt(actorUsed, 0);
        const t = safeInt(actorTotal, 1);
        const refWidth = blockWidth; 
        const trackPct = (t / refWidth) * 100;
        const progressPct = (Math.min(u, t) / refWidth) * 100;
        const overdue = calculateOverdue(u, t, startDate, endDate);
        const errorPct = (overdue / refWidth) * 100;

        return { trackPct, progressPct, errorPct, overdueDays: overdue, actorUsed: u, actorTotal: t };
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
      
      // ACTUALIZAR ACUMULADOR con el valor "shift" calculado
      cumulativeDays += shiftDays;
    });

    // Calcular ancho total y columnas
    let maxVisualDay = 0;
    if (processedPhases.length > 0) {
        // Encontrar la fase que visualmente termina más lejos
        processedPhases.forEach(p => {
            const endPos = p.startPosition + p.blockWidth;
            if (endPos > maxVisualDay) maxVisualDay = endPos;
        });
        
        // Margen extra
        maxVisualDay += 15;
    }

    const maxDays = maxVisualDay > 0 ? maxVisualDay : 50; 

    // Header markers
    const dateColumns = [];
    // Usamos intervalo 1 para tener precisión de ticks, pero labels controlados
    const step = 1; 

    for (let i = 0; i <= maxDays; i += step) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(radDate, i), // Cambio: ldfDate -> radDate
        position: i,
        isMajor: i % (compactMode ? 10 : 5) === 0 // Multiplos de 5 o 10
      });
    }

    // Calcular posición de HOY relativo a la fecha de radicación
    let todayOffset = -1;
    if (radDate && systemToday) { // Cambio: ldfDate -> radDate
        // Si hoy es antes de la fecha de radicación, negativo (no se muestra o se muestra al inicio)
        // Si hoy es despues, calculamos dias habiles
        if (moment(systemToday).isSameOrAfter(radDate)) { // Cambio: ldfDate -> radDate
            todayOffset = calcularDiasHabiles(radDate, systemToday, false); // Cambio: ldfDate -> radDate
        }
    }

    return { phases: processedPhases, maxDays, dateColumns, todayOffset, intervalDays: compactMode ? 10 : 5 };
  }, [phases, radDate, viewMode, compactMode, suspensionPreActa, suspensionPostActa, extension, scheduleConfig, systemToday]); // Cambio: ldfDate -> radDate

  const scaleFactor = useMemo(() => (compactMode ? 3 : 8), [compactMode]);
  const totalWidthPx = ganttData.maxDays * scaleFactor;

  const gridVars = useMemo(() => {
    // Grid visual de fondo sigue siendo multiplos de 5
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
          const posPct = (marker.offsetDays / phase.blockWidth) * 100;
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
                onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipContent); }}
                onMouseLeave={handleMouseLeave}
              />
          );
      });
  };

  const renderBarWithTrack = (rowInfo, phaseStartDate) => {
    const barClass = statusToClass(rowInfo.status);
    const trackStyle = { width: `${rowInfo.trackPct}%` };
    const fillStyle = { width: `${rowInfo.progressPct}%` };
    const hasError = rowInfo.overdueDays > 0;
    const errorStyle = { left: `${rowInfo.trackPct}%`, width: `${rowInfo.errorPct}%` };

    const dateLimit = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorTotal) : null;
    const dateActual = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorUsed) : null;
    
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
         <div 
            className="gantt-bar-bg" 
            style={trackStyle}
            onMouseMove={(e) => handleMouseMove(e, tooltipTrack)}
            onMouseLeave={handleMouseLeave}
         ></div>
         <div 
             className={`gantt-bar-fill-overlay ${barClass}`} 
             style={{ ...fillStyle, position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: '4px', opacity: 0.8, pointerEvents: 'auto' }} 
             onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipFill); }}
             onMouseLeave={handleMouseLeave}
         />
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

  if (!radDate || ganttData.phases.length === 0) { // Cambio: ldfDate -> radDate
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
                className={`gantt-timeline-marker ${col.isMajor ? 'major' : 'minor'}`}
                style={{ left: `${col.position * scaleFactor}px` }}
                onMouseMove={(e) => handleMouseMove(e, <div><strong>Día Hábil: {col.day}</strong><br/>Fecha: {moment(col.date).format('DD/MM/YYYY')}</div>)}
                onMouseLeave={handleMouseLeave}
              >
                <div className={`gantt-timeline-tick ${col.isMajor ? '' : 'minor-tick'}`} />
                
                {col.isMajor && (
                    <span className="gantt-timeline-label">
                    {compactMode ? `${col.day}` : `Día ${col.day}`}
                    </span>
                )}

                {!compactMode && col.isMajor && (
                    <span className="gantt-header-date-label">
                        {moment(col.date).format('DD/MM')}
                    </span>
                )}
              </div>
            ))}

            {/* LÍNEA DE HOY EN HEADER */}
             {ganttData.todayOffset >= 0 && (
                <div 
                    className="gantt-today-marker-head"
                    style={{ left: `${ganttData.todayOffset * scaleFactor}px` }}
                    title={`Hoy: ${moment(systemToday).format('DD/MM/YYYY')}`}
                >
                    <div className="gantt-today-triangle"></div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* BODY SECTION */}
      <div className="gantt-body-wrapper">
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

        <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
          <div 
            className="gantt-body-content gantt-grid"
            style={{
                width: `${totalWidthPx}px`,
                height: `${ganttData.phases.length * ROW_HEIGHT}px`,
                ...gridVars,
            }}
          >
            {/* LÍNEA TRANSVERSAL DE HOY */}
            {ganttData.todayOffset >= 0 && (
                <div 
                    className="gantt-today-line"
                    style={{ left: `${ganttData.todayOffset * scaleFactor}px` }}
                />
            )}

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