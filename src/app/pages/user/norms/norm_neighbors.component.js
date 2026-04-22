import { Suspense, useEffect, useState, } from 'react';
import { Button } from '@/components/ui/button';
import Norms_Service from "../../../services/norm.service"
import DataTable from '@/components/data-table-bridge';
import VIEWER from '../../../components/viewer.component';
import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

export default function NORM_NEIGHBORS(props) {
    const { translation, swaMsg, globals, id, id_in, setrRfresh } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);
    const [newItem, setNewItem] = useState(false);
    const [editItem, setEditItem] = useState(false);

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.getAll_neighbor(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setrRfresh(1)
                setNewItem(false)
                document.getElementById("cb_new_neighbor").checked = false
                setEditItem(false)
            })
            .catch(e => {
                console.error(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    function create_item(event) {
        event.preventDefault();

        let formData = new FormData();
        let card = document.getElementById("predio_card").value;
        formData.set('card', card);
        let floors = document.getElementById("predio_floors").value;
        formData.set('floors', floors);
        let voladizo = document.getElementById("predio_voladizo").value;
        formData.set('voladizo', voladizo);
        let material = document.getElementById("predio_material").value;
        formData.set('material', material);

        let _creationYear = dayjs().format('YY');
        let _folder = id_in;
        let file = document.getElementById("predio_fun6id");
        if (file.files[0]) {
            formData.append('file', file.files[0], "norm_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
        }

        formData.set('normId', id);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.create_neighbor(formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    loadData()
                }
            })
            .catch(e => {
                console.log(e);
                if (e.response.data.message == "Validation error") {
                    swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            });
    };

    function edit_item(event) {
        event.preventDefault();

        let formData = new FormData();
        let card = document.getElementById("predio_card_edit").value;
        formData.set('card', card);
        let floors = document.getElementById("predio_floors_edit").value;
        formData.set('floors', floors);
        let voladizo = document.getElementById("predio_voladizo_edit").value;
        formData.set('voladizo', voladizo);
        let material = document.getElementById("predio_material_edit").value;
        formData.set('material', material);

        
        let _creationYear = dayjs(editItem.createdAt).format('YY');
        let _folder = id_in;
        let file = document.getElementById("predio_fun6id_edit");
        if (file.files[0]) {
            formData.set('fun6id', editItem.fun6id);
            formData.append('file', file.files[0], "norm_" + _creationYear + "_" + _folder + "_" + file.files[0].name)
        }

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.update_neighbor(editItem.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                    loadData()
                }
            })
            .catch(e => {
                console.log(e);
                if (e.response.data.message == "Validation error") {
                    swalError({ title: "ERROR DE DUPLICACION", text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo" });
                } else {
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                }
            });
    };

    function delete_item(id) {
        swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                Norms_Service.delete_neighbor(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            loadData()
                        }
                    })
                    .catch(e => {
                        console.error(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                    });
            }
        });
    }

    function getImage(PATH) {
        const URL = PATH.substring(PATH.lastIndexOf('/') + 1, PATH.length);
        return Norms_Service.get_norm_img(URL)
            .then(response => {
                return response
            })
            .catch(e => {
                console.error(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }
    // ***************************  DATA GETTER *********************** //

    // ***************************  JXS *********************** //
    const columns = [
        {
            name: 'CARDINALIDAD',
            center: true,
            cell: row => row.card
        },
        {
            name: 'PISOS',
            center: true,
            cell: row => row.floors
        },
        {
            name: 'VOLADIZO',
            center: true,
            cell: row => row.voladizo
        },
        {
            name: 'MATERIAL',
            center: true,
            cell: row => row.material
        },
        {
            name: 'IMAGE',
            center: true,
            cell: row => row.fun6id ? <VIEWER API={getImage} params={[row.fun6id]} /> : null
        },
        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-1" onClick={() => setEditItem(editItem ? false : row)}><Icon name="edit" size={16} /></Button></span>
                <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-1" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY VECINOS"
        striped="true"
        columns={columns}
        data={data}
        highlightOnHover
        pagination={false}
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        className="data-table-component"
        noHeader
        dense
        progressPending={!load}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
    />

    let _COMPONENT_MANAGE = (edit = "") => {
        return <>
            <div className="row">
                <div className="col">
                    <label>Cardinalidad</label>
                    <div className="input-group my-1">
                        <input type="text" className="form-control" defaultValue={editItem ? editItem.card : ""} id={"predio_card" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Pisos</label>
                    <div className="input-group my-1">
                        <input type="number" min="0" step="1" defaultValue={editItem ? editItem.floors : ""} className="form-control" id={"predio_floors" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Voladizo</label>
                    <div className="input-group my-1">
                        <input type="text" defaultValue={editItem ? editItem.voladizo : ""} className="form-control" id={"predio_voladizo" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Material</label>
                    <div className="input-group my-1">
                        <input type="text" defaultValue={editItem ? editItem.material : ""} className="form-control" id={"predio_material" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Imagen</label>
                    <div className="input-group my-1">
                        <input type="file" className="form-control" id={"predio_fun6id" + edit} accept="image/png, image/jpeg" />
                    </div>
                </div>
            </div>

        </>
    }

    const NEW_ITEM = <>
        <div className="form-check ms-5">
            <input className="form-check-input" type="checkbox" id="cb_new_neighbor" onChange={(e) => setNewItem(e.target.checked)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
                Nuevo Vecino
            </label>
        </div>
        {newItem ?
            <form onSubmit={create_item} id="new-neighbor-form">
                {_COMPONENT_MANAGE("")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <Button size="sm"><Icon name="plus-circle" size={16} /> AÑADIR ITEM </Button>
                    </div>
                </div>
            </form>
            : null}

    </>

    const EDIT_ITEM = <>
        {editItem ?
            <form onSubmit={edit_item} id="edit-neighbor-form">
                {_COMPONENT_MANAGE("_edit")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <Button size="sm"><Icon name="edit" size={16} /> ACTUALIZAR ITEM </Button>
                    </div>
                </div>
            </form>
            : null}

    </>
    return (
        <>
            <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                <h3 className="pb-2">3. INFORMACIÓN VECINOS:</h3>
                {NEW_ITEM}
                {TABLE}
                {EDIT_ITEM}
                <hr />
            </Suspense>

        </>
    );
}