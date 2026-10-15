import { Tag } from '../atoms/Tag';
import { useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, Info, Lock, RefreshCw, Settings2, TriangleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import {
  getDocumentaryGovernance,
  activateDocumentaryProject,
  changeDocumentaryConfiguration,
  returnDocumentaryProjectToLegacy,
  refreshDocumentaryRequirements,
} from '@/app/services/documentaryOperations.service';
import { buildDocumentaryCommand } from '@/app/services/documentaryRequirements.service';
import { DetailFact } from '../molecules/DetailSection';
import { CheckboxField, FormField } from '../molecules/FormField';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { funFactLabel } from '../../funFactLabels';

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

const CACHE_STATES = {
  current: { label: 'al día', tone: 'success' },
  stale: { label: 'desactualizada', tone: 'warning' },
  pending: { label: 'pendiente', tone: 'neutral' },
};

export function optionValue(option) {
  return option.kind === 'legacy' ? LEGACY_VALUE : String(option.configurationId);
}

export function optionLabel(option) {
  if (option.kind === 'legacy') return `Legacy (documentación tradicional)${option.selected ? ' · En uso' : ''}`;
  const marks = [option.isCurrent ? 'Vigente' : null, option.selected ? 'En uso' : null].filter(Boolean);
  return [`Publicación ${option.releaseVersion}`, ...marks].join(' · ');
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

function Notice({ role = 'status', variant = 'neutral', icon: Icon = Info, children }) {
  return (
    <Alert role={role} variant={variant} className="py-2.5">
      <Icon aria-hidden="true" />
      <AlertDescription className="min-w-0 flex-1">{children}</AlertDescription>
    </Alert>
  );
}

export function ReferencedExpedienteData({ source, onFixFun }) {
  if (!source) return null;
  return (
    <section aria-label="Datos del expediente usados en la evaluación" className="min-w-0 rounded-lg border bg-[hsl(var(--card))]">
      <header className="border-b bg-muted/30 px-[1rem] py-2.5">
        <h4 className="mb-0 text-sm font-semibold leading-5 text-foreground">Datos del expediente usados en la evaluación</h4>
        <p className="mb-0 mt-0.5 text-xs leading-4 text-slate-600">
          {source.selectedFunVersion == null
            ? 'El expediente no tiene una versión FUN activa única.'
            : `Formulario FUN 1 · versión ${source.selectedFunVersion}${source.sourceRowId ? ` · registro ${source.sourceRowId}` : ''}`}
        </p>
      </header>
      <div className="flex flex-col gap-[0.75rem] p-[1rem]">
        {(source.fields || []).length ? (
          <dl className="m-0 grid gap-x-[1.25rem] gap-y-[0.75rem] sm:grid-cols-2 xl:grid-cols-3">
            {source.fields.map((item) => (
              <DetailFact key={item.field} label={SOURCE_FIELD_LABELS[item.field] || item.field}>
                {funFactLabel(item.field, item.value) ?? <span className="font-normal text-slate-600">Sin dato</span>}
              </DetailFact>
            ))}
          </dl>
        ) : null}
        {(source.diagnostics || []).length ? (
          <ul className="mb-0 list-disc space-y-1 pl-5 text-xs text-[hsl(var(--operational-warning-text))]">
            {source.diagnostics.map((item, index) => <li key={`${item.code}:${item.field || index}`}>{item.field ? `${SOURCE_FIELD_LABELS[item.field] || item.field}: el FUN tiene un valor que no corresponde a ninguna opción del formulario («${item.value}»). Revíselo y corríjalo.` : 'No hay una versión FUN activa única para evaluar.'}</li>)}
          </ul>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-[1rem] gap-y-2">
          <p className="mb-0 min-w-0 flex-1 basis-[18rem] text-xs leading-4 text-slate-600">
            Estos datos vienen del FUN y no se editan aquí. Si alguno es incorrecto, corríjalo en «Actualizar» y luego use «Actualizar requisitos».
          </p>
          {onFixFun ? <Button type="button" variant="outline" size="sm" onClick={onFixFun}>Corregir datos del FUN</Button> : null}
        </div>
      </div>
    </section>
  );
}

/** Card with title and description (tab content) or a collapsible block (inline use). */
function GovernanceFrame({ collapsible, open, titleId, children }) {
  const title = 'Configuración documental del expediente';
  const description = 'Catálogo que gobierna la radicación y datos usados en la evaluación.';
  if (collapsible) {
    return (
      <details className="min-w-0 rounded-lg border bg-[hsl(var(--card))] shadow-sm" open={open}>
        <summary className="cursor-pointer px-[1rem] py-[0.75rem] text-sm font-semibold text-foreground">{title}</summary>
        <div className="flex flex-col gap-[1rem] border-t p-[1rem]">{children}</div>
      </details>
    );
  }
  return (
    <section aria-labelledby={titleId} className="min-w-0 rounded-lg border bg-[hsl(var(--card))] shadow-sm">
      <header className="flex items-start gap-[0.75rem] border-b px-[1rem] py-[0.75rem]">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-[1px] border-solid border-primary/20 bg-primary/10 text-[hsl(var(--primary))]">
          <Settings2 className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="mb-0 text-[15px] font-semibold leading-5 text-foreground">{title}</h2>
          <p className="mb-0 mt-0.5 text-xs leading-4 text-slate-600">{description}</p>
        </div>
      </header>
      <div className="flex flex-col gap-[1rem] p-[1rem]">{children}</div>
    </section>
  );
}

/** One-line effect of the chosen operation, shown before confirming. */
function operationEffect(operation, target, currentOption) {
  if (operation === 'activate') return `Se activará la Publicación ${target.releaseVersion} de Central. Solo gobernará futuras recepciones; no convertirá documentos históricos.`;
  if (operation === 'configuration') return `El expediente pasará de la Publicación ${currentOption.releaseVersion} a la Publicación ${target.releaseVersion}.`;
  if (operation === 'legacy') return 'El expediente volverá a la documentación tradicional y se descartará la evaluación de requisitos de Central.';
  return 'Elija una opción distinta de la actual para continuar.';
}

function ChangeVersionDialog({ open, onOpenChange, formId, options, currentOption, target, onTarget, operation, activationReady, reason, onReason, confirmed, onConfirmed, busy, canApply, error, onSubmit }) {
  const targetOption = options.find((option) => optionValue(option) === target);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-lg')}>
        <DialogHeader>
          <DialogTitle>Cambiar versión</DialogTitle>
          <DialogDescription>Elija la configuración que gobernará el expediente. Se puede cambiar mientras no haya evidencia recibida.</DialogDescription>
        </DialogHeader>
        <form id={`${formId}-change`} className="flex flex-col gap-[0.75rem]" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
          <fieldset disabled={busy} className="m-0 flex flex-col gap-1.5 p-0 !border-0">
            <legend className="mb-1 text-[13px] font-medium leading-5 text-foreground">Configuración</legend>
            {options.map((option) => {
              const value = optionValue(option);
              const id = `${formId}-option-${value}`;
              return (
                <label key={value} htmlFor={id} className={cn('flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-sm text-foreground', value === target && 'border-primary bg-primary/5')}>
                  <input id={id} type="radio" name={`${formId}-configuration`} value={value} checked={value === target} onChange={() => onTarget(value)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  {optionLabel(option)}
                </label>
              );
            })}
          </fieldset>
          <Notice variant={operation === 'legacy' ? 'warning' : 'neutral'} icon={operation === 'legacy' ? TriangleAlert : Info}>{operationEffect(operation, targetOption || {}, currentOption || {})}</Notice>
          {operation === 'activate' && !activationReady ? <Notice variant="warning" icon={TriangleAlert}>La activación de configuraciones de Central aún no está habilitada en este servidor.</Notice> : null}
          {operation ? (
            <>
              <FormField id={`${formId}-reason`} label="Motivo del cambio documental" hint="Queda en el historial del expediente.">
                <Input id={`${formId}-reason`} name="reason" className="text-sm" maxLength={1000} required value={reason} disabled={busy} aria-describedby={`${formId}-reason-hint`} onChange={(event) => onReason(event.target.value)} />
              </FormField>
              {operation === 'activate' ? <CheckboxField id={`${formId}-future-only`} name="confirmFutureReceipts" label="Solo gobernará futuras recepciones; no convertirá documentos históricos." checked={confirmed} disabled={busy} onChange={(event) => onConfirmed(event.target.checked)} /> : null}
            </>
          ) : null}
          {error ? <Notice role="alert" variant="destructive" icon={CircleAlert}>{error}</Notice> : null}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" form={`${formId}-change`} disabled={!canApply}>{busy ? 'Aplicando…' : 'Aplicar configuración'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DocumentaryGovernance({ origin, view, canManage = false, defaultOpen = false, onSaved = () => {}, onConflict = () => {}, onFixFun }) {
  const formId = useId();
  const [governance, setGovernance] = useState(null);
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const currentVigente = options.find((option) => option.kind !== 'legacy' && option.isCurrent && !option.selected);
  const disabledReason = !canManage
    ? 'Solo los roles autorizados pueden cambiar la versión.'
    : locked ? (LOCKED_REASONS[selection.lockedReason] || 'La configuración no puede cambiarse.') : null;
  function openDialog() {
    setError(''); setReason(''); setConfirmed(false); command.current = null;
    setTarget(currentValue);
    setDialogOpen(true);
  }

  const activationBlocked = operation === 'activate' && (!confirmed || !governance?.capabilities?.activationReady);
  const canApply = editable && Boolean(operation) && !busy && Boolean(reason.trim()) && !activationBlocked;
  // The optional view comes from the documents tab; the governance read carries the same state.
  const cacheState = view?.governance?.cacheState ?? governance?.cacheState;
  const cache = CACHE_STATES[cacheState] || CACHE_STATES.pending;

  async function execute(kind, fixedReason) {
    if (busy || !canManage) return;
    const motive = (fixedReason || reason).trim();
    setBusy(true); setError('');
    try {
      if (!motive) throw new Error('Indique el motivo del cambio.');
      if (command.current?.operation !== kind) command.current = null;
      if (!command.current) {
        const body = buildDocumentaryCommand(governance?.inputRevision, motive);
        if (kind === 'activate' || kind === 'configuration') {
          const configuration = options.find((option) => optionValue(option) === target);
          Object.assign(body, { configurationId: configuration.configurationId, expectedChecksum: configuration.checksum });
        }
        command.current = { operation: kind, body };
      }
      const api = { activate: activateDocumentaryProject, configuration: changeDocumentaryConfiguration, legacy: returnDocumentaryProjectToLegacy, refresh: refreshDocumentaryRequirements }[kind];
      await api(fun0Id, command.current.body);
      command.current = null;
      // Every command (refresh included) changes what the origin and the evaluation report.
      setDialogOpen(false);
      onSaved(SUCCESS_MESSAGES[kind], true);
    } catch (failure) {
      if (failure.response) command.current = null;
      if (failure.response?.status === 409) { setDialogOpen(false); onConflict(); } else setError(documentaryError(failure));
    } finally { setBusy(false); }
  }

  return (
    <GovernanceFrame collapsible={!defaultOpen} open={!canonical} titleId={`${formId}-title`}>
      {canonical && cacheState ? (
        <p className="mb-0 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          Estado de la evaluación de requisitos:
          <Tag tone={cache.tone} pill title={cache.tone === 'warning' ? 'La evaluación no refleja los datos actuales del expediente' : undefined}>{cache.label}</Tag>
        </p>
      ) : null}
      {error && !dialogOpen ? <Notice role="alert" variant="destructive" icon={CircleAlert}>{error}</Notice> : null}
      {!governance && !error ? (
        <div className="flex flex-col gap-2">
          <p role="status" className="mb-0 text-xs text-slate-600">Consultando la configuración del expediente…</p>
          <Skeleton className="h-10 w-full max-w-xl" aria-hidden="true" />
        </div>
      ) : null}
      {governance ? (
        <div className="flex min-w-0 flex-col gap-[0.75rem]">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[13px] font-medium leading-5 text-foreground">Configuración que gobierna el expediente</span>
            <p className="mb-0 text-sm font-semibold text-foreground" data-testid="governance-current">{optionLabel(currentOption || { kind: 'legacy', selected: true })}</p>
            {currentVigente ? <p className="mb-0 text-xs text-slate-600">Vigente: Publicación {currentVigente.releaseVersion}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-2">
            <Button type="button" variant="outline" size="sm" disabled={!editable || busy} onClick={openDialog}>Cambiar versión</Button>
            {disabledReason ? <span className="min-w-0 flex-1 basis-[16rem] text-xs leading-4 text-slate-600">{disabledReason}</span> : null}
            {canManage && canonical ? (
              <Button type="button" variant="outline" size="sm" onClick={() => execute('refresh', REFRESH_REASON)} disabled={busy}>
                <RefreshCw aria-hidden="true" />Actualizar requisitos
              </Button>
            ) : null}
          </div>
          {locked ? <Notice role="note" icon={Lock}>{LOCKED_REASONS[selection.lockedReason] || 'La configuración no puede cambiarse.'}</Notice> : null}
        </div>
      ) : null}
      {governance ? (
        <ChangeVersionDialog
          open={dialogOpen && editable}
          onOpenChange={(value) => { if (!busy) setDialogOpen(value); }}
          formId={formId}
          options={options}
          currentOption={currentOption}
          target={target}
          onTarget={(value) => { command.current = null; setTarget(value); setConfirmed(false); }}
          operation={operation}
          activationReady={Boolean(governance.capabilities?.activationReady)}
          reason={reason}
          onReason={(value) => { command.current = null; setReason(value); }}
          confirmed={confirmed}
          onConfirmed={(value) => { command.current = null; setConfirmed(value); }}
          busy={busy}
          canApply={canApply}
          error={error}
          onSubmit={() => { if (operation) execute(operation); }}
        />
      ) : null}
      <ReferencedExpedienteData source={governance?.source} onFixFun={onFixFun} />
    </GovernanceFrame>
  );
}
