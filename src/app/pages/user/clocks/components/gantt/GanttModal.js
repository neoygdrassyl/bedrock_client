import React, { useEffect, useState } from 'react';
import { GanttChart } from './GanttChart';
import moment from 'moment';

// Panel de detalle (ahora muestra ancho/posiciones)
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
    blockWidth,      // <-- viene desde GanttChart (fase procesada)
    blockBaseDays,   // <-- viene desde GanttChart (debug)
    startPosition,   // <-- viene desde GanttChart
    phaseIndex,
  } = phase;

  let statusInfo = { text: 'Pendiente', class: 'gantt-status-pendiente' };
  switch (status) {
    case 'ACTIVO':
      statusInfo = { text: 'En Curso', class: 'gantt-status-activo' };
      break;
    case 'PAUSADO':
      statusInfo = { text: 'Pausado', class: 'gantt-status-pausado' };
      break;
    case 'COMPLETADO':
      statusInfo = { text: 'Completado', class: 'gantt-status-completado' };
      break;
    case 'VENCIDO':
      statusInfo = { text: 'Vencido', class: 'gantt-status-vencido' };
      break;
    default:
      break;
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
          <span className="gantt-detail-label">Fase</span>
          <span>{phaseIndex}</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Estado</span>
          <span className={`gantt-status-badge ${statusInfo.class}`}>{statusInfo.text}</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Responsable</span>
          <span>{responsible || '—'}</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Inicio</span>
          <span>{startDate ? moment(startDate).format('DD MMM YYYY') : '—'}</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Fin</span>
          <span>{endDate ? moment(endDate).format('DD MMM YYYY') : '—'}</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Progreso</span>
          <span>{(usedDays ?? 0)} / {(totalDays ?? 0)} días</span>
        </div>

        {/* NUEVO: Debug visual de layout */}
        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Ancho bloque</span>
          <span>{blockWidth ?? '—'} d</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Ancho base</span>
          <span>{blockBaseDays ?? '—'} d</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Posición inicio</span>
          <span>{startPosition ?? '—'} d</span>
        </div>

        {!!parallelActors && (
          <div className="gantt-detail-actors">
            <h5>Actores Paralelos</h5>

            <div className="gantt-actor-card">
              <div className="gantt-actor-header">
                <i className={`fas ${parallelActors.primary.icon}`} />
                <span>{parallelActors.primary.name}</span>
              </div>
              <div className="gantt-actor-info">
                <span>
                  {parallelActors.primary.usedDays} / {parallelActors.primary.totalDays} días
                </span>
                <span>{parallelActors.primary.status}</span>
              </div>
            </div>

            <div className="gantt-actor-card">
              <div className="gantt-actor-header">
                <i className={`fas ${parallelActors.secondary.icon}`} />
                <span>{parallelActors.secondary.name}</span>
              </div>
              <div className="gantt-actor-info">
                <span>
                  {parallelActors.secondary.usedDays} / {parallelActors.secondary.totalDays} días
                </span>
                <span>{parallelActors.secondary.status}</span>
              </div>
            </div>
          </div>
        )}

        <div className="gantt-detail-extras">
          <h5>Tiempos Adicionales</h5>

          {suspensionPreActa?.exists && (
            <div className="gantt-extra-badge gantt-extra-suspension">
              <span>{suspensionPreActa.days} días de Suspensión (Pre)</span>
            </div>
          )}

          {suspensionPostActa?.exists && (
            <div className="gantt-extra-badge gantt-extra-suspension">
              <span>{suspensionPostActa.days} días de Suspensión (Post)</span>
            </div>
          )}

          {extension?.exists && (
            <div className="gantt-extra-badge gantt-extra-extension">
              <span>{extension.days} días de Prórroga</span>
            </div>
          )}

          {!suspensionPreActa?.exists && !suspensionPostActa?.exists && !extension?.exists && (
            <small className="text-muted">No hay tiempos adicionales en este proceso.</small>
          )}
        </div>
      </div>
    </div>
  );
};

export const GanttModal = ({
  isOpen,
  onClose,
  phases = [],
  ldfDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  currentItem,
}) => {
  const [adjustedWidthMode, setAdjustedWidthMode] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);

  useEffect(() => {
    // Evita que el panel muestre anchos viejos cuando cambia el modo
    setSelectedPhase(null);
  }, [adjustedWidthMode]);

  if (!isOpen) return null;

  const handlePhaseClick = (phase) => setSelectedPhase(phase);

  return (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div className="gantt-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gantt-modal-header">
          <h3>
            <i className="fas fa-chart-gantt" /> Diagrama de Gantt - Cronograma del Proceso
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

            <i
              className="fas fa-info-circle gantt-info-icon"
              title="Activa para ver el ancho del bloque según el tiempo realmente usado (si hay fecha fin)."
            />

            <button className="gantt-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

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
              activePhaseId={selectedPhase?.id}
            />
          </div>

          <div className={`gantt-phase-detail ${selectedPhase ? '' : 'hidden'}`}>
            <PhaseDetailPanel
              phase={selectedPhase}
              onClose={() => setSelectedPhase(null)}
              suspensionPreActa={suspensionPreActa}
              suspensionPostActa={suspensionPostActa}
              extension={extension}
            />
          </div>
        </div>

        <div className="gantt-modal-footer">
          <div className="gantt-legend">
            <h5>Leyenda de Estados</h5>
            <div className="gantt-legend-items">
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-pending" />
                <span>Pendiente</span>
              </div>
              <div className="gantt-legend-item">
                <div className="gantt-legend-color gantt-progress-active" />
                <span>En curso</span>
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

          {!!currentItem?.id && (
            <small className="text-muted">
              Expediente: {currentItem.id}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};
