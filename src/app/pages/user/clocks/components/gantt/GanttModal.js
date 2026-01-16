import React, { useEffect, useState, useMemo } from 'react';
import { GanttChart } from './GanttChart';
import moment from 'moment';
import { sumarDiasHabiles } from '../../hooks/useClocksManager';

// Panel de detalle (ahora muestra ancho/posiciones y retraso)
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
    blockWidth,      
    blockBaseDays,   
    startPosition,   
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

  // Cálculo de retraso general de la fase
  const delayDays = Math.max(0, (usedDays || 0) - (totalDays || 0));

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

        {/* ALERTA DE RETRASO PRINCIPAL */}
        {delayDays > 0 && (
           <div className="gantt-detail-row" style={{ backgroundColor: '#fff5f5', border: '1px solid #ffc9c9' }}>
             <span className="gantt-detail-label" style={{ color: '#dc3545' }}>Retraso</span>
             <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{delayDays} días</span>
           </div>
        )}

        {/* Debug visual de layout */}
        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Ancho Visual</span>
          <span>{blockWidth ?? '—'} d</span>
        </div>

        <div className="gantt-detail-row">
          <span className="gantt-detail-label">Base Legal</span>
          <span>{blockBaseDays ?? '—'} d</span>
        </div>

        {!!parallelActors && (
          <div className="gantt-detail-actors">
            <h5>Actores Paralelos</h5>

            {/* ACTOR PRIMARIO */}
            {(() => {
                const pDelay = Math.max(0, (parallelActors.primary.usedDays || 0) - (parallelActors.primary.totalDays || 0));
                return (
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
                        {pDelay > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc3545', fontWeight: '600' }}>
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                {pDelay} días de retraso
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* ACTOR SECUNDARIO */}
            {(() => {
                const sDelay = Math.max(0, (parallelActors.secondary.usedDays || 0) - (parallelActors.secondary.totalDays || 0));
                return (
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
                        {sDelay > 0 && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#dc3545', fontWeight: '600' }}>
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                {sDelay} días de retraso
                            </div>
                        )}
                    </div>
                );
            })()}
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
  radDate,
  suspensionPreActa,
  suspensionPostActa,
  extension,
  currentItem,
  scheduleConfig,
  manager
}) => {
  const [viewMode, setViewMode] = useState('legal'); // 'legal' (antes standard) | 'real' (antes adjustedWidth)
  const [selectedPhase, setSelectedPhase] = useState(null);

  useEffect(() => {
    // Resetear selección cuando cambia el modo para evitar confusión en los datos mostrados
    setSelectedPhase(null);
  }, [viewMode]);

  // CÁLCULO DE FECHA ESTIMADA DE ENTREGA
  const projectedFinishData = useMemo(() => {
    if (!radDate || phases.length === 0) return null;

    let totalProjectedDays = 0;

    phases.forEach(phase => {
        // Lógica de proyección:
        // 1. Si la fase está COMPLETADA, sumamos los días que realmente se tomaron (usedDays).
        //    (Si se tomó menos del legal, ganamos tiempo. Si se tomó más, perdimos tiempo).
        // 2. Si la fase está PENDIENTE o ACTIVA, sumamos los días legales/planeados (totalDays).
        //    (Asumimos el mejor escenario futuro: no habrá más retrasos de los que ya existan).
        // 3. NO sumamos 'delayDays' extra para el futuro, porque el 'standard' es la meta.
        
        let daysToAdd = 0;
        if (phase.status === 'COMPLETADO') {
            daysToAdd = phase.usedDays || 0;
        } else {
            // Activo, Pendiente, Pausado, Vencido (pero no terminado)
            // Tomamos el total legal esperado.
            daysToAdd = (phase.totalDays || 0) + (phase.extraDays || 0);
        }
        
        totalProjectedDays += daysToAdd;
    });

    // Calcular fecha calendario desde la fecha de radicación
    const projectedDate = sumarDiasHabiles(radDate, totalProjectedDays);

    return {
        date: projectedDate,
        totalDays: totalProjectedDays
    };

  }, [phases, radDate]);


  if (!isOpen) return null;

  const handlePhaseClick = (phase) => setSelectedPhase(phase);

  return (
    <div className="gantt-modal-overlay" onClick={onClose}>
      <div className="gantt-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="gantt-modal-header">
          <div className="gantt-modal-title-group">
             <h3><i className="fas fa-chart-gantt" /> Diagrama de Gantt</h3>
             {projectedFinishData && (
                 <div className="gantt-header-stats">
                     <div className="gantt-stat-item">
                         <span className="gantt-stat-label">Entrega Estimada:</span>
                         <span className="gantt-stat-value">{moment(projectedFinishData.date).format('DD MMM YYYY')}</span>
                     </div>
                     <div className="gantt-stat-item">
                         <span className="gantt-stat-label">Duración Proyectada:</span>
                         <span className="gantt-stat-value">{projectedFinishData.totalDays} días hábiles</span>
                     </div>
                 </div>
             )}
          </div>

          <div className="gantt-modal-controls">
            <label className="gantt-toggle" title="Alternar entre vista de límites legales completos vs. tiempos reales ejecutados">
              <span className={`gantt-toggle-label ${viewMode === 'legal' ? 'active' : ''}`}>Legal</span>
              <div className="gantt-switch">
                <input
                    type="checkbox"
                    checked={viewMode === 'real'}
                    onChange={(e) => setViewMode(e.target.checked ? 'real' : 'legal')}
                />
                <span className="gantt-slider round"></span>
              </div>
              <span className={`gantt-toggle-label ${viewMode === 'real' ? 'active' : ''}`}>Real</span>
            </label>

            <button className="gantt-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="gantt-modal-body">
          <div className="gantt-modal-chart-container">
            <GanttChart
              phases={phases}
              radDate={radDate} // Cambio: Usar radDate
              suspensionPreActa={suspensionPreActa}
              suspensionPostActa={suspensionPostActa}
              extension={extension}
              compactMode={false}
              viewMode={viewMode} // PASAMOS EL MODO ('legal' o 'real')
              onPhaseClick={handlePhaseClick}
              activePhaseId={selectedPhase?.id}
              scheduleConfig={scheduleConfig} // PASAMOS SCHEDULE CONFIG
              manager={manager} // PASAMOS MANAGER PARA CÁLCULOS
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
                <div className="gantt-legend-color" style={{backgroundColor: '#339af0'}} />
                <span>Prórroga</span>
              </div>
              <div className="gantt-legend-item" style={{ marginLeft: '16px' }}>
                <div style={{ width: '20px', height: '4px', background: '#dc3545', marginTop: '4px' }} />
                <span>Exceso/Retraso</span>
              </div>
               {/* LEYENDA DEL PUNTO DE PROGRAMACION */}
              <div className="gantt-legend-item" style={{ marginLeft: '16px' }}>
                 <div className="gantt-scheduled-marker-legend"></div>
                 <span>Programado</span>
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