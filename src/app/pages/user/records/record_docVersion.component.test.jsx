import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RECORD_DOCUMENT_VERSION from './record_docVersion.component';

const mocks = vi.hoisted(() => ({
    createFun6: vi.fn(),
    pdfLoad: vi.fn(),
}));

vi.mock('../../../services/fun.service', () => ({
    default: {
        create_fun6: mocks.createFun6,
    },
}));

vi.mock('../../../components/viewer.component', () => ({
    default: () => <div data-testid="legacy-viewer" />,
}));

vi.mock('../../../components/vizualizer.component', () => ({
    default: ({ url, apipath, previewUrl, downloadUrl }) => (
        <div
            data-testid="fun6-vizualizer"
            data-url={url}
            data-apipath={apipath}
            data-preview-url={previewUrl}
            data-download-url={downloadUrl}
        />
    ),
}));

vi.mock('pdf-lib', () => ({
    PDFDocument: {
        load: mocks.pdfLoad,
    },
}));

vi.mock('@/app/utils/swalAdapter', () => ({
    swalError: vi.fn(),
    swalLoading: vi.fn(),
    swalSuccess: vi.fn(),
}));

const baseProps = {
    translation: {},
    swaMsg: {},
    globals: {},
    currentVersion: 1,
    currentRecord: {},
    currentVersionR: 1,
};

function buildCurrentItem(overrides = {}) {
    return {
        id: 61,
        id_public: '68001-1-25-0061',
        createdAt: '2025-04-10T12:00:00.000Z',
        fun_6s: [],
        ...overrides,
    };
}

describe('RECORD_DOCUMENT_VERSION', () => {
    beforeEach(() => {
        mocks.createFun6.mockReset();
        mocks.createFun6.mockResolvedValue({ data: 'OK' });
        mocks.pdfLoad.mockReset();
        mocks.pdfLoad.mockResolvedValue({ getPages: () => [{}, {}, {}] });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }));
        window.URL.createObjectURL = vi.fn(() => 'blob:record-doc-version-test');
    });

    it('sube el documento con los metadatos de la fila actual sin depender de ids globales', async () => {
        const requestUpdate = vi.fn();
        const currentItem = buildCurrentItem();
        const { container } = render(
            <RECORD_DOCUMENT_VERSION
                {...baseProps}
                currentItem={currentItem}
                id6="law1"
                requestUpdate={requestUpdate}
            />,
        );

        fireEvent.click(container.querySelector('button'));
        const fileInput = document.querySelector('input[type="file"]');
        const form = document.querySelector('form');
        const file = new File(['%PDF-1.3'], 'INFORME JURIDICO 68001-1-26-0101.pdf', { type: 'application/pdf' });

        fireEvent.change(fileInput, { target: { files: [file] } });
        await waitFor(() => expect(mocks.pdfLoad).toHaveBeenCalled());

        const originalGetElementById = document.getElementById.bind(document);
        const getElementByIdSpy = vi.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'fun6_description') return { value: 'Acta Observaciones Jurídico' };
            if (id === 'fun6_code') return { value: 'law0' };
            if (id === 'fun6_page') return { value: '99' };
            if (id === 'fun6_date') return { value: '1999-01-01' };
            return originalGetElementById(id);
        });

        fireEvent.submit(form);

        await waitFor(() => expect(mocks.createFun6).toHaveBeenCalled());
        getElementByIdSpy.mockRestore();

        const formData = mocks.createFun6.mock.calls[0][0];
        expect(formData.get('fun0Id')).toBe(currentItem.id.toString());
        expect(formData.get('descriptions')).toBe('Revision Técnica 1 Jurídico');
        expect(formData.get('codes2')).toBe('law1');
        expect(formData.get('pages')).toBe('3');
        expect(formData.get('dates')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(formData.get('file').name).toBe('fun6_25_68001-1-25-0061_INFORME JURIDICO 68001-1-26-0101.pdf');
        await waitFor(() => expect(requestUpdate).toHaveBeenCalledWith(currentItem.id));
    });

    it('muestra la lupita con el visor moderno y una URL segura para PDFs con espacios', () => {
        const filename = 'fun6_25_68001-1-25-0061_INFORME JURIDICO 68001-1-26-0101_1782921837885.pdf';
        const currentItem = buildCurrentItem({
            fun_6s: [{
                id: 43178,
                id_replace: 'law1',
                filename,
                path: 'docs/process/25/68001-1-25-0061',
            }],
        });

        render(
            <RECORD_DOCUMENT_VERSION
                {...baseProps}
                currentItem={currentItem}
                id6="law1"
                requestUpdate={vi.fn()}
            />,
        );

        const viewer = screen.getByTestId('fun6-vizualizer');
        const encodedFilename = encodeURIComponent(filename);

        expect(viewer).toHaveAttribute('data-apipath', '/files/');
        expect(viewer).toHaveAttribute('data-url', `docs/process/25/68001-1-25-0061/${encodedFilename}`);
        expect(viewer).toHaveAttribute('data-preview-url', `/api/files/docs/process/25/68001-1-25-0061/${encodedFilename}?inline=1`);
        expect(viewer).toHaveAttribute('data-download-url', `/api/files/docs/process/25/68001-1-25-0061/${encodedFilename}`);
        expect(screen.queryByTestId('legacy-viewer')).not.toBeInTheDocument();
    });
});
