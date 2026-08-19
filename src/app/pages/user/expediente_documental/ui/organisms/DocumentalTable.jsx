import { Eye, MoreHorizontal, Scale, Search } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DOCUMENT_ORIGIN_STATE } from '../../../shared/expediente-documental.constants';
import { DOCUMENT_PREVIEW_MEDIUM } from '../../../shared/expediente-documental.utils';
import { MediumIndicator } from '../atoms/MediumIndicator';
import { ScanStatusBadge } from '../atoms/ScanStatusBadge';
import { DocumentNameCell } from '../molecules/DocumentNameCell';
import { VrCell } from '../molecules/VrCell';
import { DigitalSeatsCell } from '../molecules/DigitalSeatsCell';
import { ColumnFilterField } from '../molecules/ColumnFilterField';
import { getDocumentSeatCount } from '../../documentalViewModel';

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

function resolveMediumState(row) {
  return MEDIUM_TO_ORIGIN_STATE[row.medium] || DOCUMENT_ORIGIN_STATE.DIGITAL;
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
              <TableHead className="w-[16%] align-top" title="Folios digitales / asientos documentales">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Folios digitales / asientos</div>
                  <ColumnFilterField
                    type="text"
                    value={filters.folios || ''}
                    onChange={(value) => onFilterChange?.('folios', value)}
                    placeholder="Número..."
                    inputMode="numeric"
                    aria-label="Filtrar por folios digitales o asientos"
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
                    <div className="flex items-center gap-2">
                      <MediumIndicator state={resolveMediumState(row)} />
                      <span className="text-xs font-medium text-foreground">
                        {row.medium === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL ? 'Físico' : 'Digital'}
                      </span>
                    </div>
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
                    <DigitalSeatsCell
                      digital={row.folios?.digital}
                      seats={getDocumentSeatCount(row)}
                    />
                  </TableCell>
                  <TableCell className="align-middle">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Abrir acciones de ${row.documentName || 'documento'}`}
                          >
                            <MoreHorizontal aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => onRowAction?.(row, 'history')}>
                            <Eye aria-hidden="true" />
                            Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={!canManage}
                            onSelect={() => onRowAction?.(row, 'legal-form')}
                          >
                            <Scale aria-hidden="true" />
                            Editar LyF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
