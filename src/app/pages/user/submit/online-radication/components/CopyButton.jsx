import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/** Icon button that copies `value`; announces the result to screen readers. */
export function CopyButton({ value, label, className }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timeoutId = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  async function copy(event) {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch {
      toast.error('No fue posible copiar al portapapeles');
    }
  }

  if (!value) return null;
  return (
    <>
      <button
        type="button"
        onClick={copy}
        onKeyDown={(event) => event.stopPropagation()}
        aria-label={label}
        title={copied ? 'Copiado' : label}
        className={cn(
          'inline-grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-md bg-transparent text-muted-foreground transition-colors',
          'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {copied
          ? <Check className="h-3.5 w-3.5 text-[hsl(var(--accent))]" aria-hidden="true" />
          : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      </button>
      <span className="sr-only" aria-live="polite">{copied ? 'Copiado al portapapeles' : ''}</span>
    </>
  );
}
