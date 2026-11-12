import { useEffect, useId, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import { formatClockDate } from './ClockRow';

export const NOTIFICATION_ROUTES = [
  { value: 'notificar', label: 'Notificación personal' },
  { value: 'comunicar', label: 'Comunicación' },
];

export const describeNotificationRoute = ({ notificationType, byAviso }) => (
  notificationType === 'comunicar'
    ? 'Comunicación'
    : byAviso ? 'Notificación personal, con aviso' : 'Notificación personal'
);

const listNames = (rows) => rows.map((row) => `«${row.name}»`).join(', ');

/**
 * How an act is made known to the applicant: the stored `phase_options` of one phase
 * (`notificationType`: notificar | comunicar, `byAviso`). The change is saved at once, so
 * the control shows it: while saving it does not accept another change (it stays
 * focusable), then it says what changed or that the save failed and was undone.
 *
 * `confirm` is set by the parent only when the change would stop showing events that
 * already have a registered date; the change waits for the answer.
 */
export function NotificationRouteControl({
  actLabel,
  options,
  busy = false,
  feedback,
  confirm,
  onChange,
  onConfirm,
  onCancel,
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const groupRef = useRef(null);
  const cancelRef = useRef(null);
  const hadConfirm = useRef(false);
  const triggerRef = useRef(null);
  const switchId = `${id}-aviso`;

  const notificationType = options?.notificationType === 'comunicar' ? 'comunicar' : 'notificar';
  const byAviso = notificationType === 'notificar' && options?.byAviso === true;
  const avisoApplies = notificationType === 'notificar';

  // The confirmation takes focus when it opens and gives it back to the route when it closes.
  useEffect(() => {
    if (confirm) {
      hadConfirm.current = true;
      cancelRef.current?.focus();
    } else if (hadConfirm.current) {
      hadConfirm.current = false;
      // Back to the control that asked (the switch or a route); a route that is no longer
      // the chosen one is not tabbable, so the chosen one takes it.
      const trigger = triggerRef.current;
      const target = trigger?.isConnected && trigger.tabIndex !== -1 && !trigger.disabled
        ? trigger
        : groupRef.current?.querySelector('[aria-checked="true"]');
      target?.focus();
    }
  }, [confirm]);

  const select = (value, element) => {
    if (busy || confirm || value === notificationType) return;
    triggerRef.current = element;
    onChange({ notificationType: value });
  };

  const handleRouteKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    // Arrow keys move focus only: the option is chosen with Space or Enter, because choosing saves.
    const buttons = [...(groupRef.current?.querySelectorAll('[role="radio"]') || [])];
    const index = buttons.indexOf(document.activeElement);
    const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    buttons[(index + step + buttons.length) % buttons.length]?.focus();
  };

  const locked = busy || Boolean(confirm);

  return (
    <div className="tc-route" role="group" aria-labelledby={labelId} aria-busy={busy}>
      <div className="tc-route-controls">
        <span id={labelId} className="tc-route-label">
          Vía de notificación<span className="tc-route-act"> · {actLabel}</span>
        </span>

        <div ref={groupRef} role="radiogroup" aria-labelledby={labelId} className="tc-segmented" onKeyDown={handleRouteKeyDown}>
          {NOTIFICATION_ROUTES.map((route) => {
            const checked = route.value === notificationType;
            return (
              <button
                key={route.value}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-disabled={locked || undefined}
                tabIndex={checked ? 0 : -1}
                className="tc-segmented-option"
                onClick={(event) => select(route.value, event.currentTarget)}
              >
                {checked ? <Icon name="Check" size={12} aria-hidden="true" /> : null}
                {route.label}
              </button>
            );
          })}
        </div>

        <label className={cn('tc-route-switch', !avisoApplies && 'is-off')} htmlFor={`${id}-aviso`}>
          <Switch
            id={`${id}-aviso`}
            className="tc-switch"
            checked={byAviso}
            disabled={!avisoApplies}
            aria-disabled={locked || undefined}
            aria-describedby={helpId}
            onCheckedChange={(checked) => {
              if (locked || !avisoApplies) return;
              triggerRef.current = document.getElementById(switchId);
              onChange({ byAviso: checked });
            }}
          />
          <span>Por aviso</span>
        </label>

        <span className={cn('tc-route-feedback', feedback?.tone === 'error' && 'is-error')} role="status" aria-live="polite">
          {busy ? (
            <>
              <Icon name="Loader2" size={14} className="animate-spin" aria-hidden="true" />
              Guardando…
            </>
          ) : feedback?.text ? (
            <>
              <Icon name={feedback.tone === 'error' ? 'AlertCircle' : 'Check'} size={14} aria-hidden="true" />
              {feedback.text}
            </>
          ) : null}
        </span>
      </div>

      <p id={helpId} className="tc-route-help">
        {avisoApplies
          ? 'Por aviso agrega la notificación por aviso cuando no se logra la notificación personal. El cambio se guarda al instante.'
          : 'Por aviso solo aplica con notificación personal. El cambio se guarda al instante.'}
      </p>

      {confirm ? (
        <div className="tc-route-confirm" role="alertdialog" aria-labelledby={`${id}-confirm-title`} aria-describedby={`${id}-confirm-text`}>
          <p id={`${id}-confirm-title`} className="tc-route-confirm-title">
            ¿Cambiar a {describeNotificationRoute(confirm.next)}?
          </p>
          <div id={`${id}-confirm-text`} className="tc-route-confirm-text">
            {confirm.hiddenDated.length ? (
              <>
                <p>
                  {confirm.hiddenDated.length === 1 ? 'Deja de mostrarse un evento' : `Dejan de mostrarse ${confirm.hiddenDated.length} eventos`} con fecha registrada:
                </p>
                <ul>
                  {confirm.hiddenDated.map((row) => (
                    <li key={row.name}>{row.name} <span className="font-mono tabular-nums">{formatClockDate(row.date)}</span></li>
                  ))}
                </ul>
              </>
            ) : null}
            {confirm.relabeledDated.map((row) => (
              <p key={row.name}>
                La fecha <span className="font-mono tabular-nums">{formatClockDate(row.date)}</span> de «{row.name}» pasa a leerse como «{row.nextName}»: ambos eventos comparten el mismo registro.
              </p>
            ))}
            {(confirm.appearingDated || []).map((row) => (
              <p key={row.name}>
                «{row.name}» aparece con la fecha <span className="font-mono tabular-nums">{formatClockDate(row.date)}</span>, que ya estaba registrada, y cuenta para los términos.
              </p>
            ))}
            <p>Las fechas no se borran; vuelven a verse al regresar a la vía anterior.</p>
          </div>
          <div className="tc-route-confirm-actions">
            <Button ref={cancelRef} type="button" variant="outline" size="sm" className="h-8" onClick={onCancel}>Cancelar</Button>
            <Button type="button" size="sm" className="h-8" onClick={onConfirm}>Cambiar la vía</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Feedback line after a saved change: what the table gained and lost. */
export const describeRouteSaved = (next, change) => {
  const parts = [`Guardado: ${describeNotificationRoute(next)}.`];
  if (change.added.length) parts.push(`Se ${change.added.length === 1 ? 'agregó' : 'agregaron'} ${listNames(change.added)}.`);
  if (change.removed.length) parts.push(`Ya no se ${change.removed.length === 1 ? 'muestra' : 'muestran'} ${listNames(change.removed)}.`);
  // A stored date that comes back into view drives the terms again: say which one.
  (change.relabeledDated || []).forEach((row) => {
    parts.push(`«${row.nextName}» muestra la fecha ${formatClockDate(row.date)} registrada como «${row.name}».`);
  });
  (change.appearingDated || []).forEach((row) => {
    parts.push(`«${row.name}» conserva la fecha ${formatClockDate(row.date)} ya registrada.`);
  });
  return parts.join(' ');
};

export default NotificationRouteControl;
