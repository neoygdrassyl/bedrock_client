import { useMemo } from 'react';
import MermaidDiagram from '../../../../components/MermaidDiagram.component';
import { generateProjectFlowMermaid } from '../utils/mermaidProjectFlow';

function ProjectFlowModal({ show, onClose, phases, expediente }) {
  const mermaidString = useMemo(() => {
    if (!show || !phases || !expediente) return '';
    return generateProjectFlowMermaid(phases, expediente);
  }, [show, phases, expediente]);

  if (!show) return null;

  const currentPhase = phases?.find((p) => p.status === 'activo');
  const riskClass =
    currentPhase?.daysUsed > currentPhase?.daysLimit
      ? 'text-danger'
      : currentPhase?.daysUsed > currentPhase?.daysLimit * 0.8
        ? 'text-warning'
        : 'text-success';

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
          className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Flujo del Expediente: {expediente?.radicado || '—'}
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {/* Summary info */}
              {currentPhase && (
                <div className="d-flex gap-3 mb-3 flex-wrap">
                  <span>
                    <strong>Fase actual:</strong> {currentPhase.label}
                  </span>
                  <span className={riskClass}>
                    <strong>Días:</strong> {currentPhase.daysUsed} / {currentPhase.daysLimit}
                  </span>
                  <span>
                    <strong>Estado:</strong>{' '}
                    {expediente?.es_desistido ? (
                      <span className="badge bg-danger">Desistido</span>
                    ) : (
                      <span className="badge bg-primary">{expediente?.status || 'Activo'}</span>
                    )}
                  </span>
                </div>
              )}

              {/* Diagram */}
              {mermaidString ? (
                <MermaidDiagram chart={mermaidString} />
              ) : (
                <p className="text-muted text-center">Sin datos de fases disponibles.</p>
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
