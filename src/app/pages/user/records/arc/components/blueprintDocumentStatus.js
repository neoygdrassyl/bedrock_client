export const BLUEPRINT_DOCUMENT_OPTIONS = [
    { value: 'physical', label: 'APORTADO FISICAMENTE' },
    { value: 'digital', label: 'APORTADO DIGITALMENTE' },
    { value: 'none', label: 'SIN DOCUMENTO' },
];

export function normalizeBlueprintDocumentState(value) {
    if (value === 'physical' || String(value) === '-1') return 'physical';
    if (value === 'digital') return 'digital';

    const legacyDocumentId = Number(value);
    if (Number.isFinite(legacyDocumentId) && legacyDocumentId > 0) return 'digital';

    return 'none';
}

export function getBlueprintDocumentLabel(value) {
    const state = normalizeBlueprintDocumentState(value);
    if (state === 'physical') return 'FISICO';
    if (state === 'digital') return 'DIGITALIZADO';
    return '';
}
