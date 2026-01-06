import React, { useState } from 'react';
import { GanttChart } from './GanttChart';
import moment from 'moment';

// Pequeño componente para el panel de detalles
const PhaseDetailPanel = ({ phase, onClose, suspensionPreActa, suspensionPostActa, extension }) => {
    if (!phase) return null;

    const {
        title,
        status,
        startDate,
        endDate,
        totalDays,
        usedDays,
        responsible,
        parallelActors,
    } = phase;

    let statusInfo = {
        text: 'Pendiente',
        class: 'gantt-status-pendiente',
    };

    switch (status) {
        case 'ACTIVO': statusInfo = { text: 'En Curso', class: 'gantt-status-activo' }; break;
        case 'PAUSADO': statusInfo = { text: 'Pausado', class: 'gantt-status-pausado' }; break;
        case 'COMPLETADO': statusInfo = { text: 'Completado', class: 'gantt-status-completado' }; break;
        case 'VENCIDO': statusInfo = { text: 'Vencido', class: 'gantt-status-vencido' }; break;
    }

    return (
        <div className="gantt-phase-detail-content">
            <div className="gantt-phase-detail-header">
                <h4>{title}</h4>
                <button className="gantt-close-btn-small" onClick={onClose} title="Cerrar detalles">
                    <i className="fas fa-times" />
                </button>
            </div>
            <div className="gantt-phase-detail-body">
                <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Estado</span>
                    <span className={`gantt-status-badge ${statusInfo.class}`}>{statusInfo.text}</span>
                </div>
                <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Responsable</span>
                    <span>{responsible}</span>
                </div>
                <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Inicio</span>
                    <span>{startDate ? moment(startDate).format('DD MMM YYYY') : '-'}</span>
                </div>
                <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Fin</span>
                    <span>{endDate ? moment(endDate).format('DD MMM YYYY') : '-'}</span>
                </div>
                <div className="gantt-detail-row">
                    <span className="gantt-detail-label">Días Usados</span>
                    <span>{usedDays} / {totalDays}</span>
                </div>

                {parallelActors && (
                    <div className="gantt-detail-actors">
                        <h5>Actores Paralelos</h5>
                        <div className="gantt-actor-card">
                            <div className="gantt-actor-header">
                                <i className={`fas ${parallelActors.primary.icon}`} />
                                <span>{parallelActors.primary.name}</span>
                            </div>
                            <div className="gantt-actor-info">
                                <span>{parallelActors.primary.usedDays} / {parallelActors.primary.totalDays} días</span>
                                <span>{parallelActors.primary.status}</span>
                            </div>
                        </div>
                        <div className="gantt-actor-card">
                            <div className="gantt-actor-header">
                                <i className={`fas ${parallelActors.secondary.icon}`} />
                                <span>{parallelActors.secondary.name}</span>
                            </div>
                             <div className="gantt-actor-info">
                                <span>{parallelActors.secondary.usedDays} / {parallelActors.secondary.totalDays} días</span>
                                <span>{parallelActors.secondary.status}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="gantt-detail-extras">
                    <h5>Tiempos Adicionales</h5>
                    {suspensionPreActa?.exists && <div className="gantt-extra-badge gantt-extra-suspension"><span>{suspensionPreActa.days} días de Suspensión (Pre)</span></div>}
                    {suspensionPostActa?.exists && <div className="gantt-extra-badge gantt-extra-suspension"><span>{suspensionPostActa.days} días de Suspensión (Post)</span></div>}
                    {extension?.exists && <div className="gantt-extra-badge gantt-extra-extension"><span>{extension.days} días de Prórroga</span></div>}
                    {!suspensionPreActa?.exists && !suspensionPostActa?.exists && !extension?.exists && <small className="text-muted">No hay tiempos adicionales en este proceso.</small>}
                </div>
            </div>
        </div>
    );
};

export const GanttModal = ({
  isOpen, // Cambiado de 'show' a 'isOpen'
  onClose,
  phases,
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  currentItem // Necesario para el panel de detalles si se expande
}) => {
  const [adjustedWidthMode, setAdjustedWidthMode] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null); // Estado para la fase seleccionada

  if (!isOpen) return null;

  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
  };
  
  const handleCloseDetail = () => {
    setSelectedPhase(null);
  };

  return (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div className="gantt-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="gantt-modal-header">
          <h3>
            <i className="fas fa-chart-gantt" />
            Diagrama de Gantt - Cronograma del Proceso
          </h3>
          <div className="gantt-modal-controls">
            <label className="gantt-toggle">
              <input
                type="checkbox"
                checked={adjustedWidthMode}
                onChange={(e) => setAdjustedWidthMode(e.target.checked)}
              />
              <span>Ajustar anchos</span>
            </label>
            <i className="fas fa-info-circle gantt-info-icon" title="Activa para ver solo el tiempo realmente usado en cada fase" />
             <button className="gantt-close-btn" onClick={onClose}>
                <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* Body */}
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
              onPhaseClick={handlePhaseClick} // <-- CONECTAMOS EL CLICK
              activePhaseId={selectedPhase?.id} // <-- RESALTAMOS LA FASE SELECCIONADA
            />
          </div>
          {/* Panel de Detalles */}
          <div className={`gantt-phase-detail ${selectedPhase ? '' : 'hidden'}`}>
            <PhaseDetailPanel 
                phase={selectedPhase} 
                onClose={handleCloseDetail}
                suspensionPreActa={suspensionPreActa}
                suspensionPostActa={suspensionPostActa}
                extension={extension}
            />
          </div>
        </div>

        {/* Footer (sin cambios) */}
        <div className="gantt-modal-footer">
          {/* ... tu leyenda existente ... */}
           <div className="gantt-legend">
            <h5>Leyenda de Estados</h5>
            <div className="gantt-legend-items">
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-progress-pending" /><span>Pendiente</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-progress-active" /><span>En Curso</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-progress-paused" /><span>Pausado</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-progress-completed" /><span>Completado</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-progress-overdue" /><span>Vencido</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-segment-suspension" /><span>Suspensión</span></div>
              <div className="gantt-legend-item"><div className="gantt-legend-color gantt-segment-extension" /><span>Prórroga</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};