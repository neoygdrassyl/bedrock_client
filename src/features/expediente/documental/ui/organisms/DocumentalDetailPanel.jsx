import { ClipboardCheck, History } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { VrCell } from '../molecules/VrCell';
import { DocumentSupportList } from '../molecules/DocumentSupportList';
import { DetailFact, DetailPill, DetailSection } from '../molecules/DetailSection';
import { Separator } from '@/shared/ui/separator';
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
    <DetailSection id={`vr-history-${row.id}`} title="Recepciones asociadas" aside={<DetailPill>{items.length} VR</DetailPill>}>
      {items.length ? (
        <ol className="m-0 list-none space-y-0 p-0">
          {items.slice(0, 5).map((item, index) => (
            <li key={item.value} className="relative flex gap-[0.75rem] pb-[1rem] last:pb-0">
              <div className="relative flex w-4 shrink-0 justify-center">
                {index < Math.min(items.length, 5) - 1 ? (
                  <span
                    className="absolute -bottom-1 top-[14px] w-px bg-border"
                    aria-hidden="true"
                  />
                ) : null}
                <span
                  className={cn(
                    'relative mt-1 h-2.5 w-2.5 rounded-full border-[2px] border-solid',
                    item.value === latestVr
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]',
                  )}
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <VrCell latestVr={item.value} />
                  {item.value === latestVr ? <DetailPill tone="primary">Última recepción</DetailPill> : null}
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
        <p className="mb-0 text-xs text-muted-foreground">Sin versiones VR registradas.</p>
      )}
      {items.length > 5 ? (
        <p className="mb-0 mt-[0.75rem] text-xs text-muted-foreground">
          {items.length - 5} VR adicionales en el historial completo.
        </p>
      ) : null}
    </DetailSection>
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
      <DetailSection id={`supports-${row.id}`} title="Soportes recibidos">
        <DocumentSupportList row={row} scanned={row.scanned} />
        <Separator className="my-[0.75rem]" />
        <dl className="m-0 grid grid-cols-2 gap-x-[1rem] gap-y-[0.75rem]">
          {[
            ['Folios físicos', row.folios?.physical],
            ['Folios digitales', row.folios?.digital],
          ].map(([label, value]) => (
            <DetailFact key={label} label={label}>
              {value ?? <span className="text-xs font-normal text-muted-foreground">Sin dato</span>}
            </DetailFact>
          ))}
        </dl>
      </DetailSection>
      <VrHistory row={row} />
    </DocumentalDetailShell>
  );
}
