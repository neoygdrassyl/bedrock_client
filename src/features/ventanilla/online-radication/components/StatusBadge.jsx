import { BadgeCheck, Banknote, CircleCheck, CircleX, Clock3, ReceiptText, TriangleAlert } from 'lucide-react';
import { DovelaBadge } from '@/shared/dovela-ui';
import { cn } from '@/shared/lib/utils';
import { rowStatus } from '../inboxModel';

const ICONS = {
  pending: Clock3,
  radicated: CircleCheck,
  rejected: CircleX,
  awaiting_payment: Banknote,
  receipt_submitted: ReceiptText,
  receipt_rejected: TriangleAlert,
  approved: BadgeCheck,
};

// Icon colors are graphics (>= 3:1); the label keeps the foreground color for AA text contrast.
const TONE_ICON_CLASSES = {
  warning: 'text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]',
  success: 'text-[hsl(var(--accent))]',
  danger: 'text-[hsl(var(--destructive))]',
  info: 'text-[hsl(var(--primary))]',
  neutral: 'text-muted-foreground',
};

/**
 * Request status with icon + text (never color alone). While the request is pending, the optional
 * `liquidation` (status string, `{ status }` or the whole item) refines it: "En espera de pago",
 * "Recibo en revisión", "Recibo rechazado" or "Pago aprobado".
 */
export function StatusBadge({ status, liquidation, size = 'sm', showHint = false, className }) {
  const meta = rowStatus(status, liquidation);
  const Icon = ICONS[meta.key];
  return (
    <DovelaBadge
      tone={meta.tone}
      data-status={meta.key}
      title={showHint && meta.hint ? meta.hint : undefined}
      className={cn('max-w-full shrink-0 whitespace-nowrap', size === 'md' && 'gap-1.5 px-2.5 py-1 text-xs', className)}
    >
      {Icon ? <Icon className={cn('shrink-0', size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3', TONE_ICON_CLASSES[meta.tone])} aria-hidden="true" /> : null}
      <span className="truncate">{meta.label}</span>
    </DovelaBadge>
  );
}
