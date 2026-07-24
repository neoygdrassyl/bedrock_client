import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DENSITY_CLASSES = {
  compact: 'h-[var(--input-height-compact)] px-2.5 text-sm',
  comfortable: 'h-[var(--input-height)] px-3 text-sm',
};

export function DovelaSelect({
  options = [],
  placeholder = 'Selecciona una opcion',
  density = 'comfortable',
  invalid = false,
  id,
  triggerClassName,
  contentClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  return (
    <Select {...props}>
      <SelectTrigger
        id={id}
        data-dovela-ui="select"
        data-density={density}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid ? 'true' : ariaInvalid}
        className={cn(
          'rounded-[var(--input-radius)] border-input bg-background text-foreground shadow-[var(--input-shadow)]',
          'focus:ring-2 focus:ring-ring/20 focus:ring-offset-0',
          invalid && 'border-destructive focus:ring-destructive/20',
          DENSITY_CLASSES[density] || DENSITY_CLASSES.comfortable,
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('rounded-[var(--input-radius)] border-border', contentClassName)}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
