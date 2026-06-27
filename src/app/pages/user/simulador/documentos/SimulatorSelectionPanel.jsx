import { useMemo } from 'react';
import { Icon } from '@/components/icon';

import {
  AREA_OPTIONS,
  CULTURAL_OPTIONS,
  M_LIC_OPTIONS,
  M_SUB_OPTIONS,
  M_URB_OPTIONS,
  STANDARD_TRAMITE_CODES,
  TIPO_OPTIONS,
  TRAMITE_OPTIONS,
  USOS_OPTIONS,
  VIVIENDA_OPTIONS,
  getSimulatorOptionLabel,
} from './simulatorOptionLabels';

export {
  AREA_OPTIONS,
  CULTURAL_OPTIONS,
  M_LIC_OPTIONS,
  M_SUB_OPTIONS,
  M_URB_OPTIONS,
  STANDARD_TRAMITE_CODES,
  TIPO_OPTIONS,
  TRAMITE_OPTIONS,
  USOS_OPTIONS,
  VIVIENDA_OPTIONS,
  getSimulatorOptionLabel,
};

function toggleArrayValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getSelectionSummary(selection) {
  const summary = [];

  if (selection.tipo.length) summary.push(`${selection.tipo.length} tipo(s)`);
  if (selection.tramite) summary.push(`Trámite: ${getSimulatorOptionLabel('tramite', selection.tramite)}`);
  if (selection.m_urb) summary.push(`Urbanización: ${getSimulatorOptionLabel('m_urb', selection.m_urb)}`);
  if (selection.m_sub) summary.push(`Subdivisión: ${getSimulatorOptionLabel('m_sub', selection.m_sub)}`);
  if (selection.m_lic.length) summary.push(`${selection.m_lic.length} modalidad(es) construcción`);
  if (selection.usos.length) summary.push(`${selection.usos.length} uso(s)`);
  if (selection.area) summary.push(`Área: ${getSimulatorOptionLabel('area', selection.area)}`);
  if (selection.vivienda) summary.push(`Vivienda: ${getSimulatorOptionLabel('vivienda', selection.vivienda)}`);
  if (selection.cultural) summary.push(`BIC: ${getSimulatorOptionLabel('cultural', selection.cultural)}`);

  return summary;
}

function FieldHeader({ title, helper, required }) {
  return (
    <div className="mb-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {title}
        </span>
        {required ? <span className="badge rounded-pill text-bg-light border">Requerido</span> : null}
      </div>
      {helper ? <p className="mb-0 mt-1 text-xs text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function CheckboxGroup({ field, title, helper, options, values, onChange, required }) {
  return (
    <fieldset className="rounded-xl border border-border bg-background/70 p-3">
      <legend className="float-none mb-0 w-auto px-0">
        <FieldHeader title={title} helper={helper} required={required} />
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const id = `sim-doc-${field}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={id}
              className={`form-check mb-0 flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${values.includes(option.value) ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border bg-card hover:bg-muted/40'}`}
            >
              <input
                id={id}
                className="form-check-input m-0"
                type="checkbox"
                checked={values.includes(option.value)}
                onChange={() => onChange(toggleArrayValue(values, option.value))}
              />
              <span className="form-check-label leading-snug">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function SelectField({ field, label, helper, options, value, onChange, required }) {
  const id = `sim-doc-${field}`;

  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <div className="mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground" htmlFor={id}>
            {label}
          </label>
          {required ? <span className="badge rounded-pill text-bg-light border">Requerido</span> : null}
        </div>
        {helper ? <p className="mb-0 mt-1 text-xs text-muted-foreground">{helper}</p> : null}
      </div>
      <select
        id={id}
        className="form-select"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccionar</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function TramiteField({ value, onChange }) {
  const customValue = STANDARD_TRAMITE_CODES.has(value) ? '' : value;
  const selectValue = customValue ? '__custom__' : value;

  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <FieldHeader
        title="Objeto del trámite"
        helper="Usa A-D para trámites base o escribe una actuación específica de la sección 6.8, por ejemplo piscina, ajuste cota o propiedad horizontal."
        required
      />
      <div className="grid gap-2 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <label className="form-label text-xs text-muted-foreground" htmlFor="sim-doc-tramite">
            Trámite base
          </label>
          <select
            id="sim-doc-tramite"
            className="form-select"
            value={selectValue || ''}
            onChange={(event) => onChange(event.target.value === '__custom__' ? customValue : event.target.value)}
          >
            <option value="">Seleccionar</option>
            {TRAMITE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            <option value="__custom__">Actuación personalizada</option>
          </select>
        </div>
        <div>
          <label className="form-label text-xs text-muted-foreground" htmlFor="sim-doc-tramite-custom">
            Actuación personalizada
          </label>
          <input
            id="sim-doc-tramite-custom"
            className="form-control"
            type="text"
            value={customValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder="piscina, ajuste cota, propiedad horizontal..."
          />
        </div>
      </div>
    </div>
  );
}

export default function SimulatorSelectionPanel({ selection, onChange, onReset }) {
  const hasUrbanizacion = selection.tipo.includes('A');
  const hasSubdivicion = selection.tipo.includes('C');
  const hasConstruccion = selection.tipo.includes('D');
  const summary = useMemo(() => getSelectionSummary(selection), [selection]);

  const patchSelection = (patch) => onChange({ ...selection, ...patch });
  const handleTipoChange = (tipo) => {
    patchSelection({
      tipo,
      m_urb: tipo.includes('A') ? selection.m_urb : '',
      m_sub: tipo.includes('C') ? selection.m_sub : '',
      m_lic: tipo.includes('D') ? selection.m_lic : [],
      area: tipo.includes('D') ? selection.area : '',
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm" aria-labelledby="sim-doc-selection-title">
      <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="SearchCheck" size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="sim-doc-selection-title" className="mb-1 text-sm font-semibold text-foreground">
              Selección simulada
            </h2>
            <p className="mb-0 text-xs text-muted-foreground">
              Campos equivalentes a Actualizar FUN 1. El cálculo es local y no modifica expedientes.
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-outline-secondary btn-sm shrink-0" onClick={onReset}>
          <Icon name="Eraser" size={14} aria-hidden="true" /> Limpiar
        </button>
      </div>

      <div className="space-y-3 p-3 p-md-4">
        <div className="rounded-xl border border-border bg-background/70 p-3" aria-live="polite">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Resumen inmediato
          </div>
          {summary.length ? (
            <div className="flex flex-wrap gap-1.5">
              {summary.map((item) => <span key={item} className="badge rounded-pill text-bg-light border">{item}</span>)}
            </div>
          ) : (
            <p className="mb-0 text-xs text-muted-foreground">Aún no hay campos seleccionados.</p>
          )}
        </div>

        <CheckboxGroup
          field="tipo"
          title="Tipo de actuación"
          helper="Puedes seleccionar más de un tipo cuando el caso combina actuaciones."
          options={TIPO_OPTIONS}
          values={selection.tipo}
          onChange={handleTipoChange}
          required
        />

        <TramiteField value={selection.tramite} onChange={(tramite) => patchSelection({ tramite })} />

        {hasUrbanizacion ? (
          <SelectField
            field="m_urb"
            label="Modalidad urbanización"
            helper="Visible porque seleccionaste Urbanización."
            options={M_URB_OPTIONS}
            value={selection.m_urb}
            onChange={(m_urb) => patchSelection({ m_urb })}
            required
          />
        ) : null}

        {hasSubdivicion ? (
          <SelectField
            field="m_sub"
            label="Modalidad subdivisión"
            helper="Visible porque seleccionaste Subdivisión."
            options={M_SUB_OPTIONS}
            value={selection.m_sub}
            onChange={(m_sub) => patchSelection({ m_sub })}
            required
          />
        ) : null}

        {hasConstruccion ? (
          <CheckboxGroup
            field="m_lic"
            title="Modalidad construcción"
            helper="Visible porque seleccionaste Construcción. Admite varias modalidades."
            options={M_LIC_OPTIONS}
            values={selection.m_lic}
            onChange={(m_lic) => patchSelection({ m_lic })}
            required
          />
        ) : null}

        {hasConstruccion ? (
          <SelectField
            field="area"
            label="Área / condición"
            helper="Condición de área o número de viviendas para reglas de construcción."
            options={AREA_OPTIONS}
            value={selection.area}
            onChange={(area) => patchSelection({ area })}
            required
          />
        ) : null}

        <CheckboxGroup
          field="usos"
          title="Usos propuestos"
          helper="Campo 1.6 de Actualizar. Admite varios usos."
          options={USOS_OPTIONS}
          values={selection.usos}
          onChange={(usos) => patchSelection({ usos })}
        />

        <SelectField
          field="vivienda"
          label="Tipo de vivienda"
          helper="Campo 1.8 de Actualizar. Déjalo visible aunque el tipo no sea residencial para no ocultar datos relevantes."
          options={VIVIENDA_OPTIONS}
          value={selection.vivienda}
          onChange={(vivienda) => patchSelection({ vivienda })}
        />

        <SelectField
          field="cultural"
          label="Bien de interés cultural"
          helper="Campo 1.9 de Actualizar."
          options={CULTURAL_OPTIONS}
          value={selection.cultural}
          onChange={(cultural) => patchSelection({ cultural })}
          required
        />
      </div>
    </section>
  );
}
