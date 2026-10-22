import { Tag } from '../atoms/Tag';
import { Check } from 'lucide-react';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/shared/ui/command';
import { cn } from '@/shared/lib/utils';

/**
 * Searchable catalogue selector: type part of the code or the name to narrow the list.
 * Rendered inline (not in a popover) so it scrolls correctly inside sheets and dialogs.
 */
export function CatalogueDocumentPicker({ id, documents, value, onChange, applicableIds, label = 'Documento del catálogo' }) {
  const selected = documents.find((document) => document.documentId === value);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p id={id} className="mb-0 text-[13px] font-medium leading-5 text-foreground" aria-hidden="true">{label}</p>
      <Command
        label={label}
        className="rounded-md border border-input bg-background shadow-none"
        // Matches every typed word against the code and the name, ignoring accents and case.
        filter={(itemValue, search) => {
          const haystack = normalize(itemValue);
          return normalize(search).split(/\s+/).filter(Boolean).every((word) => haystack.includes(word)) ? 1 : 0;
        }}
      >
        <CommandInput name="catalogueSearch" placeholder="Buscar por código o nombre…" />
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
                  <Tag tone="info" pill className="shrink-0">Aplicable</Tag>
                ) : null}
              </CommandItem>
            );
          })}
        </CommandList>
      </Command>
      <p className="mb-0 text-xs leading-4 text-muted-foreground" aria-live="polite">
        {selected ? `Seleccionado: ${selected.code ? `${selected.code} · ` : ''}${selected.name}` : 'Ningún documento seleccionado.'}
      </p>
    </div>
  );
}

function normalize(text) {
  return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default CatalogueDocumentPicker;
