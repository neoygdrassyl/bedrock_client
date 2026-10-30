import { m } from 'motion/react';
import { cn } from '@/shared/lib/utils';
import { SIZE_CLASSES, SIZE_LABELS, WIDGET_SIZES } from '../dashboardConfig';
import { WidgetIcon } from '../widgets/WidgetCard';

const LAYOUT_TRANSITION = { type: 'spring', stiffness: 500, damping: 40 };

const CONTROL_BUTTON =
  'flex h-7 min-w-7 items-center justify-center rounded-lg border-0 bg-transparent px-1.5 !text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40';

function DropIndicator({ placement, axis }) {
  if (!placement) return null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-10 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]',
        axis === 'y'
          ? cn('inset-x-0 h-1', placement === 'before' ? '-top-2.5' : '-bottom-2.5')
          : cn('inset-y-0 w-1', placement === 'before' ? '-left-2.5' : '-right-2.5')
      )}
    />
  );
}

function EditControls({ widget, size, index, total, onSizeChange, onMoveBy, onHide, onHandleKeyDown }) {
  return (
    <div className="absolute -top-4 right-3 z-20 flex items-center gap-0.5 rounded-xl border border-border/70 bg-card px-1 py-0.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.45)]">
      <button
        type="button"
        data-widget-handle={widget.id}
        onKeyDown={(event) => onHandleKeyDown(event, widget.id)}
        aria-label={`Mover ${widget.title}. Usa las flechas para cambiar su posición`}
        title="Arrastra o usa las flechas para mover"
        className={cn(CONTROL_BUTTON, 'cursor-grab active:cursor-grabbing')}
      >
        <WidgetIcon name="GripVertical" size={15} />
      </button>

      <div role="group" aria-label="Tamaño de la tarjeta" className="flex items-center rounded-lg bg-muted/70 p-0.5">
        {WIDGET_SIZES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={size === option}
            aria-label={SIZE_LABELS[option].aria}
            title={SIZE_LABELS[option].aria}
            onClick={() => onSizeChange(widget.id, option)}
            className={cn(
              'h-6 min-w-6 rounded-md border-0 px-1.5 !text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              size === option ? 'bg-card text-foreground shadow-sm' : 'bg-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {SIZE_LABELS[option].short}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onMoveBy(widget.id, -1)}
        disabled={index === 0}
        aria-label={`Mover ${widget.title} antes`}
        title="Mover antes"
        className={CONTROL_BUTTON}
      >
        <WidgetIcon name="ArrowLeft" size={14} />
      </button>
      <button
        type="button"
        onClick={() => onMoveBy(widget.id, 1)}
        disabled={index === total - 1}
        aria-label={`Mover ${widget.title} después`}
        title="Mover después"
        className={CONTROL_BUTTON}
      >
        <WidgetIcon name="ArrowRight" size={14} />
      </button>
      <button
        type="button"
        onClick={() => onHide(widget.id)}
        aria-label={`Ocultar ${widget.title}`}
        title="Ocultar tarjeta"
        className={CONTROL_BUTTON}
      >
        <WidgetIcon name="EyeOff" size={14} />
      </button>
    </div>
  );
}

/**
 * Grid cell for one widget. Outside edit mode it is a plain animated wrapper;
 * in edit mode it becomes draggable and shows its arrange controls.
 */
export default function WidgetFrame({
  widget,
  size,
  editing,
  index,
  total,
  isDragging,
  dropPlacement,
  dropAxis,
  tourId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onSizeChange,
  onMoveBy,
  onHide,
  onHandleKeyDown,
  children,
}) {
  return (
    <m.div
      layout="position"
      transition={{ layout: LAYOUT_TRANSITION }}
      data-widget-id={widget.id}
      data-dovela-tour-id={tourId}
      draggable={editing || undefined}
      onDragStart={editing ? (event) => onDragStart(event, widget.id) : undefined}
      onDragOver={editing ? (event) => onDragOver(event, widget.id) : undefined}
      onDragEnd={editing ? onDragEnd : undefined}
      className={cn(
        'relative min-w-0 self-start',
        SIZE_CLASSES[size] || SIZE_CLASSES.sm,
        editing
          ? 'rounded-2xl outline-dashed outline-2 outline-offset-4 outline-primary/40'
          : '[&:has(>[data-widget-body]:empty)]:hidden',
        isDragging && 'opacity-50'
      )}
    >
      {editing && (
        <EditControls
          widget={widget}
          size={size}
          index={index}
          total={total}
          onSizeChange={onSizeChange}
          onMoveBy={onMoveBy}
          onHide={onHide}
          onHandleKeyDown={onHandleKeyDown}
        />
      )}
      <div
        data-widget-body=""
        className={cn(
          editing &&
            "pointer-events-none select-none opacity-90 empty:flex empty:min-h-20 empty:items-center empty:justify-center empty:rounded-2xl empty:border empty:border-dashed empty:border-border empty:!text-xs empty:text-muted-foreground empty:before:content-['Sin_contenido_para_mostrar']"
        )}
        inert={editing || undefined}
      >
        {children}
      </div>
      {editing && <DropIndicator placement={dropPlacement} axis={dropAxis} />}
    </m.div>
  );
}
