import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const DENSITY_CLASSES = {
  compact: 'h-[var(--input-height-compact)] px-2.5 text-sm',
  comfortable: 'h-[var(--input-height)] px-3 text-sm',
};

export function DovelaInput({
  density = 'comfortable',
  invalid = false,
  className,
  'aria-invalid': ariaInvalid,
  ...props
}) {
  return (
    <Input
      data-dovela-ui="input"
      data-density={density}
      aria-invalid={invalid ? 'true' : ariaInvalid}
      className={cn(
        'rounded-[var(--input-radius)] border-input bg-background text-foreground shadow-[var(--input-shadow)] transition-[border-color,box-shadow]',
        'focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0',
        invalid && 'border-destructive focus-visible:ring-destructive/20',
        DENSITY_CLASSES[density] || DENSITY_CLASSES.comfortable,
        className
      )}
      {...props}
    />
  );
}
