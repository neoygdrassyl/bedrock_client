import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { PDFDocument } from 'pdf-lib';
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/umd/Page/AnnotationLayer.css';
import { Button, FlexboxGrid, Message, toaster } from 'rsuite';
import { MDBBtn } from 'mdb-react-ui-kit';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '10%',
        left: '5%',
        right: '5%',
        bottom: '5%',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};

export default function VIEWER(props) {
    const { API, params } = props;

    const [loadData, setLoaddata] = useState(0);
    const [scale, setScale] = useState(1);
    const [numPages, setPages] = useState(1);
    const [pageNumber, setPage] = useState(1);
    const [file, setFile] = useState(null);
    const [urlFile, setFileUrl] = useState(null);
    const [fimage, setImage] = useState(null);
    const [urlImg, setImgUrl] = useState(null);
    const [modalViwewer, setModalV] = useState(false);
    const [pagesComponent, setPagesC] = useState([]);

    useEffect(() => {
        if (modalViwewer) {
            API(...params)
                .then(response => {
                    setFileUrl(null);
                    setFile(null);

                    let data = response.data;
                    let type = { type: response.headers['content-type'] }
                    let docType = getDocType(response.headers['content-type']);

                    const blob = new Blob([data], type);
                    const urlBlob = window.URL.createObjectURL(blob);

                    if (docType == 'pdf') {
                        let url = response.config.baseURL + response.config.url;
                        setFileUrl(url);
                        setFile(urlBlob);
                    }
                    if (docType == 'img') {
                        let url = response.config.baseURL + response.config.url;
                        setImgUrl(url)
                        setImage(urlBlob)
                    }
                    setLoaddata(1);
                })
                .catch(e => {
                    console.log(e);
                    setFile(null);
                    setImage(null);
                    setLoaddata(2);
                });
        }
        
    }, [loadData, modalViwewer, scale]);

    function getDocExt(_filename) {
        if (!_filename) return false;
        let docExt = _filename.substring(_filename.lastIndexOf('.'), _filename.length);
        if (docExt === '.pdf') return 'pdf'
        if (docExt === '.jpg' || docExt === '.png' || docExt === '.jpeg') return 'img'
    }
    function getDocType(_type) {
        if (!_type) return false;
        if (_type === 'application/pdf') return 'pdf'
        if (_type === 'image/png' || _type === 'image/jpg' || _type === 'image/jpeg') return 'img'
    }

    let onDocumentLoadSuccess = ({ numPages }) => {
        console.log('hi!')
        setPages(numPages);
        setPagesComponent(numPages, scale);
        setPage(1);
    }

    let setPagesComponent = (_numPages, _scale) => {
        let pages = [];
        for (let i = 1; i <= _numPages; i++) {
            pages.push(<div id={"viewer_page_" + i}>
                <Page pageNumber={i} scale={_scale} className="border" />
            </div>)
        }
        setPagesC(pages)
    }

    return (
        <>
            <MDBBtn className="btn btn-sm btn-info px-2 ms-2" onClick={() => setModalV(!modalViwewer)} >
                <i class="fas fa-search"></i>
            </MDBBtn>

            <Modal
                contentLabel="MANAGE PROF"
                isOpen={modalViwewer}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between ">
                    <div className='row'>
                        <div class="input-group">
                            <label className=''><i class="fas fa-hard-hat"></i> DOCUMENTOS PROFESIONALES</label>
                        </div>
                    </div>

                    <MDBBtn className='btn-close' color='none' onClick={() => setModalV(!modalViwewer)}></MDBBtn>
                </div>
                <hr />

                <div className='row my-1'>
                    <div className='col-3'>
                        <select class="form-select" defaultValue={scale} onChange={(e) => setScale(e.target.value)}>
                            <option value={0.75}>Zoom x0.75</option>
                            <option value={1}>Zoom x1</option>
                            <option value={1.5}>Zoom x1.5</option>
                            <option value={2}>Zoom x2</option>
                        </select>
                    </div>
                </div>

                <FlexboxGrid justify="center" >
                    {loadData === 0 ?
                        <Message showIcon type={'info'}
                            header={<label className='fw-b'>Cargargando documento...</label>}>
                            <label>Espero un momento</label>
                        </Message>
                        : null}

                    {loadData === 1 && (urlFile || file) ?
                        <FlexboxGrid.Item colspan={24}>
                            <div style={{ paddingLeft: `calc((100vw - ${795 * scale}px)/2)`, paddingRight: `calc((100vw - ${795 * scale}px)/2)` }}>
                                <Document file={urlFile || file} onLoadSuccess={onDocumentLoadSuccess} >
                                    {pagesComponent.map(page => page)}
                                </Document>
                            </div>
                        </FlexboxGrid.Item>
                        : null}

                    {loadData === 2 ?
                        <Message showIcon type={'error'}
                            header={<label className='fw-b'>Documento no encontrado</label>}>
                            <label>El documento no se encontró de la base de datos, comuníquese con el administrador</label>
                        </Message>
                        : null}


                    <FlexboxGrid.Item colspan={24}>
                        <img src={urlImg || fimage} hidden={!urlImg || !fimage} id={'viewer_img'} alt="Image" height={100 * scale + '%'} width={100 * scale + '%'}></img>
                    </FlexboxGrid.Item>


                </FlexboxGrid>
                <hr />
                <div className="text-end py-2">
                    <a className="btn btn-sm btn-danger me-2" href={urlImg || urlFile} target='_blank'><i class="fas fa-cloud-download-alt"></i> DESCARGA</a>
                    <MDBBtn className="btn btn-sm btn-info" onClick={() => setModalV(!modalViwewer)}><i class="fas fa-times-circle"></i> CERRAR</MDBBtn>
                </div>
            </Modal>
        </>
    );
}