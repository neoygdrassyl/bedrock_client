import { ClipboardCheck, Eye, Pencil, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';
import { DOCUMENT_PREVIEW_MEDIUM } from '../../../shared/expediente-documental.utils';
import { MediumIndicator } from '../atoms/MediumIndicator';
import { ScanStatusBadge } from '../atoms/ScanStatusBadge';
import { DocumentNameCell } from '../molecules/DocumentNameCell';
import { VrCell } from '../molecules/VrCell';
import { FolioSplitCell } from '../molecules/FolioSplitCell';
import { ColumnFilterField } from '../molecules/ColumnFilterField';

const SKELETON_ROW_COUNT = 6;
const COLUMN_COUNT = 7;

const MEDIUM_FILTER_OPTIONS = [
  { value: DOCUMENT_PREVIEW_MEDIUM.PHYSICAL, label: 'Físico' },
  { value: DOCUMENT_PREVIEW_MEDIUM.DIGITAL, label: 'Digital' },
];

const SCANNED_STATUS_FILTER_OPTIONS = [
  { value: 'scanned', label: 'Sí' },
  { value: 'pending_scan', label: 'No' },
  { value: 'not_applicable', label: 'No aplica' },
];

const MEDIUM_TO_ORIGIN_STATE = {
  [DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]: DOCUMENT_ORIGIN_STATE.PHYSICAL,
  [DOCUMENT_PREVIEW_MEDIUM.DIGITAL]: DOCUMENT_ORIGIN_STATE.DIGITAL,
};

const MEDIUM_OPTIONS = [
  { medium: DOCUMENT_PREVIEW_MEDIUM.PHYSICAL, label: 'Físico' },
  { medium: DOCUMENT_PREVIEW_MEDIUM.DIGITAL, label: 'Digital' },
];

/**
 * A group can hold physical and digital entries at once, so the cell shows one
 * indicator per medium actually present instead of collapsing the row to a
 * single medium (parity with UnifiedDocumentTable's MediumIconSet).
 */
function resolveMediumOptions(row) {
  const present = MEDIUM_OPTIONS.filter(
    (option) => row.mediumPresence?.[option.medium] || row.medium === option.medium,
  );

  return present.length
    ? present
    : [{ medium: row.medium, label: row.mediumLabel || 'Sin medio' }];
}

function resolveMediumLabel(row, options) {
  return row.mediumLabel || options.map((option) => option.label).join(' y ');
}

/**
 * Editing acts on the group's digital entries, so it needs one entry that is
 * actually editable — a manager alone is not enough. Synthetic legal-form rows
 * describe a requirement rather than a stored document and are never editable.
 */
function canEditRow(row, canManage) {
  if (!canManage || row.isPreviewRow) return false;
  return (row.entries || []).some((entry) => entry.canEdit);
}

export function DocumentalTable({
  rows = [],
  loading = false,
  canManage = false,
  filters = {},
  vrOptions = [],
  onFilterChange,
  onRowAction,
}) {
  const mediumFilterValue = filters.mediums?.length === 1 ? filters.mediums[0] : '';
  const statusFilterValue = filters.statuses?.length === 1 ? filters.statuses[0] : '';

  return (
    <div className="min-h-[260px] overflow-x-auto rounded-xl border border-border">
        <Table className="min-w-[1180px] table-fixed">
          <TableHeader className="sticky top-0 z-10 bg-muted shadow-sm">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[27%] align-top">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Documento</div>
                  <ColumnFilterField
                    type="text"
                    icon={Search}
                    value={filters.document || ''}
                    onChange={(value) => onFilterChange?.('document', value)}
                    placeholder="Buscar..."
                  />
                </div>
              </TableHead>
              <TableHead className="w-[14%] align-top">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">VR</div>
                  <ColumnFilterField
                    type="select"
                    value={filters.vr || ''}
                    onChange={(value) => onFilterChange?.('vr', value)}
                    options={vrOptions}
                    placeholder="Todos"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[12%] align-top">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Medio</div>
                  <ColumnFilterField
                    type="select"
                    value={mediumFilterValue}
                    onChange={(value) => onFilterChange?.('mediums', value ? [value] : [])}
                    options={MEDIUM_FILTER_OPTIONS}
                    placeholder="Todos"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[14%] align-top">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fecha último documento</div>
                  <ColumnFilterField
                    type="text"
                    value={filters.date || ''}
                    onChange={(value) => onFilterChange?.('date', value)}
                    placeholder="AAAA-MM-DD"
                    aria-label="Filtrar por fecha del último documento"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[12%] align-top">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">¿Está escaneado?</div>
                  <ColumnFilterField
                    type="select"
                    value={statusFilterValue}
                    onChange={(value) => onFilterChange?.('statuses', value ? [value] : [])}
                    options={SCANNED_STATUS_FILTER_OPTIONS}
                    placeholder="Todos"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[16%] align-top" title="Folios digitales / folios físicos">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Folios digitales / físicos</div>
                  <ColumnFilterField
                    type="text"
                    value={filters.folios || ''}
                    onChange={(value) => onFilterChange?.('folios', value)}
                    placeholder="Número..."
                    inputMode="numeric"
                    aria-label="Filtrar por folios digitales o físicos"
                  />
                </div>
              </TableHead>
              <TableHead className="w-[7%] text-center align-top">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
              <TableRow key={`documental-table-skeleton-${index}`} data-testid="documental-table-skeleton-row">
                <TableCell colSpan={COLUMN_COUNT} className="py-3">
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            )) : null}

            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} className="py-8">
                  <EmptyState
                    icon="FileText"
                    message="No hay documentos registrados"
                    description="Los documentos aparecerán aquí cuando se registren entradas para este expediente."
                  />
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && rows.map((row) => (
                <TableRow key={row.id} className={cn(row.legalForm?.status === 'present' && 'bg-accent/5')}>
                  <TableCell>
                    <button
                      type="button"
                      className="block w-full rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={`Ver historial de ${row.documentName || 'documento'}`}
                      onClick={() => onRowAction?.(row, 'history')}
                    >
                      <DocumentNameCell
                        name={row.documentName}
                        code={row.documentCode}
                        legalForm={row.legalForm}
                        isPreviewRow={row.isPreviewRow}
                      />
                    </button>
                  </TableCell>
                  <TableCell className="align-middle">
                    <VrCell latestVr={row.latestVr} vrValues={[]} />
                  </TableCell>
                  <TableCell className="align-middle">
                    {(() => {
                      const mediumOptions = resolveMediumOptions(row);
                      const mediumLabel = resolveMediumLabel(row, mediumOptions);

                      return (
                        <div className="flex flex-col gap-1" title={mediumLabel}>
                          <div className="flex items-center gap-1.5">
                            {mediumOptions.map((option) => (
                              <MediumIndicator
                                key={option.medium}
                                state={MEDIUM_TO_ORIGIN_STATE[option.medium] || DOCUMENT_ORIGIN_STATE.DIGITAL}
                                label={option.label}
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                            {mediumLabel}
                          </span>
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="align-middle">
                    <span className="font-mono text-xs" title="Fecha de la última entrada que define el VR mostrado">
                      {row.latestDocumentDate || 'Sin fecha'}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">
                    <ScanStatusBadge applies={row.scanned?.applies} value={row.scanned?.value} />
                  </TableCell>
                  <TableCell className="align-middle">
                    <FolioSplitCell
                      digital={row.folios?.digital}
                      physical={row.folios?.physical}
                    />
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Consultar entradas históricas"
                        aria-label="Consultar entradas históricas"
                        onClick={() => onRowAction?.(row, 'history')}
                      >
                        <Eye aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Editar entradas digitales"
                        aria-label="Editar entradas digitales"
                        disabled={!canEditRow(row, canManage)}
                        onClick={() => onRowAction?.(row, 'edit')}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Ver evaluación documental"
                        aria-label="Ver evaluación documental"
                        onClick={() => onRowAction?.(row, 'evaluation')}
                      >
                        <ClipboardCheck aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}

export default DocumentalTable;
