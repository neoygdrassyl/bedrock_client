import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { NORM_GEN_DATA } from './norm.vars'
import moment from 'moment';
import VIEWER from '../../../components/viewer.component';
import FICHA_NORM from "./FICHA_NORM_1.json"

const MySwal = withReactContent(Swal);
const default_Item = {
    id: false,
    id_in: null,
    id_out: null,
    solicitor: null,
    fun6id: null,
    urban_duties: null,
    public_utility: null,
    ficha: null,
    sector: null,
    subsector: null,
    front: null,
    front_type: null,
    front_n: null,
}
export default function NORM_GENERAL(props) {
    const { translation, swaMsg, globals, id } = props;

    const [load, setLoad] = useState(0);
    const [item, setItem] = useState(default_Item);

    const [selectFicha, setFicha] = useState(item.ficha);
    const [selectSector, setSector] = useState(item.sector);
    const [selectSubsector, setSubsector] = useState(item.subsector);
    const [selectFront, setFront] = useState(item.front);

    const [fichas, setFichas] = useState(NORM_GEN_DATA);
    const [sectors, setSectors] = useState(NORM_GEN_DATA[0].sectors);
    const [subsectors, setSubsectors] = useState(NORM_GEN_DATA[0].sectors[0].subsectors);
    const [fronts, setFronts] = useState(FICHA_NORM[0].front);

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    useEffect(() => {
        if (selectFicha) {
            set_Sectors();
            set_Subsectors();
            set_Fronts();
            document.getElementById('norm_ficha').value = selectFicha
        }
    }, [selectFicha]);

    useEffect(() => {
        if (selectSector) {
            set_Subsectors();
            set_Fronts();
            document.getElementById('norm_sector').value = selectSector
        }
    }, [selectSector]);

    useEffect(() => {
        if (selectSubsector) {
            set_Fronts();
            document.getElementById('norm_subsector').value = selectSubsector
        }
    }, [selectSubsector]);

    useEffect(() => {
        if (selectFront) {
            document.getElementById('norm_front').value = selectFront
        }
    }, [selectFront]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.get_norm(id)
            .then(response => {
                setItem(response.data)
                setLoad(1)
                setFicha(response.data.ficha)
                setSector(response.data.sector)
                setSubsector(response.data.subsector)
                setFront(response.data.front)
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
    function updateForm(event) {
        event.preventDefault();

        let formData = new FormData();
        let id_out = document.getElementById("norm_id_out").value;
        if (id_out) formData.set('id_out', id_out);
        let solicitor = document.getElementById("norm_solicitor").value;
        formData.set('solicitor', solicitor);
        let urban_duties = document.getElementById("norm_urban_duties").value;
        formData.set('urban_duties', urban_duties);
        let public_utility = document.getElementById("norm_public_utility").value;
        formData.set('public_utility', public_utility);
        let ficha = document.getElementById("norm_ficha").value;
        formData.set('ficha', ficha);
        let sector = document.getElementById("norm_sector").value;
        formData.set('sector', sector);
        let subsector = document.getElementById("norm_subsector").value;
        formData.set('subsector', subsector);
        let front = document.getElementById("norm_front").value;
        formData.set('front', front);
        let front_type = document.getElementById("norm_front_type").value;
        formData.set('front_type', front_type);
        let front_n = document.getElementById("norm_front_n").value;
        formData.set('front_n', front_n);
        let geo_n = document.getElementById("norm_geo_n").value;
        formData.set('geo_n', geo_n);
        let geo_e = document.getElementById("norm_geo_e").value;
        formData.set('geo_e', geo_e);


        let comuna = document.getElementById("norm_comuna").value;
        formData.set('comuna', comuna);
        let barrio = document.getElementById("norm_barrio").value;
        formData.set('barrio', barrio);
        let estrato = document.getElementById("norm_estrato").value;
        formData.set('estrato', estrato);
        let cla_suelo = document.getElementById("norm_cla_suelo").value;
        formData.set('cla_suelo', cla_suelo);
        let area_act = document.getElementById("norm_area_act").value;
        formData.set('area_act', area_act);
        let trat_urb = document.getElementById("norm_trat_urb").value;
        formData.set('trat_urb', trat_urb);
        let zon_rest = document.getElementById("norm_zon_rest").value;
        formData.set('zon_rest', zon_rest);
        let amenaza = document.getElementById("norm_amenaza").value;
        formData.set('amenaza', amenaza);
        let zon_norm = document.getElementById("norm_zon_norm").value;
        formData.set('zon_norm', zon_norm);

        let _creationYear = moment(item.createdAt).format('YY');
        let _folder = item.id_in;
        let file = document.getElementById("norm_fun6id");
        if (file.files[0]) {
            formData.set('fun6id', item.fun6id);
            formData.append('file', file.files[0], "norm_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
        }

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.update_norm(id, formData)
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
                        text: "El concecutivo de radicado de este formulario ya existe, debe de elegir un concecutivo nuevo",
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

    function getImage(PATH) {
        const URL = PATH.substring(PATH.lastIndexOf('/') + 1, PATH.length);
        return Norms_Service.get_norm_img(URL)
            .then(response => {
                return response
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

    // ***************************  DATA GETTER *********************** //
    function set_Sectors() {
        let findFicha = fichas.find(ficha => ficha.ficha == selectFicha)
        if (findFicha) setSectors(findFicha.sectors)
    }

    function set_Subsectors() {
        let findSector = sectors.find(sector => sector.sector == selectSector)
        if (findSector) setSubsectors(findSector.subsectors)
    }

    function set_Fronts() {
        let findFront = FICHA_NORM.find(ficha =>
            ficha.ficha == selectFicha &&
            ficha.sector == selectSector &&
            ficha.subsector == selectSubsector)
        if (findFront) setFronts(findFront.front)
    }

    // ***************************  JXS *********************** //
    const FORM_GENERAL = <>
        <form onSubmit={updateForm} id="update-norm-form">
            <div className="row">
                <div className="col-4">
                    <label >1.1 Nr. Radicación</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-hashtag"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_id_in" required disabled defaultValue={item.id_in} />
                    </div>
                </div>
                <div className="col-4">
                    <label >1.2 Nr. Expedición</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-hashtag"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_id_out" defaultValue={item.id_out} />
                    </div>
                </div>
                <div className="col-4">
                    <label >1.3 Solicitante</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-user"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_solicitor" defaultValue={item.solicitor} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-4">
                    <label >1.4 Deberes Urbanos</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-file-alt"></i>
                        </span>
                        <select class="form-select" id="norm_urban_duties" defaultValue={item.urban_duties}>
                            <option value={0}>NO APLICA</option>
                            <option value={1}>APLICA</option>
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label >1.5 Utilidad Publica</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_public_utility" defaultValue={item.public_utility} />
                    </div>
                </div>
                <div className="col">
                    <label >1.6 Imagen </label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-home"></i>
                        </span>
                        <input type="file" class="form-control" id="norm_fun6id" accept="image/png, image/jpeg" />
                        {item.fun6id ? <div><VIEWER API={getImage} params={[item.fun6id]} /></div> : null}
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <label >1.7 Ficha</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_ficha" defaultValue={item.ficha} onChange={(e) => setFicha(e.target.value)}>
                            {fichas.map(ficha => <option>{ficha.ficha}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label >1.8 Sector</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_sector" defaultValue={item.sector} onChange={(e) => setSector(e.target.value)}>
                            {sectors.map(sector => <option>{sector.sector}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label >1.9 Subsector</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_subsector" defaultValue={item.subsector} onChange={(e) => setSubsector(e.target.value)}>
                            {subsectors.map(subsector => <option>{subsector.subsector}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label >1.10 Frente Normativo</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_front" defaultValue={item.front}>
                            <option>{fronts}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.11 Tipo de frente</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_front_type" defaultValue={item.front_type} required>
                            <option>Esquinero</option>
                            <option>Medianero</option>
                            <option>Manzana</option>
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.12 Numero de frentes</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_front_n" defaultValue={item.front_n} required>
                            <option value={1}>1 frente</option>
                            <option value={4}>4 frentes</option>
                            <option value={-1}>Frente de manzana</option>
                        </select>
                    </div>
                </div>

                <div className="col-6">
                    <label >1.13 Georegerenciación</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-map-marker-alt"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_geo_n" defaultValue={item.geo_n} placeholder='Norte' />
                        <input type="text" class="form-control" id="norm_geo_e" defaultValue={item.geo_e} placeholder='Este' />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.14 Comuna</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_comuna" defaultValue={item.comuna} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.15 Barrio</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_barrio" defaultValue={item.barrio} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.16 Estrato</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <select class="form-select" id="norm_estrato" defaultValue={item.estrato} required>
                            <option value={1}>Estrato 1</option>
                            <option value={2}>Estrato 2</option>
                            <option value={3}>Estrato 3</option>
                            <option value={4}>Estrato 4</option>
                            <option value={5}>Estrato 5</option>
                            <option value={6}>Estrato 6</option>
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label >1.17 Clasificación Suelo</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_cla_suelo" defaultValue={item.cla_suelo} />
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-3">
                    <label >1.18 Área de actividad</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_area_act" defaultValue={item.area_act} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.19 Tratamiento Urbanístico</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_trat_urb" defaultValue={item.trat_urb} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.20 Zonif. Restricción Ocupación</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_zon_rest" defaultValue={item.zon_rest} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.21 Amenaza y Riesgo</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_amenaza" defaultValue={item.amenaza} />
                    </div>
                </div>
                <div className="col-3">
                    <label >1.22 Zona Normativa</label>
                    <div class="input-group mb-1">
                        <span class="input-group-text bg-info text-white">
                            <i class="fas fa-star-of-life"></i>
                        </span>
                        <input type="text" class="form-control" id="norm_zon_norm" defaultValue={item.zon_norm} />
                    </div>
                </div>
            </div>

            <div className="text-center my-2">
                <button className="btn btn-sm btn-success my-1" type='submit'><i class="fas fa-edit"></i> ACTUALIZAR </button>
            </div>

        </form>
    </>

    return (
        <>
            <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                <h3 class="text-uppercase pb-2">1. INFORMACIÓN GENERAL:</h3>
                {FORM_GENERAL}
                <hr />
            </Suspense>

        </>
    );
}