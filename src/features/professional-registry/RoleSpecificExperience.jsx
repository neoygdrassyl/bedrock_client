import { Badge } from '@/shared/ui/badge';
import { formatDuration } from './professionalRegistry.utils';

// The specific experience of one role, read only: it is typed in 5.2.9 of an expediente (Actualizar) and the server
// keeps the one of the most recent expediente in the role.
export default function RoleSpecificExperience({ role }) {
  return (
    <div className="space-y-1">
      <span>{formatDuration(role.specificExperience)}</span>
      {role.specificExceedsGeneral ? <Badge variant="destructive" className="block w-fit">Supera la experiencia general</Badge> : null}
    </div>
  );
}
