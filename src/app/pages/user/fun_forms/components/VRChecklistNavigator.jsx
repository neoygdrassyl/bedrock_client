import { useRef } from 'react';
import { Button } from '@/components/ui/button';

function getVrLabel(vr) {
  return vr?.id_public || vr?.vr_id_public || `VR ${vr?.id || ''}`.trim();
}

function getVrId(vr) {
  return vr?.id_public || vr?.vr_id_public || String(vr?.id || '');
}

export default function VRChecklistNavigator({ vrs, selectedVrId, onSelect }) {
  const scrollerRef = useRef(null);
  const seenIds = new Set();
  const items = (Array.isArray(vrs) ? vrs : []).filter((vr) => {
    const vrId = getVrId(vr);
    if (!vrId || seenIds.has(vrId)) return false;
    seenIds.add(vrId);
    return true;
  });

  const options = [{ id: null, label: 'Último relacionado', date: '', mode: 'latest' }].concat(
    items.map((vr) => ({ id: getVrId(vr), label: getVrLabel(vr), date: vr.date || 'sin fecha', mode: 'vr' }))
  );

  const activeIndex = Math.max(0, options.findIndex((option) => option.id === selectedVrId));
  const activeOption = options[activeIndex] || options[0];

  const scroll = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * 280, behavior: 'smooth' });
  };

  const moveSelection = (direction) => {
    const nextIndex = Math.min(Math.max(activeIndex + direction, 0), options.length - 1);
    const nextOption = options[nextIndex];
    onSelect?.(nextOption.id);
    scroll(direction);
  };

  if (!items.length) {
    return <p className="text-xs text-muted-foreground">Sin VRs asociados al expediente.</p>;
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-2">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wide text-foreground">VR en contexto</span>
        <span>{activeOption.mode === 'latest' ? 'Mostrando el último VR asociado por cada fila' : `Mostrando ${activeOption.label} · ${activeOption.date}`}</span>
      </div>
      <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[44px] min-w-[44px]"
        onClick={() => moveSelection(-1)}
        disabled={activeIndex === 0}
        aria-label="Ver VR anterior"
      >
        ‹
      </Button>
      <div ref={scrollerRef} className="flex flex-1 gap-2 overflow-x-auto scroll-smooth py-1">
        {options.map((option) => {
          const active = selectedVrId === option.id;
          return (
            <button
              type="button"
              key={option.id || 'latest'}
              className={`min-h-[44px] whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:bg-muted'}`}
              onClick={() => onSelect?.(option.id)}
            >
              {option.mode === 'latest' ? option.label : `${option.label} · ${option.date}`}
            </button>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-[44px] min-w-[44px]"
        onClick={() => moveSelection(1)}
        disabled={activeIndex === options.length - 1}
        aria-label="Ver VR siguiente"
      >
        ›
      </Button>
      </div>
    </div>
  );
}
