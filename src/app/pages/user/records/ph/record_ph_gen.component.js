import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VIZUALIZER from '../../../../components/vizualizer.component';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service'

const MySwal = withReactContent(Swal);

class RECORD_PH_GEN extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = this.props;
        const { } = this.state;

        // DATA GETTERS
        let _GET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_REVIEW_GEN = () => {
            var _CHILD = currentRecord.review_gen;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD.split(';');
            }
            return _LIST;
        }
        // DATA CONVERTERS
        let _SET_DUTY = (_value) => {
            if (_value == 1) {
                document.getElementById('duty_1').disabled = false;
                document.getElementById('duty_2').disabled = false;
            } else {
                document.getElementById('duty_1').disabled = true;
                document.getElementById('duty_2').disabled = true;
            }
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _GET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _CHILD_6_SELECT = () => {
            let _LIST = _GET_CHILD_6();
            let _COMPONENT = [];
            for (var i = 0; i < _LIST.length; i++) {
                _COMPONENT.push(<option value={_LIST[i].id}>{_LIST[i].description}</option>)
            }
            return <>{_COMPONENT}</>
        }
        // COMPONENT JSX
        let _COMPONENT_0 = () => {
            var _CHILDREN = _GET_CHILD_51()
            var _COMPONENT = []

            for (var i = 0; i < _CHILDREN.length; i++) {
                if (_CHILDREN[i].role) {
                    if ((_CHILDREN[i].role).includes('PROPIETARIO')) _COMPONENT.push(<>
                        <div className="row border p-2 ms-2">
                            <div className="col-3">
                                <label>{_CHILDREN[i].name} {_CHILDREN[i].surname}</label>
                            </div>
                            <div className="col-3">
                                <label>C.C {_CHILDREN[i].id_number}</label>
                            </div>
                            <div className="col-3">
                                <label>Email: {_CHILDREN[i].email}</label>
                            </div>
                            <div className="col-3">
                                <label>Teléfono: {_CHILDREN[i].nunber}</label>
                            </div>
                        </div>
                    </>)
                }

            }

            return <>{_COMPONENT}</>
        }
        let _COMPONENT_1 = () => {
            var _CHILD = _GET_CHILD_REVIEW_GEN()
            return <>
                <div className="row border p-2 ms-2">
                    <div className="col-4">
                        <label>LICENCIA DE CONSTRUCCIÓN</label>
                    </div>
                    <div className="col-2">
                        <div class="form-check ms-5">
                            <input class="form-check-input" type="radio" name="review_rb" value="1"
                                defaultChecked={_CHILD[14] == 1 ? true : false} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Número:</label>
                    </div>
                    <div className="col-3">
                        <input type="text" class="form-control" name="review_check"
                            defaultValue={_CHILD[1]} />
                    </div>
                </div>
                <div className="row border p-2 ms-2">
                    <div className="col-4">
                        <label>LICENCIA DE PARCELACION</label>
                    </div>
                    <div className="col-2">
                        <div class="form-check ms-5">
                            <input class="form-check-input" type="radio" name="review_rb" value="2"
                                defaultChecked={_CHILD[14] == 2 ? true : false} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Expedida:</label>
                    </div>
                    <div className="col-3">
                        <input type="date" max="2100-01-01" class="form-control" name="review_check"
                            defaultValue={_CHILD[2]} />
                    </div>
                </div>
                <div className="row border p-2 ms-2">
                    <div className="col-4">
                        <label>LICENCIA DE URBANISMO</label>
                    </div>
                    <div className="col-2">
                        <div class="form-check ms-5">
                            <input class="form-check-input" type="radio" name="review_rb" value="3"
                                defaultChecked={_CHILD[14] == 3 ? true : false} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Vigente:</label>
                    </div>
                    <div className="col-3">
                        <select className='form-select' name="review_check" defaultValue={_CHILD[3]} >
                            <option className="text-warning">SI</option>
                            <option className="text-danger">NO</option>
                        </select>
                    </div>
                </div>
                <div className="row border p-2 ms-2">
                    <div className="col-4">
                        <label>ACTO DE RECONOCIMIENTO</label>
                    </div>
                    <div className="col-2">
                        <div class="form-check ms-5">
                            <input class="form-check-input" type="radio" name="review_rb" value="4"
                                defaultChecked={_CHILD[14] == 4 ? true : false} />
                        </div>
                    </div>
                    <div className="col-3">
                        <label>Declaración de obra terminada:</label>
                    </div>
                    <div className="col-3">
                        <select className='form-select' name="review_check" defaultValue={_CHILD[4]} >
                            <option value="2" className="text-warning">NO APLICA</option>
                            <option value="0" className="text-danger">NO APORTA</option>
                            <option value="1" className="text-success">APORTA</option>
                        </select>
                    </div>
                </div>
                <div className="row border p-2 ms-2">
                    <div className="col-6">

                    </div>
                    <div className="col-2">
                        <label>Documento:</label>
                    </div>
                    <div className="col-1">
                        {_CHILD[5] > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_CHILD[5]).path + "/" + _FIND_6(_CHILD[5]).filename}
                                apipath={'/files/'} />
                            : ""}
                    </div>
                    <div className="col-3">
                        <select className='form-select' name="review_check" defaultValue={_CHILD[5]}>
                            <option value="-1">APORTADO FÍSICAMENTE</option>
                            <option value="0">SIN DOCUMENTO</option>
                            {_CHILD_6_SELECT()}
                        </select>
                    </div>

                </div>
            </>
        }
        let _COMPONENT_2 = () => {
            var _CHILD = _GET_CHILD_REVIEW_GEN()
            return <>
                <div className="row">
                    <div className="col-6">
                        <div className="row border p-1 ms-2">
                            <div className="col-6">
                                <label>Área Total Construida (m2)</label>
                            </div>
                            <div className="col-6">
                                <input type="number" min="0" step="0.01" class="form-control" name="review_check" defaultValue={_CHILD[6]} />
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-6">
                                <label>Destinación:</label>
                            </div>
                            <div className="col-6">
                                <input type="text" class="form-control" name="review_check" defaultValue={_CHILD[7]} />
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-6">
                                <label>Uso del Suelo</label>
                            </div>
                            <div className="col-6">
                                <select className="form-select" name="review_check" defaultValue={_CHILD[8]}>
                                    <option>R1 - Residencial neta</option>
                                    <option>R2 - Residencial 2 sin eje comercial</option>
                                    <option>R2 - Residencial con comercio y servicio localizado</option>
                                    <option>R3 - Residencial mixta - vivienda, comercio y servicio</option>
                                    <option>R4 - Residencial con actividad económica</option>
                                    <option>C1 - Comercial y de servicios empresariales</option>
                                    <option>C2 - Comercial y de servicios livianos o al por mayor</option>
                                    <option>C3 - Comercial y de servicios pesados</option>
                                    <option>CE - Comercial de eje en Area de Actividades R-2</option>
                                    <option>D - Dotacional</option>
                                    <option>D - Dotacional Recreativo</option>
                                    <option>I - Industria</option>
                                    <option>M1 - Multiple centralidad</option>
                                    <option>M2 - Multiple grandes establecimientos</option>
                                </select>
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-6">
                                <label>Tratamiento:</label>
                            </div>
                            <div className="col-6">
                                <select className="form-select" name="review_check" defaultValue={_CHILD[9]}>
                                    <option>TD - Desarrollo</option>
                                    <option>TC-1 - Consolidacion Urbana</option>
                                    <option>TC-2 - Consolidacion con generacion de espacio publico</option>
                                    <option>TRD - Redesarrollo</option>
                                    <option>TRA-1 - Reactivacion</option>
                                    <option>TRA-2 - Reactivacion</option>
                                    <option>TRA-3 - Reactivacion de sector urbano especial</option>
                                    <option>TMI-1 - Complementario</option>
                                    <option>TMI-2 - Reordenamiento</option>
                                    <option>TCoU - Para inmuebles de interes cultural del grupo urbano</option>
                                    <option>TCoA-1 - Para inmuebles de interes cultural del grupo arquitectonico agrupacion</option>
                                    <option>TCoA-2 - Para inmuebles de interes cultural del grupo arquitectonico individual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="row border p-1 ms-2">
                            <div className="col-12">
                                <label>El suelo de deberes Urbanísticos acorde con el Articulo 192 del POT Acero 011 de 2014</label>
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-6">
                                <label>Licencia señala deber:</label>
                            </div>
                            <div className="col-6">
                                <select className='form-select' name="review_check" onChange={(e) => _SET_DUTY(e.target.value)}
                                    defaultValue={_CHILD[10]}>
                                    <option className="text-success">SI</option>
                                    <option className="text-danger">NO</option>
                                </select>
                            </div>
                        </div>
                        <div className="row border p-1 ms-2">
                            <div className="col-6">
                                <label>Valor (COP):</label>
                            </div>
                            <div className="col-6">
                                <input type="number" min="0" step="0.01" class="form-control" name="review_check" id="duty_1"
                                    defaultValue={_CHILD[11]} />
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-6">
                                <label>Recibo de pago numero:</label>
                            </div>
                            <div className="col-6">
                                <input type="text" class="form-control" name="review_check" id="duty_2" defaultValue={_CHILD[12]} />
                            </div>
                        </div>
                        <div className="row border p-2 ms-2">
                            <div className="col-4">
                                <label>Documento:</label>
                            </div>
                            <div className="col-2">
                                {_CHILD[13] > 0
                                    ?
                                    <VIZUALIZER url={_FIND_6(_CHILD[13]).path + "/" + _FIND_6(_CHILD[13]).filename}
                                        apipath={'/files/'} />
                                    : ""}
                            </div>
                            <div className="col-6">
                                <select className='form-select' name="review_check" defaultValue={_CHILD[13]}>
                                    <option value="-1">APORTADO FÍSICAMENTE</option>
                                    <option value="0">SIN DOCUMENTO</option>
                                    {_CHILD_6_SELECT()}
                                </select>
                            </div>

                        </div>
                    </div>
                </div>

            </>
        }

        // FUNCTIONS AND APIS
        var formData = new FormData();

        let manage_item = (e) => {
            e.preventDefault();
            formData = new FormData();
            let review_gen = [];

            let review_check = document.getElementsByName("review_check");
            // 0 => AREA Y LINDEROS DE PREDIO(S)
            // 1 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> NUMERO
            // 2 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> EXPEDIDA
            // 3 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> VIGENTE
            // 4 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> DELCARACION
            // 5 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL -> DOCUMENTO
            // 6 => DATOS GENERALES DE LA LICENCIA -> AREA
            // 7 => DATOS GENERALES DE LA LICENCIA -> DESTINACION
            // 8 => DATOS GENERALES DE LA LICENCIA -> USO DEL SUELO
            // 9 => DATOS GENERALES DE LA LICENCIA -> TRATAMIENTO
            // 10 => DATOS GENERALES DE LA LICENCIA -> LICENCIA DUTY
            // 11 => DATOS GENERALES DE LA LICENCIA -> VALOR
            // 12 => DATOS GENERALES DE LA LICENCIA -> RECIPE NUMBER
            // 13 => DATOS GENERALES DE LA LICENCIA -> DOCUMENTO

            // 14 => ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTA -> LICENCIA
            // THIS IS THE RADIO BUTTONS
            for (var i = 0; i < review_check.length; i++) {
                review_gen.push(review_check[i].value)
            }

            let review_radios = document.getElementsByName("review_rb");
            for (var i = 0; i < review_radios.length; i++) {
                if (review_radios[i].checked) review_gen.push(review_radios[i].value)
            }

            formData.set('review_gen', review_gen.join(';'));

            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
            RECORD_PH_SERVICE.update(currentRecord.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        this.props.requestUpdateRecord(currentItem.id);
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
            <div className="record_ph_gen container">
                <form id="form_manage_ph_gen" onSubmit={manage_item}>
                    <div className="row">
                        <label className="app-p lead fw-bold my-2">AREA Y LINDEROS DE PREDIO(S)</label>
                        <input type="text" class="form-control" name="review_check"
                            defaultValue={_GET_CHILD_REVIEW_GEN()[0]} />
                        <label className="app-p lead fw-bold my-2">PROPIETARIOS</label>
                        {_COMPONENT_0()}
                        <label className="app-p lead fw-bold my-2">ACTUACION URBANISTICA BASE DE LOS PLANOS DE PROPIEDAD HORIZONTAL</label>
                        {_COMPONENT_1()}
                        <label className="app-p lead fw-bold my-2">DATOS GENERALES DE LA LICENCIA</label>
                        {_COMPONENT_2()}
                        <div className="row mb-3 text-center">
                            <div className="col-12">
                                <button className="btn btn-success my-3" ><i class="far fa-file-alt"></i> GUARDAR CAMBIOS </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div >
        );
    }
}

export default RECORD_PH_GEN;