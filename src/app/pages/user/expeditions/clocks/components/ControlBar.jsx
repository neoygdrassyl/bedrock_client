/**
 * Control bar component for clocks
 * Displays status, metrics, and action buttons
 */

import React from 'react';
import { showCuraduriaDetails, showDesistModal } from './ClockModals';
import { NEGATIVE_PROCESS_TITLE } from '../constants/clocksConstants';

const ControlBar = ({
  extension,
  totalSuspensionDays,
  canAddSusp,
  canAddExt,
  onAddTimeControl,
  curDetails,
  stateFlags,
  desistEvents,
  isDesisted,
  onToggleFull,
  isFull
}) => {
  const { finalized, notStarted, paused, expired, inCourse } = stateFlags;

  const handleShowCuraduriaDetails = () => {
    if (curDetails) {
      showCuraduriaDetails(curDetails, stateFlags);
    }
  };

  const handleShowDesistModal = () => {
    showDesistModal(desistEvents, NEGATIVE_PROCESS_TITLE);
  };

  return (
    <div className="control-bar mb-1">
      <div className="d-flex align-items-center p-2 bg-light rounded-3 shadow-sm bar-inner">
        {/* Acciones */}
        <div className="actions d-flex gap-2 flex-wrap align-items-center">
          {!isDesisted && canAddSusp && (
            <button 
              type="button" 
              className="btn btn-warning btn-sm" 
              onClick={() => onAddTimeControl('suspension')}
            >
              <i className="fas fa-pause me-2"></i>
              Añadir Suspensión
            </button>
          )}
          {!isDesisted && canAddExt && (
            <button 
              type="button" 
              className="btn btn-info btn-sm" 
              onClick={() => onAddTimeControl('extension')}
            >
              <i className="fas fa-clock me-2"></i>
              Prórroga por Complejidad
            </button>
          )}
          {!isFull && (
            <button 
              type="button" 
              className="btn btn-sm btn-light ms-1 exp-full-btn" 
              title="Pantalla completa" 
              onClick={onToggleFull}
            >
              <i className="fas fa-expand"></i>
            </button>
          )}
        </div>

        {/* Métricas */}
        <div className="control-meta ms-auto small text-end">
          {isDesisted ? (
            <div className="text-danger">
              <i className="fas fa-ban me-1"></i>
              Proceso desistido
              <button 
                type="button" 
                className="btn btn-link btn-sm p-0 ms-2 align-baseline" 
                onClick={handleShowDesistModal}
              >
                Ver motivo
              </button>
            </div>
          ) : (
            <>
              {/* Chips de estado */}
              <div className="status-chips d-flex justify-content-end flex-wrap gap-2 mb-1">
                {finalized && (
                  <span className="badge bg-success">
                    <i className="fas fa-check-circle me-1"></i> Finalizado
                  </span>
                )}
                {!finalized && notStarted && (
                  <span className="badge bg-secondary">
                    <i className="fas fa-circle me-1"></i> No iniciado
                  </span>
                )}
                {!finalized && !notStarted && paused && (
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-pause me-1"></i> Pausado
                  </span>
                )}
                {!finalized && !notStarted && !paused && expired && (
                  <span className="badge bg-danger">
                    <i className="fas fa-exclamation-circle me-1"></i> Vencido
                  </span>
                )}
                {!finalized && !notStarted && !paused && inCourse && (
                  <span className="badge bg-primary">
                    <i className="fas fa-hourglass-half me-1"></i> En curso
                  </span>
                )}
              </div>

              {/* Línea de curaduría */}
              {finalized ? (
                <div className="text-success">
                  <i className="fas fa-check-circle me-1"></i>
                  Curaduría: Finalizado
                </div>
              ) : notStarted ? (
                <div className="text-muted">
                  <i className="fas fa-circle me-1"></i>
                  Curaduría: No iniciado
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 ms-2 align-baseline"
                    onClick={handleShowCuraduriaDetails}
                  >
                    Más info
                  </button>
                </div>
              ) : curDetails ? (
                <div className={paused ? 'text-warning' : (curDetails.remaining < 0 ? 'text-danger' : 'text-primary')}>
                  <i className={`me-1 ${paused ? 'fas fa-pause' : 'fas fa-hourglass-half'}`}></i>
                  Curaduría: {paused ? 'Pausado' : `${curDetails.remaining} días restantes`}
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 ms-2 align-baseline"
                    onClick={handleShowCuraduriaDetails}
                  >
                    Ver detalle
                  </button>
                </div>
              ) : (
                <div className="text-muted">Control de tiempos adicionales</div>
              )}

              {/* Chips de métricas */}
              <div className="d-flex justify-content-end flex-wrap gap-2 mt-1">
                {totalSuspensionDays > 0 && (
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-pause me-1"></i>
                    Suspensiones: {totalSuspensionDays}/10
                  </span>
                )}
                {extension.exists && (
                  <span className="badge bg-info text-dark">
                    <i className="fas fa-clock me-1"></i>
                    Prórroga: {extension.days} d
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
