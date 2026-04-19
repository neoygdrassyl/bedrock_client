import { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Drop-in replacement for react-modal.
 * Accepts the same props (isOpen, onRequestClose, style, contentLabel, ariaHideApp, className)
 * but renders a portal-based dialog with Dovela design tokens.
 *
 * Usage: replace `import Modal from 'react-modal'` with
 *        `import { LegacyModal as Modal } from '@/components/legacy-modal'`
 */
export function LegacyModal({
  isOpen,
  onRequestClose,
  style,
  contentLabel,
  className,
  overlayClassName,
  children,
  // Ignored props from react-modal API
  ariaHideApp,       // eslint-disable-line no-unused-vars
  shouldCloseOnOverlayClick = true,
  ...rest
}) {
  // ESC key handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onRequestClose) {
        onRequestClose(e);
      }
    },
    [onRequestClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const contentStyle = style?.content ?? {};

  return (
    <div
      className={cn('ReactModal__Overlay fixed inset-0 z-50', overlayClassName)}
      role="dialog"
      aria-modal="true"
      aria-label={contentLabel}
      {...rest}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0 bg-black/50 dark:bg-black/70 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
        onClick={shouldCloseOnOverlayClick ? onRequestClose : undefined}
      />
      {/* Content */}
      <div
        className={cn(
          'ReactModal__Content absolute z-10 bg-background border border-border rounded-[var(--radius)] shadow-lg overflow-auto animate-in fade-in-0 zoom-in-95 duration-200',
          className,
        )}
        style={{
          top: '2%',
          left: '5%',
          right: '5%',
          bottom: '2%',
          padding: '1rem 1.25rem',
          maxWidth: '1400px',
          margin: '0 auto',
          ...contentStyle,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default LegacyModal;
