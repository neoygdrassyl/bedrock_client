import { MDBBtn } from 'mdb-react-ui-kit';
import React from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import SERVICE_ARCHIVE from '../../../services/archive.service';


const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

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

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        SERVICE_ARCHIVE.create(formData)
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
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
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


        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        SERVICE_ARCHIVE.update(currentItem.id, formData)
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
                console.log(e);
                MySwal.fire({
                    title: swaMsg.generic_eror_title,
                    text: swaMsg.generic_error_text,
                    icon: 'warning',
                    confirmButtonText: swaMsg.text_btn,
                });
            });
    }

    return (
        <>
            <div className='row'>
                <div className='col'>
                    <label for="exampleFormControlInput1">Caja N°</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.box : ''} class="form-control" id="achr_3" />
                </div>
                <div className='col'>
                    <label for="exampleFormControlInput1">Entrepaño</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.row : ''} class="form-control" id="achr_2" />
                </div>
                <div className='col'>
                    <label for="exampleFormControlInput1">Estante</label>
                    <input type="number" step={1} defaultValue={currentItem ? currentItem.column : ''} class="form-control" id="achr_1" />
                </div>
            </div>
            <div className='row my-3'>
                <div className='col text-end'>
                    {currentItem ?
                        <MDBBtn className="btn btn-sm btn-success" onClick={() => update()}><i class="far fa-edit"></i> ACTUALIZAR</MDBBtn>
                        : <MDBBtn className="btn btn-sm btn-success" onClick={() => create()}><i class="fas fa-plus-circle"></i> CREAR</MDBBtn>}
                </div>
            </div>
        </>
    );
}
