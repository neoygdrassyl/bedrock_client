import { useEffect, useState } from 'react';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import { Item } from '../../../components/ui';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import Zone_Use_Service from "../../../services/zone_use.service"
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ZONE_USE_COMPONENT from './zone_use.component';
import { Icon } from '@/components/icon';


const MySwal = withReactContent(Swal);
const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        zIndex: 1050,
    },
    content: {
        position: 'absolute',
        top: '10px',
        left: '12%',
        right: '12%',
        bottom: '10px',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};
export default function ZONE_USE(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    const [modal, setModal] = useState(false);
    const [load, setLoad] = useState(0);
    const [refresh, setrRfresh] = useState(0);
    const [data, setData] = useState([]);
    const [dataOg, setDataOg] = useState([]);
    const [selectedId, setSelectedId] = useState(false);
    const [selectedIdPublic, setSelectedIdPublic] = useState("");

    useEffect(() => {
        if (load == 0) loadData();
    }, [load]);

    // ************************** APIS ************************ //
    function loadData() {
        Zone_Use_Service.getAll()
            .then(response => {
                setData(response.data)
                setDataOg(response.data)
                setLoad(1)
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

    function delete_item(id) {
        MySwal.fire({
            title: "ELIMINAR ESTE ITEM",
            text: "¿Esta seguro de eliminar de forma permanente este item?",
            icon: 'question',
            confirmButtonText: "ELIMINAR",
            showCancelButton: true,
            cancelButtonText: "CANCELAR"
        }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                MySwal.fire({
                    title: swaMsg.title_wait,
                    text: swaMsg.text_wait,
                    icon: 'info',
                    showConfirmButton: false,
                });
                Zone_Use_Service.delete(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            loadData()
                        }
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
        });
    }

    function create(event) {
        event.preventDefault();

        let formData = new FormData();
        let id_in = document.getElementById("id_in").value;
        formData.set('id_in', id_in);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        Zone_Use_Service.create(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });
                    loadData()
                }
            })
            .catch(e => {
                console.log(e);
                if (e.response.data.message == "Validation error") {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El consecutivo de radicado de este formulario ya existe, debe de elegir un consecutivo nuevo",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
                } else {
                    MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                }
            });
    };

    function search(event) {
        event.preventDefault();

        let newFilterList = []
        let search = document.getElementById("search").value;

        if (search == "") {
            setData(dataOg)
        }
        else {
            newFilterList = dataOg.filter(row => {
                let match = false
                if (row.id_in.includes(search)) match = true
                else if (row.id_out && row.id_out.includes(search)) match = true
                else if (row.solicitor && row.solicitor.includes(search)) match = true
                else if (row.predial && row.predial.includes(search)) match = true
                return match
            })
            setData(newFilterList)
        }


    }

    // ***************************  DATA GETTER *********************** //


    // ***************************  JXS *********************** //
    const NEW_ITEM = <div className="rounded-lg border bg-card p-4 mb-3">
        <div>
            <h4 className="text-center font-semibold mb-3">GENERAR NUEVA CONCEPTO DE USO DEL SUELO</h4>
            <form onSubmit={create} id="new-norm-form">

                <div className='row'>
                    <div className='col-12'>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <span className="flex items-center gap-1"><Icon name="hashtag" size={16} /> <label>Radicación: </label></span>
                            </span>
                            <input type="text" className="form-control" defaultValue={""} id="id_in" required />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="btn btn btn-success my-1"><Icon name="folder-plus" size={16} /> CREAR </button>
                </div>
            </form>
        </div>
    </div>

    const SEARCH_ITEM = <div className="rounded-lg border bg-card p-4 mb-3">
        <div>
            <h4 className="text-center font-semibold mb-3">BUSCAR CONCEPTO</h4>
            <form onSubmit={search} id="app-form">

                <div className='row'>
                    <div className='col-12'>
                        <div className="input-group">
                            <span className="input-group-text bg-info text-white">
                                <span className="flex items-center gap-1"><Icon name="search" size={16} /> <label>Buscar</label></span>
                            </span>
                            <input type="text" className="form-control" defaultValue={""} id="search" />
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button className="btn btn btn-secondary my-1"><Icon name="search" size={16} /> BUSCAR </button>
                </div>
            </form>
        </div>
    </div>

    const columns = [
        {
            name: <label className="text-center">No. RADICACIÓN</label>,
            selector: row => row.id_in,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_in
        },
        {
            name: <label className="text-center">No. EXPEDICIÓN</label>,
            selector: row => row.id_out,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_out
        },
        {
            name: <label className="text-center">ACCIÓN</label>,
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <button type="button" title="Modificar Item" className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => {
                        setSelectedId(row.id);
                        setSelectedIdPublic(row.id_in);
                        setModal(!modal);
                    }}><Icon name="edit" size={16} /></button>
                {window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2 ?
                    <button type="button" title="Eliminar Item" className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button>
                    : null}
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY CONCEPTOS"
        striped="true"
        columns={columns}
        data={data}
        highlightOnHover
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[20, 50, 100]}
        className="data-table-component"
        noHeader
        dense
        progressPending={!load}
        progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}
    />

    return (
        <>

            <div className="Publish container">
                
                <div className="row my-4 d-flex justify-content-center">
                    <div className="col-lg-11 col-md-12">
                        <h1 className="text-center my-4">CONCEPTOS</h1>
                        <hr />
                    </div>

                    <div className="row">
                        <div className="col-md-6">{NEW_ITEM}</div>
                        <div className="col-md-6">{SEARCH_ITEM}</div>
                        {/* <div className="col-md-4"></div> */}
                    </div>

                    <h2 className="text-uppercase text-center pb-2">LISTADO DE CONCEPTOS</h2>

                    {TABLE}
                </div>
            </div>

            <Modal contentLabel="EXP CALC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between">
                    <h2 className="text-uppercase text-center">CONCEPTO USO DEL SUELO: {selectedIdPublic}</h2>
                    <button type="button" className="btn-close" onClick={() => setModal(!modal)} />
                </div>

                <hr />

                <ZONE_USE_COMPONENT
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    setrRfresh={setrRfresh}
                />



                <div className="text-end py-2">
                    <button type="button" className="btn btn-info btn-sm" onClick={() => setModal(!modal)}><Icon name="times-circle" size={16} /> Cerrar</button>
                </div>
            </Modal>
        </>
    );
}