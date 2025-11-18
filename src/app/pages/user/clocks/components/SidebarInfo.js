import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import moment from 'moment';

const MySwal = withReactContent(Swal);

const STATUS_CONFIG = {
  'DESISTIDO': { text: 'Desistido', icon: 'fas fa-ban', color: 'Desistido' },
  'FINALIZADO': { text: 'Finalizado', icon: 'fas fa-check-circle', color: 'Finalizado' },
  'NO_INICIADO': { text: 'No Iniciado', icon: 'fas fa-circle', color: 'default' },
  'PAUSADO': { text: 'Pausado', icon: 'fas fa-pause-circle', color: 'Pausado' },
  'VENCIDO': { text: 'Vencido', icon: 'fas fa-exclamation-circle', color: 'Vencido' },
  'EN_CURSO': { text: 'En Curso', icon: 'fas fa-hourglass-half', color: 'default' },
};

export const SidebarInfo = ({ manager, actions }) => {
  const { curaduriaDetails, canAddSuspension, canAddExtension, isDesisted, getClock, suspensionPreActa, suspensionPostActa, extension } = manager;
  const { onAddTimeControl, onOpenScheduleModal } = actions;

  if (!curaduriaDetails) {
    return (
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <i className="fas fa-chart-line"></i>
          <span>Estado del Proceso</span>
        </div>
        <div className="sidebar-card-body">
          <div className="text-center text-muted">
            <i className="fas fa-spinner fa-spin me-2"></i>
            Calculando...
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[curaduriaDetails.status] || STATUS_CONFIG['EN_CURSO'];
  const showTimeDetails = !curaduriaDetails.notStarted && !curaduriaDetails.finished;

  const handleShowDetails = () => {
    const { 
      status, total, used, remaining, from, reference, today, 
      baseDays, suspensionDays, extensionDays, processTypeLabel 
    } = curaduriaDetails;

    const ldfDate = getClock(5)?.date_start;
    const acta1Date = getClock(30)?.date_start;
    const corrDate = getClock(35)?.date_start;
    
    let casoActual = '';
    let fechaInicio = '';
    let fechaFin = '';
    let suspensionesAplicadas = [];
    let prorrogasAplicadas = [];
    
    if (acta1Date && !corrDate) {
      casoActual = 'CASO 1: Hay Acta 1, NO hay correcciones';
      fechaInicio = ldfDate;
      fechaFin = acta1Date;
      
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        if (moment(suspStart).isSameOrAfter(ldfDate) && moment(suspEnd).isSameOrBefore(acta1Date)) {
          suspensionesAplicadas.push({
            tipo: 'PRE-ACTA',
            inicio: suspStart,
            fin: suspEnd,
            dias: suspensionPreActa.days,
            aplicada: '✅ Sí (dentro del rango)'
          });
        } else {
          suspensionesAplicadas.push({
            tipo: 'PRE-ACTA',
            inicio: suspStart,
            fin: suspEnd,
            dias: suspensionPreActa.days,
            aplicada: '❌ No (fuera del rango)'
          });
        }
      }
      
      if (extension.exists && extension.end?.date_start && !extension.isActive) {
        if (!acta1Date || moment(extension.start.date_start).isBefore(acta1Date)) {
          prorrogasAplicadas.push({
            inicio: extension.start.date_start,
            fin: extension.end.date_start,
            dias: extension.days,
            aplicada: '✅ Sí (antes del Acta 1)'
          });
        }
      }
      
    } else if (corrDate) {
      casoActual = 'CASO 2: Hay correcciones radicadas';
      
      const phase1End = acta1Date || today;
      suspensionesAplicadas.push({
        tipo: 'FASE 1 (LDF → Acta 1)',
        inicio: ldfDate,
        fin: phase1End,
        dias: 'N/A',
        aplicada: `Contando días hábiles`
      });
      
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        if (moment(suspStart).isSameOrAfter(ldfDate) && moment(suspEnd).isSameOrBefore(phase1End)) {
          suspensionesAplicadas.push({
            tipo: 'PRE-ACTA (Fase 1)',
            inicio: suspStart,
            fin: suspEnd,
            dias: suspensionPreActa.days,
            aplicada: '✅ Restada de Fase 1'
          });
        }
      }
      
      let phase2End = today;
      if (suspensionPostActa.isActive && suspensionPostActa.start?.date_start) {
        if (moment(suspensionPostActa.start.date_start).isAfter(corrDate)) {
          phase2End = suspensionPostActa.start.date_start;
        }
      }
      
      suspensionesAplicadas.push({
        tipo: 'FASE 2 (Correcciones → Hoy)',
        inicio: corrDate,
        fin: phase2End,
        dias: 'N/A',
        aplicada: `Contando días hábiles`
      });
      
      if (suspensionPostActa.exists && suspensionPostActa.end?.date_start) {
        const suspStart = suspensionPostActa.start.date_start;
        const suspEnd = suspensionPostActa.end.date_start;
        if (moment(suspStart).isSameOrAfter(corrDate) && moment(suspEnd).isSameOrBefore(phase2End)) {
          suspensionesAplicadas.push({
            tipo: 'POST-ACTA (Fase 2)',
            inicio: suspStart,
            fin: suspEnd,
            dias: suspensionPostActa.days,
            aplicada: '✅ Restada de Fase 2'
          });
        }
      }
      
    } else {
      casoActual = 'CASO 3: NO hay Acta 1 todavía';
      fechaInicio = ldfDate;
      
      if (suspensionPreActa.isActive && suspensionPreActa.start?.date_start) {
        fechaFin = suspensionPreActa.start.date_start;
      } else {
        fechaFin = today;
      }
      
      if (suspensionPreActa.exists && suspensionPreActa.end?.date_start) {
        const suspStart = suspensionPreActa.start.date_start;
        const suspEnd = suspensionPreActa.end.date_start;
        
        const dentroDelRango = moment(suspStart).isSameOrAfter(ldfDate) && 
                               moment(suspEnd).isSameOrBefore(fechaFin);
        
        suspensionesAplicadas.push({
          tipo: 'PRE-ACTA',
          inicio: suspStart,
          fin: suspEnd,
          dias: suspensionPreActa.days,
          aplicada: dentroDelRango ? '✅ Sí (dentro del rango)' : '❌ No (fuera del rango)',
          validacion: `¿${suspStart} >= ${ldfDate} Y ${suspEnd} <= ${fechaFin}? = ${dentroDelRango ? 'SÍ' : 'NO'}`
        });
      } else if (suspensionPreActa.isActive) {
        suspensionesAplicadas.push({
          tipo: 'PRE-ACTA (ACTIVA)',
          inicio: suspensionPreActa.start.date_start,
          fin: 'En curso',
          dias: suspensionPreActa.days,
          aplicada: '⏸️ Activa (contador pausado)'
        });
      }
    }

    let suspensionesHtml = '';
    if (suspensionesAplicadas.length > 0) {
      suspensionesHtml = `
        <div class="row g-2 mb-3">
          <div class="col-12"><h6 class="border-bottom pb-2 mb-2">🔍 Suspensiones Detectadas</h6></div>
          ${suspensionesAplicadas.map(s => `
            <div class="col-12 small bg-light p-2 rounded mb-2">
              <strong>${s.tipo}:</strong><br>
              📅 Inicio: ${moment(s.inicio).format('DD MMM YYYY')}<br>
              📅 Fin: ${s.fin === 'En curso' ? s.fin : moment(s.fin).format('DD MMM YYYY')}<br>
              ⏱️ Días: ${s.dias} días hábiles<br>
              ${s.aplicada}<br>
              ${s.validacion ? `<span class="text-muted">${s.validacion}</span>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    let prorrogasHtml = '';
    if (prorrogasAplicadas.length > 0) {
      prorrogasHtml = `
        <div class="row g-2 mb-3">
          <div class="col-12"><h6 class="border-bottom pb-2 mb-2">⏰ Prórrogas Detectadas</h6></div>
          ${prorrogasAplicadas.map(p => `
            <div class="col-12 small bg-light p-2 rounded mb-2">
              📅 Inicio: ${moment(p.inicio).format('DD MMM YYYY')}<br>
              📅 Fin: ${moment(p.fin).format('DD MMM YYYY')}<br>
              ⏱️ Días: ${p.dias} días hábiles<br>
              ${p.aplicada}
            </div>
          `).join('')}
        </div>
      `;
    }

    MySwal.fire({
      title: 'Detalle de Tiempos de Curaduría',
      html: `
        <div class="text-start">
          <div class="alert alert-info mb-3">
            <strong><i class="fas fa-tag me-2"></i>Tipo de Proceso:</strong> ${processTypeLabel || 'No definido'}
          </div>
          
          <div class="row g-2 mb-3">
            <div class="col-12"><h6 class="border-bottom pb-2 mb-2">📊 Lógica de Cálculo Aplicada</h6></div>
            <div class="col-12 bg-warning bg-opacity-10 p-2 rounded">
              <strong>${casoActual}</strong>
            </div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-12"><h6 class="border-bottom pb-2 mb-2">📍 Fechas de Referencia del Contador</h6></div>
            <div class="col-6"><strong>🏁 Fecha Inicio (LDF):</strong></div>
            <div class="col-6 text-end">${ldfDate ? moment(ldfDate).format('DD MMM YYYY') : '❌ No definida'}</div>
            
            ${acta1Date ? `
              <div class="col-6"><strong>📋 Acta 1:</strong></div>
              <div class="col-6 text-end">${moment(acta1Date).format('DD MMM YYYY')}</div>
            ` : ''}
            
            ${corrDate ? `
              <div class="col-6"><strong>📝 Correcciones:</strong></div>
              <div class="col-6 text-end">${moment(corrDate).format('DD MMM YYYY')}</div>
            ` : ''}
            
            <div class="col-6"><strong>🎯 Contando hasta:</strong></div>
            <div class="col-6 text-end fw-bold text-primary">${moment(reference).format('DD MMM YYYY')}</div>
            
            <div class="col-6"><strong>📅 Hoy:</strong></div>
            <div class="col-6 text-end">${moment(today).format('DD MMM YYYY')}</div>
          </div>

          ${suspensionesHtml}
          ${prorrogasHtml}

          <div class="row g-2 mb-3">
            <div class="col-12"><h6 class="border-bottom pb-2 mb-2">⏱️ Resumen de Tiempos</h6></div>
            <div class="col-6"><strong>Días Base:</strong></div>
            <div class="col-6 text-end">${baseDays} días</div>
            
            <div class="col-6"><strong>+ Suspensiones:</strong></div>
            <div class="col-6 text-end text-primary">+${suspensionDays} días</div>
            
            <div class="col-6"><strong>+ Prórroga:</strong></div>
            <div class="col-6 text-end text-primary">+${extensionDays} días</div>
            
            <div class="col-12"><hr class="my-2"></div>
            
            <div class="col-6"><strong>Total Disponible:</strong></div>
            <div class="col-6 text-end fw-bold text-info">${total} días</div>
            
            <div class="col-6"><strong>Días Usados:</strong></div>
            <div class="col-6 text-end fw-bold">${used} días</div>
            
            <div class="col-6"><strong>Días Restantes:</strong></div>
            <div class="col-6 text-end fw-bold ${remaining < 0 ? 'text-danger' : 'text-success'}">${remaining} días</div>
          </div>

          <div class="row g-2">
            <div class="col-12"><h6 class="border-bottom pb-2 mb-2">✅ Estado Final</h6></div>
            <div class="col-12">
              <strong>Estado:</strong> 
              <span class="badge bg-${remaining < 0 ? 'danger' : 'success'} ms-2">${status}</span>
            </div>
            <div class="col-12"><strong>Contador desde:</strong> ${from}</div>
          </div>

          <div class="alert alert-secondary mt-3 mb-0 small">
            <strong>💡 Nota:</strong> Todos los cálculos se realizan en <strong>días hábiles</strong>, 
            excluyendo fines de semana y festivos colombianos.
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      width: 680,
      customClass: {
        popup: 'swal-wide-detail'
      }
    });
  };

  const shouldSuggestExtension = showTimeDetails && curaduriaDetails.remaining <= 5 && curaduriaDetails.remaining > 0 && canAddExtension;
  const shouldAlertExpired = showTimeDetails && curaduriaDetails.remaining < 0;

  return (
    <>
      <div className="sidebar-card">
        <div className="sidebar-card-header">
          <i className="fas fa-chart-line"></i>
          <span>Estado del Proceso</span>
        </div>
        <div className="sidebar-card-body">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <span className={`status-text status-${statusConfig.color}`}>
              {statusConfig.text}
            </span>
            <i className={`status-icon status-icon-${statusConfig.color} ${statusConfig.icon}`}></i>
          </div>

          {curaduriaDetails.processTypeLabel && (
            <div className="value-row mb-3 pb-2 border-bottom">
              <span className="label">
                <i className="fas fa-tag me-1"></i>Tipo
              </span>
              <span className="value text-info">{curaduriaDetails.processTypeLabel}</span>
            </div>
          )}

          {showTimeDetails && (
            <>
              <div className="value-row">
                <span className="label">Días Restantes</span>
                <span className={`value ${curaduriaDetails.remaining < 0 ? 'text-danger' : 'text-success'}`}>
                  {curaduriaDetails.remaining}
                </span>
              </div>
              <div className="value-row">
                <span className="label">Días Usados</span>
                <span className="value">{curaduriaDetails.used}</span>
              </div>

              {shouldAlertExpired && (
                <div className="alert alert-danger mt-3 mb-0 py-2 px-2 small">
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  <strong>Proceso vencido</strong>
                  <p className="mb-0 mt-1">Se han excedido los plazos legales. Considere añadir una prórroga especial o desistir el proceso.</p>
                </div>
              )}

              {shouldSuggestExtension && (
                <div className="alert alert-warning mt-3 mb-0 py-2 px-2 small">
                  <i className="fas fa-clock me-1"></i>
                  <strong>Pronto a vencer</strong>
                  <p className="mb-0 mt-1">Quedan {curaduriaDetails.remaining} días. Considere añadir una prórroga si es necesario.</p>
                </div>
              )}

              <button className="btn-detail-link w-100 text-start" onClick={handleShowDetails}>
                <i className="fas fa-info-circle me-2"></i>
                VER DETALLE COMPLETO
              </button>

              {/* NUEVO BOTÓN PROGRAMAR PROCESO */}
              <button 
                className="btn-detail-link w-100 text-start mt-2" 
                onClick={onOpenScheduleModal}
                style={{ color: '#17a2b8' }}
              >
                <i className="fas fa-calendar-check me-2"></i>
                PROGRAMAR PROCESO
              </button>
            </>
          )}
        </div>
      </div>

      {!isDesisted && (canAddSuspension || canAddExtension) && (
        <div className="sidebar-card quick-actions-card">
          <div className="sidebar-card-header">
            <i className="fas fa-bolt"></i>
            <span>Acciones Rápidas</span>
          </div>
          <div className="sidebar-card-body">
            {canAddSuspension && (
              <button 
                type="button" 
                className="btn btn-action btn-suspension" 
                onClick={() => onAddTimeControl('suspension')}
                title="Añadir suspensión de términos"
              >
                <i className="fas fa-pause me-2"></i> 
                SUSPENSIÓN
              </button>
            )}
            {canAddExtension && (
              <button 
                type="button" 
                className="btn btn-action btn-prorroga" 
                onClick={() => onAddTimeControl('extension')}
                title="Añadir prórroga por complejidad"
              >
                <i className="fas fa-clock me-2"></i> 
                PRÓRROGA
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};