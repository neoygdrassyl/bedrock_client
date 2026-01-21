import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles, calcularDiasHabiles } from '../../hooks/useClocksManager';
import { calculateScheduledLimitForDisplay } from '../../utils/scheduleUtils';

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

export const GanttChart = ({
  phases = [],
  radDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  compactMode = false,
  viewMode = 'legal',
  onPhaseClick,
  activePhaseId,
  scheduleConfig,
  manager,
  disableTooltips = false
}) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
  // Estado para alternar la visualización de las líneas de finalización (Hitos)
  const [showMilestones, setShowMilestones] = useState(true); 

  const headerScrollRef = useRef(null);
  const bodyScrollRef = useRef(null);
  const titlesScrollRef = useRef(null);
  const isSyncing = useRef(false);

  const systemToday = useMemo(() => {
      return manager?.systemDate ? moment(manager.systemDate).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
  }, [manager]);

  useLayoutEffect(() => {
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    const titlesEl = titlesScrollRef.current;
    if (!headerEl || !bodyEl || !titlesEl) return;

    const handleScroll = (e) => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      const target = e.target;
      if (target === bodyEl) {
        headerEl.scrollLeft = bodyEl.scrollLeft;
        titlesEl.scrollTop = bodyEl.scrollTop;
      } else if (target === headerEl) {
        bodyEl.scrollLeft = headerEl.scrollLeft;
      } else if (target === titlesEl) {
        bodyEl.scrollTop = titlesEl.scrollTop;
      }
      requestAnimationFrame(() => isSyncing.current = false);
    };

    headerEl.addEventListener('scroll', handleScroll);
    bodyEl.addEventListener('scroll', handleScroll);
    titlesEl.addEventListener('scroll', handleScroll);

    return () => {
      headerEl.removeEventListener('scroll', handleScroll);
      bodyEl.removeEventListener('scroll', handleScroll);
      titlesEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const safeInt = (n, fallback = 0) => {
    const v = Number(n);
    return Number.isFinite(v) ? Math.floor(v) : fallback;
  };
  const ensureMinWidth = (n) => Math.max(1, safeInt(n, 1));

  // --- IMPLEMENTACIÓN SEMÁFORO ---
  const getSemaphoreClass = (status, used, total) => {
    if (status === 'COMPLETADO') return 'gantt-bar-completed'; 
    if (status === 'VENCIDO') return 'gantt-bar-danger'; 
    if (status === 'PAUSADO') return 'gantt-bar-paused'; 

    const u = safeInt(used, 0);
    const t = safeInt(total, 1);
    const percentage = (u / t) * 100;
    const remaining = t - u;

    if (percentage >= 100) return 'gantt-bar-danger';
    if (percentage > 80 || remaining <= 3) return 'gantt-bar-warning'; 
    
    return 'gantt-bar-success'; 
  };

  const handleMouseMove = (e, content) => {
    if (disableTooltips) return;
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, content: content });
  };
  const handleMouseLeave = () => setTooltip(prev => ({ ...prev, visible: false }));

  const ganttData = useMemo(() => {
    if (!radDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [], todayOffset: -1, intervalDays: compactMode ? 10 : 5, elapsedDays: 0, todaySuggestion: null, todaySeverity: 'normal' };
    }

    let cumulativeDays = 0;
    const processedPhases = [];
    const splitDateForExtension = phases.find(p => p.title === 'Revisión y Viabilidad')?.startDate || null;

    phases.forEach((phase, index) => {
      const { id, totalDays = 0, usedDays = 0, ganttBlockDays, parallelActors, relatedStates, startDate, endDate, status } = phase;

      const baseDays = safeInt(ganttBlockDays ?? totalDays, 0);
      const actualDays = safeInt(usedDays, 0);

      let containerWidth = baseDays; 
      if (viewMode === 'real') {
         containerWidth = status === 'COMPLETADO' ? actualDays : Math.max(baseDays, actualDays);
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

      // --- CÁLCULO DE HITO LOCAL (Milestone) ---
      let phaseMilestone = null;
      if (status === 'COMPLETADO' && endDate) {
          const offset = calcularDiasHabiles(radDate, endDate, false);
          phaseMilestone = {
              title: phase.title,
              date: endDate,
              offset: offset,
              duration: actualDays,
              isPhase1: id === 'phase0' // Flag para posicionamiento especial si es la primera
          };
      }

      const calculateOverdue = (uDays, tDays, pStartDate, pEndDate) => {
          let overdue = 0;
          const u = safeInt(uDays, 0);
          const t = safeInt(tDays, 1);
          if (pEndDate) {
              if (u > t) overdue = u - t;
          } else if (pStartDate) {
              const limitDate = sumarDiasHabiles(pStartDate, t);
              if (moment(systemToday).isAfter(limitDate)) overdue = calcularDiasHabiles(limitDate, systemToday);
          }
          return Math.max(0, overdue);
      };

      // Suspensiones
      let suspensionInfo = null;
      let relevantSuspension = null;
      if (id === 'phase1' && suspensionPreActa?.exists) relevantSuspension = suspensionPreActa;
      else if (['phase4', 'phase4_desist'].includes(id) && suspensionPostActa?.exists) relevantSuspension = suspensionPostActa;
      
      if (relevantSuspension && relevantSuspension.start?.date_start) {
        const susStartDate = relevantSuspension.start.date_start;
        const susEndDate = relevantSuspension.end?.date_start;
        if(moment(susStartDate).isSameOrAfter(radDate)) {
            const startOffset = calcularDiasHabiles(radDate, susStartDate, false);
            let duration = 0;
            if (susEndDate) duration = calcularDiasHabiles(susStartDate, susEndDate, true);
            else if (moment(systemToday).isAfter(susStartDate)) duration = calcularDiasHabiles(susStartDate, systemToday, true);

            suspensionInfo = {
                startOffset,
                duration: Math.max(1, duration),
                label: `Suspensión (${relevantSuspension.days || duration}d)`
            };
        }
      }

      // Prórrogas
      let extensionInfo = null;
      if (extension?.exists && extension.start?.date_start && startDate) {
          const extDate = extension.start.date_start;
          let assignToThisPhase = false;
          let phaseContextLabel = "";
          
          if (id === 'phase1') {
              if (!splitDateForExtension || moment(extDate).isBefore(splitDateForExtension)) {
                  assignToThisPhase = true;
                  phaseContextLabel = "Fase 1 (Pre-Acta)";
              }
          } else if (['phase4', 'phase4_desist'].includes(id)) {
              if (splitDateForExtension && moment(extDate).isSameOrAfter(splitDateForExtension)) {
                  assignToThisPhase = true;
                  phaseContextLabel = "Fase 4 (Post-Acta)";
              }
          }

          if (assignToThisPhase) {
               const extOffset = calcularDiasHabiles(startDate, extDate, false);
               const extDuration = safeInt(extension.days, 0);
               if (extOffset >= 0 || id === 'phase1') {
                   extensionInfo = {
                       offset: Math.max(0, extOffset), 
                       days: extDuration,
                       label: `Prórroga ${extDuration}d - ${phaseContextLabel}`,
                       date: extDate,
                       phaseContext: phaseContextLabel
                   };
               }
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
        extensionInfo, 
        phaseMilestone, 
        rows: [],
        markers: []
      };

      // --- LOGICA DE MARCADORES (SCHEDULED LIMITS) ---
      if (scheduleConfig && scheduleConfig.times && manager && startDate) {
          const markers = [];
          const scheduledKeys = Object.keys(scheduleConfig.times);

          scheduledKeys.forEach(stateStr => {
              const state = Number(stateStr);
              let shouldInclude = false;

              if (relatedStates && relatedStates.includes(state)) {
                  shouldInclude = true;
              }

              if (!shouldInclude && startDate) {
                  const clockDef = manager.clocksData.find(c => c.state === state);
                  const scheduledInfo = calculateScheduledLimitForDisplay(state, clockDef || { state, allowSchedule: true }, manager.getClock(state), scheduleConfig, manager.getClock, manager.getClockVersion, manager);
                  
                  if (scheduledInfo && scheduledInfo.limitDate) {
                      const limitMoment = moment(scheduledInfo.limitDate);
                      const startMoment = moment(startDate);
                      if (endDate) {
                          const endMoment = moment(endDate);
                          if (limitMoment.isSameOrAfter(startMoment) && limitMoment.isSameOrBefore(endMoment)) {
                              shouldInclude = true;
                          }
                      } else {
                          if (limitMoment.isSameOrAfter(startMoment)) {
                              shouldInclude = true; 
                          }
                      }
                  }
              }

              if (shouldInclude) {
                  const clockDef = manager.clocksData.find(c => c.state === state);
                  const scheduledInfo = calculateScheduledLimitForDisplay(state, clockDef || { state, allowSchedule: true }, manager.getClock(state), scheduleConfig, manager.getClock, manager.getClockVersion, manager);
                  
                  if (scheduledInfo && scheduledInfo.limitDate) {
                      const offset = calcularDiasHabiles(startDate, scheduledInfo.limitDate, false);
                      if (offset >= -5) { 
                          markers.push({ 
                              state, 
                              label: clockDef?.name || `Evento ${state}`, 
                              date: scheduledInfo.limitDate, 
                              offsetDays: Math.max(0, offset),
                              display: scheduledInfo.display 
                          });
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
        const progressPct = t > 0 ? (Math.min(u, t) / t) * 100 : 0;
        const overdue = calculateOverdue(u, t, startDate, endDate);
        const errorPct = (overdue / refWidth) * 100;

        let scheduledOverdue = 0;
        let scheduledOverduePct = 0;

        if (phaseData.markers && phaseData.markers.length > 0) {
             const maxScheduledMarker = phaseData.markers.reduce((prev, current) => (prev.offsetDays > current.offsetDays) ? prev : current, phaseData.markers[0]);
             if (maxScheduledMarker) {
                 const scheduledLimit = maxScheduledMarker.offsetDays;
                 if (u > scheduledLimit) {
                     scheduledOverdue = u - scheduledLimit;
                 }
             }
        }
        
        scheduledOverduePct = (scheduledOverdue / refWidth) * 100;

        return { 
            trackPct, 
            progressPct, 
            errorPct, 
            overdueDays: overdue, 
            scheduledOverdueDays: scheduledOverdue,
            scheduledOverduePct,
            actorUsed: u, 
            actorTotal: t 
        };
      };

      if (hasParallelActors) {
        phaseData.rows.push({ type: 'primary', status: parallelActors.primary.status, label: parallelActors.primary.name, ...calculateRowMetrics(parallelActors.primary.usedDays, parallelActors.primary.totalDays, 'primary') });
        phaseData.rows.push({ type: 'secondary', status: parallelActors.secondary.status, label: parallelActors.secondary.name, ...calculateRowMetrics(parallelActors.secondary.usedDays, parallelActors.secondary.totalDays, 'secondary') });
      } else {
        phaseData.rows.push({ type: 'single', status: phase.status, label: 'Progreso', ...calculateRowMetrics(usedDays, totalDays, 'single') });
      }

      processedPhases.push(phaseData);
      cumulativeDays += shiftDays;
    });

    // Calcular ancho máximo visual
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
    for (let i = 0; i <= maxDays; i += 1) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(radDate, i),
        position: i,
        isMajor: i % (compactMode ? 10 : 5) === 0
      });
    }

    let todayOffset = -1;
    let elapsedDays = 0;
    if (radDate && systemToday) {
        if (moment(systemToday).isSameOrAfter(radDate)) {
            todayOffset = calcularDiasHabiles(radDate, systemToday, false);
            elapsedDays = todayOffset;
        }
    }
    
    // --- LÓGICA DE ALARMA DE "HOY" ---
    let todaySuggestion = null;
    let todaySeverity = 'normal';
    
    const activeP = processedPhases.find(p => p.status === 'ACTIVO' || p.status === 'PAUSADO');
    if (activeP) {
        const remaining = (activeP.totalDays || 0) - (activeP.usedDays || 0);
        if (activeP.status === 'VENCIDO' || remaining < 0) {
             todaySuggestion = `Vencido: ${activeP.title}`;
             todaySeverity = 'danger';
        } else if (remaining <= 3) {
             todaySuggestion = `${activeP.title} vence en ${remaining} días`;
             todaySeverity = 'warning';
        } else {
             todaySuggestion = `En curso: ${activeP.title}`;
        }
    } else if (processedPhases.every(p => p.status === 'PENDIENTE')) {
         todaySuggestion = "Proceso no iniciado";
         todaySeverity = 'secondary';
    } else {
         todaySuggestion = "Sin actividad crítica";
         todaySeverity = 'success';
    }

    return { phases: processedPhases, maxDays, dateColumns, todayOffset, intervalDays: compactMode ? 10 : 5, elapsedDays, todaySuggestion, todaySeverity };
  }, [phases, radDate, viewMode, compactMode, suspensionPreActa, suspensionPostActa, extension, scheduleConfig, systemToday, manager]);

  const scaleFactor = useMemo(() => (compactMode ? 3 : 8), [compactMode]);
  const totalWidthPx = useMemo(() => ganttData.maxDays * scaleFactor, [ganttData.maxDays, scaleFactor]);
  const ROW_HEIGHT_BASE = compactMode ? 34 : 50; 
  const getRowHeight = (phase) => phase.suspensionInfo ? ROW_HEIGHT_BASE + (compactMode ? 16 : 25) : ROW_HEIGHT_BASE;
  const HEADER_HEIGHT = compactMode ? 46 : 56; 
  const totalBodyHeight = useMemo(() => ganttData.phases.reduce((acc, p) => acc + getRowHeight(p), 0), [ganttData.phases, compactMode]);
  const gridVars = useMemo(() => {
    return {
      '--gantt-day-width': `${scaleFactor}px`,
      '--gantt-major-step': `${ganttData.intervalDays * scaleFactor}px`,
      '--gantt-grid-minor-alpha': compactMode ? 0.04 : 0.04,
      '--gantt-grid-major-alpha': compactMode ? 0.12 : 0.10,
    };
  }, [scaleFactor, ganttData.intervalDays, compactMode]);

  if (!radDate || ganttData.phases.length === 0) {
    return ( <div className="gantt-empty"> <i className="fas fa-calendar-times" /> <p>No hay datos disponibles para el diagrama</p> </div> );
  }

  // --- RENDERIZADO DE MARCADORES (PUNTOS) ---
  const renderMarkersInternal = (markers, blockWidth) => {
    if (!markers || markers.length === 0) return null;
    return markers.map((marker, i) => {
        const posPct = (marker.offsetDays / blockWidth) * 100;
        if (posPct > 120 && viewMode === 'real') return null;

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
              className="gantt-marker-icon gantt-scheduled-marker" 
              style={{ left: `${posPct}%` }} 
              onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipContent); }} 
              onMouseLeave={handleMouseLeave} 
          >
          </div> 
        );
    });
  };

  // --- RENDERIZADO DE BARRAS PRINCIPALES ---
  const renderBarWithTrack = (rowInfo, phase, phaseStartDate) => {
    const barClass = getSemaphoreClass(rowInfo.status, rowInfo.actorUsed, rowInfo.actorTotal);
    
    const trackStyle = { width: `${rowInfo.trackPct}%` };
    const fillStyle = { width: `${rowInfo.progressPct}%` }; 
    
    const hasError = rowInfo.overdueDays > 0;
    const errorStyle = { left: `${rowInfo.trackPct}%`, width: `${rowInfo.errorPct}%` };

    const hasScheduledError = rowInfo.scheduledOverdueDays > 0;
    const scheduledLimitPct = ( (rowInfo.actorUsed - rowInfo.scheduledOverdueDays) / phase.blockWidth ) * 100;
    const scheduledErrorStyle = { 
        left: `${scheduledLimitPct}%`, 
        width: `${rowInfo.scheduledOverduePct}%`,
        zIndex: 6 
    };

    const dateLimit = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorTotal) : null;
    const dateActual = phaseStartDate ? sumarDiasHabiles(phaseStartDate, rowInfo.actorUsed) : null;
    
    const tooltipTrack = ( <div> <strong>Límite Legal</strong><br/> Días: {rowInfo.actorTotal}<br/> Fecha: {dateLimit ? moment(dateLimit).format('DD/MM/YYYY') : '--'} </div> );
    const tooltipFill = ( <div> <strong>{rowInfo.label || 'Progreso'}</strong><br/> Estado: {rowInfo.status}<br/> Días usados: {rowInfo.actorUsed}<br/> Fecha Corte: {dateActual ? moment(dateActual).format('DD/MM/YYYY') : '--'} </div> );
    const tooltipError = hasError ? ( <div> <strong style={{color: '#ff6b6b'}}>Retraso Legal / Exceso</strong><br/> Días extra: {rowInfo.overdueDays}<br/> Total acumulado: {rowInfo.actorUsed} días </div> ) : null;
    
    const tooltipScheduledError = hasScheduledError ? (
        <div> 
            <strong style={{color: '#fd7e14'}}>Desviación de Programación</strong><br/> 
            Días excedidos: {rowInfo.scheduledOverdueDays}<br/> 
            <small>Respecto al tiempo programado</small>
        </div> 
    ) : null;

    let suspensionCutout = null;
    if (phase.suspensionInfo && rowInfo.actorTotal > 0 && phase.startDate) {
        const susStartOffsetFromPhaseStart = calcularDiasHabiles(phase.startDate, sumarDiasHabiles(radDate, phase.suspensionInfo.startOffset), false);
        const leftPct = (susStartOffsetFromPhaseStart / rowInfo.actorTotal) * 100;
        const widthPct = (phase.suspensionInfo.duration / rowInfo.actorTotal) * 100;
        if(leftPct >= 0 && leftPct < 100){
            suspensionCutout = ( <div className="gantt-progress-cutout" style={{ left: `${leftPct}%`, width: `${widthPct}%` }} /> );
        }
    }

    let extensionSegment = null;
    const shouldShowExtensionOnThisRow = (rowInfo.type === 'primary' || rowInfo.type === 'single');
    if (phase.extensionInfo && rowInfo.actorTotal > 0 && phase.startDate && shouldShowExtensionOnThisRow) {
        const extDays = phase.extensionInfo.days;
        const widthPct = (extDays / rowInfo.actorTotal) * 100;
        const leftPct = 100 - widthPct;
        
        const tooltipExtension = (
            <div>
                <strong style={{color: '#66d9e8'}}>PRÓRROGA</strong><br/>
                Ubicación: <strong>{phase.extensionInfo.phaseContext}</strong><br/>
                Días adicionales: {extDays}<br/>
                Inicio: {moment(phase.extensionInfo.date).format('DD/MM/YYYY')}
            </div>
        );

        if (widthPct > 0) {
            extensionSegment = (
                <div 
                    className="gantt-extension-segment striped-extension" 
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipExtension); }}
                    onMouseLeave={handleMouseLeave}
                >
                    {!compactMode && widthPct > 15 && <span className="gantt-extension-label">PRÓRROGA</span>}
                    {!compactMode && widthPct <= 15 && <span className="gantt-extension-label">P</span>}
                </div>
            );
        }
    }

    const showMarkers = (rowInfo.type === 'single' || rowInfo.type === 'primary');
    const markersElement = showMarkers ? renderMarkersInternal(phase.markers, phase.blockWidth) : null;

    return (
      <div className="gantt-bar-single">
         <div className="gantt-bar-bg" style={trackStyle} onMouseMove={(e) => handleMouseMove(e, tooltipTrack)} onMouseLeave={handleMouseLeave} >
            <div className={`gantt-bar-fill ${barClass}`} style={fillStyle} onMouseMove={(e) => { e.stopPropagation(); handleMouseMove(e, tooltipFill); }} onMouseLeave={handleMouseLeave} />
            {suspensionCutout}
            {extensionSegment}
            {markersElement}
         </div>
         {hasScheduledError && ( 
             <div 
                className="gantt-error-line scheduled" 
                style={scheduledErrorStyle} 
                onMouseMove={(e) => handleMouseMove(e, tooltipScheduledError)} 
                onMouseLeave={handleMouseLeave} 
             /> 
         )}
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
  
  const renderSuspensionRow = (phase) => {
    if (!phase.suspensionInfo) return null;
    const { startOffset, duration } = phase.suspensionInfo;
    const leftPx = (startOffset - phase.startPosition) * scaleFactor;
    const widthPx = duration * scaleFactor;
    const tooltipContent = ( <div> <strong>Suspensión de Términos</strong><br /> <span>{duration} días hábiles</span> </div> );

    return (
      <>
        <div className="gantt-suspension-track">
          <div className="gantt-suspension-bar" style={{ left: `${leftPx}px`, width: `${widthPx}px` }} onMouseMove={(e) => handleMouseMove(e, tooltipContent)} onMouseLeave={handleMouseLeave} >
            {!compactMode && <strong class="gantt-extension-label">SUSPENSIÓN</strong>}
          </div>
        </div>
        <div className="gantt-suspension-guideline" style={{ left: `${leftPx}px` }} />
        <div className="gantt-suspension-guideline" style={{ left: `${leftPx + widthPx}px` }} />
      </>
    );
  };

  // --- RENDERIZADO DE ETIQUETA DE FASE (HITO/MILESTONE) ---
  const renderPhaseMilestone = (phase) => {
    // Si estamos en modo compacto (disableTooltips activo), ocultamos estos hitos para limpiar la vista
    if (!phase.phaseMilestone || !showMilestones || disableTooltips) return null;
    
    const { offset, title, date, duration, isPhase1 } = phase.phaseMilestone;
    
    // Posición absoluta dentro de la fila de la fase
    const leftPx = (offset - phase.startPosition) * scaleFactor;

    // Determina si la tarjeta va arriba o abajo
    const positionClass = isPhase1 ? 'bottom' : 'top';
    
    // Si es la Fase 1 o el offset es muy pequeño, alineamos a la izquierda para que no se corte
    const alignmentClass = (isPhase1 || offset < 5) ? 'align-left' : '';

    return (
        <div 
            className="gantt-row-milestone" 
            style={{ left: `${leftPx}px` }}
        >
            <div className="gantt-row-milestone-line"></div>
            <div className={`gantt-row-milestone-card ${positionClass} ${alignmentClass}`}>
                <strong>{title}</strong>
                <span className="milestone-date">{moment(date).format('DD/MM/YY')}</span>
                {/* Nuevo: Días consumidos */}
                <span className="milestone-duration">{duration} días</span>
            </div>
        </div>
    );
  };

  return (
    <div className={`gantt-container ${compactMode ? 'gantt-compact' : ''}`}>
      {!disableTooltips && <FloatingTooltip {...tooltip} />}

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
          </div>
        </div>
        
        {!compactMode && (
          <button 
             className={`gantt-milestone-toggle ${showMilestones ? 'active' : ''}`}
             onClick={() => setShowMilestones(!showMilestones)}
             title={showMilestones ? "Ocultar Hitos" : "Ver Hitos de Finalización"}
          >
             <i className="fas fa-flag-checkered"></i>
          </button>
        )}
      </div>

      <div className="gantt-body-wrapper">
        <div className="gantt-body-titles" ref={titlesScrollRef}>
           {ganttData.phases.map((phase) => {
              const isActive = activePhaseId === phase.id;
              const rowHeight = getRowHeight(phase);
              return (
                <div key={phase.id} className={`gantt-phase-row-title ${phase.highlightClass || ''} ${isActive ? 'gantt-phase-active gantt-row-highlighted' : ''} ${phase.suspensionInfo ? 'gantt-phase-with-suspension' : ''}`} onClick={() => onPhaseClick?.(phase)} style={{ height: `${rowHeight}px` }} >
                  <div className="gantt-phase-number">{phase.phaseIndex}</div>
                  {!compactMode && <span className="gantt-phase-title-text">{phase.title}</span>}
                </div>
              );
            })}
        </div>

        <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
          <div className="gantt-body-content gantt-grid" style={{ width: `${totalWidthPx}px`, height: `${totalBodyHeight}px`, ...gridVars }} >
            
            {/* --- LINEA DE HOY + TARJETA INFORMATIVA --- */}
            {ganttData.todayOffset >= 0 && ( 
                <div className="gantt-today-line" style={{ left: `${ganttData.todayOffset * scaleFactor}px` }}>
                    {!compactMode && !disableTooltips && (
                        <div className={`gantt-today-card ${ganttData.todaySeverity}`}>
                            <div className="today-header">
                                <strong>HOY</strong>
                                <span>{moment(systemToday).format('DD MMM')}</span>
                            </div>
                            <div className="today-stat">
                                {ganttData.elapsedDays} días transcurridos
                            </div>
                            <div className="today-footer">
                                {ganttData.todaySuggestion}
                            </div>
                        </div>
                    )}
                    {/* Flecha inferior */}
                    <div className="gantt-today-marker-head">
                       <div className="gantt-today-triangle"></div>
                    </div>
                </div> 
            )}

            {(() => {
                let cumulativeTop = 0;
                return ganttData.phases.map((phase) => {
                    const isActive = activePhaseId === phase.id;
                    const rowHeight = getRowHeight(phase);
                    const topPx = cumulativeTop;
                    cumulativeTop += rowHeight;
                    
                    const barHeight = compactMode ? 10 : 16;
                    const mainBarTopPadding = phase.suspensionInfo ? (compactMode ? '15%' : '25%') : '50%';
                    const mainBarTransform = 'translateY(-50%)';

                    return (
                      <React.Fragment key={`task-wrapper-${phase.id}`}>
                        <div 
                          className={`gantt-grid-row-line ${isActive ? 'gantt-row-highlighted-bg' : ''}`} 
                          style={{ top: `${topPx + rowHeight}px`, width: '100%' }} 
                        />
                        
                        {/* Contenedor relativo para posicionar barra y milestone dentro de la misma fila */}
                        <div 
                            className={`gantt-task-container ${phase.suspensionInfo ? 'gantt-phase-with-suspension' : ''}`} 
                            style={{ left: `${phase.startPosition * scaleFactor}px`, width: `${phase.blockWidth * scaleFactor}px`, top: `${topPx}px`, height: `${rowHeight}px` }} 
                            onClick={() => onPhaseClick?.(phase)} 
                        >
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
                          
                          {renderSuspensionRow(phase)}
                          
                          {/* Renderizar Milestone localmente en la fila */}
                          {renderPhaseMilestone(phase)}
                        </div>
                      </React.Fragment>
                    );
                });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};