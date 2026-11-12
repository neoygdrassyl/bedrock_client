import { useCallback, useEffect, useMemo, useState } from 'react';
import RECORD_ARC from '../record_arc';
import SubdivisionQgisService from '../../api/subdivision_qgis.service.js';
import SubdivisionArchitectureCriteria from './SubdivisionArchitectureCriteria.jsx';

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
  if (approval === 'approved') return { text: 'Aprobado por Dovela', className: 'bg-accent/15 ew-text-success border-accent/30' };
  if (approval === 'rejected') return { text: 'Rechazado por Dovela', className: 'bg-destructive/10 ew-text-danger border-destructive/30' };
  return { text: 'Pendiente de aprobación', className: 'bg-warning/15 ew-text-warning border-warning/40' };
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
    <section className="ew-card" data-testid="subdivision-qgis-panel">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="ew-card__title">
            Datos QGIS recibidos
          </h2>
          <p className="text-sm font-medium text-foreground">Snapshot topográfico de subdivisión</p>
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
        <div className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Cargando snapshot QGIS…</div>
      ) : error && !importRecord ? (
        <div role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm ew-text-danger">{error}</div>
      ) : !importRecord ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          Aún no hay envíos QGIS asociados al expediente {idPublic || 'actual'}.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {error ? (
            <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm ew-text-danger">
              {error}
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-card p-3 text-sm text-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">Import QGIS #{importRecord.id}</span>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.text}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-muted/50 px-2 py-1 ew-text-info">Versión importada: {importVersion}</span>
              <span className="rounded-full border border-border bg-muted/50 px-2 py-1 text-foreground">Vista actual: {requestedVersion}</span>
              <span className="rounded-full border border-border bg-card px-2 py-1 ew-text-info">{summary.points_count ?? pointRows.length} puntos</span>
              <span className="rounded-full border border-border bg-card px-2 py-1 ew-text-info">{summary.lots_count ?? 0} predios</span>
              {latest?.usedVersionFallback ? (
                <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-1 ew-text-warning">Mostrando import de versión 1 porque la vista actual no tiene envío QGIS</span>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(420px,1fr)_minmax(360px,0.95fr)]">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Tabla de nube de puntos</h3>
                  <p className="text-xs text-muted-foreground">Coordenadas recibidas desde el plugin QGIS.</p>
                </div>
                <span className="rounded-full border border-border bg-muted/50 px-2 py-1 text-xs font-semibold ew-text-info">{pointRows.length} puntos</span>
              </div>

              {pointRows.length ? (
                <div className="max-h-[420px] overflow-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border text-xs">
                    <thead className="sticky top-0 bg-muted/50 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Punto</th>
                        <th className="px-3 py-2 text-right font-semibold">Este / X</th>
                        <th className="px-3 py-2 text-right font-semibold">Norte / Y</th>
                        <th className="px-3 py-2 text-left font-semibold">Lote / origen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {pointRows.map((point, index) => (
                        <tr key={point.id || point.label || `${point.x}-${point.y}-${point.source_row_id || point.source_layer || 'point'}`} className="hover:bg-muted/40">
                          <td className="whitespace-nowrap px-3 py-2 font-medium text-foreground">{point.label || point.id || `P${index + 1}`}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground">{Number(point.x).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-foreground">{Number(point.y).toLocaleString('es-CO', { maximumFractionDigits: 3 })}</td>
                          <td className="px-3 py-2 text-muted-foreground">{point.source_row_id || point.source_layer || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">El último envío no contiene puntos.</div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Gráfico de previsualización</h3>
                  <p className="text-xs text-muted-foreground">Imagen generada desde la pestaña Vista Previa del plugin.</p>
                </div>
                <span className="rounded-full border border-border bg-muted/50 px-2 py-1 text-xs font-semibold ew-text-info">{summary.preview_images_count ?? 0} preview</span>
              </div>

              {preview && previewSrc ? (
                <figure>
                  <img className="max-h-[420px] w-full rounded-lg border border-border bg-card object-contain" src={previewSrc} alt={preview.title || 'Previsualización QGIS'} />
                  <figcaption className="mt-2 text-xs text-muted-foreground">{preview.title || 'Previsualización QGIS'}</figcaption>
                </figure>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/50 text-center text-sm text-muted-foreground">
                  El último envío no incluye imagen de previsualización. Vuelva a enviar desde la versión actualizada del plugin.
                </div>
              )}
            </div>
          </div>

          {Array.isArray(importRecord.warnings) && importRecord.warnings.length ? (
            <div className="rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm ew-text-warning">
              <p className="mb-2 font-semibold">Advertencias del envío</p>
              <ul className="list-disc space-y-1 pl-5">
                {importRecord.warnings.map((warning) => (
                  <li key={warning.id || warning.code || warning.message || JSON.stringify(warning)}>{warning.message || warning.code}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {isPending ? (
            <div className="ew-actions">
              <button type="button" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60" onClick={approve} disabled={Boolean(actionLoading)}>
                {actionLoading === 'approve' ? 'Aprobando…' : `Aprobar import #${importRecord.id} · v${importVersion}`}
              </button>
              <button type="button" className="rounded-lg border border-destructive/40 bg-background px-3 py-2 text-sm font-semibold ew-text-danger hover:bg-destructive/5 disabled:opacity-60" onClick={reject} disabled={Boolean(actionLoading)}>
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

      <SubdivisionArchitectureCriteria
        currentId={props.currentId}
        currentVersion={currentVersion}
        expediente={expediente}
        canManage={props.canManage !== false}
      />

      <RECORD_ARC {...props} hideStructuralBinnacle />
    </div>
  );
}
