import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

const {
    getUnifiedDocumentEntriesMock,
    getMissingDocumentsMock,
} = vi.hoisted(() => ({
    getUnifiedDocumentEntriesMock: vi.fn(),
    getMissingDocumentsMock: vi.fn(),
}));

vi.mock('../../../../services/fun.service', () => ({
    __esModule: true,
    default: {
        getUnifiedDocumentEntries: (...args) => getUnifiedDocumentEntriesMock(...args),
        getMissingDocuments: (...args) => getMissingDocumentsMock(...args),
    },
}));

import { useExpedienteDocumental } from './useExpedienteDocumental.js';
import { DOCUMENT_ORIGIN_STATE } from '../../shared/expediente-documental.constants.js';
import { DOCUMENT_PREVIEW_MEDIUM, LEGAL_FORM_FILTER } from '../../shared/expediente-documental.utils.js';

const physicalEntry = {
    entryId: 'source:sub_list:1',
    sourceTable: 'sub_list',
    documentCode: 'DOC-001',
    documentName: 'Certificado de libertad físico',
    vr: 'VR26-0001',
    originState: DOCUMENT_ORIGIN_STATE.PHYSICAL,
    date: '2026-06-01',
    time: '08:00',
    pages: 3,
};

const digitalEntry = {
    entryId: 'source:fun_6:77',
    contractVersion: 3,
    isConsolidated: true,
    consolidationKey: 'VR26-2330|DOC-003',
    documentCode: 'DOC-003',
    documentName: 'Documento de identidad digital',
    originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
    date: '2026-06-02',
    time: '09:00',
    summary: {
        sourceCount: 1,
        foliosDigital: 1,
        foliosPhysical: 0,
        foliosTotal: 1,
        previewSourceEntryId: 'fun6:77',
        editableSourceEntryId: 'fun6:77',
    },
    sources: [
        {
            entryId: 'fun6:77',
            sourceTable: 'fun_6',
            originState: DOCUMENT_ORIGIN_STATE.DIGITAL,
            documentCode: 'DOC-003',
            documentName: 'Documento de identidad digital',
            vr: 'VR26-2330',
            date: '2026-06-02',
            time: '09:00',
            pages: 1,
            canPreview: true,
            canEdit: true,
            canDelete: true,
        },
    ],
};

const emptyMissingDocumentsResult = {
    source: 'snapshot',
    snapshotId: 321,
    configVersionId: 12,
    summary: { totalRequirements: 0, missing: 0, pendingScan: 0, present: 0 },
    requirements: [],
};

function renderExpedienteDocumentalHook(overrides = {}) {
    return renderHook(() => useExpedienteDocumental({
        funId: 1,
        idRelated: 'FUN-1',
        canManage: true,
        ...overrides,
    }));
}

describe('useExpedienteDocumental', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getUnifiedDocumentEntriesMock.mockResolvedValue({ data: [physicalEntry, digitalEntry] });
        getMissingDocumentsMock.mockResolvedValue({ data: emptyMissingDocumentsResult });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('fetches, derives and paginates rows on mount', async () => {
        const { result } = renderExpedienteDocumentalHook();

        expect(result.current.loading).toBe(true);

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(getUnifiedDocumentEntriesMock).toHaveBeenCalledWith(1, 'FUN-1');
        expect(getMissingDocumentsMock).toHaveBeenCalledWith(1, 'FUN-1');
        expect(result.current.error).toBe('');
        expect(result.current.filteredCount).toBe(2);
        expect(result.current.visibleRows).toHaveLength(2);
        expect(result.current.summary.totalGroups).toBe(2);
        expect(result.current.page).toBe(1);
        expect(result.current.totalPages).toBe(1);
    });

    it('setFilter resets page to 1 (legacy invariant)', async () => {
        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.setPage(1);
        });

        act(() => {
            result.current.setFilter('document', 'certificado');
        });

        expect(result.current.filters.document).toBe('certificado');
        expect(result.current.page).toBe(1);

        // Simulate being on a later page, then confirm a new filter resets it.
        act(() => {
            result.current.setFilter('document', '');
        });
        act(() => {
            result.current.setPage(2);
        });
        expect(result.current.page).toBe(2);

        act(() => {
            result.current.setFilter('vr', 'VR26-0001');
        });

        expect(result.current.page).toBe(1);
        expect(result.current.filters.vr).toBe('VR26-0001');
    });

    it('disabling legal mode resets filters.legalForm to ALL (legacy invariant)', async () => {
        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.legal.setMode(true);
        });
        expect(result.current.legal.mode).toBe(true);

        act(() => {
            result.current.kpi.toggleLegalForm(LEGAL_FORM_FILTER.MISSING);
        });
        expect(result.current.filters.legalForm).toBe(LEGAL_FORM_FILTER.MISSING);

        act(() => {
            result.current.legal.setMode(false);
        });

        expect(result.current.legal.mode).toBe(false);
        expect(result.current.filters.legalForm).toBe(LEGAL_FORM_FILTER.ALL);
    });

    it('clicking the sole active medium KPI clears all filters', async () => {
        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.kpi.toggleMedium(DOCUMENT_PREVIEW_MEDIUM.PHYSICAL);
        });
        expect(result.current.filters.mediums).toEqual([DOCUMENT_PREVIEW_MEDIUM.PHYSICAL]);
        expect(result.current.hasFilters).toBe(true);

        act(() => {
            result.current.kpi.toggleMedium(DOCUMENT_PREVIEW_MEDIUM.PHYSICAL);
        });

        expect(result.current.filters.mediums).toEqual([]);
        expect(result.current.hasFilters).toBe(false);
    });

    it('clicking the sole active scanned KPI clears all filters', async () => {
        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            result.current.kpi.toggleScanned();
        });
        expect(result.current.filters.statuses).toEqual(['scanned']);

        act(() => {
            result.current.kpi.toggleScanned();
        });

        expect(result.current.filters.statuses).toEqual([]);
        expect(result.current.hasFilters).toBe(false);
    });

    it('degrades gracefully when getMissingDocuments rejects while entries still load', async () => {
        getMissingDocumentsMock.mockRejectedValue(new Error('legal form service down'));

        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.legal.loading).toBe(false);
        });

        expect(result.current.error).toBe('');
        expect(result.current.filteredCount).toBe(2);
        expect(result.current.legal.error).toBeTruthy();
        expect(result.current.legal.summary.totalRequired).toBe(0);
    });

    it('degrades gracefully when getUnifiedDocumentEntries rejects while legal form still loads', async () => {
        getUnifiedDocumentEntriesMock.mockRejectedValue(new Error('entries service down'));

        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
            expect(result.current.legal.loading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.filteredCount).toBe(0);
        expect(result.current.legal.error).toBe('');
    });

    it('entrySheet opens with a group/mode and closes back to defaults', async () => {
        const { result } = renderExpedienteDocumentalHook();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const group = result.current.visibleRows[0];

        act(() => {
            result.current.entrySheet.openWith(group, 'edit');
        });

        expect(result.current.entrySheet.open).toBe(true);
        expect(result.current.entrySheet.mode).toBe('edit');
        expect(result.current.entrySheet.group).toBe(group);

        act(() => {
            result.current.entrySheet.close();
        });

        expect(result.current.entrySheet.open).toBe(false);
        expect(result.current.entrySheet.group).toBeNull();
    });

    it('does not fetch when funId/idRelated are missing', async () => {
        const { result } = renderExpedienteDocumentalHook({ funId: null, idRelated: null });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(getUnifiedDocumentEntriesMock).not.toHaveBeenCalled();
        expect(getMissingDocumentsMock).not.toHaveBeenCalled();
        expect(result.current.visibleRows).toEqual([]);
    });
});
