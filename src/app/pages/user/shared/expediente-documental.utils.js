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

function splitValue(value, separator) {
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

        relatedVentanillaEntries.forEach((ventanillaEntry) => assignedVentanillaIds.add(ventanillaEntry.id));

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
    const code = normalizeCode(entry?.documentCode || entry?.code || entry?.id_public);
    const name = normalizeText(entry?.documentName || entry?.name || entry?.description).toLowerCase();
    return code || name || 'documento-sin-nombre';
}

function normalizeDocumentEntry(entry = {}, index = 0) {
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
            latestVr: '',
            latestDateValue: 0,
            entryCount: 0,
        };

        currentGroup.entries.push(normalizedEntry);
        currentGroup.originPresence[normalizedEntry.originState] = true;

        if (normalizedEntry.vr && !currentGroup.vrValues.includes(normalizedEntry.vr)) {
            currentGroup.vrValues.push(normalizedEntry.vr);
        }

        const dateValue = getEntryDateValue(normalizedEntry);
        if (dateValue >= currentGroup.latestDateValue) {
            currentGroup.latestDateValue = dateValue;
            currentGroup.latestVr = normalizedEntry.vr || currentGroup.latestVr;
        }

        currentGroup.entryCount = currentGroup.entries.length;
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
