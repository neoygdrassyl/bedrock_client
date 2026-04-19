import { useMemo } from 'react';
import MermaidDiagram from '../../../../components/MermaidDiagram.component';
import { generateProjectFlowMermaid } from '../utils/mermaidProjectFlow';
import { Icon } from '@/components/icon';

function ProjectFlowModal({ show, onClose, phases, expediente }) {
  const mermaidString = useMemo(() => {
    if (!show || !phases || !expediente) return '';
    return generateProjectFlowMermaid(phases, expediente);
  }, [show, phases, expediente]);

  if (!show) return null;

  const currentPhase = phases?.find((p) => p.status === 'activo');
  const isOverdue = currentPhase?.daysUsed > currentPhase?.daysLimit;
  const isWarning = !isOverdue && currentPhase?.daysUsed > currentPhase?.daysLimit * 0.8;

  const riskBadge = isOverdue
    ? 'lf-badge--danger'
    : isWarning
      ? 'lf-badge--warning'
      : 'lf-badge--success';

  const statusBadge = expediente?.es_desistido
    ? 'lf-badge--danger'
    : 'lf-badge--primary';

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose} />

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable legal-flow-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <Icon name="project-diagram" size={16} style={{ opacity: 0.5 }} />
                Flujo del Expediente: {expediente?.radicado || '—'}
              </h5>
              <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="modal-body">
              {/* Summary info */}
              {currentPhase && (
                <div className="lf-modal-meta">
                  <span className="lf-modal-meta__item">
                    <strong>Fase actual:</strong> {currentPhase.label}
                  </span>
                  <span className="lf-modal-meta__item">
                    <strong>Dias:</strong>
                    <span className={`lf-badge ${riskBadge}`}>
                      {currentPhase.daysUsed} / {currentPhase.daysLimit}
                    </span>
                  </span>
                  <span className="lf-modal-meta__item">
                    <strong>Estado:</strong>
                    <span className={`lf-badge ${statusBadge}`}>
                      {expediente?.es_desistido ? 'Desistido' : (expediente?.status || 'Activo')}
                    </span>
                  </span>
                </div>
              )}

              {/* Diagram */}
              {mermaidString ? (
                <MermaidDiagram chart={mermaidString} />
              ) : (
                <p style={{ color: '#8C95A6', textAlign: 'center' }}>
                  Sin datos de fases disponibles.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProjectFlowModal;
