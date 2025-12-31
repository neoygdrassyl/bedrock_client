import React, { useState, useMemo } from 'react';
import moment from 'moment';
import {
  calculateGanttData,
  calculateGanttDateRange,
  calculateBarWidth,
  calculateBarOffset,
  generateTimelineMarkers,
  getStatusColor,
  getResponsibleIcon,
  formatGanttTooltip,
} from '../utils/ganttUtils';

/**
 * Componente principal del Diagrama de Gantt
 * Visualiza las fases del proceso en formato de línea de tiempo
 */
export const GanttDiagram = ({ manager, mode = 'legal', compact = false, onModeChange }) => {
  const { processPhases } = manager || {};

  // Calcular datos del diagrama
  const ganttBars = useMemo(() => {
    if (!processPhases || processPhases.length === 0) return [];
    return calculateGanttData(processPhases, manager, mode);
  }, [processPhases, manager, mode]);

  const dateRange = useMemo(() => calculateGanttDateRange(ganttBars), [ganttBars]);
  const timelineMarkers = useMemo(() => generateTimelineMarkers(dateRange.start, dateRange.end), [dateRange]);

  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!processPhases || processPhases.length === 0) {
    return (
      <div className={`gantt-diagram ${compact ? 'compact' : ''}`}>
        <div className="gantt-empty">
          <i className="fas fa-chart-gantt fa-2x text-muted mb-2" />
          <p className="text-muted mb-0">No hay datos para mostrar</p>
        </div>
      </div>
    );
  }

  const handleBarHover = (bar, event) => {
    if (bar) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
    setHoveredBar(bar);
  };

  const renderGanttBar = (bar, index) => {
    const {
      id,
      title,
      responsible,
      status,
      startDate,
      endDate,
      totalDays,
      usedDays,
      fillPercentage,
      highlightClass,
      parallelActors,
      suspensions,
      extensions,
    } = bar;

    if (!startDate) {
      // Si no hay fecha de inicio, mostrar barra vacía/pendiente
      return (
        <div key={id} className={`gantt-row ${highlightClass || ''}`}>
          <div className="gantt-row-label">
            <span className="gantt-phase-title" title={title}>
              <i className={`fas ${getResponsibleIcon(responsible)} me-1`} />
              {compact ? title.substring(0, 20) + (title.length > 20 ? '...' : '') : title}
            </span>
            <span className={`gantt-phase-status status-${getStatusColor(status)}`}>
              {status === 'PENDIENTE' ? 'Pendiente' : status}
            </span>
          </div>
          <div className="gantt-row-chart">
            <div className="gantt-bar-pending">
              <span className="pending-label">Sin fecha de inicio</span>
            </div>
          </div>
        </div>
      );
    }

    const barWidth = calculateBarWidth(startDate, endDate || startDate, dateRange.start, dateRange.end);
    const barOffset = calculateBarOffset(startDate, dateRange.start, dateRange.end);

    const statusColor = getStatusColor(status);

    return (
      <div key={id} className={`gantt-row ${highlightClass || ''}`}>
        <div className="gantt-row-label">
          <span className="gantt-phase-title" title={title}>
            <i className={`fas ${getResponsibleIcon(responsible)} me-1`} />
            {compact ? title.substring(0, 20) + (title.length > 20 ? '...' : '') : title}
          </span>
          <span className={`gantt-phase-status status-${statusColor}`}>
            <span className="status-days">{usedDays}/{totalDays}d</span>
          </span>
        </div>

        <div className="gantt-row-chart">
          <div
            className="gantt-bar-container"
            style={{ left: `${barOffset}%`, width: `${Math.max(barWidth, 2)}%` }}
          >
            {/* Barra base con días totales */}
            <div className={`gantt-bar gantt-bar-${statusColor}`}>
              {/* Relleno según días usados */}
              <div
                className={`gantt-bar-fill gantt-bar-fill-${statusColor}`}
                style={{ width: `${fillPercentage}%` }}
              />
              
              {/* Indicador de actores paralelos si aplica */}
              {parallelActors && (
                <div className="gantt-parallel-indicator">
                  <i className="fas fa-code-branch" title="Procesos paralelos" />
                </div>
              )}
            </div>

            {/* Suspensiones */}
            {suspensions && suspensions.map((susp, idx) => (
              <div
                key={`susp-${idx}`}
                className={`gantt-extension gantt-suspension gantt-suspension-${susp.type}`}
                title={`Suspensión: ${susp.days} días`}
              >
                <span className="extension-label">{susp.days}d</span>
              </div>
            ))}

            {/* Prórrogas */}
            {extensions && extensions.map((ext, idx) => (
              <div
                key={`ext-${idx}`}
                className="gantt-extension gantt-extension-badge"
                title={`Prórroga: ${ext.days} días`}
              >
                <span className="extension-label">+{ext.days}d</span>
              </div>
            ))}

            {/* Hover target para tooltip */}
            <div
              className="gantt-bar-hover-target"
              onMouseEnter={(e) => handleBarHover(bar, e)}
              onMouseLeave={() => handleBarHover(null, null)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`gantt-diagram ${compact ? 'compact' : ''}`}>
      {/* Header con controles */}
      {!compact && (
        <div className="gantt-header">
          <div className="gantt-title">
            <i className="fas fa-chart-gantt me-2" />
            <span>Diagrama de Gantt - Línea de Tiempo del Proceso</span>
          </div>
          <div className="gantt-controls">
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn btn-outline-primary ${mode === 'legal' ? 'active' : ''}`}
                onClick={() => onModeChange?.('legal')}
                title="Mostrar límites legales con proyección"
              >
                <i className="fas fa-gavel me-1" />
                Límites Legales
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${mode === 'event' ? 'active' : ''}`}
                onClick={() => onModeChange?.('event')}
                title="Mostrar solo fechas de eventos reales"
              >
                <i className="fas fa-calendar-check me-1" />
                Fechas de Evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline (eje X) */}
      {!compact && timelineMarkers.length > 0 && (
        <div className="gantt-timeline">
          <div className="gantt-timeline-spacer" />
          <div className="gantt-timeline-markers">
            {timelineMarkers.map((marker, idx) => (
              <div
                key={idx}
                className="gantt-timeline-marker"
                style={{ left: `${marker.position}%` }}
              >
                <div className="marker-line" />
                <div className="marker-label">{marker.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barras del Gantt */}
      <div className="gantt-body">
        {ganttBars.map((bar, index) => renderGanttBar(bar, index))}
      </div>

      {/* Tooltip */}
      {hoveredBar && (
        <div
          className="gantt-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
          dangerouslySetInnerHTML={{ __html: formatGanttTooltip(hoveredBar) }}
        />
      )}

      {/* Leyenda */}
      {!compact && (
        <div className="gantt-legend">
          <div className="legend-item">
            <span className="legend-color bg-primary" />
            <span>Activo</span>
          </div>
          <div className="legend-item">
            <span className="legend-color bg-success" />
            <span>Completado</span>
          </div>
          <div className="legend-item">
            <span className="legend-color bg-warning" />
            <span>Suspensión</span>
          </div>
          <div className="legend-item">
            <span className="legend-color bg-info" />
            <span>Prórroga</span>
          </div>
          <div className="legend-item">
            <i className="fas fa-code-branch me-1" />
            <span>Paralelo</span>
          </div>
        </div>
      )}
    </div>
  );
};
