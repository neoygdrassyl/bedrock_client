import { useEffect, useState } from 'react';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import { Link } from 'react-router-dom';
import DataTable from '@/components/data-table-bridge';
import Norms_Service from "../../../services/norm.service"
import NORM_GENERAL from './norm_geeral.component';
import NORM_PREDIOS from './norm_predio.component';
import NORM_NEIGHBORS from './norm_neighbors.component';
import NORM_PERFIL from './norm_perfil.component';
import NORM_RESUME from './norm_resume.component';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

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
export default function NORMS(props) {
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
        Norms_Service.getAll_norm()
            .then(response => {
                setData(response.data)
                setDataOg(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.error(e);
                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
            });
    }

    function delete_item(id) {
        swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                Norms_Service.delete_norm(id)
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

    function createNorm(event) {
        event.preventDefault();

        let formData = new FormData();
        let id_in = document.getElementById("id_in").value;
        formData.set('id_in', id_in);

        swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
        Norms_Service.create_norm(formData)
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

    function searchNorm(event) {
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
                if (row.id_out && row.id_out.includes(search)) match = true
                if (row.solicitor && row.solicitor.includes(search)) match = true
                return match
            })
            setData(newFilterList)
        }


    }

    // ***************************  DATA GETTER *********************** //


    // ***************************  JXS *********************** //
    const NEW_ITEM = <div className="rounded-lg border bg-card p-4 mb-3">
        <div>
            <h4 className="text-center font-semibold mb-3">GENERAR NUEVA NORMA URBANA</h4>
            <form onSubmit={createNorm} id="new-norm-form">

                <div className='row'>
                    <div className='col-12'>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground">
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
            <h4 className="text-center font-semibold mb-3">BUSCAR NORMA URBANA</h4>
            <form onSubmit={searchNorm} id="app-form">

                <div className='row'>
                    <div className='col-12'>
                        <div className="input-group">
                            <span className="input-group-text bg-primary text-primary-foreground">
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
            name: 'No. RADICACIÓN',
            selector: row => row.id_in,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_in
        },
        {
            name: 'No. EXPEDICIÓN',
            selector: row => row.id_out,
            sortable: true,
            filterable: true,
            center: true,
            cell: row => row.id_out
        },
        {
            name: 'ACCIÓN',
            button: true,
            center: true,
            minWidth: '80px',
            cell: row => <>
                <button type="button" title="Modificar Item" className="btn btn-secondary m-0 p-1 shadow-none" onClick={() => {
                        setSelectedId(row.id);
                        setSelectedIdPublic(row.id_in);
                        setModal(!modal);
                    }}><Icon name="edit" size={16} /></button>
                {window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 2?
                    <button type="button" title="Eliminar Item" className="btn btn-danger m-0 p-1 shadow-none" onClick={() => delete_item(row.id)}><Icon name="trash-alt" size={16} /></button>
                    : null}
            </>,
        },
    ]

    const TABLE = <DataTable
        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
        noDataComponent="NO HAY NORMAS"
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
                        <h1 className="text-center my-4">NORMAS URBANAS</h1>
                        <hr />
                    </div>

                    <div className="row">
                        <div className="col-md-6">{NEW_ITEM}</div>
                        <div className="col-md-6">{SEARCH_ITEM}</div>
                        {/* <div className="col-md-4"></div> */}
                    </div>

                    <h2 className="text-center pb-2">LISTADO DE NORMAS</h2>

                    {TABLE}
                </div>
            </div>

            <Modal contentLabel="EXP CALC"
                isOpen={modal}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between">
                    <h2 className="text-center">NORMA URBANA: {selectedIdPublic}</h2>
                    <button type="button" className="btn-close" onClick={() => setModal(!modal)} />
                </div>

                <hr />

                <NORM_GENERAL
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    setrRfresh={setrRfresh}
                />

                <NORM_PREDIOS
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    setrRfresh={setrRfresh}
                />

                <NORM_NEIGHBORS
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    id_in={selectedIdPublic}
                    setrRfresh={setrRfresh}
                />

                <NORM_PERFIL
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    setrRfresh={setrRfresh}
                />

                <NORM_RESUME
                    translation={translation} swaMsg={swaMsg} globals={globals}
                    id={selectedId}
                    id_in={selectedIdPublic}
                    refresh={refresh}
                    setrRfresh={setrRfresh}
                />


                <div className="text-end py-2">
                    <button type="button" className="btn btn-info btn-sm" onClick={() => setModal(!modal)}><Icon name="times-circle" size={16} /> Cerrar</button>
                </div>
            </Modal>
        </>
    );
}