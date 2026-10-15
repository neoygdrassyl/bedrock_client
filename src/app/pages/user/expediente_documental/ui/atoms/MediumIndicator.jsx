import { Tag } from './Tag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { DOCUMENT_ORIGIN_META, DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';

const TONES = {
    [DOCUMENT_ORIGIN_STATE.PHYSICAL]: 'warning',
    [DOCUMENT_ORIGIN_STATE.SCANNED]: 'success',
    [DOCUMENT_ORIGIN_STATE.DIGITAL]: 'info',
};

export function MediumIndicator({ state = DOCUMENT_ORIGIN_STATE.DIGITAL, active = true, label, className }) {
    const meta = DOCUMENT_ORIGIN_META[state] || DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.DIGITAL];
    const resolvedLabel = label || meta.label;

    return <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Tag
                    data-testid="medium-indicator"
                    data-medium-state={state}
                    data-active={active}
                    tone={active ? TONES[state] || 'info' : 'neutral'}
                    pill
                    aria-label={resolvedLabel}
                    className={cn('h-8 w-8 justify-center p-0', className)}
                >
                    <Icon name={meta.icon} size={13} aria-hidden="true" />
                </Tag>
            </TooltipTrigger>
            <TooltipContent>{meta.tooltip}</TooltipContent>
        </Tooltip>
    </TooltipProvider>;
}

export default MediumIndicator;
