import React, { useMemo, useState } from 'react';
import { PlusCircle, Sparkles, Trash2 } from 'lucide-react';

const DEFAULT_OPTIONS = [
  {
    type: 'Actuación',
    name: 'Licencia de subdivisión urbana',
    when: 'Disponible para simulación y reglas documentales',
  },
  {
    type: 'Texto legal',
    name: 'Fundamento de procedencia',
    when: 'Se muestra cuando la actuación tiene soporte normativo',
  },
];

const OPTION_TYPES = [
  'Actuación',
  'Documento requerido',
  'Texto legal',
  'Etiqueta de agrupación',
  'Regla de aplicación',
];

function createLocalOption(form) {
  return {
    key: `${Date.now()}-${form.name}`,
    type: form.type.trim() || OPTION_TYPES[0],
    name: form.name.trim(),
    when: form.when.trim() || 'Aplica según la configuración de la actuación',
  };
}

export default function LegalConfigOptionComposer() {
  const [form, setForm] = useState({
    type: OPTION_TYPES[1],
    name: '',
    when: '',
  });
  const [options, setOptions] = useState(DEFAULT_OPTIONS.map((item, index) => ({ ...item, key: `default-${index}` })));

  const canAdd = useMemo(() => form.name.trim().length >= 3, [form.name]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addOption() {
    if (!canAdd) return;
    setOptions((current) => [createLocalOption(form), ...current]);
    setForm((current) => ({ ...current, name: '', when: '' }));
  }

  function removeOption(key) {
    setOptions((current) => current.filter((item) => item.key !== key));
  }

  return (
    <section className="legal-config-option-composer" data-testid="legal-config-option-composer">
      <div className="legal-config-option-composer__intro">
        <span className="legal-config-option-composer__icon"><Sparkles size={17} /></span>
        <div>
          <span className="legal-config-section-title__eyebrow">Campos directos</span>
          <h3>Añadir opciones de configuración</h3>
          <p>
            Crea opciones visibles para la vista de configuración. Es un espacio de trabajo visual: no migra datos ni aplica cambios a proyectos.
          </p>
        </div>
      </div>

      <div className="legal-config-option-composer__form">
        <label className="legal-config-field">
          <span>Tipo de opción</span>
          <select value={form.type} onChange={(event) => updateField('type', event.target.value)}>
            {OPTION_TYPES.map((type) => <option key={type} value={type}>{type === 'Documento requerido' ? 'Documento' : type}</option>)}
          </select>
        </label>

        <label className="legal-config-field legal-config-field--wide">
          <span>Nombre visible</span>
          <input
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ej. Plano arquitectónico firmado"
          />
        </label>

        <label className="legal-config-field legal-config-field--wide">
          <span>Cuándo aplica</span>
          <input
            value={form.when}
            onChange={(event) => updateField('when', event.target.value)}
            placeholder="Ej. Cuando la actuación sea construcción"
          />
        </label>

        <button type="button" className="legal-config-primary" onClick={addOption} disabled={!canAdd}>
          <PlusCircle size={15} />
          Añadir a la vista
        </button>
      </div>

      <div className="legal-config-option-composer__list" aria-label="Opciones agregadas visualmente">
        {options.map((option) => (
          <article key={option.key} className="legal-config-option-pill-card">
            <div>
              <span>{option.type}</span>
              <strong>{option.name}</strong>
              <small>{option.when}</small>
            </div>
            <button type="button" onClick={() => removeOption(option.key)} aria-label={`Quitar ${option.name}`}>
              <Trash2 size={14} />
            </button>
          </article>
        ))}
      </div>

      <p className="legal-config-option-composer__safe-note">Solo vista de configuración · sin migración · sin aplicación a proyectos</p>
    </section>
  );
}
