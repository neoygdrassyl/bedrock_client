import moment from 'moment';
import React, { Component } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars';


const MySwal = withReactContent(Swal);
class PQRS_SET_REPLY extends Component {
    constructor(props) {
        super(props);
        this.retrieveItem = this.retrieveItem.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.state = {
        };
    }
    componentDidMount() {
        this.retrieveItem(this.props.currentId);
    }
    retrieveItem(id) {
        PQRS_Service.get(id)
            .then(response => {
                this.setState({
                    currentItem: response.data,
                    load: true
                })
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar este item, intentelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
                this.setState({
                    load: false
                })
            });
    }
    refreshList() {
        this.props.refreshList()
    }

    render() {
        const { translation, swaMsg, globals, hardReset, currentItem } = this.props;
        const { } = this.state;
        var formData = new FormData();

        // SUBMIT  NEW 1. ENTRY
        let replyPQRS = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData.set('id_master', currentItem.id);
            formData.set('info_id', currentItem.pqrs_info.id);
            formData.set('time_id', currentItem.pqrs_time.id);

            let reply_formal = document.getElementById("pqrs_reply_time_formalReply").value;
            formData.set('reply_formal', reply_formal);
            let info_reply = document.getElementById("pqrs_info_reply").value;
            formData.set('info_reply', info_reply);

            let prev_id = currentItem.id_reply;
            formData.set('prev_id', prev_id);
            let new_id = document.getElementById("pqrs_master_idreply").value;
            formData.set('new_id', new_id);

            if (new_id) {
                var array_solicitor = [];
                for (var i = 0; i < currentItem.pqrs_solocitors.length; i++) {
                    array_solicitor.push(currentItem.pqrs_solocitors[i].name)
                }
                formData.set('solicitors_name', array_solicitor.join());

                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                PQRS_Service.formalReply(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            this.props.retrieveItem(currentItem.id);
                            this.props.refreshList();
                            if (hardReset) {
                                this.props.closeModal();
                            }

                        } else if (response.data === 'ERROR_DUPLICATE') {
                            MySwal.fire({
                                title: "ERROR DE DUPLICACION",
                                text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
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
                    });
            } else {
                MySwal.fire({
                    title: "NO HAY CONSECUTIVO DE SALIDA",
                    text: "Se debe de espeficiar primero el consecutivo de Salida.",
                    icon: 'error',
                });
            }
        };

        let _GET_LAST_ID = () => {
            let new_id = "";
            PQRS_Service.getlascub()
                .then(response => {
                    new_id = response.data[0].cub;
                    let concecutive;
                    if (response.data[0].cub == null) {
                        let res1 = infoCud.serials.end;
                        concecutive = 1
                        if (concecutive < 1000) concecutive = "0" + concecutive
                        if (concecutive < 100) concecutive = "0" + concecutive
                        if (concecutive < 10) concecutive = "0" + concecutive
                        new_id = res1+(moment().format('YY')).split('-')[0] + "-" + concecutive
                        document.getElementById('pqrs_master_idreply').value = new_id;
                    } else {
                        concecutive = new_id.split('-')[1];
                        concecutive = Number(concecutive) + 1
                        if (concecutive < 1000) concecutive = "0" + concecutive
                        if (concecutive < 100) concecutive = "0" + concecutive
                        if (concecutive < 10) concecutive = "0" + concecutive
                        new_id = new_id.split('-')[0] + "-" + concecutive
                        document.getElementById('pqrs_master_idreply').value = new_id;
                    }
                })
                .catch(e => {
                    console.log(e);
                    MySwal.fire({
                        title: "ERROR AL CARGAR",
                        text: "No ha sido posible cargar el consecutivo, intentelo nuevamnte.",
                        icon: 'error',
                        confirmButtonText: this.props.swaMsg.text_btn,
                    });
                });

        }
        return (
            <div>
                <form onSubmit={replyPQRS} id="app-formReply">

                    <div className="row">
                        <div className="col-6">
                            <label className='text-start'>consecutivo de Salida</label>
                            <div class="input-group my-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="text" class="form-control" defaultValue={currentItem.id_reply}
                                    id="pqrs_master_idreply" require />
                                <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID()}>GENERAR</button>
                            </div>
                        </div>

                        <div className="col-6">
                            <label>Fecha de Respuesta</label>
                            <div class="input-group my-1">
                                <span class="input-group-text bg-info text-white">
                                    <i class="fas fa-hashtag"></i>
                                </span>
                                <input type="date" max="2100-01-01" class="form-control"
                                    defaultValue={currentItem.pqrs_time ? currentItem.pqrs_time.reply_formal : moment().format('YYYY-MM-DD')}
                                    id="pqrs_reply_time_formalReply" require />
                            </div>
                        </div>

                    </div>

                    <label>Respuesta de Oficio (Máximo 4000 Caracteres)</label>
                    <textarea class="form-control mb-3" rows="5" maxlength="4096" id="pqrs_info_reply" defaultValue={currentItem.pqrs_info ? currentItem.pqrs_info.reply : ''}></textarea>
                    <div className="text-center m-3">
                        <button className="btn btn-sm btn-success my-2" ><i class="fas fa-edit"></i> GUARDAR RESPUESTA </button>
                    </div>
                </form>
            </div>
        );
    }
}

export default PQRS_SET_REPLY;