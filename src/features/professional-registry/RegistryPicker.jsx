import { useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { cn } from '@/shared/lib/utils';
import { errorText, formatCc } from './professionalRegistry.utils';

// Searches the registry (by name, cédula or matrícula) and lets the user pick one person.
export default function RegistryPicker({ excludeId, selectedId, onSelect, label = 'Buscar profesional' }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const latestRequest = useRef(0);

  const search = async (event) => {
    event?.preventDefault();
    if (!term.trim()) return;
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    setLoading(true);
    setError('');
    try {
      const response = await ProfessionalRegistryService.list({ q: term.trim(), limit: 8 });
      if (request !== latestRequest.current) return;
      setResults((response?.data?.data || []).filter((item) => item.id !== excludeId));
    } catch (e) {
      if (request !== latestRequest.current) return;
      setResults(null);
      setError(errorText(e));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="registry-picker-term">{label}</Label>
      <div className="flex gap-2">
        <Input
          id="registry-picker-term"
          value={term}
          placeholder="Nombre, cédula o matrícula"
          onChange={(event) => setTerm(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') search(event); }}
        />
        <Button type="button" variant="outline" onClick={search} disabled={loading || !term.trim()} aria-label="Buscar">
          <Search className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      {results && !results.length ? <p className="text-xs text-muted-foreground">No se encontraron profesionales.</p> : null}
      {results?.length ? (
        <ul className="max-h-48 space-y-1 overflow-auto" aria-label="Resultados">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selectedId === item.id}
                className={cn('w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted', selectedId === item.id && 'border-primary bg-primary/5')}
                onClick={() => onSelect(item)}
              >
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{formatCc(item.cc)} · {item.projects} expedientes</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
