import { Badge } from '@/shared/ui/badge';
import { formatDay, formatDuration } from './professionalRegistry.utils';

const certificatesText = (count) => `${count} ${count === 1 ? 'certificación' : 'certificaciones'}`;

// Where the shown value comes from. The current server sums the certified experiences of the "Experiencia" tab; an
// older one still sends the 5.2.9 of an expediente or a value typed in the module.
export function originText(role) {
  if (role.specificSource === 'certificados') return `Según ${certificatesText(Number(role.specificCertificates) || 0)}`;
  if (role.specificSource === 'manual') return `Registrada en BD Profesionales · ${formatDay(role.specificUpdatedAt)}`;
  if (role.specificSource === 'expediente') {
    return role.specificSourceExpediente ? `Expediente ${role.specificSourceExpediente}` : 'Ítem 5.2.9 de un expediente';
  }
  return '';
}

// The specific experience of one role with its origin, read only: it is computed by the server from the certified
// experiences and cannot be typed here.
export default function RoleSpecificExperience({ role }) {
  const origin = originText(role);
  return (
    <div className="space-y-0.5">
      <span className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap">
        <span>{formatDuration(role.specificExperience)}</span>
        {role.specificExceedsGeneral ? <Badge variant="destructive">Supera la experiencia general</Badge> : null}
      </span>
      {origin ? <span className="block text-xs text-muted-foreground">{origin}</span> : null}
    </div>
  );
}
