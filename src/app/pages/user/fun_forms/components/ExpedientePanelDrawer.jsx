import React from 'react';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';

export function ExpedientePanelDrawer({ expediente, show, onClose, onNavigateDetail }) {
  if (!show || !expediente) return null;

  const p = expediente.porcentaje_avance ?? (expediente.dias_habiles_limite > 0 ? (expediente.dias_habiles_usados / expediente.dias_habiles_limite) * 100 : 0);
  let colorStatus = 'verde';
  let semaforoText = 'En término';
  let badgeClass = 'bg-success';
  if (p >= 100) {
    colorStatus = 'rojo';
    semaforoText = 'Vencido';
    badgeClass = 'bg-danger';
  } else if (p >= 80) {
    colorStatus = 'amarillo';
    semaforoText = 'Pronto a vencer';
    badgeClass = 'bg-warning text-dark';
  }

  const radicado = expediente.radicado || 'Sin radicado';
  const solicitante = expediente.solicitante || 'No especificado';
  const fase = expediente.fase_label || expediente.fase_actual || 'Desconocida';
  const diasRestantes = Math.max(0, (expediente.dias_habiles_limite || 0) - (expediente.dias_habiles_usados || 0));

  return (
    <>
      {/* Backdrop */}
      <div
        className="offcanvas-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Drawer Offcanvas (Bootstrap 5) */}
      <div
        className="offcanvas offcanvas-end show"
        tabIndex="-1"
        style={{ zIndex: 1045, visibility: 'visible', width: '400px' }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title d-flex align-items-center">
            <Icon name="folder-open" size={20} className="me-2 text-primary" />
            Detalle del Expediente
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            aria-label="Cerrar"
            onClick={onClose}
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="mb-4">
            <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Radicado</h6>
            <p className="fs-5 mb-0 fw-semibold text-dark">{radicado}</p>
          </div>

          <div className="mb-4">
            <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Solicitante</h6>
            <p className="mb-0 text-dark">{solicitante}</p>
          </div>

          <div className="mb-4">
            <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Fase Actual</h6>
            <p className="mb-0 text-dark d-flex align-items-center">
              <Icon name="clock" size={16} className="me-2 text-secondary" />
              {fase}
            </p>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Estado</h6>
              <span className={`badge ${badgeClass} fs-6`}>
                {semaforoText}
              </span>
            </div>
            <div className="col-6">
              <h6 className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem' }}>Días Restantes</h6>
              <p className="mb-0 fs-5 fw-bold">{diasRestantes}</p>
            </div>
          </div>
          
          <div className="mt-5 d-grid">
            <Button
              variant="default"
              size="lg"
              className="w-100 py-3 d-flex align-items-center justify-content-center"
              onClick={() => onNavigateDetail(expediente)}
            >
              <Icon name="arrow-right-circle" size={18} className="me-2" />
              Ver detalle del expediente
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
