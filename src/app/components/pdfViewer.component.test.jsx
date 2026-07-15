import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PDF_VIEWER from './pdfViewer.component';

const mocks = vi.hoisted(() => ({
    httpGet: vi.fn(),
    pdfLoad: vi.fn(),
    documentFiles: [],
    documentProps: [],
    workerOptions: {},
}));

vi.mock('pdfjs-dist/build/pdf.worker.min.js?url', () => ({
    default: '/assets/pdf.worker.legacy.js',
}));

vi.mock('../../http-common', () => ({
    default: {
        get: mocks.httpGet,
    },
}));

vi.mock('pdf-lib', () => ({
    PDFDocument: {
        load: mocks.pdfLoad,
    },
}));

vi.mock('react-pdf', async () => {
    const React = await import('react');

    return {
        pdfjs: {
            GlobalWorkerOptions: mocks.workerOptions,
        },
        Document: (props) => {
            const { file, onLoadSuccess, children } = props;
            mocks.documentFiles.push(file);
            mocks.documentProps.push(props);

            React.useEffect(() => {
                onLoadSuccess?.({ numPages: 3 });
            }, [onLoadSuccess]);

            return <div data-testid="mock-pdf-document">{children}</div>;
        },
        Page: () => <div data-testid="mock-pdf-page" />,
    };
});

describe('PDF_VIEWER', () => {
    beforeEach(() => {
        mocks.httpGet.mockReset();
        mocks.pdfLoad.mockReset();
        mocks.documentFiles.length = 0;
        mocks.documentProps.length = 0;
    });

    it('entrega el PDF descargado directamente a react-pdf sin reserializarlo con pdf-lib', async () => {
        const pdfBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 51]).buffer;
        mocks.httpGet.mockResolvedValue({
            data: pdfBytes,
            headers: {
                'content-type': 'application/pdf',
            },
        });
        mocks.pdfLoad.mockResolvedValue({
            saveAsBase64: vi.fn().mockResolvedValue('data:application/pdf;base64,broken'),
        });

        render(<PDF_VIEWER url="docs/process/25/demo.pdf" apipath="/files/" />);

        await waitFor(() => expect(screen.getByTestId('mock-pdf-document')).toBeInTheDocument());

        expect(mocks.httpGet).toHaveBeenCalledWith('/files/docs/process/25/demo.pdf', {
            responseType: 'arraybuffer',
        });
        expect(mocks.pdfLoad).not.toHaveBeenCalled();
        expect(mocks.documentFiles[0]).toEqual({ data: new Uint8Array(pdfBytes) });
    });

    it('usa el worker instalado compatible con react-pdf y muestra errores reales de pdfjs', async () => {
        const pdfBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 51]).buffer;
        mocks.httpGet.mockResolvedValue({
            data: pdfBytes,
            headers: {
                'content-type': 'application/pdf',
            },
        });

        render(<PDF_VIEWER url="docs/process/25/demo.pdf" apipath="/files/" />);

        await waitFor(() => expect(screen.getByTestId('mock-pdf-document')).toBeInTheDocument());

        expect(mocks.workerOptions.workerSrc).toBe('/assets/pdf.worker.legacy.js');
        expect(mocks.documentProps[0].onLoadError).toEqual(expect.any(Function));

        act(() => {
            mocks.documentProps[0].onLoadError(new Error('The API version does not match the Worker version'));
        });

        expect(screen.getByText('No fue posible abrir este PDF.')).toBeInTheDocument();
        expect(screen.getByText('The API version does not match the Worker version')).toBeInTheDocument();
    });
});
