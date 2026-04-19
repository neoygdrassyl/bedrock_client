import { Suspense, useEffect, useState, } from 'react';
import Norms_Service from "../../../services/norm.service"
import DataTable from '@/components/data-table-bridge';
import NORM_ELEMENT from './norm_element.component';
import PERFILES from "../../../components/jsons/PERFILES.json"
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const CARDS = [
    { value: 'ns', name: "NORTE - SUR" },
    { value: 'sn', name: "SUR - NORTE" },
]
export default function NORM_PERFIL(props) {
    const { translation, swaMsg, globals, id, setrRfresh } = props;

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
        Norms_Service.getAll_perfil(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setrRfresh(1)
                setNewItem(false)
                document.getElementById("cb_new_perfil").checked = false
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

        let code = document.getElementById("perfil_code").value;
        formData.set('code', code);
        let perfil = document.getElementById("perfil_perfil").value;
        formData.set('perfil', perfil);
        let card = document.getElementById("perfil_card").value;
        formData.set('card', card);
        let antejardin_n = document.getElementById("perfil_antejardin_n").value;
        formData.set('antejardin_n', antejardin_n);
        let antejardin_p = document.getElementById("perfil_antejardin_p").value;
        formData.set('antejardin_p', antejardin_p);

        formData.set('normId', id);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.create_perfil(formData)
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

        let code = document.getElementById("perfil_code_edit").value;
        formData.set('code', code);
        let perfil = document.getElementById("perfil_perfil_edit").value;
        formData.set('perfil', perfil);
        let card = document.getElementById("perfil_card_edit").value;
        formData.set('card', card);
        let antejardin_n = document.getElementById("perfil_antejardin_n_edit").value;
        formData.set('antejardin_n', antejardin_n);
        let antejardin_p = document.getElementById("perfil_antejardin_p_edit").value;
        formData.set('antejardin_p', antejardin_p);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.update_perfil(editItem.id, formData)
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
                Norms_Service.delete_perfil(id)
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
    // ***************************  DATA GETTER *********************** //

    // ***************************  JXS *********************** //
    const EXPANDED_ROW = ({ data }) => <>
        <NORM_ELEMENT
            translation={translation} swaMsg={swaMsg} globals={globals}
            perfil={data}
        />
    </>;

    const columns = [
        {
            name: 'CODIGO',
            center: true,
            cell: row => row.code
        },
        {
            name: 'PERFIL',
            center: true,
            cell: row => row.perfil
        },
        {
            name: 'CARDINALIDAD',
            center: true,
            cell: row => CARDS.find(card => card.value == row.card) ? CARDS.find(card => card.value == row.card).name : 'SIN CARDINALIDAD'
        },
        {
            name: 'ANTEJARDIN NORMA',
            center: true,
            cell: row => row.antejardin_n
        },
        {
            name: 'ANTEJARDIN SITIO',
            center: true,
            cell: row => row.antejardin_p
        },
        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <span title="Modificar Item"><button type="button" className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => setEditItem(editItem ? false : row)}><Icon name="edit" size={16} /></button></span>
                <span title="Eliminar Item"><button type="button" className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button></span>
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY PERFILES"
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
        expandableRows
        expandableRowsComponent={EXPANDED_ROW}
    />

    let _COMPONENT_MANAGE = (edit = "") => {
        return <>
            <div className="row">
                <div className="col">
                    <label>Codigo</label>
                    <div className="input-group my-1">
                        <input type="number" min={1} max={200} step={1} className="form-control" defaultValue={editItem ? editItem.code : ""} id={"perfil_code" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Perfil</label>
                    <div className="input-group my-1">
                        <select className="form-select" id={"perfil_perfil" + edit} defaultValue={editItem ? editItem.perfil : ""}>
                            {PERFILES.map(perfil => <option>{perfil.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Cardinalidad</label>
                    <div className="input-group my-1">
                        <select className="form-select" id={"perfil_card" + edit} defaultValue={editItem ? editItem.card : ""}>
                            {CARDS.map(card => <option value={card.value}>{card.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Antejardin Proyecto</label>
                    <div className="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.antejardin_n : ""} className="form-control" id={"perfil_antejardin_n" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Antejardin Sitio</label>
                    <div className="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.antejardin_p : ""} className="form-control" id={"perfil_antejardin_p" + edit} />
                    </div>
                </div>
            </div>

        </>
    }

    const NEW_ITEM = <>
        <div className="form-check ms-5">
            <input className="form-check-input" type="checkbox" id="cb_new_perfil" onChange={(e) => setNewItem(e.target.checked)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
                Nuevo Perfil
            </label>
        </div>
        {newItem ?
            <form onSubmit={create_item} id="new-perfil-form">
                {_COMPONENT_MANAGE("")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <button className="btn btn-success btn-sm" ><Icon name="plus-circle" size={16} /> AÑADIR ITEM </button>
                    </div>
                </div>
            </form>
            : null}

    </>

    const EDIT_ITEM = <>
        {editItem ?
            <form onSubmit={edit_item} id="edit-perfil-form">
                {_COMPONENT_MANAGE("_edit")}
                <div className="row my-3 text-center">
                    <div className="col">
                        <button className="btn btn-success btn-sm" ><Icon name="edit" size={16} /> ACTUALIZAR ITEM </button>
                    </div>
                </div>
            </form>
            : null}

    </>
    return (
        <>
            <Suspense fallback={<label className='fw-normal lead text-muted'>CARGANDO...</label>}>
                <h3 className="text-uppercase pb-2">4. INFORMACIÓN PERFILES:</h3>
                {NEW_ITEM}
                {TABLE}
                {EDIT_ITEM}
                <hr />
            </Suspense>

        </>
    );
}