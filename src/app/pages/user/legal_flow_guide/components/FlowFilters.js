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
    <div className="lf-filters">
      {/* Configuracion del Proyecto */}
      <div className="lf-filter-group">
        <div className="lf-section-title">
          <i className="fas fa-cog"></i>
          Proyecto
        </div>

        <label className="lf-filter-label" htmlFor="ff-projectType">
          Categoria
        </label>
        <select
          id="ff-projectType"
          className="lf-select w-100"
          value={filters.projectType}
          onChange={(e) => update({ projectType: e.target.value })}
        >
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              Categoria {t}
            </option>
          ))}
        </select>

        <label className="lf-filter-label" style={{ marginTop: '0.25rem' }}>
          Modo de Notificacion
        </label>
        <div className="lf-toggle-group">
          {['notificar', 'comunicar'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`lf-toggle-btn${filters.notificationMode === mode ? ' active' : ''}`}
              onClick={() => update({ notificationMode: mode })}
            >
              {mode === 'notificar' ? 'Notificar' : 'Comunicar'}
            </button>
          ))}
        </div>

        {filters.notificationMode === 'notificar' && (
          <>
            <label className="lf-filter-label" htmlFor="ff-notType" style={{ marginTop: '0.25rem' }}>
              Tipo de Notificacion
            </label>
            <select
              id="ff-notType"
              className="lf-select w-100"
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
      <div className="lf-filter-group">
        <div className="lf-section-title">
          <i className="fas fa-clipboard-check"></i>
          Resultado del Acta
        </div>
        <div className="lf-toggle-group">
          <button
            type="button"
            className={`lf-toggle-btn${filters.cumpleActa ? ' active--success' : ''}`}
            onClick={() => update({ cumpleActa: true })}
          >
            Cumple
          </button>
          <button
            type="button"
            className={`lf-toggle-btn${!filters.cumpleActa ? ' active--danger' : ''}`}
            onClick={() => update({ cumpleActa: false })}
          >
            No Cumple
          </button>
        </div>
      </div>

      {/* Desistimientos */}
      <div className="lf-filter-group">
        <div className="lf-section-title">
          <i className="fas fa-exclamation-circle"></i>
          Desistimientos
        </div>
        {Object.entries(PROCESS_DEFINITION.desistimientos).map(([key, def]) => (
          <label className="lf-check" key={key}>
            <input
              type="checkbox"
              id={`ff-des-${key}`}
              checked={!!filters.desistimientos[key]}
              onChange={(e) => updateDesistimiento(key, e.target.checked)}
            />
            <span className="lf-check__tag">{key}</span>
            <span className="lf-check__label">{def.label}</span>
          </label>
        ))}
      </div>

      {/* Modificadores */}
      <div className="lf-filter-group">
        <div className="lf-section-title">
          <i className="fas fa-sliders-h"></i>
          Modificadores
        </div>
        {[
          { key: 'showSuspension', label: 'Suspension' },
          { key: 'showExtension', label: 'Extension' },
          { key: 'showProrroga', label: 'Prorroga Correcciones' },
          { key: 'showRecurso', label: 'Recurso de Reposicion' },
        ].map(({ key, label }) => (
          <label className="lf-check" key={key}>
            <input
              type="checkbox"
              id={`ff-mod-${key}`}
              checked={!!filters[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            <span className="lf-check__label">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default FlowFilters;
