import { MDBBtn } from 'mdb-react-ui-kit';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { dateParser, formsParser1, getJSONFull } from '../../../../components/customClasses/typeParse';
import sealService from '../../../../services/seal.service';
import CustomService from '../../../../services/custom.service';

const MySwal = withReactContent(Swal);
class FUN_SEAL extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSeal: null,
        };
    }
    componentDidMount() {
        this.retrieveSeal(this.props.currentItem.id_public)
    }
    retrieveSeal(id) {
        sealService.getParent(id)
        .then(response => {
            this.setState({
                currentSeal: response.data[0].seal,
            })
        })
        .catch(e => {
            console.log(e);
            this.setState({
                currentSeal: false,
            })
        });
    }
    componentDidUpdate(prevState) {
        if (this.state.currentSeal !== prevState.currentSeal && this.state.currentSeal != null) {
            var _ITEM = this.state.currentSeal;
            document.getElementById("seal_3").value = _ITEM.id_public;
            document.getElementById("seal_4").value = _ITEM.area;
            document.getElementById("seal_5").value = this.props.currentItem.date;
            document.getElementById("seal_6").value = _ITEM.blueprints;
            document.getElementById("seal_7").value = _ITEM.drives;
            document.getElementById("seal_8").value = _ITEM.folders;
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { currentSeal } = this.state;

        var sael_name = ''
        if(currentItem.expedition) sael_name += currentItem.expedition.id_public ? `RESOLUCIÓN ${currentItem.expedition.id_public} DEL ` : '';
        if(currentItem.expedition){
            var reso = getJSONFull(currentItem.expedition.reso)
            if (reso.date) sael_name += currentItem.expedition.tmp ? `${dateParser(reso.date).toUpperCase()} ` : '';
        } 
        if(currentItem.id_public) sael_name += `No. ${currentItem.id_public}`

        // DATA GETTERS
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
        let _GET_SEAL = () => {
            var _CHILD = currentSeal;
            var _CHILD_VARS = {
                id: "",
                id_public: "",
                area: "",
                date: "",
                blueprints: "",
                drives: "",
                folders: "",
            }
            if (_CHILD) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.id_public = _CHILD.id_public;
                _CHILD_VARS.area = _CHILD.area;
                _CHILD_VARS.date = _CHILD.date;
                _CHILD_VARS.blueprints = _CHILD.blueprints;
                _CHILD_VARS.drives = _CHILD.drives;
                _CHILD_VARS.folders = _CHILD.folders;
            }
            return _CHILD_VARS;
        }
        var _CHILD_SEAL = _GET_SEAL();
        //

        // FUNCTIONS & APIS
        var formData = new FormData();
        let save_seal = (e) => {
            e.preventDefault();

            let fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let id_public = document.getElementById("seal_3").value;
            if(id_public) formData.set('id_public', id_public);
            let area = document.getElementById("seal_4").value;
            if(area) formData.set('area', area);
            let date = document.getElementById("seal_5").value;
            if(date) formData.set('date', date)
            let blueprints = document.getElementById("seal_6").value;
            if(blueprints) formData.set('blueprints', blueprints);
            let drives = document.getElementById("seal_7").value;
            if(drives) formData.set('drives', drives);
            let folders = document.getElementById("seal_8").value;
            if(folders) formData.set('folders', folders);
           
            manage_seal(true)
        }
        let manage_seal = (useMySwal) => {
            if (useMySwal) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
            }
            if (_CHILD_SEAL.id) {
                sealService.update(_CHILD_SEAL.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.retrieveSeal(currentItem.id_public);
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
            else {
                sealService.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.publish_success_title,
                                    text: swaMsg.publish_success_text,
                                    footer: swaMsg.text_footer,
                                    icon: 'success',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                            this.retrieveSeal(currentItem.id_public);
                        } else {
                            if (useMySwal) {
                                MySwal.fire({
                                    title: swaMsg.generic_eror_title,
                                    text: swaMsg.generic_error_text,
                                    icon: 'warning',
                                    confirmButtonText: swaMsg.text_btn,
                                });
                            }
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        if (useMySwal) {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    });
            }
        }

        // GENERATES AND GETS PDF SEAL
        let generate_pdf = (type) => {
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            formData = new FormData();
            // DATA FROM THE PARENT
            let id_request =document.getElementById("seal_1").value
            formData.set('id_request', id_request);
            let fun_id = currentItem.id_public
            formData.set('fun_id', fun_id);
            let mode = document.getElementById("seal_2").value
            formData.set('mode', mode);
            let date = document.getElementById("seal_5").value
            formData.set('date', date);
            // DATA ON DEMAND
            let _type = type ? "ORIGINAL" : "TITULAR";
            formData.set('type', _type);
            // DATA FROM THE CURRENT ITEM 
            let id_public = document.getElementById("seal_3").value
            formData.set('id_public', id_public);
            let area =document.getElementById("seal_4").value
            let m =document.getElementById("seal_4_m").value
            formData.set('area', area+' '+m);
            let blueprints = document.getElementById("seal_6").value
            formData.set('blueprints', blueprints);
            let drives = document.getElementById("seal_7").value
            formData.set('drives', drives);
            let folders = document.getElementById("seal_8").value
            formData.set('folders', folders);
            let custom = document.getElementById("seal_custom_text").value
            formData.set('custom', custom);
            

            CustomService.generate(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/seal/" + "Sello_" + id_request + ".pdf");
                        document.getElementById("app-form").reset();
                        formData = new FormData();
                        this.refreshList();
                        MySwal.close();
                    } else {
                        
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        };
        return (
            <div className="py-3">
                <form onSubmit={save_seal} id="app-form">
                    <div className="row">
                        <div className=" col-12">
                            <label>No. Radicación</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={sael_name} id="seal_1" />
                            </div>
                        </div>
                    </div>

                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="far fa-check-circle"></i>
                        </span>
                        <input type="text" class="form-control" value="Modalidad" disabled />
                    </div>
                    <textarea class="form-control mb-3" rows="3" id="seal_2"  defaultValue={formsParser1(_GET_CHILD_1())} ></textarea>
                    <div className="row">
                        <div className=" col-4">
                            <label>Consecutivo Sello</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Consecutivo Sello" id="seal_3" 
                                 defaultValue={_CHILD_SEAL.id_public} />
                            </div>
                        </div>
                        <div className=" col-2 me-0">
                            <label>Área total</label>
                            <div class="input-group mb-3 me-0">
                                <input type="number" min="1" step="0.01" class="form-control" placeholder="Area Total" id="seal_4" 
                                defaultValue={_CHILD_SEAL.area}/>
                            </div>
                        </div>
                        <div className=" col-2 ms-0">
                            <label></label>
                            <div class="input-group mb-3 ms-0">
                            <select className='form-select' id="seal_4_m"> 
                                <option>m</option>
                                <option selected>m2</option>
                                <option>m3</option>
                            </select>
                            </div>
                        </div>
                        <div className=" col-4">
                            <label>Fecha</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="far fa-calendar-alt"></i>
                                </span>
                                <input type="date" class="form-control" placeholder="Fecha de Expedicion" id="seal_5" />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className=" col-4">
                            <label>Planos</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-ruler-combined"></i>
                                </span>
                                <input type="number" min="0" step="1" class="form-control" placeholder="Planos" id="seal_6"
                                defaultValue={_CHILD_SEAL.blueprints} />
                            </div>
                        </div>
                        <div className=" col-4">
                            <label>Memorias</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-database"></i>
                                </span>
                                <input type="number" min="0" step="1" class="form-control" placeholder="Memorias" id="seal_7"
                                defaultValue={_CHILD_SEAL.drives} />
                            </div>
                        </div>
                        <div className=" col-4">
                            <label>Estudios</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-file-invoice"></i>
                                </span>
                                <input type="number" min="0" step="1" class="form-control" placeholder="Estudios" id="seal_8"
                                defaultValue={_CHILD_SEAL.folders} />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className=" col">
                            <label>Aprobación personalizada</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-ruler-combined"></i>
                                </span>
                                <input type="text" class="form-control" placeholder="Con este plano se aprueban..." id="seal_custom_text"
                                defaultValue={''} />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className=" col-4">
                            <div className="text-center py-4 mt-3">
                                <button className="btn btn-success"><i class="fas fa-file-import"></i> GUARDAR CAMBIOS </button>
                            </div>
                        </div>
                        <div className=" col-4">
                            <div className="text-center py-4 mt-3">
                                <MDBBtn className="btn btn-warning" onClick={() => generate_pdf(1)}><i class="far fa-file"></i> GENERAR ORIGINAL </MDBBtn>
                            </div>
                        </div>
                        <div className=" col-4">
                            <div className="text-center py-4 mt-3">
                                <MDBBtn className="btn btn-warning" onClick={() => generate_pdf(0)}><i class="far fa-file"></i> GENERAR TITULAR </MDBBtn>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}


export default FUN_SEAL;