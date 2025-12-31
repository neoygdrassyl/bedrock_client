import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { GanttDiagram } from './GanttDiagram';

/**
 * Modal de pantalla completa para el Diagrama de Gantt
 * Permite visualizar el diagrama con todos los detalles
 */
export const GanttModal = ({ manager, isOpen, onClose }) => {
  const [mode, setMode] = useState('legal');

  if (!isOpen) return null;

  const modalContent = (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div className="gantt-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="gantt-modal-header">
          <div className="gantt-modal-title">
            <i className="fas fa-chart-gantt me-2" />
            <h5 className="mb-0">Diagrama de Gantt - Vista Completa</h5>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            onClick={onClose}
            title="Cerrar"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Información del proceso */}
        <div className="gantt-modal-info">
          <div className="gantt-info-item">
            <i className="fas fa-folder-open me-1" />
            <span>Expediente: {manager?.currentItem?.code || 'N/A'}</span>
          </div>
          <div className="gantt-info-item">
            <i className="fas fa-layer-group me-1" />
            <span>Fases: {manager?.processPhases?.length || 0}</span>
          </div>
          <div className="gantt-info-item">
            <i className="fas fa-calendar-day me-1" />
            <span>Plazo base: {manager?.curaduriaDetails?.baseDays || 45} días</span>
          </div>
          {manager?.totalSuspensionDays > 0 && (
            <div className="gantt-info-item">
              <i className="fas fa-pause me-1 text-warning" />
              <span>Suspensiones: {manager.totalSuspensionDays} días</span>
            </div>
          )}
          {manager?.extension?.days > 0 && (
            <div className="gantt-info-item">
              <i className="fas fa-clock me-1 text-info" />
              <span>Prórroga: {manager.extension.days} días</span>
            </div>
          )}
        </div>

        {/* Cuerpo del modal con el diagrama */}
        <div className="gantt-modal-body">
          <GanttDiagram manager={manager} mode={mode} compact={false} onModeChange={setMode} />
        </div>

        {/* Footer con información adicional */}
        <div className="gantt-modal-footer">
          <div className="gantt-footer-info">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1" />
              {mode === 'legal' 
                ? 'Vista de límites legales: muestra los plazos máximos según la normativa vigente'
                : 'Vista de fechas de evento: muestra solo las fechas reales de cumplimiento de eventos'
              }
            </small>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={onClose}
          >
            <i className="fas fa-times me-1" />
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar en portal para que aparezca sobre todo
  return ReactDOM.createPortal(modalContent, document.body);
};
