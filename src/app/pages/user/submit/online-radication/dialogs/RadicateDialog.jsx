import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { CircleAlert, FolderPlus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Dialog, DialogContent, DialogFooter } from '@/shared/ui/dialog';
import { DovelaButton, DovelaField, DovelaInput } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import OnlineRadicationService from '@/app/services/online-radication.service';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';
import { getDocumentEntries, plural, todayIsoDate } from '../onlineRadicationModel';
import { fetchNextLicenseIdPublic, fetchNextVr } from '../nextConsecutives';
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
  ONLINE_RADICATION_FUN_ID_TAKEN: 'funIdPublic',
  ONLINE_RADICATION_FUN_ID_INVALID: 'funIdPublic',
  ONLINE_RADICATION_VR_TAKEN: 'vr',
  ONLINE_RADICATION_VR_INVALID: 'vr',
  ONLINE_RADICATION_DATE_INVALID: 'date',
};
const TAKEN_MESSAGES = {
  ONLINE_RADICATION_FUN_ID_TAKEN: 'Ya existe un expediente con ese número.',
  ONLINE_RADICATION_VR_TAKEN: VR_TAKEN_MESSAGE,
};
const STALE_CODES = new Set(['ONLINE_RADICATION_NOT_PENDING', 'ONLINE_RADICATION_NOT_FOUND']);
const EMPTY_VALUES = () => ({ funIdPublic: '', vr: '', date: todayIsoDate() });

/** What happens to the initial document entry when the request is radicated. */
function initialEntryNote(request) {
  const entries = getDocumentEntries(request);
  if (!entries) return null;
  const initial = entries.find((entry) => entry.kind === 'initial');
  if (initial?.status === 'pending') {
    return (
      <>
        Los <span className="font-medium text-foreground">{plural(initial.documents.length, 'documento')}</span> de la radicación inicial
        {' '}se recibirán con este mismo VR y quedarán en sus listas y archivos de Ventanilla.
      </>
    );
  }
  if (!initial) return 'El portal aún no ha enviado los documentos de la radicación inicial; el VR se creará sin archivos.';
  return null;
}

/**
 * "Llevar a radicación": creates the FUN 0 and its VR. Both numbers are prefilled with the next
 * consecutives (same rules as Radicar / Nueva entrada); the server revalidates them. The pending
 * initial document entry is received with the same VR in the same transaction.
 */
export function RadicateDialog({ open, onOpenChange, request, onRadicated, onStale, onSuccessFocus }) {
  const formId = useId();
  const [values, setValues] = useState(EMPTY_VALUES);
  const [computing, setComputing] = useState({ funIdPublic: false, vr: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const funRef = useRef(null);
  const vrRef = useRef(null);
  const dateRef = useRef(null);
  const openingRef = useRef(0);
  const succeededRef = useRef(false);
  const pendingFocusRef = useRef(null);
  const entryNote = initialEntryNote(request);

  // Focus the first invalid field once the inputs are enabled again (after saving).
  const focusField = useCallback((field) => {
    pendingFocusRef.current = field;
  }, []);

  useEffect(() => {
    const field = pendingFocusRef.current;
    if (saving || !field) return;
    pendingFocusRef.current = null;
    ({ funIdPublic: funRef, vr: vrRef, date: dateRef }[field]?.current)?.focus();
  }, [saving, errors]);

  const compute = useCallback(async (field) => {
    const opening = openingRef.current;
    setComputing((current) => ({ ...current, [field]: true }));
    try {
      const value = field === 'funIdPublic' ? await fetchNextLicenseIdPublic() : await fetchNextVr();
      if (opening !== openingRef.current) return;
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => withoutKey(current, field));
    } catch {
      if (opening !== openingRef.current) return;
      setErrors((current) => ({ ...current, [field]: { message: COMPUTE_ERROR, retry: true } }));
    } finally {
      if (opening === openingRef.current) setComputing((current) => ({ ...current, [field]: false }));
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
    compute('funIdPublic');
    compute('vr');
  }, [open, compute]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: field === 'vr' ? value.toUpperCase() : value }));
    setErrors((current) => withoutKey(current, field));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    const funIdPublic = values.funIdPublic.trim();
    const vr = values.vr.trim().toUpperCase();
    const invalid = {};
    if (!funIdPublic) invalid.funIdPublic = { message: 'Indique el número de expediente.' };
    if (!vr) invalid.vr = { message: 'Indique el número de radicado VR.' };
    else if (!VR_PATTERN.test(vr)) invalid.vr = { message: VR_FORMAT_MESSAGE };
    if (!values.date) invalid.date = { message: 'Indique la fecha de radicación.' };
    const firstInvalid = ['funIdPublic', 'vr', 'date'].find((field) => invalid[field]);
    if (firstInvalid) {
      setErrors(invalid);
      focusField(firstInvalid);
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const item = await OnlineRadicationService.radicate(request.id, { funIdPublic, vr, date: values.date });
      succeededRef.current = true;
      onRadicated(item);
      onOpenChange(false);
    } catch (error) {
      const field = FIELD_BY_CODE[error?.code];
      if (field) {
        const taken = Boolean(TAKEN_MESSAGES[error.code]);
        setErrors({ [field]: { message: taken ? TAKEN_MESSAGES[error.code] : error.message, taken } });
        focusField(field);
      } else if (STALE_CODES.has(error?.code)) {
        setFormError(error.code === 'ONLINE_RADICATION_NOT_PENDING'
          ? 'La solicitud ya no está pendiente: otro usuario la procesó. Cierre este diálogo para ver su estado actual.'
          : error.message);
        onStale?.();
      } else {
        setFormError(error?.message || 'No fue posible llevar la solicitud a radicación.');
      }
    } finally {
      setSaving(false);
    }
  }

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
          icon={FolderPlus}
          title="Llevar a radicación"
          request={request}
          description="Se creará el expediente (FUN 0) y su radicado VR en Ventanilla, y la solicitud quedará marcada como radicada. Los documentos de la radicación inicial se reciben con ese VR."
        />

        <form id={formId} noValidate onSubmit={submit} className="grid gap-[1rem]" aria-busy={saving || undefined}>
          <div className="grid gap-2">
            <DovelaField
              label="Número de expediente"
              required
              error={errors.funIdPublic?.message}
              helperText={errors.funIdPublic ? undefined : 'Siguiente consecutivo de licencia. Puede ajustarlo si es necesario.'}
            >
              <ConsecutiveInput
                id={`${formId}-fun`}
                inputRef={funRef}
                value={values.funIdPublic}
                onChange={(event) => update('funIdPublic', event.target.value)}
                computing={computing.funIdPublic}
                onRecompute={() => compute('funIdPublic')}
                recomputeLabel="Recalcular el número de expediente"
                required
                disabled={saving}
              />
            </DovelaField>
            <FieldAction error={errors.funIdPublic} disabled={computing.funIdPublic || saving} onClick={() => compute('funIdPublic')} />
          </div>

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
                computing={computing.vr}
                onRecompute={() => compute('vr')}
                recomputeLabel="Recalcular el radicado VR"
                required
                disabled={saving}
              />
            </DovelaField>
            <FieldAction error={errors.vr} disabled={computing.vr || saving} onClick={() => compute('vr')} />
          </div>

          <DovelaField label="Fecha de radicación" required error={errors.date?.message}>
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
            <div className="min-w-0 space-y-1">
              <p className="mb-0">
                El radicado quedará a nombre de <span className="font-medium text-foreground">{request?.applicantName || 'el solicitante'}</span>
                {' '}con la descripción «Solicitud de radicación en línea{request?.publicCode ? ` ${request.publicCode}` : ''}».
              </p>
              {entryNote ? <p className="mb-0">{entryNote}</p> : null}
            </div>
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
            leadingIcon={FolderPlus}
            loading={saving}
            loadingLabel="Radicando…"
            disabled={computing.funIdPublic || computing.vr}
          >
            Radicar solicitud
          </DovelaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
