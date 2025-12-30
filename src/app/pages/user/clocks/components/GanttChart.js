import React, { useState } from 'react';
import moment from 'moment';
import { 
  calculateGanttData, 
  generateTimelineData, 
  calculateProgress, 
  formatGanttDate, 
  getStatusClass,
  calculateDaysDistribution 
} from '../utils/ganttUtils';

/**
 * Componente principal del Diagrama de Gantt
 * Vista completa que se muestra en modal
 */
export const GanttChart = ({ manager }) => {
  const [visualizationMode, setVisualizationMode] = useState('legal');

  if (!manager || !manager.processPhases || manager.processPhases.length === 0) {
    return (
      <div className="gantt-full-view">
        <div className="text-center text-muted py-5">
          <i className="fas fa-spinner fa-spin me-2" style={{ fontSize: '2rem' }} />
          <p className="mt-3">Calculando diagrama de Gantt...</p>
        </div>
      </div>
    );
  }

  const ganttData = calculateGanttData(manager, visualizationMode);
  const timelineData = generateTimelineData(ganttData);
  const daysDistribution = calculateDaysDistribution(manager);

  const toggleMode = () => {
    setVisualizationMode(prev => prev === 'legal' ? 'actual' : 'legal');
  };

  // Calcular ancho de cada día en el timeline (en pixels)
  const dayWidth = 10; // 10px por día
  const totalWidth = ganttData.totalDuration * dayWidth;

  return (
    <div className="gantt-full-view">
      {/* Header con controles */}
      <div className="gantt-controls">
        <div className="gantt-info">
          <div className="gantt-title">
            <i className="fas fa-chart-gantt me-2" />
            <h4 className="mb-0">Diagrama de Gantt del Proceso</h4>
          </div>
          <div className="gantt-dates">
            <span className="gantt-date-item">
              <i className="fas fa-play-circle me-1" />
              Inicio: <strong>{formatGanttDate(ganttData.startDate)}</strong>
            </span>
            <span className="gantt-date-item">
              <i className="fas fa-flag-checkered me-1" />
              Fin Proyectado: <strong>{formatGanttDate(ganttData.endDate)}</strong>
            </span>
            <span className="gantt-date-item">
              <i className="fas fa-calendar-alt me-1" />
              Duración: <strong>{ganttData.totalDuration} días</strong>
            </span>
          </div>
        </div>

        <div className="gantt-mode-toggle">
          <button
            className={`btn-mode ${visualizationMode === 'legal' ? 'active' : ''}`}
            onClick={toggleMode}
          >
            <i className="fas fa-gavel me-2" />
            Límites Legales
          </button>
          <button
            className={`btn-mode ${visualizationMode === 'actual' ? 'active' : ''}`}
            onClick={toggleMode}
          >
            <i className="fas fa-calendar-check me-2" />
            Fechas de Evento
          </button>
        </div>
      </div>

      {/* Información de distribución de días */}
      <div className="gantt-distribution-info">
        <div className="distribution-card">
          <div className="distribution-header">
            <i className="fas fa-calculator me-2" />
            <span>Distribución de Días (Acta Parte 1 / Parte 2)</span>
          </div>
          <div className="distribution-body">
            <div className="distribution-item">
              <span className="label">Acta Parte 1:</span>
              <span className="value">{daysDistribution.part1Days} días</span>
            </div>
            <div className="distribution-item">
              <span className="label">Acta Parte 2:</span>
              <span className="value">{daysDistribution.part2Days} días</span>
            </div>
            <div className="distribution-item total">
              <span className="label">Total Disponible:</span>
              <span className="value">{daysDistribution.totalDays} días</span>
            </div>
          </div>
          {!daysDistribution.hasActa1Date && (
            <div className="distribution-note">
              <i className="fas fa-info-circle me-1" />
              Sin fecha de Acta Parte 1: usando límites legales (44d / 1d)
            </div>
          )}
        </div>

        <div className="gantt-summary-stats">
          <div className="stat-item">
            <div className="stat-icon bg-primary">
              <i className="fas fa-calendar-day" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Base Legal</span>
              <span className="stat-value">{ganttData.baseDays} días</span>
            </div>
          </div>
          
          {ganttData.suspensionDays > 0 && (
            <div className="stat-item">
              <div className="stat-icon bg-warning">
                <i className="fas fa-pause" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Suspensiones</span>
                <span className="stat-value">{ganttData.suspensionDays} días</span>
              </div>
            </div>
          )}
          
          {ganttData.extensionDays > 0 && (
            <div className="stat-item">
              <div className="stat-icon bg-info">
                <i className="fas fa-clock" />
              </div>
              <div className="stat-content">
                <span className="stat-label">Prórroga</span>
                <span className="stat-value">{ganttData.extensionDays} días</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline principal */}
      <div className="gantt-timeline-container">
        {/* Encabezado del timeline con escala de días */}
        <div className="gantt-timeline-header">
          <div className="gantt-phases-column">
            <span className="column-title">Fases del Proceso</span>
          </div>
          <div className="gantt-chart-column" style={{ width: `${totalWidth}px` }}>
            <div className="gantt-scale">
              {Array.from({ length: Math.ceil(ganttData.totalDuration / 10) }, (_, i) => (
                <div key={i} className="gantt-scale-mark" style={{ left: `${i * 10 * dayWidth}px` }}>
                  <span>{i * 10}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fases del timeline */}
        <div className="gantt-timeline-body">
          {timelineData.map((phase, index) => (
            <div key={phase.id} className="gantt-timeline-row">
              {/* Información de la fase */}
              <div className="gantt-phases-column">
                <div className="gantt-phase-cell">
                  <div className="phase-name">
                    <i className="fas fa-layer-group me-2" />
                    <span>{phase.title}</span>
                  </div>
                  <div className="phase-meta">
                    <span className={`phase-status-badge ${getStatusClass(phase.status)}`}>
                      {phase.status}
                    </span>
                    <span className="phase-responsible">
                      <i className={`fas ${getResponsibleIcon(phase.responsible)} me-1`} />
                      {getResponsibleName(phase.responsible)}
                    </span>
                  </div>
                  <div className="phase-dates">
                    <span className="date-start">
                      {formatGanttDate(phase.startDate)}
                    </span>
                    <i className="fas fa-arrow-right mx-2" />
                    <span className="date-end">
                      {phase.endDate ? formatGanttDate(phase.endDate) : 'En progreso'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra del Gantt */}
              <div className="gantt-chart-column" style={{ width: `${totalWidth}px` }}>
                <div 
                  className="gantt-bar-container"
                  style={{
                    marginLeft: `${phase.timelineStart * dayWidth}px`,
                    width: `${phase.duration * dayWidth}px`
                  }}
                >
                  {/* Barra base */}
                  <div className={`gantt-bar ${getStatusClass(phase.status)}`}>
                    {/* Progreso */}
                    <div 
                      className="gantt-bar-progress"
                      style={{ width: `${phase.timelineProgress}%` }}
                    >
                      <span className="gantt-bar-label">
                        {phase.usedDays}/{phase.duration}d
                      </span>
                    </div>

                    {/* Suspensiones */}
                    {phase.suspensions?.map((susp, idx) => {
                      const suspWidth = (susp.days / phase.duration) * 100;
                      return (
                        <div
                          key={`susp-${idx}`}
                          className="gantt-suspension-block"
                          style={{ 
                            width: `${suspWidth}%`,
                            left: '100%'
                          }}
                          title={`Suspensión ${susp.type}: ${susp.days} días`}
                        >
                          <span className="suspension-label">{susp.days}d</span>
                        </div>
                      );
                    })}

                    {/* Prórrogas */}
                    {phase.extensions?.map((ext, idx) => {
                      const extWidth = (ext.days / phase.duration) * 100;
                      const suspTotal = phase.suspensions?.reduce((sum, s) => sum + s.days, 0) || 0;
                      const suspWidthTotal = (suspTotal / phase.duration) * 100;
                      return (
                        <div
                          key={`ext-${idx}`}
                          className="gantt-extension-block"
                          style={{ 
                            width: `${extWidth}%`,
                            left: `${100 + suspWidthTotal}%`
                          }}
                          title={`Prórroga: ${ext.days} días`}
                        >
                          <span className="extension-label">{ext.days}d</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actores en paralelo */}
                  {phase.isParallel && phase.actors.length > 0 && (
                    <div className="gantt-parallel-tracks">
                      {phase.actors.map((actor, actorIdx) => (
                        <div key={actorIdx} className="gantt-parallel-track">
                          <div className={`gantt-actor-bar gantt-actor-${actor.color}`}>
                            <div 
                              className="gantt-actor-progress"
                              style={{ width: `${calculateProgress(actor.usedDays, actor.totalDays)}%` }}
                            />
                            <span className="gantt-actor-label">
                              <i className={`fas ${actor.icon} me-1`} />
                              {actor.name}: {actor.usedDays}/{actor.totalDays}d
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="gantt-legend-full">
        <div className="legend-title">
          <i className="fas fa-info-circle me-2" />
          Leyenda
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color gantt-status-completed" />
            <span>Completado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color gantt-status-active" />
            <span>En Curso</span>
          </div>
          <div className="legend-item">
            <div className="legend-color gantt-status-paused" />
            <span>Pausado</span>
          </div>
          <div className="legend-item">
            <div className="legend-color gantt-status-pending" />
            <span>Pendiente</span>
          </div>
          <div className="legend-item">
            <div className="legend-color gantt-status-overdue" />
            <span>Vencido</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-warning" />
            <span>Suspensión</span>
          </div>
          <div className="legend-item">
            <div className="legend-color bg-info" />
            <span>Prórroga</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helpers
const getResponsibleIcon = (responsible) => {
  switch (responsible) {
    case 'Curaduria': return 'fa-building';
    case 'Solicitante': return 'fa-user';
    case 'Mixto': return 'fa-users';
    default: return 'fa-user-tie';
  }
};

const getResponsibleName = (responsible) => {
  switch (responsible) {
    case 'Curaduria': return 'Curaduría';
    case 'Solicitante': return 'Solicitante';
    case 'Mixto': return 'Mixto';
    default: return responsible || 'Responsable';
  }
};
