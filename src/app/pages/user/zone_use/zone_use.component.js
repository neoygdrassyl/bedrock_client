import React, { Suspense, useEffect, useState, } from 'react';
import Zone_Use_Service from "../../../services/zone_use.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { SUBMIT_ARC_AREA_ACTIVIDAD, SUBMIT_ARC_TRATAMIENTO_URBANISTICO, SUBMIT_ARC_ZONS_RESTRICCION } from '../../../components/vars.global';
import UU from "../../../components/jsons/UU.json"

const MySwal = withReactContent(Swal);
export default function ZONE_USE_COMPONENT(props) {
    const { translation, swaMsg, globals, id, refresh, setrRfresh } = props;

    const [load, setLoad] = useState(0);
    const [item, setItem] = useState(null);

    useEffect(() => {
        if (load == 0 || refresh == 1) {
            loadData();
            setLoad(1);
            setrRfresh(0);
        }
    }, [load, id, refresh]);

    // ************************** APIS ************************ //
    function loadData() {
        Zone_Use_Service.get(id)
            .then(response => {
                setItem(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.error(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function save() {

        let formData = new FormData();
        let id_out = document.getElementById("zone_use_id_out").value;
        if (id_out) formData.set('id_out', id_out);
        let solicitor = document.getElementById("zone_use_solicitor").value;
        formData.set('solicitor', solicitor);

        let cla_suelo = document.getElementById("zone_use_cla_suelo").value;
        formData.set('cla_suelo', cla_suelo);
        let area_act = document.getElementById("zone_use_area_act").value;
        formData.set('area_act', area_act);
        let trat_urb = document.getElementById("zone_use_trat_urb").value;
        formData.set('trat_urb', trat_urb);
        let zon_rest = document.getElementById("zone_use_zon_rest").value;
        formData.set('zon_rest', zon_rest);

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

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Zone_Use_Service.update(id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadData()
                    setrRfresh(1)
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
                if (e.response.data.message == "Validation error") {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
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
            });
    };

    // ***************************  DATA GETTER *********************** //

    function gen_pdf() {
        let formData = new FormData();

        formData.set('id', id);
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Zone_Use_Service.gen_pdf(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/zone_use/" + "CONCEPTO DE USO DEL SUELO " + (item.id_out ?? '') + ".pdf");
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

    // ***************************  JXS *********************** //

    const PART_1 = (item) => (
        <>
            <div className="row">
                <div className="col-4">
                    <label >1.1 Nr. Radicación</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-hashtag"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_id_in" required disabled defaultValue={item.id_in} />
                    </div>
                </div>
                <div className="col-4">
                    <label >1.2 Nr. Expedición</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-hashtag"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_id_out" defaultValue={item.id_out} />
                    </div>
                </div>
                <div className="col-4">
                    <label >1.3 Solicitante</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-user"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_solicitor" defaultValue={item.solicitor} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.4 Clasificación Suelo</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select className="form-select" id="zone_use_cla_suelo" defaultValue={item.cla_suelo}>
                            <option>Urbano</option>
                            <option>Rural</option>
                            <option>Expansión</option>
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.5 Área de actividad</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select className="form-select" id="zone_use_area_act" defaultValue={item.area_act} >
                            {SUBMIT_ARC_AREA_ACTIVIDAD.map(op => <option>{op}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.6 Tratamiento Urbanístico</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select className="form-select" id="zone_use_trat_urb" defaultValue={item.trat_urb} >
                            {SUBMIT_ARC_TRATAMIENTO_URBANISTICO.map(op => <option>{op}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.7 Zonif. Restricción Ocupación</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select className="form-select" id="zone_use_zon_rest" defaultValue={item.zon_rest} >
                            {SUBMIT_ARC_ZONS_RESTRICCION.map(op => <option>{op}</option>)}
                        </select>
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
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_predial" defaultValue={item.predial} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.2 Dirección</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_dir" defaultValue={item.dir} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.3 Barrio</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_neighbour" defaultValue={item.neighbour} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <label >2.4 Área</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-cube"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_area" defaultValue={item.area} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.4 Frente</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-cube"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_front" defaultValue={item.front} />
                    </div>
                </div>
                <div className="col-4">
                    <label >2.4 Fondo</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-cube"></i>
                        </span>
                        <input type="text" class="form-control" id="zone_use_deep" defaultValue={item.deep} />
                    </div>
                </div>

            </div>
        </>
    )

    const R_4_USES =  (item) => <>
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
                    <h3 class="text-uppercase pb-2">1. INFORMACIÓN GENERAL</h3>
                    {PART_1(item)}

                    <h3 class="text-uppercase py-2">2. INFORMACIÓN PREDIO</h3>
                    {PART_2(item)}

                    <h3 class="text-uppercase py-2">3. CONSULTA</h3>
                    <div className="row">
                        <div className="col-12">
                            <div class="input-group mb-1">
                                <textarea rows={4} class="input-group" id="zone_use_consulta" defaultValue={item.consulta} />
                            </div>
                        </div>
                    </div>

                    <h3 class="text-uppercase py-2">4. CATEGORÍAS DE USOS Y UNIDADES DE USO PERMITIDOS</h3>
                    {R_4_USES(item)}

                    <h3 class="text-uppercase py-2">5. CONCEPTO DE USO DEL SUELO</h3>
                    <div className="row">
                        <div className="col-12">
                            <div class="input-group mb-1">
                                <textarea rows={4} class="input-group" id="zone_use_concepto" defaultValue={item.concepto} />
                            </div>
                        </div>
                    </div>


                    <div className='row text-center'>
                        <div className='col'><button onClick={() => save()} className="btn btn-sm btn-success my-1" type='submit'><i class="far fa-save"></i> GUARDAR </button></div>
                        <div className='col'><button onClick={() => gen_pdf()} className="btn btn-sm btn-danger my-1" type='submit'><i class="far fa-file-pdf"></i> GENERAR PDF </button></div>
                    </div>
                    <hr />
                </Suspense>
            </>
                : <div className='row text-center'>CARGANDO...</div>}
        </>
    );
}

