import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { PairPerson } from './RegistryPairCase';
import { formatCc } from './professionalRegistry.utils';

// Which of the two records holds the right value. Only asked for what differs between them.
function RightValue({ legend, name, options, value, onChange }) {
  return (
    <fieldset className="space-y-1">
      <legend className="text-xs font-semibold text-foreground">{legend}</legend>
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2">
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
          />
          <span className="tabular-nums">{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

// Two records of one person told apart by a typing error in the name, the cédula or both. The reviewer picks the right
// name and the right cédula; one record remains, with those data and every expediente of both.
export default function RegistryMergeCase({ item, canWrite, busy, onResolve, onOpen }) {
  const people = [item.a, item.b];
  const [nameFrom, setNameFrom] = useState(item.differs.name ? null : item.a.id);
  const [ccFrom, setCcFrom] = useState(item.differs.cc ? null : item.a.id);
  const ready = nameFrom !== null && ccFrom !== null;

  const merge = (event) => {
    event.preventDefault();
    onResolve({ type: 'fusionar', id: item.id, action: 'merge', nameFrom, ccFrom });
  };

  return (
    <li className="rounded-lg border border-border bg-card p-3 text-sm">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Posible error de digitación</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {people.map((person) => <PairPerson key={person.id} person={person} onOpen={onOpen} />)}
      </div>
      {canWrite ? (
        <form onSubmit={merge} className="mt-2 space-y-2" aria-label={`Fusionar ${item.a.name} y ${item.b.name}`}>
          <div className="flex flex-wrap gap-6">
            {item.differs.name ? (
              <RightValue
                legend="Nombre correcto"
                name={`merge-name-${item.id}`}
                options={people.map((person) => ({ id: person.id, label: person.name }))}
                value={nameFrom}
                onChange={setNameFrom}
              />
            ) : null}
            {item.differs.cc ? (
              <RightValue
                legend="Cédula correcta"
                name={`merge-cc-${item.id}`}
                options={people.map((person) => ({ id: person.id, label: formatCc(person.cc) }))}
                value={ccFrom}
                onChange={setCcFrom}
              />
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={!ready || busy}>Fusionar</Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onResolve({ type: 'fusionar', id: item.id, action: 'dismiss' })}
            >
              No son la misma persona
            </Button>
          </div>
        </form>
      ) : null}
    </li>
  );
}
