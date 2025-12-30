import React, { useState } from 'react';
import { calculateGanttData, generateTimelineData, calculateProgress, formatGanttDate, getStatusClass } from '../utils/ganttUtils';

/**
 * Componente de tarjeta compacta del diagrama de Gantt
 * Se muestra en el sidebar como una vista previa
 */
export const GanttCard = ({ manager, onOpenFullView }) => {
  const [visualizationMode, setVisualizationMode] = useState('legal');

  if (!manager || !manager.processPhases || manager.processPhases.length === 0) {
    return (
      <div className="gantt-card">
        <div className="gantt-card-header">
          <i className="fas fa-chart-gantt" />
          <span>Diagrama de Gantt</span>
        </div>
        <div className="gantt-card-body">
          <div className="text-center text-muted">
            <i className="fas fa-spinner fa-spin me-2" />
            Calculando...
          </div>
        </div>
      </div>
    );
  }

  const ganttData = calculateGanttData(manager, visualizationMode);
  const timelineData = generateTimelineData(ganttData);

  const toggleMode = () => {
    setVisualizationMode(prev => prev === 'legal' ? 'actual' : 'legal');
  };

  return (
    <div className="gantt-card">
      <div className="gantt-card-header">
        <div className="d-flex align-items-center">
          <i className="fas fa-chart-gantt me-2" />
          <span>Diagrama de Gantt</span>
        </div>
        
        <div className="gantt-header-actions">
          <button
            type="button"
            className={`btn-gantt-mode ${visualizationMode === 'legal' ? 'active' : ''}`}
            onClick={toggleMode}
            title="Alternar modo de visualización"
          >
            <i className={`fas fa-${visualizationMode === 'legal' ? 'gavel' : 'calendar-check'}`} />
          </button>
          <button
            type="button"
            className="btn-gantt-expand"
            onClick={onOpenFullView}
            title="Ver diagrama completo"
          >
            <i className="fas fa-expand" />
          </button>
        </div>
      </div>

      <div className="gantt-card-body">
        {/* Información resumida */}
        <div className="gantt-summary">
          <div className="gantt-summary-item">
            <span className="label">Total</span>
            <span className="value">{ganttData.totalDuration} días</span>
          </div>
          <div className="gantt-summary-item">
            <span className="label">Base</span>
            <span className="value">{ganttData.baseDays}d</span>
          </div>
          {ganttData.suspensionDays > 0 && (
            <div className="gantt-summary-item">
              <span className="label">Suspensiones</span>
              <span className="value text-warning">{ganttData.suspensionDays}d</span>
            </div>
          )}
          {ganttData.extensionDays > 0 && (
            <div className="gantt-summary-item">
              <span className="label">Prórroga</span>
              <span className="value text-info">{ganttData.extensionDays}d</span>
            </div>
          )}
        </div>

        {/* Modo de visualización */}
        <div className="gantt-mode-indicator">
          <i className={`fas fa-${visualizationMode === 'legal' ? 'gavel' : 'calendar-check'}`} />
          <span>{visualizationMode === 'legal' ? 'Límites Legales' : 'Fechas de Evento'}</span>
        </div>

        {/* Timeline compacto */}
        <div className="gantt-compact-timeline">
          {timelineData.slice(0, 5).map((phase, index) => (
            <div key={phase.id} className="gantt-compact-phase">
              <div className="gantt-phase-info">
                <div className="gantt-phase-title" title={phase.title}>
                  {phase.title}
                </div>
                <div className="gantt-phase-days">
                  {phase.usedDays}/{phase.duration}d
                </div>
              </div>
              
              <div className="gantt-phase-bar-container">
                <div className={`gantt-phase-bar ${getStatusClass(phase.status)}`}>
                  {/* Barra de progreso principal */}
                  <div 
                    className="gantt-phase-progress"
                    style={{ width: `${phase.timelineProgress}%` }}
                  />
                  
                  {/* Suspensiones */}
                  {phase.suspensions?.map((susp, idx) => (
                    <div
                      key={`susp-${idx}`}
                      className="gantt-phase-suspension"
                      style={{ 
                        width: `${(susp.days / phase.duration) * 100}%`,
                        marginLeft: `${phase.timelineProgress}%`
                      }}
                      title={`Suspensión: ${susp.days} días`}
                    />
                  ))}
                  
                  {/* Prórrogas */}
                  {phase.extensions?.map((ext, idx) => (
                    <div
                      key={`ext-${idx}`}
                      className="gantt-phase-extension"
                      style={{ 
                        width: `${(ext.days / phase.duration) * 100}%`,
                        marginLeft: `${phase.timelineProgress}%`
                      }}
                      title={`Prórroga: ${ext.days} días`}
                    />
                  ))}
                </div>
              </div>

              {/* Actores en paralelo */}
              {phase.isParallel && phase.actors.length > 0 && (
                <div className="gantt-parallel-actors">
                  {phase.actors.map((actor, actorIdx) => (
                    <div key={actorIdx} className="gantt-actor-mini">
                      <i className={`fas ${actor.icon}`} />
                      <span className="gantt-actor-name">{actor.name}</span>
                      <span className="gantt-actor-days">{actor.usedDays}/{actor.totalDays}d</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {timelineData.length > 5 && (
            <div className="gantt-compact-more">
              <button onClick={onOpenFullView} className="btn-gantt-more">
                <i className="fas fa-ellipsis-h" />
                Ver {timelineData.length - 5} fases más
              </button>
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="gantt-legend">
          <div className="gantt-legend-item">
            <div className="gantt-legend-color gantt-status-completed" />
            <span>Completado</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color gantt-status-active" />
            <span>En curso</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color bg-warning" />
            <span>Suspensión</span>
          </div>
          <div className="gantt-legend-item">
            <div className="gantt-legend-color bg-info" />
            <span>Prórroga</span>
          </div>
        </div>
      </div>

      <div className="gantt-card-footer">
        <button type="button" className="btn-gantt-footer" onClick={onOpenFullView}>
          <i className="fas fa-expand-arrows-alt me-2" />
          Ver Diagrama Completo
        </button>
      </div>
    </div>
  );
};
