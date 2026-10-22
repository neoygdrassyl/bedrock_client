import { useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { documentaryError } from '@/app/services/documentary.service';
import { addRequirementAddition, getRequirementAdditions, removeRequirementAddition } from '@/app/services/documentaryOperations.service';
import { CatalogueDocumentPicker } from '../molecules/CatalogueDocumentPicker';
import { FormField } from '../molecules/FormField';
import { DOCUMENTAL_SCOPE } from '../documentalScope';
import { ErrorMessage } from './CanonicalDocumentForms';
import { formatDocumentaryDate } from '../../canonicalDocumentaryModel';

const ADD_MESSAGE = 'Documento agregado a los requisitos del expediente.';
const REMOVE_MESSAGE = 'Documento quitado de los requisitos del expediente.';

// Rule errors of the additions endpoints that the user can act on.
const ADDITION_ERRORS = {
  REQUIREMENT_ALREADY_ADDED: 'Este documento ya fue agregado al expediente.',
  REQUIREMENT_ALREADY_REQUIRED: 'Este documento ya es un requisito del expediente.',
  DOCUMENT_NOT_FOUND: 'El documento no existe en el catálogo de la configuración del expediente.',
};
export const additionErrorText = (failure) => ADDITION_ERRORS[failure?.response?.data?.error?.code] || documentaryError(failure);

const codeOf = (item) => item.documentCode || item.code || null;
const labelOf = (item) => [codeOf(item), item.title || item.name].filter(Boolean).join(' · ') || 'Documento';

/** Motive + confirm dialog shared by "Agregar" and "Quitar". `onConfirm(reason, idempotencyKey)` rejects with the failure. */
function AdditionDialog({ open, title, description, confirmLabel, destructive = false, canConfirm = true, onConfirm, onClose, children }) {
  const ids = useId();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const key = useRef(null);
  useEffect(() => { if (open) { setReason(''); setError(''); key.current = null; } }, [open]);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    if (!reason.trim()) { setError('Indique el motivo.'); return; }
    setBusy(true); setError('');
    try {
      key.current ||= crypto.randomUUID();
      await onConfirm(reason.trim(), key.current);
    } catch (failure) {
      if (failure.response) key.current = null;
      setError(additionErrorText(failure));
    } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className={cn(DOCUMENTAL_SCOPE, 'max-w-lg')}>
        <form onSubmit={submit} onChange={() => { key.current = null; }} className="flex min-w-0 flex-col gap-[1rem]" noValidate>
          <DialogHeader>
            <DialogTitle className="mb-0 text-base">{title}</DialogTitle>
            <DialogDescription className="mb-0 text-xs">{description}</DialogDescription>
          </DialogHeader>
          {children}
          <FormField id={`${ids}-reason`} label="Motivo" hint="Queda en el historial documental del expediente.">
            <Input id={`${ids}-reason`} className="text-sm" maxLength={1000} value={reason} onChange={(event) => { key.current = null; setReason(event.target.value); }} aria-describedby={`${ids}-reason-hint`} />
          </FormField>
          <ErrorMessage error={error} />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" variant={destructive ? 'destructive' : 'default'} disabled={busy || !reason.trim() || !canConfirm}>{busy ? 'Guardando…' : confirmLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * "Documentos agregados al expediente": documents of the pinned Central catalogue that the curaduría added by hand
 * to the requirements of this expediente. `onChanged(message)` fires after an add/remove so the module can reload
 * the origin and everything that derives from the requirements.
 */
export function RequirementAdditions({ fun0Id, canManage = false, onChanged }) {
  const [state, setState] = useState({ key: null, data: null, error: '' });
  const [nonce, setNonce] = useState(0);
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState('');
  const [removing, setRemoving] = useState(null);
  const key = `${fun0Id}:${nonce}`;
  useEffect(() => {
    const controller = new AbortController();
    getRequirementAdditions(fun0Id, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setState({ key, data, error: '' }); })
      .catch((failure) => { if (!controller.signal.aborted) setState({ key, data: null, error: documentaryError(failure) }); });
    return () => controller.abort();
  }, [fun0Id, key]);
  const current = state.key === key ? state : null;
  const data = current?.data || state.data;
  const additions = data?.additions || [];
  const addedIds = new Set(additions.map((item) => item.documentId));
  const options = (data?.catalogue || []).filter((item) => !item.alreadyRequired && !addedIds.has(item.documentId));

  async function add(reason, idempotencyKey) {
    await addRequirementAddition(fun0Id, { documentId: selected, reason, idempotencyKey });
    setAdding(false); setNonce((value) => value + 1); onChanged?.(ADD_MESSAGE);
  }
  async function remove(reason, idempotencyKey) {
    await removeRequirementAddition(fun0Id, removing.documentId, { reason, idempotencyKey });
    setRemoving(null); setNonce((value) => value + 1); onChanged?.(REMOVE_MESSAGE);
  }

  return (
    <section aria-label="Documentos agregados al expediente" className="flex min-w-0 flex-col gap-[0.75rem] rounded-lg border bg-[hsl(var(--card))] p-[1rem]">
      <div className="flex flex-wrap items-start justify-between gap-x-[1rem] gap-y-2">
        <div className="min-w-0 flex-1 basis-[16rem]">
          <h4 className="mb-0 text-sm font-semibold leading-5 text-foreground">Documentos agregados al expediente</h4>
          <p className="mb-0 mt-0.5 text-xs leading-4 text-slate-600">Documentos del catálogo que se exigen en este expediente además de los que resultan de sus datos.</p>
        </div>
        {canManage ? (
          <Button type="button" variant="outline" size="sm" disabled={!data} onClick={() => { setSelected(''); setAdding(true); }}>
            <Plus aria-hidden="true" />Agregar documento
          </Button>
        ) : null}
      </div>
      {state.error && !data ? (
        <Alert variant="destructive" className="flex-wrap items-center">
          <CircleAlert aria-hidden="true" />
          <AlertDescription className="min-w-0 flex-1">{state.error}</AlertDescription>
          <Button type="button" variant="outline" size="sm" className="h-8 bg-background" onClick={() => setNonce((value) => value + 1)}>Reintentar</Button>
        </Alert>
      ) : null}
      {!data && !state.error ? <Skeleton className="h-10 w-full" aria-hidden="true" /> : null}
      {data && !additions.length ? <p className="mb-0 text-xs leading-5 text-slate-600">No se han agregado documentos a este expediente.</p> : null}
      {additions.length ? (
        <ul className="m-0 flex list-none flex-col divide-y rounded-md border p-0" aria-label="Documentos agregados">
          {additions.map((item) => (
            <li key={item.documentId} className="flex flex-wrap items-center gap-x-[1rem] gap-y-1 px-[0.75rem] py-2" data-testid={`addition-${item.documentId}`}>
              <div className="min-w-0 flex-1 basis-[14rem]">
                <p className="mb-0 text-[13px] font-medium leading-5 text-foreground"><span className="mr-2 font-mono text-xs text-muted-foreground">{codeOf(item) || '—'}</span>{item.title || 'Documento sin nombre'}</p>
                {item.reason ? <p className="mb-0 text-xs leading-4 text-slate-600">Motivo: {item.reason}</p> : null}
                <p className="mb-0 text-[11px] leading-4 text-muted-foreground">
                  {item.addedByName ? `Agregado por ${item.addedByName}` : item.addedBy != null ? `Agregado por el usuario ${item.addedBy}` : 'Agregado'} · {formatDocumentaryDate(item.addedAt)}
                </p>
              </div>
              {canManage ? <Button type="button" variant="outline" size="sm" className="h-8 text-xs" aria-label={`Quitar ${labelOf(item)}`} onClick={() => setRemoving(item)}>Quitar</Button> : null}
            </li>
          ))}
        </ul>
      ) : null}

      <AdditionDialog
        open={adding}
        title="Agregar documento"
        description="Elija un documento del catálogo para exigirlo en este expediente."
        confirmLabel="Agregar"
        canConfirm={Boolean(selected)}
        onConfirm={add}
        onClose={() => setAdding(false)}
      >
        <CatalogueDocumentPicker
          id={`addition-picker`}
          documents={options}
          value={selected}
          onChange={setSelected}
        />
      </AdditionDialog>
      <AdditionDialog
        open={Boolean(removing)}
        title="Quitar documento"
        description={removing ? `Se dejará de exigir «${labelOf(removing)}» en este expediente.` : ''}
        confirmLabel="Quitar"
        destructive
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </section>
  );
}

export default RequirementAdditions;
