import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import FunManageDashboardService from '../../../../services/funmanage_dashboard.service';

// ── Constantes ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const STATUS_META = {
  OPTIMAL: { label: 'Óptimo',   className: 'bg-green-100 text-green-800 border-green-200' },
  AVERAGE: { label: 'Promedio', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  LIMIT:   { label: 'En Riesgo', className: 'bg-red-100 text-red-800 border-red-200' },
};

// Extrae el valor de un campo con fallback entre dos nombres posibles
function field(row, a, b) {
  return row[a] ?? row[b] ?? '—';
}

// ── Definición de columnas ────────────────────────────────────────────────────
function buildColumns() {
  return [
    {
      id: 'radicado',
      header: 'Radicado',
      accessorFn: row => field(row, 'radicado', 'id_related'),
      cell: info => (
        <span className="font-mono text-[0.78rem] font-semibold text-slate-700">
          {info.getValue() ?? '—'}
        </span>
      ),
    },
    {
      id: 'fase',
      header: 'Fase Actual',
      accessorFn: row => field(row, 'fase', 'fase_actual'),
      cell: info => (
        <span className="text-sm text-slate-600">{info.getValue()}</span>
      ),
    },
    {
      id: 'categoria',
      header: 'Cat.',
      accessorFn: row => field(row, 'categoria', 'type'),
      cell: info => (
        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs w-7 h-7">
          {info.getValue()}
        </span>
      ),
    },
    {
      id: 'daysElapsed',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide hover:text-slate-900 transition-colors"
          onClick={() => column.toggleSorting()}
          aria-label="Ordenar por días"
        >
          Días
          <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      accessorFn: row => row.daysElapsed ?? row.dias ?? row.dias_transcurridos ?? row.x ?? 0,
      cell: info => {
        const dias = info.getValue();
        const row  = info.row.original;
        const max  = row.maxDays ?? row.max_days;
        return (
          <span className="tabular-nums text-sm font-medium">
            {dias}
            {max ? <span className="text-slate-400 font-normal"> /{max}</span> : null}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide hover:text-slate-900 transition-colors"
          onClick={() => column.toggleSorting()}
          aria-label="Ordenar por estado"
        >
          Estado
          <SortIcon direction={column.getIsSorted()} />
        </button>
      ),
      accessorFn: row => row.status ?? '—',
      cell: info => {
        const s    = info.getValue();
        const meta = STATUS_META[s];
        if (!meta) return <span className="text-xs text-slate-400">{s}</span>;
        return (
          <Badge
            variant="outline"
            className={`text-xs font-semibold px-2 py-0.5 ${meta.className}`}
          >
            {meta.label}
          </Badge>
        );
      },
    },
    {
      id: 'acciones',
      header: '',
      enableSorting: false,
      cell: info => {
        const row = info.row.original;
        const id  = row.id ?? row.fun_id;
        return (
          <div className="flex gap-2 justify-end">
            <a
              href={`/fun/${id}`}
              className="btn btn-sm btn-outline-primary py-0 px-2"
              title="Ver detalles"
              target="_self"
            >
              <i className="fas fa-eye"></i>
            </a>
          </div>
        );
      },
    },
  ];
}

// ── Ícono de ordenamiento ─────────────────────────────────────────────────────
function SortIcon({ direction }) {
  if (direction === 'asc')  return <i className="fas fa-sort-up   text-blue-500 text-[10px]"></i>;
  if (direction === 'desc') return <i className="fas fa-sort-down text-blue-500 text-[10px]"></i>;
  return <i className="fas fa-sort text-slate-300 text-[10px]"></i>;
}

// ── Hook: debounce ────────────────────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Componente principal ──────────────────────────────────────────────────────
/**
 * Tabla de gestión de solicitudes de curaduría con paginación server-side.
 *
 * @param {{ dashboardFilter: { status: string|null, phase: string|null } }} props
 */
export function FunmanageDataTable({ dashboardFilter }) {
  // ── Estado ──────────────────────────────────────────────────────────────────
  const [data,       setData]       = useState([]);
  const [totalRows,  setTotalRows]  = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [sorting,    setSorting]    = useState([]);   // [{ id, desc }]

  const debouncedSearch = useDebounce(search, 450);

  // Ref para cancelar llamadas en vuelo
  const controllerRef = useRef(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    // Cancelar llamada anterior si aún está en vuelo
    controllerRef.current?.abort();

    setLoading(true);
    setError(null);

    const sortField = sorting[0]?.id      ?? '';
    const sortOrder = sorting[0]?.desc    ? 'DESC' : 'ASC';

    FunManageDashboardService.getGrid({
      page,
      limit:  PAGE_SIZE,
      status: dashboardFilter?.status  ?? '',
      phase:  dashboardFilter?.phase   ?? '',
      search: debouncedSearch,
      sort:   sortField,
      order:  sortOrder,
    })
      .then(res => {
        const body = res.data;
        setData(Array.isArray(body.data) ? body.data : []);
        setTotalRows(typeof body.total === 'number' ? body.total : 0);
        setLoading(false);
      })
      .catch(err => {
        if (err?.code === 'ERR_CANCELED') return;
        setError('No se pudo cargar la tabla. Verifica la conexión.');
        setLoading(false);
      });
  }, [page, debouncedSearch, sorting, dashboardFilter]);

  // Cuando cambia el filtro externo, volver a página 1
  useEffect(() => {
    setPage(1);
  }, [dashboardFilter, debouncedSearch, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Tabla ────────────────────────────────────────────────────────────────────
  const columns = useMemo(() => buildColumns(), []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.max(1, Math.ceil(totalRows / PAGE_SIZE)),
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Paginación ────────────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));
  const canPrev     = page > 1;
  const canNext     = page < totalPages;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div data-testid="data-table" className="w-100">

      {/* Barra de búsqueda + contador */}
      <div className="flex flex-wrap gap-3 mb-3 items-center justify-between">
        <div className="relative flex-grow max-w-xs">
          <i
            className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            style={{ pointerEvents: 'none' }}
          ></i>
          <input
            type="search"
            className="form-control ps-5 py-1"
            style={{ fontSize: '0.875rem' }}
            placeholder="Buscar por radicado…"
            value={search}
            onChange={e => setSearch(e.target.value)}
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
          <i className="fas fa-exclamation-triangle me-2"></i>{error}
          <button className="btn btn-sm btn-link ms-auto" onClick={fetchData}>Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      <div className="table-responsive rounded border" style={{ borderColor: '#e2e8f0' }}>
        <table className="table table-sm mb-0" style={{ fontSize: '0.875rem' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    style={{ whiteSpace: 'nowrap', width: h.id === 'acciones' ? 64 : 'auto' }}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Cargando…</span>
                  </div>
                  Cargando datos…
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-4 text-muted">
                  <i className="fas fa-inbox me-2"></i>
                  Sin resultados para los filtros aplicados.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <tr
                  key={row.id}
                  style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f8fafc' }}
                  className="border-bottom"
                  data-testid={`table-row-${idx}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-3 py-2 align-middle">
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
              onClick={() => setPage(p => Math.max(1, p - 1))}
              data-testid="pagination-prev"
            >
              <i className="fas fa-chevron-left me-1"></i> Anterior
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={!canNext || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              data-testid="pagination-next"
            >
              Siguiente <i className="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
