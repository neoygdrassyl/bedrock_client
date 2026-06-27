import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocument } from 'pdf-lib';
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import http from '../../http-common';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

function decodeErrorPayload(data) {
    if (!data) return '';

    if (typeof data === 'string') {
        return data;
    }

    const buffer = data instanceof ArrayBuffer
        ? data
        : ArrayBuffer.isView(data)
            ? data.buffer
            : null;

    if (buffer) {
        try {
            return new TextDecoder('utf-8').decode(new Uint8Array(buffer));
        } catch {
            return '';
        }
    }

    if (typeof data === 'object') {
        try {
            return JSON.stringify(data);
        } catch {
            return '';
        }
    }

    return String(data);
}

function extractErrorMessage(error) {
    const payloadText = decodeErrorPayload(error?.response?.data);

    if (payloadText) {
        try {
            const parsedPayload = JSON.parse(payloadText);
            if (parsedPayload?.message) {
                return parsedPayload.message;
            }
        } catch {
            return payloadText;
        }
    }

    return error?.message || 'No fue posible cargar el PDF.';
}

function PDF_VIEWER({
    url,
    apipath,
    className,
    viewportClassName,
    pageWrapperClassName,
    defaultScale = 1.75,
    minPageWidth = 320,
    maxPageWidth = 1280,
}) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [leftBtn, setLeftBtn] = useState(1);
    const [rightBtn, setRightBtn] = useState(1);
    const [pdf, setPdf] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [pageWidth, setPageWidth] = useState(null);
    const hasLoadedPdf = Boolean(pdf) && !loadError;
    const pageInputRef = useRef(null);
    const viewportRef = useRef(null);

    useEffect(() => {
        let ignore = false;

        setPageNumber(1);
        setNumPages(null);
        setPdf(null);
        setLoadError(null);

        const getPdf = async () => {
            if (!url || !apipath) {
                if (!ignore) {
                    setLoadError({
                        message: 'No se recibió una ruta válida para cargar el PDF.',
                        status: null,
                        requestId: null,
                        backendErrorId: null,
                    });
                }
                return;
            }

            try {
                const response = await http.get(`${apipath}${url}`, {
                    responseType: 'arraybuffer',
                });
                const contentType = response?.headers?.['content-type'] || response?.headers?.['Content-Type'] || '';

                if (contentType && !/pdf|octet-stream/i.test(contentType)) {
                    throw new Error(`El servidor respondió con un contenido no compatible (${contentType}).`);
                }

                const pdfDoc = await PDFDocument.load(response.data);
                const base64String = await pdfDoc.saveAsBase64({ dataUri: true });

                if (!ignore) {
                    setPdf(base64String);
                }
            } catch (error) {
                console.log(error);
                if (!ignore) {
                    setLoadError({
                        message: extractErrorMessage(error),
                        status: error?.response?.status ?? null,
                        requestId: error?.response?.headers?.['x-dovela-request-id'] || error?.response?.headers?.['X-Dovela-Request-Id'] || null,
                        backendErrorId: error?.response?.headers?.['x-dovela-backend-error-id'] || error?.response?.headers?.['X-Dovela-Backend-Error-Id'] || null,
                    });
                }
            }
        };
        getPdf();

        return () => {
            ignore = true;
        };
    }, [url, apipath]);

    useEffect(() => {
        const viewportNode = viewportRef.current;

        if (!viewportNode) {
            return undefined;
        }

        const updatePageWidth = () => {
            const availableWidth = viewportNode.clientWidth - 24;

            if (availableWidth <= 0) {
                setPageWidth(null);
                return;
            }

            const boundedWidth = Math.max(minPageWidth, Math.min(maxPageWidth, Math.floor(availableWidth)));
            setPageWidth(boundedWidth);
        };

        updatePageWidth();

        if (typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver(() => updatePageWidth());
        observer.observe(viewportNode);

        return () => {
            observer.disconnect();
        };
    }, [minPageWidth, maxPageWidth, url]);

    const prevPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const nextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const toPage = (e) => {
        if (e) e.preventDefault();
        const page = Number(pageInputRef.current?.value);
        if (page > 0 && page <= numPages) setPageNumber(page);
    };

    const onDocumentLoadSuccess = ({ numPages: loadedNumPages }) => {
        setNumPages(loadedNumPages);
        setPageNumber(1);
    };

    const onPageLoadSuccess = () => {
        if (numPages == 1) {
            setRightBtn(1);
            setLeftBtn(1);
        } else {
            if (pageNumber >= numPages) {
                setRightBtn(1);
                setLeftBtn(0);
            }
            if (pageNumber == 1) {
                setRightBtn(0);
                setLeftBtn(1);
            }
        }
    };

    const _GET_STYLE = (btn) => {
        if (btn == 'left') {
            if (pageNumber == 1) return { color: "SkyBlue" }
            else return { color: "DeepSkyBlue" }
        }
        if (btn == 'right') {
            if (pageNumber < numPages) return { color: "DeepSkyBlue" }
            else return { color: "SkyBlue" }
        }
    };

    return (
        <div className={cn('pdf-viewer flex min-w-0 flex-col gap-3', className)}>
            {loadError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
                    <p className="mb-2 font-semibold text-destructive">No fue posible abrir este PDF.</p>
                    <p className="mb-0">{loadError.message}</p>
                    {loadError.status ? <p className="mt-2 mb-0 text-xs text-muted-foreground">HTTP {loadError.status}</p> : null}
                    {loadError.requestId ? <p className="mb-0 text-xs text-muted-foreground">Request ID: {loadError.requestId}</p> : null}
                    {loadError.backendErrorId ? <p className="mb-0 text-xs text-muted-foreground">Backend Error ID: {loadError.backendErrorId}</p> : null}
                </div>
            ) : pdf ? (
                <div
                    ref={viewportRef}
                    className={cn(
                        'pdf-viewer__viewport min-h-0 overflow-auto rounded-lg border border-border bg-muted/10 p-3',
                        viewportClassName,
                    )}
                >
                    <div className={cn('pdf-viewer__page-wrapper flex min-w-fit justify-center', pageWrapperClassName)}>
                        <Document
                            file={pdf}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="m-0 p-0"
                        >
                            <Page
                                pageNumber={pageNumber}
                                onLoadSuccess={onPageLoadSuccess}
                                width={pageWidth ?? undefined}
                                scale={pageWidth ? undefined : defaultScale}
                            />
                        </Document>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                    Cargando PDF...
                </div>
            )}

            <div className="row py-1 align-items-center">
                <div className="col-12 col-md-6 text-start mb-2 mb-md-0">
                    <label className="pb-3">{hasLoadedPdf ? `Pagina ${pageNumber} de ${numPages}` : 'Previsualización no disponible'}</label>
                    {hasLoadedPdf ? <>
                        <Icon name="chevron-left" size={24} className="mx-2 cursor-pointer" style={_GET_STYLE('left')} onClick={() => prevPage()} />
                        <Icon name="chevron-right" size={24} className="mx-2 cursor-pointer" style={_GET_STYLE('right')} onClick={() => nextPage()} />
                    </> : null}
                </div>
                <div className="col-12 col-md-6 text-end">
                    <form id="form_pdf_viewer_to_page" onSubmit={toPage}>
                    <div className="row">
                        <div className="col-8">
                            <label className="">Ir a pagina: </label>
                        </div>
                        <div className="col-3">
                            <input ref={pageInputRef} type="number" step="1" min="1" className="form-control" defaultValue="1" disabled={!hasLoadedPdf} />
                        </div>
                        <div className="col-1 text-start ms-0 ps-0">
                            {hasLoadedPdf ? <Icon name="chevron-right" size={24} className="ms-0 ps-0 cursor-pointer" onClick={() => toPage()} style={{ color: "DeepSkyBlue" }} /> : null}
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div >
    );
}

export default PDF_VIEWER;