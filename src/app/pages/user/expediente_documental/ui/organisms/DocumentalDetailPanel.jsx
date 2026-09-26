import { Archive, ClipboardCheck, FileText, History, Monitor, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VrCell } from '../molecules/VrCell';
import { ReceiptStatus, ScanStatus } from '../molecules/DocumentReceiptStatus';

function normalizeVr(value) {
  return String(value || '').trim();
}

function getEntryVr(entry = {}) {
  return normalizeVr(entry.vr ?? entry.vrIdPublic ?? entry.id_replace ?? entry.raw?.id_replace);
}

function getEntryTimestamp(entry = {}) {
  const rawDate = [entry.date, entry.time].filter(Boolean).join('T');
  const timestamp = rawDate ? Date.parse(rawDate) : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function buildVrHistory(row = {}) {
  const latestVr = normalizeVr(row.latestVr);
  const itemsByVr = new Map();

  (row.entries || []).forEach((entry) => {
    const value = getEntryVr(entry);
    if (!value) return;
    const timestamp = getEntryTimestamp(entry);
    const current = itemsByVr.get(value) || { value, count: 0, timestamp: 0, date: '' };
    const date = [entry.date, entry.time].filter(Boolean).join(' · ');
    itemsByVr.set(value, {
      ...current,
      count: current.count + 1,
      timestamp: Math.max(current.timestamp, timestamp),
      date: timestamp >= current.timestamp ? date : current.date,
    });
  });

  [latestVr, ...(row.vrValues || [])]
    .map(normalizeVr)
    .filter(Boolean)
    .forEach((value) => {
      if (!itemsByVr.has(value)) itemsByVr.set(value, { value, count: 0, timestamp: 0, date: '' });
    });

  return Array.from(itemsByVr.values()).sort((first, second) => {
    if (first.value === latestVr) return -1;
    if (second.value === latestVr) return 1;
    return (
      second.timestamp - first.timestamp ||
      first.value.localeCompare(second.value, 'es', { numeric: true })
    );
  });
}

function VrHistory({ row }) {
  const latestVr = normalizeVr(row.latestVr);
  const items = buildVrHistory(row);
  return (
    <section aria-labelledby={`vr-history-${row.id}`}>
      <div className="mb-[0.75rem] flex items-center justify-between gap-2">
        <h4 id={`vr-history-${row.id}`} className="m-0 text-xs font-semibold text-foreground">
          Recepciones asociadas
        </h4>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {items.length} VR
        </span>
      </div>
      {items.length ? (
        <ol className="m-0 list-none space-y-0 p-0">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.value} className="relative flex gap-[0.75rem] pb-[1rem] last:pb-0">
              <div className="relative flex w-4 shrink-0 justify-center">
                {index < Math.min(items.length, 5) - 1 ? (
                  <span
                    className="absolute bottom-[-16px] top-3 w-px bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={cn(
                    'relative mt-1.5 h-2 w-2 rounded-full border',
                    item.value === latestVr
                      ? 'border-primary bg-primary'
                      : 'border-border bg-muted',
                  )}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <VrCell latestVr={item.value} />
                  {item.value === latestVr ? (
                    <span className="text-[11px] font-medium text-[hsl(var(--primary))]">
                      Última recepción
                    </span>
                  ) : null}
                </div>
                <p className="mb-0 mt-1 text-xs leading-5 text-muted-foreground">
                  <span className="font-mono">{item.date || 'Sin fecha'}</span>
                  <span className="mx-1.5" aria-hidden="true">
                    ·
                  </span>
                  {item.count
                    ? `${item.count} ${item.count === 1 ? 'asiento' : 'asientos'}`
                    : 'Asociado'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="m-0 rounded-md bg-muted/40 p-[0.75rem] text-xs text-muted-foreground">
          Sin versiones VR registradas.
        </p>
      )}
      {items.length > 5 ? (
        <p className="mb-0 mt-[0.75rem] text-xs text-muted-foreground">
          {items.length - 5} VR adicionales en el historial completo.
        </p>
      ) : null}
    </section>
  );
}

export function DocumentalDetailPanel({ row, onRowAction, headingId }) {
  const entries = row.entries || [];
  return (
    <aside
      aria-labelledby={headingId}
      className="flex min-h-0 min-w-0 flex-col border-t border-border bg-[hsl(var(--card))] lg:border-l lg:border-t-0"
    >
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/70 bg-muted/30 px-[1.25rem]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Ficha documental
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {row.documentCode || 'Sin código'}
        </span>
      </div>
      <div
        tabIndex={0}
        role="region"
        aria-label="Detalle documental desplazable"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[1.25rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      >
        <div className="mb-[1.25rem]">
          <span className="mb-[0.75rem] grid h-10 w-10 place-items-center rounded-lg border border-primary/15 bg-primary/5 text-[hsl(var(--primary))]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3
            id={headingId}
            className="m-0 break-words text-base font-semibold leading-6 tracking-tight text-foreground"
          >
            {row.documentName || 'Documento sin nombre'}
          </h3>
          <p className="mb-0 mt-2 text-xs text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'asiento registrado' : 'asientos registrados'}
          </p>
        </div>
        <section className="border-y border-border/70 py-[1rem]" aria-label="Soportes recibidos">
          <dl className="m-0 space-y-3">
            <div className="flex items-center justify-between gap-[0.75rem]">
              <dt className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                Recepción física
              </dt>
              <dd className="m-0">
                <ReceiptStatus row={row} medium="physical" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-[0.75rem]">
              <dt className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                Recepción digital
              </dt>
              <dd className="m-0">
                <ReceiptStatus row={row} medium="digital" />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-[0.75rem]">
              <dt className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                <ScanLine className="h-3.5 w-3.5" aria-hidden="true" />
                Escaneado del físico
              </dt>
              <dd className="m-0">
                <ScanStatus scanned={row.scanned} />
              </dd>
            </div>
          </dl>
          <dl className="mb-0 mt-[1rem] grid grid-cols-2 gap-[1rem] border-t border-border/70 pt-[1rem]">
            {[
              ['Folios físicos', row.folios?.physical],
              ['Folios digitales', row.folios?.digital],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-normal text-muted-foreground">{label}</dt>
                <dd className="mb-0 mt-1 font-mono text-xl font-medium tabular-nums text-foreground">
                  {value ?? <span className="font-sans text-xs">Sin dato</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="pt-[1.25rem]">
          <VrHistory row={row} />
        </div>
      </div>
      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-border bg-[hsl(var(--card))] p-[1rem]">
        <Button
          type="button"
          size="sm"
          className="bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary)/0.9)]"
          onClick={() => onRowAction?.(row, 'history')}
        >
          <History aria-hidden="true" />
          Ver historial
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onRowAction?.(row, 'evaluation')}
        >
          <ClipboardCheck aria-hidden="true" />
          Ver evaluación
        </Button>
      </div>
    </aside>
  );
}
