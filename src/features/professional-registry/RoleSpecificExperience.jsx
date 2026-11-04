import { useState } from 'react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { formatYearsMonths, readSpecificExperience } from '@/shared/utils/specificExperience';
import { formatDay, formatDuration } from './professionalRegistry.utils';

const FIELDS = [['years', 'Años'], ['months', 'Meses']];
const draftOf = (value) => ({ years: value ? String(value.years) : '', months: value ? String(value.months) : '' });

// Where the shown value comes from: the server keeps the most recent of 5.2.9 in an expediente and the value typed here.
function originText(role) {
  if (role.specificSource === 'manual') return `Registrada en BD Profesionales · ${formatDay(role.specificUpdatedAt)}`;
  if (role.specificSource === 'expediente') {
    return role.specificSourceExpediente ? `Expediente ${role.specificSourceExpediente}` : 'Ítem 5.2.9 de un expediente';
  }
  return '';
}

// The checks the server makes: whole years (0 to 99) and months (0 to 11), never above the general experience when
// it is known. A specific experience has no days, so only the general one's whole months count.
function check(draft, general) {
  const result = readSpecificExperience(draft.years, draft.months, null);
  if (result.empty) return { problem: 'Indique los años o los meses.' };
  if (result.problem) return result;
  const limit = general ? general.years * 12 + general.months : null;
  if (limit !== null && result.months > limit) {
    return { problem: `La experiencia específica (${formatYearsMonths(result.months)}) no puede superar la experiencia general (${formatDuration(general)}).` };
  }
  return { value: { years: Math.trunc(result.months / 12), months: result.months % 12 } };
}

// The specific experience of one role with its origin. `editable` shows Añadir/Editar; `onSave(role, body)` resolves
// true when the server accepted it, with body { years, months } or { clear: true }.
export default function RoleSpecificExperience({ role, general, editable, busy, onSave }) {
  const [draft, setDraft] = useState(null);
  const [problem, setProblem] = useState('');
  const value = role.specificExperience;
  const origin = originText(role);
  const close = () => { setDraft(null); setProblem(''); };
  const save = async (body) => { if (await onSave(role, body)) close(); };

  if (!draft) {
    return (
      <div className="space-y-0.5">
        <span className="inline-flex flex-nowrap items-center gap-2 whitespace-nowrap">
          <span>{formatDuration(value)}</span>
          {role.specificExceedsGeneral ? <Badge variant="destructive">Supera la experiencia general</Badge> : null}
          {editable ? (
            <Button type="button" size="sm" variant="outline" aria-label={`${value ? 'Editar' : 'Añadir'} la experiencia específica de ${role.label}`} onClick={() => setDraft(draftOf(value))}>
              {value ? 'Editar' : 'Añadir'}
            </Button>
          ) : null}
        </span>
        {origin ? <span className="block text-xs text-muted-foreground">{origin}</span> : null}
      </div>
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
          {/* Text with a numeric keyboard: no spinner arrows and no wheel changes; `check` accepts digits only. */}
          <Input
            type="text"
            inputMode="numeric"
            maxLength={2}
            className="h-8 w-16"
            value={draft[key]}
            aria-invalid={Boolean(problem)}
            onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
          />
        </label>
      ))}
      <Button type="submit" size="sm" disabled={busy}>Guardar</Button>
      {role.specificSource === 'manual' ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => save({ clear: true })}>Quitar ajuste</Button> : null}
      <Button type="button" size="sm" variant="outline" disabled={busy} onClick={close}>Cancelar</Button>
      {problem ? <p className="w-full text-xs text-destructive" role="alert">{problem}</p> : null}
    </form>
  );
}
