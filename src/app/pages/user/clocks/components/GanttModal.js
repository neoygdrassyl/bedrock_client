import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { GanttChart } from './GanttChart';

/**
 * GanttModal - Modal para visualización completa del diagrama de Gantt (Regla 15)
 */
export const GanttModal = ({ 
  isOpen, 
  onClose, 
  phases, 
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  currentItem 
}) => {
  const [adjustedWidthMode, setAdjustedWidthMode] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);

  if (!isOpen) return null;

  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
  };

  const handleClosePhaseDetail = () => {
    setSelectedPhase(null);
  };

  const modalContent = (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div 
        className="gantt-modal-content" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="gantt-modal-header">
          <h3>
            <i className="fas fa-chart-gantt" />
            Diagrama de Gantt - Expediente {currentItem?.id}
          </h3>
          <div className="gantt-modal-controls">
            {/* Toggle para modo de ancho ajustado (Regla 14) */}
            <label className="gantt-toggle">
              <input
                type="checkbox"
                checked={adjustedWidthMode}
                onChange={(e) => setAdjustedWidthMode(e.target.checked)}
              />
              <span>Ancho Ajustado</span>
              <i 
                className="fas fa-info-circle gantt-info-icon"
                title="Ajusta el ancho de los bloques según el progreso real"
              />
            </label>
            <button 
              className="gantt-close-btn"
              onClick={onClose}
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Cuerpo del modal con el diagrama */}
        <div className="gantt-modal-body">
          <div className="gantt-modal-chart-container">
            <GanttChart
              phases={phases}
              ldfDate={ldfDate}
              suspensionPreActa={suspensionPreActa}
              suspensionPostActa={suspensionPostActa}
              extension={extension}
              compactMode={false}
              adjustedWidthMode={adjustedWidthMode}
              onPhaseClick={handlePhaseClick}
            />
          </div>

          {/* Panel lateral con detalles de la fase seleccionada */}
          {selectedPhase && (
            <div className="gantt-phase-detail">
              <div className="gantt-phase-detail-header">
                <h4>{selectedPhase.title}</h4>
                <button 
                  className="gantt-close-btn-small"
                  onClick={handleClosePhaseDetail}
                >
                  <i className="fas fa-times" />
                </button>
              </div>
              <div className="gantt-phase-detail-body">
                <div className="gantt-detail-row">
                  <span className="gantt-detail-label">Estado:</span>
                  <span className={`gantt-status-badge gantt-status-${selectedPhase.status.toLowerCase()}`}>
                    {selectedPhase.status}
                  </span>
                </div>
                <div className="gantt-detail-row">
                  <span className="gantt-detail-label">Responsable:</span>
                  <span>{selectedPhase.responsible}</span>
                </div>
                <div className="gantt-detail-row">
                  <span className="gantt-detail-label">Días Totales:</span>
                  <span>{selectedPhase.totalDays} días</span>
                </div>
                <div className="gantt-detail-row">
                  <span className="gantt-detail-label">Días Usados:</span>
                  <span>{selectedPhase.usedDays} días</span>
                </div>
                {selectedPhase.startDate && (
                  <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Fecha Inicio:</span>
                    <span>{selectedPhase.startDate}</span>
                  </div>
                )}
                {selectedPhase.endDate && (
                  <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Fecha Fin:</span>
                    <span>{selectedPhase.endDate}</span>
                  </div>
                )}
                
                {/* Información de actores paralelos */}
                {selectedPhase.hasParallelActors && (
                  <div className="gantt-detail-actors">
                    <h5>Actores Paralelos</h5>
                    <div className="gantt-actor-card">
                      <div className="gantt-actor-header">
                        <i className={`fas ${selectedPhase.parallelActors.primary.icon}`} />
                        <span>{selectedPhase.parallelActors.primary.name}</span>
                      </div>
                      <div className="gantt-actor-info">
                        <span>Días: {selectedPhase.parallelActors.primary.usedDays}/{selectedPhase.parallelActors.primary.totalDays}</span>
                        <span className={`gantt-status-badge gantt-status-${selectedPhase.parallelActors.primary.status.toLowerCase()}`}>
                          {selectedPhase.parallelActors.primary.status}
                        </span>
                      </div>
                    </div>
                    <div className="gantt-actor-card">
                      <div className="gantt-actor-header">
                        <i className={`fas ${selectedPhase.parallelActors.secondary.icon}`} />
                        <span>{selectedPhase.parallelActors.secondary.name}</span>
                      </div>
                      <div className="gantt-actor-info">
                        <span>Días: {selectedPhase.parallelActors.secondary.usedDays}/{selectedPhase.parallelActors.secondary.totalDays}</span>
                        <span className={`gantt-status-badge gantt-status-${selectedPhase.parallelActors.secondary.status.toLowerCase()}`}>
                          {selectedPhase.parallelActors.secondary.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Información de suspensiones/prórrogas */}
                {(selectedPhase.hasSuspensionPreActa || selectedPhase.hasSuspensionPostActa || selectedPhase.hasExtension) && (
                  <div className="gantt-detail-extras">
                    <h5>Eventos Especiales</h5>
                    {selectedPhase.hasSuspensionPreActa && (
                      <div className="gantt-extra-badge gantt-extra-suspension">
                        <i className="fas fa-pause-circle" />
                        Suspensión Pre-Acta
                      </div>
                    )}
                    {selectedPhase.hasSuspensionPostActa && (
                      <div className="gantt-extra-badge gantt-extra-suspension">
                        <i className="fas fa-pause-circle" />
                        Suspensión Post-Acta
                      </div>
                    )}
                    {selectedPhase.hasExtension && (
                      <div className="gantt-extra-badge gantt-extra-extension">
                        <i className="fas fa-clock" />
                        Prórroga
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con leyenda */}
        <div className="gantt-modal-footer">
          <div className="gantt-legend">
            <h5>Leyenda</h5>
            <div className="gantt-legend-items">
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-pending" />
                <span>Pendiente</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-active" />
                <span>Activo</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-completed" />
                <span>Completado</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-paused" />
                <span>Pausado</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-segment-suspension" />
                <span>Suspensión</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-segment-extension" />
                <span>Prórroga</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
