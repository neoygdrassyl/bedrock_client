import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Contextual sub-navigation panel (180px, sits right of the icon rail).
 */
export function ContextPanel({ title, items = [], collapsed = false }) {
  const location = useLocation();

  if (collapsed || items.length === 0) {
    return null;
  }

  return (
    <aside
      className={cn(
        'h-full w-[180px] border-r border-border bg-card transition-all duration-200',
        collapsed && 'w-0 overflow-hidden'
      )}
    >
      <ScrollArea className="h-full">
        <div className="px-4 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors no-underline',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary -ml-px'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
