import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/icon';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { MissingDataBadge } from './MissingDataBadge';
import { AlarmBell } from './AlarmBell';

const VECINOS_META = {
  pendiente: { label: 'Pendiente', className: 'bg-warning bg-opacity-10 text-warning border border-warning' },
  enviada: { label: 'Notificado', className: 'bg-info bg-opacity-10 text-info border border-info' },
  respondida: { label: 'Completo', className: 'bg-success bg-opacity-10 text-success border border-success' },
};

const VALLA_META = {
  pending: { label: 'Pendiente', className: 'bg-warning bg-opacity-10 text-warning border border-warning' },
  installed: { label: 'Instalada', className: 'bg-success bg-opacity-10 text-success border border-success' },
  expired: { label: 'Vencida', className: 'bg-danger bg-opacity-10 text-danger border border-danger' },
};

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUS_META = {
  EN_TERMINO:          { label: 'En Término',          className: 'bg-success bg-opacity-10 text-success border border-success' },
  PRONTO_A_VENCER:     { label: 'Pronto a Vencer',     className: 'bg-warning bg-opacity-10 text-warning border border-warning' },
  ALERTA_VENCIMIENTO:  { label: 'Alerta Vencimiento',  className: 'bg-danger bg-opacity-10 text-danger border border-danger' },
  VENCIDO:             { label: 'Vencido',             className: 'bg-secondary bg-opacity-10 text-secondary border border-secondary' },
};

// Extrae el valor de un campo con fallback
function field(row, a, b) {
  return row[a] ?? row[b] ?? '—';
}

function getTrafficLightClass(diasRestantes) {
  if (diasRestantes == null) return '';
  if (diasRestantes > 7) return 'text-success font-weight-bold';
  if (diasRestantes >= 3 && diasRestantes <= 7) return 'text-warning font-weight-bold';
  if (diasRestantes >= 0 && diasRestantes < 3) return 'text-danger font-weight-bold';
  return 'text-secondary font-weight-bold'; // Vencido (<0)
}

// ── Definición de columnas ────────────────────────────────────────────────────
function buildColumns(onViewDetail, onOpenWorkspace, onToggleBookmark, navigate) {
  return [
    {
      id: 'bookmark',
      header: '',
      enableSorting: false,
      cell: info => {
        const row = info.row.original;
        const marked = !!row._bookmarked;
        return (
          <button
            type="button"
            className="btn btn-sm py-0 px-2 border-0"
            title={marked ? 'Quitar marca' : 'Marcar expediente'}
            onClick={(e) => { e.stopPropagation(); onToggleBookmark?.(row); }}
            data-testid={`bookmark-toggle-${row.id ?? row.fun0Id ?? ''}`}
          >
            <Icon
              name={marked ? 'star' : 'star-regular'}
              size={16}
              className={marked ? 'text-warning' : 'text-secondary'}
            />
          </button>
        );
      },
    },
    {
      id: 'radicado',
      header: 'Radicado',
      accessorFn: row => row.radicado ?? '—',
      cell: info => {
        const val = info.getValue();
        if (!val || val === '—') return <MissingDataBadge reason="fecha_radicacion" />;
        return (
          <span className="font-monospace small fw-bold text-dark">
            {val}
          </span>
        );
      },
    },
    {
      id: 'fase',
      header: 'Fase Actual',
      accessorFn: row => row.fase_label ?? '—',
      cell: info => {
        const val = info.getValue();
        if (!val || val === '—') return <MissingDataBadge reason="termino" />;
        return <span className="small text-secondary">{val}</span>;
      },
    },
    {
      id: 'estado',
      header: 'Estado',
      accessorFn: row => row.estado ?? '—',
      cell: info => {
        const val = info.getValue();
        if (!val || val === '—') return <MissingDataBadge reason="estado" />;
        return <span className="small text-secondary">{val}</span>;
      },
    },
    {
      id: 'alarma',
      header: 'Alarma',
      enableSorting: false,
      accessorFn: row => row.alarms || [],
      cell: info => {
        const alarms = info.getValue();
        const activeAlarms = alarms.filter(a => !a.attendedAt && !a.hiddenAt);
        if (activeAlarms.length === 0) return null;
        return (
          <span className="badge bg-danger rounded-pill">
            {activeAlarms.length}
          </span>
        );
      },
    },
    {
      id: 'dias_habiles_usados',
      header: ({ column }) => (
        <button
          className="d-flex align-items-center gap-1 fw-bold text-uppercase border-0 bg-transparent p-0 text-decoration-none text-body"
          onClick={() => column.toggleSorting()}
          aria-label="Ordenar por días"
        >
          Días Restantes
          <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      accessorFn: row => row.dias_habiles_limite ? row.dias_habiles_limite - (row.dias_habiles_usados ?? 0) : null,
      cell: info => {
        const diasRestantes = info.getValue();
        const row  = info.row.original;
        
        if (diasRestantes == null) return <MissingDataBadge reason="termino" />;

        return (
          <span className={`font-monospace small ${getTrafficLightClass(diasRestantes)}`}>
            {diasRestantes}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: ({ column }) => (
        <button
          className="d-flex align-items-center gap-1 fw-bold text-uppercase border-0 bg-transparent p-0 text-decoration-none text-body"
          onClick={() => column.toggleSorting()}
          aria-label="Ordenar por estado"
        >
          Semáforo
          <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      accessorFn: row => row.status ?? '—',
      cell: info => {
        const s    = info.getValue();
        const meta = STATUS_META[s];
        if (!meta) return <span className="small text-secondary">{s}</span>;
        return (
          <span
            className={`badge rounded-pill px-2 py-1 ${meta.className}`}
          >
            {meta.label}
          </span>
        );
      },
    },
    {
      id: 'solicitante',
      header: 'Solicitante',
      accessorFn: row => row.solicitante ?? '—',
      cell: info => {
        const val = info.getValue();
        if (!val || val === '—') return <MissingDataBadge reason="actor" />;
        return <span className="small text-secondary">{val}</span>;
      },
    },
    {
      id: 'vecinos_valla',
      header: 'Vecinos / Valla',
      enableSorting: false,
      accessorFn: row => ({
        vecinos:
          row.vecinos?.stateLabel ??
          row.vecinos?.state_label ??
          row.vecinos_state ??
          row.vecinosState ??
          null,
        valla: row.valla?.state ?? (row.sign ? 'installed' : 'pending'),
      }),
      cell: info => {
        const { vecinos, valla } = info.getValue();
        const vecinosKey = String(vecinos || '').trim().toLowerCase();
        const vecinosMeta = VECINOS_META[vecinosKey] || VECINOS_META.pendiente;
        const vallaKey = String(valla || '').trim().toLowerCase();
        const vallaMeta = VALLA_META[vallaKey] || VALLA_META.pending;
        
        return (
          <div className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center gap-1">
              <span className="small text-secondary" style={{ width: '55px' }}>Vecinos:</span>
              <Badge className={vecinosMeta.className}>{vecinosMeta.label}</Badge>
            </div>
            <div className="d-flex align-items-center gap-1">
              <span className="small text-secondary" style={{ width: '55px' }}>Valla:</span>
              <Badge className={vallaMeta.className}>{vallaMeta.label}</Badge>
            </div>
          </div>
        );
      },
    },
    {
      id: 'acciones',
      header: '',
      enableSorting: false,
      cell: info => {
        const row = info.row.original;
        return (
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary py-0 px-2"
              title="Abrir gestión completa"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenWorkspace?.(row);
                }}
            >
              <Icon name="folder-open" size={16} />
            </button>
          </div>
        );
      },
    },
  ];
}

// ── Ícono de ordenamiento ─────────────────────────────────────────────────────
function SortIcon({ direction }) {
  if (direction === 'asc')  return <Icon name="sort-up" size={14} className="text-primary" />;
  if (direction === 'desc') return <Icon name="sort-down" size={14} className="text-primary" />;
  return <Icon name="sort" size={14} className="text-secondary opacity-50" />;
}

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * Tabla de gestión de solicitudes con paginación server-side.
 * Recibe data, paginación y callbacks del padre (que controla el fetch).
 *
 * @param {{ data: Array, totalRows: number, page: number, pageSize: number, loading: boolean, error: string|null, search: string, onSearchChange: Function, sorting: Array, onSortingChange: Function, onPageChange: Function, onRetry: Function }} props
 */
export function FunmanageDataTable({
  data = [],
  totalRows = 0,
  page = 1,
  pageSize = 50,
  loading,
  error,
  search,
  onSearchChange,
  sorting = [],
  onSortingChange,
  onPageChange,
  onRetry,
  onViewDetail,
  onOpenWorkspace,
  onToggleBookmark,
}) {
  const navigate = useNavigate();

  const columns = useMemo(
    () => buildColumns(onViewDetail, onOpenWorkspace, onToggleBookmark, navigate),
    [onViewDetail, onOpenWorkspace, onToggleBookmark, navigate]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(totalRows / pageSize)),
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Paginación ────────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(totalRows / pageSize));
  const canPrev     = page > 1;
  const canNext     = page < totalPages;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div data-testid="data-table" className="w-100">

      {/* Barra de búsqueda + contador */}
      <div className="flex flex-wrap gap-3 mb-3 items-center justify-between">
        <div className="relative flex-grow max-w-xs">
          <Icon name="search" size={16} style={{ pointerEvents: 'none' }} />
          <input
            type="search"
            className="form-control ps-5 py-1"
            style={{ fontSize: '0.875rem' }}
            placeholder="Buscar por radicado…"
            value={search ?? ''}
            onChange={e => onSearchChange?.(e.target.value)}
            data-testid="table-search"
          />
        </div>
        <span className="text-sm text-muted-foreground" data-testid="table-total">
          {loading ? '…' : `${totalRows} solicitudes`}
        </span>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-warning d-flex align-items-center py-2 mb-3" role="alert">
          <Icon name="exclamation-triangle" size={16} className="me-2" />{error}
          <button className="btn btn-sm btn-link ms-auto" onClick={onRetry}>Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div
        className="table-responsive rounded border shadow-sm bg-white"
        style={{
          maxHeight: 'clamp(300px, calc(100vh - 340px), 900px)',
          overflowY: 'auto',
        }}
      >
        <table className="table table-hover table-sm mb-0 align-middle">
          <thead className="table-light border-bottom border-2">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className="px-3 py-2 text-secondary text-uppercase fw-bold"
                    style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', width: h.id === 'acciones' ? 64 : 'auto' }}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="border-top-0">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-secondary">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando…</span>
                  </div>
                  Cargando datos…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-secondary">
                  <Icon name="inbox" size={16} className="me-2" />
                  Sin resultados para los filtros aplicados.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="cursor-pointer"
                  data-testid={`table-row-${idx}`}
                  onClick={() => onViewDetail?.(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && totalRows > 0 && (
        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
            {' '}
            <span className="text-slate-400">({totalRows} filas totales)</span>
          </span>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canPrev || loading}
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
              data-testid="pagination-prev"
            >
              <Icon name="chevron-left" size={16} className="me-1" /> Anterior
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canNext || loading}
              onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
              data-testid="pagination-next"
            >
              Siguiente <Icon name="chevron-right" size={16} className="ms-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
