import { useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { formatCc, formatDate } from './professionalRegistry.utils';

// Same rule as the server: 4 to 40 letters or digits once separators are removed.
const registrationLength = (value) => String(value || '').replace(/[^A-Za-z0-9]/g, '').length;
const expedientes = (count) => `${count} ${count === 1 ? 'expediente' : 'expedientes'}`;

// "None of these is right": the person types the right principal matrícula. It goes through "Editar datos".
function OtherRegistration({ item, busy, onSave }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [problem, setProblem] = useState('');
  const id = `other-registration-${item.registryId}`;

  if (!open) {
    return <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>Ninguna es correcta</Button>;
  }

  const submit = (event) => {
    event.preventDefault();
    const length = registrationLength(value);
    if (length < 4 || length > 40) {
      setProblem('La matrícula debe tener entre 4 y 40 caracteres alfanuméricos.');
      return;
    }
    setProblem('');
    onSave(item, value.trim());
  };
  const cancel = () => { setOpen(false); setValue(''); setProblem(''); };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-start gap-2" noValidate>
      <div className="space-y-1">
        <label htmlFor={id} className="sr-only">Matrícula correcta de {item.name}</label>
        <Input
          id={id}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Matrícula correcta"
          aria-invalid={Boolean(problem)}
          autoFocus
        />
        {problem ? <p className="text-xs text-destructive" role="alert">{problem}</p> : null}
      </div>
      <Button type="submit" size="sm" disabled={busy}>Guardar matrícula</Button>
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={cancel}>Cancelar</Button>
    </form>
  );
}

const PRINCIPAL_HINT = 'Sus matrículas tienen la misma cantidad de expedientes. '
  + 'Indique la que está en uso; las demás se conservan.';
const DATE_HINT = (registration) => `Los expedientes de la matrícula ${registration} traen fechas de expedición `
  + 'distintas. Indique la correcta.';

// One choice of a case: its value, how many expedientes carry it and the button that picks it.
function Choice({ label, projects, action, canWrite, busy, onChoose }) {
  return (
    <li className="flex flex-wrap items-center gap-2">
      <span className="font-medium tabular-nums">{label}</span>
      <span className="text-xs text-muted-foreground">{expedientes(projects)}</span>
      {canWrite ? <Button type="button" size="sm" disabled={busy} onClick={onChoose}>{action}</Button> : null}
    </li>
  );
}

// "Matrícula múltiple". A professional may hold several matrículas; the principal is the most used one. A case is
// either a tie for the principal (`principal`) or one matrícula whose expedientes disagree on its issue date (`fecha`).
export default function RegistryMatriculaCase({ item, canWrite, busy, onResolve, onSaveRegistration, onOpen }) {
  const decide = (fields) => onResolve(Object.assign(
    { type: 'matricula', registryId: item.registryId, expectedVersion: item.version },
    fields,
  ));
  const isDate = item.kind === 'fecha';
  const listLabel = isDate ? `Fechas de ${item.registration}` : `Matrículas de ${item.name}`;

  return (
    <li className="rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex flex-wrap items-center gap-x-2">
        <span className="font-medium">{item.name}</span>
        <span className="text-muted-foreground">{item.cc ? formatCc(item.cc) : 'Sin cédula'}</span>
        <Badge variant="secondary">{isDate ? 'Fechas de expedición distintas' : 'Matrícula en uso empatada'}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{isDate ? DATE_HINT(item.registration) : PRINCIPAL_HINT}</p>
      <ul className="mt-2 space-y-1" aria-label={listLabel}>
        {isDate
          ? item.dates.map((option) => (
            <Choice
              key={option.date}
              label={formatDate(option.date)}
              projects={option.projects}
              action="Usar esta fecha"
              canWrite={canWrite}
              busy={busy}
              onChoose={() => decide({ action: 'date', value: item.valueNorm, date: option.date })}
            />
          ))
          : item.options.map((option) => (
            <Choice
              key={option.valueNorm}
              label={option.value}
              projects={option.projects}
              action="Marcar como en uso"
              canWrite={canWrite}
              busy={busy}
              onChoose={() => decide({ action: 'choose', value: option.valueNorm })}
            />
          ))}
      </ul>
      <div className="mt-2 flex flex-wrap items-start gap-2">
        {canWrite && !isDate ? <OtherRegistration item={item} busy={busy} onSave={onSaveRegistration} /> : null}
        <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(item.registryId)}>
          Ver profesional
        </Button>
      </div>
    </li>
  );
}
