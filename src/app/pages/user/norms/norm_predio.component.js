import { Suspense, useEffect, useState, } from 'react';
import { Button } from '@/components/ui/button';
import Norms_Service from "../../../services/norm.service"
import DataTable from '@/components/data-table-bridge';
import BICS from "../../../components/jsons/BICS.json"
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

export default function NORM_PREDIOS(props) {
    const { translation, swaMsg, globals, id, setrRfresh } = props;

    const [load, setLoad] = useState(0);
    const [data, setData] = useState([]);
    const [dataExtra, setDataExtra] = useState([]);
    const [newItem, setNewItem] = useState(false);
    const [editItem, setEditItem] = useState(false);

    useEffect(() => {
        if (load == 0 || !id) loadData();
    }, [load, id]);

    useEffect(() => {
        transform_data()
    }, [data]);

    // ************************** APIS ************************ //
    function loadData() {
        setLoad(0)
        Norms_Service.getAll_predio(id)
            .then(response => {
                setData(response.data)
                setLoad(1)
                setrRfresh(1)
                setNewItem(false)
                document.getElementById("cb_new").checked = false
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
        let predial = document.getElementById("predio_predial").value;
        formData.set('predial', predial);
        let dir = document.getElementById("predio_dir").value;
        formData.set('dir', dir);
        let area = document.getElementById("predio_area").value;
        formData.set('area', area);
        let front = document.getElementById("predio_front").value;
        formData.set('front', front);

        let bic_pred = document.getElementById("norm_bic_pred").value;
        formData.set('bic_pred', bic_pred);
        let bic_area = document.getElementById("predio_bic_area").value;
        formData.set('bic_area', bic_area);
        let art_192 = document.getElementById("norm_art_192").value;
        formData.set('art_192', art_192);

        formData.set('normId', id);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.create_predio(formData)
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
        let predial = document.getElementById("predio_predial_edit").value;
        formData.set('predial', predial);
        let dir = document.getElementById("predio_dir_edit").value;
        formData.set('dir', dir);
        let area = document.getElementById("predio_area_edit").value;
        formData.set('area', area);
        let front = document.getElementById("predio_front_edit").value;
        formData.set('front', front);

        let bic_pred = document.getElementById("norm_bic_pred_edit").value;
        formData.set('bic_pred', bic_pred);
        let bic_area = document.getElementById("predio_bic_area_edit").value;
        formData.set('bic_area', bic_area);
        let art_192 = document.getElementById("norm_art_192_edit").value;
        formData.set('art_192', art_192);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.update_predio(editItem.id, formData)
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
                Norms_Service.delete_predio(id)
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
    // ***************************  DATA CONVERTERS *********************** //

    function transform_data() {
        let max_area = data.reduce((sum, next) => sum += Number(next.area), 0);
        let max_front = data.reduce((sum, next) => sum += Number(next.front), 0);
        //let max_bic_area = data.reduce((sum, next) => sum += Number(next.bic_area), 0);

        let max_row = { predial: 'TOTAL', dir: '', area: max_area, front: max_front, bic_pred: -1, art_192: -1, bic_area: '', noactions: true }

        setDataExtra([...data, max_row])
    }

    // ***************************  JXS *********************** //
    const columns = [
        {
            name: 'No. PREDIAL',
            selector: row => row.predial,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.predial
        },
        {
            name: 'DIRECCIÓN',
            selector: row => row.dir,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.dir
        },
        {
            name: 'AREA',
            center: true,
            cell: row => row.area
        },
        {
            name: 'FRENTE',
            center: true,
            cell: row => row.front
        },
        {
            name: 'BIC',
            center: true,
            cell: row => {
                if(row.bic_pred === 1) return 'SI'
                if(row.bic_pred === 0) return 'NO'
                return ''
            } 
        },
        {
            name: 'BIC AREA',
            center: true,
            cell: row => {
                if(row.bic_area === '1') return 'APLICA'
                if(row.bic_area === '0') return 'NO APLICA'
                return ''
            } 
        },
        {
            name: 'COMP. ESP. PUB.',
            center: true,
            cell: row => {
                if(row.art_192 === 1) return 'APLICA'
                if(row.art_192 === 0) return 'NO APLICA'
                return ''
            } 
        },
        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => row.noactions ? null : <>
                <span title="Modificar Item"><Button variant="outline" size="sm" className="m-0 p-1" onClick={() => setEditItem(editItem ? false : row)}><Icon name="edit" size={16} /></Button></span>
                <span title="Eliminar Item"><Button variant="destructive" size="sm" className="m-0 p-1" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></Button></span>
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY PREDIOS"
        striped="true"
        columns={columns}
        data={dataExtra}
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
                    <label>Nr. Predial</label>
                    <div className="input-group my-1">
                        <input type="text" className="form-control" defaultValue={editItem ? editItem.predial : ""} id={"predio_predial" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Dirección</label>
                    <div className="input-group my-1">
                        <input type="text" defaultValue={editItem ? editItem.dir : ""} className="form-control" id={"predio_dir" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Area (m2)</label>
                    <div className="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.area : ""} className="form-control" id={"predio_area" + edit} />
                    </div>
                </div>
                <div className="col">
                    <label>Frente (m)</label>
                    <div className="input-group my-1">
                        <input type="number" min="0" step="0.01" defaultValue={editItem ? editItem.front : ""} className="form-control" id={"predio_front" + edit} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-3">
                    <label>BIC</label>
                    <div className="input-group my-1">
                        <select className="form-select" defaultValue={editItem ? editItem.bic_pred : ""} id={"norm_bic_pred" + edit}>
                            <option>NO</option>
                            <option>SI</option>
                            {BICS.map( bic => <option>{bic.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label>Área BIC</label>
                    <div className="input-group my-1">
                    <select className="form-select" defaultValue={editItem ? editItem.bic_area : ""} id={"predio_bic_area" + edit}>
                            <option value={0}>NO</option>
                            <option value={1}>SI</option>
                        </select>
                    </div>
                </div>
                <div className="col-3">
                    <label>Sujeto a Copm. Esp. Publico</label>
                    <div className="input-group my-1">
                    <select className="form-select" defaultValue={editItem ? editItem.art_192 : ""} id={"norm_art_192" + edit}>
                            <option value={0}>NO</option>
                            <option value={1}>SI</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    }

    const NEW_ITEM = <>
        <div className="form-check ms-5">
            <input className="form-check-input" type="checkbox" id="cb_new" onChange={(e) => setNewItem(e.target.checked)} />
            <label className="form-check-label" htmlFor="flexCheckDefault">
                Nuevo Predio
            </label>
        </div>
        {newItem ?
            <form onSubmit={create_item} id="new-predio-form">
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
            <form onSubmit={edit_item} id="edit-predio-form">
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
                <h3 className="pb-2">2. INFORMACIÓN PREDIO(S):</h3>
                {NEW_ITEM}
                {TABLE}
                {EDIT_ITEM}
                <hr />
            </Suspense>

        </>
    );
}