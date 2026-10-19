import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, FileCheck2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { DovelaButton, DovelaField, DovelaInput } from '@/components/dovela-ui';
import { cn } from '@/lib/utils';
import OnlineRadicationService from '@/app/services/online-radication.service';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';
import { ENTRY_KIND_LABELS, formatDateTime, plural, todayIsoDate } from '../onlineRadicationModel';
import { fetchNextVr } from '../nextConsecutives';
import {
  COMPUTE_ERROR,
  ConsecutiveInput,
  FieldAction,
  VR_FORMAT_MESSAGE,
  VR_PATTERN,
  VR_TAKEN_MESSAGE,
  withoutKey,
} from './ConsecutiveFields';
import { DialogHeading } from './DialogHeading';

const FIELD_BY_CODE = {
  ONLINE_RADICATION_VR_TAKEN: 'vr',
  ONLINE_RADICATION_VR_INVALID: 'vr',
  ONLINE_RADICATION_DATE_INVALID: 'date',
};
const STALE_CODES = new Set(['DOCUMENT_ENTRY_NOT_PENDING', 'DOCUMENT_ENTRY_NOT_FOUND', 'ONLINE_RADICATION_NOT_OPEN', 'ONLINE_RADICATION_NOT_FOUND']);
const STALE_MESSAGES = {
  DOCUMENT_ENTRY_NOT_PENDING: 'La entrada ya no está pendiente: otro usuario la procesó. Cierre este diálogo para ver su estado actual.',
  ONLINE_RADICATION_NOT_OPEN: 'La solicitud fue rechazada, así que ya no admite entradas de documentos.',
};
const EMPTY_VALUES = () => ({ vr: '', date: todayIsoDate() });

/**
 * "Recibir como VR": registers a pending `update` entry as a new Ventanilla VR (submits,
 * sub_lists and sub_docs). The VR is prefilled with the next consecutive, like "Nueva entrada";
 * the server revalidates it under the same lock as radicate. `onReceived(item | null, entry)`.
 */
export function ReceiveEntryDialog({ open, onOpenChange, request, entry, onReceived, onStale, onSuccessFocus }) {
  const formId = useId();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [computing, setComputing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const vrRef = useRef(null);
  const dateRef = useRef(null);
  const openingRef = useRef(0);
  const succeededRef = useRef(false);
  const pendingFocusRef = useRef(null);

  useEffect(() => {
    const field = pendingFocusRef.current;
    if (saving || !field) return;
    pendingFocusRef.current = null;
    ({ vr: vrRef, date: dateRef }[field]?.current)?.focus();
  }, [saving, errors]);

  const computeVr = useCallback(async () => {
    const opening = openingRef.current;
    setComputing(true);
    try {
      const value = await fetchNextVr();
      if (opening !== openingRef.current) return;
      setValues((current) => ({ ...current, vr: value }));
      setErrors((current) => withoutKey(current, 'vr'));
    } catch {
      if (opening !== openingRef.current) return;
      setErrors((current) => ({ ...current, vr: { message: COMPUTE_ERROR, retry: true } }));
    } finally {
      if (opening === openingRef.current) setComputing(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    openingRef.current += 1;
    succeededRef.current = false;
    setValues(EMPTY_VALUES());
    setErrors({});
    setFormError('');
    setSaving(false);
    computeVr();
  }, [open, computeVr]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: field === 'vr' ? value.toUpperCase() : value }));
    setErrors((current) => withoutKey(current, field));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || !entry) return;
    const vr = values.vr.trim().toUpperCase();
    const invalid = {};
    if (!vr) invalid.vr = { message: 'Indique el número de radicado VR.' };
    else if (!VR_PATTERN.test(vr)) invalid.vr = { message: VR_FORMAT_MESSAGE };
    if (!values.date) invalid.date = { message: 'Indique la fecha de recepción.' };
    const firstInvalid = ['vr', 'date'].find((field) => invalid[field]);
    if (firstInvalid) {
      setErrors(invalid);
      pendingFocusRef.current = firstInvalid;
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const item = await OnlineRadicationService.receiveEntry(request.id, entry.id, { vr, date: values.date });
      succeededRef.current = true;
      onReceived(item, { ...entry, vr });
      onOpenChange(false);
    } catch (error) {
      const field = FIELD_BY_CODE[error?.code];
      if (field) {
        const taken = error.code === 'ONLINE_RADICATION_VR_TAKEN';
        setErrors({ [field]: { message: taken ? VR_TAKEN_MESSAGE : error.message, taken } });
        pendingFocusRef.current = field;
      } else if (STALE_CODES.has(error?.code)) {
        setFormError(STALE_MESSAGES[error.code] || error.message);
        onStale?.();
      } else {
        setFormError(error?.message || 'No fue posible recibir la entrada de documentos.');
      }
    } finally {
      setSaving(false);
    }
  }

  const documentCount = entry?.documents?.length ?? 0;
  const relatedTo = request?.funIdPublic || request?.publicCode;
  const arrived = formatDateTime(entry?.receivedAt);

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) onOpenChange(next); }}>
      <DialogContent
        className={cn(ONLINE_RADICATION_SCOPE, 'max-w-[34rem] gap-[1.25rem]')}
        onCloseAutoFocus={(event) => {
          if (!succeededRef.current) return;
          event.preventDefault();
          onSuccessFocus?.();
        }}
      >
        <DialogHeading
          icon={FileCheck2}
          title="Recibir entrada como VR"
          request={request}
          description={`Se creará un radicado VR en Ventanilla con ${plural(documentCount, 'documento')} de esta ${ENTRY_KIND_LABELS[entry?.kind]?.toLowerCase() || 'entrada'}${arrived ? ` (llegó el ${arrived})` : ''}. La ciudadanía verá la entrada como recibida.`}
        />

        <form id={formId} noValidate onSubmit={submit} className="grid gap-[1rem]" aria-busy={saving || undefined}>
          <div className="grid gap-2">
            <DovelaField
              label="Radicado VR"
              required
              error={errors.vr?.message}
              helperText={errors.vr ? undefined : 'Siguiente radicado de Ventanilla, con formato VR{AA}-NNNN.'}
            >
              <ConsecutiveInput
                id={`${formId}-vr`}
                inputRef={vrRef}
                value={values.vr}
                onChange={(event) => update('vr', event.target.value)}
                computing={computing}
                onRecompute={computeVr}
                recomputeLabel="Recalcular el radicado VR"
                required
                disabled={saving}
              />
            </DovelaField>
            <FieldAction error={errors.vr} disabled={computing || saving} onClick={computeVr} />
          </div>

          <DovelaField label="Fecha de recepción" required error={errors.date?.message}>
            <DovelaInput
              id={`${formId}-date`}
              ref={dateRef}
              type="date"
              value={values.date}
              onChange={(event) => update('date', event.target.value)}
              required
              disabled={saving}
              className="w-full sm:w-[12rem]"
            />
          </DovelaField>

          <div className="flex gap-2.5 rounded-lg bg-muted/50 px-[0.875rem] py-2.5 text-xs leading-5 text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p className="mb-0 min-w-0">
              El radicado quedará relacionado con{' '}
              <span className="font-mono font-medium text-foreground">{relatedTo || '—'}</span>
              {' '}con la descripción «Entrada de documentos en línea{request?.publicCode ? ` ${request.publicCode}` : ''}».
              {request?.funIdPublic ? null : ' Al radicar la solicitud, se actualizará al número de expediente.'}
            </p>
          </div>

          {formError ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertDescription className="min-w-0 flex-1">{formError}</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DovelaButton tone="neutral" disabled={saving} onClick={() => onOpenChange(false)}>Cancelar</DovelaButton>
          <DovelaButton
            type="submit"
            form={formId}
            tone="primary"
            leadingIcon={FileCheck2}
            loading={saving}
            loadingLabel="Recibiendo…"
            disabled={computing}
          >
            Recibir como VR
          </DovelaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
