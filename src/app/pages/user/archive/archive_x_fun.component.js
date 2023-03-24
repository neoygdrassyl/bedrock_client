import { MDBBtn, MDBTooltip } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';
import ReactHTMLDatalist from 'react-html-datalist';
import ReactModal from 'react-modal';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { formsParser1, getJSON, getJSONFull, _GET_SERIE_COD, _GET_SUBSERIE_COD } from '../../../components/customClasses/typeParse';

import SERVICE_ARCHIVE from '../../../services/archive.service';
import FUN_6_UPLOAD from '../fun_forms/components/fun_6_upload.component';
import FUN_6_VIEW from '../fun_forms/fun_6.view';


const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);
const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '10px',
        left: '20%',
        right: '15%',
        bottom: '10px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }

};
export default function ARCHIVE_X_FUN(props) {
    const { translation, swaMsg, globals, currentItem } = props;
    var [LIST, setList] = useState([]);
    var [edit, setEdit] = useState([]);
    var [anex, setAnex] = useState({});

    var [load, setLoad] = useState(0);
    var [loadF6, setLoadf6] = useState(1);

    var [modal_d, setModal_d] = useState(false);

    var [searchingP, setSearchingP] = useState('');
    var [dataList, setDataList] = useState([]);
    var [currentLic, setLic] = useState(null);

    useEffect(() => {
        if (load == 0) loadLists();
    }, [load]);


    // ***************************  DATA CONVERTER *********************** //
    function process_dataList(inputText, dataList, _scope) {
        loadXList(inputText);

        if (dataList) {
            let lic = JSON.parse(dataList);
            setLic(lic);

        }
    }

    // ***************************  JXS *********************** //
    let _LIC_SEARCHER = (_scope) => {

        return <>
            <div className="row">
                <div className="col">
                    <label>Añadir licencia {searchingP ? <label className='fw-bold'>Buscando...</label> : ''}</label>
                    <div class="input-group my-1">
                        <span class="input-group-text bg-primary text-white">
                            <i class="fas fa-search"></i>
                        </span>
                        <ReactHTMLDatalist
                            name={"lic"}
                            onChange={(e) => process_dataList(e.target.text, e.target.value, _scope)}
                            classNames={"form-control"}
                            options={dataList.map((v, i) => {
                                let searchTerm = (v.id_public).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
                                return { text: searchTerm, value: JSON.stringify(v) }
                            })}
                        />
                    </div>
                </div>
            </div>
        </>
    }

    let _INFO_COMPONENET = () => {
        var _CHILD = {
            item_1: currentLic ? currentLic['fun_1s.tipo'] : "",
            item_2: currentLic ? currentLic['fun_1s.tramite'] : "",
            item_3: currentLic ? currentLic['fun_1s.m_urb'] : "",
            item_4: currentLic ? currentLic['fun_1s.m_sub'] : "",
            item_5: currentLic ? currentLic['fun_1s.m_lic'] : "",

            tipo: currentLic ? currentLic['fun_1s.tipo'] : "",
            tramite: currentLic ? currentLic['fun_1s.tramite'] : "",
            m_urb: currentLic ? currentLic['fun_1s.m_urb'] : "",
            m_sub: currentLic ? currentLic['fun_1s.m_sub'] : "",
            m_lic: currentLic ? currentLic['fun_1s.m_lic'] : "",

            direccion: currentLic ? currentLic['direccion'] : "",
            catastral: currentLic ? currentLic['catastral'] : "",
        }
        let _SERIE = _GET_SERIE_COD(_CHILD);
        let _SUBSERIE = _GET_SUBSERIE_COD(_CHILD);
        return <>
            {currentLic ?
                <>
                    <hr />
                    <div className='row'>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Serie: <label className='fw-bold'>{_SERIE}</label></label>
                        </div>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Subserie: <label className='fw-bold'>{_SUBSERIE}</label></label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Modalidad:</label> <label className='fw-bold'>{formsParser1(_CHILD)}</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Dirección: <label className='fw-bold'>{_CHILD.direccion}</label></label>
                        </div>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Predial: <label className='fw-bold'>{_CHILD.catastral}</label></label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Carpeta</label>
                            <input type="number" step={1} defaultValue={currentLic ? currentLic.box : ''} class="form-control" id="achr_4" />
                        </div>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Folios</label>
                            <input type="number" step={1} defaultValue={currentLic ? currentLic.row : ''} class="form-control" id="achr_5" />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Fecha Inicio</label>
                            <input type="date" defaultValue={currentLic ? currentLic.clocks_start : ''} class="form-control" id="achr_6" />
                        </div>
                        <div className='col'>
                            <label for="exampleFormControlInput1">Fecha Final</label>
                            <input type="date" defaultValue={currentLic ? currentLic.clocks_end : ''} class="form-control" id="achr_7" />
                        </div>
                        <div className='col'>
                            <label for="exampleFormControlInput1">N° Resolución</label>
                            <input type="text" defaultValue={currentLic ? currentLic.exp_id : ''} class="form-control" id="achr_8" />
                        </div>
                    </div>
                    <div className='row my-2'>
                        <div className='col text-end'>
                            <MDBBtn size='sm' color='primary' onClick={() => addxList()}><i class="fas fa-plus-circle"></i> AÑADIR ITEM</MDBBtn>
                        </div>
                    </div>
                </>
                : <div className='col my-2'> <label className='text-muted fw-bold ms-5'>Busque y seleccione una Licencia...</label>
                </div>}
        </>
    }

    let _UPDATE_COMPONENT = (row) => {

        let clocks_start = getJSON(row.json, 'clocks_start');
        let clocks_end = getJSON(row.json, 'clocks_end');
        let exp_id = getJSON(row.json, 'exp_id');
        return <><div className='row'>
            <div className='col'>
                <label for="exampleFormControlInput1">Carpeta</label>
                <input type="number" step={1} defaultValue={row.folder} class="form-control" id="achr_4_edit" />
            </div>
            <div className='col'>
                <label for="exampleFormControlInput1">Carpeta</label>
                <input type="number" step={1} defaultValue={row.pages} class="form-control" id="achr_5_edit" />
            </div>
        </div>
            <div className='row'>
                <div className='col'>
                    <label for="exampleFormControlInput1">Fecha Inicio</label>
                    <input type="date" defaultValue={clocks_start} class="form-control" id="achr_6_edit" />
                </div>
                <div className='col'>
                    <label for="exampleFormControlInput1">Fecha Final</label>
                    <input type="date" defaultValue={clocks_end} class="form-control" id="achr_7_edit" />
                </div>
                <div className='col'>
                    <label for="exampleFormControlInput1">N° Resolución</label>
                    <input type="text" defaultValue={exp_id != false ? exp_id : ''} class="form-control" id="achr_8_edit" />
                </div>
            </div>
            <div className='row my-2'>
                <div className='col text-end'>
                    <MDBBtn size='sm' color='primary' onClick={() => UpdateXList(row)}><i class="far fa-edit"></i> ACTUALIZAR ITEM</MDBBtn>
                </div>
            </div>
        </>
    }

    let _LIST_COMPONENET = () => {
        return <>
            <hr />
            <div className='row'>
                <div className='col text-center border'>
                    <label className='fw-bold'>ITEMS EN ESTA CAJA</label>
                </div></div>
            {LIST.length == 0 ? <div className='row'>
                <div className='col border text-center'>
                    <label>Esta caja no tiene ningún item asociada a ella</label>
                </div>
            </div> : ''}
            {LIST.map((it, i) => {
                var id_public = getJSON(it.json, 'id_public');
                var id = getJSON(it.json, 'id');
                var licItem = getJSONFull(it.json)
                return <><div className='row'>
                    <div className='col border'>
                        <label>N° Radicación: <label className='fw-bold'>{id_public}</label></label>
                    </div>
                    <div className='col-2 border'>
                        <label>Carppeta: <label className='fw-bold'>{it.folder}</label></label>
                    </div>
                    <div className='col-2 border'>
                        <label>Folios: <label className='fw-bold'>{it.pages}</label></label>
                    </div>
                    <div className='col-2 border text-center'>
                        <MDBTooltip title='Administrar documentos item' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                            <MDBBtn color='primary' size='sm' className='px-1 py-1' onClick={() => { setAnex(licItem); setModal_d(!modal_d) }}><i class="fas fa-cloud-upload-alt"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Actualizar item de esta caja' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                            <MDBBtn color='secondary' size='sm' className='px-1 py-1' onClick={() => edit[i] ? setEdit({ [i]: null }) : setEdit({ [i]: it })}><i class="far fa-edit"></i></MDBBtn>
                        </MDBTooltip>
                        <MDBTooltip title='Eliminar item de esta caja' wrapperProps={{ color: false, shadow: false }} wrapperClass="m-0 p-0 me-1">
                            <MDBBtn color='danger' size='sm' className='px-1 py-1' onClick={() => delete_x(id, currentItem.id, currentItem.folder)}><i class="far fa-trash-alt"></i></MDBBtn>
                        </MDBTooltip>


                    </div>
                </div>
                    {edit[i] ?
                        <div className='row border border-secondary'>
                            <div className='col'>
                                {_UPDATE_COMPONENT(edit[i])}
                            </div>
                        </div> : ''}
                </>
            })}
        </>
    }
    // ***************************  DATATABLES *********************** //


    // ***************************  APIS *********************** //
    function loadLists() {
        SERVICE_ARCHIVE.get_box(currentItem.id)
            .then(response => {
                setList(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function loadXList(public_id) {
        if (!public_id) return;
        setSearchingP(true);
        SERVICE_ARCHIVE.get_x_list(public_id)
            .then(response => {
                setDataList(response.data);
                setSearchingP(false);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function addxList() {
        let formData = new FormData();

        let folder = document.getElementById("achr_4").value;
        formData.set('folder', folder);

        let pages = document.getElementById("achr_5").value;
        formData.set('pages', pages);

        let json = currentLic;

        let clocks_start = document.getElementById("achr_6").value;
        json.clocks_start = clocks_start;
        let clocks_end = document.getElementById("achr_7").value;
        json.clocks_end = clocks_end;
        let exp_id = document.getElementById("achr_8").value;
        json.exp_id = exp_id;

        json = JSON.stringify(currentLic);

        formData.set('json', json);

        formData.set('funArchiveId', currentItem.id);
        formData.set('fun0Id', currentLic.id);

        SERVICE_ARCHIVE.create_x(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadLists();
                    props.UPDATE();
                }
                else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }

    function UpdateXList(row) {
        let formData = new FormData();

        let folder = document.getElementById("achr_4_edit").value;
        formData.set('folder', folder);

        let pages = document.getElementById("achr_5_edit").value;
        formData.set('pages', pages);

        let json = getJSONFull(row.json);

        let FunId = json.id

        let clocks_start = document.getElementById("achr_6_edit").value;
        json.clocks_start = clocks_start;
        let clocks_end = document.getElementById("achr_7_edit").value;
        json.clocks_end = clocks_end;
        let exp_id = document.getElementById("achr_8_edit").value;
        json.exp_id = exp_id;

        json = JSON.stringify(json);

        formData.set('json', json);


        SERVICE_ARCHIVE.update_x(FunId, currentItem.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadLists();
                    props.UPDATE();
                }
                else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });

    }

    function delete_x(idFun, idArch, folder) {
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        SERVICE_ARCHIVE.delete_x(idFun, idArch, folder)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadLists();
                }
                else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    return (
        <>
            <div className='row'>
                <div className='col text-start'>
                    {_LIC_SEARCHER()}
                </div>
            </div>

            <div className='row'>
                <div className='col'>
                    {_INFO_COMPONENET()}
                </div>
            </div>

            {load == 0 ?
                <div className='row'>
                    <label className='col fw-normal lead text-muted text-center'>CARGANDO...</label>
                </div>
                : <div className='row'>
                    <div className='col'>
                        {_LIST_COMPONENET()}
                    </div>
                </div>}

            <ReactModal contentLabel="FUN DOC CONTROL"
                isOpen={modal_d}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <label><i class="fas fa-archive"></i> GESTIÓN DOCUMENTAL - No. Radicación :  {anex.id_public} </label>
                    <MDBBtn className='btn-close' color='none' onClick={() => setModal_d(!modal_d)}></MDBBtn>
                </div>
                <hr />

                <FUN_6_VIEW
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={anex}
                    currentId={anex.id}
                    currentVersion={anex.version}
                    title={'Documentos giditalizados'}
                    parentLoad={loadF6}
                    updateParentLoad={(v) => setLoadf6(v)}
                    requestUpdate={() => loadLists()}
                />
                <hr />
                <label className="app-p lead fw-normal text-uppercase">ANEXAR DOCUMENTOS</label>

                <FUN_6_UPLOAD
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={anex}
                    currentId={anex.id}
                    currentVersion={anex.version}
                    requestUpdate={() => { setLoadf6(0) }}
                />

                <hr />
                <div className="text-end">
                    <MDBBtn color='info' size='sm' onClick={() => setModal_d(!modal_d)}>
                        <label ><i class="fas fa-times-circle"></i> CERRAR</label>
                    </MDBBtn>
                </div>
            </ReactModal>
        </>
    );
}
