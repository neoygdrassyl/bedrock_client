import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

export const ControlBar = ({ manager, actions }) => {
  const {
    isDesisted,
    canAddSuspension,
    canAddExtension,
    curaduriaDetails,
    totalSuspensionDays,
    extension,
    desistEvents,
    NEGATIVE_PROCESS_TITLE
  } = manager;

  const { onAddTimeControl, onSetIsFull, isFull } = actions;

  const getDesistReason = () => {
    const preferred = desistEvents.find(e => String(e.state) === '-5' || String(e.state) === '-6');
    const any = preferred || desistEvents[0];
    if (!any) return null;
    return NEGATIVE_PROCESS_TITLE?.[String(any.version)] || null;
  };

  const showDesistModal = () => {
    const reason = getDesistReason();
    const ordered = [...desistEvents].sort((a, b) => (moment(a.date_start).isAfter(b.date_start) ? -1 : 1));
    const rows = ordered.map(e => {
      const lbl = NEGATIVE_PROCESS_TITLE?.[String(e.version)] || `Estado ${e.state}`;
      return `<tr>
        <td>${lbl}</td>
        <td>${e.date_start}</td>
        <td>${e.version ?? '-'}</td>
      </tr>`;
    }).join('');

    MySwal.fire({
      title: 'Detalle de desistimiento',
      html: `
        <div class="text-start">
          ${reason ? `<div class="mb-2"><strong>Motivo principal:</strong> ${reason}</div>` : ''}
          <div class="table-responsive">
            <table class="table table-sm">
              <thead><tr><th>Motivo/Estado</th><th>Fecha</th><th>Versión</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="small text-muted">Las acciones y métricas de tiempo se ocultan mientras el proceso esté desistido.</div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      width: 680,
    });
  };

  const FROM_LABEL = {
    'SUSP_POST_END(351)': 'Fin de Suspensión (Post-Acta)',
    'SUSP_POST_START(301)': 'Inicio de Suspensión (Post-Acta)',
    'SUSP_PRE_END(350)': 'Fin de Suspensión (Pre-Acta)',
    'SUSP_PRE_START(300)': 'Inicio de Suspensión (Pre-Acta)',
    'CORR_35': 'Radicación de Correcciones (35)',
    'LDF_5': 'Legal y Debida Forma (5)',
    'PAUSED': 'Tiempo corriendo para el solicitante',
    'NOT_STARTED': 'No iniciado',
  };

  const handleShowCuraduriaDetails = () => {
    if (curaduriaDetails == null) return;
    const { notStarted, paused, remaining, from, reference, today, total, suspensions, extension, preActaUsed, used } = curaduriaDetails;

    const inCourse = !paused && !notStarted && remaining >= 0;
    const expired = !paused && !notStarted && remaining < 0;

    let stateChip = '<span class="badge bg-secondary">Sin estado</span>';
    if (notStarted) stateChip = '<span class="badge bg-secondary">No iniciado</span>';
    else if (paused) stateChip = '<span class="badge bg-warning text-dark">Pausado</span>';
    else if (expired) stateChip = '<span class="badge bg-danger">Vencido</span>';
    else if (inCourse) stateChip = '<span class="badge bg-primary">En curso</span>';

    const remainingClass = remaining < 0 ? 'text-danger' : 'text-success';
    const fromText = FROM_LABEL[from] || from || '-';

    MySwal.fire({
      title: 'Detalle de Curaduría',
      html: `
        <div class="text-start">
          <div class="mb-2">${stateChip}</div>
          <div class="row g-2">
            <div class="col-12"><strong>Referencia:</strong> ${fromText}<div class="small text-muted">Fecha referencia: ${reference || '-'}</div></div>
            <div class="col-12"><strong>Fecha de corte:</strong> ${today || '-'}<div class="small text-muted">Cálculo relativo a hoy (días hábiles)</div></div>
            <hr class="my-2" />
            <div class="col-6"><strong>Base:</strong> ${total - suspensions - extension}</div>
            <div class="col-6"><strong>Usados pre-Acta (5→30):</strong> ${preActaUsed ?? 0}</div>
            <div class="col-6"><strong>Usados desde ref.:</strong> ${Math.max((used ?? 0) - (preActaUsed ?? 0), 0)}</div>
            <div class="col-6"><strong>Suspensiones:</strong> ${suspensions}</div>
            <div class="col-6"><strong>Prórroga:</strong> ${extension}</div>
            <div class="col-6"><strong>Total:</strong> ${total}</div>
            <div class="col-6"><strong>Restantes:</strong> <span class="${remainingClass}">${remaining}</span></div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      width: 640,
    });
  };

  const finalized = curaduriaDetails === null;
  const notStarted = !!(curaduriaDetails && curaduriaDetails.notStarted);
  const paused = !!(curaduriaDetails && curaduriaDetails.paused);

  return (
    <div className="control-bar mb-1">
      <div className="bar-inner">
        {/* SECCIÓN IZQUIERDA: BOTONES */}
        <div className="actions d-flex gap-2 flex-wrap align-items-center">
          {!isDesisted && canAddSuspension && (
            <button type="button" className="btn btn-warning btn-sm" onClick={() => onAddTimeControl('suspension')} title="Pausar el tiempo del proceso">
              <i className="fas fa-pause me-1"></i> Suspensión
            </button>
          )}
          {!isDesisted && canAddExtension && (
            <button type="button" className="btn btn-info btn-sm" onClick={() => onAddTimeControl('extension')} title="Extender plazo por complejidad">
              <i className="fas fa-clock me-1"></i> Prórroga
            </button>
          )}
          {!isFull && (
            <button type="button" className="btn btn-outline-secondary btn-sm exp-full-btn" title="Pantalla completa" onClick={() => onSetIsFull(true)}>
              <i className="fas fa-expand"></i>
            </button>
          )}
        </div>

        {/* SECCIÓN DERECHA: INFORMACIÓN */}
        <div className="control-meta ms-auto">
          {isDesisted ? (
            <div className="text-danger d-flex align-items-center gap-2">
              <i className="fas fa-ban"></i> 
              <span>Proceso desistido</span>
              <button type="button" className="btn btn-link btn-sm p-0" onClick={showDesistModal}>
                Ver motivo
              </button>
            </div>
          ) : (
            <>
              {/* Badges de Estado */}
              <div className="status-chips d-flex justify-content-end flex-wrap gap-2 mb-2">
                {finalized && (<span className="badge bg-success"><i className="fas fa-check-circle me-1"></i> Finalizado</span>)}
                {!finalized && notStarted && (<span className="badge bg-secondary"><i className="fas fa-circle me-1"></i> No iniciado</span>)}
                {!finalized && !notStarted && paused && (<span className="badge bg-warning text-dark"><i className="fas fa-pause me-1"></i> Pausado</span>)}
                {!finalized && !notStarted && !paused && curaduriaDetails && curaduriaDetails.remaining < 0 && (<span className="badge bg-danger"><i className="fas fa-exclamation-circle me-1"></i> Vencido</span>)}
                {!finalized && !notStarted && !paused && curaduriaDetails && curaduriaDetails.remaining >= 0 && (<span className="badge bg-primary"><i className="fas fa-hourglass-half me-1"></i> En curso</span>)}
              </div>

              {/* Información de Curaduría */}
              {finalized ? (
                <div className="text-success d-flex align-items-center gap-2">
                  <i className="fas fa-check-circle"></i>
                  <span>Curaduría: Finalizado</span>
                </div>
              ) : notStarted ? (
                <div className="text-muted d-flex align-items-center gap-2">
                  <i className="fas fa-circle"></i>
                  <span>No iniciado</span>
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={handleShowCuraduriaDetails}>
                    Más info
                  </button>
                </div>
              ) : curaduriaDetails ? (
                <div className={`d-flex align-items-center gap-2 ${paused ? 'text-warning' : (curaduriaDetails.remaining < 0 ? 'text-danger' : 'text-primary')}`}>
                  <i className={`${paused ? 'fas fa-pause' : 'fas fa-hourglass-half'}`}></i>
                  <span>{paused ? 'Pausado' : `${curaduriaDetails.remaining} días`}</span>
                  <button type="button" className="btn btn-link btn-sm p-0" onClick={handleShowCuraduriaDetails}>
                    Detalle
                  </button>
                </div>
              ) : (
                <div className="text-muted">
                  <i className="fas fa-info-circle me-1"></i> Control de tiempos
                </div>
              )}

              {/* Badges de Recursos Usados */}
              {(totalSuspensionDays > 0 || extension.exists) && (
                <div className="d-flex justify-content-end flex-wrap gap-2 mt-2">
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};