import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
const Divider = ({ children }) => <div className="dvl-divider text-center my-2"><span className="text-muted small">{children}</span></div>;
import VIEWER from '../../../components/viewer.component';
import VIZUALIZER from '../../../components/vizualizer.component';
import profesionalsService from '../../../services/profesionals.service';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

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

    let FORM_COMPONENT = () => {
        return <>
            <Divider>INFORMACIÓN GENEAL</Divider>
            <div className='row my-1'>
                <div className='col'>
                    <label>Primer Nombre</label>
                    <input type="text" className="form-control" id="prof_name" defaultValue={data.name} />
                </div>
                <div className='col'>
                    <label>Segundo Nombre</label>
                    <input type="text" className="form-control" id="prof_name_2" defaultValue={data.name_2} />
                </div>
                <div className='col'>
                    <label>Primer Apellido</label>
                    <input type="text" className="form-control" id="prof_surname" defaultValue={data.surname} />
                </div>
                <div className='col'>
                    <label>Segundo Apellido</label>
                    <input type="text" className="form-control" id="prof_surname_2" defaultValue={data.surname_2} />
                </div>
            </div>
            <div className='row my-1'>
                <div className='col'>
                    <label>Titulo</label>
                    <select className="form-select" id="prof_title" defaultValue={data.title}>
                        <option value={'arq'}>ARQUITECTO</option>
                        <option value={'eng'}>INGENIERO</option>
                        <option value={'law'}>ABOGADO</option>
                        <option value={'oth'}>OTRO</option>
                    </select>
                </div>
                <div className='col'>
                    <label>Documento</label>
                    <input type="text" className="form-control" id="prof_id_number" defaultValue={data.id_number} required
                        onBlur={(e) => { if (e.currentTarget === e.target) _REGEX_IDNUMBER(e) }} />
                </div>
                <div className='col'>
                    <label>Email</label>
                    <input type="text" className="form-control" id="prof_email" defaultValue={data.email} />
                </div>
                <div className='col'>
                    <label>Número de contacto</label>
                    <input type="text" className="form-control" id="prof_number" defaultValue={data.number} />
                </div>
            </div>
            <div className='row my-1'>
                <div className='col'>
                    <label>Matricula</label>
                    <input type="text" className="form-control" id="prof_registration" defaultValue={data.registration} />
                </div>
                <div className='col'>
                    <label>Matricula Fecha</label>
                    <input type="date" className="form-control" id="prof_registration_date" defaultValue={data.registration_date} />
                </div>
                <div className='col-6'>
                    <div className='mt-4'>
                    <label>Concentimiento de trato de datos: </label> {data.concent ? <Icon name="check" size={16} className="text-success" /> : <Icon name="times" size={16} className="text-danger ms-2" />} 
                    </div>
                </div>
            </div>
            <Divider>DOCUMENTOS</Divider>
            <div className='row my-1'>
                <div className='col'>
                    <label>Hoja de Vida y Certificados</label>
                    {data.attach_cv ? VIEWER_COMPONENT(data.id_number, `attach_cv.${data.attach_cv}`) : <Icon name="times" size={16} className="text-danger ms-2" />}
                </div>
                <div className='col'>
                    <label>Documento de Identidad</label>
                    {data.attach_id ? VIEWER_COMPONENT(data.id_number, `attach_id.${data.attach_id}`) : <Icon name="times" size={16} className="text-danger ms-2" />}
                </div>
                <div className='col'>
                    <label>Matricula</label>
                    {data.attach_reg ? VIEWER_COMPONENT(data.id_number, `attach_reg.${data.attach_reg}`) : <Icon name="times" size={16} className="text-danger ms-2" />}
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

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

        if (!id) create(formData)
        if (id) return update(formData);
    }

    function create(data) {
        data.set('active', 1);
        profesionalsService.create(data)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.CLOSE();
                }
                else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    function update(data) {
        profesionalsService.update(id, data)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    props.UPDATE();
                }
                else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            })
            .catch(e => {
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
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
            <form onSubmit={manage} enctype="multipart/form-data">
                {load == 1 ? FORM_COMPONENT() : ''}
                <div className="text-start py-2">
                    {id ? <Button size="sm" type='submit'><Icon name="edit" size={16} />  GUARDAR</Button>
                        : <Button size="sm" type='submit'><Icon name="plus-circle" size={16} /> CREAR</Button>}
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
