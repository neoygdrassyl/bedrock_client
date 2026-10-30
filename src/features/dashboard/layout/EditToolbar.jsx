import { Button } from '@/shared/ui/button';
import { WIDGETS_BY_ID } from '../dashboardConfig';
import { WidgetIcon } from '../widgets/WidgetCard';

/** Sticky arrange toolbar shown only while the dashboard is in edit mode. */
export default function EditToolbar({ hidden, onShow, onReset, onDone }) {
  return (
    <div
      role="toolbar"
      aria-label="Personalizar panel"
      className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-card/95 px-3 py-2 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-card/85"
    >
      <span className="flex items-center gap-2 !text-sm font-medium text-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <WidgetIcon name="SlidersHorizontal" size={14} />
        </span>
        Arrastra las tarjetas para reorganizarlas
      </span>

      {hidden.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Tarjetas ocultas">
          <span className="!text-xs text-muted-foreground">Ocultas:</span>
          {hidden.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onShow(id)}
              aria-label={`Mostrar ${WIDGETS_BY_ID[id]?.title || id}`}
              className="flex h-7 items-center gap-1 rounded-full border border-dashed border-border bg-background px-2.5 !text-xs font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <WidgetIcon name="Plus" size={12} />
              {WIDGETS_BY_ID[id]?.title || id}
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 rounded-lg !text-xs" onClick={onReset}>
          <WidgetIcon name="RotateCcw" size={14} />
          Restablecer
        </Button>
        <Button type="button" size="sm" className="h-8 gap-1.5 rounded-lg px-4 !text-xs" onClick={onDone}>
          <WidgetIcon name="Check" size={14} />
          Listo
        </Button>
      </div>
    </div>
  );
}
