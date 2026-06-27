import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icon';
import JsonDocList from '@/app/components/jsons/fun6DocsList.json';
import { Lists } from '@/app/components/jsons/lists_submit';
import { fatherValues } from '@/app/pages/user/fun_forms/utils/funChecklistRules';
import { getSimulatorOptionLabel } from './simulatorOptionLabels';
import { getVuGroupIdForCode } from './simulatorDocumentEngine';

const GROUP_ORDER = ['list_61', 'list_62', 'list_63', 'list_64', 'list_65', 'list_66', 'list_67', 'list_68', 'list_Z'];

function getGroupLabel(groupId) {
  const group = Lists[groupId];
  return group ? Object.keys(group)[0] : 'DOCUMENTOS SIN GRUPO V.U.';
}

function getDocumentLabel(code, fallbackLabel) {
  return fallbackLabel || JsonDocList[code] || `Sin etiqueta registrada para el código ${code}`;
}

function normalizeTraces(traces = []) {
  if (!Array.isArray(traces) || !traces.length) {
    return [{
      kind: 'fallback',
      reason: 'Trazabilidad no calculada para el estado actual',
      source: 'Resultado sin ruleTracesByCode',
    }];
  }

  return traces.map((trace) => ({
    kind: trace?.kind || 'selection',
    field: trace?.field || '',
    value: trace?.value || '',
    label: trace?.label || '',
    reason: trace?.reason || 'Regla evaluada sin detalle específico',
    source: trace?.source || 'funChecklistRules.js',
  }));
}

function getTraceClassName(kind) {
  if (kind === 'selection') return 'border-primary/30 bg-primary/10 text-primary';
  if (kind === 'backend-rule') return 'border-accent/40 bg-accent/10 text-foreground';
  if (kind === 'common') return 'border-border bg-muted/40 text-muted-foreground';
  if (kind === 'current-rule') return 'border-warning/30 bg-warning/10 text-foreground';
  if (kind === 'selection-mismatch') return 'border-border bg-muted/20 text-muted-foreground';
  return 'border-destructive/30 bg-destructive/10 text-foreground';
}

function TracePills({ traces, compact = false }) {
  const normalizedTraces = normalizeTraces(traces);

  return (
    <div className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {normalizedTraces.map((trace, index) => (
        <span
          key={`${trace.reason}-${index}`}
          className={`inline-flex max-w-full items-center rounded-full border px-2 ${compact ? 'py-0.5 text-[10px]' : 'py-1 text-[11px]'} font-medium leading-snug ${getTraceClassName(trace.kind)}`}
          title={trace.source}
        >
          {trace.reason}
        </span>
      ))}
    </div>
  );
}

function SourcePills({ traces }) {
  const sources = Array.from(new Set(normalizeTraces(traces).map((trace) => trace.source).filter(Boolean)));

  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((source) => (
        <span key={source} className="rounded-full border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {source}
        </span>
      ))}
    </div>
  );
}

function normalizeGroupItems(items = [], traceMap = {}) {
  return items.map((item) => {
    const code = String(item?.code ?? item);
    return {
      code,
      label: getDocumentLabel(code, item?.label),
      traces: normalizeTraces(item?.traces || traceMap[code]),
    };
  });
}

function normalizeGroupedDocuments(result) {
  const groupedDocuments = result?.groupedDocuments || {};
  const traceMap = result?.ruleTracesByCode || {};

  if (Array.isArray(groupedDocuments)) {
    return groupedDocuments.map((group) => ({
      groupId: group.groupId || 'ungrouped',
      groupLabel: group.groupLabel || getGroupLabel(group.groupId),
      items: normalizeGroupItems(group.items, traceMap),
    }));
  }

  return Object.entries(groupedDocuments)
    .map(([groupId, codes]) => ({
      groupId,
      groupLabel: getGroupLabel(groupId),
      items: normalizeGroupItems(codes, traceMap),
    }))
    .sort((firstGroup, secondGroup) => {
      const firstIndex = GROUP_ORDER.indexOf(firstGroup.groupId);
      const secondIndex = GROUP_ORDER.indexOf(secondGroup.groupId);
      return (firstIndex === -1 ? 999 : firstIndex) - (secondIndex === -1 ? 999 : secondIndex);
    });
}

function buildChecklistRow(item, result, fallbackApplies) {
  const code = String(item?.code ?? item);
  const groupId = item?.groupId || getVuGroupIdForCode(code);

  return {
    code,
    label: getDocumentLabel(code, item?.label),
    applies: typeof item?.applies === 'boolean' ? Boolean(item.applies) : fallbackApplies,
    traces: normalizeTraces(item?.traces || result?.ruleTracesByCode?.[code]),
    groupId,
    groupLabel: item?.groupLabel || (groupId ? getGroupLabel(groupId) : 'Sin grupo V.U.'),
  };
}

function normalizeChecklistRows(result) {
  const evaluatedChecklistItems = Array.isArray(result?.evaluatedChecklistItems) ? result.evaluatedChecklistItems : [];
  const checklistItems = Array.isArray(result?.checklistItems) ? result.checklistItems : [];
  const applicableCodes = new Set((result?.applicableCodes || []).map(String));

  if (evaluatedChecklistItems.length) {
    return evaluatedChecklistItems.map((item) => buildChecklistRow(item, result, applicableCodes.has(String(item.code))));
  }

  const itemsByCode = new Map(checklistItems.map((item) => [String(item.code), item]));
  const hasExplicitStatus = checklistItems.some((item) => typeof item.applies === 'boolean');

  if (hasExplicitStatus) {
    return checklistItems.map((item) => buildChecklistRow(item, result, Boolean(item.applies)));
  }

  return fatherValues.map((code) => {
    const codeKey = String(code);
    const engineItem = itemsByCode.get(codeKey);
    return buildChecklistRow({ code: codeKey, label: engineItem?.label, traces: engineItem?.traces }, result, applicableCodes.has(codeKey));
  });
}

function SelectionSummary({ summary }) {
  const rows = [
    { field: 'tipo', label: 'Tipo', value: summary.tipo, multiple: true },
    { field: 'tramite', label: 'Trámite', value: summary.tramite },
    { field: 'm_urb', label: 'Urbanización', value: summary.m_urb },
    { field: 'm_sub', label: 'Subdivisión', value: summary.m_sub },
    { field: 'm_lic', label: 'Construcción', value: summary.m_lic, multiple: true },
    { field: 'area', label: 'Área', value: summary.area },
    { field: 'cultural', label: 'BIC', value: summary.cultural },
    { field: 'usos', label: 'Usos', value: summary.usos, multiple: true },
    { field: 'vivienda', label: 'Vivienda', value: summary.vivienda },
  ];

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="sim-doc-summary-title">
      <div className="flex items-center gap-2 border-b border-border/70 bg-muted/30 px-4 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon name="ClipboardList" size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 id="sim-doc-summary-title" className="mb-0 text-sm font-semibold text-foreground">Resumen de selección</h2>
          <p className="mb-0 text-xs text-muted-foreground">Valores usados por el engine de simulación.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const values = row.multiple ? row.value : [row.value];
          const labels = values.filter(Boolean).map((value) => getSimulatorOptionLabel(row.field, value));
          return (
            <div key={row.field} className="rounded-lg border border-border bg-background/70 px-3 py-2">
              <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{row.label}</div>
              <div className="mt-1 text-sm font-medium text-foreground">{labels.length ? labels.join(', ') : 'Sin seleccionar'}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const SOURCE_META = {
  draft: { label: 'Borrador', className: 'text-bg-warning' },
  published: { label: 'Publicada', className: 'text-bg-success' },
  legacy: { label: 'Legado', className: 'text-bg-secondary' },
  error: { label: 'Error', className: 'text-bg-danger' },
};

function SourceBadge({ source }) {
  const meta = SOURCE_META[source] || SOURCE_META.legacy;
  return <span className={`badge rounded-pill ${meta.className}`}>{meta.label}</span>;
}

function StatusBanner({ status, missingMessages, warnings, error, previewSource }) {
  const statusMeta = {
    initial: {
      className: 'border-primary/30 bg-primary/10 text-foreground',
      icon: 'Info',
      title: 'Estado inicial',
      text: 'Selecciona una actuación y trámite para consultar el preview documental configurado.',
    },
    loading: {
      className: 'border-primary/30 bg-primary/10 text-foreground',
      icon: 'Loader2',
      title: 'Consultando preview',
      text: 'El simulador está consultando las reglas documentales configuradas en backend.',
    },
    partial: {
      className: 'border-warning/40 bg-warning/10 text-foreground',
      icon: 'AlertTriangle',
      title: 'Selección parcial',
      text: 'Hay datos pendientes. El resultado oficial proviene del preview backend con la selección actual.',
    },
    ready: {
      className: 'border-accent/40 bg-accent/10 text-foreground',
      icon: 'CheckCircle',
      title: 'Resultado configurado',
      text: 'La simulación usa el preview backend y no persiste cambios en expedientes.',
    },
    empty: {
      className: 'border-border bg-muted/30 text-foreground',
      icon: 'SearchX',
      title: 'Sin documentos aplicables',
      text: 'El preview backend no retornó documentos requeridos para esta combinación.',
    },
    error: {
      className: 'border-destructive/40 bg-destructive/10 text-foreground',
      icon: 'AlertCircle',
      title: 'Error de preview backend',
      text: error || 'No fue posible consultar el preview documental configurado.',
    },
  }[status] || {
    className: 'border-border bg-muted/30 text-foreground',
    icon: 'Info',
    title: 'Estado no disponible',
    text: 'No hay un estado de simulación disponible para mostrar.',
  };

  return (
    <div className={`rounded-xl border px-4 py-3 ${statusMeta.className}`} role={status === 'error' ? 'alert' : 'status'} aria-live="polite">
      <div className="flex gap-3">
        <Icon name={statusMeta.icon} size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="mb-0 text-sm font-semibold">{statusMeta.title}</p>
            <SourceBadge source={previewSource || (status === 'error' ? 'error' : 'legacy')} />
          </div>
          <p className="mb-0 text-xs leading-5">{statusMeta.text}</p>
          {missingMessages.length ? (
            <ul className="mb-0 mt-2 ps-3 text-xs leading-5">
              {missingMessages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : null}
          {warnings.length ? (
            <ul className="mb-0 mt-2 ps-3 text-xs leading-5">
              {warnings.map((warning) => <li key={warning}>{warning}</li>)}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function GroupedDocuments({
  groups,
  title = 'Documentos agrupados como V.U.',
  description = 'Cada fila muestra la regla o selección que la hace aparecer.',
  emptyText = 'No hay grupos calculados todavía. La ausencia queda visible para evitar ocultar datos legalmente relevantes.',
}) {
  const titleId = `sim-doc-groups-title-${title.replace(/\W+/g, '-').toLowerCase()}`;

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby={titleId}>
      <div className="flex flex-col gap-2 border-b border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon name="ListChecks" size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId} className="mb-0 text-sm font-semibold text-foreground">{title}</h2>
            <p className="mb-0 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <span className="badge rounded-pill text-bg-light border">{groups.length} grupo(s)</span>
      </div>

      {groups.length ? (
        <div className="grid gap-3 p-3">
          {groups.map((group) => (
            <article key={group.groupId} className="overflow-hidden rounded-xl border border-border bg-background/70">
              <div className="flex flex-col gap-1 border-b border-border/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="mb-0 text-sm font-semibold text-foreground">{group.groupLabel}</h3>
                <span className="badge rounded-pill text-bg-light border">{group.items.length} documento(s)</span>
              </div>
              <div className="divide-y divide-border/60">
                {group.items.map((item) => (
                  <div key={`${group.groupId}-${item.code}`} className="grid gap-2 px-3 py-2 text-sm sm:grid-cols-[5rem_minmax(0,1fr)]">
                    <span className="font-mono font-semibold text-foreground">{item.code}</span>
                    <div className="min-w-0 space-y-1.5">
                      <p className="mb-0 text-foreground">{item.label}</p>
                      <TracePills traces={item.traces} compact />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="p-4 text-sm text-muted-foreground">
          {emptyText}
        </div>
      )}
    </section>
  );
}

function getModalFocusableElements(container) {
  if (!container) return [];

  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selector)).filter((element) => {
    const disabled = element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
    const hidden = element.hidden || element.getAttribute('aria-hidden') === 'true';
    return !disabled && !hidden && element.offsetParent !== null;
  });
}

function ChecklistTraceModal({ open, rows, onClose, openerRef }) {
  const [showAllRows, setShowAllRows] = useState(false);
  const closeButtonRef = useRef(null);
  const modalContentRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) setShowAllRows(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = getModalFocusableElements(modalContentRef.current);
      if (!focusableElements.length) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const focusTarget = openerRef?.current || previousFocusRef.current;
      if (focusTarget instanceof HTMLElement && document.contains(focusTarget)) {
        focusTarget.focus();
      }
    };
  }, [onClose, open, openerRef]);

  const applicableRows = useMemo(() => rows.filter((row) => row.applies), [rows]);
  const visibleRows = showAllRows ? rows : applicableRows;
  const notApplicableCount = rows.length - applicableRows.length;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1065] flex items-center justify-center bg-black/50 px-4 py-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sim-doc-checklist-modal-title"
      aria-describedby="sim-doc-checklist-modal-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={modalContentRef} className="flex h-[min(90dvh,920px)] w-[min(96vw,1680px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="ClipboardCheck" size={16} aria-hidden="true" />
              </span>
              <div>
                <h2 id="sim-doc-checklist-modal-title" className="mb-0 text-base font-semibold text-foreground">Tabla de Chequeo aplicable</h2>
                <p id="sim-doc-checklist-modal-description" className="mb-0 text-xs leading-5 text-muted-foreground">
                  Vista local de requisitos, relación con la selección simulada y fuente de regla actual.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge rounded-pill text-bg-success">Aplica: {applicableRows.length}</span>
            <span className="badge rounded-pill text-bg-secondary">No aplica: {notApplicableCount}</span>
            <button ref={closeButtonRef} type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} aria-label="Cerrar tabla de Chequeo">
              <Icon name="X" size={14} aria-hidden="true" /> Cerrar
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="mb-0 text-xs leading-5 text-muted-foreground">
            Por defecto se muestran los requisitos aplicables a la actuación simulada. Activa la transparencia completa para revisar también los no aplicables.
          </p>
          <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground">
            <input
              type="checkbox"
              className="form-check-input m-0"
              checked={showAllRows}
              onChange={(event) => setShowAllRows(event.target.checked)}
            />
            Mostrar no aplica ({notApplicableCount})
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="table-responsive overflow-hidden rounded-xl border border-border">
            <table className="table table-hover mb-0 align-middle">
              <thead className="sticky top-0 z-10 bg-muted text-xs uppercase text-muted-foreground shadow-sm">
                <tr>
                  <th scope="col" className="w-[6rem]">Código</th>
                  <th scope="col" className="w-[16rem]">Grupo/Sección</th>
                  <th scope="col" className="min-w-[22rem]">Documento/Requisito</th>
                  <th scope="col" className="w-[8rem]">Estado</th>
                  <th scope="col" className="min-w-[20rem]">Relación con selección</th>
                  <th scope="col" className="min-w-[18rem]">Fuente/regla</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length ? visibleRows.map((row) => (
                  <tr key={row.code} className={row.applies ? 'bg-primary/5' : 'bg-muted/20 text-muted-foreground'}>
                    <td className="font-mono text-xs font-semibold text-foreground">{row.code}</td>
                    <td className="text-xs text-muted-foreground">{row.groupLabel}</td>
                    <td className="text-sm text-foreground">{row.label}</td>
                    <td>
                      <span className={`badge rounded-pill ${row.applies ? 'text-bg-success' : 'text-bg-secondary'}`}>{row.applies ? 'Aplica' : 'No aplica'}</span>
                    </td>
                    <td><TracePills traces={row.traces} /></td>
                    <td><SourcePills traces={row.traces} /></td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-5 text-center text-sm text-muted-foreground">
                      No hay requisitos aplicables para la selección actual. Activa “Mostrar no aplica” para revisar todas las reglas evaluadas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChecklistResults({ rows }) {
  const [modalOpen, setModalOpen] = useState(false);
  const openButtonRef = useRef(null);
  const applicableCount = rows.filter((row) => row.applies).length;
  const notApplicableCount = rows.length - applicableCount;

  return (
    <>
      <aside className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="sim-doc-checklist-title">
        <div className="border-b border-border/70 bg-muted/30 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name="ClipboardCheck" size={16} aria-hidden="true" />
              </span>
              <div>
                <h2 id="sim-doc-checklist-title" className="mb-0 text-sm font-semibold text-foreground">Requisitos de Chequeo</h2>
                <p className="mb-0 text-xs text-muted-foreground">Estado por código según el resultado del engine.</p>
              </div>
            </div>
            <button ref={openButtonRef} type="button" className="btn btn-outline-primary btn-sm shrink-0" onClick={() => setModalOpen(true)}>
              <Icon name="Table" size={14} aria-hidden="true" /> Ver tabla de Chequeo
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
            <span className="badge rounded-pill text-bg-success">Aplica: {applicableCount}</span>
            <span className="badge rounded-pill text-bg-secondary">No aplica: {notApplicableCount}</span>
          </div>
        </div>
        <div className="max-h-[min(68dvh,48rem)] overflow-auto p-3">
          <div className="grid gap-2">
            {rows.map((row) => (
              <div key={row.code} className={`rounded-lg border px-3 py-2 text-sm ${row.applies ? 'border-primary/30 bg-primary/5' : 'border-border bg-background/70'}`}>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className={`badge rounded-pill ${row.applies ? 'text-bg-success' : 'text-bg-secondary'}`}>{row.applies ? 'Aplica' : 'No aplica'}</span>
                  <span className="font-mono font-semibold text-foreground">{row.code}</span>
                </div>
                <p className="mb-2 text-xs leading-5 text-foreground">{row.label}</p>
                <TracePills traces={row.traces} compact />
              </div>
            ))}
          </div>
        </div>
      </aside>
      <ChecklistTraceModal open={modalOpen} rows={rows} onClose={() => setModalOpen(false)} openerRef={openButtonRef} />
    </>
  );
}

function HistoricalDiagnostic({ result, error }) {
  const [open, setOpen] = useState(false);
  const groups = normalizeGroupedDocuments(result);
  const checklistRows = normalizeChecklistRows(result);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="sim-doc-local-diagnostic-title">
      <div className="flex flex-col gap-3 border-b border-border/70 bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon name="History" size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 id="sim-doc-local-diagnostic-title" className="mb-0 text-sm font-semibold text-foreground">Reglas locales históricas</h2>
            <p className="mb-0 text-xs text-muted-foreground">Diagnóstico comparativo; no reemplaza el resultado oficial del preview backend.</p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm shrink-0"
          aria-expanded={open}
          onClick={() => setOpen((currentValue) => !currentValue)}
        >
          <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={14} aria-hidden="true" />
          {open ? 'Ocultar reglas locales históricas' : 'Ver reglas locales históricas'}
        </button>
      </div>

      {error ? (
        <div className="m-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground" role="status">
          {error}
        </div>
      ) : null}

      {open ? (
        <div className="grid gap-3 p-3 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.42fr)]">
          <GroupedDocuments
            groups={groups}
            title="Documentos calculados por reglas locales históricas"
            description="Salida del evaluador anterior, disponible solo para auditoría y comparación."
            emptyText="El evaluador local histórico no calculó documentos para la selección actual."
          />
          <ChecklistResults rows={checklistRows} />
        </div>
      ) : null}
    </section>
  );
}

export default function SimulatorResults({
  result,
  status,
  missingMessages = [],
  evaluationError = '',
  previewSource = 'legacy',
  localDiagnosticResult = {},
  localDiagnosticError = '',
}) {
  const resolvedStatus = evaluationError ? 'error' : status;
  const warnings = Array.isArray(result?.warnings) ? result.warnings : [];
  const summary = result?.selectionSummary || localDiagnosticResult?.selectionSummary || {};
  const groups = normalizeGroupedDocuments(result);
  const hasOfficialResult = !evaluationError && result && resolvedStatus !== 'initial' && resolvedStatus !== 'loading';

  return (
    <div className="space-y-3">
      <StatusBanner
        status={resolvedStatus}
        missingMessages={missingMessages}
        warnings={warnings}
        error={evaluationError}
        previewSource={previewSource}
      />
      <SelectionSummary summary={summary} />
      {hasOfficialResult ? (
        <GroupedDocuments
          groups={groups}
          title="Requisitos configurados por backend"
          description="Resultado oficial del endpoint document-requirements/preview para la selección simulada."
          emptyText="El preview backend respondió sin documentos requeridos para la selección actual."
        />
      ) : null}
      <HistoricalDiagnostic result={localDiagnosticResult} error={localDiagnosticError} />
    </div>
  );
}
