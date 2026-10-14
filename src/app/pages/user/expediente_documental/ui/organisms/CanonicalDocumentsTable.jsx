import { Archive, FileSearch, History, Layers, Monitor, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { VrBadge } from '../atoms/VrBadge';
import { DocumentTitleButton } from '../molecules/DocumentTitleButton';
import { ReceiptStatus, ScanStatus } from '../molecules/DocumentReceiptStatus';
import { handleSelectableRowKeyDown, selectableRowClass, selectedRowAccent } from '../selectableRows';
import { CLASS_SHORT_LABELS, documentClassOf, formatDocumentaryDate, rowCode, rowName, rowSupport, versionCountOf } from '../../canonicalDocumentaryModel';

const CLASS_TONES = {
  requirement: 'border-border bg-muted/40 text-muted-foreground',
  annex: 'border-primary/20 bg-primary/5 text-[hsl(var(--primary))]',
  vr_slip: 'border-border bg-card text-foreground',
};

function ClassBadge({ row }) {
  const documentClass = documentClassOf(row);
  return (
    <span className={cn('rounded border px-1.5 text-[10px] font-medium leading-4', CLASS_TONES[documentClass])}>
      {CLASS_SHORT_LABELS[documentClass] || 'Documento'}
    </span>
  );
}

function HeadLabel({ icon: Icon, children }) {
  return (
    <span className="flex items-center gap-1.5">
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

const COLUMNS = 6;

/**
 * One row per current document, grouped by ventanilla list. Presentation only.
 * The whole row selects the document (click, Enter or Space); one row is tabbable at a time.
 */
export function CanonicalDocumentsTable({ groups, selectedKey, expandedKey, onSelect, loading, hasFilters, onResetFilters, idPrefix }) {
  return (
    <table role="grid" className="w-full min-w-[720px] table-fixed border-collapse text-sm" aria-label="Documentos recibidos" aria-busy={loading}>
      <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--card))]">
        <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
          <TableHead scope="col" className="h-10 w-[38%] px-[1rem] text-[11px] font-medium">Documento</TableHead>
          <TableHead scope="col" className="h-10 w-[20%] px-[0.75rem] text-[11px] font-medium"><HeadLabel icon={History}>Última entrega</HeadLabel></TableHead>
          <TableHead scope="col" className="h-10 w-[11%] px-2 text-[11px] font-medium"><HeadLabel icon={Archive}>Físico</HeadLabel></TableHead>
          <TableHead scope="col" className="h-10 w-[9%] px-2 text-[11px] font-medium"><HeadLabel icon={Monitor}>Digital</HeadLabel></TableHead>
          <TableHead scope="col" className="h-10 w-[13%] px-[0.75rem] text-[11px] font-medium"><HeadLabel icon={ScanLine}>Escaneado</HeadLabel></TableHead>
          <TableHead scope="col" className="h-10 w-[9%] px-2 text-[11px] font-medium"><HeadLabel icon={Layers}>Versiones</HeadLabel></TableHead>
        </TableRow>
      </TableHeader>
      {loading ? (
        <TableBody>
          {Array.from({ length: 6 }, (_, index) => (
            <TableRow key={index} className="border-border/60">
              <TableCell className="px-[1rem] py-[0.75rem]">
                <div className="flex items-center gap-[0.75rem]"><Skeleton className="h-8 w-8 shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-4/5" /><Skeleton className="h-2 w-12" /></div></div>
              </TableCell>
              {Array.from({ length: COLUMNS - 1 }, (_, cell) => <TableCell key={cell} className="px-2"><Skeleton className="h-4 w-12" /></TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      ) : groups.map((group) => (
        <TableBody key={group.title} aria-label={group.title}>
          {(
            <TableRow className="border-border/60 bg-muted/15 hover:bg-muted/15">
              <TableHead scope="colgroup" colSpan={COLUMNS} className="h-8 px-[1rem] text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title} <span className="font-mono font-normal tabular-nums">({group.rows.length})</span>
              </TableHead>
            </TableRow>
          )}
          {group.rows.map((row) => {
            const selected = row.rowKey === selectedKey;
            const support = rowSupport(row);
            return (
              <TableRow
                key={row.rowKey}
                data-row-key={row.rowKey}
                aria-selected={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => onSelect(row)}
                onKeyDown={(event) => handleSelectableRowKeyDown(event, () => onSelect(row))}
                className={selectableRowClass(selected)}
              >
                <TableCell className={cn('relative px-[1rem] py-2', selected && selectedRowAccent)}>
                  <DocumentTitleButton
                    name={rowName(row)}
                    code={rowCode(row)}
                    extra={<ClassBadge row={row} />}
                    selected={selected}
                    expanded={expandedKey === row.rowKey}
                    controlsId={`${idPrefix}-${row.receivedDocumentRowId}`}
                    tabIndex={-1}
                  />
                </TableCell>
                <TableCell className="px-[0.75rem] py-2">
                  <VrBadge value={row.receipt.vrLabel} />
                  <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{formatDocumentaryDate(row.receipt.registeredAt || row.receipt.receivedAt)}</span>
                </TableCell>
                <TableCell className="px-2 py-2">
                  <ReceiptStatus row={support} medium="physical" />
                  {support.pagesPhysical !== null ? <span className="mt-0.5 block text-[11px] text-muted-foreground">{support.pagesPhysical} {support.pagesPhysical === 1 ? 'folio' : 'folios'}</span> : null}
                </TableCell>
                <TableCell className="px-2 py-2"><ReceiptStatus row={support} medium="digital" /></TableCell>
                <TableCell className="px-[0.75rem] py-2"><ScanStatus scanned={support.scanned} /></TableCell>
                <TableCell className="px-2 py-2 font-mono text-xs tabular-nums text-foreground">{versionCountOf(row)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      ))}
      {!loading && !groups.length ? (
        <TableBody>
          <TableRow>
            <TableCell colSpan={COLUMNS} className="px-6 py-16 text-center">
              <FileSearch className="mx-auto mb-[0.75rem] h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mb-1 text-sm font-semibold text-foreground">{hasFilters ? 'Sin coincidencias' : 'Aún no hay documentos recibidos'}</p>
              <p className="mb-[1rem] text-xs text-muted-foreground">
                {hasFilters ? 'Pruebe con otro nombre, código o combinación de filtros.' : 'Los documentos que se reciban en este expediente aparecerán aquí.'}
              </p>
              {hasFilters ? <Button type="button" variant="outline" size="sm" onClick={onResetFilters}>Limpiar filtros</Button> : null}
            </TableCell>
          </TableRow>
        </TableBody>
      ) : null}
    </table>
  );
}

export default CanonicalDocumentsTable;
