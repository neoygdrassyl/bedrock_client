import { MDBBreadcrumb, MDBBreadcrumbItem, MDBBtn } from 'mdb-react-ui-kit';
import { useEffect, useState } from 'react';
import { Divider } from 'rsuite';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import VIEWER from '../../../components/viewer.component';
import VIZUALIZER from '../../../components/vizualizer.component';
import profesionalsService from '../../../services/profesionals.service';
import Solicitors_service from '../../../services/solicitors.service';


const MySwal = withReactContent(Swal);

export default function PROFESIONALS_MANAGE(props) {
    const { translation, swaMsg, globals, id } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState({});

    useEffect(() => {
        if (load == 0 && id) getData(id);
        if (!id) { setLoad(1); setData({}) };
    }, [load]);
    // ***************************  DATA GETTERS *********************** //


    // *************************  DATA CONVERTERS ********************** //
    function _REGEX_IDNUMBER(e) {
        let regex = /^[0-9]+$/i;
        let text = String(e.target.value).trim().replace(/\D/g, "")
        let test = regex.test(text);
        if (test) {
            var _value = Number(text).toLocaleString();
            _value = _value.replaceAll(',', '.');
            document.getElementById(e.target.id).value = _value;
        }
    }
    // ******************************* JSX ***************************** // 
    let VIEWER_COMPONENT = (folder, file) => {
        let _folder = String(folder).trim().replace(/\D/g, "");
        return <>
            <VIEWER params={[_folder, file]} API={downloadFile} />
        </>
    }
    //GET BY ID
    let getSolicitorById = (e) => {
        e.preventDefault();
        let solicitor_id = document.getElementById("solicitor_id_search").value;
        console.log(solicitor_id)
        Solicitors_service.getById(solicitor_id)
            .then(response => {
                if (response.status == 200 && response.data) {
                    setData(response.data);
                    MySwal.fire({
                        title: swaMsg.generic_success_title,
                        text: swaMsg.generic_success_text,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
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
            .catch(err => {
                console.log(err);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }
    // COMPONENTS JSX
    let _COMPONENT_SEARCH = () => {
        return <>
            <form onSubmit={getSolicitorById} className="row">
                <div className="col-lg-10 col-md-6 d-flex align-items-end">
                    <div className='me-2'>
                        <label class="my-1">Buscar registro:</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <i className="fas fa-hashtag"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control USER"
                                id="solicitor_id_search"
                                placeholder="Número de Documento"
                            />
                        </div>
                    </div>
                    {
                        data.name ? <button className='ms-1 rounded-circle' style={{
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer'
                        }}
                            onClick={() => {
                                setData({});
                                document.getElementById('solicitor_id_search').value = ''
                            }
                            }><i className="fas fa-regular fa-trash"></i></button> : ''
                    }
                </div>
            </form >
        </>
    }
    let FORM_COMPONENT = () => {
        return <>
            <Divider>INFORMACIÓN GENERAL</Divider>
            <div className='row my-1'>
                <div className='col'>
                    <label>Primer Nombre</label>
                    <input type="text" class="form-control" id="prof_name" defaultValue={data.name} />
                </div>
                <div className='col'>
                    <label>Segundo Nombre</label>
                    <input type="text" class="form-control" id="prof_name_2" defaultValue={data.name_2} />
                </div>
                <div className='col'>
                    <label>Primer Apellido</label>
                    <input type="text" class="form-control" id="prof_surname" defaultValue={data.surname} />
                </div>
                <div className='col'>
                    <label>Segundo Apellido</label>
                    <input type="text" class="form-control" id="prof_surname_2" defaultValue={data.surname_2} />
                </div>
            </div>
            <div className='row my-1'>
                <div className='col'>
                    <label>Titulo</label>
                    <select class="form-select" id="prof_title" defaultValue={data.title}>
                        <option value={'arq'}>ARQUITECTO</option>
                        <option value={'eng'}>INGENIERO</option>
                        <option value={'law'}>ABOGADO</option>
                        <option value={'oth'}>OTRO</option>
                    </select>
                </div>
                <div className='col'>
                    <label>Documento</label>
                    <input type="text" class="form-control" id="prof_id_number" defaultValue={data.id_number || data.id_doc} required
                        onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                </div>
                <div className='col'>
                    <label>Email</label>
                    <input type="text" class="form-control" id="prof_email" defaultValue={data.email} />
                </div>
                <div className='col'>
                    <label>Número de contacto</label>
                    <input type="text" class="form-control" id="prof_number" defaultValue={data.number || data.phone} />
                </div>
            </div>
            <div className='row my-1'>
                <div className='col'>
                    <label>Matricula</label>
                    <input type="text" class="form-control" id="prof_registration" defaultValue={data.registration} />
                </div>
                <div className='col'>
                    <label>Matricula Fecha</label>
                    <input type="date" class="form-control" id="prof_registration_date" defaultValue={data.registration_date} />
                </div>
            </div>
            <div className='row my-1'>
                <div className='col-6'>
                    <div className='mt-4'>
                        <label>Concentimiento de trato de datos: </label> {data.concent ? <i class="fas fa-check text-success"></i> : <i class="fas fa-times text-danger ms-2"></i>}
                    </div>
                </div>
            </div>
            <Divider>DOCUMENTOS</Divider>
            <div className='row my-1'>
                <div className='col'>
                    <label>Hoja de Vida y Certificados</label>
                    {data.attach_cv ? VIEWER_COMPONENT(data.id_number, `attach_cv.${data.attach_cv}`) : <i class="fas fa-times text-danger ms-2"></i>}
                </div>
                <div className='col'>
                    <label>Documento de Identidad</label>
                    {data.attach_id ? VIEWER_COMPONENT(data.id_number, `attach_id.${data.attach_id}`) : <i class="fas fa-times text-danger ms-2"></i>}
                </div>
                <div className='col'>
                    <label>Matricula</label>
                    {data.attach_reg ? VIEWER_COMPONENT(data.id_number, `attach_reg.${data.attach_reg}`) : <i class="fas fa-times text-danger ms-2"></i>}
                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    function getData(_id) {
        profesionalsService.get(_id)
            .then(response => {
                setData(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
                setLoad(2);
            });
    }

    function manage(e) {
        e.preventDefault();
        let formData = new FormData();

        let name = document.getElementById("prof_name").value;
        formData.set('name', name);
        let name_2 = document.getElementById("prof_name_2").value;
        formData.set('name_2', name_2);
        let surname = document.getElementById("prof_surname").value;
        formData.set('surname', surname);
        let surname_2 = document.getElementById("prof_surname_2").value;
        formData.set('surname_2', surname_2);

        let title = document.getElementById("prof_title").value;
        formData.set('title', title);
        let id_number = document.getElementById("prof_id_number").value;
        formData.set('id_number', id_number);
        let email = document.getElementById("prof_email").value;
        formData.set('email', email);
        let number = document.getElementById("prof_number").value;
        formData.set('number', number);

        let registration = document.getElementById("prof_registration").value;
        formData.set('registration', registration);
        let registration_date = document.getElementById("prof_registration_date").value;
        formData.set('registration_date', registration_date);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });

        if (!id) create(formData)
        if (id) return update(formData);
    }

    function create(data) {
        data.set('active', 1);
        profesionalsService.create(data)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.CLOSE();
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
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function update(data) {
        profesionalsService.update(id, data)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    props.UPDATE();
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
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    function downloadFile(folder, file) {
        return profesionalsService.download(folder, file)
            .then(response => {
                return response
            })
            .catch(e => {
                console.log(e)
                return false
            });
    }
    return (
        <div>
            {load == 0 ? <div className='row text-center'>
                <div className='col'>
                    <label>CARGANDO...</label>
                </div>
            </div> : ''}
            {id ? '' : _COMPONENT_SEARCH()}
            <form onSubmit={manage} enctype="multipart/form-data">
                {load == 1 ? FORM_COMPONENT() : ''}
                <div className="text-start py-2">
                    {id ? <button className="btn btn-sm btn-success" type='submit'><i class="fas fa-edit"></i>  GUARDAR</button>
                        : <button className="btn btn-sm btn-success" type='submit'><i class="fas fa-plus-circle"></i> CREAR</button>}
                </div>
            </form>


            {load == 2 ? <div className='row text-center'>
                <div className='col'>
                    <label>ERROR, CARGUE DE NUEVO</label>
                </div>
            </div> : ''}

        </div >
    );
}
