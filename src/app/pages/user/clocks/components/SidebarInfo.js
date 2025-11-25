import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

// --- COMPONENTE PARA LA TARJETA DE FASE ---
const PhaseCard = ({ phase }) => {
    const { title, responsible, status, totalDays, usedDays, extraDays, startDate, endDate } = phase;
    const totalAvailable = totalDays + extraDays;
    const remainingDays = totalAvailable - usedDays;

    const statusMap = {
        PENDIENTE: { text: 'Pendiente', color: 'secondary', icon: 'fa-hourglass-start' },
        ACTIVO: { text: 'En Curso', color: 'primary', icon: 'fa-running' },
        PAUSADO: { text: 'Pausado', color: 'warning', icon: 'fa-pause-circle' },
        COMPLETADO: { text: 'Completado', color: 'success', icon: 'fa-check-circle' },
        ESPERANDO_NOTIFICACION: { text: 'Esperando Notificación', color: 'info', icon: 'fa-envelope' },
        VENCIDO: { text: 'Vencido', color: 'danger', icon: 'fa-exclamation-triangle' }
    };
    
    let currentStatus = statusMap[status] || statusMap.PENDIENTE;
    if (status === 'ACTIVO' && remainingDays < 0) {
        currentStatus = statusMap.VENCIDO;
    }
    
    const progressPercent = totalAvailable > 0 ? Math.min(100, (usedDays / totalAvailable) * 100) : 0;

    return (
        <div className="phase-card-content">
            <h5 className="mb-3 phase-title">{title}</h5>
            <div className={`d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom status-header status-header-${currentStatus.color}`}>
                <span className={`status-text`}>
                    <i className={`fas ${currentStatus.icon} me-2`}></i>{currentStatus.text}
                </span>
                <span className={`badge bg-light text-dark responsible-badge`}>
                    <i className="fas fa-user me-1"></i>{responsible}
                </span>
            </div>

            <div className="value-row">
                <span className="label">Días Totales</span>
                <span className="value">{totalAvailable} <small className="text-muted">({totalDays}+{extraDays})</small></span>
            </div>
            <div className="value-row">
                <span className="label">Días Usados</span>
                <span className="value">{usedDays}</span>
            </div>
            <div className="value-row">
                <span className="label">Días Restantes</span>
                <span className={`value text-${remainingDays < 0 ? 'danger' : 'success'}`}>
                    {remainingDays}
                </span>
            </div>

            <div className="timeline-bar mt-3">
                <div className="progress" style={{height: '10px'}}>
                    <div 
                        className={`progress-bar bg-${currentStatus.color}`}
                        role="progressbar" 
                        style={{ width: `${progressPercent}%`}}
                        aria-valuenow={usedDays} 
                        aria-valuemin="0" 
                        aria-valuemax={totalAvailable}>
                    </div>
                </div>
                <div className="d-flex justify-content-between small text-muted mt-1">
                    <span>{startDate ? moment(startDate).format('DD MMM YY') : 'Inicio'}</span>
                    <span>{endDate ? moment(endDate).format('DD MMM YY') : 'Fin'}</span>
                </div>
            </div>
        </div>
    );
};


export const SidebarInfo = ({ manager, actions }) => {
  const { processPhases, curaduriaDetails, canAddSuspension, canAddExtension, isDesisted } = manager;
  const { onAddTimeControl, onOpenScheduleModal } = actions;
  
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  useEffect(() => {
    if (processPhases && processPhases.length > 0) {
        const activeIndex = processPhases.findIndex(p => ['ACTIVO', 'PAUSADO'].includes(p.status));
        const firstPendingIndex = processPhases.findIndex(p => p.status === 'PENDIENTE');
        
        if (activeIndex !== -1) {
            setCurrentPhaseIndex(activeIndex);
        } else if (firstPendingIndex !== -1) {
            setCurrentPhaseIndex(firstPendingIndex);
        } else {
            // Si todo está completo, muestra la última fase
            setCurrentPhaseIndex(processPhases.length - 1);
        }
    }
  }, [processPhases]);

  if (!curaduriaDetails || !processPhases || processPhases.length === 0) {
    return (
      <div className="sidebar-card">
        <div className="sidebar-card-header"><i className="fas fa-chart-line"></i><span>Estado del Proceso</span></div>
        <div className="sidebar-card-body"><div className="text-center text-muted"><i className="fas fa-spinner fa-spin me-2"></i>Calculando...</div></div>
      </div>
    );
  }

  const handlePhaseChange = (direction) => {
      setCurrentPhaseIndex(prev => Math.max(0, Math.min(prev + direction, processPhases.length - 1)));
  };

  const currentPhase = processPhases[currentPhaseIndex];

  return (
    <>
      <div className="sidebar-card">
        <div className="sidebar-card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0" style={{fontSize: '0.9rem'}}>
                <i className="fas fa-tasks me-2"></i>
                Fases del Proceso
            </h6>
            <div className="phase-nav">
              <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => handlePhaseChange(-1)} 
                  disabled={currentPhaseIndex === 0} 
                  title="Fase anterior"
              >
                  <i className="fas fa-chevron-left"></i>
              </button>
              <span className="phase-indicator">
                  {currentPhaseIndex + 1} / {processPhases.length}
              </span>
              <button 
                  className="btn btn-sm btn-outline-primary" 
                  onClick={() => handlePhaseChange(1)} 
                  disabled={currentPhaseIndex === processPhases.length - 1} 
                  title="Fase siguiente"
              >
                  <i className="fas fa-chevron-right"></i>
              </button>
            </div>
        </div>

        <div className="sidebar-card-body">
            <PhaseCard phase={currentPhase} />
        </div>
        
        <div className="sidebar-card-footer mt-3 pt-3 border-top">
             <button 
                className="btn-detail-link w-100 text-start" 
                onClick={onOpenScheduleModal}
              >
                <i className="fas fa-calendar-check me-2"></i>
                Programar Tiempos Internos
              </button>
        </div>
      </div>

      {!isDesisted && (canAddSuspension || canAddExtension) && (
        <div className="sidebar-card quick-actions-card">
          <div className="sidebar-card-header"><i className="fas fa-bolt"></i><span>Acciones Rápidas</span></div>
          <div className="sidebar-card-body">
            {canAddSuspension && (<button type="button" className="btn btn-action btn-suspension" onClick={() => onAddTimeControl('suspension')}><i className="fas fa-pause me-2"></i>SUSPENSIÓN</button>)}
            {canAddExtension && (<button type="button" className="btn btn-action btn-prorroga" onClick={() => onAddTimeControl('extension')}><i className="fas fa-clock me-2"></i>PRÓRROGA</button>)}
          </div>
        </div>
      )}
    </>
  );
};