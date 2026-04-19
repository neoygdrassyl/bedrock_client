import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';

export function EmptyState({
  icon = 'Inbox',
  message = 'Sin resultados',
  description,
  className,
  children,
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Icon name={icon} size={32} className="text-muted-foreground/60" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">{description}</p>
      )}
      {children}
    </div>
  );
}
