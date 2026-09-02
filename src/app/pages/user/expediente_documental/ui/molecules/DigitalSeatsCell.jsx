import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { FolioCount } from '../atoms/FolioCount';

export function DigitalSeatsCell({ digital = 0, seats = 0, className }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn('grid grid-cols-2 overflow-hidden rounded-lg border border-border text-xs', className)}
            data-testid="digital-seats-cell"
          >
            <FolioCount label="Digitales" value={digital} tone="digital" />
            <FolioCount label="Asientos" value={seats} tone="physical" />
          </div>
        </TooltipTrigger>
        <TooltipContent>Folios digitales / asientos documentales</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default DigitalSeatsCell;
