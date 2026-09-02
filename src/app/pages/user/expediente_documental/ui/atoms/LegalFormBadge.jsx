import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LEGAL_FORM_FILTER } from '../../../shared/expediente-documental.utils';

const TONE_CLASSES = {
    [LEGAL_FORM_FILTER.MISSING]: 'border-destructive/40 bg-destructive/10 text-foreground',
    [LEGAL_FORM_FILTER.PENDING_SCAN]: 'border-warning/40 bg-warning/10 text-foreground',
    [LEGAL_FORM_FILTER.PRESENT]: 'border-accent/40 bg-accent/10 text-foreground',
};

export function LegalFormBadge({ status = '', children, className }) {
    return <Badge
        data-testid="legal-form-badge"
        data-legal-form-status={status || 'none'}
        variant="outline"
        className={cn(
            'rounded-full border px-2 py-1 text-[11px] font-semibold leading-none',
            TONE_CLASSES[status] || 'border-border bg-muted/30 text-muted-foreground',
            className,
        )}
    >
        {children}
    </Badge>;
}

export default LegalFormBadge;
