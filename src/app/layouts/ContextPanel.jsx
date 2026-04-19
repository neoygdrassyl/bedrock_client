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
 * Visual reference: Linear sidebar sections + Figma layer panel.
 */
export function ContextPanel({ title, items = [], collapsed = false }) {
  const location = useLocation();

  const isEmpty = collapsed || items.length === 0;

  const grouped = items.reduce((acc, item) => {
    const key = item.group || '_default';
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
  const groupKeys = Object.keys(grouped);

  return (
    <aside
      className={cn(
        'h-full border-r border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-200 shrink-0 overflow-hidden',
        isEmpty ? 'w-0 border-r-0' : 'w-[180px]'
      )}
      aria-hidden={isEmpty}
    >
      {!isEmpty && (
        <ScrollArea className="h-full">
          <div className="px-2.5 py-3.5">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/70 mb-2.5 px-2">
              {title}
            </h2>

            {groupKeys.map((groupKey, gi) => (
              <div key={groupKey}>
                {groupKey !== '_default' && (
                  <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 mt-3 mb-1 px-2">
                    {groupKey}
                  </h3>
                )}
                <nav className="flex flex-col gap-px">
                  {grouped[groupKey].map((item) => {
                    const isActive =
                      location.pathname === item.route ||
                      location.pathname.startsWith(item.route + '/');
                    return (
                      <Link
                        key={item.id}
                        to={item.route}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-2 py-[5px] text-[12.5px] transition-all duration-150 no-underline group',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground/60 hover:bg-muted/80 hover:text-foreground'
                        )}
                      >
                        {item.icon && (
                          <Icon name={item.icon} size={14} className={cn(
                            'shrink-0 transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground/60 group-hover:text-muted-foreground'
                          )} />
                        )}
                        <span className="truncate flex-1">{item.label}</span>
                        {item.badge != null && (
                          <Badge variant="secondary" className="h-[18px] min-w-[18px] px-1 text-[9px] font-medium justify-center rounded-full">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
                {gi < groupKeys.length - 1 && (
                  <div className="my-1.5 mx-2 border-t border-border/30" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
