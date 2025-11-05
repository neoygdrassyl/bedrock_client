import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

const FROM_LABEL = {
    'SUSP_POST_END(351)': 'Fin Suspensión (Post-Acta)',
    'SUSP_POST_START(301)': 'Inicio Suspensión (Post-Acta)',
    'SUSP_PRE_END(350)': 'Fin Suspensión (Pre-Acta)',
    'SUSP_PRE_START(300)': 'Inicio Suspensión (Pre-Acta)',
    'CORR_35': 'Radicación Correcciones (35)',
    'LDF_5': 'Legal y Debida Forma (5)',
    'PAUSED': 'Pausado (Solicitante)',
    'NOT_STARTED': 'No Iniciado',
};

export const SidebarInfo = ({ manager, actions }) => {
  const {
    isDesisted,
    canAddSuspension,
    canAddExtension,
    curaduriaDetails,
    desistEvents,
    NEGATIVE_PROCESS_TITLE
  } = manager;

  const { onAddTimeControl } = actions;

  const finalized = curaduriaDetails === null;
  const notStarted = !!(curaduriaDetails && curaduriaDetails.notStarted);
  const paused = !!(curaduriaDetails && curaduriaDetails.paused);
  const expired = !finalized && !notStarted && !paused && curaduriaDetails && curaduriaDetails.remaining < 0;
  const inCourse = !finalized && !notStarted && !paused && !expired;
  
  const getProcessStatus = () => {
    if (isDesisted) return { text: 'Desistido', icon: 'fas fa-ban', className: 'Desistido' };
    if (finalized) return { text: 'Finalizado', icon: 'fas fa-check-circle', className: 'Finalizado' };
    if (notStarted) return { text: 'No Iniciado', icon: 'fas fa-circle', className: 'default' };
    if (paused) return { text: 'Pausado', icon: 'fas fa-pause-circle', className: 'Pausado' };
    if (expired) return { text: 'Vencido', icon: 'fas fa-exclamation-circle', className: 'Vencido' };
    if (inCourse) return { text: 'En Curso', icon: 'fas fa-hourglass-half', className: 'default' };
    return { text: 'Calculando...', icon: 'fas fa-spinner fa-spin', className: 'default' };
  };

  const status = getProcessStatus();

  const handleShowCuraduriaDetails = () => {
    if (curaduriaDetails == null) return;
    const { remaining, from, reference, today, total, used } = curaduriaDetails;
    const fromText = FROM_LABEL[from] || from || '-';

    MySwal.fire({
      title: 'Detalle de Tiempos de Curaduría',
      html: `
        <div class="text-start">
          <div class="row g-2">
            <div class="col-6"><strong>Días Restantes:</strong></div><div class="col-6 text-end ${remaining < 0 ? 'text-danger fw-bold' : 'text-success'}">${remaining}</div>
            <div class="col-6"><strong>Días Usados:</strong></div><div class="col-6 text-end">${used}</div>
            <div class="col-6"><strong>Días Totales:</strong></div><div class="col-6 text-end">${total}</div>
            <hr class="my-2" />
            <div class="col-12"><strong>Referencia:</strong> ${fromText}</div>
            <div class="col-12 small text-muted">Fecha de referencia: ${reference || '-'}</div>
            <div class="col-12 small text-muted">Cálculo hasta: ${today || '-'}</div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      width: 480,
    });
  };

  return (
    <>
      {/* --- CARD UNIFICADA: ESTADO Y TIEMPOS --- */}
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <i className="fas fa-chart-line"></i>
          <span>Estado del Proceso</span>
        </div>
        <div className="sidebar-card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className={`status-text status-${status.className}`}>{status.text}</span>
                <i className={`status-icon status-icon-${status.className} ${status.icon}`}></i>
            </div>
            
            {!isDesisted && !notStarted && curaduriaDetails && (
                <>
                    <div className="value-row">
                        <span className="label">Días Restantes</span>
                        <span className={`value ${curaduriaDetails.remaining < 0 ? 'text-danger' : 'text-success'}`}>{curaduriaDetails.remaining}</span>
                    </div>
                    <div className="value-row">
                        <span className="label">Días Usados</span>
                        <span className="value">{curaduriaDetails.used}</span>
                    </div>
                    <div className="value-row">
                        <span className="label">Días Totales</span>
                        <span className="value">{curaduriaDetails.total}</span>
                    </div>
                    <div className="value-row">
                        <span className="label">Referencia</span>
                        <span className="value">{FROM_LABEL[curaduriaDetails.from] || curaduriaDetails.from}</span>
                    </div>
                    <button className="btn-detail-link" onClick={handleShowCuraduriaDetails}>
                        VER DETALLE DEL CÁLCULO
                    </button>
                </>
            )}
        </div>
      </div>
      
      {/* --- CARD: ACCIONES RÁPIDAS (MÁS COMPACTA) --- */}
      {!isDesisted && (canAddSuspension || canAddExtension) && (
        <div className="sidebar-card quick-actions-card">
          <div className="sidebar-card-header">
            <i className="fas fa-bolt"></i>
            <span>Acciones Rápidas</span>
          </div>
          <div className="sidebar-card-body">
            {canAddSuspension && (
              <button type="button" className="btn btn-action btn-suspension" onClick={() => onAddTimeControl('suspension')}>
                <i className="fas fa-pause me-2"></i> SUSPENSIÓN
              </button>
            )}
            {canAddExtension && (
              <button type="button" className="btn btn-action btn-prorroga" onClick={() => onAddTimeControl('extension')}>
                <i className="fas fa-clock me-2"></i> PRÓRROGA
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};