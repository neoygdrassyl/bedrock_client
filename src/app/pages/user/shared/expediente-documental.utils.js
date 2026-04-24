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
