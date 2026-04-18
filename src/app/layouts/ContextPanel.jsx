import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icon';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Contextual sub-navigation panel (180px, sits right of the icon rail).
 * When collapsed, renders nothing to prevent content area width jumps.
 *
 * Supports grouped items via `item.group` and optional `item.badge` counts.
 */
export function ContextPanel({ title, items = [], collapsed = false }) {
  const location = useLocation();

  const isEmpty = collapsed || items.length === 0;

  // Group items by `group` field (ungrouped items go under '_default')
  const grouped = items.reduce((acc, item) => {
    const key = item.group || '_default';
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

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
          <div className="px-3 py-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-1">
              {title}
            </h2>

            {groupKeys.map((groupKey, gi) => (
              <div key={groupKey}>
                {groupKey !== '_default' && (
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mt-3 mb-1.5 px-2">
                    {groupKey}
                  </h3>
                )}
                <nav className="flex flex-col gap-0.5">
                  {grouped[groupKey].map((item, i) => {
                    const isActive =
                      location.pathname === item.route ||
                      location.pathname.startsWith(item.route + '/');
                    return (
                      <Link
                        key={item.id}
                        to={item.route}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-all duration-150 no-underline',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium border-l-[3px] border-primary -ml-px'
                            : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                        )}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        {item.icon && (
                          <Icon name={item.icon} size={14} className={cn(
                            'shrink-0',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )} />
                        )}
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge != null && (
                          <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-[10px] font-medium justify-center">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
                {gi < groupKeys.length - 1 && (
                  <div className="my-2 border-t border-border/50" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
