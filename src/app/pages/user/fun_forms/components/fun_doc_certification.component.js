import { MDBBtn } from 'mdb-react-ui-kit';
import React, { useEffect, useState } from 'react';


import SERVICE_CERTIFICATIONS from '../../../../services/certifications.service';
import DataTable from 'react-data-table-component';


import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { formsParser1, getJSONFull } from '../../../../components/customClasses/typeParse';
import moment from 'moment';
import { cities, states } from '../../../../components/jsons/vars';


const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

export default function FUN_CERTIFICATION(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, id_related, related } = props;

    var [LIST_A, setListA] = useState([]);
    var [newItem, setNewItem] = useState(false);

    var [load, setLoad] = useState(0);

    useEffect(() => {
        if (load == 0) loadLists();
    }, [load]);


    // ***************************  DATA CONVERTER *********************** //
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            tipo: [],
            tramite: [],
            m_urb: [],
            m_sub: [],
            m_lic: [],
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.tipo = _CHILD[_CURRENT_VERSION].tipo;
                _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                _CHILD_VARS.m_urb = _CHILD[_CURRENT_VERSION].m_urb;
                _CHILD_VARS.m_sub = _CHILD[_CURRENT_VERSION].m_sub;
                _CHILD_VARS.m_lic = _CHILD[_CURRENT_VERSION].m_lic;
            }
        }
        return _CHILD_VARS;

    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        var _CHILD_VARS = {
            item_20: "",
            item_211: "",
            item_212: "",
            item_22: "",
            item_23: "",
            item_24: "",
            item_25: "",
            item_261: "",
            item_262: "",
            item_263: "",
            item_264: "",
            item_265: "",
            item_266: "",
        }
        if (_CHILD) {
            _CHILD_VARS.item_20 = _CHILD.id;
            _CHILD_VARS.item_211 = _CHILD.direccion;
            _CHILD_VARS.item_212 = _CHILD.direccion_ant;
            _CHILD_VARS.item_22 = _CHILD.matricula;
            _CHILD_VARS.item_23 = _CHILD.catastral;
            _CHILD_VARS.item_24 = _CHILD.suelo; // PARSER
            _CHILD_VARS.item_25 = _CHILD.lote_pla;// PARSER

            _CHILD_VARS.item_261 = _CHILD.barrio;
            _CHILD_VARS.item_262 = _CHILD.vereda;
            _CHILD_VARS.item_263 = _CHILD.comuna;
            _CHILD_VARS.item_264 = _CHILD.sector;
            _CHILD_VARS.item_265 = _CHILD.corregimiento;
            _CHILD_VARS.item_266 = _CHILD.lote;
            _CHILD_VARS.item_267 = _CHILD.estrato;
            _CHILD_VARS.item_268 = _CHILD.manzana;
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_53 = () => {
        var _CHILD = currentItem.fun_53s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_530: "",
            item_5311: "",
            item_5312: "",
            item_532: "",
            item_533: "",
            item_534: "",
            item_535: "",
            item_536: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
            }
        }
        return _CHILD_VARS;
    }

    // ***************************  JXS *********************** //
    let _COMPONENT_NEW = () => {
        var _CHILD_1 = _GET_CHILD_1();
        var _CHILD_2 = _GET_CHILD_2();
        var _CHILD_53 = _GET_CHILD_53();

        return <>

            <div className='row mb-2'>
                <div className="col">
                    <label>Fecha del documento</label>
                    <input type="date" class="form-control" max='2100-01-01' id="genc_date_doc" required
                        defaultValue={moment().format('YYYY-MM-DD')} />
                </div>

                <div className="col">
                    <label>Número de Radicación</label>
                    <input type="text" class="form-control" id="genc_id_public" disabled
                        defaultValue={currentItem.id_public} />
                </div>
                <div className="col">
                    <label>Estado Proyecto</label>
                    <div class="input-group">
                        <select class="form-select" id={"genc_state"}>
                            <option>ESTUDIOS Y TRAMITES</option>
                            <option>OTORGADA</option>
                            <option>DESISTIDA</option>
                            <option>NEGADA</option>
                            <option>RENUNCIADA</option>
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Ciudad</label>
                    <div class="input-group">
                        <select class="form-select" id={"genc_city"}>
                            {cities}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Departamento</label>
                    <div class="input-group">
                        <select class="form-select" id={"genc_county"}>
                            {states}
                        </select>
                    </div>
                </div>
            </div>
            <div className='row mb-2'>
                <div className="col">
                    <label>Responsable</label>
                    <input type="text" class="form-control" id="genc_name"
                        defaultValue={_CHILD_53.item_5311 + " " + _CHILD_53.item_5312} />
                </div>
                <div className="col">
                    <label>Documento</label>
                    <input type="text" class="form-control" id="genc_id_number"
                        defaultValue={_CHILD_53.item_532} />
                </div>
                <div className="col">
                    <label>Dirección Responsable</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="genc_address"
                            defaultValue={_CHILD_53.item_536} />
                    </div>
                </div>
                <div className="col">
                    <label>En Calidad:</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="genc_role"
                            defaultValue={_CHILD_53.item_533} />
                    </div>
                </div>
            </div>
            <div className='row mb-2'>
                <div className="col-12">
                    <label>Modalidad</label>
                    <input type="text" class="form-control" id="genc_type"
                        defaultValue={formsParser1(_CHILD_1)} />
                </div>
                <div className="col">
                    <label>Dirección Predio</label>
                    <input type="text" class="form-control" id="genc_address2"
                        defaultValue={_CHILD_2.item_211} />
                </div>
                <div className="col">
                    <label>Matricula</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="genc_matricula"
                            defaultValue={_CHILD_2.item_22} />
                    </div>
                </div>
                <div className="col">
                    <label>Predial</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="genc_predial"
                            defaultValue={_CHILD_2.item_23} />
                    </div>
                </div>
            </div>

        </>
    }

    // ***************************  DATATABLES *********************** //
    const columns = [
        {
            name: <label className="text-center">Consecutivo</label>,
            selector: row => row.id_public,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <h6 className='fw-normal'>{(row.id_public)}</h6>

        },
        {
            name: <label className="text-center">Fecha Exp.</label>,
            selector: row => row.createdAt,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => <h6 className='fw-normal'>{moment(row.createdAt).format('YYYY-MM-DD HH:mm')}</h6>

        },
        {
            name: <label className="text-center">Acción</label>,
            center: true,
            maxWidth: '80px',
            cell: row => <MDBBtn onClick={() => gen_confirmDoc(row.id_public, getJSONFull(row.content))}
            color="danger" size="sm" className='m-0 p-1 px-2'><i class="fas fa-file-download"></i></MDBBtn>

        },
    ]

    const ExpandedComponent = ({ data }) => {
        var oc = data.id_public;
        var content = getJSONFull(data.content)
        return <>
            <div className='row m-2'>
                <div className='col border p-2 '>
                    <div className='row'>
                        <div className='col'><label>Consecutivo: </label></div>
                        <div className='col'><label className='fw-bold'>{oc}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Fecha y hora creación: </label></div>
                        <div className='col'><label className='fw-bold'>{moment(data.createdAt).format('YYYY-MM-DD HH:mm')}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Fecha documento: </label></div>
                        <div className='col'><label className='fw-bold'>{content.date_doc}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Radicado:</label></div>
                        <div className='col'><label className='fw-bold'>{content.id_public}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Estado proyecto: </label></div>
                        <div className='col'><label className='fw-bold'>{content.state}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col-3'><label>Modalidad: </label></div>
                        <div className='col'><label className='fw-bold'>{content.type}</label></div>
                    </div>
                </div>
                <div className='col border p-2'>
                    <div className='row'>
                        <div className='col'><label>Ciudad: </label></div>
                        <div className='col'><label className='fw-bold'>{content.city}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Departamento: </label></div>
                        <div className='col'><label className='fw-bold'>{content.county}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Responsable: </label></div>
                        <div className='col'><label className='fw-bold'>{content.name}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Documento: </label></div>
                        <div className='col'><label className='fw-bold'>{content.id_number}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Dirección responsable: </label></div>
                        <div className='col'><label className='fw-bold'>{content.address}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Calidad responsable: </label></div>
                        <div className='col'><label className='fw-bold'>{content.role}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Dirección predio: </label></div>
                        <div className='col'><label className='fw-bold'>{content.address2}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Matricula predio: </label></div>
                        <div className='col'><label className='fw-bold'>{content.matricula}</label></div>
                    </div>
                    <div className='row'>
                        <div className='col'><label>Predial: </label></div>
                        <div className='col'><label className='fw-bold'>{content.predial}</label></div>
                    </div>
                </div>
            </div>

        </>
    };

    let _ARCHIVE_LIST_COMPONENT = () => {
        return <DataTable
            title={<>LISTADO DE CERTIFICACIONES  <i class="fas fa-file-signature"></i></>}

            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}

            noDataComponent="NO HAY CERTIFICACIONES"
            striped="true"
            columns={columns}
            data={LIST_A}
            highlightOnHover
            dense


            progressPending={!load}
            progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

            expandableRows
            expandableRowsComponent={ExpandedComponent}

            defaultSortFieldId={1}
        />
    }

    // ***************************  APIS *********************** //
    function loadLists() {
        SERVICE_CERTIFICATIONS.get_re(id_related, related)
            .then(response => {
                setListA(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function createCert() {
        let formData = new FormData();
        formData.set('description', 'CERTIFICACIÓN DE ACTUACIÓN URBANÍSTICA - ' + currentItem.id_public);
        formData.set('related', 'fun');
        formData.set('id_related', currentItem.id_public);

        var content = {};


        content.date_doc = document.getElementById("genc_date_doc").value;
        content.id_public = document.getElementById("genc_id_public").value;
        content.state = document.getElementById("genc_state").value;
        content.city = document.getElementById("genc_city").value;
        content.county = document.getElementById("genc_county").value;
        content.name = document.getElementById("genc_name").value;
        content.id_number = document.getElementById("genc_id_number").value;
        content.address = document.getElementById("genc_address").value;
        content.role = document.getElementById("genc_role").value;
        content.type = document.getElementById("genc_type").value;
        content.address2 = document.getElementById("genc_address2").value;
        content.matricula = document.getElementById("genc_matricula").value;
        content.predial = document.getElementById("genc_predial").value;

        formData.set('content', JSON.stringify(content));


        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        SERVICE_CERTIFICATIONS.create(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    setLoad(0);
                    setNewItem(false);
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

    function gen_confirmDoc(oc, data) {
    
        let formData = new FormData();
        formData.set('date_doc', data.date_doc);
        formData.set('id_oc', oc);
        formData.set('id_public', data.id_public);
        formData.set('state', data.state);
        formData.set('type', data.type);
        formData.set('city', data.city);
        formData.set('county', data.county);
        formData.set('name', data.name);
        formData.set('id_number', data.id_number);
        formData.set('address', data.address);
        formData.set('role', data.role);
        formData.set('address2', data.address2);
        formData.set('matricula', data.matricula);
        formData.set('predial', data.predial);


        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        SERVICE_CERTIFICATIONS.gendoc_cert_fun(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/cert/fun/" + "CERTIFICACION ACTUACION URBANISTICA " + currentItem.id_public + ".pdf");
                } else {
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
                <div className='col'>
                    <MDBBtn outline={!newItem} size='sm' rounded onClick={() => setNewItem(!newItem)}><i class="fas fa-plus"></i> NUEVA CERTIFICACIÓN</MDBBtn>
                </div>
            </div>
            {newItem ? <>
                <div className='border p-2'>
                    {_COMPONENT_NEW()}
                    <div className='text-center my-2'>
                        <MDBBtn size='sm' rounded onClick={() => createCert()} color="success"><i class="fas fa-plus"></i> CREAR</MDBBtn>
                    </div>
                </div>
            </> : ''}

            {_ARCHIVE_LIST_COMPONENT()}
        </>
    );
}
