import { useState, useEffect } from 'react';

import { LegacyModal as Modal } from '@/components/legacy-modal';
import { dateParser } from '../../../../components/customClasses/typeParse';
import FUN_SERVICE from '../../../../services/fun.service'
import DataTable from '@/components/data-table-bridge';
import './fun_modal_shared.css';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function FUN_6_HISTORY({ translation, swaMsg, globals, fun6 }) {
        const [modal, setModal] = useState(false);
        const [list, setList] = useState([]);
        const [load, setLoad] = useState(false);
        const [edit, setEdit] = useState(false);
        const [isNew, setIsNew] = useState(false);

        const retrieveItem = () => {
            FUN_SERVICE.getAll_fun_6_h(fun6.id)
                .then(response => {
                    setList(response.data);
                    setLoad(true);
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
                });
        };

        useEffect(() => {
            if (edit) {
                let ITEM = edit;
                document.getElementById('fun_6_h_1_edit').value = ITEM.detail ?? '';
                document.getElementById('fun_6_h_2_edit').value = ITEM.date ?? '';
                document.getElementById('fun_6_h_3_edit').value = ITEM.state ?? '';
            }
        }, [edit]);
        const customStylesForModal = {
            overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 1051,
            },
            content: {
                position: 'absolute',
                top: '15%',
                left: 'var(--fun-sidebar-width)',
                right: '30%',
                bottom: '15%',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',

            }
        };

        let toggle = (state) => {
            if (state) retrieveItem();
            else setLoad(false);
            setModal(!modal);
        }

        // COMPONENT JSX
        let COMPONENT_HISTORY = () => {
            const columns = [
                {
                    name: 'DETALLES',
                    cell: row => <span className="text-sm">{row.detail}</span>
                },
                {
                    name: 'FECHA',
                    selector: row => row.date, // FIX: v7→v8 column selector
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.date}</span>
                },
                {
                    name: 'ESTADO FINAL',
                    selector: row => row.state, // FIX: v7→v8 column selector
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.state == 0 ? "EN ARCHIVO" : "FUERA DE ARCHIVO"}</span>
                },
                {
                    name: 'ACCION',
                    button: true,
                    minWidth: '120px',
                    cell: row => <>
                        <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-2 shadow-none" onClick={() => setEdit(row)}>
                                <Icon name="edit" size={16} /></button></span>
                        <span title="Eliminar Item"><button type="button" className="btn btn-danger btn-sm  m-0 p-2 shadow-none" onClick={() => delete_6_h(row.id)}>
                                <Icon name="trash-alt" size={16} /></button></span>
                    </>
                },
            ]

            return <>
                <div className="row mx-2 text-center">
                    <div className="col border border-dark bg-primary py-2"><label className="fw-bold text-white">Anexo</label></div>
                    <div className="col border border-dark bg-primary py-2"><label className="fw-bold text-white">{dateParser(fun6.date)}</label></div>
                </div>
                <DataTable
                    noDataComponent="No hay Items"
                    striped="true"
                    columns={columns}
                    data={list}
                    highlightOnHover
                    className="data-table-component"
                    noHeader
                />
            </>
        }
        let _COMPONENT_MANAGE = (edit = "") => {
            return <>
                <div className="row">
                    <div className="col-4">
                        <label>Detalles</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="comment-dots" size={16} />
                            </span>
                            <input type="text" className="form-control" id={"fun_6_h_1" + edit} required />
                        </div>
                    </div>

                    <div className="col-4">
                        <label>Fecha</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="calendar-alt" size={16} />
                            </span>
                            <input type="date" max="2100-01-01" className="form-control" id={"fun_6_h_2" + edit} required />
                        </div>
                    </div>

                    <div className="col-4">
                        <label>Estado Final</label>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <Icon name="check-square" size={16} />
                            </span>
                            <select className="form-select" id={"fun_6_h_3" + edit} required >
                                <option value="0">EN ARCHIVO</option>
                                <option value="1">FUERA DE ARCHIVO</option>
                            </select>
                        </div>
                    </div>
                </div>
            </>
        }

        // FUNCTIONS & APIS
        var formData = new FormData();
        let new_item = (e) => {
            e.preventDefault();
            formData = new FormData();

            let detail = document.getElementById("fun_6_h_1").value;
            formData.set('detail', detail);

            let date = document.getElementById("fun_6_h_2").value;
            formData.set('date', date);

            let state = document.getElementById("fun_6_h_3").value;
            formData.set('state', state);

            formData.set('fun6Id', fun6.id);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUN_SERVICE.create_fun6_h(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                        retrieveItem();
                        document.getElementById('fun_6_h_new').reset();
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });
        }
        let edit_6_h = (e) => {
            e.preventDefault();
            formData = new FormData();
            formData = new FormData();

            let detail = document.getElementById("fun_6_h_1_edit").value;
            formData.set('detail', detail);

            let date = document.getElementById("fun_6_h_2_edit").value;
            formData.set('date', date);

            let state = document.getElementById("fun_6_h_3_edit").value;
            formData.set('state', state);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUN_SERVICE.update_6_h(edit.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        setEdit(false);
                        retrieveItem();
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });

        }
        let delete_6_h = (id) => {
            formData = new FormData();
            swalConfirm({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUN_SERVICE.delete_6_h(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                retrieveItem();
                                setEdit(false)
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        });
                }
            });
        }
        return (
            <div>
                <span title="Ver Historial">{/* FIX: Changed from MDBBtn to span to avoid nested button issues */}
                    <span 
                        role="button" 
                        tabIndex={0} 
                        className="btn shadow-none p-1" 
                        onClick={() => toggle(true)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggle(true); }}
                        style={{cursor: 'pointer'}}>
                        <Icon name="history" size={16} style={{fontSize: '150%'}} />
                    </span></span>

                <Modal contentLabel="GENERAL VIEW FUN"
                    isOpen={modal}
                    style={customStylesForModal}
                    ariaHideApp={false}
                >

                    <div className="my-4 d-flex justify-content-between">
                        <label className="fw-bold align-middle"> <Icon name="history" size={16} /> HISTORIA DEL DOCUMENTO</label>
                        <button type="button" className="btn-close" onClick={() => toggle()} />
                    </div>

                    <div className="form-check ms-5">
                        <input className="form-check-input" type="checkbox" onChange={(e) => setIsNew(e.target.checked)} />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                            Nueva entrada
                        </label>
                    </div>
                    {isNew
                        ? <>
                            <form id="fun_6_h_new" onSubmit={new_item}>
                                {_COMPONENT_MANAGE()}
                                <div className="row mb-3 text-center">
                                    <div className="col-12">
                                        <button className="btn btn-success my-3" ><Icon name="file-alt" size={16} /> AÑADIR ITEM </button>
                                    </div>
                                </div>
                            </form>
                        </>
                        : ""}

                    {load
                        ? <>
                            {COMPONENT_HISTORY()}

                            {edit
                                ? <>
                                    <form id="fun_6_d_edit" onSubmit={edit_6_h} className="py-3">
                                        {_COMPONENT_MANAGE('_edit')}
                                        <div className="row text-center">
                                            <div className="col-12">
                                                <button className="btn btn-lg btn-success"><Icon name="archive" size={16} /> GUARDAR CAMBIOS </button>
                                            </div>
                                        </div>
                                    </form></> : ""}
                        </>
                        : <div className="text-center"> <h3 className="fw-bold ">CARGANDO INFORMACION...</h3></div>}

                    <div className="text-end py-4 mt-3">
                        <button type="button" className="btn btn-lg btn-info" onClick={() => toggle()}><Icon name="times-circle" size={16} /> CERRAR</button>
                    </div>
                </Modal>

            </div>
        );
}

export default FUN_6_HISTORY;