import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { DOCUMENT_ORIGIN_META, DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';

export function MediumIndicator({ state = DOCUMENT_ORIGIN_STATE.DIGITAL, active = true, label, className }) {
    const meta = DOCUMENT_ORIGIN_META[state] || DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL];
    const resolvedLabel = label || meta.label;

    return <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge
                    data-testid="medium-indicator"
                    data-medium-state={state}
                    data-active={active}
                    variant="outline"
                    aria-label={resolvedLabel}
                    className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border p-0',
                        active ? meta.activeClassName : meta.inactiveClassName,
                        className,
                    )}
                >
                    <Icon name={meta.icon} size={13} aria-hidden="true" />
                </Badge>
            </TooltipTrigger>
            <TooltipContent>{meta.tooltip}</TooltipContent>
        </Tooltip>
    </TooltipProvider>;
}

export default MediumIndicator;
