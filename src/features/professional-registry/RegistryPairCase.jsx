import { Button } from '@/shared/ui/button';
import { DUPLICATE_REASONS, formatCc } from './professionalRegistry.utils';

// One of the two people of a case, with a link to open it.
export function PairPerson({ person, onOpen }) {
  return (
    <div className="rounded-md border border-border/60 p-2">
      <button type="button" className="font-medium text-foreground underline" onClick={() => onOpen?.(person.id)}>
        {person.name}
      </button>
      <p className="text-xs text-muted-foreground">{formatCc(person.cc)} · {person.projects} expedientes</p>
    </div>
  );
}

// Two people that may be the same one. The reviewer keeps one of them or says they are different people.
export default function RegistryPairCase({ type, item, canWrite, busy, onResolve, onOpen }) {
  const keep = (person) => onResolve({ type, id: item.id, action: 'merge', keepId: person.id });

  return (
    <li className="rounded-lg border border-border bg-card p-3 text-sm">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
        {DUPLICATE_REASONS[item.reason] || item.reason}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[item.a, item.b].map((person) => <PairPerson key={person.id} person={person} onOpen={onOpen} />)}
      </div>
      {canWrite ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {[item.a, item.b].map((person) => (
            <Button key={person.id} type="button" size="sm" disabled={busy} onClick={() => keep(person)}>
              Conservar «{person.name}»
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => onResolve({ type, id: item.id, action: 'dismiss' })}
          >
            No son la misma persona
          </Button>
        </div>
      ) : null}
    </li>
  );
}
