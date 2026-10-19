import { CircleCheck, CircleX, Clock3 } from 'lucide-react';
import { DovelaBadge } from '@/components/dovela-ui';
import { cn } from '@/lib/utils';
import { STATUS_META } from '../onlineRadicationModel';

const ICONS = { pending: Clock3, radicated: CircleCheck, rejected: CircleX };

// Icon colors are graphics (>= 3:1); the label keeps the foreground color for AA text contrast.
const ICON_CLASSES = {
  pending: 'text-[hsl(var(--operational-warning-text))] dark:text-[hsl(var(--warning))]',
  radicated: 'text-[hsl(var(--accent))]',
  rejected: 'text-[hsl(var(--destructive))]',
};

/** Request status with icon + text (never color alone). */
export function StatusBadge({ status, size = 'sm', className }) {
  const meta = STATUS_META[status] || { label: status ? String(status) : 'Sin estado', tone: 'neutral' };
  const Icon = ICONS[status];
  return (
    <DovelaBadge
      tone={meta.tone}
      className={cn('shrink-0 whitespace-nowrap', size === 'md' && 'gap-1.5 px-2.5 py-1 text-xs', className)}
    >
      {Icon ? <Icon className={cn(size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3', ICON_CLASSES[status])} aria-hidden="true" /> : null}
      {meta.label}
    </DovelaBadge>
  );
}
