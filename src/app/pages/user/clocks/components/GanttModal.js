import React from 'react';
import { GanttChart } from './GanttChart';

export const GanttModal = ({
  show, // ✅ Cambiado de 'isOpen' a 'show' para consistencia
  onClose,
  phases,
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  activePhaseId // ✅ Asegúrate de recibir este prop
}) => {
  const [adjustedWidthMode, setAdjustedWidthMode] = React.useState(false);

  // El modal no se renderiza si 'show' es falso
  if (!show) return null;

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
              <span>Ajustar anchos por tiempo usado</span>
            </label>
            <i className="fas fa-info-circle gantt-info-icon" title="Activa para ver solo el tiempo realmente usado en cada fase" />
          </div>
          <button className="gantt-close-btn" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
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
              activePhaseId={activePhaseId} // ✅ Pasar el activePhaseId
            />
          </div>
        </div>

        {/* Footer con leyenda */}
        <div className="gantt-modal-footer">
          {/* ... (tu leyenda se mantiene igual) ... */}
           <div className="gantt-legend">
            <h5>Leyenda de Estados</h5>
            <div className="gantt-legend-items">
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-pending" />
                <span>Pendiente</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-active" />
                <span>En Curso</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-paused" />
                <span>Pausado</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-completed" />
                <span>Completado</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-overdue" />
                <span>Vencido</span>
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
};