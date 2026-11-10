import { Archive, Monitor, ScanLine } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { supportIconTexts } from './DocumentReceiptStatus';

// Same icons and operational colours as DocumentSupportList / ReceiptStatus / ScanStatus: primary when received,
// success when the physical copy is scanned, warning while its scan is pending, muted outline when absent.
const PRESENT = 'border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]';
const ABSENT = 'border-dashed border-border text-muted-foreground/50';
const SCAN_DONE = 'border-[hsl(var(--operational-success-border)/0.4)] bg-[hsl(var(--operational-success-bg))] text-[hsl(var(--operational-success-text))]';
const SCAN_PENDING = 'border-[hsl(var(--operational-warning-border)/0.4)] bg-[hsl(var(--operational-warning-bg))] text-[hsl(var(--operational-warning-text))]';

function SupportIcon({ icon: Icon, text, className, state, testId }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="img" tabIndex={0} aria-label={text} data-state-support={state} data-testid={testId}
          className={cn('inline-grid h-6 w-6 shrink-0 place-items-center rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[16rem] text-xs leading-4">{text}</TooltipContent>
    </Tooltip>
  );
}

/** One compact cell with the physical, digital and scan supports of a delivery as three icons with tooltips. */
export function SupportIcons({ support, location = null }) {
  const texts = supportIconTexts(support, location);
  const physical = Boolean(support?.mediumPresence?.physical);
  const digital = Boolean(support?.mediumPresence?.digital);
  const scanned = support?.scanned || {};
  return (
    <TooltipProvider delayDuration={150}>
      <span className="inline-flex items-center gap-1" data-testid="support-icons">
        <SupportIcon icon={Archive} text={texts.physical} className={physical ? PRESENT : ABSENT} state={physical ? 'present' : 'absent'} testId="support-physical" />
        <SupportIcon icon={Monitor} text={texts.digital} className={digital ? PRESENT : ABSENT} state={digital ? 'present' : 'absent'} testId="support-digital" />
        <SupportIcon icon={ScanLine} text={texts.scan} className={!scanned.applies ? ABSENT : scanned.value ? SCAN_DONE : SCAN_PENDING}
          state={!scanned.applies ? 'absent' : scanned.value ? 'done' : 'pending'} testId="support-scan" />
      </span>
    </TooltipProvider>
  );
}

export default SupportIcons;
