import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const MIN_OVERLAY_Z_INDEX = 1050;
const MIN_CONTENT_Z_INDEX = 1051;
const FULLSCREEN_WORKSPACE_BASE_Z_INDEX = 10080;

function getSafeZIndex(value, fallback) {
  const parsedValue = Number.parseInt(`${value ?? ''}`, 10);
  return Number.isFinite(parsedValue) ? Math.max(parsedValue, fallback) : fallback;
}

function getModalStackBase() {
  if (typeof document === 'undefined') return {
    overlay: MIN_OVERLAY_Z_INDEX,
    content: MIN_CONTENT_Z_INDEX,
  };

  if (document.body.classList.contains('workspace-fullscreen-open')) {
    return {
      overlay: FULLSCREEN_WORKSPACE_BASE_Z_INDEX,
      content: FULLSCREEN_WORKSPACE_BASE_Z_INDEX + 1,
    };
  }

  return {
    overlay: MIN_OVERLAY_Z_INDEX,
    content: MIN_CONTENT_Z_INDEX,
  };
}

function lockDocumentScroll() {
  const currentLockCount = Number.parseInt(document.body.dataset.legacyModalLockCount || '0', 10) || 0;

  if (currentLockCount === 0) {
    document.body.dataset.legacyModalPrevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  document.body.dataset.legacyModalLockCount = String(currentLockCount + 1);
}

function unlockDocumentScroll() {
  const currentLockCount = Number.parseInt(document.body.dataset.legacyModalLockCount || '0', 10) || 0;

  if (currentLockCount <= 1) {
    document.body.style.overflow = document.body.dataset.legacyModalPrevOverflow || '';
    delete document.body.dataset.legacyModalPrevOverflow;
    delete document.body.dataset.legacyModalLockCount;
    return;
  }

  document.body.dataset.legacyModalLockCount = String(currentLockCount - 1);
}

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
  const portalNodeRef = useRef(null);

  if (typeof document !== 'undefined' && portalNodeRef.current === null) {
    portalNodeRef.current = document.createElement('div');
    portalNodeRef.current.setAttribute('data-legacy-modal-root', 'true');
  }

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
    if (!isOpen || typeof document === 'undefined') return undefined;

    const portalNode = portalNodeRef.current;

    if (portalNode && !portalNode.isConnected) {
      document.body.appendChild(portalNode);
    }

    document.addEventListener('keydown', handleKeyDown);
    lockDocumentScroll();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      unlockDocumentScroll();

      if (portalNode && portalNode.isConnected) {
        portalNode.remove();
      }
    };
  }, [isOpen, handleKeyDown]);

  useEffect(() => {
    return () => {
      if (portalNodeRef.current?.isConnected) {
        portalNodeRef.current.remove();
      }
    };
  }, []);

  if (!isOpen || typeof document === 'undefined' || portalNodeRef.current === null) return null;

  const contentStyle = style?.content ?? {};
  const overlayStyle = style?.overlay ?? {};
  const stackBase = getModalStackBase();

  return createPortal(
    <div
      className={cn('ReactModal__Overlay fixed inset-0 z-50', overlayClassName)}
      role="dialog"
      aria-modal="true"
      aria-label={contentLabel}
      style={{
        zIndex: getSafeZIndex(overlayStyle.zIndex, stackBase.overlay),
      }}
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
          zIndex: getSafeZIndex(contentStyle.zIndex, stackBase.content),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    portalNodeRef.current,
  );
}

export default LegacyModal;
