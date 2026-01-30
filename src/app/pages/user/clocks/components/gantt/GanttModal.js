import React, { useEffect, useState, useMemo } from 'react';
import { GanttChart } from './GanttChart';
import moment from 'moment';
import { sumarDiasHabiles } from '../../hooks/useClocksManager';

// Panel de detalle (Muestra información específica al hacer click en una fase)
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

        {delayDays > 0 && (
           <div className="gantt-detail-row" style={{ backgroundColor: '#fff5f5', border: '1px solid #ffc9c9' }}>
             <span className="gantt-detail-label" style={{ color: '#dc3545' }}>Retraso</span>
             <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{delayDays} días</span>
           </div>
        )}

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
  const [viewMode, setViewMode] = useState('legal'); 
  const [selectedPhase, setSelectedPhase] = useState(null);

  useEffect(() => {
    setSelectedPhase(null);
  }, [viewMode]);

  const projectedFinishData = useMemo(() => {
    if (!radDate || phases.length === 0) return null;

    let totalProjectedDays = 0;
    
    // Identificar si existe Acta 1 (Fin de fase 1)
    const phase1 = phases.find(p => p.id === 'phase1');
    const hasActa1 = phase1?.endDate ? true : false;

    phases.forEach(phase => {
        let daysToAdd = 0;
        
        // CORRECCIÓN LÓGICA: Si es Fase 4 (Viabilidad) y no hay Acta 1, 
        // asumimos que el proceso no ha llegado ahí y no sumamos días fantasma
        // si se basa en la resta de días de curaduría.
        if (phase.id === 'phase4' || phase.id === 'phase4_desist') {
             if (!hasActa1 && phase.status === 'PENDIENTE') {
                 // Si no hay Acta 1, la Fase 4 aun no tiene días disponibles reales calculables
                 // para proyección futura hasta que cierre F1. Se toma como 0 para no duplicar.
                 daysToAdd = 0; 
             } else {
                 if (phase.status === 'COMPLETADO') {
                     daysToAdd = phase.usedDays || 0;
                 } else {
                     // Si hay programación o tiempos definidos, calculamos lo que falta
                     daysToAdd = (phase.totalDays || 0) + (phase.extraDays || 0);
                 }
             }
        } else {
            if (phase.status === 'COMPLETADO') {
                daysToAdd = phase.usedDays || 0;
            } else {
                daysToAdd = (phase.totalDays || 0) + (phase.extraDays || 0);
            }
        }
        
        totalProjectedDays += daysToAdd;
    });

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
        {/* HEADER */}
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
            {/* <label className="gantt-toggle" title="Alternar entre vista de límites legales completos vs. tiempos reales ejecutados">
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
            </label> */}

            <button className="gantt-close-btn" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="gantt-modal-body">
          <div className="gantt-modal-chart-container">
            <GanttChart
              phases={phases}
              radDate={radDate}
              suspensionPreActa={suspensionPreActa}
              suspensionPostActa={suspensionPostActa}
              extension={extension}
              compactMode={false}
              viewMode={viewMode}
              onPhaseClick={handlePhaseClick}
              activePhaseId={selectedPhase?.id}
              scheduleConfig={scheduleConfig}
              manager={manager}
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

        {/* FOOTER (LEYENDA COMPACTA) */}
        <div className="gantt-modal-footer">
          <div className="gantt-legend-compact-wrapper">
             <span className="gantt-legend-compact-title">Leyenda:</span>
             <div className="gantt-legend-compact-items">
                <div className="gl-item"><span className="gl-dot bg-pending"></span>Pendiente</div>
                <div className="gl-item"><span className="gl-dot bg-active"></span>En curso</div>
                <div className="gl-item"><span className="gl-dot bg-paused"></span>Pausado</div>
                <div className="gl-item"><span className="gl-dot bg-completed"></span>Completado</div>
                <div className="gl-item"><span className="gl-dot bg-overdue"></span>Vencido</div>
                <div className="gl-item"><span className="gl-dot bg-suspension"></span>Suspensión</div>
                <div className="gl-item"><span className="gl-dot bg-extension"></span>Prórroga</div>
                <div className="gl-item"><span className="gl-dot bg-error-line"></span>Exceso</div>
                <div className="gl-item"><span className="gl-marker"></span>Programado</div>
             </div>
             
             {!!currentItem?.id && (
                <div style={{ marginLeft: 'auto', fontSize: '10px', color: '#adb5bd', fontWeight: '600' }}>
                    Ref: {currentItem.id}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};