
import SERVICE_ARCHIVE from '../../../services/archive.service';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
export default function ARCHIVE_MANAGE(props) {
    const { translation, swaMsg, globals, currentItem } = props;

    // ***************************  DATA CONVERTER *********************** //

    // ***************************  JXS *********************** //

    // ***************************  DATATABLES *********************** //

    // ***************************  APIS *********************** //
    function create() {
        let formData = new FormData();

        let column = document.getElementById("achr_1").value;
        formData.set('column', column);

        let row = document.getElementById("achr_2").value;
        formData.set('row', row);

        let box = document.getElementById("achr_3").value;
        formData.set('box', box);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        SERVICE_ARCHIVE.create(formData)
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
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    function update() {
        let formData = new FormData();

        let column = document.getElementById("achr_1").value;
        formData.set('column', column);

        let row = document.getElementById("achr_2").value;
        formData.set('row', row);

        let box = document.getElementById("achr_3").value;
        formData.set('box', box);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        SERVICE_ARCHIVE.update(currentItem.id, formData)
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
                console.log(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    return (
        <>
            <div className='row'>
                <div className='col'>
                    <label htmlFor="exampleFormControlInput1">Caja N°</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.box : ''} className="form-control" id="achr_3" />
                </div>
                <div className='col'>
                    <label htmlFor="exampleFormControlInput1">Entrepaño</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.row : ''} className="form-control" id="achr_2" />
                </div>
                <div className='col'>
                    <label htmlFor="exampleFormControlInput1">Estante</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.column : ''} className="form-control" id="achr_1" />
                </div>
            </div>
            <div className='row my-3'>
                <div className='col text-end'>
                    {currentItem ?
                        <button type="button" className="btn btn-sm btn-success" onClick={() => update()}><Icon name="edit" size={16} /> ACTUALIZAR</button>
                        : <button type="button" className="btn btn-sm btn-success" onClick={() => create()}><Icon name="plus-circle" size={16} /> CREAR</button>}
                </div>
            </div>
        </>
    );
}
