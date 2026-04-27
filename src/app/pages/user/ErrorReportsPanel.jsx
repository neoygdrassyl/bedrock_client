import { useEffect, useMemo, useState } from 'react';
import { Bug, Copy, Download, Eye, RefreshCw, Search, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ErrorReportService from '@/app/services/error_report.service';
import { cn } from '@/lib/utils';

const STATUS_LABELS = {
  open: 'Abierto',
  reviewing: 'Aislado',
  resolved: 'Resuelto',
  ignored: 'Ignorado',
};

const STATUS_VARIANTS = {
  open: 'destructive',
  reviewing: 'secondary',
  resolved: 'default',
  ignored: 'outline',
};

function normalizeListResponse(response) {
  return {
    data: response?.data?.data || [],
    total: response?.data?.total || 0,
    page: response?.data?.page || 1,
    limit: response?.data?.limit || 25,
  };
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function getPayload(report) {
  const payload = report?.payloadJson || report?.payload_json || null;
  if (typeof payload !== 'string') return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return payload;
  }
}

function downloadJson(report) {
  const payload = getPayload(report) || report;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dovela-error-report-${report?.id || 'detalle'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyPayload(report) {
  const payload = getPayload(report) || report;
  await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-md border border-border/60 bg-card px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xs text-foreground break-words">{value || 'No disponible'}</dd>
    </div>
  );
}

export default function ErrorReportsPanel() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const stats = useMemo(() => {
    const open = reports.filter((report) => report.status === 'open').length;
    const reviewing = reports.filter((report) => report.status === 'reviewing').length;
    const automatic = reports.filter((report) => report.source && report.source !== 'manual-report' && report.source !== 'global-floating-report').length;
    return { open, reviewing, automatic };
  }, [reports]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await ErrorReportService.list({ q: query, status, limit: 50 });
      const next = normalizeListResponse(response);
      setReports(next.data);
      setTotal(next.total);
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar reportes de errores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openDetail = async (report) => {
    setSelected(report);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const response = await ErrorReportService.get(report.id);
      setSelected(response?.data?.data || report);
    } catch (err) {
      toast.error('No fue posible cargar el detalle', {
        description: err?.response?.data?.message || 'Intenta nuevamente.',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (report, nextStatus) => {
    try {
      await ErrorReportService.updateStatus(report.id, nextStatus);
      toast.success('Estado actualizado');
      fetchReports();
      if (selected?.id === report.id) setSelected((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      toast.error('No fue posible actualizar el estado', {
        description: err?.response?.data?.message || 'Intenta nuevamente.',
      });
    }
  };

  const handleCopy = async () => {
    try {
      await copyPayload(selected);
      toast.success('Payload copiado');
    } catch {
      toast.error('No fue posible copiar el payload');
    }
  };

  return (
    <div className="space-y-4">
      <div className="settings-panel__header">
        <h2>Reportes de errores</h2>
        <p>Bandeja técnica para aislar fallas capturadas por Dovela 2.0.</p>
      </div>

      <dl className="grid gap-2 sm:grid-cols-3">
        <SummaryStat label="Abiertos visibles" value={stats.open} />
        <SummaryStat label="Aislados" value={stats.reviewing} />
        <SummaryStat label="Automáticos" value={stats.automatic} />
      </dl>

      <div className="rounded-lg border border-border/70 bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="error-report-search">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="error-report-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ruta, módulo, usuario, expediente o mensaje"
                className="pl-9"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="error-report-status">Estado</Label>
            <select
              id="error-report-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              <option value="open">Abiertos</option>
              <option value="reviewing">Aislados</option>
              <option value="resolved">Resueltos</option>
              <option value="ignored">Ignorados</option>
              <option value="">Todos</option>
            </select>
          </div>
          <Button type="button" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Actualizar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 text-xs text-muted-foreground">
          <span>{loading ? 'Cargando...' : `${reports.length} de ${total} reportes`}</span>
          <Badge variant="secondary" className="rounded-full text-[10px]">Solo desarrolladores</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/40 text-left text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Estado</th>
                <th className="px-3 py-2 font-semibold">Origen</th>
                <th className="px-3 py-2 font-semibold">Módulo / ruta</th>
                <th className="px-3 py-2 font-semibold">Mensaje</th>
                <th className="px-3 py-2 font-semibold">Usuario</th>
                <th className="px-3 py-2 font-semibold">Fecha</th>
                <th className="px-3 py-2 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {reports.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No hay reportes para el filtro actual.
                  </td>
                </tr>
              ) : reports.map((report) => (
                <tr key={report.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2 align-top">
                    <Badge variant={STATUS_VARIANTS[report.status] || 'outline'}>{STATUS_LABELS[report.status] || report.status}</Badge>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-muted-foreground">{report.source || 'manual'}</td>
                  <td className="max-w-[220px] px-3 py-2 align-top">
                    <div className="font-medium text-foreground">{report.module || 'Sin módulo'}</div>
                    <div className="truncate text-xs text-muted-foreground" title={report.path}>{report.path || 'Sin ruta'}</div>
                    {report.expediente ? <div className="mt-1 font-mono text-[11px] text-primary">{report.expediente}</div> : null}
                  </td>
                  <td className="max-w-[280px] px-3 py-2 align-top text-xs text-foreground">
                    <span className="line-clamp-3">{report.message || 'Sin mensaje'}</span>
                  </td>
                  <td className="px-3 py-2 align-top text-xs text-muted-foreground">{report.userName || report.userRole || 'Sin usuario'}</td>
                  <td className="px-3 py-2 align-top text-xs text-muted-foreground">{formatDate(report.createdAt)}</td>
                  <td className="px-3 py-2 align-top text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => openDetail(report)}>
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <Bug className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>Reporte #{selected?.id}</DialogTitle>
                <DialogDescription>Detalle técnico capturado para análisis de desarrollo.</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Cargando detalle...</div>
          ) : selected ? (
            <div className="grid gap-4">
              <dl className="grid gap-2 sm:grid-cols-3">
                <DetailRow label="Estado" value={STATUS_LABELS[selected.status] || selected.status} />
                <DetailRow label="Origen" value={selected.source} />
                <DetailRow label="Severidad" value={selected.severity} />
                <DetailRow label="Módulo" value={selected.module} />
                <DetailRow label="Ruta" value={selected.path} />
                <DetailRow label="Usuario" value={selected.userName || selected.userRole} />
              </dl>

              <div className="grid gap-2">
                <Label>Mensaje</Label>
                <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm text-foreground">
                  {selected.message || 'Sin mensaje'}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Payload JSON</Label>
                <Textarea
                  readOnly
                  value={JSON.stringify(getPayload(selected) || {}, null, 2)}
                  className="min-h-[20rem] font-mono text-xs"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => selected && updateStatus(selected, 'reviewing')}>
                <ShieldAlert className="h-4 w-4" />
                Aislar
              </Button>
              <Button type="button" variant="outline" onClick={() => selected && updateStatus(selected, 'resolved')}>
                Marcar resuelto
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleCopy} disabled={!selected}>
                <Copy className="h-4 w-4" />
                Copiar JSON
              </Button>
              <Button type="button" onClick={() => selected && downloadJson(selected)} disabled={!selected}>
                <Download className="h-4 w-4" />
                Descargar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}