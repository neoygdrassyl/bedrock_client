import { Check } from 'lucide-react';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

/**
 * Searchable catalogue selector: type part of the code or the name to narrow the list.
 * Rendered inline (not in a popover) so it scrolls correctly inside sheets and dialogs.
 */
export function CatalogueDocumentPicker({ id, documents, value, onChange, applicableIds, label = 'Documento del catálogo' }) {
  const selected = documents.find((document) => document.documentId === value);
  return (
    <div className="space-y-1.5">
      <p id={id} className="m-0 text-sm font-medium" aria-hidden="true">{label}</p>
      <Command
        label={label}
        className="rounded-md border border-input bg-background"
        // Matches every typed word against the code and the name, ignoring accents and case.
        filter={(itemValue, search) => {
          const haystack = normalize(itemValue);
          return normalize(search).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word)) ? 1 : 0;
        }}
      >
        <CommandInput placeholder="Buscar por código o nombre…" />
        <CommandList className="max-h-56" label="Documentos del catálogo">
          <CommandEmpty>No hay documentos con ese código o nombre.</CommandEmpty>
          {documents.map((document) => {
            const isSelected = document.documentId === value;
            return (
              <CommandItem
                key={document.documentId}
                value={`${document.code || ''} ${document.name || ''} ${document.documentId}`}
                onSelect={() => onChange(document.documentId)}
                data-checked={isSelected ? 'true' : undefined}
                className="cursor-pointer items-start"
              >
                <Check className={cn('mt-0.5', isSelected ? 'opacity-100 text-[hsl(var(--primary))]' : 'opacity-0')} aria-hidden="true" />
                <span className="w-14 shrink-0 font-mono text-xs leading-5 text-muted-foreground">{document.code || '—'}</span>
                <span className="min-w-0 flex-1 leading-5">
                  {document.name}
                  {isSelected ? <span className="sr-only"> (seleccionado)</span> : null}
                </span>
                {applicableIds?.has(document.documentId) ? (
                  <span className="shrink-0 rounded bg-primary/10 px-1.5 text-[11px] font-medium leading-5 text-[hsl(var(--primary))]">Aplicable</span>
                ) : null}
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {selected ? `Seleccionado: ${selected.code ? `${selected.code} · ` : ''}${selected.name}` : 'Ningún documento seleccionado.'}
      </p>
    </div>
  );
}

function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default CatalogueDocumentPicker;
