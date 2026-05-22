import {
    buildDocumentDownloadUrl,
    buildDocumentPreviewUrl,
} from '../../shared/expediente-documental.utils';

const EMPTY_ARRAY = [];

function normalizeText(value) {
    return String(value ?? '').trim();
}

function normalizeSourceValue(value) {
    return normalizeText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function isPhysicalSourceValue(value) {
    const sourceValue = normalizeSourceValue(value);
    return sourceValue.includes('physical') || sourceValue.includes('fisic') || sourceValue === 'sub_list';
}

function isDigitalSourceValue(value) {
    const sourceValue = normalizeSourceValue(value);
    return sourceValue.includes('digital') || sourceValue.includes('scanned') || sourceValue.includes('fun_6') || sourceValue.includes('fun6');
}

function detectExplicitPhysicalSource(entry = {}) {
    if (entry.isPhysical === true) return true;
    if (entry.isPhysical === false) return false;

    const sourceValues = [entry.originState, entry.origin_state, entry.sourceType, entry.sourceTable];
    for (const sourceValue of sourceValues) {
        if (!normalizeText(sourceValue)) continue;
        if (isPhysicalSourceValue(sourceValue)) return true;
        if (isDigitalSourceValue(sourceValue)) return false;
    }

    return null;
}

function detectPhysicalReceptionMedium(entry = {}) {
    return isPhysicalSourceValue(entry.receptionMedium) || isPhysicalSourceValue(entry.medium);
}

function getEvidenceVRLabel(entry = {}) {
    return normalizeText(entry.vr || entry.vrLabel || entry.vrInfo?.label || entry.id_replace || '');
}

function getUniqueVRLabels(evidence = EMPTY_ARRAY) {
    const seenLabels = new Set();

    return evidence.reduce((labels, entry) => {
        const vr = normalizeText(entry.vr);
        if (!vr || seenLabels.has(vr)) return labels;

        seenLabels.add(vr);
        return [...labels, vr];
    }, []);
}

export const REQUIREMENT_VISUAL_STATE = {
    SUCCESS: 'success',
    WARNING: 'warning',
    DESTRUCTIVE: 'destructive',
    MUTED: 'muted',
};

export function normalizeRequirementCode(code) {
    return String(code ?? '').trim();
}

export function getDocumentCode(entry = {}) {
    return normalizeRequirementCode(entry.documentCode || entry.id_public || entry.code || entry.idPublic);
}

export function normalizeEvidenceEntry(entry = {}, index = 0) {
    const code = getDocumentCode(entry);
    const explicitPhysicalSource = detectExplicitPhysicalSource(entry);
    const isPhysical = explicitPhysicalSource ?? detectPhysicalReceptionMedium(entry);
    const previewUrl = isPhysical ? '' : buildDocumentPreviewUrl(entry);
    const downloadUrl = isPhysical ? '' : buildDocumentDownloadUrl(entry);
    const canPreview = Boolean(!isPhysical && (entry.canPreview || previewUrl));

    return {
        id: String(entry.id || entry.entryId || entry.previewKey || `${code || 'entry'}-${index}`),
        code,
        name: entry.documentName || entry.name || entry.label || 'Documento sin nombre',
        vr: getEvidenceVRLabel(entry),
        date: entry.date || entry.createdAt || entry.updatedAt || '',
        pages: entry.pages || entry.folios || entry.summary?.foliosTotal || '',
        sourceType: isPhysical ? 'physical' : 'digital',
        canPreview,
        previewUrl,
        downloadUrl,
        raw: entry,
    };
}

export function getEvidenceSummary(evidence = EMPTY_ARRAY) {
    if (!evidence.length) {
        return { key: 'none', label: 'Sin evidencia registrada' };
    }

    const hasDigital = evidence.some((entry) => entry.sourceType === 'digital');
    const hasPhysical = evidence.some((entry) => entry.sourceType === 'physical');
    const hasVR = evidence.some((entry) => Boolean(normalizeText(entry.vr)));

    if (hasDigital && hasVR) return { key: 'digital-vr', label: 'Digital con VR' };
    if (hasDigital) return { key: 'digital', label: 'Digital' };
    if (hasPhysical && hasVR) return { key: 'physical-vr', label: 'Físico con VR' };
    if (hasPhysical) return { key: 'physical', label: 'Aportado físicamente' };
    return { key: 'registered', label: 'Evidencia registrada' };
}

export function getPreviewState(evidence = EMPTY_ARRAY) {
    if (evidence.some((entry) => entry.canPreview && (entry.previewUrl || entry.downloadUrl))) return 'available';
    if (evidence.some((entry) => entry.sourceType === 'physical')) return 'physical_only';
    if (evidence.length) return 'not_previewable';
    return 'not_uploaded';
}

export function detectSupersededEvaluation(evidence = EMPTY_ARRAY, selectedEntryId = '') {
    if (!selectedEntryId || evidence.length < 2) return false;
    const selectedIndex = evidence.findIndex((entry) => entry.id === selectedEntryId);
    return selectedIndex >= 0 && selectedIndex < evidence.length - 1;
}

export function buildCorrelatedRequirementRows({
    codes = EMPTY_ARRAY,
    labels = {},
    getCheckValue = () => 'sin_definir',
    isRequirementApplicable = () => false,
    unifiedEntries = EMPTY_ARRAY,
    legacyFun6Docs = EMPTY_ARRAY,
    existingEvaluationContext = {},
}) {
    const normalizedEvidence = [...unifiedEntries, ...legacyFun6Docs]
        .map(normalizeEvidenceEntry)
        .filter((entry) => entry.code);

    return codes.map((codeValue) => {
        const code = normalizeRequirementCode(codeValue);
        const evidence = normalizedEvidence
            .filter((entry) => entry.code === code)
            .sort((a, b) => String(a.date).localeCompare(String(b.date)));
        const evaluationContext = existingEvaluationContext[code] || {};
        const selectedEntryId = String(evaluationContext.entryId || '');

        return {
            section: getRequirementSection(code),
            code,
            label: labels[code] || `Requisito ${code}`,
            applicability: isRequirementApplicable(code) ? 'aplica' : 'no_aplica',
            checkValue: getCheckValue(code),
            evidence,
            evidenceSummary: getEvidenceSummary(evidence),
            relatedVRs: getUniqueVRLabels(evidence),
            selectedEvaluationEntry: selectedEntryId,
            evaluationStatus: evaluationContext.status || 'pendiente',
            supersededByNewVR: detectSupersededEvaluation(evidence, selectedEntryId),
            previewState: getPreviewState(evidence),
        };
    });
}

export function getRequirementSection(code) {
    if (/^5/.test(code)) return '5.1';
    if (/^60|^61/.test(code)) return '6.1';
    if (/^62/.test(code)) return '6.2';
    if (/^63/.test(code)) return '6.3';
    if (/^64/.test(code)) return '6.4';
    if (/^65/.test(code)) return '6.5';
    if (/^66/.test(code)) return '6.6';
    if (/^67/.test(code)) return '6.7';
    if (/^68/.test(code)) return '6.8';
    return 'Otros';
}

export function getRequirementVisualState(row = {}) {
    if (row.applicability === 'no_aplica') return REQUIREMENT_VISUAL_STATE.MUTED;
    if (row.evaluationStatus === 'no_cumple') return REQUIREMENT_VISUAL_STATE.DESTRUCTIVE;
    if (row.supersededByNewVR || row.previewState === 'not_uploaded' || row.previewState === 'physical_only') {
        return REQUIREMENT_VISUAL_STATE.WARNING;
    }
    if (row.previewState === 'available' || row.evidence?.length) return REQUIREMENT_VISUAL_STATE.SUCCESS;
    return REQUIREMENT_VISUAL_STATE.WARNING;
}
