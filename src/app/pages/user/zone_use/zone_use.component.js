import { Suspense, useEffect, useState, useRef, } from 'react';
import { Button } from '@/components/ui/button';
import Zone_Use_Service from "../../../services/zone_use.service"
import { SUBMIT_ARC_AREA_ACTIVIDAD, SUBMIT_ARC_TRATAMIENTO_URBANISTICO, SUBMIT_ARC_ZONS_RESTRICCION } from '../../../components/vars.global';
import UU from "../../../components/jsons/UU.json"
import { Icon } from '@/components/icon';
import { swalClose, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

export default function ZONE_USE_COMPONENT(props) {
    const { translation, swaMsg, globals, id, refresh, setrRfresh } = props;

    const [load, setLoad] = useState(0);
    const [item, setItem] = useState(null);
    const loadRequestIdRef = useRef(0);

    useEffect(() => {
        if (load == 0 || refresh == 1) {
            loadData();
            setLoad(1);
            setrRfresh(0);
        }
    }, [load, id, refresh]);

    // ************************** APIS ************************ //
    function loadData() {
        const requestId = ++loadRequestIdRef.current;
        Zone_Use_Service.get(id)
            .then(response => {
                if (requestId !== loadRequestIdRef.current) return;
                setItem(response.data)
                setLoad(1)
            })
            .catch(e => {
                if (requestId !== loadRequestIdRef.current) return;
                console.error(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    function save() {

        let formData = new FormData();
        let id_out = document.getElementById("zone_use_id_out").value;
        if (id_out) formData.set('id_out', id_out);
        let solicitor = document.getElementById("zone_use_solicitor").value;
        formData.set('solicitor', solicitor);
        let date = document.getElementById("zone_use_date").value;
        formData.set('date', date);

        let cla_suelo = document.getElementById("zone_use_cla_suelo").value;
        formData.set('cla_suelo', cla_suelo);
        let area_act = document.getElementById("zone_use_area_act").value;
        formData.set('area_act', area_act);
        let trat_urb = document.getElementById("zone_use_trat_urb").value;
        formData.set('trat_urb', trat_urb);
        let zon_rest = document.getElementById("zone_use_zon_rest").value;
        formData.set('zon_rest', zon_rest);
        let doc_1_date = document.getElementById("zone_use_doc_1_date").value;
        formData.set('doc_1_date', doc_1_date);
        let doc_2_date = document.getElementById("zone_use_doc_2_date").value;
        formData.set('doc_2_date', doc_2_date);
        let doc_3_date = document.getElementById("zone_use_doc_3_date").value;
        formData.set('doc_3_date', doc_3_date);

        let predial = document.getElementById("zone_use_predial").value;
        formData.set('predial', predial);
        let dir = document.getElementById("zone_use_dir").value;
        formData.set('dir', dir);
        let neighbour = document.getElementById("zone_use_neighbour").value;
        formData.set('neighbour', neighbour);
        let area = document.getElementById("zone_use_area").value;
        formData.set('area', area);
        let front = document.getElementById("zone_use_front").value;
        formData.set('front', front);
        let deep = document.getElementById("zone_use_deep").value;
        formData.set('deep', deep);

        let consulta = document.getElementById("zone_use_consulta").value;
        formData.set('consulta', consulta);
        let concepto = document.getElementById("zone_use_concepto").value;
        formData.set('concepto', concepto);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Zone_Use_Service.update(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    loadData()
                    setrRfresh(1)
                }
                else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                if (e.response.data.message == "Validation error") {
                    swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            });
    };

    // ***************************  DATA GETTER *********************** //

    function gen_pdf() {
        let formData = new FormData();

        formData.set('id', id);
        
        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Zone_Use_Service.gen_pdf(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalClose();
                    window.open(import.meta.env.VITE_API_URL + "/pdf/zone_use/" + "CONCEPTO DE USO DEL SUELO " + (item.id_out ?? '') + ".pdf");
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    // ***************************  JXS *********************** //

    const PART_1 = (item) => (
        <>
            <div className="row">
                <div className="col-3">
                    <label >1.1 Nr. Radicación</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="hashtag" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_id_in" required disabled defaultValue={item.id_in} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.2 Nr. Expedición</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="hashtag" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_id_out" defaultValue={item.id_out} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.3 Solicitante</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="user" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_solicitor" defaultValue={item.solicitor} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.4 Fecha</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar-alt" size={16} />
                        </span>
                        <input type="date" className="form-control" max="2100-01-01" id="zone_use_date" defaultValue={item.date} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.5 Clasificación Suelo</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="star-of-life" size={16} />
                        </span>
                        <select className="form-select" id="zone_use_cla_suelo" defaultValue={item.cla_suelo}>
                            <option>Urbano</option>
                            <option>Rural</option>
                            <option>Expansión</option>
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.6 Área de actividad</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="star-of-life" size={16} />
                        </span>
                        <select className="form-select" id="zone_use_area_act" defaultValue={item.area_act} >
                            {SUBMIT_ARC_AREA_ACTIVIDAD.map(op => <option>{op}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.7 Tratamiento Urbanístico</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="star-of-life" size={16} />
                        </span>
                        <select className="form-select" id="zone_use_trat_urb" defaultValue={item.trat_urb} >
                            {SUBMIT_ARC_TRATAMIENTO_URBANISTICO.map(op => <option>{op}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.8 Zonif. Restricción Ocupación</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="star-of-life" size={16} />
                        </span>
                        <select className="form-select" id="zone_use_zon_rest" defaultValue={item.zon_rest} >
                            {SUBMIT_ARC_ZONS_RESTRICCION.map(op => <option>{op}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.9 Doc. Solicitud</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar-alt" size={16} />
                        </span>
                        <input type="date" className="form-control" max="2100-01-01" id="zone_use_doc_1_date" defaultValue={item.doc_1_date} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.10 Doc. Certificación de tradición</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar-alt" size={16} />
                        </span>
                        <input type="date" className="form-control" max="2100-01-01" id="zone_use_doc_2_date" defaultValue={item.doc_2_date} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.11 Doc. Copia Impuesto Predial</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="calendar-alt" size={16} />
                        </span>
                        <input type="date" className="form-control" max="2100-01-01" id="zone_use_doc_3_date" defaultValue={item.doc_3_date} />
                    </div>
                </div>
            </div>
        </>
    )

    const PART_2 = (item) => (
        <>

            <div className="row">
                <div className="col-4">
                    <label >2.1 Numero Predial</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_predial" defaultValue={item.predial} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.2 Dirección</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_dir" defaultValue={item.dir} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.3 Barrio</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="home" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_neighbour" defaultValue={item.neighbour} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <label >2.4 Área</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="cube" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_area" defaultValue={item.area} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.4 Frente</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="cube" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_front" defaultValue={item.front} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.4 Fondo</label>
                    <div className="input-group mb-1">
                        <span className="input-group-text bg-primary text-primary-foreground">
                            <Icon name="cube" size={16} />
                        </span>
                        <input type="text" className="form-control" id="zone_use_deep" defaultValue={item.deep} />
                    </div>
                </div>

            </div>
        </>
    )

    const R_4_USES = (item) => <>
        <div className='row text-center px-2 mx-1' >
            <div className='col-3 border'>COMERCIO</div>
            <div className='col-9'>
                <div className='row'>
                    <div className='col-3 border'>Principal</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }} >{UU[item.area_act] ? UU[item.area_act].comercio.principal : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Complementario</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].comercio.complementario : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Restringido</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].comercio.restringido : ' '}</div>
                </div>
            </div>
        </div>

        <div className='row text-center px-2 mx-1' >
            <div className='col-3 border'>SERVICIO</div>
            <div className='col-9'>
                <div className='row'>
                    <div className='col-3 border'>Principal</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].servicios.principal : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Complementario</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].servicios.complementario : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Restringido</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].servicios.restringido : ' '}</div>
                </div>
            </div>
        </div>

        <div className='row text-center px-2 mx-1' >
            <div className='col-3 border'>DOTACIONAL</div>
            <div className='col-9'>
                <div className='row'>
                    <div className='col-3 border'>Principal</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].dotacional.principal : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Complementario</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].dotacional.complementario : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Restringido</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].dotacional.restringido : ' '}</div>
                </div>
            </div>
        </div>

        <div className='row text-center px-2 mx-1' >
            <div className='col-3 border'>INDUSTRIAL</div>
            <div className='col-9'>
                <div className='row'>
                    <div className='col-3 border'>Principal</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].industrial.principal : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Complementario</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].industrial.complementario : ' '}</div>
                </div>
                <div className='row'>
                    <div className='col-3 border'>Restringido</div>
                    <div className='col-9 border' style={{ wordBreak: 'break-all' }}>{UU[item.area_act] ? UU[item.area_act].industrial.restringido : ' '}</div>
                </div>
            </div>
        </div>
    </>

    return (
        <>
            {item ? <>
                <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                    <h3 className="pb-2">1. INFORMACIÓN GENERAL</h3>
                    {PART_1(item)}

                    <h3 className="py-2">2. INFORMACIÓN PREDIO</h3>
                    {PART_2(item)}

                    <h3 className="py-2">3. CONSULTA</h3>
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group mb-1">
                                <textarea rows={4} className="input-group" id="zone_use_consulta" defaultValue={item.consulta} />
                            </div>
                        </div>
                    </div>

                    <h3 className="py-2">4. CATEGORÍAS DE USOS Y UNIDADES DE USO PERMITIDOS</h3>
                    {R_4_USES(item)}

                    <h3 className="py-2">5. CONCEPTO DE USO DEL SUELO</h3>
                    <div className="row">
                        <div className="col-12">
                            <div className="input-group mb-1">
                                <textarea rows={4} className="input-group" id="zone_use_concepto" defaultValue={item.concepto} />
                            </div>
                        </div>
                    </div>


                    <div className='row text-center'>
 <div className='col'><Button size="sm" className="my-1" onClick={() => save()} type='submit'><Icon name="save" size={16} /> GUARDAR </Button></div>
 <div className='col'><Button variant="destructive" size="sm" className="my-1" onClick={() => gen_pdf()} type='submit'><Icon name="file-pdf" size={16} /> GENERAR PDF </Button></div>
                    </div>
                    <hr />
                </Suspense>
            </>
                : <div className='row text-center'>CARGANDO...</div>}
        </>
    );
}

