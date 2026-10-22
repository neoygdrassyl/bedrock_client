import { useEffect, useId, useRef, useState } from 'react';
import { Ban, CircleAlert } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Dialog, DialogContent, DialogFooter } from '@/shared/ui/dialog';
import { DovelaButton, DovelaField, DovelaTextarea } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import OnlineRadicationService from '@/app/services/online-radication.service';
import { ONLINE_RADICATION_SCOPE } from '../onlineRadicationScope';
import { DialogHeading } from './DialogHeading';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;
const REASON_CODES = new Set(['ONLINE_RADICATION_REASON_REQUIRED', 'DOCUMENT_ENTRY_INVALID']);

const VARIANTS = {
  request: {
    title: 'Rechazar solicitud',
    description: 'La solicitud quedará marcada como rechazada y no consumirá consecutivos. El motivo queda registrado en la solicitud.',
    placeholder: 'Explique por qué no puede radicarse, por ejemplo: documentos ilegibles o información del predio incompleta.',
    submit: 'Rechazar solicitud',
    failure: 'No fue posible rechazar la solicitud.',
    staleCodes: new Set(['ONLINE_RADICATION_NOT_PENDING', 'ONLINE_RADICATION_NOT_FOUND']),
    staleMessage: 'La solicitud ya no está pendiente: otro usuario la procesó. Cierre este diálogo para ver su estado actual.',
    notPendingCode: 'ONLINE_RADICATION_NOT_PENDING',
  },
  entry: {
    title: 'Rechazar entrada de documentos',
    description: 'La entrada quedará rechazada sin crear un radicado VR. La ciudadanía verá el motivo en el portal y podrá enviar los documentos de nuevo.',
    placeholder: 'Explique qué debe corregirse, por ejemplo: el certificado de libertad y tradición tiene más de 30 días de expedido.',
    submit: 'Rechazar entrada',
    failure: 'No fue posible rechazar la entrada de documentos.',
    staleCodes: new Set(['DOCUMENT_ENTRY_NOT_PENDING', 'DOCUMENT_ENTRY_NOT_FOUND', 'ONLINE_RADICATION_NOT_OPEN', 'ONLINE_RADICATION_NOT_FOUND']),
    staleMessage: 'La entrada ya no está pendiente: otro usuario la procesó. Cierre este diálogo para ver su estado actual.',
    notPendingCode: 'DOCUMENT_ENTRY_NOT_PENDING',
  },
};

/**
 * "Rechazar": required reason (10–1000 characters) and a destructive confirmation. With `entry`
 * it rejects that document entry instead of the whole request; `onRejected(item | null, entry)`.
 */
export function RejectDialog({ open, onOpenChange, request, entry = null, onRejected, onStale, onSuccessFocus }) {
  const copy = entry ? VARIANTS.entry : VARIANTS.request;
  const formId = useId();
  const counterId = `${formId}-counter`;
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);
  const succeededRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    succeededRef.current = false;
    setReason('');
    setTouched(false);
    setFieldError('');
    setFormError('');
    setSaving(false);
  }, [open]);

  const length = reason.trim().length;
  const tooShort = length < MIN_LENGTH;
  const clientError = touched && tooShort ? `Escriba al menos ${MIN_LENGTH} caracteres para explicar el motivo.` : '';
  const error = fieldError || clientError;

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setTouched(true);
    if (tooShort) {
      textareaRef.current?.focus();
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { reason: reason.trim() };
      const item = entry
        ? await OnlineRadicationService.rejectEntry(request.id, entry.id, payload)
        : await OnlineRadicationService.reject(request.id, payload);
      succeededRef.current = true;
      onRejected(item, entry);
      onOpenChange(false);
    } catch (failure) {
      if (REASON_CODES.has(failure?.code)) {
        setFieldError(failure.message);
      } else if (copy.staleCodes.has(failure?.code)) {
        setFormError(failure.code === copy.notPendingCode ? copy.staleMessage : failure.message);
        onStale?.();
      } else {
        setFormError(failure?.message || copy.failure);
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
          icon={Ban}
          tone="danger"
          title={copy.title}
          request={request}
          description={copy.description}
        />

        <form id={formId} noValidate onSubmit={submit} className="grid gap-[1rem]" aria-busy={saving || undefined}>
          <div className="grid gap-1.5">
            <DovelaField label="Motivo del rechazo" required error={error}>
              <DovelaTextarea
                id={`${formId}-reason`}
                ref={textareaRef}
                value={reason}
                maxLength={MAX_LENGTH}
                rows={5}
                required
                disabled={saving}
                aria-describedby={counterId}
                placeholder={copy.placeholder}
                onChange={(event) => { setReason(event.target.value); setFieldError(''); }}
                onBlur={() => { if (reason) setTouched(true); }}
                className="resize-y"
              />
            </DovelaField>
            <p id={counterId} className={cn('mb-0 text-right text-xs tabular-nums text-muted-foreground', reason.length >= MAX_LENGTH && 'font-medium text-[hsl(var(--destructive))]')}>
              {reason.length} / {MAX_LENGTH}
              {tooShort ? <span> · mínimo {MIN_LENGTH}</span> : null}
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
          <DovelaButton type="submit" form={formId} tone="danger" leadingIcon={Ban} loading={saving} loadingLabel="Rechazando…" disabled={tooShort}>
            {copy.submit}
          </DovelaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
