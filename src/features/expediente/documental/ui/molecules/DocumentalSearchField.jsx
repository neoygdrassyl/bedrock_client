import { Search, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

/** Search box shared by the documentary workspaces (legacy and catalogue-based). */
export function DocumentalSearchField({
  id,
  value = '',
  onChange,
  placeholder = 'Buscar por nombre o código…',
  label = 'Buscar documento o código',
  className,
}) {
  return (
    <div className={cn('relative min-w-0 basis-full sm:max-w-sm sm:flex-1 sm:basis-auto', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        name="documentalSearch"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-9 bg-background px-[2.25rem] text-sm"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-0.5 h-8 w-8"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange?.('')}
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

export default DocumentalSearchField;
