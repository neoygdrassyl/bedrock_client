import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Native control look aligned with the shadcn Input (selects, file inputs, textareas). */
export const fieldClass = 'block min-h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';
export const fileFieldClass = cn(fieldClass, 'py-1.5 file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-foreground');
export const hintClass = 'mb-0 text-xs leading-4 text-slate-600';

/**
 * Form field as in the FUN "Actualizar" forms: label above the control, optional helper text
 * and inline error below it. `id` must match the control id; the helper and error ids are
 * `${id}-hint` / `${id}-error` so the control can reference them with aria-describedby.
 */
export function FormField({ id, label, hint, error, className, children }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label htmlFor={id} className="text-[13px] leading-5 text-foreground">{label}</Label>
      {children}
      {hint ? <p id={`${id}-hint`} className={hintClass}>{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="mb-0 text-xs leading-4 text-destructive">{error}</p> : null}
    </div>
  );
}

/** Checkbox with its label on the right. */
export function CheckboxField({ id, label, className, ...inputProps }) {
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input id={id} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[hsl(var(--primary))] disabled:cursor-not-allowed" {...inputProps} />
      <label htmlFor={id} className="cursor-pointer text-sm leading-5 text-foreground">{label}</label>
    </div>
  );
}

/** Titled group of fields inside a form (Actualizar groups fields under a section heading). */
export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-[0.75rem]', className)}>
      <div>
        <h3 className="mb-0 text-sm font-semibold leading-5 text-foreground">{title}</h3>
        {description ? <p className="mb-0 mt-0.5 text-xs leading-4 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

/**
 * Bordered fieldset group (e.g. "Soporte físico"). The global fieldset rule (App.css) draws the
 * border; Bootstrap floats the legend so it reads as the card title inside the box.
 */
export function FormFieldset({ legend, description, children, className }) {
  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-col gap-[0.75rem] rounded-lg bg-muted/20 p-[1rem]', className)}>
      <legend className="mb-0 p-0 text-sm font-semibold leading-5 text-foreground">{legend}</legend>
      {description ? <p className={hintClass}>{description}</p> : null}
      {children}
    </fieldset>
  );
}
