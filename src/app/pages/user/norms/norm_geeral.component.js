import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { NORM_GEN_DATA } from './norm.vars'
import moment from 'moment';
import VIEWER from '../../../components/viewer.component';

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
}
export default function NORM_GENERAL(props) {
    const { translation, swaMsg, globals, id } = props;

    const [load, setLoad] = useState(0);
    const [item, setItem] = useState(default_Item);

    const [selectFicha, setFicha] = useState(item.ficha);
    const [selectSector, setSector] = useState(item.sector);
    const [selectSubsector, setSubsector] = useState(item.subsector);

    const [fichas, setFichas] = useState(NORM_GEN_DATA);
    const [sectors, setSectors] = useState(NORM_GEN_DATA[0].sectors);
    const [subsectors, setSubsectors] = useState(NORM_GEN_DATA[0].sectors[0].subsectors);

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    useEffect(() => {
        if (selectFicha) {
            set_Sectors();
            document.getElementById('norm_ficha').value = selectFicha
        }
    }, [selectFicha]);

    useEffect(() => {
        if (selectSector) {
            set_Subsectors();
            document.getElementById('norm_sector').value = selectSector
        }
    }, [selectSector]);

    useEffect(() => {
        if (selectSubsector) {
            document.getElementById('norm_subsector').value = selectSubsector
        }
    }, [selectSubsector]);

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
        if(id_out) formData.set('id_out', id_out);
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
                else{
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

    function getImage(PATH){
        const URL = PATH.substring(PATH.lastIndexOf('/') +1, PATH.length);
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
                        <input type="text" class="form-control" id="norm_front" defaultValue={item.front} />
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