import React, { useMemo, useState, useRef, useLayoutEffect } from 'react';
import moment from 'moment';
import { sumarDiasHabiles } from '../../hooks/useClocksManager';

/**
 * GanttChart
 * Cambios clave:
 * - Cuadrícula vertical solo en el cuerpo (barras) para alinear visualmente días/columnas.
 * - Se elimina el "bloque blanco" y el "contenedor blanco": se renderiza SOLO barra(s).
 * - Barras paralelas centradas dentro de la fila, sin crecer altura.
 * - Se elimina el espaciado entre filas (sin conectores y sin margin-bottom).
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

  useLayoutEffect(() => {
    const headerEl = headerScrollRef.current;
    const bodyEl = bodyScrollRef.current;
    if (!headerEl || !bodyEl) return;

    const syncScroll = (e) => {
      if (e.target === headerEl) bodyEl.scrollLeft = headerEl.scrollLeft;
      else headerEl.scrollLeft = bodyEl.scrollLeft;
    };

    headerEl.addEventListener('scroll', syncScroll);
    bodyEl.addEventListener('scroll', syncScroll);

    return () => {
      headerEl.removeEventListener('scroll', syncScroll);
      bodyEl.removeEventListener('scroll', syncScroll);
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

    const maxDays = cumulativeDays;

    const dateColumns = [];
    const intervalDays = compactMode ? 10 : 5;

    for (let i = 0; i <= maxDays; i += intervalDays) {
      dateColumns.push({
        day: i,
        date: sumarDiasHabiles(ldfDate, i),
        position: i,
      });
    }

    if (dateColumns.length === 0 || dateColumns[dateColumns.length - 1].day !== maxDays) {
      dateColumns.push({
        day: maxDays,
        date: sumarDiasHabiles(ldfDate, maxDays),
        position: maxDays,
      });
    }

    return { phases: processedPhases, maxDays, dateColumns, intervalDays };
  }, [phases, ldfDate, adjustedWidthMode, compactMode, suspensionPreActa, suspensionPostActa, extension]);

  const scaleFactor = useMemo(() => (compactMode ? 2 : 8), [compactMode]);

  const totalWidthPx = ganttData.maxDays * scaleFactor;

  const gridVars = useMemo(() => {
    const majorStepPx = ganttData.intervalDays * scaleFactor;
    return {
      '--gantt-day-width': `${scaleFactor}px`,
      '--gantt-major-step': `${majorStepPx}px`,
      '--gantt-grid-minor-alpha': compactMode ? 0 : 0.04,
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
          <div className="gantt-header" style={{ width: `${totalWidthPx}px` }}>
            <div className="gantt-timeline">
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
      </div>

      {/* BODY */}
      <div className="gantt-body-scroll-wrapper" ref={bodyScrollRef}>
        {ganttData.phases.map((phase) => {
          const leftPx = phase.startPosition * scaleFactor;
          const widthPx = phase.blockWidth * scaleFactor;

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

              <div className="gantt-phase-bars-container">
                <div
                  className="gantt-phase-bars gantt-grid"
                  style={{
                    width: `${totalWidthPx}px`,
                    ...gridVars,
                  }}
                >
                  {/* SOLO BARRAS */}
                  <div className="gantt-task" style={{ left: `${leftPx}px`, width: `${widthPx}px` }}>
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
