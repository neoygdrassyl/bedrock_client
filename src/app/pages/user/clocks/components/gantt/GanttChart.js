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
 * GanttChart (Versión Unificada y Corregida)
 */
export const GanttChart = ({
  phases = [],
  radDate,
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
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const isSyncing = useRef(false);

  const systemToday = useMemo(() => {
      return manager?.systemDate ? moment(manager.systemDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }, [manager]);

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
    if (!radDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [], todayOffset: -1, intervalDays: compactMode ? 10 : 5 };
    }

    let cumulativeDays = 0;
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

      const baseDays = safeInt(ganttBlockDays ?? totalDays, 0);
      const actualDays = safeInt(usedDays, 0);

      let containerWidth = baseDays; 
      if (viewMode === 'real') {
         if (status === 'COMPLETADO') {
             containerWidth = actualDays;
         } else {
             containerWidth = Math.max(baseDays, actualDays);
         }
      } 

      const blockWidth = ensureMinWidth(containerWidth);
      const blockBaseDays = ensureMinWidth(baseDays);

      let shiftDays = 0;
      if (viewMode === 'legal') {
          if (status === 'COMPLETADO') {
              if (parallelActors) {
                  const p1Used = safeInt(parallelActors.primary?.usedDays, 0);
                  const p2Used = safeInt(parallelActors.secondary?.usedDays, 0);
                  shiftDays = Math.max(p1Used, p2Used);
              } else {
                  shiftDays = actualDays;
              }
          } else {
              shiftDays = baseDays; 
          }
      } else {
          shiftDays = blockWidth;
      }

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

      // --- LÓGICA DE SUSPENSIONES UNIFICADA ---
      let suspensionInfo = null;
      let relevantSuspension = null;
      if (id === 'phase1' && suspensionPreActa?.exists) {
        relevantSuspension = suspensionPreActa;
      } else if (['phase4', 'phase4_desist'].includes(id) && suspensionPostActa?.exists) {
        relevantSuspension = suspensionPostActa;
      }
      
      if (relevantSuspension && relevantSuspension.start?.date_start) {
        const susStartDate = relevantSuspension.start.date_start;
        const susEndDate = relevantSuspension.end?.date_start;

        if(moment(susStartDate).isSameOrAfter(radDate)) {
            // Se cuentan los días hábiles desde la radicación hasta el inicio de la suspensión (sin incluir el último día).
            const startOffset = calcularDiasHabiles(radDate, susStartDate, false);
            let duration = 0;
            if (susEndDate) {
                // Duración en días hábiles, incluyendo inicio y fin.
                duration = calcularDiasHabiles(susStartDate, susEndDate, true);
            } else if (moment(today).isAfter(susStartDate)) {
                // Si está activa, la duración es hasta hoy.
                duration = calcularDiasHabiles(susStartDate, today, true);
            }

            suspensionInfo = {
                startOffset,
                duration: Math.max(1, duration), // Mínimo 1 día visualmente.
                label: `Suspensión (${relevantSuspension.days || duration}d)`
            };
        }
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
        suspensionInfo,
        rows: [],
        markers: []
      };

      if (scheduleConfig && scheduleConfig.times && manager && startDate) {
          const markers = [];
          (relatedStates || []).forEach(state => {
              if (scheduleConfig.times[state]) {
                  const clockDef = manager.clocksData.find(c => c.state === state);
                  const scheduledInfo = calculateScheduledLimitForDisplay(state, clockDef || { state, allowSchedule: true }, manager.getClock(state), scheduleConfig, manager.getClock, manager.getClockVersion, manager);
                  if (scheduledInfo && scheduledInfo.limitDate) {
                      const offset = calcularDiasHabiles(startDate, scheduledInfo.limitDate, false);
                      if (offset >= 0) {
                          markers.push({ state, label: clockDef?.name || `Evento ${state}`, date: scheduledInfo.limitDate, offsetDays: offset, display: scheduledInfo.display });
                      }
                  }
              }
          });
          phaseData.markers = markers;
      }

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
        phaseData.rows.push({ type: 'primary', status: parallelActors.primary.status, label: parallelActors.primary.name, ...row1Metrics });
        phaseData.rows.push({ type: 'secondary', status: parallelActors.secondary.status, label: parallelActors.secondary.name, ...row2Metrics });
      } else {
        const metrics = calculateRowMetrics(usedDays, totalDays);
        phaseData.rows.push({ type: 'single', status: phase.status, label: 'Progreso', ...metrics });
      }

      processedPhases.push(phaseData);
      
      cumulativeDays += shiftDays;
    });

    let maxVisualDay = 0;
    if (processedPhases.length > 0) {
        processedPhases.forEach(p => {
            const endPos = p.startPosition + p.blockWidth;
            if (endPos > maxVisualDay) maxVisualDay = endPos;
            if(p.suspensionInfo) {
                const susEndPos = p.suspensionInfo.startOffset + p.suspensionInfo.duration;
                if(susEndPos > maxVisualDay) maxVisualDay = susEndPos;
            }
        });
        
        maxVisualDay += 15;
    }

    const maxDays = maxVisualDay > 0 ? maxVisualDay : 50; 

    const dateColumns = [];
    const step = 1; 

    for (let i = 0; i <= maxDays; i += step) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(radDate, i),
        position: i,
        isMajor: i % (compactMode ? 10 : 5) === 0
      });
    }

    let todayOffset = -1;
    if (radDate && systemToday) {
        if (moment(systemToday).isSameOrAfter(radDate)) {
            todayOffset = calcularDiasHabiles(radDate, systemToday, false);
        }
    }

    return { phases: processedPhases, maxDays, dateColumns, todayOffset, intervalDays: compactMode ? 10 : 5 };
  }, [phases, radDate, viewMode, compactMode, suspensionPreActa, suspensionPostActa, extension, scheduleConfig, systemToday, manager]);

  const scaleFactor = useMemo(() => (compactMode ? 3 : 8), [compactMode]);
  const totalWidthPx = useMemo(() => ganttData.maxDays * scaleFactor, [ganttData.maxDays, scaleFactor]);

  const ROW_HEIGHT_BASE = compactMode ? 34 : 50; 
  const getRowHeight = (phase) => phase.suspensionInfo ? ROW_HEIGHT_BASE + (compactMode ? 16 : 25) : ROW_HEIGHT_BASE;
  const HEADER_HEIGHT = compactMode ? 46 : 56; 
  const totalBodyHeight = useMemo(() => ganttData.phases.reduce((acc, p) => acc + getRowHeight(p), 0), [ganttData.phases, compactMode]);

  const gridVars = useMemo(() => {
    const majorStepPx = ganttData.intervalDays * scaleFactor;
    return {
      '--gantt-day-width': `${scaleFactor}px`,
      '--gantt-major-step': `${majorStepPx}px`,
      '--gantt-grid-minor-alpha': compactMode ? 0.04 : 0.04,
      '--gantt-grid-major-alpha': compactMode ? 0.12 : 0.10,
    };
  }, [scaleFactor, ganttData.intervalDays, compactMode]);

  if (!radDate || ganttData.phases.length === 0) {
    return ( <div className="gantt-empty"> <i className="fas fa-calendar-times" /> <p>No hay datos disponibles para el diagrama</p> </div> );
  }

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
          return ( <div key={`mk-${i}`} className="gantt-scheduled-marker" style={{ left: `${posPct}%` }} onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipContent); }} onMouseLeave={handleMouseLeave} /> );
      });
  };

  const renderBarWithTrack = (rowInfo, phase, phaseStartDate) => {
    const barClass = statusToClass(rowInfo.status);
    const trackStyle = { width: `${rowInfo.trackPct}%` };
    const fillStyle = { width: `${rowInfo.progressPct}%` };
    const hasError = rowInfo.overdueDays > 0;
    const errorStyle = { left: `${rowInfo.trackPct}%`, width: `${rowInfo.errorPct}%` };

    const dateLimit = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorTotal) : null;
    const dateActual = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorUsed) : null;
    
    const tooltipTrack = ( <div> <strong>Límite Legal</strong><br/> Días: {rowInfo.actorTotal}<br/> Fecha: {dateLimit ? moment(dateLimit).format('DD/MM/YYYY') : '--'} </div> );
    const tooltipFill = ( <div> <strong>{rowInfo.label || 'Progreso'}</strong><br/> Estado: {rowInfo.status}<br/> Días usados: {rowInfo.actorUsed}<br/> Fecha Corte: {dateActual ? moment(dateActual).format('DD/MM/YYYY') : '--'} </div> );
    const tooltipError = hasError ? ( <div> <strong style={{color: '#ff6b6b'}}>Retraso / Exceso</strong><br/> Días extra: {rowInfo.overdueDays}<br/> Total acumulado: {rowInfo.actorUsed} días </div> ) : null;

    let suspensionCutout = null;
    if (phase.suspensionInfo && rowInfo.actorTotal > 0 && phase.startDate) {
        // Lógica de recorte restaurada para mayor precisión.
        const susStartOffsetFromPhaseStart = calcularDiasHabiles(phase.startDate, sumarDiasHabiles(radDate, phase.suspensionInfo.startOffset), false);
        
        const leftPct = (susStartOffsetFromPhaseStart / rowInfo.actorTotal) * 100;
        const widthPct = (phase.suspensionInfo.duration / rowInfo.actorTotal) * 100;

        if(leftPct >= 0 && leftPct < 100){
            suspensionCutout = ( <div className="gantt-progress-cutout" style={{ left: `${leftPct}%`, width: `${widthPct}%` }} /> );
        }
    }

    return (
      <div className="gantt-bar-single">
         <div className="gantt-bar-bg" style={trackStyle} onMouseMove={(e) => handleMouseMove(e, tooltipTrack)} onMouseLeave={handleMouseLeave} >
            <div className={`gantt-bar-fill ${barClass}`} style={fillStyle} onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipFill); }} onMouseLeave={handleMouseLeave} />
            {suspensionCutout}
         </div>
         {hasError && ( <div className="gantt-error-line" style={errorStyle} onMouseMove={(e) => handleMouseMove(e, tooltipError)} onMouseLeave={handleMouseLeave} /> )}
      </div>
    );
  };
  
  const renderSuspensionRow = (phase) => {
    if (!phase.suspensionInfo) return null;

    const { startOffset, duration } = phase.suspensionInfo;
    
    // Lógica de posicionamiento relativo al contenedor de la fase.
    const leftPx = (startOffset - phase.startPosition) * scaleFactor;
    const widthPx = duration * scaleFactor;

    const tooltipContent = ( <div> <strong>Suspensión de Términos</strong><br /> <span>{duration} días hábiles</span> </div> );

    return (
      <>
        <div className="gantt-suspension-track">
          <div
            className="gantt-suspension-bar"
            style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
            onMouseMove={(e) => handleMouseMove(e, tooltipContent)}
            onMouseLeave={handleMouseLeave}
          >
            {!compactMode && <span>S</span>}
          </div>
        </div>
        {/* Las guías también deben ser relativas al contenedor de la fase */}
        <div className="gantt-suspension-guideline" style={{ left: `${leftPx}px` }} />
        <div className="gantt-suspension-guideline" style={{ left: `${leftPx + widthPx}px` }} />
      </>
    );
  };

  return (
    <div className={`gantt-container ${compactMode ? 'gantt-compact' : ''}`}>
      <FloatingTooltip {...tooltip} />

      <div className="gantt-header-wrapper" style={{ height: `${HEADER_HEIGHT}px` }}>
        <div className="gantt-title-column">
          <div className="gantt-title-header">{!compactMode && <span>Fases</span>}</div>
        </div>

        <div className="gantt-chart-column" ref={headerScrollRef}>
          <div className="gantt-header-timeline" style={{ width: `${totalWidthPx}px` }}>
            {ganttData.dateColumns.map((col) => (
              <div key={`mk-${col.day}`} className={`gantt-timeline-marker ${col.isMajor ? 'major' : 'minor'}`} style={{ left: `${col.position * scaleFactor}px` }} onMouseMove={(e) => handleMouseMove(e, <div><strong>Día Hábil: {col.day}</strong><br/>Fecha: {moment(col.date).format('DD/MM/YYYY')}</div>)} onMouseLeave={handleMouseLeave} >
                <div className={`gantt-timeline-tick ${col.isMajor ? '' : 'minor-tick'}`} />
                {col.isMajor && ( <span className="gantt-timeline-label"> {compactMode ? `${col.day}` : `Día ${col.day}`} </span> )}
                {!compactMode && col.isMajor && ( <span className="gantt-header-date-label"> {moment(col.date).format('DD/MM')} </span> )}
              </div>
            ))}
             {ganttData.todayOffset >= 0 && (
                <div className="gantt-today-marker-head" style={{ left: `${ganttData.todayOffset * scaleFactor}px` }} title={`Hoy: ${moment(systemToday).format('DD/MM/YYYY')}`} >
                    <div className="gantt-today-triangle"></div>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="gantt-body-wrapper">
        <div className="gantt-body-titles">
           {ganttData.phases.map((phase) => {
              const isActive = activePhaseId === phase.id;
              const rowHeight = getRowHeight(phase);
              return (
                <div key={phase.id} className={`gantt-phase-row-title ${phase.highlightClass || ''} ${isActive ? 'gantt-phase-active' : ''} ${phase.suspensionInfo ? 'gantt-phase-with-suspension' : ''}`} onClick={() => onPhaseClick?.(phase)} style={{ height: `${rowHeight}px` }} >
                  <div className="gantt-phase-number">{phase.phaseIndex}</div>
                  {!compactMode && <span className="gantt-phase-title-text">{phase.title}</span>}
                </div>
              );
            })}
        </div>

        <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
          <div className="gantt-body-content gantt-grid" style={{ width: `${totalWidthPx}px`, height: `${totalBodyHeight}px`, ...gridVars }} >
            {ganttData.todayOffset >= 0 && ( <div className="gantt-today-line" style={{ left: `${ganttData.todayOffset * scaleFactor}px` }} /> )}

            {(() => {
                let cumulativeTop = 0;
                return ganttData.phases.map((phase) => {
                    const rowHeight = getRowHeight(phase);
                    const topPx = cumulativeTop;
                    cumulativeTop += rowHeight;
                    
                    const barHeight = compactMode ? 10 : 16;
                    const mainBarTopPadding = phase.suspensionInfo ? (compactMode ? '15%' : '25%') : '50%';
                    const mainBarTransform = 'translateY(-50%)';

                    return (
                      <div key={`task-container-${phase.id}`} className={`gantt-task-container ${phase.suspensionInfo ? 'gantt-phase-with-suspension' : ''}`} style={{ left: `${phase.startPosition * scaleFactor}px`, width: `${phase.blockWidth * scaleFactor}px`, top: `${topPx}px`, height: `${rowHeight}px` }} onClick={() => onPhaseClick?.(phase)} >
                         <div style={{ position: 'absolute', top: mainBarTopPadding, transform: mainBarTransform, width: '100%' }}>
                            {phase.hasParallelActors ? (
                              <div className="gantt-bar-stack" style={{ gap: compactMode ? '2px' : '4px' }}>
                                <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                                  {renderBarWithTrack(phase.rows[0], phase, phase.startDate)}
                                </div>
                                <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                                  {renderBarWithTrack(phase.rows[1], phase, phase.startDate)}
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: `${barHeight}px`, width: '100%', position: 'relative' }}>
                                  {renderBarWithTrack(phase.rows[0], phase, phase.startDate)}
                              </div>
                            )}
                         </div>

                        {renderMarkers(phase)}
                        {renderSuspensionRow(phase)}
                      </div>
                    );
                });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};