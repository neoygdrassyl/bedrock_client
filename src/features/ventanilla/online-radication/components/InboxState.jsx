import { IllustratedState } from '@/shared/components/feedback/IllustratedState.jsx';
import { cn } from '@/shared/lib/utils';

/**
 * Empty / error / unavailable state of the inbox, drawn with the shared IllustratedState.
 * `variant`: empty | load-error | not-found | offline. Errors (`role="alert"`) are announced
 * assertively by the wrapper; the illustration itself keeps its polite status role.
 */
export function InboxState({ variant = 'empty', title, description, onRetry, action, role, className }) {
  return (
    <div role={role === 'alert' ? 'alert' : undefined} className={cn('px-[1.25rem]', className)}>
      <IllustratedState
        variant={variant}
        size="compact"
        title={title}
        description={description}
        onRetry={onRetry}
        actions={action}
        className="max-w-[26rem] py-[2.5rem]"
      />
    </div>
  );
}
