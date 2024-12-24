import React, { Component } from 'react';
import { dateParser, dateParser_finalDate, _MANAGE_IDS } from '../../../../components/customClasses/typeParse';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_SERVICE from '../../../../services/fun.service'
import PQRS_Service from '../../../../services/pqrs_main.service';
import FUN_REPORT_DATA_PDF from './fun_report_data_pdf.component';
import { infoCud } from '../../../../components/jsons/vars';
import { FUN_REPORT_DATA_JODIT } from './fun_report_data_jodit.compoent';
import SubmitService from '../../../../services/submit.service';
import CubXVrDataService from '../../../../services/cubXvr.service';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;

class FUN_REPORT_DATA_EDIT extends Component {
    constructor(props) {
        super(props);
        this.state = {
            vrsRelated: [],
            vrSelected: null,
            cubSelected: null,
            idCUBxVr: null
        };
    }
    componentDidMount() {
        this.retrieveItem();
    }
    async retrieveItem() {
        try {
            await SubmitService.getIdRelated(this.props.currentItem.id_public).then(response => {
                this.setState({ vrsRelated: response.data })
            })
            const responseCubXVr = await CubXVrDataService.getByFUN(this.props.currentItem.id_public);
            const data = responseCubXVr.data.find(item => item.process === 'CONTROL DE DOCUMENTACION ESPECIAL');

            data && this.setState({ vrSelected: data.vr, cubSelected: data.cub, idCUBxVr: data.id })
        } catch (error) {
            console.log(error);
        }
    }
    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion } = this.props;
        const { } = this.state;

        // DATA GETERS
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: "",
                report_data: [],
                report_cub: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data : [];
                _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub : "";
            }
            return _CHILD_VARS;
        }

        let _GET_LAW_REPORT_DATA = () => {
            var _CHILD = _GET_CHILD_LAW();
            if (_CHILD.report_data.length) {
                return _CHILD.report_data.split(",");
            }
            return [];
        }
        let _GET_LAST_ID = () => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    new_id = _MANAGE_IDS(new_id, 'end')
                    document.getElementById('fun_report_data_2').value = new_id;
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el concecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        // COMPONENTS JSX
        let _COMPONENT = () => {
            var _CHILD = _GET_LAW_REPORT_DATA();
            return <>
                <div className="row">
                    <div className="col-8 p-3 ">
                        <label>Curaduría notifico reconocimiento a la entidad interesada</label>
                    </div>
                    <div className="col-4 p-2">
                        <select class="form-select" defaultValue={_CHILD[0]} id="fun_report_data_1">
                            <option value="0">SIN NOTIFICAR</option>
                            <option value="1">NOTIFICADO</option>
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Identificación del oficio (Consecutivo {infoCud.serials.end})</label>
                    </div>
                    <div className="col-4 p-2">
                        <div class="input-group my-1">
                            <input type="text" class="form-control" id="fun_report_data_2"
                                defaultValue={_GET_CHILD_LAW().report_cub || this.state.cubSelected || ""} />
                                <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Documento de entrada asociado({infoCud.serials.start})</label>
                    </div>
                    <div className="col-4 p-2 ">
                        <div class="input-group">
                            <select class="form-select" id="vr_selected" defaultValue={this.state.vrSelected || ""}>
                                <option disabled value=''>Seleccione una opción</option>
                                {this.state.vrsRelated.map((value, key) => (
                                    <option key={value.id} value={value.id_public}>
                                        {value.id_public}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Fecha de Radicación ante la entidad interesada</label>
                    </div>
                    <div className="col-4 p-2">
                        <input type="date" max="2100-01-01" class="form-control" id="fun_report_data_3" defaultValue={_CHILD[2]} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Respuesta entidad interesada radicación</label>
                    </div>
                    <div className="col-4 p-2">
                        <input type="text" class="form-control" id="fun_report_data_4" defaultValue={_CHILD[3]} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Fecha Limite (Fecha radicación mas 10 días hábiles)</label>
                    </div>
                    <div className="col-4 p-2">
                        <label className="fw-bold">{dateParser(dateParser_finalDate(_CHILD[2], 10))}</label>
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Oficio de la entidad interesada</label>
                    </div>
                    <div className="col-4 p-2">
                        <input type="text" class="form-control" id="fun_report_data_5" defaultValue={_CHILD[5]} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-8 p-3">
                        <label>Documento</label>
                    </div>
                    <div className="col-4 p-2">
                        <select class="form-select" id="fun_report_data_6" defaultValue={_CHILD[6]} >
                            <option value="-1">APORTADO FÍSICAMENTE</option>
                            <option value="0">SIN DOCUMENTO</option>
                            {_CHILD_6_SELECT()}
                        </select>
                    </div>
                </div>
            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_law = () => {
            let _CHILD = _GET_CHILD_LAW();
            formData.set('fun0Id', currentItem.id);

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (_CHILD.id) {

                FUN_SERVICE.update_law(_CHILD.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id)
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
            else {
                FUN_SERVICE.create_law(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.requestUpdate(currentItem.id)
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
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
        }

        let save_law = (e) => {
            e.preventDefault();
            formData = new FormData();

            let value = ""
            value += document.getElementById('fun_report_data_1').value + ","
            value += "," // THIS USED TO BE THE CUB VALUE, BUT IT WAS SEPARATED ON ITS OWN VARIABLE IN THE DATA BASE, NOW IM TOO LAZY TO FORMAT ADJUST EVERTHING ELSE
            value += document.getElementById('fun_report_data_3').value + ","
            value += document.getElementById('fun_report_data_4').value + ","
            value += "10,"
            value += document.getElementById('fun_report_data_5').value + ","
            value += document.getElementById('fun_report_data_6').value
            formData.set('report_data', value);

            let new_id = document.getElementById('fun_report_data_2').value;
            formData.set('new_id', new_id);
            let prev_id = _GET_CHILD_LAW().report_cub;
            formData.set('prev_id', prev_id);

            manage_law();
            createVRxCUB_relation(new_id)
            this.retrieveItem();
        }
        let createVRxCUB_relation = (cub_selected) => {
            let vr = document.getElementById("vr_selected").value;
            let cub = cub_selected;
            let formatData = new FormData();

            formatData.set('vr', vr);
            formatData.set('cub', cub);
            formatData.set('fun', currentItem.id_public);
            formatData.set('process', 'CONTROL DE DOCUMENTACION ESPECIAL');
            // let desc = document.getElementById('geng_type').value;
            formatData.set('desc', 'Reporte de reconocimiento');
            let date = document.getElementById('fun_report_data_3').value;
            formatData.set('date', date);

            // Mostrar mensaje inicial de espera
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            if (this.state.idCUBxVr) {
                CubXVrDataService.updateCubVr(this.state.idCUBxVr, formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACIÓN",
                                text: `El consecutivo ya existe, debe de elegir un consecutivo nuevo`,
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        } else {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            } else {
                // Crear relación
                CubXVrDataService.createCubXVr(formatData)
                    .then((response) => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            // Refrescar la UI
                            this.props.requestUpdate(currentItem.id, true);
                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACIÓN",
                                text: `El consecutivo ya existe, debe de elegir un consecutivo nuevo`,
                                icon: 'error',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        } else {
                            MySwal.fire({
                                title: swaMsg.generic_eror_title,
                                text: swaMsg.generic_error_text,
                                icon: 'warning',
                                confirmButtonText: swaMsg.text_btn,
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    });
            }
        };

        return (
            <div className="fun_report_data container_arc">
                <form id="form_report_data_edit" onSubmit={save_law}>
                    {_COMPONENT()}
                    <div className="row text-center">
                        <div className="col-12">
                            <button className="btn btn-success my-3">
                                <i class="far fa-share-square"></i> GUARDAR CAMBIOS
                            </button>
                        </div>
                    </div>
                </form>
                <div className="row">
                    <div className="col-12">
                        <div class="form-check ms-3 px-5">
                            <input class="form-check-input" type="checkbox" onChange={(e) => this.setState({ pdf: e.target.checked })} />
                            <label class="form-check-label text-start" > Generar PDF</label>
                        </div>
                    </div>
                </div>
                <div className="row py-3">
                    {this.state.pdf
                        ?
                        _GLOBAL_ID == 'cb1' ? <FUN_REPORT_DATA_PDF
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={() => this.props.requestUpdate(currentItem.id)} />
                            : <FUN_REPORT_DATA_JODIT
                                translation={translation}
                                swaMsg={swaMsg}
                                globals={globals}
                                currentItem={currentItem}
                                currentVersion={currentVersion}
                            />

                        : ""

                    }
                </div>

            </div >
        );
    }
}

export default FUN_REPORT_DATA_EDIT;