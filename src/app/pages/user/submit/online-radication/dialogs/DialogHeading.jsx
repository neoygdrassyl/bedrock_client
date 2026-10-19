import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const TONES = {
  primary: 'border-primary/20 bg-primary/10 text-[hsl(var(--primary))]',
  danger: 'border-[hsl(var(--destructive)/0.25)] bg-[hsl(var(--destructive)/0.08)] text-[hsl(var(--destructive))]',
};

/** Icon tile + title + request reference, shared by the decision dialogs. */
export function DialogHeading({ icon: Icon, tone = 'primary', title, request, description }) {
  const code = request?.publicCode;
  const name = request?.applicantName;
  const reference = code || name ? (
    <>
      {code ? <span className="font-mono">{code}</span> : null}
      {code && name ? ' · ' : null}
      {name}
    </>
  ) : null;
  return (
    <DialogHeader className="space-y-[0.875rem] pr-8 text-left">
      <div className="flex items-start gap-[0.75rem]">
        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl border-[1px]', TONES[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pt-0.5">
          <DialogTitle className="mb-0 text-base font-semibold leading-6">{title}</DialogTitle>
          {reference ? <p className="mb-0 mt-0.5 truncate text-xs text-muted-foreground">{reference}</p> : null}
        </div>
      </div>
      {description ? (
        <DialogDescription className="mb-0 text-sm leading-6">{description}</DialogDescription>
      ) : null}
    </DialogHeader>
  );
}
