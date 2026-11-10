import { useId, useState } from 'react';
import { ArrowUpRight, ChevronDown, TriangleAlert, UsersRound } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { Tag } from '../atoms/Tag';

/** One party line: name, identification, kind and values, state, issues and the action to complete it in the FUN. */
function PartyItem({ party, onOpenForm }) {
  const canOpen = Boolean(party.form && onOpenForm);
  return (
    <li className="flex flex-wrap items-center gap-x-[0.75rem] gap-y-1 px-[1rem] py-2" data-testid={`ldf-party-${party.key}`}>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium leading-5 text-foreground" title={party.label}>
          {party.label}{party.idNumber ? <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">{party.idNumber}</span> : null}
        </span>
        <span className="truncate text-xs leading-4 text-muted-foreground" title={party.description}>{party.description}</span>
      </div>
      {party.issues.length ? (
        <ul className="m-0 flex list-none flex-wrap gap-1 p-0" aria-label={`Datos pendientes de ${party.label}`}>
          {party.issues.map((issue, index) => <li key={`${issue.code}:${index}`}><Tag tone="warning">{issue.label}</Tag></li>)}
        </ul>
      ) : null}
      <Tag tone={party.complete ? 'success' : 'warning'}>{party.complete ? 'Completo' : 'Pendiente'}</Tag>
      {!party.complete && party.form ? (
        canOpen ? (
          <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onOpenForm(party.form)} aria-label={`Completar ${party.label} en el formulario ${party.form.label} del FUN`}>
            Completar en {party.form.label}<ArrowUpRight aria-hidden="true" />
          </Button>
        ) : <span className="text-xs text-muted-foreground">Complételo en Actualizar · {party.form.label}</span>
      ) : null}
    </li>
  );
}

function PartyList({ title, parties, onOpenForm }) {
  if (!parties.length) return null;
  return (
    <div className="flex flex-col">
      <h4 className="mb-0 bg-muted/40 px-[1rem] py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title} <span className="font-mono font-normal tabular-nums">({parties.length})</span></h4>
      <ul className="m-0 flex list-none flex-col divide-y p-0">{parties.map((party) => <PartyItem key={party.key} party={party} onOpenForm={onOpenForm} />)}</ul>
    </div>
  );
}

/**
 * "Partes de la solicitud": applicants and professionals of the FUN with what the evaluation still lacks from them. It
 * opens by itself while a party is pending; once every party is complete it collapses to one summary line.
 * `onOpenForm(form)` navigates to the FUN form (5.1 / 5.2 / 5.3) of a party; without it a hint names the form.
 */
export function LdfParties({ parties, onOpenForm }) {
  const titleId = useId();
  const bodyId = useId();
  const [open, setOpen] = useState(null); // null: follows the state (open while pending)
  if (!parties) return null;
  const expanded = open ?? parties.gated;
  const summary = !parties.available ? 'No fue posible leer las partes del FUN'
    : !parties.total ? 'El FUN no tiene solicitantes ni profesionales'
      : parties.pendingCount ? `${parties.pendingCount} de ${parties.total} con datos pendientes` : `${parties.total} ${parties.total === 1 ? 'parte completa' : 'partes completas'}`;
  return (
    <section aria-labelledby={titleId} className="flex flex-col border-b" data-testid="ldf-parties">
      <div className="flex flex-wrap items-center gap-2 px-[1rem] py-2">
        <button type="button" id={titleId} aria-expanded={expanded} aria-controls={bodyId} onClick={() => setOpen(!expanded)}
          className="flex min-w-0 items-center gap-1.5 bg-transparent p-0 text-left text-sm font-semibold leading-5 text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDown aria-hidden="true" className={cn('h-3.5 w-3.5 shrink-0 transition-transform motion-reduce:transition-none', !expanded && '-rotate-90')} />
          <UsersRound aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
          Partes de la solicitud
        </button>
        <span className="text-xs text-muted-foreground" data-testid="ldf-parties-summary">{summary}</span>
        <Tag tone={parties.gated ? 'warning' : 'success'} className="ml-auto">{parties.gated ? 'Pendiente' : 'Completo'}</Tag>
      </div>
      {/* No display utility here: it would override the `hidden` attribute. */}
      <div id={bodyId} hidden={!expanded} className="border-t">
        {parties.gated ? (
          <Alert variant="warning" className="m-[0.75rem] py-2" data-testid="ldf-parties-gate">
            <TriangleAlert aria-hidden="true" />
            <AlertDescription className="min-w-0 flex-1">Complete los datos pendientes en el FUN: de ellos depende qué documentos se exigen a cada persona.</AlertDescription>
          </Alert>
        ) : null}
        <PartyList title="Solicitantes" parties={parties.applicants} onOpenForm={onOpenForm} />
        <PartyList title="Profesionales" parties={parties.professionals} onOpenForm={onOpenForm} />
        <PartyList title="Responsables sin asignar" parties={parties.unassigned} onOpenForm={onOpenForm} />
      </div>
    </section>
  );
}

export default LdfParties;
