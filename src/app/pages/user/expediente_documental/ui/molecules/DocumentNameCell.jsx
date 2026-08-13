import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { LegalFormBadge } from '../atoms/LegalFormBadge';

export function DocumentNameCell({ name, code, legalForm = null, isPreviewRow = false, className }) {
    return <div className={cn('min-w-0', className)} data-testid="document-name-cell">
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="truncate font-medium leading-snug text-foreground">{name}</div>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
        {code ? <div className="font-mono text-xs text-muted-foreground">{code}</div> : null}
        {legalForm ? <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <LegalFormBadge status={legalForm.status}>{legalForm.statusLabel}</LegalFormBadge>
            <LegalFormBadge status="" className="border-border bg-background text-foreground">{legalForm.sourceLabel}</LegalFormBadge>
            {isPreviewRow ? <LegalFormBadge status="" className="border-border bg-muted/40 text-muted-foreground">Fila sintética</LegalFormBadge> : null}
        </div> : null}
        {legalForm?.statusReason ? <div className="mt-1 text-[11px] leading-snug text-muted-foreground">{legalForm.statusReason}</div> : null}
    </div>;
}

export default DocumentNameCell;
