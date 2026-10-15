import { Tag } from './Tag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getDocumentVrDisplayValue, isInternalReportVr } from '../../../shared/expediente-documental.utils';

const TONES = { empty: 'neutral', report: 'info', value: 'code' };

export function VrBadge({ value, className }) {
    const displayValue = getDocumentVrDisplayValue(value);
    const isReport = isInternalReportVr(value);
    const hasValue = Boolean(String(value || '').trim());
    const tone = !hasValue ? 'empty' : (isReport ? 'report' : 'value');

    const badge = <Tag data-testid="vr-badge" tone={TONES[tone]} mono pill className={className}>
        {displayValue}
    </Tag>;

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
