import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles } from '../../hooks/useClocksManager';

/**
 * GanttChart (Versión Corregida)
 * - Estructura de layout robusta para alineación perfecta.
 * - Sincronización de scroll mejorada.
 * - CSS simplificado y basado en `box-sizing: border-box`.
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
  const isSyncing = useRef(false); // Flag para evitar bucles de scroll

  useLayoutEffect(() => {
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!headerEl || !bodyEl) return;

    const syncScroll = (source, target) => (event) => {
      if (isSyncing.current) return;
      isSyncing.current = true;
      target.scrollLeft = event.target.scrollLeft;
      // Usamos requestAnimationFrame para resetear el flag en el próximo frame
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

  const ganttData = useMemo(() => {
    if (!ldfDate || phases.length === 0) {
      return { phases: [], maxDays: 0, dateColumns: [] };
    }

    let cumulativeDays = 0;
    const processedPhases = [];

    phases.forEach((phase, index) => {
      const {
        id,
        totalDays = 0,
        usedDays = 0,
        ganttBlockDays,
        parallelActors,
        endDate,
        relatedStates,
      } = phase;

      const blockBaseDays = safeInt(ganttBlockDays ?? totalDays, 0);

      let rawBlockWidth = blockBaseDays;
      if (adjustedWidthMode && endDate) rawBlockWidth = safeInt(usedDays, 0);

      const blockWidth = ensureMinWidth(rawBlockWidth);

      const hasParallelActors = !!parallelActors?.primary && !!parallelActors?.secondary;

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

      const phaseData = {
        ...phase,
        phaseIndex: index + 1,
        startPosition: cumulativeDays,
        blockWidth,
        blockBaseDays: ensureMinWidth(blockBaseDays),
        hasParallelActors,
        hasSuspensionPreActa,
        hasSuspensionPostActa,
        hasExtension,
        rows: [],
      };

      if (hasParallelActors) {
        phaseData.rows.push({
          type: 'primary',
          actor: parallelActors.primary,
          status: parallelActors.primary.status,
        });
        phaseData.rows.push({
          type: 'secondary',
          actor: parallelActors.secondary,
          status: parallelActors.secondary.status,
        });
      } else {
        phaseData.rows.push({
          type: 'single',
          actor: { name: phase.responsible },
          status: phase.status,
        });
      }

      processedPhases.push(phaseData);
      cumulativeDays += blockWidth;
    });

    const maxDays = cumulativeDays > 0 ? cumulativeDays : 50; // Asegurar un ancho mínimo

    const dateColumns = [];
    const intervalDays = compactMode ? 10 : 5;

    for (let i = 0; i <= maxDays; i += intervalDays) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(ldfDate, i),
        position: i,
      });
    }

    // Asegurarse de que el último marcador exista si no cae exactamente en el intervalo
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
    if (phase.hasSuspensionPreActa) {
      segments.push(
        <div
          key="susp-pre"
          className="gantt-segment gantt-segment-suspension"
          title="Suspensión (pre-acta)"
        />
      );
    }
    if (phase.hasSuspensionPostActa) {
      segments.push(
        <div
          key="susp-post"
          className="gantt-segment gantt-segment-suspension"
          title="Suspensión (post-acta)"
        />
      );
    }
    if (phase.hasExtension) {
      segments.push(
        <div key="extension" className="gantt-segment gantt-segment-extension" title="Prórroga" />
      );
    }

    if (segments.length === 0) return null;
    return <div className="gantt-extra-segments">{segments}</div>;
  };

  if (!ldfDate || ganttData.phases.length === 0) {
    return (
      <div className="gantt-empty">
        <i className="fas fa-calendar-times" />
        <p>No hay datos disponibles para el diagrama</p>
      </div>
    );
  }

  return (
    <div className={`gantt-container ${compactMode ? 'gantt-compact' : ''}`}>
      {/* HEADER */}
      <div className="gantt-header-wrapper">
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
                  {compactMode ? `${col.day}d` : `Día ${col.day}`}
                </span>

                {!compactMode && hoveredDay?.day === col.day && (
                  <div className="gantt-timeline-tooltip">{moment(col.date).format('DD/MM/YYYY')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="gantt-body-wrapper">
        <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
          <div className="gantt-body-content">
            {ganttData.phases.map((phase) => {
              const isActive = activePhaseId === phase.id;
              return (
                <div
                  key={phase.id}
                  className={`gantt-phase ${phase.highlightClass || ''} ${isActive ? 'gantt-phase-active' : ''}`}
                  onClick={() => onPhaseClick?.(phase)}
                >
                  <div className="gantt-phase-title-column">
                    <div className="gantt-phase-number">{phase.phaseIndex}</div>
                    {!compactMode && <span className="gantt-phase-title">{phase.title}</span>}
                  </div>
                  {/* El contenedor de las barras ahora está fuera de la columna de título */}
                </div>
              );
            })}
             {/* Las barras y la grilla se renderizan por separado para un posicionamiento absoluto preciso */}
            <div
              className="gantt-phase-bars gantt-grid"
              style={{
                width: `${totalWidthPx}px`,
                height: '100%',
                ...gridVars,
              }}
            >
              {ganttData.phases.map((phase, index) => {
                const leftPx = phase.startPosition * scaleFactor;
                const widthPx = phase.blockWidth * scaleFactor;
                // La posición 'top' se calcula dinámicamente según la altura de las filas anteriores
                const topPx = compactMode ? index * (26 + 12) : index * 45; // 44px de alto + 1px de borde
                const heightPx = compactMode ? 26 : 44;

                return (
                  <div 
                    key={`task-${phase.id}`}
                    className="gantt-task" 
                    style={{ left: `${leftPx}px`, width: `${widthPx}px`, top: `${topPx}px`, height: `${heightPx}px` }}
                  >
                    {phase.hasParallelActors ? (
                      <div className="gantt-bar-stack" aria-label="Actores paralelos">
                        <div className={`gantt-bar ${statusToClass(phase.rows[0]?.status)}`} />
                        <div className={`gantt-bar ${statusToClass(phase.rows[1]?.status)}`} />
                      </div>
                    ) : (
                      <div className={`gantt-bar ${statusToClass(phase.rows[0]?.status)}`} />
                    )}
                    {renderExtraSegments(phase)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};