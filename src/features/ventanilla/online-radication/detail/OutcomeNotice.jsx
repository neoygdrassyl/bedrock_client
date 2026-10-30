import { CircleCheck, CircleX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { ExpedienteLink } from '../components/ExpedienteLink';
import { formatDateTime } from '../onlineRadicationModel';

function byLine(user) {
  return user?.name ? ` por ${user.name}` : '';
}

/** Result of the operator decision: radicated (expediente + VR) or rejected (reason). */
export function OutcomeNotice({ item }) {
  if (item.status === 'radicated') {
    const when = formatDateTime(item.radicatedAt);
    return (
      <Alert variant="success" role="status">
        <CircleCheck aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <AlertTitle>Solicitud radicada</AlertTitle>
          <AlertDescription>
            {when ? `Radicada el ${when}${byLine(item.radicatedBy)}. ` : null}
            Se creó el expediente{' '}
            {item.funIdPublic ? <ExpedienteLink funIdPublic={item.funIdPublic} /> : '—'}
            {item.vr ? <> con el radicado <span className="font-mono font-semibold">{item.vr}</span></> : null}.
          </AlertDescription>
        </div>
      </Alert>
    );
  }
  if (item.status === 'rejected') {
    const when = formatDateTime(item.rejectedAt);
    return (
      <Alert variant="destructive" role="status">
        <CircleX aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <AlertTitle>Solicitud rechazada</AlertTitle>
          <AlertDescription className="text-foreground">
            {when ? <p className="mb-1 text-[13px] text-muted-foreground">Rechazada el {when}{byLine(item.rejectedBy)}.</p> : null}
            <p className="mb-0 whitespace-pre-line break-words">
              <span className="font-semibold">Motivo: </span>
              {item.rejectionReason || 'No se registró el motivo.'}
            </p>
          </AlertDescription>
        </div>
      </Alert>
    );
  }
  return null;
}
