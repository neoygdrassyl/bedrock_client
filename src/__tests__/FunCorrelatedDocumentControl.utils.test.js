import { describe, expect, it } from 'vitest';

import {
    buildCorrelatedRequirementRows,
    getRequirementVisualState,
    parseFunReviewMap,
} from '../app/pages/user/fun_forms/utils/correlatedDocumentControl.utils';

describe('correlatedDocumentControl.utils', () => {
    const labels = {
        511: 'Formulario Único Nacional',
        6603: 'Proyecto arquitectónico',
        680: 'Copia del plano correspondiente',
    };

    it('keeps a requirement without document or VR as informative, not an error', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['511'],
            labels,
            getCheckValue: () => 'NO',
            isRequirementApplicable: () => true,
            unifiedEntries: [],
            legacyFun6Docs: [],
            existingEvaluationContext: {},
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
            code: '511',
            applicability: 'aplica',
            checkValue: 'NO',
            previewState: 'not_uploaded',
        });
        expect(rows[0].evidenceSummary.label).toBe('No aportado con VR');
        expect(getRequirementVisualState(rows[0])).toBe('warning');
    });

    it('prioritizes explicit physical origin over digital-looking reception metadata', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['6603'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [
                {
                    documentCode: '6603',
                    documentName: 'Proyecto arquitectónico',
                    originState: 'FISICO',
                    receptionMedium: 'Correo electrónico',
                    vr: '',
                    date: '2026-05-20',
                    canPreview: false,
                },
            ],
            legacyFun6Docs: [],
            existingEvaluationContext: {},
        });

        expect(rows[0].evidence[0].sourceType).toBe('physical');
        expect(rows[0].previewState).toBe('physical_only');
        expect(rows[0].evidenceSummary.label).toBe('Documento aportado físico');
    });

    it('deduplicates related VR labels while preserving evidence order', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['680'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [
                {
                    documentCode: '680',
                    documentName: 'Copia del plano correspondiente',
                    vr: 'VR-002',
                    date: '2026-05-21',
                    canPreview: true,
                },
                {
                    documentCode: '680',
                    documentName: 'Copia del plano correspondiente',
                    vr: 'VR-001',
                    date: '2026-05-20',
                    canPreview: true,
                },
                {
                    documentCode: '680',
                    documentName: 'Copia del plano correspondiente',
                    vr: 'VR-001',
                    date: '2026-05-22',
                    canPreview: true,
                },
            ],
            legacyFun6Docs: [],
            existingEvaluationContext: {},
        });

        expect(rows[0].relatedVRs).toEqual(['VR-001', 'VR-002']);
    });

    it('marks a requirement as superseded when a newer VR exists after the evaluated entry', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['6603'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [
                {
                    id: 'vr-old',
                    documentCode: '6603',
                    documentName: 'Proyecto arquitectónico',
                    vr: 'VR-001',
                    date: '2026-05-01',
                    canPreview: true,
                },
                {
                    id: 'vr-new',
                    documentCode: '6603',
                    documentName: 'Proyecto arquitectónico',
                    vr: 'VR-002',
                    date: '2026-05-20',
                    canPreview: true,
                },
            ],
            legacyFun6Docs: [],
            existingEvaluationContext: { 6603: { entryId: 'vr-old', status: 'cumple' } },
        });

        expect(rows[0].supersededByNewVR).toBe(true);
        expect(rows[0].relatedVRs).toEqual(['VR-001', 'VR-002']);
        expect(getRequirementVisualState(rows[0])).toBe('warning');
    });

    it('represents physical VR evidence without preview as physical_only', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['680'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [
                {
                    documentCode: '680',
                    documentName: 'Copia del plano correspondiente',
                    originState: 'FISICO',
                    vr: 'VR-FIS-1',
                    date: '2026-05-20',
                    canPreview: false,
                },
            ],
            legacyFun6Docs: [],
            existingEvaluationContext: {},
        });

        expect(rows[0].previewState).toBe('physical_only');
        expect(rows[0].evidenceSummary.label).toBe('Documento aportado con VR');
    });

    it('builds renderable preview and download URLs for legacy digital evidence with path and filename', () => {
        const rows = buildCorrelatedRequirementRows({
            codes: ['511'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [],
            legacyFun6Docs: [
                {
                    id: 91,
                    id_public: '511',
                    description: 'Formulario Único Nacional digitalizado',
                    id_replace: 'VR-LEGACY',
                    path: 'fun/2026/91',
                    filename: 'formulario.pdf',
                    date: '2026-05-22',
                },
            ],
            existingEvaluationContext: {},
        });

        expect(rows[0].previewState).toBe('available');
        expect(rows[0].relatedVRs).toEqual(['VR-LEGACY']);
        expect(rows[0].evidence[0]).toMatchObject({
            vr: 'VR-LEGACY',
            canPreview: true,
            previewUrl: 'http://localhost/dovela-backend/public/files/fun/2026/91/formulario.pdf?inline=1',
            downloadUrl: 'http://localhost/dovela-backend/public/files/fun/2026/91/formulario.pdf',
        });
    });

    it('filters non-applicable codes and preserves section grouping for the primary control', () => {
        const sections = [
            {
                id: '6.1',
                title: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD',
                requirements: [
                    { code: '511', label: 'Formulario Único Nacional' },
                    { code: '621', label: 'Plano urbanístico' },
                ],
            },
            {
                id: '6.8-cotas',
                title: 'Ajuste de cotas y áreas',
                requirements: [{ code: '680', label: 'Copia del plano correspondiente' }],
            },
        ];

        const rows = buildCorrelatedRequirementRows({
            codes: ['511', '621', '680'],
            sections,
            labels,
            getCheckValue: (code) => (code === '621' ? 'N/A' : 'SI'),
            isRequirementApplicable: (code) => code !== '621',
            unifiedEntries: [],
            legacyFun6Docs: [],
            existingEvaluationContext: {},
            onlyApplicable: true,
        });

        expect(rows.map((row) => row.code)).toEqual(['511', '680']);
        expect(rows[0]).toMatchObject({ section: '6.1', sectionTitle: '6.1 DOCUMENTOS COMUNES A TODA SOLICITUD' });
        expect(rows[1]).toMatchObject({ section: '6.8-cotas', sectionTitle: 'Ajuste de cotas y áreas' });
    });

    it('inherits previous review and id6 values from fun_r compatible CSV fields', () => {
        const inherited = parseFunReviewMap({
            review: '511&1,680&0',
            id6: '511&91,680&-1',
        });

        const rows = buildCorrelatedRequirementRows({
            codes: ['511', '680'],
            labels,
            getCheckValue: () => 'SI',
            isRequirementApplicable: () => true,
            unifiedEntries: [],
            legacyFun6Docs: [],
            existingEvaluationContext: inherited,
        });

        expect(rows[0]).toMatchObject({ code: '511', evaluationStatus: '1', selectedEvaluationEntry: '91' });
        expect(rows[1]).toMatchObject({ code: '680', evaluationStatus: '0', selectedEvaluationEntry: '-1' });
    });
});
