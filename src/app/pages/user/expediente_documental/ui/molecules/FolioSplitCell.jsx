import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FolioCount } from '../atoms/FolioCount';

export function FolioSplitCell({ digital = 0, physical = 0, className }) {
    return <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn('grid grid-cols-2 overflow-hidden rounded-lg border border-border text-xs', className)} data-testid="folio-split-cell">
                    <FolioCount label="Digitales" value={digital} tone="digital" />
                    <FolioCount label="Físicos" value={physical} tone="physical" />
                </div>
            </TooltipTrigger>
            <TooltipContent>Folios digitales / folios físicos</TooltipContent>
        </Tooltip>
    </TooltipProvider>;
}

export default FolioSplitCell;
