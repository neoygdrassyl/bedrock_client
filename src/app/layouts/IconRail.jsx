import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Vertical icon-only navigation rail (48px wide, always dark bg).
 */
export function IconRail({ items, activeId, onSelect, logo, bottomSlot }) {
  const location = useLocation();

  return (
    <nav
      aria-label="Navegación principal"
      className="flex flex-col items-center h-full w-12 bg-sidebar text-sidebar-foreground py-3 gap-1"
    >
      {logo && <div className="mb-4 flex items-center justify-center">{logo}</div>}

      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col items-center gap-1 flex-1">
          {items.map((item) => {
            const isActive =
              activeId === item.id || location.pathname.startsWith(item.route);
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-white'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10'
                    )}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon name={item.icon} size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {bottomSlot && (
        <div className="flex flex-col items-center gap-2 mt-auto pt-2 border-t border-white/10">
          {bottomSlot}
        </div>
      )}
    </nav>
  );
}
