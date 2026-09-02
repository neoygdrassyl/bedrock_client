import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icon';
import RECORD_ARC from '../record_arc';
import SubdivisionQgisService from '../../../../services/subdivision_qgis.service.js';

function formatArea(value) {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return `${number.toLocaleString('es-CO', { maximumFractionDigits: 2 })} m²`;
}

function getPublicId(expediente, props = {}) {
  return expediente?.id_public || expediente?.radicado || expediente?.idPublic || props.id_public || props.currentPublic || null;
}

function statusLabel(importRecord) {
  const approval = importRecord?.approval_status;
  if (approval === 'approved') return { text: 'Aprobado por Dovela', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  if (approval === 'rejected') return { text: 'Rechazado por Dovela', className: 'bg-rose-100 text-rose-800 border-rose-200' };
  return { text: 'Pendiente de aprobación', className: 'bg-amber-100 text-amber-800 border-amber-200' };
}

function getSafePreviewSrc(item) {
  const dataUrl = String(item?.data_url || '').trim();
  if (/^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=\r\n]+$/i.test(dataUrl)) return dataUrl;
  return null;
}

function findPreviewImage(payload) {
  const visualizations = Array.isArray(payload?.visualizations) ? payload.visualizations : [];
  return visualizations.find((item) => item?.type === 'image' && getSafePreviewSrc(item)) || null;
}

export function SubdivisionQgisImportPanel({ idPublic, version }) {
  const [loading, setLoading] = useState(Boolean(idPublic));
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [latest, setLatest] = useState(null);

  const loadLatest = useCallback(async () => {
    if (!idPublic) {
      setLatest(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const requestedVersion = version || 1;
      const response = await SubdivisionQgisService.getLatestImport(idPublic, requestedVersion);
      const data = response?.data ?? null;
      if (!data?.import && Number(requestedVersion) !== 1) {
        const fallbackResponse = await SubdivisionQgisService.getLatestImport(idPublic, 1);
        setLatest({ ...(fallbackResponse?.data ?? data), requestedVersion, importVersion: 1, usedVersionFallback: Boolean(fallbackResponse?.data?.import) });
        return;
      }
      setLatest({ ...data, requestedVersion, importVersion: requestedVersion, usedVersionFallback: false });
    } catch (requestError) {
      setLatest(null);
      setError(requestError?.response?.data?.message || 'No fue posible cargar los datos QGIS del expediente.');
    } finally {
      setLoading(false);
    }
  }, [idPublic, version]);

  useEffect(() => {
    loadLatest();
  }, [loadLatest]);

  const importRecord = latest?.import || null;
  const payload = latest?.payload || null;
  const pointRows = useMemo(() => (Array.isArray(payload?.points) ? payload.points : []), [payload]);
  const summary = importRecord?.summary || {};
  const preview = findPreviewImage(payload);
  const previewSrc = getSafePreviewSrc(preview);
  const status = statusLabel(importRecord);
  const isPending = importRecord && importRecord.approval_status !== 'approved' && importRecord.approval_status !== 'rejected';
  const importVersion = latest?.importVersion || version || 1;
  const requestedVersion = latest?.requestedVersion || version || 1;

  const approve = useCallback(async () => {
    if (!importRecord?.id) return;
    setActionLoading('approve');
    setError('');
    try {
      await SubdivisionQgisService.approveImport(importRecord.id, { notes: 'Aprobado desde submódulo de arquitectura.' });
      await loadLatest();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'No fue posible aprobar el envío QGIS.');
    } finally {
      setActionLoading(null);
    }
  }, [importRecord?.id, loadLatest]);

  const reject = useCallback(async () => {
    if (!importRecord?.id) return;
    setActionLoading('reject');
    setError('');
    try {
      await SubdivisionQgisService.rejectImport(importRecord.id, { notes: 'Rechazado desde submódulo de arquitectura.' });
      await loadLatest();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'No fue posible rechazar el envío QGIS.');
    } finally {
      setActionLoading(null);
    }
  }, [importRecord?.id, loadLatest]);

  return (
    <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm dark:border-sky-500/20 dark:bg-sky-950/20" data-testid="subdivision-qgis-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
            <Icon name="MapPinned" size={14} />
            Datos QGIS recibidos
          </div>
          <h3 className="text-base font-semibold text-foreground">Snapshot topográfico de subdivisión</h3>
          <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
            Este panel lee el último envío del plugin QGIS para revisar puntos, linderos, predios e imagen de previsualización antes de aprobarlo para uso interno de Dovela.
          </p>
        </div>
        {importRecord ? (
          <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.text}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-sky-100 bg-white/70 p-4 text-sm text-muted-foreground">Cargando snapshot QGIS…</div>
      ) : error && !importRecord ? (
        <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>
      ) : !importRecord ? (
        <div className="mt-4 rounded-xl border border-dashed border-sky-200 bg-white/70 p-4 text-sm text-muted-foreground">
          Aún no hay envíos QGIS asociados al expediente {idPublic || 'actual'}.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {error ? (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-sky-100 bg-white/85 p-3 text-sm text-slate-700 shadow-sm dark:border-sky-500/20 dark:bg-slate-950/40 dark:text-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">Import QGIS #{importRecord.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.text}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-sky-800">Versión importada: {importVersion}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">Vista actual: {requestedVersion}</span>
              <span className="rounded-full border border-sky-100 bg-white px-2 py-1 text-sky-800">{summary.points_count ?? pointRows.length} puntos</span>
              <span className="rounded-full border border-sky-100 bg-white px-2 py-1 text-sky-800">{summary.lots_count ?? 0} predios</span>
              {latest?.usedVersionFallback ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">Mostrando import de versión 1 porque la vista actual no tiene envío QGIS</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(420px,1fr)_minmax(360px,0.95fr)]">
            <div className="rounded-xl border border-sky-100 bg-white/90 p-3 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Tabla de nube de puntos</h4>
                  <p className="text-xs text-muted-foreground">Coordenadas recibidas desde el plugin QGIS.</p>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">{pointRows.length} puntos</span>
              </div>

              {pointRows.length ? (
                <div className="max-h-[420px] overflow-auto rounded-lg border border-sky-100">
                  <table className="min-w-full divide-y divide-sky-100 text-xs">
                    <thead className="sticky top-0 bg-sky-50 text-[11px] uppercase tracking-wide text-sky-800">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Punto</th>
                        <th className="px-3 py-2 text-right font-semibold">Este / X</th>
                        <th className="px-3 py-2 text-right font-semibold">Norte / Y</th>
                        <th className="px-3 py-2 text-left font-semibold">Lote / origen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {pointRows.map((point, index) => (
                        <tr key={point.id || point.label || `${point.x}-${point.y}-${point.source_row_id || point.source_layer || 'point'}`} className="hover:bg-sky-50/50">
                          <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-900">{point.label || point.id || `P${index + 1}`}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{Number(point.x).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-slate-700">{Number(point.y).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="px-3 py-2 text-slate-600">{point.source_row_id || point.source_layer || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-sky-200 bg-sky-50/40 p-4 text-sm text-muted-foreground">El último envío no contiene puntos.</div>
              )}
            </div>

            <div className="rounded-xl border border-sky-100 bg-white/90 p-3 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Gráfico de previsualización</h4>
                  <p className="text-xs text-muted-foreground">Imagen generada desde la pestaña Vista Previa del plugin.</p>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">{summary.preview_images_count ?? 0} preview</span>
              </div>

              {preview && previewSrc ? (
                <figure>
                  <img className="max-h-[420px] w-full rounded-lg border border-border bg-white object-contain" src={previewSrc} alt={preview.title || 'Previsualización QGIS'} />
                  <figcaption className="mt-2 text-xs text-muted-foreground">{preview.title || 'Previsualización QGIS'}</figcaption>
                </figure>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-sky-200 bg-sky-50/40 text-center text-sm text-muted-foreground">
                  El último envío no incluye imagen de previsualización. Vuelva a enviar desde la versión actualizada del plugin.
                </div>
              )}
            </div>
          </div>

          {Array.isArray(importRecord.warnings) && importRecord.warnings.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="mb-2 font-semibold">Advertencias del envío</p>
              <ul className="list-disc space-y-1 pl-5">
                {importRecord.warnings.map((warning) => (
                  <li key={warning.id || warning.code || warning.message || JSON.stringify(warning)}>{warning.message || warning.code}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isPending ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60" onClick={approve} disabled={Boolean(actionLoading)}>
                {actionLoading === 'approve' ? 'Aprobando…' : `Aprobar import #${importRecord.id} · v${importVersion}`}
              </button>
              <button type="button" className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-60" onClick={reject} disabled={Boolean(actionLoading)}>
                {actionLoading === 'reject' ? 'Rechazando…' : `Rechazar import #${importRecord.id} · v${importVersion}`}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

export default function SubdivisionArchitectureReport(props) {
  const { expediente, currentVersion } = props;
  const idPublic = getPublicId(expediente, props);

  return (
    <div className="space-y-4" data-testid="subdivision-architecture-report">
      <SubdivisionQgisImportPanel idPublic={idPublic} version={currentVersion} />

      <RECORD_ARC {...props} hideStructuralBinnacle />
    </div>
  );
}
