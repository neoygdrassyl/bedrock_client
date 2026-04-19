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
 * Visual reference: Linear sidebar + VS Code activity bar.
 */
export function IconRail({ items, activeId, onSelect, logo, collapsed = false }) {
  const location = useLocation();

  const mainItems = items.slice(0, UTILITY_START_INDEX);
  const utilityItems = items.slice(UTILITY_START_INDEX);

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'flex flex-col items-center h-full bg-sidebar text-sidebar-foreground shrink-0 transition-all duration-200 overflow-hidden',
        collapsed ? 'w-0 p-0' : 'w-12 py-2.5 gap-0.5'
      )}
      aria-hidden={collapsed}
    >
      {logo && (
        <div className="mb-3 mt-0.5 flex items-center justify-center">
          {logo}
        </div>
      )}

      <TooltipProvider delayDuration={150}>
        <div className="flex flex-col items-center gap-0.5 flex-1">
          {mainItems.map((item) => (
            <RailButton
              key={item.id}
              item={item}
              isActive={activeId === item.id || location.pathname.startsWith(item.route)}
              onSelect={onSelect}
            />
          ))}

          {utilityItems.length > 0 && (
            <div className="w-5 border-t border-sidebar-foreground/10 my-2" />
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
            'relative flex items-center justify-center w-9 h-9 rounded-md transition-all duration-200',
            isActive
              ? 'bg-sidebar-accent text-white shadow-[0_0_12px_rgba(37,99,235,0.25)]'
              : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-white/[0.08] hover:shadow-[0_0_8px_rgba(37,99,235,0.12)] active:scale-95'
          )}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-[3px] h-4 rounded-r-full bg-white/90 transition-all duration-200" />
          )}
          <Icon name={item.icon} size={18} />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10} className="text-xs font-medium">
        {item.label}
      </TooltipContent>
    </Tooltip>
  );
}
