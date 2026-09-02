import { describe, expect, it } from 'vitest';

import {
    DOCUMENT_ORIGIN_STATE,
    DOCUMENT_PREVIEW_MEDIUM,
    buildDocumentEntriesFromLegacyData,
    buildDocumentDownloadUrl,
    buildDocumentPreviewUrl,
    buildDocumentTableRows,
    buildUnifiedDocumentRows,
    buildMissingDocumentsSuggestionText,
    decorateDocumentTableRowsWithLegalForm,
    filterDocumentEntryGroups,
    filterDocumentTableRows,
    filterUnifiedDocumentRows,
    groupDocumentEntries,
    normalizeVentanillaDocs,
    summarizeLegalFormRequirements,
    summarizeUnifiedDocumentRows,
} from '../app/pages/user/shared/expediente-documental.utils';

describe('expediente-documental utils', () => {
    it('mergea digitalizados y ventanilla por codigo sin perder pendientes de digitalizacion', () => {
        const digitalizados = [
            {
                id: 11,
                id_public: 'A-01',
                description: 'Documento de identidad',
                id_replace: 'VR-1001',
                pages: 4,
                date: '2026-04-01',
                path: 'docs/fun/FUN-1',
                filename: 'doc-id.pdf',
            },
            {
                id: 12,
                id_public: 'B-01',
                description: 'Poder especial',
                id_replace: '',
                pages: 2,
                date: '2026-04-02',
                path: 'docs/fun/FUN-1',
                filename: 'poder.pdf',
            },
        ];

        const ventanilla = normalizeVentanillaDocs([
            {
                id_public: 'VR-1001',
                date: '2026-04-01',
                time: '08:30',
                sub_lists: [
                    {
                        list_name: 'Documento de identidad;Certificado de libertad',
                        list_category: 'ID,CL',
                        list_code: 'A-01,C-01',
                        list_pages: '4,12',
                        list_review: 'SI,SI',
                    },
                ],
            },
        ]);

        const rows = buildUnifiedDocumentRows(digitalizados, ventanilla);

        expect(rows).toHaveLength(3);

        expect(rows[0]).toMatchObject({
            source: 'both',
            code: 'A-01',
            documentName: 'Documento de identidad',
            isDigitized: true,
            isPendingDigitization: false,
        });
        expect(rows[0].ventanillaEntries).toHaveLength(1);

        expect(rows[1]).toMatchObject({
            source: 'digital',
            code: 'B-01',
            isDigitized: true,
            isPendingDigitization: false,
        });

        expect(rows[2]).toMatchObject({
            source: 'ventanilla',
            code: 'C-01',
            isDigitized: false,
            isPendingDigitization: true,
        });
    });

    it('filtra por origen y estado de digitalizacion', () => {
        const rows = [
            { id: '1', source: 'both', isDigitized: true, isPendingDigitization: false },
            { id: '2', source: 'digital', isDigitized: true, isPendingDigitization: false },
            { id: '3', source: 'ventanilla', isDigitized: false, isPendingDigitization: true },
        ];

        expect(filterUnifiedDocumentRows(rows, { source: 'ventanilla', digitization: 'all' })).toEqual([rows[2]]);
        expect(filterUnifiedDocumentRows(rows, { source: 'all', digitization: 'pending' })).toEqual([rows[2]]);
        expect(filterUnifiedDocumentRows(rows, { source: 'all', digitization: 'digitized' })).toEqual([rows[0], rows[1]]);
    });

    it('resume el estado documental para los chips de cabecera', () => {
        const summary = summarizeUnifiedDocumentRows([
            { source: 'both', isPendingDigitization: false },
            { source: 'digital', isPendingDigitization: false },
            { source: 'ventanilla', isPendingDigitization: true },
        ]);

        expect(summary).toEqual({
            total: 3,
            both: 1,
            digital: 1,
            ventanilla: 1,
            pendingDigitization: 1,
        });
    });

    it('agrupa entradas normalizadas por documento con ultimo VR, origenes y filtros por origen', () => {
        const entries = [
            {
                entryId: 'sublist:10:0',
                sourceTable: 'sub_list',
                documentCode: 'A-01',
                documentName: 'Documento de identidad',
                vr: 'VR-1001',
                date: '2026-04-01',
                pages: 4,
                originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
                canPreview: false,
                canEdit: false,
            },
            {
                entryId: 'fun6:20',
                sourceTable: 'fun_6',
                documentCode: 'A-01',
                documentName: 'Documento de identidad',
                vr: 'VR-1001',
                date: '2026-04-02',
                pages: 4,
                originState: DOCUMENT_ORIGIN_STATE.SCANNED,
                canPreview: true,
                canEdit: true,
            },
            {
                entryId: 'fun6:21',
                sourceTable: 'fun_6',
                documentCode: 'B-01',
                documentName: 'Poder especial',
                vr: 'VR-2002',
                date: '2026-04-03',
                pages: 2,
                originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
                receptionMediumLabel: 'Correo electrónico',
                canPreview: true,
                canEdit: true,
            },
        ];

        const groups = groupDocumentEntries(entries);

        expect(groups).toHaveLength(2);
        expect(groups[0]).toMatchObject({
            documentCode: 'B-01',
            documentName: 'Poder especial',
            latestVr: 'VR-2002',
            entryCount: 1,
            receptionMediumLabels: ['Correo electrónico'],
            originPresence: {
                FISICO: false,
                DIGITALIZADO: false,
                MEDIO_DIGITAL: true,
            },
        });
        expect(groups[1]).toMatchObject({
            documentCode: 'A-01',
            latestVr: 'VR-1001',
            entryCount: 2,
            originPresence: {
                FISICO: true,
                DIGITALIZADO: true,
                MEDIO_DIGITAL: false,
            },
        });

        expect(filterDocumentEntryGroups(groups, {
            origins: [DOCUMENT_ORIGIN_STATE.PHYSICAL],
        })).toEqual([groups[1]]);
        expect(filterDocumentEntryGroups(groups, {
            document: 'poder',
            vr: '2002',
            origins: [DOCUMENT_ORIGIN_STATE.DIGITAL],
        })).toEqual([groups[0]]);
    });

    it('construye entradas fallback desde datos legacy cuando falla la consulta unificada', () => {
        const digitalizados = [
            {
                id: 20,
                id_public: 'A-01',
                description: 'Documento de identidad',
                id_replace: 'VR-1001',
                pages: 4,
                date: '2026-04-02',
                path: 'docs/process/2026/1700',
                filename: 'documento-identidad.pdf',
            },
            {
                id: 21,
                id_public: 'B-01',
                description: 'Poder especial',
                id_replace: 'VR-2002',
                pages: 2,
                date: '2026-04-03',
                path: 'docs/process/2026/1700',
                filename: 'poder.pdf',
            },
        ];
        const ventanilla = normalizeVentanillaDocs([
            {
                id_public: 'VR-1001',
                date: '2026-04-01',
                time: '08:30',
                sub_lists: [
                    {
                        list_name: 'Documento de identidad;Certificado de libertad',
                        list_category: 'ID,CL',
                        list_code: 'A-01,C-01',
                        list_pages: '4,12',
                        list_review: 'SI,SI',
                    },
                ],
            },
        ]);

        const entries = buildDocumentEntriesFromLegacyData(digitalizados, ventanilla);
        const groups = groupDocumentEntries(entries);

        expect(entries).toHaveLength(4);
        expect(entries.map((entry) => entry.originState)).toEqual([
            DOCUMENT_ORIGIN_STATE.SCANNED,
            DOCUMENT_ORIGIN_STATE.DIGITAL,
            DOCUMENT_ORIGIN_STATE.PHYSICAL,
            DOCUMENT_ORIGIN_STATE.PHYSICAL,
        ]);
        expect(groups).toHaveLength(3);
        expect(groups.find((group) => group.documentCode === 'A-01')).toMatchObject({
            entryCount: 2,
            latestVr: 'VR-1001',
            originPresence: {
                FISICO: true,
                DIGITALIZADO: true,
                MEDIO_DIGITAL: false,
            },
        });
    });

    it('excluye documentos internos de evaluación del fallback de gestión documental', () => {
        const entries = buildDocumentEntriesFromLegacyData([
            {
                id: 20,
                id_public: 'A-01',
                description: 'Documento normal',
                id_replace: 'VR-1001',
                pages: 4,
                date: '2026-04-02',
                path: 'docs/process/2026/1700',
                filename: 'documento-normal.pdf',
            },
            {
                id: 21,
                id_public: '',
                description: 'Acta Observaciones Juridico',
                id_replace: 'law0',
                pages: 1,
                date: '2026-04-03',
                path: 'docs/process/2026/1700',
                filename: 'law0.pdf',
            },
            {
                id: 22,
                id_public: '',
                description: 'Revision Arquitectonica',
                id_replace: 'arc1',
                pages: 1,
                date: '2026-04-03',
                path: 'docs/process/2026/1700',
                filename: 'arc1.pdf',
            },
            {
                id: 23,
                id_public: '',
                description: 'Revision Tecnica',
                id_replace: 'eng2',
                pages: 1,
                date: '2026-04-03',
                path: 'docs/process/2026/1700',
                filename: 'eng2.pdf',
            },
            {
                id: 24,
                id_public: '',
                description: 'Revision',
                id_replace: 'rew1',
                pages: 1,
                date: '2026-04-03',
                path: 'docs/process/2026/1700',
                filename: 'rew1.pdf',
            },
        ]);

        expect(entries.map((entry) => entry.vr)).toEqual(['VR-1001']);
    });

    it('clasifica como escaneadas las filas consolidadas v3 con fuentes escaneadas y VR físico', () => {
        const rows = buildDocumentTableRows([
            {
                entryId: 'source:fun_6:fun6:37720|doc:900',
                contractVersion: 3,
                isConsolidated: true,
                consolidationKey: 'VR25-5008|900',
                documentCode: '900',
                documentName: 'Escrituras Publicas',
                originState: DOCUMENT_ORIGIN_STATE.SCANNED,
                sources: [
                    { entryId: 'fun6:37720', source: 'scanned', originState: DOCUMENT_ORIGIN_STATE.SCANNED, documentCode: '900', documentName: 'Escrituras Publicas', vr: 'VR25-5008', pages: 5 },
                    { entryId: 'sublist:20', source: 'vr', originState: DOCUMENT_ORIGIN_STATE.PHYSICAL, documentCode: '900', documentName: 'Escrituras Publicas', vr: 'VR25-5008', pages: 12 },
                ],
                summary: { sourceCount: 2, foliosScanned: 5, foliosVr: 12, foliosTotal: 17 },
            },
        ]);

        expect(rows).toHaveLength(1);
        expect(rows[0].scanned).toMatchObject({ applies: true, value: true });
        expect(filterDocumentTableRows(rows, { statuses: ['scanned'] })).toEqual(rows);
    });

    it('decora filas con Legal y Debida Forma, agrega sintéticas faltantes y filtra por estado legal', () => {
        const rows = [
            {
                id: 'row-present',
                documentCode: 'DOC-003',
                documentName: 'Documento de identidad digital',
                entries: [{
                    entryId: 'fun6:77',
                    sourceTable: 'fun_6',
                    canPreview: true,
                    canEdit: true,
                    canDelete: true,
                    path: 'docs/fun/FUN26-2330',
                    filename: 'doc-003.pdf',
                }],
                entryCount: 1,
                latestVr: 'VR26-2330',
                vrValues: ['VR26-2330'],
                latestDocumentDate: '2026-06-01',
                medium: DOCUMENT_PREVIEW_MEDIUM.DIGITAL,
                mediumLabel: 'Digital',
                mediumPresence: {
                    [DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]: false,
                    [DOCUMENT_PREVIEW_MEDIUM.DIGITAL]: true,
                },
                scanned: { applies: false, value: false, count: 0, label: 'No aplica' },
                folios: { digital: 1, physical: 0, total: 1, label: 'Digitales 1 / Físicos 0' },
            },
        ];
        const missingDocumentsResult = {
            source: 'snapshot',
            snapshotId: 321,
            configVersionId: 12,
            summary: {
                totalRequirements: 3,
                missing: 1,
                pendingScan: 1,
                present: 1,
            },
            requirements: [
                {
                    code: 'DOC-001',
                    label: 'Formulario único nacional',
                    groupKey: 'base',
                    status: 'missing',
                    statusReason: 'required_without_evidence',
                    evidence: [],
                },
                {
                    code: 'DOC-002',
                    label: 'Certificado de libertad físico',
                    groupKey: 'base',
                    status: 'pending_scan',
                    statusReason: 'physical_positive_without_digital',
                    evidence: [{ sourceTable: 'sub_list', sourceId: 42, vrIdPublic: 'VR26-2330' }],
                },
                {
                    code: 'DOC-003',
                    label: 'Documento de identidad digital',
                    groupKey: 'identidad',
                    status: 'present',
                    statusReason: 'digital_evidence',
                    evidence: [{ sourceTable: 'fun_6', sourceId: 77, documentName: 'Documento de identidad digital' }],
                },
            ],
        };

        const decoratedRows = decorateDocumentTableRowsWithLegalForm(rows, missingDocumentsResult);
        const legalSummary = summarizeLegalFormRequirements(missingDocumentsResult);
        const missingRows = filterDocumentTableRows(decoratedRows, { legalForm: 'missing' });
        const pendingRows = filterDocumentTableRows(decoratedRows, { legalForm: 'pending_scan' });
        const requiredRows = filterDocumentTableRows(decoratedRows, { legalForm: 'required' });

        expect(legalSummary).toMatchObject({
            source: 'snapshot',
            present: 1,
            missing: 1,
            pendingScan: 1,
            totalRequired: 3,
            showSourceWarning: false,
        });

        expect(requiredRows).toHaveLength(3);
        expect(missingRows).toHaveLength(1);
        expect(pendingRows).toHaveLength(1);
        expect(missingRows[0]).toMatchObject({
            documentCode: 'DOC-001',
            documentName: 'Formulario único nacional',
            isPreviewRow: true,
            canPreview: false,
            canDelete: false,
            legalForm: {
                status: 'missing',
                source: 'snapshot',
            },
        });
        expect(pendingRows[0]).toMatchObject({
            documentCode: 'DOC-002',
            isPreviewRow: true,
            legalForm: {
                status: 'pending_scan',
            },
        });
        expect(buildDocumentPreviewUrl(missingRows[0].entries[0])).toBe('');
        expect(buildDocumentDownloadUrl(missingRows[0].entries[0])).toBe('');
        expect(decoratedRows.find((row) => row.documentCode === 'DOC-003')).toMatchObject({
            isPreviewRow: false,
            legalForm: {
                status: 'present',
                source: 'snapshot',
            },
        });
    });

    it('construye texto sugerido para 5.11 desde el endpoint read-only y preserva el orden recibido', () => {
        const suggestion = buildMissingDocumentsSuggestionText({
            missingDocuments: [
                { suggestedText: 'Solicitar Formulario único nacional.' },
                { suggestedText: 'Digitalizar o cargar Certificado de libertad físico.' },
            ],
        });

        expect(suggestion).toBe('1. Solicitar Formulario único nacional.\n2. Digitalizar o cargar Certificado de libertad físico.');
    });
});
