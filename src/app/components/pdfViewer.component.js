import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { PDFDocument } from 'pdf-lib';
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function PDF_VIEWER({ url, apipath }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [leftBtn, setLeftBtn] = useState(1);
    const [rightBtn, setRightBtn] = useState(1);
    const [pdf, setPdf] = useState(null);

    useEffect(() => {
        setPageNumber(1);
        const getPdf = async () => {
            var formUrl = import.meta.env.VITE_API_URL + apipath + url;
            var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
            var pdfDoc = await PDFDocument.load(formPdfBytes);
            const base64String = await pdfDoc.saveAsBase64({ dataUri: true });
            setPdf(base64String);
        };
        getPdf();
    }, []);

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
        let page = Number(document.getElementById('pdf_viewer_page_to').value);
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
        <div className="pdf-viewer">
            <Document
                file={pdf}
                onLoadSuccess={onDocumentLoadSuccess}
                className="m-0 p-0"
            >
                <Page pageNumber={pageNumber} onLoadSuccess={onPageLoadSuccess} scale="1.75" />
            </Document>

            <div className="row py-3">
                <div className="col-6 text-start">
                    <label className="pb-3">Pagina {pageNumber} de {numPages}</label>
                    <i className="fas fa-chevron-circle-left fa-2x mx-2" style={_GET_STYLE('left')} onClick={() => prevPage()} ></i>
                    <i className="fas fa-chevron-circle-right fa-2x mx-2" style={_GET_STYLE('right')} onClick={() => nextPage()} ></i>
                </div>
                <div className="col-6 text-end">
                    <form id="form_pdf_viewer_to_page" onSubmit={toPage}>
                    <div className="row">
                        <div className="col-8">
                            <label className="">Ir a pagina: </label>
                        </div>
                        <div className="col-3">
                            <input type="number" step="1" min="1" id="pdf_viewer_page_to" className="form-control" defaultValue="1" />
                        </div>
                        <div className="col-1 text-start ms-0 ps-0">
                            <i className="fas fa-caret-square-right fa-2x ms-0 ps-0" onClick={() => toPage()} style={{ color: "DeepSkyBlue" }}></i>
                        </div>
                    </div>
                    </form>
                </div>
            </div>
        </div >
    );
}

export default PDF_VIEWER;