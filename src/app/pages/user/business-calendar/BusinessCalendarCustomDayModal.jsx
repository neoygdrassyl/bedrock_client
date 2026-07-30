import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function BusinessCalendarCustomDayModal(props) {
  const { open, date, phase, onClose } = props;
  return (
    <Dialog open={open} onOpenChange={nextOpen => { if (!nextOpen) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{modalTitle(phase)}</DialogTitle>
          <DialogDescription>{date ? `Fecha seleccionada: ${date}` : 'Seleccioná una fecha del calendario.'}</DialogDescription>
        </DialogHeader>
        <ModalBody {...props} />
        <ModalActions {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ModalBody({ phase, reason, onReasonChange, error, pending }) {
  if (phase !== 'create') return error ? <ActionError message={error} /> : null;
  return (
    <div className="space-y-2">
      <Label htmlFor="custom-day-reason">Motivo</Label>
      <Textarea
        id="custom-day-reason"
        value={reason}
        maxLength={500}
        disabled={pending}
        aria-describedby={error ? 'custom-day-error' : undefined}
        onChange={event => onReasonChange(event.target.value)}
      />
      {error ? <ActionError message={error} /> : null}
    </div>
  );
}

function ModalActions(props) {
  return (
    <DialogFooter className="gap-2 sm:space-x-0">
      <Button type="button" variant="outline" className="min-h-11" disabled={props.pending} onClick={props.onClose}>Cerrar</Button>
      {props.phase === 'select' ? <ActionButton label="Marcar como día no hábil" onClick={props.onChooseCreate} pending={props.pending} /> : null}
      {props.phase === 'create' ? <ActionButton label="Guardar" onClick={props.onSave} pending={props.pending} disabled={!props.reason.trim()} /> : null}
      {props.phase === 'revert' ? <ActionButton label="Marcar como día hábil" onClick={props.onRevert} pending={props.pending} /> : null}
    </DialogFooter>
  );
}

function ActionButton({ label, onClick, pending, disabled = false }) {
  return <Button type="button" className="min-h-11" disabled={pending || disabled} onClick={onClick}>{pending ? 'Guardando…' : label}</Button>;
}

function ActionError({ message }) {
  return <p id="custom-day-error" role="alert" className="text-sm text-destructive">{message}</p>;
}

function modalTitle(phase) {
  return phase === 'revert' ? 'Día no hábil personalizado' : 'Configurar día laboral';
}
