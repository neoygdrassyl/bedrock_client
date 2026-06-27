import {
    DOCUMENT_RECEPTION_MEDIUM,
    DOCUMENT_RECEPTION_MEDIUM_LABEL,
    DOCUMENT_RECEPTION_MEDIUM_OPTIONS,
    DOCUMENT_ORIGIN_LABEL,
    DOCUMENT_ORIGIN_ORDER,
    DOCUMENT_ORIGIN_STATE,
} from './expediente-documental.constants';

export {
    DOCUMENT_ORIGIN_LABEL,
    DOCUMENT_ORIGIN_ORDER,
    DOCUMENT_ORIGIN_STATE,
    DOCUMENT_RECEPTION_MEDIUM,
    DOCUMENT_RECEPTION_MEDIUM_LABEL,
    DOCUMENT_RECEPTION_MEDIUM_OPTIONS,
};

const YES_REVIEW_VALUES = new Set(['SI', 'S', '1', 'TRUE']);

export function splitValue(value, separator) {
    if (Array.isArray(value)) {
        return value;
    }

    if (value == null || value === '') {
        return [];
    }

    return String(value)
        .split(separator)
        .map((item) => item.trim());
}

function normalizeCode(value) {
    return String(value || '').trim().toUpperCase();
}

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeOriginState(value) {
    const normalizedValue = normalizeCode(value).replace(/\s+/g, '_');

    if (['FISICO', 'FÍSICO', 'PHYSICAL', 'VENTANILLA'].includes(normalizedValue)) {
        return DOCUMENT_ORIGIN_STATE.PHYSICAL;
    }

    if (['DIGITALIZADO', 'ESCANEADO', 'SCANNED'].includes(normalizedValue)) {
        return DOCUMENT_ORIGIN_STATE.SCANNED;
    }

    if (['MEDIO_DIGITAL', 'DIGITAL', 'DIGITAL_MEDIO'].includes(normalizedValue)) {
        return DOCUMENT_ORIGIN_STATE.DIGITAL;
    }

    return '';
}

function buildOriginPresence(entries = []) {
    return DOCUMENT_ORIGIN_ORDER.reduce((presence, originState) => ({
        ...presence,
        [originState]: entries.some((entry) => normalizeOriginState(entry?.originState || entry?.origin_state) === originState),
    }), {});
}

function normalizeReceptionMedium(value) {
    const normalizedValue = normalizeCode(value).replace(/[\s-]+/g, '_');

    if (['WHATSAPP', 'WSP', 'WA'].includes(normalizedValue)) {
        return DOCUMENT_RECEPTION_MEDIUM.WHATSAPP;
    }

    if (['CORREO', 'EMAIL', 'E_MAIL', 'CORREO_ELECTRONICO', 'CORREO_ELECTRÓNICO'].includes(normalizedValue)) {
        return DOCUMENT_RECEPTION_MEDIUM.EMAIL;
    }

    if (['OTRO', 'OTHER'].includes(normalizedValue)) {
        return DOCUMENT_RECEPTION_MEDIUM.OTHER;
    }

    return '';
}

function getReceptionMediumLabel(value) {
    const normalizedValue = normalizeReceptionMedium(value);
    return DOCUMENT_RECEPTION_MEDIUM_LABEL[normalizedValue] || '';
}

function toPageNumber(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function sumPages(entries) {
    const totalPages = entries.reduce((accumulator, entry) => {
        const currentPages = toPageNumber(entry?.page);
        return currentPages == null ? accumulator : accumulator + currentPages;
    }, 0);

    return totalPages > 0 ? totalPages : null;
}

function getApiBaseUrl() {
    return String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
}

function ensureInlinePreview(url) {
    if (!url) {
        return '';
    }

    const separator = url.includes('?') ? '&' : '?';
    return url.includes('inline=1') ? url : `${url}${separator}inline=1`;
}

function removeInlinePreview(url) {
    if (!url) {
        return '';
    }

    return url
        .replace(/[?&]inline=1(?=&|$)/, (match) => match.startsWith('?') ? '?' : '')
        .replace(/[?&]$/, '');
}

export function buildDocumentDownloadUrl(entry = {}) {
    entry = entry || {};

    if (entry.downloadUrl) {
        return entry.downloadUrl.startsWith('/api/')
            ? `${getApiBaseUrl()}${entry.downloadUrl.replace(/^\/api/, '')}`
            : entry.downloadUrl;
    }

    if (entry.previewUrl) {
        const url = entry.previewUrl.startsWith('/api/')
            ? `${getApiBaseUrl()}${entry.previewUrl.replace(/^\/api/, '')}`
            : entry.previewUrl;
        return removeInlinePreview(url);
    }

    if (!entry.path || !entry.filename) {
        return '';
    }

    return `${getApiBaseUrl()}/files/${entry.path}/${encodeURIComponent(entry.filename)}`;
}

export function buildDocumentPreviewUrl(entry = {}) {
    entry = entry || {};

    if (entry.previewUrl) {
        const url = entry.previewUrl.startsWith('/api/')
            ? `${getApiBaseUrl()}${entry.previewUrl.replace(/^\/api/, '')}`
            : entry.previewUrl;
        return ensureInlinePreview(url);
    }

    return ensureInlinePreview(buildDocumentDownloadUrl(entry));
}

export function normalizeVentanillaDocs(submitEntries = []) {
    if (!Array.isArray(submitEntries)) {
        return [];
    }

    return submitEntries.flatMap((submitEntry, submitIndex) => {
        const subLists = Array.isArray(submitEntry?.sub_lists) ? submitEntry.sub_lists : [];

        return subLists.flatMap((subList, subListIndex) => {
            const names = splitValue(subList?.list_name, ';');
            const categories = splitValue(subList?.list_category, ',');
            const codes = splitValue(subList?.list_code, ',');
            const pages = splitValue(subList?.list_pages, ',');
            const reviews = splitValue(subList?.list_review, ',');

            return reviews.flatMap((reviewValue, reviewIndex) => {
                if (!YES_REVIEW_VALUES.has(String(reviewValue || '').trim().toUpperCase())) {
                    return [];
                }

                const normalizedCode = normalizeCode(codes[reviewIndex]);

                return [{
                    id: `${submitEntry?.id_public || 'vr'}-${normalizedCode || reviewIndex}-${submitIndex}-${subListIndex}-${reviewIndex}`,
                    id_public: submitEntry?.id_public || '',
                    date: submitEntry?.date || '',
                    time: submitEntry?.time || '',
                    name: normalizeText(names[reviewIndex]),
                    category: normalizeText(categories[reviewIndex]),
                    code: normalizedCode,
                    page: pages[reviewIndex] || '',
                    originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
                    originLabel: DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.PHYSICAL],
                    receptionMedium: normalizeReceptionMedium(subList?.medio_recepcion || subList?.receptionMedium),
                    receptionMediumLabel: getReceptionMediumLabel(subList?.medio_recepcion || subList?.receptionMedium),
                }];
            });
        });
    });
}

export function buildUnifiedDocumentRows(digitalizedDocs = [], ventanillaDocs = []) {
    const normalizedDigitalizedDocs = Array.isArray(digitalizedDocs) ? digitalizedDocs : [];
    const normalizedVentanillaDocs = Array.isArray(ventanillaDocs) ? ventanillaDocs : normalizeVentanillaDocs(ventanillaDocs);
    const assignedVentanillaIds = new Set();

    const unifiedRows = normalizedDigitalizedDocs.map((digitalDoc, digitalIndex) => {
        const digitalCode = normalizeCode(digitalDoc?.id_public);
        const relatedVentanillaEntries = normalizedVentanillaDocs.filter((ventanillaEntry) => {
            if (assignedVentanillaIds.has(ventanillaEntry.id)) {
                return false;
            }

            return normalizeCode(ventanillaEntry.code) === digitalCode;
        });

        relatedVentanillaEntries.forEach((ventanillaEntry) => {
            assignedVentanillaIds.add(ventanillaEntry.id);
        });

        return {
            id: `digital-${digitalDoc?.id || digitalIndex}`,
            code: digitalCode,
            documentName: normalizeText(digitalDoc?.description) || normalizeText(relatedVentanillaEntries[0]?.name) || 'Documento sin nombre',
            source: relatedVentanillaEntries.length ? 'both' : 'digital',
            digitalDoc,
            ventanillaEntries: relatedVentanillaEntries,
            isDigitized: true,
            isPendingDigitization: false,
            vrValues: [normalizeText(digitalDoc?.id_replace), ...relatedVentanillaEntries.map((entry) => normalizeText(entry.id_public))]
                .filter(Boolean)
                .filter((value, index, array) => array.indexOf(value) === index),
            digitalPages: toPageNumber(digitalDoc?.pages),
            ventanillaPages: sumPages(relatedVentanillaEntries),
            digitalDate: digitalDoc?.date || '',
            ventanillaDate: relatedVentanillaEntries[0]?.date || '',
        };
    });

    normalizedVentanillaDocs.forEach((ventanillaEntry) => {
        if (assignedVentanillaIds.has(ventanillaEntry.id)) {
            return;
        }

        unifiedRows.push({
            id: `ventanilla-${ventanillaEntry.id}`,
            code: normalizeCode(ventanillaEntry.code),
            documentName: normalizeText(ventanillaEntry.name) || 'Documento sin nombre',
            source: 'ventanilla',
            digitalDoc: null,
            ventanillaEntries: [ventanillaEntry],
            isDigitized: false,
            isPendingDigitization: true,
            vrValues: [normalizeText(ventanillaEntry.id_public)].filter(Boolean),
            digitalPages: null,
            ventanillaPages: sumPages([ventanillaEntry]),
            digitalDate: '',
            ventanillaDate: ventanillaEntry.date || '',
        });
    });

    return unifiedRows;
}

export function filterUnifiedDocumentRows(rows = [], filters = {}) {
    const { source = 'all', digitization = 'all', search = '' } = filters;
    const normalizedSearch = String(search || '').trim().toLowerCase();

    return rows.filter((row) => {
        if (source !== 'all' && row.source !== source) {
            return false;
        }

        if (digitization === 'digitized' && !row.isDigitized) {
            return false;
        }

        if (digitization === 'pending' && !row.isPendingDigitization) {
            return false;
        }

        if (!normalizedSearch) {
            return true;
        }

        const searchableValue = [
            row.documentName,
            row.code,
            row.vrValues?.join(' '),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableValue.includes(normalizedSearch);
    });
}

export function summarizeUnifiedDocumentRows(rows = []) {
    return rows.reduce((summary, row) => {
        const nextSummary = { ...summary, total: summary.total + 1 };

        if (row.source === 'both') {
            nextSummary.both += 1;
        }

        if (row.source === 'digital') {
            nextSummary.digital += 1;
        }

        if (row.source === 'ventanilla') {
            nextSummary.ventanilla += 1;
        }

        if (row.isPendingDigitization) {
            nextSummary.pendingDigitization += 1;
        }

        return nextSummary;
    }, {
        total: 0,
        both: 0,
        digital: 0,
        ventanilla: 0,
        pendingDigitization: 0,
    });
}

function hasMatchingPhysicalEntry(digitalDoc, physicalEntries = []) {
    const digitalCode = normalizeCode(digitalDoc?.id_public || digitalDoc?.code || digitalDoc?.documentCode);
    const digitalName = normalizeText(digitalDoc?.description || digitalDoc?.documentName || digitalDoc?.name).toLowerCase();
    const digitalVr = normalizeText(digitalDoc?.id_replace || digitalDoc?.vr);

    return physicalEntries.some((physicalEntry) => {
        const sameVr = digitalVr && digitalVr === normalizeText(physicalEntry?.vr || physicalEntry?.id_public);
        if (!sameVr) {
            return false;
        }

        const physicalCode = normalizeCode(physicalEntry?.documentCode || physicalEntry?.code || physicalEntry?.id_public);
        if (digitalCode && physicalCode) {
            return digitalCode === physicalCode;
        }

        const physicalName = normalizeText(physicalEntry?.documentName || physicalEntry?.name || physicalEntry?.description).toLowerCase();
        return Boolean(digitalName && physicalName && digitalName === physicalName);
    });
}

export function buildDocumentEntriesFromLegacyData(digitalizedDocs = [], ventanillaDocs = []) {
    const normalizedDigitalizedDocs = Array.isArray(digitalizedDocs) ? digitalizedDocs : [];
    const normalizedVentanillaDocs = Array.isArray(ventanillaDocs) && ventanillaDocs.some((entry) => Array.isArray(entry?.sub_lists))
        ? normalizeVentanillaDocs(ventanillaDocs)
        : (Array.isArray(ventanillaDocs) ? ventanillaDocs : []);

    const physicalEntries = normalizedVentanillaDocs.map((ventanillaEntry, index) => ({
        entryId: ventanillaEntry.entryId || `sublist:${ventanillaEntry.id || index}`,
        sourceTable: 'sub_list',
        documentCode: normalizeCode(ventanillaEntry.documentCode || ventanillaEntry.code || ventanillaEntry.id_public),
        documentName: normalizeText(ventanillaEntry.documentName || ventanillaEntry.name || ventanillaEntry.description) || 'Documento sin nombre',
        vr: normalizeText(ventanillaEntry.vr || ventanillaEntry.id_public),
        date: ventanillaEntry.date || '',
        time: ventanillaEntry.time || '',
        pages: ventanillaEntry.pages ?? ventanillaEntry.page ?? '',
        originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
        originLabel: DOCUMENT_ORIGIN_LABEL[DOCUMENT_ORIGIN_STATE.PHYSICAL],
        receptionMedium: normalizeReceptionMedium(ventanillaEntry.receptionMedium || ventanillaEntry.medio_recepcion || ventanillaEntry.reception_medium),
        receptionMediumLabel: getReceptionMediumLabel(ventanillaEntry.receptionMedium || ventanillaEntry.medio_recepcion || ventanillaEntry.reception_medium),
        canPreview: false,
        canEdit: false,
        canDelete: false,
        evaluationSummary: ventanillaEntry.evaluationSummary || { status: null, source: null },
        sourceId: ventanillaEntry.sourceId || ventanillaEntry.id || null,
        raw: ventanillaEntry,
    }));

    const digitalEntries = normalizedDigitalizedDocs.map((digitalDoc, index) => {
        const explicitOriginState = normalizeOriginState(digitalDoc?.originState || digitalDoc?.origin_state);
        const originState = explicitOriginState
            || (hasMatchingPhysicalEntry(digitalDoc, physicalEntries) ? DOCUMENT_ORIGIN_STATE.SCANNED : DOCUMENT_ORIGIN_STATE.DIGITAL);

        return {
            entryId: digitalDoc.entryId || `fun6:${digitalDoc.id || index}`,
            sourceTable: 'fun_6',
            documentCode: normalizeCode(digitalDoc.documentCode || digitalDoc.id_public || digitalDoc.code),
            documentName: normalizeText(digitalDoc.documentName || digitalDoc.description || digitalDoc.name) || 'Documento sin nombre',
            vr: normalizeText(digitalDoc.vr || digitalDoc.id_replace),
            date: digitalDoc.date || '',
            time: digitalDoc.time || '',
            pages: digitalDoc.pages ?? digitalDoc.page ?? '',
            filename: digitalDoc.filename || '',
            path: digitalDoc.path || '',
            originState,
            originLabel: DOCUMENT_ORIGIN_LABEL[originState] || 'Sin origen',
            receptionMedium: normalizeReceptionMedium(digitalDoc.receptionMedium || digitalDoc.medio_recepcion || digitalDoc.reception_medium),
            receptionMediumLabel: getReceptionMediumLabel(digitalDoc.receptionMedium || digitalDoc.medio_recepcion || digitalDoc.reception_medium),
            canPreview: Boolean(digitalDoc.canPreview ?? (digitalDoc.filename && digitalDoc.path)),
            canEdit: Boolean(digitalDoc.canEdit ?? true),
            canDelete: Boolean(digitalDoc.canDelete ?? true),
            evaluationSummary: digitalDoc.evaluationSummary || { status: null, source: null },
            sourceId: digitalDoc.sourceId || digitalDoc.id || null,
            raw: digitalDoc,
        };
    });

    return [...digitalEntries, ...physicalEntries];
}

function getEntryDateValue(entry) {
    const rawValue = [entry?.date, entry?.time].filter(Boolean).join('T');
    const parsedValue = rawValue ? Date.parse(rawValue) : NaN;
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getDocumentGroupKey(entry) {
    if (entry?.consolidationKey) {
        return entry.consolidationKey;
    }

    const code = normalizeCode(entry?.documentCode || entry?.code || entry?.id_public);
    const name = normalizeText(entry?.documentName || entry?.name || entry?.description).toLowerCase();
    const vr = normalizeText(entry?.vr || entry?.id_replace || entry?.id_public).toLowerCase();
    return [vr, code || name || 'documento-sin-nombre'].filter(Boolean).join('|');
}

function normalizeDocumentEntry(entry = {}, index = 0) {
    if (entry?.contractVersion >= 3 && entry?.isConsolidated) {
        const sources = Array.isArray(entry.sources) ? entry.sources : [];
        const sourceOriginPresence = buildOriginPresence(sources);
        const previewSource = sources.find((source) => source.entryId === entry.summary?.previewSourceEntryId)
            || sources.find((source) => source.canPreview)
            || sources[0]
            || {};
        const editableSource = sources.find((source) => source.entryId === entry.summary?.editableSourceEntryId)
            || sources.find((source) => source.canEdit)
            || null;
        const originState = normalizeOriginState(entry.originState || previewSource.originState)
            || DOCUMENT_ORIGIN_STATE.PHYSICAL;

        return {
            ...entry,
            entryId: entry.entryId || entry.consolidationKey || `consolidated:${index}`,
            sourceTable: 'fun_document_consolidation',
            documentCode: normalizeCode(entry.documentCode || previewSource.documentCode),
            documentName: normalizeText(entry.documentName || previewSource.documentName) || 'Documento sin nombre',
            vr: normalizeText(entry.vrInfo?.label || entry.vr || previewSource.vr),
            date: entry.date || previewSource.date || '',
            time: entry.time || previewSource.time || '',
            pages: entry.summary?.foliosTotal ?? entry.pages ?? previewSource.pages ?? '',
            originState,
            originLabel: entry.originLabel || DOCUMENT_ORIGIN_LABEL[originState] || 'Sin origen',
            receptionMedium: normalizeReceptionMedium(entry.receptionMedium || previewSource.receptionMedium),
            receptionMediumLabel: entry.receptionMediumLabel || getReceptionMediumLabel(entry.receptionMedium || previewSource.receptionMedium),
            canPreview: Boolean(entry.canPreview || entry.previewUrl || previewSource.canPreview),
            canEdit: Boolean(entry.canEdit || editableSource?.canEdit),
            canDelete: Boolean(entry.canDelete || editableSource?.canDelete),
            evaluationSummary: entry.evaluationSummary || { status: null, source: null },
            previewUrl: buildDocumentPreviewUrl(entry.previewUrl ? entry : previewSource),
            downloadUrl: buildDocumentDownloadUrl(entry.downloadUrl ? entry : previewSource),
            sources,
            editableSource,
            originPresence: sourceOriginPresence,
            summary: entry.summary || {},
        };
    }

    const sourceTable = entry.sourceTable || (entry.digitalDoc ? 'fun_6' : 'sub_list');
    const originState = normalizeOriginState(entry.originState || entry.origin_state)
        || (sourceTable === 'sub_list' ? DOCUMENT_ORIGIN_STATE.PHYSICAL : DOCUMENT_ORIGIN_STATE.DIGITAL);
    const documentCode = normalizeCode(entry.documentCode || entry.code || entry.id_public);
    const documentName = normalizeText(entry.documentName || entry.name || entry.description) || 'Documento sin nombre';

    return {
        ...entry,
        entryId: entry.entryId || `${sourceTable}:${entry.id || index}`,
        sourceTable,
        documentCode,
        documentName,
        vr: normalizeText(entry.vr || entry.id_replace || entry.id_public),
        date: entry.date || '',
        time: entry.time || '',
        pages: entry.pages ?? entry.page ?? '',
        originState,
        originLabel: entry.originLabel || DOCUMENT_ORIGIN_LABEL[originState] || 'Sin origen',
        receptionMedium: normalizeReceptionMedium(entry.receptionMedium || entry.medio_recepcion || entry.reception_medium),
        receptionMediumLabel: entry.receptionMediumLabel || getReceptionMediumLabel(entry.receptionMedium || entry.medio_recepcion || entry.reception_medium),
        canPreview: Boolean(entry.canPreview ?? (entry.filename && entry.path)),
        canEdit: Boolean(entry.canEdit ?? sourceTable === 'fun_6'),
        canDelete: Boolean(entry.canDelete ?? sourceTable === 'fun_6'),
        evaluationSummary: entry.evaluationSummary || { status: null, source: null },
        previewUrl: buildDocumentPreviewUrl(entry),
        downloadUrl: buildDocumentDownloadUrl(entry),
    };
}

export function groupDocumentEntries(entries = []) {
    if (!Array.isArray(entries)) {
        return [];
    }

    const groupsByKey = new Map();

    entries.forEach((entry, index) => {
        const normalizedEntry = normalizeDocumentEntry(entry, index);
        const key = getDocumentGroupKey(normalizedEntry);
        const currentGroup = groupsByKey.get(key) || {
            id: `document-group-${key}`,
            documentCode: normalizedEntry.documentCode,
            documentName: normalizedEntry.documentName,
            entries: [],
            originPresence: DOCUMENT_ORIGIN_ORDER.reduce((presence, originState) => ({
                ...presence,
                [originState]: false,
            }), {}),
            vrValues: [],
            receptionMediumLabels: [],
            latestVr: '',
            latestDateValue: 0,
            entryCount: 0,
            summary: normalizedEntry.summary || null,
            isConsolidated: Boolean(normalizedEntry.isConsolidated),
        };

        currentGroup.entries.push(normalizedEntry);
        currentGroup.originPresence[normalizedEntry.originState] = true;
        DOCUMENT_ORIGIN_ORDER.forEach((originState) => {
            currentGroup.originPresence[originState] = Boolean(currentGroup.originPresence[originState] || normalizedEntry.originPresence?.[originState]);
        });

        if (normalizedEntry.vr && !currentGroup.vrValues.includes(normalizedEntry.vr)) {
            currentGroup.vrValues.push(normalizedEntry.vr);
        }

        if (normalizedEntry.receptionMediumLabel && !currentGroup.receptionMediumLabels.includes(normalizedEntry.receptionMediumLabel)) {
            currentGroup.receptionMediumLabels.push(normalizedEntry.receptionMediumLabel);
        }

        const dateValue = getEntryDateValue(normalizedEntry);
        if (dateValue >= currentGroup.latestDateValue) {
            currentGroup.latestDateValue = dateValue;
            currentGroup.latestVr = normalizedEntry.vr || currentGroup.latestVr;
        }

        if (!currentGroup.summary && normalizedEntry.summary) {
            currentGroup.summary = normalizedEntry.summary;
        }
        currentGroup.isConsolidated = currentGroup.isConsolidated || Boolean(normalizedEntry.isConsolidated);
        currentGroup.entryCount = currentGroup.summary?.sourceCount || currentGroup.entries.length;
        groupsByKey.set(key, currentGroup);
    });

    return Array.from(groupsByKey.values())
        .map((group) => ({
            ...group,
            entries: [...group.entries].sort((a, b) => getEntryDateValue(b) - getEntryDateValue(a)),
            latestVr: group.latestVr || group.vrValues[group.vrValues.length - 1] || '',
        }))
        .sort((a, b) => b.latestDateValue - a.latestDateValue || a.documentName.localeCompare(b.documentName));
}

export const DOCUMENT_PREVIEW_MEDIUM = {
    PHYSICAL: 'physical',
    DIGITAL: 'digital',
};

export const INTERNAL_REPORT_VR_FILTER = '__internal_report__';

export const LEGAL_FORM_FILTER = {
    ALL: 'all',
    REQUIRED: 'required',
    MISSING: 'missing',
    PRESENT: 'present',
    PENDING_SCAN: 'pending_scan',
};

export const LEGAL_FORM_SOURCE_LABELS = {
    snapshot: 'Snapshot activo',
    legacy_snapshot: 'Checklist legado',
    no_snapshot: 'Sin snapshot',
    insufficient_inputs: 'Insumos insuficientes',
};

const INTERNAL_REPORT_VR_VALUES = new Set(['eng', 'arq', 'arc', 'jur', 'law', 'est']);

export function isInternalReportVr(value) {
    return INTERNAL_REPORT_VR_VALUES.has(String(value || '').trim().toLowerCase());
}

export function getDocumentVrDisplayValue(value) {
    return isInternalReportVr(value) ? 'INFORME' : (normalizeText(value) || 'Sin VR');
}

function normalizeLegalFormStatus(value) {
    const normalizedValue = normalizeText(value).toLowerCase();

    if (normalizedValue === 'unknown_code') {
        return LEGAL_FORM_FILTER.MISSING;
    }

    if (normalizedValue === LEGAL_FORM_FILTER.MISSING
        || normalizedValue === LEGAL_FORM_FILTER.PRESENT
        || normalizedValue === LEGAL_FORM_FILTER.PENDING_SCAN) {
        return normalizedValue;
    }

    return '';
}

function getLegalFormStatusLabel(status) {
    if (status === LEGAL_FORM_FILTER.MISSING) return 'Faltante';
    if (status === LEGAL_FORM_FILTER.PRESENT) return 'Presente';
    if (status === LEGAL_FORM_FILTER.PENDING_SCAN) return 'Pendiente escaneo';
    return 'Sin estado';
}

function getLegalFormSourceMessage(source) {
    if (source === 'no_snapshot') {
        return 'Sin snapshot · Este expediente aún no tiene snapshot activo de requisitos; no se infieren todos los documentos.';
    }

    if (source === 'insufficient_inputs') {
        return 'insufficient_inputs · No hay insumos suficientes para resolver requisitos documentales.';
    }

    return '';
}

function getRequirementEvidenceCount(requirement = {}) {
    return Array.isArray(requirement?.evidence) ? requirement.evidence.length : 0;
}

function getRequirementMatchKey(requirement = {}) {
    const code = normalizeCode(requirement?.code);
    if (code) {
        return `code:${code}`;
    }

    const label = normalizeText(requirement?.label).toLowerCase();
    return label ? `label:${label}` : '';
}

function getRowMatchKeys(row = {}) {
    const keys = [];
    const code = normalizeCode(row?.documentCode);
    const label = normalizeText(row?.documentName).toLowerCase();

    if (code) {
        keys.push(`code:${code}`);
    }

    if (label) {
        keys.push(`label:${label}`);
    }

    return keys;
}

function buildLegalFormPayload(requirement = {}, source = '') {
    const status = normalizeLegalFormStatus(requirement?.status);

    return status ? {
        status,
        statusLabel: getLegalFormStatusLabel(status),
        statusReason: normalizeText(requirement?.statusReason || requirement?.reason),
        source,
        sourceLabel: LEGAL_FORM_SOURCE_LABELS[source] || source || 'Sin fuente',
        requirementCode: normalizeCode(requirement?.code),
        requirementLabel: normalizeText(requirement?.label) || 'Documento sin nombre',
        groupKey: normalizeText(requirement?.groupKey),
        evidenceCount: getRequirementEvidenceCount(requirement),
    } : null;
}

function createSyntheticLegalFormRow(requirement = {}, source = '', index = 0) {
    const legalForm = buildLegalFormPayload(requirement, source);

    if (!legalForm) {
        return null;
    }

    const isPendingScan = legalForm.status === LEGAL_FORM_FILTER.PENDING_SCAN;
    const originState = isPendingScan ? DOCUMENT_ORIGIN_STATE.PHYSICAL : DOCUMENT_ORIGIN_STATE.DIGITAL;
    const documentCode = legalForm.requirementCode;
    const documentName = legalForm.requirementLabel;
    const entryId = `legal-form:${documentCode || index}`;
    const entry = {
        entryId,
        sourceTable: 'document_requirement',
        sourceLabel: 'Legal y Debida Forma',
        documentCode,
        documentName,
        vr: '',
        date: '',
        time: '',
        pages: '',
        originState,
        originLabel: DOCUMENT_ORIGIN_LABEL[originState] || 'Sin origen',
        receptionMedium: '',
        receptionMediumLabel: '',
        canPreview: false,
        canEdit: false,
        canDelete: false,
        isPreviewRow: true,
        evaluationSummary: {
            source,
            status: legalForm.statusReason || legalForm.statusLabel,
        },
    };

    return {
        id: `legal-form-row:${documentCode || index}`,
        documentCode,
        documentName,
        entries: [entry],
        entryCount: 0,
        latestVr: '',
        vrValues: [],
        latestDocumentDate: '',
        latestDocumentTime: '',
        latestDateValue: -1 - index,
        medium: isPendingScan ? DOCUMENT_PREVIEW_MEDIUM.PHYSICAL : DOCUMENT_PREVIEW_MEDIUM.DIGITAL,
        mediumLabel: isPendingScan ? 'Físico pendiente de escaneo' : 'Sin evidencia documental',
        mediumPresence: {
            [DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]: isPendingScan,
            [DOCUMENT_PREVIEW_MEDIUM.DIGITAL]: !isPendingScan,
        },
        scanned: {
            applies: isPendingScan,
            value: false,
            count: 0,
            label: isPendingScan ? 'No' : 'No aplica',
        },
        folios: {
            digital: 0,
            physical: 0,
            total: 0,
            label: 'Digitales 0 / Físicos 0',
        },
        originPresence: {
            [DOCUMENT_ORIGIN_STATE.PHYSICAL]: isPendingScan,
            [DOCUMENT_ORIGIN_STATE.SCANNED]: false,
            [DOCUMENT_ORIGIN_STATE.DIGITAL]: !isPendingScan,
        },
        receptionMediumLabels: [],
        summary: {
            sourceCount: 0,
            requirementStatus: legalForm.status,
        },
        canPreview: false,
        canEdit: false,
        canDelete: false,
        isPreviewRow: true,
        legalForm,
    };
}

export function summarizeLegalFormRequirements(result = {}) {
    const requirements = Array.isArray(result?.requirements) ? result.requirements : [];
    const summary = result?.summary || {};
    const source = normalizeText(result?.source).toLowerCase();
    const countedRequirements = requirements.reduce((accumulator, requirement) => {
        const status = normalizeLegalFormStatus(requirement?.status);
        if (status === LEGAL_FORM_FILTER.MISSING) accumulator.missing += 1;
        if (status === LEGAL_FORM_FILTER.PRESENT) accumulator.present += 1;
        if (status === LEGAL_FORM_FILTER.PENDING_SCAN) accumulator.pendingScan += 1;
        return accumulator;
    }, { missing: 0, present: 0, pendingScan: 0 });
    const totalFromSummary = Number(summary?.totalRequirements);

    return {
        source,
        sourceLabel: LEGAL_FORM_SOURCE_LABELS[source] || source || 'Sin fuente',
        sourceMessage: getLegalFormSourceMessage(source),
        showSourceWarning: ['no_snapshot', 'insufficient_inputs'].includes(source),
        totalRequired: Number.isFinite(totalFromSummary)
            ? totalFromSummary
            : requirements.filter((requirement) => Boolean(normalizeLegalFormStatus(requirement?.status))).length,
        missing: Number.isFinite(Number(summary?.missing)) ? Number(summary.missing) : countedRequirements.missing,
        present: Number.isFinite(Number(summary?.present)) ? Number(summary.present) : countedRequirements.present,
        pendingScan: Number.isFinite(Number(summary?.pendingScan)) ? Number(summary.pendingScan) : countedRequirements.pendingScan,
    };
}

export function buildMissingDocumentsSuggestionText(result = {}) {
    const suggestedRows = Array.isArray(result?.missingDocuments) && result.missingDocuments.length
        ? result.missingDocuments
            .map((document) => normalizeText(document?.suggestedText)
                || (normalizeText(document?.label) ? `Solicitar ${normalizeText(document.label)}.` : ''))
            .filter(Boolean)
        : (Array.isArray(result?.requirements) ? result.requirements
            .filter((requirement) => [LEGAL_FORM_FILTER.MISSING, LEGAL_FORM_FILTER.PENDING_SCAN].includes(normalizeLegalFormStatus(requirement?.status)))
            .map((requirement) => {
                const label = normalizeText(requirement?.label) || normalizeCode(requirement?.code) || 'documento sin identificar';
                return normalizeLegalFormStatus(requirement?.status) === LEGAL_FORM_FILTER.PENDING_SCAN
                    ? `Digitalizar o cargar ${label}.`
                    : `Solicitar ${label}.`;
            })
            .filter(Boolean)
            : []);

    return suggestedRows.map((text, index) => `${index + 1}. ${text}`).join('\n');
}

export function decorateDocumentTableRowsWithLegalForm(rows = [], result = {}) {
    if (!Array.isArray(rows)) {
        return [];
    }

    const requirements = Array.isArray(result?.requirements) ? result.requirements : [];

    if (!requirements.length) {
        return rows.map((row) => ({
            ...row,
            isPreviewRow: Boolean(row?.isPreviewRow),
            legalForm: row?.legalForm || null,
        }));
    }

    const source = normalizeText(result?.source).toLowerCase();
    const decoratedRows = rows.map((row) => ({
        ...row,
        isPreviewRow: Boolean(row?.isPreviewRow),
        legalForm: row?.legalForm || null,
    }));
    const rowIndexesByMatchKey = new Map();

    decoratedRows.forEach((row, index) => {
        getRowMatchKeys(row).forEach((key) => {
            if (!rowIndexesByMatchKey.has(key)) {
                rowIndexesByMatchKey.set(key, []);
            }
            rowIndexesByMatchKey.get(key).push(index);
        });
    });

    const syntheticRows = [];

    requirements.forEach((requirement, index) => {
        const legalForm = buildLegalFormPayload(requirement, source);
        const matchKey = getRequirementMatchKey(requirement);
        const matchingIndexes = matchKey ? (rowIndexesByMatchKey.get(matchKey) || []) : [];

        if (matchingIndexes.length) {
            const rowIndex = matchingIndexes[0];
            decoratedRows[rowIndex] = {
                ...decoratedRows[rowIndex],
                legalForm,
            };
            return;
        }

        const syntheticRow = createSyntheticLegalFormRow(requirement, source, index);
        if (syntheticRow) {
            syntheticRows.push(syntheticRow);
        }
    });

    return [...decoratedRows, ...syntheticRows].sort((firstRow, secondRow) => {
        const firstValue = Number(firstRow?.latestDateValue || 0);
        const secondValue = Number(secondRow?.latestDateValue || 0);

        if (secondValue !== firstValue) {
            return secondValue - firstValue;
        }

        return String(firstRow?.documentName || '').localeCompare(String(secondRow?.documentName || ''), 'es', { sensitivity: 'base' });
    });
}

function normalizePreviewMedium(value) {
    return value === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL
        ? DOCUMENT_PREVIEW_MEDIUM.PHYSICAL
        : DOCUMENT_PREVIEW_MEDIUM.DIGITAL;
}

function getMediumLabel(value) {
    return normalizePreviewMedium(value) === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL ? 'Físico' : 'Digital';
}

function getDateOnly(value) {
    return String(value || '').split(/[T ]/)[0];
}

function normalizePreviewSources(entry = {}, index = 0) {
    const rawSources = Array.isArray(entry.sources)
        ? entry.sources
        : (Array.isArray(entry.entries) ? entry.entries : []);

    if (!rawSources.length) {
        return [normalizeDocumentEntry(entry, index)];
    }

    return rawSources.map((source, sourceIndex) => normalizeDocumentEntry(source, sourceIndex));
}

function getPreviewRowDateValue(row = {}) {
    const rawValue = [row.latestDocumentDate || row.date, row.latestDocumentTime || row.time].filter(Boolean).join('T');
    const parsedValue = rawValue ? Date.parse(rawValue) : NaN;
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function normalizePreviewDocumentRow(entry = {}, index = 0) {
    const medium = normalizePreviewMedium(entry.medium);
    const sources = normalizePreviewSources(entry, index);
    const scanned = entry.scanned || {};
    const folios = entry.folios || {};
    const originPresence = entry.originPresence || {
        [DOCUMENT_ORIGIN_STATE.PHYSICAL]: medium === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL,
        [DOCUMENT_ORIGIN_STATE.SCANNED]: Boolean(scanned.value),
        [DOCUMENT_ORIGIN_STATE.DIGITAL]: medium === DOCUMENT_PREVIEW_MEDIUM.DIGITAL,
    };
    const mediumPresence = {
        [DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]: Boolean(entry.mediumPresence?.[DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]
            || originPresence[DOCUMENT_ORIGIN_STATE.PHYSICAL]
            || medium === DOCUMENT_PREVIEW_MEDIUM.PHYSICAL),
        [DOCUMENT_PREVIEW_MEDIUM.DIGITAL]: Boolean(entry.mediumPresence?.[DOCUMENT_PREVIEW_MEDIUM.DIGITAL]
            || originPresence[DOCUMENT_ORIGIN_STATE.DIGITAL]
            || medium === DOCUMENT_PREVIEW_MEDIUM.DIGITAL),
    };
    const mediumLabel = entry.mediumLabel || (mediumPresence[DOCUMENT_PREVIEW_MEDIUM.PHYSICAL] && mediumPresence[DOCUMENT_PREVIEW_MEDIUM.DIGITAL]
        ? 'Físico y digital'
        : getMediumLabel(medium));

    return {
        ...entry,
        id: entry.id || entry.previewKey || `preview-document-${index}`,
        documentCode: normalizeCode(entry.documentCode || sources[0]?.documentCode),
        documentName: normalizeText(entry.documentName || sources[0]?.documentName) || 'Documento sin nombre',
        entries: sources,
        entryCount: entry.entryCount || entry.counts?.sources || sources.length,
        latestVr: normalizeText(entry.latestVr || entry.vr || sources[0]?.vr),
        vrValues: Array.isArray(entry.vrValues) ? entry.vrValues : sources.map((source) => source.vr).filter(Boolean),
        latestDocumentDate: getDateOnly(entry.latestDocumentDate || entry.date || sources[0]?.date),
        latestDocumentTime: entry.latestDocumentTime || entry.time || sources[0]?.time || '',
        latestDateValue: getPreviewRowDateValue(entry),
        medium,
        mediumLabel,
        mediumPresence,
        scanned: {
            applies: Boolean(scanned.applies),
            value: Boolean(scanned.value),
            count: Number(scanned.count || 0),
            label: scanned.label || (scanned.applies ? (scanned.value ? 'Sí' : 'No') : 'No aplica'),
        },
        folios: {
            digital: Number(folios.digital || entry.summary?.foliosDigital || 0),
            physical: Number(folios.physical || entry.summary?.foliosPhysical || 0),
            total: Number(folios.total || entry.summary?.foliosTotal || 0),
            label: folios.label || entry.summary?.foliosLabel || '',
        },
        originPresence,
        canEdit: Boolean(entry.canEdit || sources.some((source) => source.canEdit)),
        canPreview: Boolean(entry.canPreview || sources.some((source) => source.canPreview)),
        canDelete: Boolean(entry.canDelete || sources.some((source) => source.canDelete)),
    };
}

function normalizeLegacyDocumentGroup(group = {}) {
    const entries = group.entries || [];
    const originPresence = group.originPresence || {};
    const hasPhysical = Boolean(originPresence[DOCUMENT_ORIGIN_STATE.PHYSICAL] || originPresence[DOCUMENT_ORIGIN_STATE.SCANNED]);
    const hasScanned = Boolean(originPresence[DOCUMENT_ORIGIN_STATE.SCANNED]);
    const hasDigital = Boolean(originPresence[DOCUMENT_ORIGIN_STATE.DIGITAL]);
    const foliosDigital = Number(group.summary?.foliosDigital ?? group.summary?.foliosScanned ?? entries
        .filter((entry) => entry.originState === DOCUMENT_ORIGIN_STATE.SCANNED || entry.originState === DOCUMENT_ORIGIN_STATE.DIGITAL)
        .reduce((total, entry) => total + Number(entry.pages || 0), 0));
    const foliosPhysical = Number(group.summary?.foliosPhysical ?? group.summary?.foliosVr ?? entries
        .filter((entry) => entry.originState === DOCUMENT_ORIGIN_STATE.PHYSICAL)
        .reduce((total, entry) => total + Number(entry.pages || 0), 0));

    return {
        ...group,
        medium: hasPhysical ? DOCUMENT_PREVIEW_MEDIUM.PHYSICAL : DOCUMENT_PREVIEW_MEDIUM.DIGITAL,
        mediumLabel: hasPhysical && hasDigital ? 'Físico y digital' : (hasPhysical ? 'Físico' : 'Digital'),
        mediumPresence: {
            [DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]: hasPhysical,
            [DOCUMENT_PREVIEW_MEDIUM.DIGITAL]: hasDigital || !hasPhysical,
        },
        latestDocumentDate: getDateOnly(entries[0]?.date || ''),
        latestDocumentTime: entries[0]?.time || '',
        scanned: {
            applies: hasPhysical,
            value: hasScanned,
            count: hasScanned ? entries.filter((entry) => entry.originState === DOCUMENT_ORIGIN_STATE.SCANNED).length : 0,
            label: hasPhysical ? (hasScanned ? 'Sí' : 'No') : 'No aplica',
        },
        folios: {
            digital: foliosDigital,
            physical: foliosPhysical,
            total: foliosDigital + foliosPhysical,
            label: `Digitales ${foliosDigital || 0} / Físicos ${foliosPhysical || 0}`,
        },
    };
}

export function buildDocumentTableRows(entries = []) {
    if (!Array.isArray(entries)) {
        return [];
    }

    if (entries.some((entry) => entry?.isPreviewRow)) {
        return entries
            .map((entry, index) => normalizePreviewDocumentRow(entry, index))
            .sort((a, b) => b.latestDateValue - a.latestDateValue || a.documentName.localeCompare(b.documentName));
    }

    return groupDocumentEntries(entries).map(normalizeLegacyDocumentGroup);
}

export function filterDocumentTableRows(rows = [], filters = {}) {
    const documentFilter = String(filters.document || filters.search || '').trim().toLowerCase();
    const vrFilter = String(filters.vr || '').trim().toLowerCase();
    const mediumFilters = Array.isArray(filters.mediums) ? filters.mediums.filter(Boolean) : [];
    const statusFilters = Array.isArray(filters.statuses) ? filters.statuses.filter(Boolean) : [];
    const legalFormFilter = String(filters.legalForm || LEGAL_FORM_FILTER.ALL).trim().toLowerCase();

    return rows.filter((row) => {
        if (documentFilter) {
            const documentValue = [row.documentName, row.documentCode]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            if (!documentValue.includes(documentFilter)) {
                return false;
            }
        }

        if (vrFilter) {
            const vrValues = [row.latestVr, ...(row.vrValues || [])]
                .filter(Boolean)
                .map((value) => String(value));
            const vrValue = vrValues.join(' ').toLowerCase();
            const vrDisplayValue = vrValues.map(getDocumentVrDisplayValue).join(' ').toLowerCase();
            const matchesInternalReport = vrFilter === INTERNAL_REPORT_VR_FILTER.toLowerCase() && vrValues.some(isInternalReportVr);

            if (!matchesInternalReport && !vrValue.includes(vrFilter) && !vrDisplayValue.includes(vrFilter)) {
                return false;
            }
        }

        if (mediumFilters.length && !mediumFilters.some((medium) => row.mediumPresence?.[medium] || row.medium === medium)) {
            return false;
        }

        if (statusFilters.length) {
            const status = row.scanned?.applies
                ? (row.scanned?.value ? 'scanned' : 'pending_scan')
                : 'not_applicable';

            if (!statusFilters.includes(status)) {
                return false;
            }
        }

        if (legalFormFilter && legalFormFilter !== LEGAL_FORM_FILTER.ALL) {
            const rowStatus = normalizeLegalFormStatus(row?.legalForm?.status);

            if (legalFormFilter === LEGAL_FORM_FILTER.REQUIRED) {
                if (!rowStatus) {
                    return false;
                }
            } else if (rowStatus !== legalFormFilter) {
                return false;
            }
        }

        return true;
    });
}

export function filterDocumentEntryGroups(groups = [], filters = {}) {
    const documentFilter = String(filters.document || filters.search || '').trim().toLowerCase();
    const vrFilter = String(filters.vr || '').trim().toLowerCase();
    const originFilters = Array.isArray(filters.origins) ? filters.origins.filter(Boolean) : [];

    return groups.filter((group) => {
        if (documentFilter) {
            const documentValue = [group.documentName, group.documentCode]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            if (!documentValue.includes(documentFilter)) {
                return false;
            }
        }

        if (vrFilter) {
            const vrValue = [group.latestVr, ...(group.vrValues || [])]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            if (!vrValue.includes(vrFilter)) {
                return false;
            }
        }

        if (originFilters.length && !originFilters.some((originState) => group.originPresence?.[originState])) {
            return false;
        }

        return true;
    });
}
