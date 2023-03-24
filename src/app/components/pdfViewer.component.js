import 'react-pdf/dist/umd/Page/AnnotationLayer.css';
import { PDFDocument } from 'pdf-lib';
import React, { Component } from 'react';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

class PDF_VIEWER extends Component {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            pageNumber: 1,
            leftBtn: 1,
            rightBtn: 1,
        };
    }
    componentDidMount() {
        this.setState({
            pageNumber: 1,
        });
        this.getPdf();
    }
    prevPage = () => {
        if (this.state.pageNumber > 1) {
            this.setState({
                pageNumber: this.state.pageNumber - 1,
            });
        }
    }
    nextPage = () => {
        if (this.state.pageNumber < this.state.numPages) this.setState({
            pageNumber: this.state.pageNumber + 1,
        });

    }
    toPage = (e) => {
        if (e) e.preventDefault();
        let page = Number(document.getElementById('pdf_viewer_page_to').value)
        if (page > 0 && page <= this.state.numPages) this.setState({ pageNumber: page })
    }
    async getPdf() {
        var formUrl = process.env.REACT_APP_API_URL + this.props.apipath + this.props.url;
        var formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
        var pdfDoc = await PDFDocument.load(formPdfBytes);
        const base64String = await pdfDoc.saveAsBase64({ dataUri: true })
        this.setState({ pdf: base64String })
    }
    render() {
        const { url, apipath } = this.props;
        const { numPages, pageNumber } = this.state;

        let onDocumentLoadSuccess = ({ numPages }) => {
            this.setState({
                numPages: numPages,
                pageNumber: 1,
            });
        }
        let onPageLoadSuccess = () => {
            if (numPages == 1) {
                this.setState({
                    rightBtn: 1,
                    leftBtn: 1,
                });
            } else {
                if (pageNumber >= numPages) {
                    this.setState({
                        rightBtn: 1,
                        leftBtn: 0,
                    });
                }
                if (pageNumber == 1) {
                    this.setState({
                        rightBtn: 0,
                        leftBtn: 1,
                    });
                }
            }
        }
        let _GET_STYLE = (btn) => {
            if (btn == 'left') {
                if (pageNumber == 1) return { color: "SkyBlue" }
                else return { color: "DeepSkyBlue" }
            }
            if (btn == 'right') {
                if (pageNumber < numPages) return { color: "DeepSkyBlue" }
                else return { color: "SkyBlue" }
            }
        }
        return (
            <div className="pdf-viewer">
                <Document
                    file={this.state.pdf}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="m-0 p-0"
                >
                    <Page pageNumber={pageNumber} onLoadSuccess={onPageLoadSuccess} scale="1.75" />
                </Document>

                <div class="row py-3">
                    <div class="col-6 text-start">
                        <label className="pb-3">Pagina {pageNumber} de {numPages}</label>
                        <i class="fas fa-chevron-circle-left fa-2x mx-2" style={_GET_STYLE('left')} onClick={() => this.prevPage()} ></i>
                        <i class="fas fa-chevron-circle-right fa-2x mx-2" style={_GET_STYLE('right')} onClick={() => this.nextPage()} ></i>
                    </div>
                    <div class="col-6 text-end">
                        <form id="form_pdf_viewer_to_page" onSubmit={this.toPage}>
                        <div className="row">
                            <div class="col-8">
                                <label className="">Ir a pagina: </label>
                            </div>
                            <div class="col-3">
                                <input type="number" step="1" min="1" id="pdf_viewer_page_to" className="form-control" defaultValue="1" />
                            </div>
                            <div class="col-1 text-start ms-0 ps-0">
                                <i class="fas fa-caret-square-right fa-2x ms-0 ps-0" onClick={() => this.toPage()} style={{ color: "DeepSkyBlue" }}></i>
                            </div>
                        </div>
                        </form>
                    </div>
                </div>
            </div >
        );
    }
}

export default PDF_VIEWER;