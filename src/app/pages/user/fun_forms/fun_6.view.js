import { useState, useEffect, useRef } from 'react';
import FUNService from '../../../services/fun.service'

import DataTable from '@/components/data-table-bridge';
import dayjs from 'dayjs';
import FUN_SERVICE from '../../../services/fun.service';
import VIZUALIZER from '../../../components/vizualizer.component';
import DOCS_LIST from './components/docs_list.component';
import FUN_6_HISTORY from './components/fun_6_history.component';
import submitService from '../../../services/submit.service';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function FUN_6_VIEW({ translation, swaMsg, globals, currentItem, currentId, readOnly, title, VREdit, parentLoad, updateParentLoad }) {
    const [attachs, setAttachs] = useState(0);
    const [edit, setEdit] = useState(false);
    const [item, setItem] = useState(null);
    const [show_doc_1, setShowDoc1] = useState(false);
    const [modal_searchList, setModalSearchList] = useState(false);
    const [currentItem6, setCurrentItem6] = useState([]);
    const [VRList, setVRList] = useState([]);
    const [load, setLoad] = useState(false);

    const prevItemRef = useRef(item);
    const prevCurrentItemRef = useRef(currentItem);

    const requestUpdate = (id) => {
        retrieveItem(id);
    };
    const retrieveItemVR = (id) => {
        submitService.getIdRelated(id).then(response => {
            let newList = [];
            let List = response.data
            if (!List) return;
            List.map((value, i) => {
                let vr = value.id_public;
                if (!newList.includes(vr)) newList.push(vr)
            })
            setVRList(newList);
            setLoad(true);
        })
    };
    const retrieveItem = (id) => {
        FUN_SERVICE.get(id)
            .then(response => {
                setCurrentItem6(response.data.fun_6s);
                setLoad(true);
            })
            .catch(e => {
                console.log(e);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    };

    useEffect(() => {
        retrieveItem(currentId);
        retrieveItemVR(currentItem.id_public);
    }, []);

    useEffect(() => {
        if (item !== prevItemRef.current && item != null) {
            document.getElementById('fun6_descriptions_edit').value = item.description;
            document.getElementById('fun6_codes_edit').value = item.id_public;
            document.getElementById('fun6_pages_edit').value = item.pages;
            document.getElementById('fun6_dates_edit').value = item.date;
        }
        prevItemRef.current = item;
    }, [item]);

    useEffect(() => {
        if (currentItem !== prevCurrentItemRef.current && currentItem != null) {
            retrieveItem(currentId);
        }
        prevCurrentItemRef.current = currentItem;
    }, [currentItem]);

    useEffect(() => {
        if (parentLoad == 0 && parentLoad != undefined) {
            retrieveItem(currentId);
            updateParentLoad(1);
        }
    }, [parentLoad]);

        var formData = new FormData();

        let _CHILD_6_LIST = () => {
            let _LIST = currentItem6;
            let isRewDoc = (id) => id.includes('law')  || id.includes('eng') || id.includes('arc')
            const columns = [
                {
                    name: 'DESCRIPCIÓN',
                    selector: row => row.description,
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.description}</span>
                },
                {
                    name: 'VR',
                    selector: row => row.id_replace,
                    sortable: true,
                    filterable: true,
                    minWidth: '50px',
                    maxWidth: '150px',
                    cell: row => VREdit && !isRewDoc(row.id_replace || '') ? <select className='form-select form-select-sm' id="f_6_vr" defaultValue={row.id_replace || ''}
                        onChange={(e) => edit_6_vr(row.id, e.target.value)}>
                        <option value="">SIN VR</option>
                        {VRList.map(vr => <option>{vr}</option>)}
                    </select> : isRewDoc(row.id_replace || '') ? 'INFORME' : <label>{row.id_replace}</label>
                },
                {
                    name: 'CÓDIGO',
                    selector: row => row.id_public,
                    sortable: true,
                    filterable: true,
                    maxWidth: '50px',
                    cell: row => <span className="text-sm">{row.id_public}</span>
                },
                {
                    name: 'FOLIOS',
                    selector: row => row.pages,
                    sortable: true,
                    filterable: true,
                    maxWidth: '40px',
                    cell: row => <span className="text-sm">{row.pages}</span>
                },
                {
                    name: 'FECHA RADICACIÓN',
                    selector: row => row.date,
                    sortable: true,
                    filterable: true,
                    maxWidth: '100px',
                    cell: row => <span className="text-sm">{row.date}</span>
                },
                /**
                 * {
                    name: 'ESTADO',
                    button: true,
                    maxWidth: '50px',
                    omit: readOnly ? true : false,
                    cell: row =>
                        <div className="form-check form-switch">
                            <input className="form-check-input" type="checkbox" defaultChecked={row.active == 1 ? true : false} onChange={() => setChecked6(row)} />
                        </div>
                },
                 * 
                 */
                {
                    name: 'ACCIÓN',
                    button: true,
                    minWidth: '150px',
                    cell: row => <>
                        <VIZUALIZER url={row.path + "/" + row.filename} apipath={'/files/'}
                            icon='fas fa-search'
                            iconWrapper='btn btn-sm btn-info m-0 p-1 shadow-none'
                            iconStyle={{ fontSize: '150%' }} />
                        <FUN_6_HISTORY translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            fun6={row} />
                        {readOnly ? '' :
                            window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2?
                                <>
                                    <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => set_edit_6(row)}>
                                            <Icon name="edit" size={16} style={{ fontSize: '150%' }} /></button></span>
                                    <span title="Eliminar Item"><button type="button" className="btn btn-danger btn-sm  m-0 p-1 shadow-none" onClick={() => delete_6(row.id)}>
                                            <Icon name="trash-alt" size={16} style={{ fontSize: '150%' }} /></button></span>
                                </>
                                : ''
                        }

                    </>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                noDataComponent="No hay Items"
                striped="true"
                columns={columns}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[15, 30, 60]}
                className="data-table-component"
                title={'DOCUMENTOS DIGITALIZADOS'}
                noHeader={!title}

                load={load}
                progressPending={!load}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                dense
            />
        }
        let setValues_edit = (refs, values) => {
            document.getElementById('fun6_codes_edit').value = values[0];
            document.getElementById('fun6_descriptions_edit').value = values[1];
        }
        let _EDIT_COMPONENT = () => {
            return <><h3 className="text-uppercase text-center py-3" id="fund_edit">ACTUALIZAR DOCUMENTO</h3>
                <div className="row">
                    <div className="col-12">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                            <input type="file" className="form-control" id="file_fun6s_edit" accept="image/png, image/jpeg application/pdf" />
                        </div>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="paperclip" size={16} /></span>
                            <input list="fun_6_docs_list" id="fun6_descriptions_edit" className="form-control" required />
                            <DOCS_LIST idRef={''} setValues={setValues_edit} text={'VER LISTA'} />
                        </div>
                    </div>
                </div>
                <div className="row d-flex justify-content-start mb-3">
                    <div className="col-3">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="hashtag" size={16} /></span>
                            <input type="text" className="form-control" id="fun6_codes_edit" />
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="sticky-note" size={16} /></span>
                            <input type="number" className="form-control" step="1" min="0" id="fun6_pages_edit" required />
                        </div>
                    </div>
                    <div className="col-5">
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white"><Icon name="calendar-alt" size={16} />&nbsp;Fecha Anexo</span>
                            <input type="date" className="form-control" max="2100-01-01" id="fun6_dates_edit" required />
                        </div>
                    </div>
                </div>
            </>
        }
        let setChecked6 = (item) => {
            formData = new FormData();
            let id = item.id
            let active = item.active;
            active = active == 1 ? 0 : 1;
            formData.set('active', active);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        requestUpdate(currentItem.id);
                    } else {
                        if (response.status == 500) {
                        }
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }
        let delete_6 = (id) => {
            formData = new FormData();
            swalConfirm({
                title: "ELIMINAR ESTE ITEM",
                text: "¿Esta seguro de eliminar de forma permanente este item?",
                icon: 'question',
                confirmButtonText: "ELIMINAR",
            }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    FUNService.delete_6(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                requestUpdate(currentItem.id);
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
        let set_edit_6 = (_item) => {
            setItem(_item);
            setEdit(true);
        }
        let edit_6 = (e) => {
            e.preventDefault();
            formData = new FormData();
            // FILE DATA
            let _creationYear = dayjs(currentItem.createdAt).format('YY');
            let _folder = currentItem.id_public;
            let file = document.getElementById('file_fun6s_edit').files[0];
            if (file) {
                formData.append('file', file, "fun6_" + _creationYear + "_" + _folder + "_" + file.name);
                formData.set('attached', true);

            } else {
                formData.set('attached', false);
            }

            let description = document.getElementById('fun6_descriptions_edit').value;
            formData.set('description', description);
            let id_public = document.getElementById('fun6_codes_edit').value;
            formData.set('id_public', id_public);
            let pages = document.getElementById('fun6_pages_edit').value;
            formData.set('pages', pages);
            formData.set('id_public', id_public);
            let date = document.getElementById('fun6_dates_edit').value;

            if (!date) date = null;
            formData.set('date', date);
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            FUNService.update_6(item.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalSuccess({ title: swaMsg.generic_success_title, text: swaMsg.generic_success_text });
                        setEdit(false); setItem(null);
                        requestUpdate(currentItem.id);
                    } else {
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                });

        }
        let edit_6_vr = (id, new_vr) => {
            formData = new FormData();
            formData.set('id_replace', new_vr);
            FUNService.update_6(id, formData)
                .then(response => {
                    if (response.data === 'OK') {

                        setEdit(false); setItem(null);
                        requestUpdate(currentItem.id);
                    }
                })
                .catch(e => {
                    console.log(e);
                });
        }

        return (
            <div>
                {_CHILD_6_LIST()}
                {edit
                    ? <>
                        <form id="fun_6_d_edit" onSubmit={edit_6} className="py-3">
                            {_EDIT_COMPONENT()}
                            <div className="row text-center">
                                <div className="col-12">
                                    <button className="btn btn-lg btn-success"><Icon name="archive" size={16} /> GUARDAR CAMBIOS </button>
                                </div>
                            </div>
                        </form></> : ""}
            </div>
        );
}

export default FUN_6_VIEW;