import { describe, expect, it } from 'vitest';

import {
    buildCorrelatedRequirementRows,
    getRequirementVisualState,
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
        expect(rows[0].evidenceSummary.label).toBe('Sin evidencia registrada');
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
        expect(rows[0].evidenceSummary.label).toBe('Aportado físicamente');
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
        expect(rows[0].evidenceSummary.label).toBe('Físico con VR');
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
});
