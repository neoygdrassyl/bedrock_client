import React, { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { NORM_GEN_DATA, ELEMENTS } from './norm.vars'
import moment from 'moment';
import VIEWER from '../../../components/viewer.component';
import FICHA_NORM_JSON from './FICHA_NORM_1.json'

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
const URL_ROOT = "http://bmg1.dovela-services.com/" || window.location.hostname
const URL_PATH = "/public_docs/OTHERS/PERFILES_NORMA/";

export default function NORM_RESUME(props) {
    const { translation, swaMsg, globals, id } = props;

    const [load, setLoad] = useState(0);
    const [item_general, setItem] = useState(default_Item);
    const [item_img, setImg] = useState(false);
    const [items_predios, setPredios] = useState([]);
    const [items_neightbors, setNeighbors] = useState([]);
    const [items_perfils, setPerfils] = useState([]);

    useEffect(() => {
        if (load == 0) {
            setLoad(0);
            loadData();
            loadData_predios();
            loadData_perfiles();
            setLoad(1);
        }
    }, [load, id]);

    // ************************** APIS ************************ //
    function loadData() {
        Norms_Service.get_norm(id)
            .then(response => {
                setItem(response.data)
                setLoad(1)
                getImage(response.data.fun6id)
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
    function loadData_predios() {
        Norms_Service.getAll_predio(id)
            .then(response => {
                setPredios(response.data)
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
    function loadData_perfiles() {
        Norms_Service.getAll_perfil(id)
            .then(response => {
                setPerfils(response.data)
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
    function getImage(PATH) {
        if (PATH) {
            const URL_PATH = PATH.substring(PATH.lastIndexOf('/') + 1, PATH.length);
            Norms_Service.get_norm_img(URL_PATH)
                .then(response => {
                    let url = response.config.baseURL + response.config.url;
                    setImg(url)
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

    }

    function gen_pdf(){
        let formData = new FormData();

        formData.set('id', item_general.id_out ?? '');

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Norms_Service.gen_pdf(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/norm/" + "NORMA URBANA " + (item_general.id_out ?? '') + ".pdf");
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
    const R_HEADER = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>CONCEPTO DE NORMA URBANISTICA:</div>
            <div className='col'>{item_general.id_in}</div>
            <div className='col'>{item_general.id_out}</div>
        </div>
    </>

    const R_1_GENDATA = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>1. DATOS GENERALES:</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>SOLICITANTE</div>
            <div className='col border'>{item_general.solicitor}</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>DEBERES URBANOS</div>
            <div className='col border'>{item_general.urban_duties ? 'APLICA' : 'NO APLICA'}</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>UTLIDAD PUBLICA</div>
            <div className='col border'>{item_general.public_utility}</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>FICHA</div>
            <div className='col border'>{item_general.ficha}</div>
            <div className='col border'>SECTOR</div>
            <div className='col border'>{item_general.sector}</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>SUBSECTOR</div>
            <div className='col border'>{item_general.subsector}</div>
            <div className='col border'>FRENTE NORM.</div>
            <div className='col border'>{item_general.front}</div>
        </div>
        <div className='row m-1'>
            <div className='col border'>TIPO DE FRENTE</div>
            <div className='col border'>{item_general.front_type}</div>
            <div className='col border'>NUMERO DE FRENTES</div>
            <div className='col border'>{item_general.front_n}</div>
        </div>
    </>

    const R_1_1_IMG = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>UBICACIÓN FICHA NORMATIVA:</div>
        </div>
        <div className='row m-1'>
            <img src={item_img} width={"100%"} alt="IMAGEN NO DISPONIBLE" />
        </div>
    </>

    const R_2_PREDIOS = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>2. ATRIBUTOS DEL PREDIO:</div>
        </div>
        {items_predios.map((predio, i) => <>
            <div className='row m-1'>
                <div className='col border fw-bold'>PREDIO {i + 1}: {predio.predial}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>DIRECCIÓN</div>
                <div className='col border'>{predio.dir}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>COMUNA</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>BARRIO</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ESTRATO</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ÁREA DEL PREDIO (m2)</div>
                <div className='col border'>{predio.area}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>FRENTE DEL PREDIO (m)</div>
                <div className='col border'>{predio.front}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>CLASIFICACIÓN DEL SUELO</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ZONA NORMATIVA</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ÁREA DE ACTIVIDAD</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>TRATAMIENTO URBANÍSTICO</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>SUJETO A COMPENSACIÓN POR ESP PUB ART 192</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ZONA ECONÓMICA URBANA (ZGU)</div>
                <div className='col'>
                    <div className='row'>
                        <div className='col border'>cod: XXXX</div>
                        <div className='col border'>$m2: XXXX</div>
                    </div>
                </div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ZONIFICACIÓN RESTRICCIONES A LA OCUPACIÓN</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>AMENAZA Y RIESGO</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>BIEN DE INTERÉS CULTURAL (BIC)</div>
                <div className='col border'>XXXX</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ÁREA DE INFLUENCIA DE BIC</div>
                <div className='col border'>XXXX</div>
            </div>
        </>)}
    </>

    const R_3_USES = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>3. CATEGORÍAS DE USOS Y UNIDADES DE USO PERMITIDAS:</div>
        </div>
    </>

    const R_4_EDIF = () => {
        let FICHA = FICHA_NORM_JSON.find(ficha => ficha.sector == item_general.sector && ficha.subsector == item_general.subsector)
        if (!FICHA) FICHA = {}
        return <>
            <div className='bg-dark p-2 m-1 row text-light'>
                <div className='col'>4. EDIFICABILIDAD:</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>SECTOR</div>
                <div className='col border'>{item_general.sector}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>SUBSECTOR</div>
                <div className='col border'>{item_general.subsector}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>FRENTE DEL LOTE</div>
                <div className='col border'>{FICHA.front}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>INDICE DE OCUPACIÓN</div>
                <div className='col border'>{FICHA.ind_ocu}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>INDICE DE CONSTRUCCIÓN</div>
                <div className='col border'>{FICHA.ind_con}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>ALTURA MÁXIMA PERMITIDA</div>
                <div className='col border'>{FICHA.height}</div>
            </div>
            <div className='row m-1'>
                <div className='col border'>TIPOLOGÍA EDIFICADORA</div>
                <div className='col border'>{FICHA.tipology}</div>
            </div>
        </>
    }

    const R_5_AISLAMIENTOS = () => {
        let FICHA = FICHA_NORM_JSON.find(ficha => ficha.sector == item_general.sector && ficha.subsector == item_general.subsector)
        if (!FICHA) FICHA = {}

        return <>
            <div className='bg-dark p-2 m-1 row text-light'>
                <div className='col'>5. AISLAMIENTO POSTERIORES Y LATERALES:</div>
            </div>
            <div className='row m-1 fw-bold text-center'>
                <div className='col border'>NR. PISOS</div>
                <div className='col border'>AISL. POSTERIOR</div>
                <div className='col border'>AISL. LATERAL</div>
            </div>
            <div className='row m-1 text-center'>
                <div className='col border'>{FICHA.height}</div>
                <div className='col border'>{FICHA.ais_pos}</div>
                <div className='col border'>{FICHA.ais_lat}</div>
            </div>
        </>
    }

    const R_6_PERFIL_VIAL = <>
        <div className='bg-dark p-2 m-1 row text-light'>
            <div className='col'>6. PERFIL VIAL</div>
        </div>
        {items_perfils.map(perfil => <>
            <div className='row m-1'>
                <div className='col border'>CODIGO</div>
                <div className='col border'>{perfil.code}</div>
                <div className='col border'>TIPO DE PERFIL</div>
                <div className='col border'>{perfil.perfil}</div>
            </div>
            <div className='row m-2 p-2'>
                <img src={URL_ROOT + URL_PATH + perfil.perfil+ ".png"} alt="IMAGEN DE PERFIL NO ENCONTRADA" width="80%"/>
            </div>
            <div className='row m-1 fw-bold text-center'>
                <div className='col border border-dark'>ELEMENTO</div>
                <div className='col border border-dark'>NORMA</div>
                <div className='col border border-dark'>EN SITIO</div>
            </div>
            <ELEMENTS_LIST id={perfil.id} swaMsg={swaMsg} />
            <div className='row m-1'>
                <div className='col border'>Antejardin</div>
                <div className='col border text-center'>{perfil.antejardin_n}</div>
                <div className='col border text-center'>{perfil.antejardin_p}</div>
            </div>
        </>)}
    </>



    const RESUME = <>
        {R_HEADER}
        <dvi className="row">
            <div className='col'>
                {R_1_GENDATA}
                {R_2_PREDIOS}
            </div>
            <div className='col'>{R_1_1_IMG}</div>
        </dvi>
        {R_3_USES}
        <dvi className="row">
            <div className='col'>{R_4_EDIF()}</div>
            <div className='col'>{R_5_AISLAMIENTOS()}</div>
        </dvi>
        {R_6_PERFIL_VIAL}
    </>

    return (
        <>
            <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                <h3 class="text-uppercase pb-2">5. RESUMEN DE INFORMACIÓN:</h3>
                {RESUME}
                <div className='row text-center'>
                    <div className='col'><button onClick={() => gen_pdf()} className="btn btn-sm btn-danger my-1" type='submit'><i class="far fa-file-pdf"></i> GENERAR PDF </button></div>
                </div>
                <hr />
            </Suspense>

        </>
    );
}

function ELEMENTS_LIST(props) {
    const { swaMsg, id } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (load == 0) {
            loadData()
        }
    }, [load]);

    function loadData() {
        setLoad(0)
        Norms_Service.getAll_element(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.error(e);
            });
    }

    const LIST = <>
        {data.map(element => <>
            <div className='row m-1'>
                <div className='col border'>{ ELEMENTS.find(ele => ele.value == element.element) ? ELEMENTS.find(ele => ele.value == element.element).name : 'OTRO ELEMENTO'}</div>
                <div className='col border text-center'>{element.dimension_n}</div>
                <div className='col border text-center'>{element.dimension_p}</div>
            </div>
        </>)}
    </>

    return <>
        {LIST}
    </>
}