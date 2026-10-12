import { ClipboardCheck, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VrCell } from '../molecules/VrCell';
import { DocumentSupportList } from '../molecules/DocumentSupportList';
import { DocumentalDetailShell } from './DocumentalDetailShell';

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
    <DocumentalDetailShell
      code={row.documentCode}
      title={row.documentName}
      headingId={headingId}
      caption={`${entries.length} ${entries.length === 1 ? 'asiento registrado' : 'asientos registrados'}`}
      footer={
        <>
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
        </>
      }
    >
      <section className="border-y border-border/70 py-[1rem]" aria-label="Soportes recibidos">
        <DocumentSupportList row={row} scanned={row.scanned} />
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
    </DocumentalDetailShell>
  );
}
