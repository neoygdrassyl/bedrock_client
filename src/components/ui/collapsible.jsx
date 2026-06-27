import { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

const CollapsibleContext = createContext({ open: false, onOpenChange: () => {} });

export function Collapsible({ open = false, onOpenChange, children, className, ...props }) {
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      <div className={className} data-state={open ? 'open' : 'closed'} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({ children, className, ...props }) {
  const { open, onOpenChange } = useContext(CollapsibleContext);
  return (
    <button
      type="button"
      className={className}
      data-state={open ? 'open' : 'closed'}
      aria-expanded={open}
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({ children, className, ...props }) {
  const { open } = useContext(CollapsibleContext);
  return (
    <div
      data-state={open ? 'open' : 'closed'}
      className={cn(
        'overflow-hidden transition-all duration-200',
        open ? 'animate-in fade-in-0' : 'hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
