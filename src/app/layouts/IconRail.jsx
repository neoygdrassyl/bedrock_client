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
 * Items before this index are "main nav", after are "utility nav".
 * Used to render a visual separator between groups.
 */
const UTILITY_START_INDEX = 7;

/**
 * Vertical icon-only navigation rail (48px wide, always dark bg).
 * Collapses to 0px when `collapsed` is true.
 */
export function IconRail({ items, activeId, onSelect, logo, collapsed = false }) {
  const location = useLocation();

  const mainItems = items.slice(0, UTILITY_START_INDEX);
  const utilityItems = items.slice(UTILITY_START_INDEX);

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'flex flex-col items-center h-full bg-sidebar text-sidebar-foreground py-3 gap-1 shrink-0 transition-all duration-200 overflow-hidden',
        collapsed ? 'w-0 p-0' : 'w-12'
      )}
      aria-hidden={collapsed}
    >
      {logo && <div className="mb-4 flex items-center justify-center">{logo}</div>}

      <TooltipProvider delayDuration={200}>
        <div className="flex flex-col items-center gap-1 flex-1">
          {mainItems.map((item) => (
            <RailButton
              key={item.id}
              item={item}
              isActive={activeId === item.id || location.pathname.startsWith(item.route)}
              onSelect={onSelect}
            />
          ))}

          {utilityItems.length > 0 && (
            <div className="w-6 border-t border-sidebar-foreground/10 my-1.5" />
          )}

          {utilityItems.map((item) => (
            <RailButton
              key={item.id}
              item={item}
              isActive={activeId === item.id || location.pathname.startsWith(item.route)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </TooltipProvider>
    </nav>
  );
}

function RailButton({ item, isActive, onSelect }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onSelect(item.id)}
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150',
            isActive
              ? 'bg-sidebar-accent text-white shadow-[0_0_10px_rgba(37,99,235,0.25)]'
              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10 hover:shadow-[0_0_8px_rgba(255,255,255,0.06)]'
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
}
