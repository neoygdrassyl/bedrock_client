import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { documentaryError } from '@/app/services/documentary.service';
import {
  getDocumentaryGovernance,
  activateDocumentaryProject,
  changeDocumentaryConfiguration,
  returnDocumentaryProjectToLegacy,
  refreshDocumentaryRequirements,
} from '@/app/services/documentaryOperations.service';

const field = 'mt-1 block min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';
export const LEGACY_VALUE = 'legacy';
const REFRESH_REASON = 'Actualización de requisitos con los datos del expediente';

// Labels of the FUN 1 fields that drive the requirement evaluation.
export const SOURCE_FIELD_LABELS = {
  tipo: 'Tipo de actuación',
  tramite: 'Trámite',
  m_urb: 'Modalidad de urbanización',
  m_sub: 'Modalidad de subdivisión',
  m_lic: 'Modalidad de licencia',
  usos: 'Usos',
  area: 'Área construida',
  vivienda: 'Tipo de vivienda',
  cultural: 'Bien de interés cultural',
};

const LOCKED_REASONS = {
  EVIDENCE_RECEIVED: 'La configuración quedó fijada porque el expediente ya tiene evidencia recibida. Ya no puede cambiarse.',
  CAPABILITY_UNAVAILABLE: 'La gestión de la configuración documental no está disponible en este servidor.',
};

export function optionValue(option) {
  return option.kind === 'legacy' ? LEGACY_VALUE : String(option.configurationId);
}

export function optionLabel(option) {
  if (option.kind === 'legacy') return `Legacy (documentación tradicional)${option.selected ? ' · En uso' : ''}`;
  const marks = [option.isCurrent ? 'Vigente' : null, option.selected ? 'En uso' : null].filter(Boolean);
  return [`Publicación ${option.releaseVersion} · ${option.sourceReleaseId || option.configurationId}`, ...marks].join(' · ');
}

// Operation that moves the expediente from its current configuration to the target.
function operationFor(currentValue, targetValue) {
  if (targetValue === currentValue) return null;
  if (targetValue === LEGACY_VALUE) return 'legacy';
  return currentValue === LEGACY_VALUE ? 'activate' : 'configuration';
}

const SUCCESS_MESSAGES = {
  activate: 'Configuración de Central activada para el expediente.',
  configuration: 'Configuración documental cambiada.',
  legacy: 'El expediente volvió a la documentación tradicional.',
  refresh: 'Requisitos evaluados nuevamente con los datos del expediente.',
};

export function ReferencedExpedienteData({ source }) {
  if (!source) return null;
  return (
    <section aria-label="Datos del expediente usados en la evaluación" className="space-y-2 rounded-md border border-border p-3">
      <h4 className="text-sm font-medium">Datos del expediente usados en la evaluación</h4>
      <p className="text-xs text-muted-foreground">
        {source.selectedFunVersion == null
          ? 'El expediente no tiene una versión FUN activa única.'
          : `Formulario FUN 1 · versión ${source.selectedFunVersion}${source.sourceRowId ? ` · registro ${source.sourceRowId}` : ''}`}
      </p>
      <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
        {(source.fields || []).map((item) => (
          <div key={item.field} className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{SOURCE_FIELD_LABELS[item.field] || item.field}:</dt>
            <dd>{item.value == null ? 'Sin dato' : item.value}</dd>
          </div>
        ))}
      </dl>
      {(source.diagnostics || []).length ? (
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {source.diagnostics.map((item, index) => <li key={`${item.code}:${item.field || index}`}>{item.field ? `${SOURCE_FIELD_LABELS[item.field] || item.field}: valor no reconocido (${item.value})` : 'No hay una versión FUN activa única para evaluar.'}</li>)}
        </ul>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Estos datos son de solo lectura en este módulo. Para corregirlos, edite el FUN del expediente y luego use «Actualizar requisitos».
      </p>
    </section>
  );
}

export function DocumentaryGovernance({ origin, view, canManage = false, defaultOpen = false, onSaved = () => {}, onConflict = () => {} }) {
  const formId = useId();
  const [governance, setGovernance] = useState(null);
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const command = useRef(null);
  const fun0Id = origin.project.fun0Id;

  useEffect(() => {
    const abort = new AbortController();
    getDocumentaryGovernance(fun0Id, abort.signal)
      .then((value) => {
        if (abort.signal.aborted) return;
        setGovernance(value);
        const selected = (value.selection?.options || []).find((option) => option.selected);
        setTarget(selected ? optionValue(selected) : LEGACY_VALUE);
      })
      .catch((failure) => { if (!abort.signal.aborted) setError(documentaryError(failure)); });
    return () => abort.abort();
  }, [fun0Id]);

  const selection = governance?.selection;
  const options = selection?.options || [];
  const currentOption = options.find((option) => option.selected);
  const currentValue = currentOption ? optionValue(currentOption) : LEGACY_VALUE;
  const operation = selection && target ? operationFor(currentValue, target) : null;
  const canonical = currentValue !== LEGACY_VALUE;
  const locked = Boolean(selection) && !selection.changeAllowed;
  const editable = canManage && Boolean(selection) && !locked;

  const activationBlocked = operation === 'activate' && (!confirmed || !governance?.capabilities?.activationReady);
  const canApply = editable && Boolean(operation) && !busy && Boolean(reason.trim()) && !activationBlocked;
  // The optional view comes from the documents tab; the governance read carries the same state.
  const cacheState = view?.governance?.cacheState ?? governance?.cacheState;

  async function execute(kind, fixedReason) {
    if (busy || !canManage) return;
    const motive = (fixedReason || reason).trim();
    setBusy(true); setError('');
    try {
      if (!motive) throw new Error('Indique el motivo del cambio.');
      if (command.current?.operation !== kind) command.current = null;
      if (!command.current) {
        const body = { expectedInputRevision: governance?.inputRevision || 0, idempotencyKey: crypto.randomUUID(), reason: motive };
        if (kind === 'activate' || kind === 'configuration') {
          const configuration = options.find((option) => optionValue(option) === target);
          Object.assign(body, { configurationId: configuration.configurationId, expectedChecksum: configuration.checksum });
        }
        command.current = { operation: kind, body };
      }
      const api = { activate: activateDocumentaryProject, configuration: changeDocumentaryConfiguration, legacy: returnDocumentaryProjectToLegacy, refresh: refreshDocumentaryRequirements }[kind];
      await api(fun0Id, command.current.body);
      command.current = null;
      onSaved(SUCCESS_MESSAGES[kind], kind !== 'refresh');
    } catch (failure) {
      if (failure.response) command.current = null;
      if (failure.response?.status === 409) onConflict(); else setError(documentaryError(failure));
    } finally { setBusy(false); }
  }

  return (
    <details className="space-y-3 rounded-md border border-border p-3" open={defaultOpen || !canonical}>
      <summary className="cursor-pointer text-sm font-medium">Configuración documental del expediente</summary>
      {canonical && cacheState ? <p className="text-sm text-muted-foreground">Estado de la evaluación: {cacheState === 'current' ? 'al día' : cacheState === 'stale' ? 'desactualizada respecto del expediente' : 'pendiente'}</p> : null}
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      {!governance && !error ? <p role="status" className="text-sm text-muted-foreground">Consultando la configuración del expediente…</p> : null}
      {governance ? (
        <form onSubmit={(event) => { event.preventDefault(); if (operation) execute(operation); }} onChange={() => { command.current = null; }} className="space-y-3">
          <fieldset disabled={busy || !canManage} className="space-y-3">
            <label htmlFor={`${formId}-configuration`} className="block text-sm">
              Configuración que gobierna el expediente
              <select id={`${formId}-configuration`} name="configuration" className={field} value={target} disabled={!editable}
                onChange={(event) => { setTarget(event.target.value); setConfirmed(false); }}>
                {options.map((option) => <option key={optionValue(option)} value={optionValue(option)}>{optionLabel(option)}</option>)}
              </select>
            </label>
            {locked ? <p role="note" className="text-xs text-muted-foreground">{LOCKED_REASONS[selection.lockedReason] || 'La configuración no puede cambiarse.'}</p> : null}
            {!locked ? <p className="text-xs text-muted-foreground">Puede cambiar la configuración, o volver a la documentación tradicional, mientras el expediente no tenga evidencia recibida.</p> : null}
            {operation === 'activate' && !governance.capabilities?.activationReady ? <p role="status" className="text-sm">La activación de configuraciones de Central aún no está habilitada en este servidor.</p> : null}
            {operation === 'legacy' ? <p role="status" className="text-sm">El expediente volverá a la documentación tradicional y se descartará la evaluación de requisitos de Central.</p> : null}
            {editable && operation ? (
              <>
                <label htmlFor={`${formId}-reason`} className="block text-sm">Motivo del cambio documental<input id={`${formId}-reason`} name="reason" className={field} maxLength={1000} required value={reason} onChange={(event) => setReason(event.target.value)} /></label>
                {operation === 'activate' ? <label htmlFor={`${formId}-future-only`} className="flex gap-2 text-sm"><input id={`${formId}-future-only`} name="confirmFutureReceipts" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />Solo gobernará futuras recepciones; no convertirá documentos históricos.</label> : null}
                <Button type="submit" disabled={!canApply}>Aplicar configuración</Button>
              </>
            ) : null}
            {canManage && canonical && !operation ? <Button type="button" variant="outline" onClick={() => execute('refresh', REFRESH_REASON)} disabled={busy}>Actualizar requisitos</Button> : null}
          </fieldset>
        </form>
      ) : null}
      <ReferencedExpedienteData source={governance?.source} />
    </details>
  );
}
