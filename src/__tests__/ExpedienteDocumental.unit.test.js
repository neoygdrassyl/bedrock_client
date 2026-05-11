import { describe, expect, it } from 'vitest';

import {
    DOCUMENT_ORIGIN_STATE,
    buildDocumentEntriesFromLegacyData,
    buildUnifiedDocumentRows,
    filterDocumentEntryGroups,
    filterUnifiedDocumentRows,
    groupDocumentEntries,
    normalizeVentanillaDocs,
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
});
