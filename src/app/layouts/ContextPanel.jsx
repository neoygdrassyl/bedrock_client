import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Contextual sub-navigation panel (180px, sits right of the icon rail).
 * When collapsed, renders nothing to prevent content area width jumps.
 */
export function ContextPanel({ title, items = [], collapsed = false }) {
  const location = useLocation();

  const isEmpty = collapsed || items.length === 0;

  return (
    <aside
      className={cn(
        'h-full border-r border-border bg-card transition-all duration-200 shrink-0 overflow-hidden',
        isEmpty ? 'w-0 border-r-0' : 'w-[180px]'
      )}
      aria-hidden={isEmpty}
    >
      {!isEmpty && (
        <ScrollArea className="h-full">
          <div className="px-4 py-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {title}
            </h2>
            <nav className="flex flex-col gap-0.5">
              {items.map((item) => {
                const isActive = location.pathname === item.route;
                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-150 no-underline',
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary -ml-px'
                        : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.icon && (
                      <Icon name={item.icon} size={14} className={cn(
                        'shrink-0',
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      )} />
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
