import { useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { DURATION_LIMITS, compareDuration, formatDuration } from './professionalRegistry.utils';

const FIELDS = [['years', 'Años'], ['months', 'Meses'], ['days', 'Días']];
const draftOf = (value) => Object.fromEntries(FIELDS.map(([key]) => [key, value ? String(value[key]) : '']));

// The same checks the server makes, so the person learns what is wrong before saving: whole numbers within
// DURATION_LIMITS (a blank field is 0, all blank clears) and never above the general experience.
function check(draft, general) {
  if (FIELDS.every(([key]) => draft[key].trim() === '')) return { value: null };
  const value = {};
  for (const [key, label] of FIELDS) {
    const text = draft[key].trim();
    if (!/^\d*$/.test(text) || Number(text) > DURATION_LIMITS[key]) return { problem: `${label}: un número entero entre 0 y ${DURATION_LIMITS[key]}.` };
    value[key] = Number(text);
  }
  if (!general?.duration) return { problem: 'No se puede validar: el profesional no tiene experiencia general.' };
  if (compareDuration(value, general.duration) > 0) return { problem: `No puede superar la experiencia general (${formatDuration(general.duration)}).` };
  return { value };
}

// The specific experience of one role: shown as text, typed in years, months and days. `onSave(role, value)` resolves
// true when the server accepted it (value null clears it).
export default function RoleSpecificExperience({ role, general, canWrite, busy, onSave }) {
  const [draft, setDraft] = useState(null);
  const [problem, setProblem] = useState('');
  const value = role.specificExperience;
  const close = () => { setDraft(null); setProblem(''); };
  const save = async (next) => { if (await onSave(role, next)) close(); };

  if (!draft) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>{formatDuration(value)}</span>
        {role.specificExceedsGeneral ? <Badge variant="destructive">Supera la experiencia general</Badge> : null}
        {canWrite && role.specificEditable ? (
          <Button type="button" size="sm" variant="outline" aria-label={`Editar la experiencia específica de ${role.label}`} onClick={() => setDraft(draftOf(value))}>Editar</Button>
        ) : null}
      </span>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    const result = check(draft, general);
    if (result.problem) { setProblem(result.problem); return; }
    setProblem('');
    save(result.value);
  };

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2" aria-label={`Experiencia específica de ${role.label}`} noValidate>
      {FIELDS.map(([key, label]) => (
        <label key={key} className="flex flex-col text-xs text-muted-foreground">
          {label}
          <Input
            type="number"
            min={0}
            max={DURATION_LIMITS[key]}
            inputMode="numeric"
            className="h-8 w-16"
            value={draft[key]}
            aria-invalid={Boolean(problem)}
            onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
          />
        </label>
      ))}
      <Button type="submit" size="sm" disabled={busy}>Guardar</Button>
      {value ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => save(null)}>Quitar</Button> : null}
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={close}>Cancelar</Button>
      {problem ? <p className="w-full text-xs text-destructive" role="alert">{problem}</p> : null}
    </form>
  );
}
