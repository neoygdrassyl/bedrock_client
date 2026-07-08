import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileWarning,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import {
  TIPO_OPTIONS,
  TRAMITE_OPTIONS,
  M_URB_OPTIONS,
  M_SUB_OPTIONS,
  M_LIC_OPTIONS,
  AREA_OPTIONS,
  CULTURAL_OPTIONS,
  USOS_OPTIONS,
  VIVIENDA_OPTIONS,
} from '../simulador/documentos/simulatorOptionLabels.js';
import './RequirementScenarioSimulator.css';

const FIELD_OPTION_MAP = {
  tipoAny: TIPO_OPTIONS,
  tramiteAny: TRAMITE_OPTIONS,
  mUrbAny: M_URB_OPTIONS,
  mSubAny: M_SUB_OPTIONS,
  mLicAny: M_LIC_OPTIONS,
  areaAny: AREA_OPTIONS,
  culturalAny: CULTURAL_OPTIONS,
  usosAny: USOS_OPTIONS,
  viviendaAny: VIVIENDA_OPTIONS,
};

function RequirementScenarioSimulator({
  fields,
  selection,
  setSelection,
  preview,
  previewLoading,
  simulate,
  selectionIsEmpty,
  errorMessage,
  explorerLoading,
}) {
  const fieldList = useMemo(() => fields || [], [fields]);

  const visibleFields = useMemo(
    () => fieldList.filter((f) => FIELD_OPTION_MAP[f.conditionKey]),
    [fieldList],
  );

  const handleFieldChange = useCallback(
    (fieldKey, value) => {
      const next = { ...selection };
      if (value) {
        next[fieldKey] = value;
      } else {
        delete next[fieldKey];
      }
      setSelection(next);
    },
    [selection, setSelection],
  );

  const handleSimulate = useCallback(() => {
    if (selectionIsEmpty) return;
    simulate(selection);
  }, [selection, selectionIsEmpty, simulate]);

  return (
    <section className="simulator-panel" data-testid="simulator-panel">
      <header className="simulator-panel__header">
        <div className="simulator-panel__header-topline">
          <span className="simulator-panel__header-step">
            <Sliders size={16} className="simulator-panel__header-icon" />
            Paso 1
          </span>
          <Badge variant="outline">{explorerLoading ? 'Cargando…' : 'Solo consulta'}</Badge>
        </div>
        <div className="simulator-panel__header-copy">
          <h3 className="simulator-panel__title">Define el escenario</h3>
          <p className="simulator-panel__description">
            Elige los datos de la radicación para activar la lectura documental antes de revisar soportes,
            reglas y advertencias.
          </p>
        </div>
      </header>

      {explorerLoading ? (
        <div className="simulator-panel__skeleton">
          <Skeleton className="simulator-panel__skeleton-line" />
          <Skeleton className="simulator-panel__skeleton-line" />
        </div>
      ) : (
        <>
          <div className="simulator-panel__fields" data-testid="simulator-fields">
            {visibleFields.map((field) => (
              <div key={field.conditionKey} className="simulator-panel__field">
                <label className="simulator-panel__field-label" htmlFor={`sim-${field.conditionKey}`}>
                  {field.shortLabel || field.label}
                </label>
                <select
                  id={`sim-${field.conditionKey}`}
                  value={selection[field.conditionKey] || ''}
                  onChange={(e) => handleFieldChange(field.conditionKey, e.target.value)}
                >
                  <option value="">—</option>
                  {FIELD_OPTION_MAP[field.conditionKey]?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="simulator-panel__controls">
            <Button
              variant="default"
              size="sm"
              onClick={handleSimulate}
              disabled={selectionIsEmpty || previewLoading}
              data-testid="simulator-run"
            >
              {previewLoading ? (
                <RefreshCw size={16} className="simulator-panel__spin" />
              ) : (
                <Sliders size={16} />
              )}
              <span>{previewLoading ? 'Calculando…' : 'Simular requisitos'}</span>
            </Button>
            <Badge
              variant={selectionIsEmpty ? 'outline' : 'default'}
              className="simulator-panel__selection-badge"
            >
              {selectionIsEmpty
                ? 'Sin selección'
                : `${Object.keys(selection).length} campo(s)`}
            </Badge>
          </div>

          {errorMessage && (
            <div className="simulator-panel__error-box" data-testid="simulator-error">
              <FileWarning size={16} />
              <span>No se pudo calcular la lista con estos datos. La configuración vigente no fue modificada.</span>
            </div>
          )}

          {preview && !errorMessage ? <div className="simulator-panel__preview-ready">Escenario calculado. Revisa el resumen y continúa con los documentos activos.</div> : null}
        </>
      )}
    </section>
  );
}

export default RequirementScenarioSimulator;
