import { Badge } from '@/shared/ui/badge';
import RoleSpecificExperience from './RoleSpecificExperience';
import { formatDate, formatGeneralExperience, formatMonths, isImplausibleMonths } from './professionalRegistry.utils';

const NUMERIC = 'text-right tabular-nums';
const maxDeclared = (role) => (
  <span className={isImplausibleMonths(role.monthsMax) ? 'font-semibold text-destructive' : undefined}>{formatMonths(role.monthsMax)}</span>
);
const roleName = (role) => (
  <>
    {role.label}
    {role.outlier ? <Badge variant="destructive" className="ml-2">Revisar</Badge> : null}
  </>
);

// A server that sends the origin of the specific experience also accepts it typed here; an older one keeps it read only.
const UNCLASSIFIED_ROLE = 'SIN_CLASIFICAR';
const acceptsTypedSpecific = (detail) => detail.roles.some((role) => role.specificSource !== undefined);
const canEditSpecific = (role, { detail, canWrite }) => Boolean(canWrite) && !detail.deleted
  && role.specificSource !== undefined && role.code !== UNCLASSIFIED_ROLE;

// Columns as the current server sends them. Experience is only the general one (from the principal matrícula) and the
// specific one per role; what the expedientes declared stays out of this table.
const columns = ({ detail, canWrite, busy, onSaveSpecific }) => [
  { key: 'rol', header: 'Rol', width: '36%', cell: (role) => role.label },
  { key: 'expedientes', header: 'Expedientes', width: '12%', className: NUMERIC, cell: (role) => role.projects },
  { key: 'general', header: 'Experiencia general', width: '22%', cell: () => formatGeneralExperience(detail.generalExperience) },
  {
    key: 'especifica',
    header: 'Experiencia específica',
    width: '30%',
    cell: (role) => (
      <RoleSpecificExperience
        role={role}
        general={detail.generalExperience?.duration || null}
        editable={canEditSpecific(role, { detail, canWrite })}
        busy={busy}
        onSave={onSaveSpecific}
      />
    ),
  },
];

// An older server sends no general experience: the columns it had, with the experience declared in the expedientes.
const LEGACY_COLUMNS = [
  { key: 'rol', header: 'Rol', width: '34%', cell: roleName },
  { key: 'expedientes', header: 'Expedientes', width: '12%', className: NUMERIC, cell: (role) => role.projects },
  { key: 'ultimo', header: 'Experiencia (último)', width: '18%', cell: (role) => formatMonths(role.monthsLatest) },
  { key: 'maxima', header: 'Máxima', width: '18%', cell: maxDeclared },
  { key: 'ajustada', header: 'Ajustada', width: '18%', cell: (role) => (role.monthsOverride !== null && role.monthsOverride !== undefined ? formatMonths(role.monthsOverride) : '—') },
];

// "Roles y experiencia" of one professional. A fixed layout with explicit widths keeps every column apart, whatever
// the length of a role name or a duration.
export default function RegistryRolesTable({ detail, canWrite, busy, onSaveSpecific }) {
  const withGeneral = detail.generalExperience !== undefined;
  const shown = withGeneral ? columns({ detail, canWrite, busy, onSaveSpecific }) : LEGACY_COLUMNS;
  const specificNote = acceptsTypedSpecific(detail)
    ? 'La específica de cada rol es la registrada más recientemente, ya sea en el ítem 5.2.9 de un expediente o aquí.'
    : 'La específica es la del ítem 5.2.9 del expediente más reciente en cada rol; se registra en Actualizar.';

  return (
    <div className="space-y-2">
      {withGeneral ? (
        <p className="text-xs text-muted-foreground">
          La experiencia general se cuenta desde la fecha de expedición de la matrícula en uso{detail.registration && detail.registrationDate ? ` (${detail.registration}, ${formatDate(detail.registrationDate)})` : ''}. {specificNote}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full min-w-[560px] table-fixed border-collapse text-sm" aria-label="Roles y experiencia">
          <colgroup>
            {shown.map((column) => <col key={column.key} style={{ width: column.width }} />)}
          </colgroup>
          <thead className="bg-muted/40">
            <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              {shown.map((column) => <th key={column.key} scope="col" className={`px-3 py-2 align-bottom font-semibold ${column.className || ''}`}>{column.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {detail.roles.map((role) => (
              <tr key={role.code} className="border-t border-border/60">
                {shown.map((column) => <td key={column.key} className={`px-3 py-2.5 align-middle ${column.className || ''}`}>{column.cell(role)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
