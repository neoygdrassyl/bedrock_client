
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/icon';
import DataTable from '@/components/data-table-bridge';
import { cities, infoCud, rules_opt } from '../../../components/jsons/vars';
import EXPEDITION_SERVICE from '../../../services/expedition.service';
import record_arcService from '../../../services/record_arc.service';
import RECORD_ARC_AREAS_RESUME from '../records/arc/record_arc_areas_resumen.component';
import EXP_CALC from './exp_calc.component';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;

function EXP_AREAS({ translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdate, requestUpdateRecord }) {
    const [isNew, setIsNew] = useState(false);
    const [edit, setEdit] = useState(false);
    const [currentRecordArc, setCurrentRecordArc] = useState(null);
    const [currentVersionRArc, setCurrentVersionRArc] = useState(null);
    const prevEditRef = useRef(false);

    const setItem_RecordArc = (id) => {
        record_arcService.getRecord(id || currentItem.id)
            .then(response => {
                let record_arc = response.data.record_arc
                if (record_arc){
                    record_arc.record_arc_steps = response.data.record_arc_steps;
                    record_arc.record_arc_33_areas = response.data.record_arc_33_areas;
                    record_arc.record_arc_34_ks = response.data.record_arc_34_ks;
                    record_arc.record_arc_34_gens = response.data.record_arc_34_gens;
                    record_arc.record_arc_35_parkings = response.data.record_arc_35_parkings;
                    record_arc.record_arc_36_infos = response.data.record_arc_36_infos;
                    record_arc.record_arc_37s = response.data.record_arc_37s;
                    record_arc.record_arc_35_locations = response.data.record_arc_35_locations;
                    record_arc.record_arc_38s = response.data.record_arc_38s;
    
                    setCurrentRecordArc(record_arc);
                    setCurrentVersionRArc(record_arc.version);
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    };

    useEffect(() => {
        setItem_RecordArc(currentItem.id);
    }, []);

    useEffect(() => {
        if (edit !== prevEditRef.current && edit !== false) {
            var _ITEM = edit;
            document.getElementById("expedition_area_1_edit").value = _ITEM.area;
            document.getElementById("expedition_area_2_edit").value = _ITEM.charge;
            document.getElementById("expedition_area_3_edit").value = _ITEM.use;
            document.getElementById("expedition_area_4_edit").value = _ITEM.desc;
            document.getElementById("expedition_area_5_edit").value = _ITEM.payment;
            document.getElementById("expedition_area_6_edit").value = _ITEM.units;
        }
        prevEditRef.current = edit;
    }, [edit]);

        // DATA GETTERS
        let _GET_CHILD_AREAS = () => {
            var _CHILD = currentRecord.exp_areas;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        // COMPONENT JSX
        let _CHILD_AREA_LIST = () => {
            let _LIST = _GET_CHILD_AREAS();
            const columns = [
                {
                    name: 'Área',
                    selector: row => row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm font-mono">{row.area}</span>
                },
                {
                    name: 'Unidades',
                    selector: row => row.units,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm font-mono">{row.units}</span>
                },
                {
                    name: 'Cobro × m²/U',
                    selector: row => row.charge,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    omit: _GLOBAL_ID != 'cp1',
                    cell: row => <span className="text-sm font-mono">{row.charge}</span>
                },
                {
                    name: 'Cobro Total',
                    selector: row => row.charge * row.area,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm">{_GLOBAL_ID == 'cp1' ? Math.round(row.charge * row.area) : row.charge}</span>
                },
                {
                    name: 'Uso',
                    selector: row => row.use,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '60px',
                    cell: row => <span className="text-sm">{row.use}</span>
                },
                {
                    name: 'Tipo de Actuación',
                    selector: row => row.desc,
                    sortable: true,
                    filterable: true,
                    minWidth: "40px",
                    compact: true,
                    cell: row => <span className="text-sm">{row.desc}</span>
                },
                {
                    name: 'Reglas',
                    selector: row => row.payment,
                    sortable: true,
                    filterable: true,
                    center: true,
                    maxWidth: '60px',
                    compact: true,
                    cell: row => <label >{infoCud.exp_rules[row.payment] ?? ''}</label>
                },
                {
                    name: 'Acción',
                    button: true,
                    maxWidth: '50px',
                    cell: row => <>
                        <span title="Modificar Item"><Button type="button" variant="outline" size="sm" className="m-0 p-1" onClick={() => setEdit(row)}><Icon name="edit" size={16} /></Button></span>
                        <span title="Eliminar Item"><Button type="button" variant="destructive" size="sm" className="m-0 p-1" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
                    </>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                noHeader
                dense
            />
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row mb-1">
                    <div className="col">
                        <label>Área</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" step="0.01" className="form-control" id={"expedition_area_1" + edit} required />
                        </div>
                    </div>
                    <div className="col">
                        <label>Unidades</label>
                        <div className="input-group my-1">
                            <input type="number" min="0" step="1" className="form-control" id={"expedition_area_6" + edit} required />
                        </div>
                    </div>
                    <div className="col-2">
                        {_GLOBAL_ID == 'cp1' ?
                            <label>Cobro (COP) x m2</label>
                            : <label>Cobro (COP) Total</label>
                        }

                        <div className="input-group my-1">
                            <input type="number" min="0" step="0.0001" className="form-control" id={"expedition_area_2" + edit} required />
                        </div>
                    </div>
                    <div className="col">
                        <label>Uso</label>
                        <div className="input-group my-1">
                            <input list="exp_uses_datalist" className="form-select" id={"expedition_area_3" + edit} required />

                            <datalist id="exp_uses_datalist">
                                <option value="Residencial (NO VIS)" />
                                <option value="Residencial (VIS)" />
                                <option value="Residencial (VIP)" />
                                <option value="Comercial y de Servicios" />
                                <option value="Dotacional" />
                                <option value="Industrial" />
                                <option value="Multiple" />
                                <option value="Mixto" />
                            </datalist>
                        </div>
                    </div>
                    <div className="col">
                        <label>Tipo de Actuación</label>
                        <div className="input-group my-1">
                            <input type="text" className="form-control" id={"expedition_area_4" + edit} />
                        </div>
                    </div>
                    <div className="col">
                        <label>Destino</label>
                        <div className="input-group my-1">
                            <select className="form-select" id={"expedition_area_5" + edit} required >
                                {rules_opt}
                            </select>
                        </div>
                    </div>
                </div>

            </>
        }
        // FUNCTIONS AND APIS
        var formData = new FormData();

        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            formData.set('expeditionId', currentRecord.id);

            let area = document.getElementById("expedition_area_1").value;
            if (area) formData.set('area', area);
            let charge = document.getElementById("expedition_area_2").value;
            if (charge) formData.set('charge', charge);
            let use = document.getElementById("expedition_area_3").value;
            formData.set('use', use);
            let desc = document.getElementById("expedition_area_4").value;
            if (desc) formData.set('desc', desc);
            let payment = document.getElementById("expedition_area_5").value;
            if (payment) formData.set('payment', payment);
            let units = document.getElementById("expedition_area_6").value;
            if (units) formData.set('units', units);
            else formData.set('units', 1);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            EXPEDITION_SERVICE.create_exp_area(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_expedition_area').reset();
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }
        let delete_item = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    EXPEDITION_SERVICE.delete_exp_area(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdateRecord(currentItem.id);
                                setEdit(false);
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
        let edit_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            let area = document.getElementById("expedition_area_1_edit").value;
            formData.set('area', area);
            let charge = document.getElementById("expedition_area_2_edit").value;
            formData.set('charge', charge);
            let use = document.getElementById("expedition_area_3_edit").value;
            formData.set('use', use);
            let desc = document.getElementById("expedition_area_4_edit").value;
            formData.set('desc', desc);
            let payment = document.getElementById("expedition_area_5_edit").value;
            formData.set('payment', payment);
            let units = document.getElementById("expedition_area_6_edit").value;
            if (units) formData.set('units', units);
            else formData.set('units', 1);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            EXPEDITION_SERVICE.update_exp_area(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        requestUpdateRecord(currentItem.id);
                        document.getElementById('form_expedition_area_edit').reset();
                        setEdit(false);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }

        return (
            <div className="expedition_areas my-2">
                <legend className="my-2 px-3 bg-light" id="nav_expedition_10">
                    <label className="app-p lead fw-normal">Áreas Y Unidades</label>
                </legend>
                {currentRecordArc ?
                    <>
                        <label className='fw-bold'>RESUMEN DE AREAS</label>
                        <RECORD_ARC_AREAS_RESUME
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            currentRecord={currentRecordArc}
                            currentVersionR={currentVersionRArc}
                        />
                    </>

                    : null}

                <hr />
                <div className="form-check ms-5">
                    <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        Nueva Área
                    </label>
                </div>
                {isNew
                    ? <>
                        <form id="form_expedition_area" onSubmit={new_item}>
                            {_COMPONENT_MANAGE()}
                            <div className="row my-3 text-center">
                                <div className="col">
                                    <Button type="submit" size="sm"><Icon name="file-alt" size={16} /> AÑADIR ITEM </Button>
                                </div>
                                <div className='col'>
                                    <EXP_CALC
                                        ranslation={translation} swaMsg={swaMsg} globals={globals}
                                        domArea={'expedition_area_1'}
                                        domM2={'expedition_area_2'}
                                        domUse={'expedition_area_3'}
                                        domTipe={'expedition_area_4'}
                                    />
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
                {_CHILD_AREA_LIST()}
                {edit
                    ? <>
                        <form id="form_expedition_area_edit" onSubmit={edit_item}>
                            <h3 className="my-3 text-center">Actualizar Área</h3>
                            {_COMPONENT_MANAGE('_edit')}
                            <div className="row my-2 text-center">
                                <div className="col">
                                    <Button type="submit" size="sm"><Icon name="file-alt" size={16} /> GUARDAR CAMBIOS </Button>
                                </div>
                                <div className='col'>
                                    <EXP_CALC
                                        ranslation={translation} swaMsg={swaMsg} globals={globals}
                                        domArea={'expedition_area_1_edit'}
                                        domM2={'expedition_area_2_edit'}
                                        domUse={'expedition_area_3_edit'}
                                        domTipe={'expedition_area_4_edit'}
                                    />
                                </div>
                            </div>
                        </form>
                    </>
                    : ""}
            </div >
        );
}

export default EXP_AREAS;
