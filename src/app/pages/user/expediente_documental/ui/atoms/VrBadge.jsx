import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getDocumentVrDisplayValue, isInternalReportVr } from '../../../shared/expediente-documental.utils';

const TONE_CLASSES = {
    empty: 'border-border bg-muted/30 text-muted-foreground',
    report: 'border-primary/30 bg-primary/15 text-primary',
    value: 'border-border bg-card text-foreground',
};

export function VrBadge({ value, className }) {
    const displayValue = getDocumentVrDisplayValue(value);
    const isReport = isInternalReportVr(value);
    const hasValue = Boolean(String(value || '').trim());
    const tone = !hasValue ? 'empty' : (isReport ? 'report' : 'value');

    const badge = <Badge
        data-testid="vr-badge"
        variant="outline"
        className={cn('rounded-full border px-2 py-0.5 font-mono text-[11px] font-semibold', TONE_CLASSES[tone], className)}
    >
        {displayValue}
    </Badge>;

    if (!isReport) {
        return badge;
    }

    return <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent>VR original: {String(value).trim()}</TooltipContent>
        </Tooltip>
    </TooltipProvider>;
}

export default VrBadge;
