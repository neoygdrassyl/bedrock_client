import { Fragment, useEffect, useState } from 'react';
import { LegacyModal as Modal } from '@/components/legacy-modal';

import PQRS_Service from '../../../../services/pqrs_main.service';
import { infoCud } from '../../../../components/jsons/vars'
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { swalError } from '@/app/utils/swalAdapter';
export const PQRS_ACTION_REVIEW = (props) => {
    const { translation, swaMsg, globals, currentItemId } = props;
    const [currentItem, setCurrentItem] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [review_modal, setModal] = useState(false)

    const loadData = (id, toogle = true) => {
        PQRS_Service.get(id)
            .then(response => {
                setCurrentItem(response.data)
                if (toogle) setModal(prev => !prev)
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    }

    let GET_STEP = (id_public) => {
        var STEPS = currentItem.pqrs_steps;
        if (STEPS == null) return false;
        for (var i = 0; i < STEPS.length; i++) {
            if (STEPS[i].id_public == id_public) return STEPS[i];
        }
        return false;
    }

    let GET_ENTITY = (id) => {
        var entity = infoCud.other_entities;
        if (entity == false) return false;
        for (var i = 0; i < entity.length; i++) {
            if (entity[i].id == id) return entity[i];
        }
        return false;
    }

    const create_step = (formData) => {
        PQRS_Service.create_step(formData)
            .then(response => {
                if (response.data === 'OK') {
                    loadData(currentItem.id, false)
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    const edit_step = (formData, id) => {
        PQRS_Service.update_step(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    setRefresh(true)
                    loadData(currentItem.id, false)
                }
            })
            .catch(e => {
                console.log(e);
            });
    }

    // JSON FUNCTIONS

    const NEW_STEP_JSON = (index) => {
        let rew = { id_public: "oficecs", desc: `Oficios `, json: true };
        let ofice_source = (GET_STEP("oficecs").json || "").replaceAll('"', '').replaceAll('\\', '');
        let ofice_array = ofice_source ? ofice_source.split("&&") : [];
        let value = ""
        if (index == -1) {
            const new_row = ';;;;;;;;;;;;';
            if (ofice_source) {
                ofice_array.push(new_row)
                value = ofice_array.join("&&")
                value = value.replaceAll('"', '').replaceAll('\\', '')
            } else value = new_row

        }

        SAVE_STEP(value, rew)
    }

    const UPDATE_STEP_JSON = (n) => {
        let rew = { id_public: "oficecs", desc: `Oficios `, json: true };
        let value = []
        for (let i = 0; i < n; i++) {
            let row = []
            row.push(document.getElementById('ofice_json_a_' + i).value)
            row.push(document.getElementById('ofice_json_b_' + i).value)
            row.push(document.getElementById('ofice_json_c_' + i).value)
            row.push(document.getElementById('ofice_json_d_' + i).value)
            row.push(document.getElementById('ofice_json_e_' + i).value)
            row.push(document.getElementById('ofice_json_f_' + i).value)
            row.push(document.getElementById('ofice_json_g_' + i).value)
            row.push(document.getElementById('ofice_json_h_' + i).value)
            row.push(document.getElementById('ofice_json_i_' + i).value)
            row.push(document.getElementById('ofice_json_j_' + i).value)
            row.push(document.getElementById('ofice_json_k_' + i).value)
            row.push(document.getElementById('ofice_json_l_' + i).value)
            row.push(document.getElementById('ofice_json_m_' + i).value)
            value.push(row.join(';'))
        }
        SAVE_STEP(value.join('&&'), rew)
    }

    const SET_STEP_JSON = () => {
        const ofice_source = (GET_STEP("oficecs").json || "").replaceAll('"', '').replaceAll('\\', '');
        const ofice_array = ofice_source ? ofice_source.split("&&") : [];
        const n =   ofice_array.length
        for (let i = 0; i < n; i++) {
            const row = ofice_array[i].split(';')
            document.getElementById('ofice_json_a_' + i).value = row[0];
            document.getElementById('ofice_json_b_' + i).value = row[1];
            document.getElementById('ofice_json_c_' + i).value = row[2];
            document.getElementById('ofice_json_d_' + i).value = row[3];
            document.getElementById('ofice_json_e_' + i).value = row[4];
            document.getElementById('ofice_json_f_' + i).value = row[5];
            document.getElementById('ofice_json_g_' + i).value = row[6];
            document.getElementById('ofice_json_h_' + i).value = row[7];
            document.getElementById('ofice_json_i_' + i).value = row[8];
            document.getElementById('ofice_json_j_' + i).value = row[9];
            document.getElementById('ofice_json_k_' + i).value = row[10];
            document.getElementById('ofice_json_l_' + i).value = row[11];
            document.getElementById('ofice_json_m_' + i).value = row[12];
        }
        setRefresh(false)
    }

    const DELETE_STEP_JSON = (index) => {
        let rew = { id_public: "oficecs", desc: `Oficios `, json: true };
        let ofice_source = GET_STEP("oficecs").json || false;
        let ofice_array = ofice_source ? ofice_source.split("&&") : [];
        ofice_array.splice(index, 1)
        let value = ofice_array.join("&&")
        value = value.replaceAll('"', '').replaceAll('\\', '')
        SAVE_STEP(value, rew)
    }

    // -------------

    const SAVE_STEP = (value, rew) => {
        let step = GET_STEP(rew.id_public);
        var formData = new FormData();

        formData.set('desc', rew.desc);
        formData.set('id_public', rew.id_public);
        formData.set('pqrsMasterId', currentItemId);

        if (rew.check) formData.set('check', value);
        if (rew.value) formData.set('value', value);
        if (rew.json) formData.set('json', value);

        if (step.id) edit_step(formData, step.id)
        else create_step(formData)
    }

    const rew_09_values = [
        "NO",
        "Planeación",
        "CDMB",
        "UNGR",
        "INGEOMINAS"
    ]

    const REW_DATA = [
        { title: "Cumplimiento de aspectos formales. Art 16/1755/2015" },
        { id_public: "rew_01", desc: `Esta dirigida a la entidad ${infoCud.name}. Art 16/1755/2015`, check: [0, 1], },
        { id_public: "rew_02", desc: `Es claro el objetivo deee la petición. Art 16/1755/2015`, check: [0, 1], },
        { id_public: "rew_03", desc: `Presenta razones que la fundamentan. Art 16/1755/2015`, check: [0, 1], },
        { id_public: "rew_04", desc: `Anexa documentos. Art 15/1755/2015`, check: [0, 1], },
        { id_public: "rew_05", desc: `Requiere estar por escrita. Art 15/1755/2015`, check: [0, 1], },
        { title: `Relación de competencias de la Petición con la ${infoCud.name}` },
        { id_public: "rew_06", desc: `Una actuación urbanística (Licencia / Reconocimientos / Otras actuaciones)`, check: [0, 1], },
        { id_public: "rew_07", desc: `Reconocimiento de un derecho (Vecino Colindante / Debido proceso)`, check: [0, 1], },
        { id_public: "rew_08", desc: `Recursos de reposición y/o subsidio de apelación`, check: [0, 1], },
        { title: `Relación de la petición con otras entidades` },
        { id_public: "rew_09", desc: `Requiere integración de otras entidades `, value: rew_09_values },
    ]

    const REW_2_DATA = [
        { title: "Preguntas de cierre evaluadas por comité de PQRS", },
        { id_public: "rew_2_01", desc: `Se resolvió de fondo, de manera clara y precisa la PQRS`, check: [0, 1], },
        { id_public: "rew_2_02", desc: `Se anexo la información solicitada`, check: [0, 1], },
        { id_public: "rew_2_03", desc: `Queda la Curaduria con algún compromiso adicional a la respuesta.`, check: [0, 1], },
    ]

    const rew_2_04 = { id_public: "rew_2_04", desc: `Observaciones `, value: true };

    const SOLICITORS_COMPONENT = () => {
        let solicitors = currentItem.pqrs_solocitors || [];
        let contacts = currentItem.pqrs_contacts || [];
        return <>
            <div className="card border border-dark mb-3">
                <div className="card-header">  1. DATOS PETICIONARIO</div>
                <div className="card-body text-dark">
                    <div className='row'>
                        <div className='col'>
                            {solicitors.map((s, i) => <div className='row' key={s.id ?? s.id_number ?? `solicitor-${i}`}>
                                    <div className='col'>
                                        <label>Nombre: <label className='fw-bold'>{s.name}</label></label>
                                        <br />
                                        <label>Tipo: <label className='fw-bold'>{s.type}</label></label>
                                        <br />
                                        <label>{s.type_id} {s.id_number}</label>
                                        <hr />
                                    </div>
                                </div>)}
                        </div>
                        <div className='col'>
                            {contacts.map((c, i) => <div className='row' key={c.id ?? c.email ?? c.phone ?? `contact-${i}`}>
                                    <div className='col'>
                                        <label>Teléfono: <label className='fw-bold'>{c.phone}</label></label>
                                        <br />
                                        <label>Dirección: <label className='fw-bold'>{c.address}</label></label>
                                        <br />
                                        <label>Email: <label className='fw-bold'>{c.email} (Autoriza: {c.notify ? "SI" : "NO"})</label></label>
                                        <hr />
                                    </div>
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </>
    }

    const DESC_COMMPONENT = () => {
        return <>
            <div className="card border border-dark mb-3">
                <div className="card-header">2.DESCRIPCIÓN DEL ASUNTO DE LA SOLICITUD</div>
                <div className="card-body text-dark text-justify">
                    <label className='fw-bold'>Hechos:</label>  {currentItem.content}
                </div>
            </div>
        </>
    }

    const STUDY_COMMPONENT = () => {
        return <>
            <div className="card border border-dark mb-3">
                <div className="card-header">3. VALORACIÓN DE LA SOLICITUD Y DEFINICIÓN DE COMPETENCIA</div>
                <div className="card-body text-dark">
                    {REW_DATA.map((rew, i) => {
                        if (rew.title) return <Fragment key={`rew-title-${i}`}>
                            <br />
                            <label className='fw-bold'>{rew.title}</label>
                        </Fragment>
                        else {
                            return <div className='row' key={rew.id_public}>
                                    <div className='col-10 border'>{rew.desc}</div>
                                    <div className='col-2 border'>
                                        {rew.check ?
                                            <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                defaultValue={GET_STEP(rew.id_public).check}
                                                onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                            >
                                                <option value="0">NO</option>
                                                <option value="1">SI</option>
                                            </select>
                                            : null}
                                        {rew.value ?
                                            <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                defaultValue={GET_STEP(rew.id_public).value}
                                                onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                            >
                                                {rew.value.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                            : null}
                                    </div>
                                </div>
                        }
                    })}

                    {GET_STEP("rew_09").value && GET_ENTITY(GET_STEP("rew_09").value) ? <>
                        <div className='row'>
                            <div className='col'>
                                <label className='fw-bold'>Art 21. Ley 1755/2015. Funcionarios sin competencia. Entidades a la que se hace el traslado. Correspondencia se debe enviar dentro de los 5 días siguientes a la radicación</label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='col-4 border'>Entidad</div>
                            <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).name}</div>
                        </div>
                        <div className='row'>
                            <div className='col-4 border'>Funcionario</div>
                            <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).official}</div>
                        </div>
                        <div className='row'>
                            <div className='col-4 border'>Cargo</div>
                            <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).job}</div>
                        </div>
                        <div className='row'>
                            <div className='col-4 border'>Correo electrónica / Ventanilla Única</div>
                            <div className='col-8 border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).email}</div>
                        </div>
                        <div className='row'>
                            <div className='col-4 border'>Hecho a petición</div>
                            <div className='col-8  border fw-bold'>{GET_ENTITY(GET_STEP("rew_09").value).other}</div>
                        </div>
                    </>
                        : null}
                </div>
            </div>
        </>
    }

    const OFICE_COMPONENT = () => {
        let ofice_source = (GET_STEP("oficecs").json || "").replaceAll('"', '').replaceAll('\\', '');
        let ofice = ofice_source.split("&&").map(o => o ? o.split(";") : []);
        return <>
            <div className='row fw-bold text-center' style={{ backgroundColor: 'gainsboro', fontSize: '12px' }}>
                <div className='col-1 border border-dark'>Acción CUR.</div>
                <div className='col border border-dark'>
                    <div className='row'>
                        <div className='col-12 border'>Programación</div>
                    </div>
                    <div className='row'>
                        <div className='col border border-dark'>1,2 vez</div>
                        <div className='col border border-dark'>Dirigida</div>
                        <div className='col border border-dark'>Dia Hábil</div>
                        <div className='col border border-dark'>Fecha</div>
                        <div className='col border border-dark'>Usar</div>
                    </div>
                </div>
                <div className='col-6 border border-dark'>
                    <div className='row'>
                        <div className='col-12 border'>Seguimiento Cumplimiento</div>
                    </div>
                    <div className='row'>
                        <div className='col border border-dark'>Consecutivo</div>
                        <div className='col border border-dark'>Fecha Envío</div>
                        <div className='col border border-dark'>Dia Hábil</div>
                        <div className='col border border-dark'>Medio Envío</div>
                        <div className='col border border-dark'>No. Guía</div>
                        <div className='col border border-dark'>Fecha Recibido</div>
                        <div className='col border border-dark'>Fecha Abierto</div>
                    </div>
                </div>
                <div className='col-1 border border-dark'>Acción</div>
            </div>

            {ofice.map((row, i) => row.length > 0 ?
                <div className='row text-center' key={`ofice-${i}`}>
                    <div className='col-1 border'>
                        <input className='form-control form-control-sm' id={"ofice_json_a_" + i} defaultValue={row[0]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                    </div>
                    <div className='col border'>
                        <div className='row'>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_b_" + i} defaultValue={row[1]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_c_" + i} defaultValue={row[2]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_d_" + i} defaultValue={row[3]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_e_" + i} defaultValue={row[4]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_f_" + i} defaultValue={row[5]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                        </div>
                    </div>
                    <div className='col-6 border'>
                        <div className='row'>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_g_" + i} defaultValue={row[6]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_h_" + i} defaultValue={row[7]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_i_" + i} defaultValue={row[8]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_j_" + i} defaultValue={row[9]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_k_" + i} defaultValue={row[10]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_l_" + i} defaultValue={row[11]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                            <div className='col border'>
                                <input className='form-control form-control-sm' id={"ofice_json_m_" + i} defaultValue={row[12]} onBlur={() => UPDATE_STEP_JSON(ofice.length)} />
                            </div>
                        </div>
                    </div>
                    <div className='col-1 border'>
                        <div className='row text-center'>
                            <div className='col'>
                                <Icon name="trash" size={16} className="text-danger cursor-pointer" onClick={() => DELETE_STEP_JSON(i)} />
                            </div>
                        </div>
                    </div>
                </div> : null
            )}

            <div className='row text-center my-3'>
                <div className='col'>
                    <Button variant="outline" size="sm" className="rounded-pill" onClick={() => NEW_STEP_JSON(-1)}>NUEVO OFICIO</Button>
                </div>
            </div>
        </>
    }

    const RESOLVE_COMMPONENT = () => {
        return <>
            <div className="card border border-dark mb-3">
                <div className="card-header">4. CLASIFICACIÓN Y TERMINO PARA RESOLUCIÓN DE LA PQRS</div>
                <div className="card-body text-dark">
                    <div className='row'><label className='fw-bold'>Programación y control de proceso de Respuesta. Se programa para un ciclo de 10 días hábiles</label></div>

                    {OFICE_COMPONENT()}

                    {REW_2_DATA.map((rew, i) => {
                        if (rew.title) return <Fragment key={`rew-2-title-${i}`}>
                            <br />
                            <label className='fw-bold'>{rew.title}</label>
                        </Fragment>
                        else {
                            return <div className='row' key={rew.id_public}>
                                    <div className='col-10 border'>{rew.desc}</div>
                                    <div className='col-2 border'>
                                        {rew.check ?
                                            <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                defaultValue={GET_STEP(rew.id_public).check}
                                                onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                            >
                                                <option value="0">NO</option>
                                                <option value="1">SI</option>
                                            </select>
                                            : null}
                                        {rew.value ?
                                            <select className='form-select form-control form-control-sm' id={rew.id_public}
                                                defaultValue={GET_STEP(rew.id_public).value}
                                                onChange={(e) => SAVE_STEP(e.target.value, rew)}
                                            >
                                                {rew.value.map(v => <option key={v} value={v}>{v}</option>)}
                                            </select>
                                            : null}
                                    </div>
                                </div>
                        }
                    })}
                    <div className='row'><label className='fw-bold'>Observaciones</label></div>
                    <textarea rows={4} defaultValue={GET_STEP('rew_2_04').value} onBlur={(e) => SAVE_STEP(e.target.value, rew_2_04)} className='form-control' />

                </div>
            </div>
        </>
    }

    useEffect(() => {
        if (refresh == true ) SET_STEP_JSON();
    }, [currentItem]);

    return (
        <div className="">
            <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 m-0 px-2" title="Control administrativo" onClick={() => loadData(currentItemId)}>
                    <Icon name="clipboard-check" size={16} /></Button>

            <Modal contentLabel="REVIEW ACTION"
                isOpen={review_modal}
               
                ariaHideApp={false}
            >
                {currentItem ? <>
                    <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="th" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Control administrativo — {currentItem.id_global}</h2>
                        </div>
                        <button type="button" onClick={() => setModal(prev => !prev)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                    <hr />
                    {SOLICITORS_COMPONENT()}
                    {DESC_COMMPONENT()}
                    {STUDY_COMMPONENT()}
                    {RESOLVE_COMMPONENT()}
                </>

                    : "CARGARGANDO..."}

                <div className="text-end py-4 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setModal(prev => !prev)}>
                        <Icon name="X" size={14} /> Cerrar</Button>
                </div>
            </Modal>
        </div>
    );
}

export default PQRS_ACTION_REVIEW;
