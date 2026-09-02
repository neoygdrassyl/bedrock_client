import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
    neutral: 'border-border bg-muted/20 text-foreground hover:bg-muted/30',
    physical: 'border-warning/30 bg-warning/15 text-warning hover:bg-warning/20',
    digital: 'border-primary/30 bg-primary/15 text-primary hover:bg-primary/20',
    scanned: 'border-accent/30 bg-accent/15 text-accent hover:bg-accent/20',
    present: 'border-accent/40 bg-accent/10 text-foreground hover:bg-accent/15',
    missing: 'border-destructive/40 bg-destructive/10 text-foreground hover:bg-destructive/15',
    pending_scan: 'border-warning/40 bg-warning/10 text-foreground hover:bg-warning/15',
};

export function KpiFilterChip({ label, count = 0, active = false, tone = 'neutral', onClick, title, className }) {
    return <Button
        type="button"
        variant="outline"
        aria-pressed={active}
        title={title}
        onClick={onClick}
        className={cn(
            'h-auto justify-start rounded-lg border px-3 py-2 text-left text-xs font-normal transition-all hover:-translate-y-0.5 hover:shadow-sm',
            TONE_CLASSES[tone] || TONE_CLASSES.neutral,
            active && 'ring-2 ring-primary/45 ring-offset-1 ring-offset-background',
            className,
        )}
    >
        {label} <b className="font-semibold">{count}</b>
    </Button>;
}

export default KpiFilterChip;
