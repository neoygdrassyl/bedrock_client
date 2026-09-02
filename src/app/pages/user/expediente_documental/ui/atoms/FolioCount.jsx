import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const TONE_CLASSES = {
    digital: 'border-r border-border bg-primary/5',
    physical: 'bg-warning/5',
};

export function FolioCount({ label, value = 0, tone = 'digital', className }) {
    return <Badge
        data-testid="folio-count"
        data-tone={tone}
        variant="outline"
        className={cn('flex flex-1 flex-col items-start gap-0 rounded-none border-0 px-2 py-1 text-xs', TONE_CLASSES[tone] || TONE_CLASSES.digital, className)}
    >
        <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold text-foreground">{value || 0}</span>
    </Badge>;
}

export default FolioCount;
