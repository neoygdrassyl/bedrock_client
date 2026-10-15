import { Tag } from './Tag';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import { DOCUMENT_ORIGIN_META, DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';

const NOT_APPLICABLE_TOOLTIP = 'Solo aplica para documentos físicos con soporte digitalizado asociado por VR';
const SCANNED_TOOLTIP = 'El documento físico tiene archivo escaneado asociado por VR.';
const PENDING_SCAN_TOOLTIP = 'No hay archivo escaneado asociado a este VR físico.';

export function ScanStatusBadge({ applies = false, value = false, className }) {
    if (!applies) {
        return <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span data-testid="scan-status-badge" data-scan-status="not_applicable" className={cn('text-xs text-slate-600', className)}>
                        No aplica
                    </span>
                </TooltipTrigger>
                <TooltipContent>{NOT_APPLICABLE_TOOLTIP}</TooltipContent>
            </Tooltip>
        </TooltipProvider>;
    }

    const meta = DOCUMENT_ORIGIN_META[DOCUMENT_ORIGIN_STATE.SCANNED];

    return <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Tag
                    data-testid="scan-status-badge"
                    data-scan-status={value ? 'scanned' : 'pending_scan'}
                    tone={value ? 'success' : 'neutral'}
                    pill
                    className={className}
                >
                    <Icon name={meta.icon} size={12} aria-hidden="true" /> {value ? 'Sí' : 'No'}
                </Tag>
            </TooltipTrigger>
            <TooltipContent>{value ? SCANNED_TOOLTIP : PENDING_SCAN_TOOLTIP}</TooltipContent>
        </Tooltip>
    </TooltipProvider>;
}

export default ScanStatusBadge;
