import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import ProfessionalRegistryService from '@/features/professional-registry/api/professional_registry.service';
import { SORT_OPTIONS, errorText, formatCc, formatMonths } from './professionalRegistry.utils';

const EMPTY_FILTERS = { q: '', role: '', status: '', expediente: '', minYears: '', maxYears: '', nameFlag: false, includeDeleted: false, sort: 'name' };
const SELECT_CLASS = 'h-9 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground';

function toQuery(filters, page) {
  const years = (value) => (value === '' ? '' : Math.round(Number(value) * 12));
  return {
    q: filters.q.trim(), role: filters.role, status: filters.status, expediente: filters.expediente.trim(),
    minMonths: years(filters.minYears), maxMonths: years(filters.maxYears),
    nameFlag: filters.nameFlag ? '1' : '', includeDeleted: filters.includeDeleted ? '1' : '', sort: filters.sort, page, limit: 25,
  };
}

export default function RegistryList({ onOpen, refreshToken = 0 }) {
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(25);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  useEffect(() => {
    let active = true;
    ProfessionalRegistryService.catalog().then((response) => { if (active) setRoles(response?.data?.data || []); }).catch(() => {});
    return () => { active = false; };
  }, []);

  // Only the most recent request may update the screen: a slow earlier answer must not overwrite a newer one.
  const load = useCallback(async () => {
    const request = latestRequest.current + 1;
    latestRequest.current = request;
    setLoading(true);
    setError('');
    try {
      const response = await ProfessionalRegistryService.list(toQuery(applied, page));
      if (request !== latestRequest.current) return;
      setRows(response?.data?.data || []);
      setTotal(response?.data?.total || 0);
      setLimit(response?.data?.limit || 25);
    } catch (e) {
      if (request !== latestRequest.current) return;
      setRows([]);
      setTotal(0);
      setError(errorText(e, 'No fue posible cargar los profesionales.'));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => { load(); }, [load, refreshToken]);

  const set = (field) => (event) => setDraft((current) => ({ ...current, [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const search = (event) => { event.preventDefault(); setApplied(draft); setPage(1); };
  const clear = () => { setDraft(EMPTY_FILTERS); setApplied(EMPTY_FILTERS); setPage(1); };
  const pages = Math.max(Math.ceil(total / limit), 1);

  return (
    <section aria-label="Listado de profesionales" className="space-y-3">
      <form onSubmit={search} className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Filtros">
        <div className="space-y-1 lg:col-span-2">
          <Label htmlFor="registry-filter-q">Nombre, cédula o matrícula</Label>
          <Input id="registry-filter-q" value={draft.q} onChange={set('q')} placeholder="Ej. 13439751 o MARIA PEREZ" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-role">Rol</Label>
          <select id="registry-filter-role" className={SELECT_CLASS} value={draft.role} onChange={set('role')}>
            <option value="">Todos los roles</option>
            {roles.map((role) => <option key={role.code} value={role.code}>{role.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-status">Estado</Label>
          <select id="registry-filter-status" className={SELECT_CLASS} value={draft.status} onChange={set('status')}>
            <option value="">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="PENDIENTE_REVISION">Pendiente de revisión</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-expediente">Expediente</Label>
          <Input id="registry-filter-expediente" value={draft.expediente} onChange={set('expediente')} placeholder="68001-1-26-0166" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-min">Experiencia mínima (años)</Label>
          <Input id="registry-filter-min" type="number" min="0" value={draft.minYears} onChange={set('minYears')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-max">Experiencia máxima (años)</Label>
          <Input id="registry-filter-max" type="number" min="0" value={draft.maxYears} onChange={set('maxYears')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="registry-filter-sort">Ordenar por</Label>
          <select id="registry-filter-sort" className={SELECT_CLASS} value={draft.sort} onChange={set('sort')}>
            {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2 lg:col-span-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.nameFlag} onChange={set('nameFlag')} />Con nombre mal registrado</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.includeDeleted} onChange={set('includeDeleted')} />Incluir eliminados</label>
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit"><Search className="mr-1 h-4 w-4" aria-hidden="true" />Buscar</Button>
          <Button type="button" variant="outline" onClick={clear}>Limpiar</Button>
        </div>
      </form>

      {error ? <p className="text-sm text-destructive" role="alert">{error}</p> : null}
      <div className="overflow-auto rounded-lg border border-border bg-card">
        <Table aria-label="Profesionales">
          <TableHeader>
            <TableRow>
              <TableHead>Cédula</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Expedientes</TableHead>
              <TableHead>Roles y experiencia</TableHead>
              <TableHead className="w-24"><span className="sr-only">Acciones</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Cargando…</TableCell></TableRow> : null}
            {!loading && !rows.length && !error ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No hay profesionales con esos filtros.</TableCell></TableRow> : null}
            {!loading ? rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap tabular-nums">{formatCc(row.cc)}</TableCell>
                <TableCell>
                  <span className="font-medium">{row.name}</span>
                  {row.status === 'PENDIENTE_REVISION' ? <Badge variant="secondary" className="ml-2">Pendiente de revisión</Badge> : null}
                  {row.deleted ? <Badge variant="outline" className="ml-2">Eliminado</Badge> : null}
                  {row.flagged ? <Badge variant="destructive" className="ml-2" title="Expedientes con el nombre mal registrado">{row.flagged} nombre(s) mal registrado(s)</Badge> : null}
                </TableCell>
                <TableCell className="tabular-nums">{row.projects}</TableCell>
                <TableCell>
                  <ul className="flex flex-wrap gap-1">
                    {row.roles.map((role) => (
                      <li key={role.code}><Badge variant="outline" title={role.label}>{role.label} · {role.projects} · {formatMonths(role.months)}</Badge></li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell><Button type="button" size="sm" variant="outline" onClick={() => onOpen(row.id)} aria-label={`Ver ${row.name}`}>Ver</Button></TableCell>
              </TableRow>
            )) : null}
          </TableBody>
        </Table>
      </div>
      <nav className="flex items-center justify-between text-sm" aria-label="Paginación">
        <span className="text-muted-foreground">{total} profesionales · página {page} de {pages}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Anterior</Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= pages || loading} onClick={() => setPage((current) => current + 1)}>Siguiente</Button>
        </div>
      </nav>
    </section>
  );
}
