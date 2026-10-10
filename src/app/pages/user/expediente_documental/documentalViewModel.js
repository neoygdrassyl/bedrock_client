function normalizeText(value) {
  return String(value ?? '').trim();
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) || [];
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    if (value === '' || value === null || value === undefined) continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return 0;
}

export function getDocumentSeatCount(row = {}) {
  return firstFiniteNumber(
    row?.folios?.asientos,
    row?.folios?.seats,
    row?.asientos,
    row?.seats,
    row?.summary?.asientos,
    row?.summary?.seats,
    row?.entryCount,
  );
}

export function matchesDocumentalColumnFilters(row = {}, filters = {}) {
  const vrFilter = normalizeText(filters.vr).toLocaleLowerCase('es');
  const dateFilter = normalizeText(filters.date).toLocaleLowerCase('es');
  const folioFilter = normalizeText(filters.folios).toLocaleLowerCase('es');

  if (vrFilter) {
    const latestVr = normalizeText(row.latestVr).toLocaleLowerCase('es');
    const internalReportValues = new Set(['eng', 'arq', 'arc', 'jur', 'law', 'est']);
    const matchesVr = vrFilter === '__internal_report__'
      ? internalReportValues.has(latestVr)
      : latestVr === vrFilter;
    if (!matchesVr) return false;
  }

  if (dateFilter) {
    const dateValue = normalizeText(row.latestDocumentDate).toLocaleLowerCase('es');
    if (!dateValue.includes(dateFilter)) return false;
  }

  if (folioFilter) {
    const folioValue = [row?.folios?.digital ?? 0, row?.folios?.physical ?? 0]
      .map(normalizeText)
      .join(' / ')
      .toLocaleLowerCase('es');
    if (!folioValue.includes(folioFilter)) return false;
  }

  return true;
}

export function getLatestDocumentVr(rows = []) {
  const latestRow = rows.find((row) => normalizeText(row?.latestVr));
  return normalizeText(latestRow?.latestVr);
}

function getDocumentInstanceKey(row = {}) {
  const entries = Array.isArray(row?.entries) ? row.entries : [];
  const nestedSources = entries.flatMap((entry) => Array.isArray(entry?.sources) ? entry.sources : []);
  const candidates = [row, ...entries, ...nestedSources, ...entries.map((entry) => entry?.raw)].filter(Boolean);
  const owner = candidates.find((candidate) => normalizeText(
    candidate?.instance
    ?? candidate?.instanceKey
    ?? candidate?.instance_key
    ?? candidate?.documentInstanceKey
    ?? candidate?.document_instance_key
    ?? candidate?.listKey
    ?? candidate?.list_key,
  ));

  return normalizeText(
    owner?.instance
    ?? owner?.instanceKey
    ?? owner?.instance_key
    ?? owner?.documentInstanceKey
    ?? owner?.document_instance_key
    ?? owner?.listKey
    ?? owner?.list_key,
  ).toLocaleLowerCase('es');
}

function getStableDocumentKey(row = {}) {
  const entries = Array.isArray(row?.entries) ? row.entries : [];
  const explicitKey = [row, ...entries].map((item) => normalizeText(item?.documentUnitKey)).find(Boolean);
  if (explicitKey) return explicitKey;
  const code = normalizeText(row?.documentCode).toLocaleUpperCase('es');
  const name = normalizeText(row?.documentName).toLocaleLowerCase('es');
  const instanceKey = getDocumentInstanceKey(row);
  return [code || name || 'documento-sin-identificar', instanceKey].filter(Boolean).join('|');
}

function rawDocumentCode(entry = {}, parent = {}) {
  return normalizeText(entry.documentCode ?? entry.code ?? parent.documentCode ?? parent.code).toLocaleUpperCase('es');
}

function rawDocumentName(entry = {}, parent = {}) {
  return normalizeText(
    entry.documentName
    ?? entry.name
    ?? entry.description
    ?? parent.documentName
    ?? parent.name
    ?? parent.description,
  ) || 'Documento sin nombre';
}

function rawInstanceKey(entry = {}, parent = {}) {
  return normalizeText(
    entry.instance
    ?? entry.instanceKey
    ?? entry.instance_key
    ?? entry.documentInstanceKey
    ?? entry.document_instance_key
    ?? entry.listKey
    ?? entry.list_key
    ?? parent.instance
    ?? parent.instanceKey
    ?? parent.instance_key
    ?? parent.documentInstanceKey
    ?? parent.document_instance_key
    ?? parent.listKey
    ?? parent.list_key,
  ).toLocaleLowerCase('es');
}

/**
 * Expands v3 consolidated rows into their sources and gives the legacy
 * normalizer a per-VR key. This preserves distinct list instances before the
 * local merger removes VR from the final grouping key.
 */
export function prepareDocumentEntriesForStableUnits(entries = []) {
  if (!Array.isArray(entries)) return [];

  const expanded = entries.flatMap((entry, entryIndex) => {
    const sources = entry?.isConsolidated && Array.isArray(entry?.sources) && entry.sources.length
      ? entry.sources
      : [entry];

    return sources.map((source, sourceIndex) => {
      const documentCode = rawDocumentCode(source, entry);
      const documentName = rawDocumentName(source, entry);
      const documentIdentity = documentCode || documentName.toLocaleLowerCase('es');
      const vr = normalizeText(
        source?.vrIdPublic
        ?? source?.vr
        ?? source?.id_replace
        ?? entry?.vrInfo?.label
        ?? entry?.vr,
      );

      return {
        ...entry,
        ...source,
        contractVersion: 2,
        isConsolidated: false,
        documentCode,
        documentName,
        vr,
        explicitInstanceKey: rawInstanceKey(source, entry),
        documentIdentity,
        entryId: source?.entryId || entry?.entryId || `document-source:${entryIndex}:${sourceIndex}`,
        sourceTable: source?.sourceTable || entry?.sourceTable,
        date: source?.date || entry?.date || '',
        time: source?.time || entry?.time || '',
        pages: source?.pages ?? entry?.pages ?? '',
        originState: source?.originState || entry?.originState,
        canPreview: Boolean(source?.canPreview ?? entry?.canPreview),
        canEdit: Boolean(source?.canEdit ?? entry?.canEdit),
        canDelete: Boolean(source?.canDelete ?? entry?.canDelete),
        previewUrl: source?.previewUrl || entry?.previewUrl,
        downloadUrl: source?.downloadUrl || entry?.downloadUrl,
        summary: null,
        sources: undefined,
      };
    });
  });

  function sourceKind(entry) {
    const sourceTable = normalizeText(entry?.sourceTable).toLocaleLowerCase('es');
    const originState = normalizeText(entry?.originState).toLocaleUpperCase('es');
    if (sourceTable === 'sub_list'
      || ['FISICO', 'FÍSICO', 'PHYSICAL', 'VENTANILLA'].includes(originState)) return 'physical';
    if (['DIGITALIZADO', 'ESCANEADO', 'SCANNED'].includes(originState)) return 'scanned';
    return 'digital';
  }

  const ingressByVr = new Map();
  expanded.forEach((entry) => {
    const vrKey = entry.vr.toLocaleLowerCase('es');
    if (!vrKey) return;
    const current = ingressByVr.get(vrKey) || { physical: 0, fallback: 0 };
    const value = getEntryDateValue(entry);
    if (value > 0) {
      if (sourceKind(entry) === 'physical') {
        current.physical = Math.max(current.physical, value);
      }
      current.fallback = current.fallback === 0 ? value : Math.min(current.fallback, value);
    }
    ingressByVr.set(vrKey, current);
  });

  const orderedExpanded = [...expanded].sort((left, right) => (
    left.vr.localeCompare(right.vr, 'es', { numeric: true })
    || left.documentIdentity.localeCompare(right.documentIdentity, 'es', { numeric: true })
    || sourceKind(left).localeCompare(sourceKind(right), 'es')
    || String(left.entryId).localeCompare(String(right.entryId), 'es', { numeric: true })
  ));
  return orderedExpanded.map((entry) => {
    // Only an explicit list instance distinguishes repeated documents; without
    // catalogue metadata every occurrence of a document is the same unit.
    const instanceKey = entry.explicitInstanceKey || '';
    const documentUnitKey = [entry.documentIdentity, instanceKey].filter(Boolean).join('|');
    const ingress = ingressByVr.get(entry.vr.toLocaleLowerCase('es'));

    const prepared = {
      ...entry,
      instanceKey,
      documentUnitKey,
      vrIngressValue: ingress ? (ingress.physical || ingress.fallback) : 0,
      consolidationKey: [entry.vr.toLocaleLowerCase('es'), documentUnitKey].filter(Boolean).join('|'),
    };
    delete prepared.documentIdentity;
    delete prepared.explicitInstanceKey;
    return prepared;
  });
}

function getEntryDateValue(entry = {}) {
  const rawDate = [entry?.date, entry?.time].filter(Boolean).join('T');
  const parsedDate = rawDate ? Date.parse(rawDate) : NaN;
  return Number.isFinite(parsedDate) ? parsedDate : 0;
}

function getVrIngressValue(row = {}) {
  const declaredIngress = Date.parse(
    row?.vrInfo?.ingressDateTime
    ?? row?.vr_info?.ingress_date_time
    ?? '',
  );
  if (Number.isFinite(declaredIngress)) return declaredIngress;

  const entries = Array.isArray(row?.entries) ? row.entries : [];
  const sources = entries.flatMap((entry) => (
    Array.isArray(entry?.sources) && entry.sources.length ? entry.sources : [entry]
  ));
  const propagatedIngressValues = sources
    .map((entry) => Number(entry?.vrIngressValue || 0))
    .filter((value) => value > 0);
  if (propagatedIngressValues.length) return Math.max(...propagatedIngressValues);

  const physicalIngressValues = sources
    .filter((entry) => {
      const sourceTable = normalizeText(entry?.sourceTable).toLocaleLowerCase('es');
      const originState = normalizeText(entry?.originState).toLocaleUpperCase('es');
      return sourceTable === 'sub_list'
        || ['FISICO', 'FÍSICO', 'PHYSICAL', 'VENTANILLA'].includes(originState);
    })
    .map(getEntryDateValue)
    .filter((value) => value > 0);

  if (physicalIngressValues.length) return Math.max(...physicalIngressValues);
  return Number(row.latestDateValue || 0);
}

/**
 * The legacy normalizer groups by VR. The new documental workspace needs a
 * stable unit instead: documentCode plus instance/list_key when available.
 * This merger is intentionally local so the legacy table keeps its contract.
 */
export function mergeDocumentRowsByStableUnit(rows = []) {
  const rowsByKey = new Map();

  rows.forEach((row) => {
    const key = getStableDocumentKey(row);
    const current = rowsByKey.get(key);
    if (!current) {
      rowsByKey.set(key, {
        ...row,
        id: `document-unit-${key}`,
        vrIngressValue: getVrIngressValue(row),
        entries: [...(row.entries || [])],
        vrValues: Array.from(new Set([row.latestVr, ...(row.vrValues || [])].filter(Boolean))),
        receptionMediumLabels: [...(row.receptionMediumLabels || [])],
        mediumPresence: {
          physical: Boolean(row.mediumPresence?.physical || row.medium === 'physical'),
          digital: Boolean(row.mediumPresence?.digital || row.medium === 'digital'),
        },
        folios: {
          ...(row.folios || {}),
          digital: firstFiniteNumber(row?.folios?.digital),
          physical: firstFiniteNumber(row?.folios?.physical),
          asientos: getDocumentSeatCount(row),
        },
      });
      return;
    }

    const currentIngressValue = Number(current.vrIngressValue || getVrIngressValue(current));
    const rowIngressValue = getVrIngressValue(row);
    const currentIsLatest = currentIngressValue > rowIngressValue
      || (currentIngressValue === rowIngressValue
        && Number(current.latestDateValue || 0) >= Number(row.latestDateValue || 0));
    const latestRow = currentIsLatest ? current : row;
    const entries = [...(current.entries || []), ...(row.entries || [])]
      .sort((first, second) => getEntryDateValue(second) - getEntryDateValue(first));
    const latestDigitalFolios = firstFiniteNumber(latestRow?.folios?.digital);
    const latestPhysicalFolios = firstFiniteNumber(latestRow?.folios?.physical);
    const latestAsientos = getDocumentSeatCount(latestRow);

    rowsByKey.set(key, {
      ...current,
      latestVr: latestRow.latestVr || current.latestVr || row.latestVr || '',
      latestDocumentDate: latestRow.latestDocumentDate || '',
      latestDocumentTime: latestRow.latestDocumentTime || '',
      latestDateValue: Math.max(Number(current.latestDateValue || 0), Number(row.latestDateValue || 0)),
      vrIngressValue: Math.max(currentIngressValue, rowIngressValue),
      entries,
      entryCount: firstFiniteNumber(current.entryCount) + firstFiniteNumber(row.entryCount),
      vrValues: Array.from(new Set([
        ...(current.vrValues || []),
        current.latestVr,
        ...(row.vrValues || []),
        row.latestVr,
      ].filter(Boolean))),
      receptionMediumLabels: Array.from(new Set([
        ...(current.receptionMediumLabels || []),
        ...(row.receptionMediumLabels || []),
      ])),
      medium: latestRow.medium,
      mediumLabel: latestRow.mediumLabel,
      mediumPresence: {
        physical: Boolean(latestRow.mediumPresence?.physical || latestRow.medium === 'physical'),
        digital: Boolean(latestRow.mediumPresence?.digital || latestRow.medium === 'digital'),
      },
      originPresence: { ...(latestRow.originPresence || {}) },
      scanned: { ...(latestRow.scanned || {}) },
      folios: {
        digital: latestDigitalFolios,
        physical: latestPhysicalFolios,
        total: latestDigitalFolios + latestPhysicalFolios,
        asientos: latestAsientos,
        label: `Digitales ${latestDigitalFolios} / Asientos ${latestAsientos}`,
      },
      canEdit: Boolean(current.canEdit || row.canEdit),
      canPreview: Boolean(current.canPreview || row.canPreview),
      canDelete: Boolean(current.canDelete || row.canDelete),
      isConsolidated: Boolean(current.isConsolidated || row.isConsolidated),
    });
  });

  return Array.from(rowsByKey.values())
    .sort((first, second) => Number(second.vrIngressValue || 0) - Number(first.vrIngressValue || 0)
      || Number(second.latestDateValue || 0) - Number(first.latestDateValue || 0)
      || String(first.documentName || '').localeCompare(String(second.documentName || ''), 'es'));
}
