import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  neutral: 'bg-muted text-muted-foreground',
  success: 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))]',
  warning: 'bg-[hsl(var(--warning)/0.15)] text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]',
  danger: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
};

/** Centered empty / error / unavailable state of the inbox. */
export function InboxState({ icon: Icon, tone = 'neutral', title, description, action, role = 'status', className }) {
  return (
    <div role={role} className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      {Icon ? (
        <span className={cn('mb-[1rem] grid h-12 w-12 place-items-center rounded-full', TONE_CLASSES[tone] || TONE_CLASSES.neutral)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className="mb-0 text-sm font-semibold leading-5 text-foreground">{title}</p>
      {description ? <p className="mb-0 mt-1 max-w-md text-sm leading-5 text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-[1rem] flex flex-wrap items-center justify-center gap-2">{action}</div> : null}
    </div>
  );
}
