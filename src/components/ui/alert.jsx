import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Left-accented callout, the same visual language as the FUN "Actualizar" section legends.
// Borders use `border-[1px] border-solid` instead of `border`: Bootstrap's `.border` utility is
// `!important` and would force the neutral border color on every tone.
const alertVariants = cva(
  'relative flex w-full items-start gap-[0.75rem] rounded-lg border-[1px] border-l-[3px] border-solid px-[1rem] py-[0.75rem] text-sm leading-5 [&>svg]:mt-0.5 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border-[hsl(var(--primary)/0.2)] border-l-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.06)] text-foreground [&>svg]:text-[hsl(var(--primary))]',
        neutral:
          'border-[hsl(var(--border))] border-l-[hsl(var(--muted-foreground)/0.45)] bg-[hsl(var(--muted)/0.45)] text-foreground [&>svg]:text-muted-foreground',
        warning:
          'border-[hsl(var(--operational-warning-border)/0.4)] border-l-[hsl(var(--operational-warning-border))] bg-[hsl(var(--operational-warning-bg))] text-[hsl(var(--operational-warning-text))]',
        success:
          'border-[hsl(var(--operational-success-border)/0.4)] border-l-[hsl(var(--operational-success-border))] bg-[hsl(var(--operational-success-bg))] text-[hsl(var(--operational-success-text))]',
        destructive:
          'border-[hsl(var(--destructive)/0.35)] border-l-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.06)] text-[hsl(var(--destructive))]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

/** Inline callout. Pass the semantic `role` the message needs (alert, status, note, region…). */
function Alert({ className, variant, role = 'alert', ...props }) {
  return <div role={role} className={cn(alertVariants({ variant }), className)} {...props} />;
}

function AlertTitle({ className, ...props }) {
  return <p className={cn('mb-0 font-semibold leading-5', className)} {...props} />;
}

function AlertDescription({ className, ...props }) {
  return <div className={cn('text-sm leading-5 [&_p]:mb-0', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
