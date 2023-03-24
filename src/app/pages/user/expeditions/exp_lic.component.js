import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import FUN_SERVICE from '../../../services/fun.service';

export default function EXP_LIC(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    const MySwal = withReactContent(Swal);
    var formData = new FormData();
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
                            <label className="fw-bold mt-2 text-end ">FECHA DE LICENCIA:</label>
                        </div>
                        <div className="col border py-1">
                            <label className="fw-bold mt-2 text-end ">{_GET_CLOCK_STATE(99).date_start}</label>
                        </div>
                        <div className="col border py-1 text-center">
                            {currentItem.state < 100 ?
                                <button className='btn btn-danger' onClick={() => close()}><i class="fas fa-unlock-alt"></i> FINALIZAR PROCESO</button>
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
                                    <input type="date" class="form-control" id={'clock_arch_date'} max="2100-01-01" required
                                        defaultValue={_GET_CLOCK_STATE(101).date_start ?? ''} />
                                    : ''}
                            </div>
                            <div className="col border py-1 text-center">
                                {currentItem.state == 100 ?
                                    <button className='btn btn-primary' ><i class="far fa-file-archive"></i> ARCHIVAR SOLICITUD</button>
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
        MySwal.fire({
            title: "CERRAR SOLICITUD",
            text: "¿Esta seguro de cerrar esta Solicitud?",
            icon: 'question',
            confirmButtonText: "CERRAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                formData = new FormData();

                formData.set('state', 100);

                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                FUN_SERVICE.update(currentItem.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            props.requestUpdate(currentItem.id);
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
        });
    }
    let archive = (e) => {

        e.preventDefault();
        MySwal.fire({
            title: "ARCHIVAR SOLICITUD",
            text: "¿Esta seguro de archivar esta Solicitud? \nno se podrá modificar de ninguna forma.",
            icon: 'question',
            confirmButtonText: "ARCHIAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                formData = new FormData();

                formData.set('state', 101);

                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                FUN_SERVICE.update(currentItem.id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            save_archive();
                            props.requestUpdate(currentItem.id);
                            props.closeModal()
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
        });
    }
    let save_archive = () => {
        var formDataClock = new FormData();

        let state = 101 // THIS IS CANGED DEPENDING ON WICH LOCATION IT IS

        let worker = window.user.name + " " + window.user.surname;
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
            MySwal.fire({
                title: swaMsg.title_wait,
                text: swaMsg.text_wait,
                icon: 'info',
                showConfirmButton: false,
            });
        }

        if (_CHILD.id) {
            FUN_SERVICE.update_clock(_CHILD.id, formDataClock)
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
                        props.requestUpdate(currentItem.id)
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
            FUN_SERVICE.create_clock(formDataClock)
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
                        props.requestUpdate(currentItem.id)
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
    return (
        <div>
            <legend className="my-2 px-3 text-uppercase Collapsible text-center" id="nav_expedition_4">
                <label className="app-p lead fw-normal">CERRAR SOLICITUD</label>
            </legend>
            {_GET_CLOCK_STATE(99).date_start
                ? _COMPONENT_LIC()
                : <div className='row text-center'><label className="app-p lead fw-normal text-danger">Para cerrar y archivar la solicitud es necesario determinar la Fecha de expedición Licencia</label></div>}

        </div >
    );
}
