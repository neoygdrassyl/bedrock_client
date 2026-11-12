import { DateInput } from '@/shared/components/DateInput';
import FUN_SERVICE from '../api/fun.service';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/shared/utils/swalAdapter';
import { getLicenseCompletionClock } from '../documental/shared/processClosure.helpers';
import { SectionCard, DataGrid, DataField } from '@/shared/components/SectionCard';
import dayjs from 'dayjs';

/** Screen format of a stored `YYYY-MM-DD` date; anything else is shown as stored. */
function formatCloseDate(value) {
    if (!value) return '';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(value);
}

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
                <p className="ew-notice ew-notice--danger m-0" role="status">Esta solicitud fue desistida y debe ser archivada en la pestaña de «Tiempos».</p>
                :
                <>
                    <DataGrid>
                        <DataField label={completionClock.label || 'Fecha de licencia'} mono>
                            {formatCloseDate(completionClock.dateStart)}
                        </DataField>
                        <DataField label="Fecha de archivo" mono emptyText={currentItem.state == 100 ? 'Pendiente' : 'Sin archivar'}>
                            {currentItem.state != 100 ? formatCloseDate(_GET_CLOCK_STATE(101)?.date_start) : ''}
                        </DataField>
                    </DataGrid>
                    {currentItem.state < 100 ?
                        <div className="ew-actions">
                            <Button type="button" size="sm" onClick={() => close()}><Icon name="unlock-alt" size={16} /> Finalizar proceso</Button>
                        </div>
                        : ''}
                    <form id="archive_form" onSubmit={archive}>
                        {currentItem.state == 100 ?
                            <>
                                <div className="ew-form-grid mt-3">
                                    <div>
                                        <label htmlFor="clock_arch_date">Fecha de archivación <span className="text-destructive" aria-hidden="true">*</span></label>
                                        <DateInput className="form-control" id={'clock_arch_date'} max="2100-01-01" required
                                            defaultValue={_GET_CLOCK_STATE(101)?.date_start ?? ''} />
                                    </div>
                                </div>
                                <div className="ew-actions">
                                    <Button type="submit" size="sm"><Icon name="file-archive" size={16} /> Archivar solicitud</Button>
                                </div>
                            </>
                            : ''}
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
    const closeChip = currentItem.state == 200
        ? <span className="ew-status-chip ew-status-chip--danger">Desistida</span>
        : currentItem.state >= 101
            ? <span className="ew-status-chip ew-status-chip--success">Archivada</span>
            : currentItem.state == 100
                ? <span className="ew-status-chip ew-status-chip--info">Proceso finalizado</span>
                : <span className="ew-status-chip">Abierta</span>;
    return (
        <SectionCard id="nav_expedition_4" title={`${props.step ? `${props.step}. ` : ''}Cierre de la solicitud`} meta={closeChip}>
            {completionClock.dateStart
                ? _COMPONENT_LIC()
                : <p className="ew-notice ew-notice--warning m-0" role="status">Para cerrar y archivar la solicitud es necesario determinar la fecha de expedición o de entrega de la licencia en Tiempos.</p>}

        </SectionCard>
    );
}
