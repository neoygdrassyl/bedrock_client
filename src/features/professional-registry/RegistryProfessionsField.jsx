import { useState } from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { MAX_PROFESSIONS, PROFESSION_ERROR, normalizeProfession, professionKey } from './professionalRegistry.utils';

// "Profesión" group of the registry form: one checkbox per catalog option plus an "Otra" input that adds a typed
// profession. Every selected profession is listed as a removable chip. `value` holds display names.
export default function RegistryProfessionsField({ options, value, onChange, error }) {
  const [other, setOther] = useState('');
  const [otherError, setOtherError] = useState('');
  const keys = value.map(professionKey);
  const has = (name) => keys.includes(professionKey(name));
  const remove = (name) => onChange(value.filter((item) => professionKey(item) !== professionKey(name)));
  const toggle = (option) => (has(option) ? remove(option) : onChange([...value, option]));

  const add = () => {
    const name = normalizeProfession(other, options);
    if (!name) { setOtherError(PROFESSION_ERROR); return; }
    if (!has(name) && value.length >= MAX_PROFESSIONS) { setOtherError(`Máximo ${MAX_PROFESSIONS} profesiones.`); return; }
    if (!has(name)) onChange([...value, name]);
    setOther('');
    setOtherError('');
  };

  const onOtherKey = (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    add();
  };

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Profesión</legend>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={has(option)} onChange={() => toggle(option)} />
            {option}
          </label>
        ))}
      </div>
      <div className="space-y-1">
        <Label htmlFor="registry-profession-other">Otra profesión</Label>
        <div className="flex gap-2">
          <Input
            id="registry-profession-other"
            value={other}
            onChange={(event) => setOther(event.target.value)}
            onKeyDown={onOtherKey}
            aria-invalid={Boolean(otherError)}
            placeholder="Ej. Topógrafo"
          />
          <Button type="button" variant="outline" onClick={add} disabled={!other.trim()}>Agregar</Button>
        </div>
        {otherError ? <p className="text-xs text-destructive" role="alert">{otherError}</p> : null}
      </div>
      {value.length ? (
        <ul className="flex flex-wrap gap-1" aria-label="Profesiones seleccionadas">
          {value.map((name) => (
            <li key={professionKey(name)}>
              <Badge variant="secondary" className="gap-1">
                {name}
                <button type="button" className="rounded-sm hover:text-destructive" onClick={() => remove(name)} aria-label={`Quitar ${name}`}>
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
    </fieldset>
  );
}
