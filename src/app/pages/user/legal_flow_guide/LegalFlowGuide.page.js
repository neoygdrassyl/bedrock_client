import { useState, useCallback } from 'react';
import FlowFilters from './components/FlowFilters';
import FlowDiagram from './components/FlowDiagram';
import FlowRouteSummary from './components/FlowRouteSummary';

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
    <div className="container-fluid py-3">
      <h4 className="mb-3">Guía del Flujo Jurídico — Licencias</h4>

      <div className="row g-3">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card card-body mb-3">
            <FlowFilters filters={filters} onChange={handleFilterChange} />
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
