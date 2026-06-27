import { useCallback, useEffect, useMemo, useState } from 'react';
import IntelligentChecklist from './IntelligentChecklist';
import checklistService from '@/app/services/checklist.service';
import { normalizeChecklistResponse } from '../utils/intelligentChecklist.utils';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { fatherValues, dvCheckList } from '../utils/funChecklistRules';

export { fatherValues, dvCheckList };

function getFunPublicId(currentItem) {
    return currentItem?.id_public || currentItem?.idPublic || currentItem?.id_related || '';
}

function resolvePreviewUrl(evidence) {
    return evidence?.previewUrl
        || evidence?.preview_url
        || evidence?.metadata?.previewUrl
        || evidence?.metadata?.preview_url
        || evidence?.raw?.previewUrl
        || evidence?.raw?.preview_url
        || '';
}

function FUN_CHECKLIST_N({ currentItem, currentVersion, readOnly, requestUpdate, swaMsg, vrDocs }) {
    const [state, setState] = useState({ requirements: [], vrs: [], links: [] });
    const [loading, setLoading] = useState(false);
    const funIdPublic = getFunPublicId(currentItem);

    const loadChecklist = useCallback(async () => {
        if (!funIdPublic) {
            setState({ requirements: [], vrs: [], links: [] });
            return;
        }

        setLoading(true);
        try {
            const response = await checklistService.getIntelligentChecklist(funIdPublic, currentVersion);
            setState(normalizeChecklistResponse(response));
        } catch (error) {
            console.error(error);
            swalError({
                title: swaMsg?.generic_eror_title || 'Error',
                text: 'No fue posible cargar la lista de chequeo inteligente.',
            });
        } finally {
            setLoading(false);
        }
    }, [currentVersion, funIdPublic, swaMsg]);

    useEffect(() => {
        loadChecklist();
    }, [loadChecklist]);

    const mergedVrs = useMemo(() => {
        if (state.vrs.length) return state.vrs;
        return Array.isArray(vrDocs) ? vrDocs : [];
    }, [state.vrs, vrDocs]);

    const isRequirementApplicable = useCallback((code) => {
        const normalizedCode = `${code ?? ''}`.trim();
        const checker = dvCheckList[normalizedCode];
        if (typeof checker !== 'function') return false;

        try {
            return Boolean(checker(currentItem));
        } catch (error) {
            console.warn('No fue posible evaluar la aplicabilidad del requisito', normalizedCode, error);
            return false;
        }
    }, [currentItem]);

    const handleEvaluationChange = useCallback(async (requirement, evaluation) => {
        if (readOnly || !funIdPublic || !requirement?.code) return;

        swalLoading();
        try {
            await checklistService.updateRequirementEvaluation(funIdPublic, requirement.code, {
                version: currentVersion,
                evaluation,
            });
            await loadChecklist();
            requestUpdate?.(currentItem?.id, false);
            swalSuccess({ title: swaMsg?.generic_success_title || 'Guardado', text: 'Evaluación actualizada.' });
        } catch (error) {
            console.error(error);
            swalError({ title: swaMsg?.generic_eror_title || 'Error', text: 'No fue posible actualizar la evaluación.' });
        }
    }, [currentItem?.id, currentVersion, funIdPublic, loadChecklist, readOnly, requestUpdate, swaMsg]);

    const handleLinkDocument = useCallback(async (requirement, entry) => {
        if (readOnly || !funIdPublic || !requirement?.code || !entry) return;

        swalLoading();
        try {
            await checklistService.linkDocumentToRequirement({
                fun_id_public: funIdPublic,
                version: currentVersion,
                requirement_code: requirement.code,
                document_entry_key: entry.documentEntryKey,
                source: 'vr',
                source_table: 'sub_list',
                source_id: entry.sourceId,
                entry_index: entry.entryIndex,
                vr_id_public: entry.vrId,
                document_code: entry.documentCode,
                document_name: entry.documentName,
                metadata: {
                    pages: entry.pages,
                    vr_date: entry.vrDate,
                },
            });
            await loadChecklist();
            requestUpdate?.(currentItem?.id, false);
            swalSuccess({ title: swaMsg?.generic_success_title || 'Guardado', text: 'Documento relacionado al requisito.' });
        } catch (error) {
            console.error(error);
            swalError({ title: swaMsg?.generic_eror_title || 'Error', text: 'No fue posible relacionar el documento.' });
        }
    }, [currentItem?.id, currentVersion, funIdPublic, loadChecklist, readOnly, requestUpdate, swaMsg]);

    const handlePreviewEvidence = useCallback((evidence) => {
        const previewUrl = resolvePreviewUrl(evidence);
        if (previewUrl) {
            window.open(previewUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        swalError({
            title: 'Previsualización no disponible',
            text: 'La evidencia existe, pero no contiene una URL de previsualización.',
        });
    }, []);

    return (
        <div>
            {loading && (
                <div className="my-3 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                    Cargando lista de chequeo inteligente...
                </div>
            )}
            <IntelligentChecklist
                requirements={state.requirements}
                vrs={mergedVrs}
                digitalDocuments={currentItem?.fun_6s || []}
                readOnly={readOnly}
                isRequirementApplicable={isRequirementApplicable}
                onEvaluationChange={handleEvaluationChange}
                onLinkDocument={handleLinkDocument}
                onPreviewEvidence={handlePreviewEvidence}
            />
            <hr />
        </div>
    );
}

export default FUN_CHECKLIST_N;
