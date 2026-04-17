import { useCallback } from 'react';
import { PROCESS_DEFINITION } from '../utils/legalProcessDefinition';

const PROJECT_TYPES = ['I', 'II', 'III', 'IV'];

function FlowFilters({ filters, onChange }) {
  const update = useCallback(
    (patch) => onChange({ ...filters, ...patch }),
    [filters, onChange],
  );

  const updateDesistimiento = useCallback(
    (key, checked) =>
      onChange({
        ...filters,
        desistimientos: { ...filters.desistimientos, [key]: checked },
      }),
    [filters, onChange],
  );

  return (
    <div className="d-flex flex-column gap-3">
      {/* Configuración del Proyecto */}
      <div>
        <h6 className="fw-semibold border-bottom pb-1 mb-2">Configuración del Proyecto</h6>

        <label className="form-label mb-1" htmlFor="ff-projectType">
          Categoría
        </label>
        <select
          id="ff-projectType"
          className="form-select form-select-sm mb-2"
          value={filters.projectType}
          onChange={(e) => update({ projectType: e.target.value })}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              Categoría {t}
            </option>
          ))}
        </select>

        <label className="form-label mb-1">Modo de Notificación</label>
        <div className="btn-group btn-group-sm w-100 mb-2" role="group">
          {['notificar', 'comunicar'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`btn btn-outline-primary${filters.notificationMode === mode ? ' active' : ''}`}
              onClick={() => update({ notificationMode: mode })}
            >
              {mode === 'notificar' ? 'Notificar' : 'Comunicar'}
            </button>
          ))}
        </div>

        {filters.notificationMode === 'notificar' && (
          <>
            <label className="form-label mb-1" htmlFor="ff-notType">
              Tipo de Notificación
            </label>
            <select
              id="ff-notType"
              className="form-select form-select-sm"
              value={filters.notificationType}
              onChange={(e) => update({ notificationType: e.target.value })}
            >
              <option value="personal">Personal</option>
              <option value="aviso">Por Aviso</option>
            </select>
          </>
        )}
      </div>

      {/* Resultado del Acta */}
      <div>
        <h6 className="fw-semibold border-bottom pb-1 mb-2">Resultado del Acta</h6>
        <div className="btn-group btn-group-sm w-100" role="group">
          <button
            type="button"
            className={`btn btn-outline-${filters.cumpleActa ? 'success active' : 'secondary'}`}
            onClick={() => update({ cumpleActa: true })}
          >
            CUMPLE
          </button>
          <button
            type="button"
            className={`btn btn-outline-${!filters.cumpleActa ? 'danger active' : 'secondary'}`}
            onClick={() => update({ cumpleActa: false })}
          >
            NO CUMPLE
          </button>
        </div>
      </div>

      {/* Desistimientos */}
      <div>
        <h6 className="fw-semibold border-bottom pb-1 mb-2">Desistimientos</h6>
        {Object.entries(PROCESS_DEFINITION.desistimientos).map(([key, def]) => (
          <div className="form-check" key={key}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`ff-des-${key}`}
              checked={!!filters.desistimientos[key]}
              onChange={(e) => updateDesistimiento(key, e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`ff-des-${key}`}>
              {key}: {def.label}
            </label>
          </div>
        ))}
      </div>

      {/* Modificadores */}
      <div>
        <h6 className="fw-semibold border-bottom pb-1 mb-2">Modificadores</h6>
        {[
          { key: 'showSuspension', label: 'Suspensión' },
          { key: 'showExtension', label: 'Extensión' },
          { key: 'showProrroga', label: 'Prórroga Correcciones' },
          { key: 'showRecurso', label: 'Recurso de Reposición' },
        ].map(({ key, label }) => (
          <div className="form-check" key={key}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`ff-mod-${key}`}
              checked={!!filters[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            <label className="form-check-label" htmlFor={`ff-mod-${key}`}>
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FlowFilters;
