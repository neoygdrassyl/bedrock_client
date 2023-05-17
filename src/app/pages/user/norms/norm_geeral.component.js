import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

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

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.get_norm(id)
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
    function updateForm(event) {
        event.preventDefault();

        let formData = new FormData();
        let id_out = document.getElementById("norm_id_out").value;
        formData.set('id_out', id_out);
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

    // ***************************  DATA GETTER *********************** //


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
                    <select class="form-select" id="norm_urban_duties"
                        defaultValue={item.urban_duties}>
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
        </div>

        <div className="row">
            <div className="col">
                <label >1.6 Ficha</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-star-of-life"></i>
                    </span>
                    <input type="text" class="form-control" id="norm_ficha" required defaultValue={item.ficha} />
                </div>
            </div>
            <div className="col">
                <label >1.7 Sector</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-star-of-life"></i>
                    </span>
                    <input type="text" class="form-control" id="norm_sector" defaultValue={item.sector} />
                </div>
            </div>
            <div className="col">
                <label >1.8 Subsector</label>
                <div class="input-group mb-1">
                    <span class="input-group-text bg-info text-white">
                        <i class="fas fa-star-of-life"></i>
                    </span>
                    <input type="text" class="form-control" id="norm_subsector" defaultValue={item.subsector} />
                </div>
            </div>
            <div className="col">
                <label >1.9 Frente Normativo</label>
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
                <h3 class="text-uppercase pb-2">1. INFORACIÓN GENERAL:</h3>
                {FORM_GENERAL}
                <hr />
            </Suspense>

        </>
    );
}