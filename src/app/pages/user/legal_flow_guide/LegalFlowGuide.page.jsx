import { useState, useCallback } from 'react';
import FlowFilters from './components/FlowFilters';
import FlowDiagram from './components/FlowDiagram';
import FlowRouteSummary from './components/FlowRouteSummary';
import './LegalFlowGuide.css';
import { Icon } from '@/components/icon';

const DEFAULT_FILTERS = {
  projectType: 'I',
  notificationMode: 'notificar',
  notificationType: 'personal',
  cumpleActa: false,
  desistimientos: {
    '-1': true,
    '-2': true,
    '-3': true,
    '-4': true,
    '-5': true,
    '-6': true,
  },
  showSuspension: false,
  showExtension: false,
  showProrroga: false,
  showRecurso: true,
};

function LegalFlowGuidePage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleFilterChange = useCallback((updated) => {
    setFilters(updated);
  }, []);

  return (
    <div className="legal-flow">
      {/* Page header */}
      <div className="legal-flow__header">
        <div>
          <h4 className="legal-flow__title">
            <span className="legal-flow__title-icon">
              <Icon name="balance-scale" size={16} />
            </span>
            Flujo Juridico
          </h4>
          <p className="legal-flow__subtitle">
            Visualizacion interactiva del proceso de licencias urbanisticas
          </p>
        </div>
      </div>

      <div className="row g-3">
        {/* Sidebar — filters + summary */}
        <div className="col-lg-3">
          <div className="lf-card mb-3">
            <div className="lf-card__body">
              <FlowFilters filters={filters} onChange={handleFilterChange} />
            </div>
          </div>
          <FlowRouteSummary filters={filters} />
        </div>

        {/* Main diagram */}
        <div className="col-lg-9">
          <FlowDiagram filters={filters} />
        </div>
      </div>
    </div>
  );
}

export default LegalFlowGuidePage;
