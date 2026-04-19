import { cn } from '@/lib/utils';

/**
 * Drop-in replacement for MDBTabsPane.
 * Only renders children when `show` is truthy (saves React work).
 * Keeps same prop API: <TabPane show={condition}>...</TabPane>
 */
export function TabPane({ show, className, children, keepMounted = false, ...rest }) {
  if (!show && !keepMounted) return null;

  return (
    <div
      role="tabpanel"
      className={cn(
        'animate-in fade-in-0 duration-150',
        !show && keepMounted && 'hidden',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
