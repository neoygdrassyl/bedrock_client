import FUN_SERVICE from '../../../services/fun.service';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import { getLicenseCompletionClock } from '../shared/processClosure.helpers';

export default function EXP_LIC(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    var formData = new FormData();
    const completionClock = getLicenseCompletionClock(currentItem);
    // ***************************  DATA GETTERS *********************** //
    let _GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    // ******************************* JSX ***************************** // 
    let _COMPONENT_LIC = () => {
        return <>

            {currentItem.state == 200 ?
                <div className='row text-center'>
                    <div className='col'><label className='fw-bold text-danger'>ESTA SOLICITUD FUE DESISTIDA Y DEBE SER ARCHIVADA EN LA PESTAÑA DE "TIEMPOS"</label></div>
                </div>
                :
                <>
                    <div className="row mx-2 my-0">
                        <div className="col-3 border">
                            <label className="fw-bold mt-2 text-end ">{completionClock.label?.toUpperCase() || 'FECHA DE LICENCIA'}:</label>
                        </div>
                        <div className="col border py-1">
                            <label className="fw-bold mt-2 text-end ">{completionClock.dateStart}</label>
                        </div>
                        <div className="col border py-1 text-center">
                            {currentItem.state < 100 ?
                                <Button variant="destructive" size="sm" onClick={() => close()}><Icon name="unlock-alt" size={16} /> FINALIZAR PROCESO</Button>
                                : ''}
                        </div>
                    </div>
                    <form id="archive_form" onSubmit={archive}>
                        <div className="row mx-2 my-0">
                            <div className="col-3 border">
                                <label className="fw-bold mt-2 text-end ">FECHA DE ARCHIVACIÓN:</label>
                            </div>
                            <div className="col border py-1">
                                {currentItem.state == 100 ?
                                    <input type="date" className="form-control" id={'clock_arch_date'} max="2100-01-01" required
                                        defaultValue={_GET_CLOCK_STATE(101)?.date_start ?? ''} />
                                    : ''}
                            </div>
                            <div className="col border py-1 text-center">
                                {currentItem.state == 100 ?
                                    <Button size="sm"><Icon name="file-archive" size={16} /> ARCHIVAR SOLICITUD</Button>
                                    : ''}

                            </div>
                        </div>
                    </form>
                </>
            }

        </>
    }
    // ******************************* APIS **************************** // 
    let close = () => {
        swalConfirm({ title: "CERRAR SOLICITUD", text: "¿Esta seguro de cerrar esta Solicitud?", icon: 'question', confirmButtonText: "CERRAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                formData = new FormData();

                formData.set('state', 100);

                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                FUN_SERVICE.update(currentItem.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            props.requestUpdate(currentItem.id);
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });



            }
        });
    }
    let archive = (e) => {

        e.preventDefault();
        swalConfirm({ title: "ARCHIVAR SOLICITUD", text: "¿Esta seguro de archivar esta Solicitud? \nno se podrá modificar de ninguna forma.", icon: 'question', confirmButtonText: "ARCHIAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                formData = new FormData();

                formData.set('state', 101);

                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                FUN_SERVICE.update(currentItem.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            save_archive();
                            props.requestUpdate(currentItem.id);
                            props.closeModal()
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });



            }
        });
    }
    let save_archive = () => {
        var formDataClock = new FormData();

        let state = 101 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

        let worker = window?.user?.name + " " + window?.user?.surname;
        let date_start = document.getElementById("clock_arch_date").value;;

        formDataClock.set('date_start', date_start);
        formDataClock.set('name', "ARCHIVACIÓN");
        formDataClock.set('desc', "Fue enviado al archivo por: " + worker);
        formDataClock.set('state', state);

        manage_clock(false, state, formDataClock);
    }
    let manage_clock = (useMySwal, findOne, formDataClock) => {
        var _CHILD = _GET_CLOCK_STATE(findOne)

        formDataClock.set('fun0Id', currentItem.id);
        if (useMySwal) {
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        }

        if (_CHILD.id) {
            FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        }
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                });
        }
        else {
            FUN_SERVICE.create_clock(formDataClock)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useMySwal) {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        }
                        props.requestUpdate(currentItem.id)
                    } else {
                        if (useMySwal) {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useMySwal) {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                });
        }

    }
    return (
        <div>
            <legend className="my-2 px-3 Collapsible text-center" id="nav_expedition_4">
                <label className="app-p lead fw-normal">CERRAR SOLICITUD</label>
            </legend>
            {completionClock.dateStart
                ? _COMPONENT_LIC()
                : <div className='row text-center'><label className="app-p lead fw-normal text-danger">Para cerrar y archivar la solicitud es necesario determinar la Fecha de expedición o Entrega de Licencia en Tiempos</label></div>}

        </div >
    );
}
