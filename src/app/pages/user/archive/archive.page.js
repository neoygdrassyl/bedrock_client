import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import { useEffect, useState } from 'react';
const TagGroup = ({ children }) => <span className="d-flex flex-wrap gap-1">{children}</span>;
const Tag = ({ color, children }) => (
  <span className="badge" style={{ backgroundColor: color === 'blue' ? 'var(--dvl-info)' : 'var(--dvl-primary-500)', fontSize: 'var(--dvl-text-xs)' }}>
    {children}
  </span>
);

import { LegacyModal as Modal } from '@/components/legacy-modal';

import SERVICE_ARCHIVE from '../../../services/archive.service';
import DataTable from 'react-data-table-component';
import ARCHIVE_MANAGE from './archive_manage.component';

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ARCHIVE_X_FUN from './archive_x_fun.component';
import { getJSON, getJSONFull, regexChecker_isPh } from '../../../components/customClasses/typeParse';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import { nomens } from '../../../components/jsons/vars';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
const MySwal = withReactContent(Swal);
const customStylesForModal = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '10%',
        left: '28%',
        right: '28%',
        bottom: '10%',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};
const customStylesForModal2 = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 2,
    },
    content: {
        position: 'absolute',
        top: '10%',
        left: '28%',
        right: '28%',
        bottom: '%',
        border: '1px solid #ccc',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        borderRadius: '4px',
        outline: 'none',
        padding: '20px',
        marginRight: 'auto',

    }
};
const pptsLink = "https://curaduria1bucaramanga.com/public_docs/OTHERS/ARCHIVISTICA.pptx"
export default function ARCHIVE(props) {
    const { translation, swaMsg, globals, breadCrums } = props;
    var [modal, setModal] = useState(false);
    var [modale, setModale] = useState(false);
    var [modal_d, setModal_d] = useState(false);
    var [modalAdd, setModalAdd] = useState(false);
    var [currentItem, setItem] = useState(null);

    var [LIST_A, setListA] = useState([]);
    var [LIST_B, setListB] = useState([]);
    var [anex, setAnex] = useState({});

    var [load, setLoad] = useState(0);

    useEffect(() => {
        if (load == 0) loadLists();
    }, [load]);


    // ***************************  DATA CONVERTER *********************** //
    function filter_list() {
        let index = document.getElementById("search_param").value;
        let value = document.getElementById("search_text").value;

        if (!value) return setListA(LIST_B);

        var newList = LIST_B.filter(it => {
            if (index == 'box') return it[index] == value

            let _searchArray;

            if (index == 'id_public') _searchArray = it.process_x_archives.map(x => {
                let json = getJSONFull(x.json);
                return json.id_public;
            });
            if (index == 'exp_id') _searchArray = it.process_x_archives.map(x => {
                let json = getJSONFull(x.json);
                return json.exp_id;
            });
            if (index == 'date') _searchArray = it.process_x_archives.map(x => {
                let json = getJSONFull(x.json);
                return json.clocks_end;
            });
            return _searchArray.some(i => i.includes(value))
        });
        setListA(newList)
    }

    // ***************************  JXS *********************** //
    let _HEADER_COMPONENET = () => {
        return <>
            <div>
                <h1 className="text-xl font-bold text-foreground">Archivo</h1>
                <p className="text-sm text-muted-foreground mt-1">Gestión de cajas y expedientes archivados</p>
            </div>
        </>
    }

    let _BTNS_COMPONENT = () => {
        return <>
            <div className="flex flex-wrap items-center gap-3">
                <div>
                    {window.user.roleId != 1 && window.user.roleId != 3 ? '' : <Button onClick={() => setModal(!modal)}><Icon name="FolderPlus" size={16} /> Nueva Caja</Button>}
                </div>
                <div className="flex-1">
                    <div className="input-group">
                        <select className="form-select col-2" id="search_param" style={{ height: '35px' }}>
                            <option value="box">Nr Caja</option>
                            <option value="id_public">Nr Radicado</option>
                            <option value="exp_id">Nr Resolución</option>
                            <option value="date">Fecha expedición</option>
                        </select>
                        <input type="text" className="form-control col" id="search_text" placeholder="Buscar..."></input>
                        <Button variant="secondary" onClick={() => filter_list()} onKeyPress={(e) => e.key === 'Enter' ? filter_list() : console.log(e)}><Icon name="Search" size={16} /> Buscar</Button>
                    </div>
                </div>
                <div>
                    <Button variant="outline" asChild><a href={pptsLink} target="_blank"><Icon name="FileText" size={16} /> Información</a></Button>
                </div>
            </div>
        </>
    }

    // ***************************  DATATABLES *********************** //
    const columns_a = [
        {
            name: <label className="text-center">Estante</label>,
            selector: row => row.column,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.column)}</h6>

        },
        {
            name: <label className="text-center">Entrepaño</label>,
            selector: row => row.row,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.row)}</h6>

        },
        {
            name: <label className="text-center">Caja N°</label>,
            selector: row => row.box,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.box)}</h6>

        },
        {
            name: <label className="text-center">Contenido</label>,
            center: true,
            cell: row => <TagGroup>
                {row.process_x_archives.map(it => {
                    let json = getJSONFull(it.json);
                    let fun1 = {
                        m_lic: json["fun_1s.m_lic"],
                        m_sub: json["fun_1s.m_sub"],
                        m_urb: json["fun_1s.m_urb"],
                        tipo: json["fun_1s.tipo"],
                        tramite: json["fun_1s.tramite"],
                    }
                    let isPH = regexChecker_isPh(fun1, true);
                    let id_public = json.id_public;
                    let color = 'blue'; 
                    if(!id_public.includes(nomens)) color = 'violet'; 
                    if(id_public.includes(nomens)) id_public =id_public.substr(-7);
                    if(isPH) id_public = json.exp_id || json.id_public;
                    return <Tag color={color}>{id_public}</Tag>
                })}
            </TagGroup>
        },
        {
            name: <label className="text-center">ACCIÓN</label>,
            button: true,
            center: true,
            omit: window.user.roleId != 1 && window.user.roleId != 3,
            maxWidth: '120px',
            cell: row => <>
                <button type="button" title="Modificar Items en caja" className="btn btn-primary btn-sm px-1 py-1" onClick={() => { setItem(row); setModalAdd(!modalAdd) }}><Icon name="file-import" size={16} /></button>
                <button type="button" title="Modificar caja" className="btn btn-secondary btn-sm px-1 py-1" onClick={() => { setItem(row); setModale(!modal) }}><Icon name="edit" size={16} /></button>
                <button type="button" title="Eliminar caja" className="btn btn-danger btn-sm px-1 py-1" onClick={() => { delete_arch(row.id); }}><Icon name="trash-alt" size={16} /></button>
            </>,
        },
    ]

    const ExpandedComponent = ({ data }) => {
        let _x = data.process_x_archives;
        return <>
            {[..._x].sort((p, n) => Number(p.folder) - Number(n.folder)).map(it => {
                let json = getJSONFull(it.json);
                return <div className='row border'>
                    <div className='col'>
                        <Icon name="hashtag" size={16} /> <label className='fw-bold'>{json.id_public}</label>
                    </div>
                    <div className='col-2'>
                        <Icon name="file-signature" size={16} /> Resolución <label className='fw-bold'>{json.exp_id}</label>
                    </div>
                    <div className='col-2'>
                        <Icon name="folder" size={16} /> Carpeta: <label className='fw-bold'>{it.folder}</label>
                    </div>
                    <div className='col-2'>
                        <Icon name="file-alt" size={16} /> Folios: <label className='fw-bold'>{it.pages}</label>
                    </div>
                    <div className='col'>
                        <h5><Icon name="calendar-alt" size={16} /> Fechas: <label className='fw-bold'>{(json.clocks_start).slice(-8)} - {(json.clocks_end).slice(-8)}</label></h5>
                    </div>
                    <div className='col-1'>
                        <button type="button" title="Ver documentos item" className="btn btn-info btn-sm px-1 py-1" onClick={() => { setAnex(json); setModal_d(!modal_d) }}><Icon name="folder-open" size={16} /></button>
                    </div>
                </div>
            })}

        </>
    };

    let _ARCHIVE_LIST_COMPONENT = () => {
        return <DataTable
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[20, 50, 100]}
            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}

            noDataComponent="NO HAY CAJAS"
            striped="true"
            columns={columns_a}
            data={LIST_A}
            highlightOnHover
            dense
            title={<>LISTADO DE CAJAS  <Icon name="archive" size={16} /></>}

            progressPending={!load}
            progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

            expandableRows
            expandableRowsComponent={ExpandedComponent}

            defaultSortFieldId={1}
        />
    }

    // ***************************  APIS *********************** //
    function loadLists() {
        SERVICE_ARCHIVE.getAll()
            .then(response => {
                setListA(response.data);
                setListB(response.data);
                setLoad(1);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function delete_arch(id) {
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
                SERVICE_ARCHIVE.delete(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            MySwal.fire({
                                title: swaMsg.publish_success_title,
                                text: swaMsg.publish_success_text,
                                footer: swaMsg.text_footer,
                                icon: 'success',
                                confirmButtonText: swaMsg.text_btn,
                            });
                            loadLists();
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
        });
    }
    return (
        <div className="space-y-6">
            {_HEADER_COMPONENET()}
            <div>
                {_BTNS_COMPONENT()}
            </div>
            <div>
                {_GLOBAL_ID == 'cb1' ? <h5 className='fw-bold'>NOTA: A partir del 2022, los OA proceden nombrarse VR</h5> : ''}
                {_ARCHIVE_LIST_COMPONENT()}
            </div>


            <Modal contentLabel="NEW BOX"
                isOpen={modal}
                style={customStylesForModal2}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between ">
                    <div className='row'>
                        <div className="input-group">
                            <label className=''><Icon name="folder-open" size={16} /> NUEVA CAJA DE ARCHIVO</label>
                        </div>
                    </div>


                    <button type="button" className="btn-close" onClick={() => setModal(!modal)} />
                </div>
                <hr className='bg-success' style={{ height: '4px' }} />

                <ARCHIVE_MANAGE
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={null}
                    CLOSE={() => { setModal(!modal); loadLists() }}
                />

                <hr className='bg-success' style={{ height: '4px' }} />

                <div className="text-end py-2">
                    <Button variant="secondary" size="sm" onClick={() => setModal(!modal)}><Icon name="XCircle" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="EDIT BOX"
                isOpen={modale}
                style={customStylesForModal2}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between">
                    <div className='row'>
                        <div className="input-group">
                            <label className=''><Icon name="folder-open" size={16} /> EDITAR CAJA: {currentItem ? currentItem.box : ''}</label>
                        </div>
                    </div>


                    <button type="button" className="btn-close" onClick={() => setModale(!modale)} />
                </div>
                <hr className='bg-secondary' style={{ height: '4px' }} />

                <ARCHIVE_MANAGE
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem}
                    CLOSE={() => { setModale(!modale); loadLists() }}
                />

                <hr className='bg-secondary' style={{ height: '4px' }} />
                <div className="text-end py-2">
                    <Button variant="secondary" size="sm" onClick={() => setModale(!modale)}><Icon name="XCircle" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="ADD TO BOX"
                isOpen={modalAdd}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-2 d-flex justify-content-between ">
                    <div className='row'>
                        <div className="input-group">
                            <label className=''><Icon name="archive" size={16} /> MODIFICAR ITEMS DE CAJA: {currentItem ? currentItem.box : ''}</label>
                        </div>
                    </div>


                    <button type="button" className="btn-close" onClick={() => setModalAdd(!modalAdd)} />
                </div>
                <hr className='bg-primary' style={{ height: '4px' }} />


                <ARCHIVE_X_FUN
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem}
                    UPDATE={() => { loadLists() }}
                />

                <hr className='bg-primary' style={{ height: '4px' }} />

                <div className="text-end py-2">
                    <Button variant="secondary" size="sm" onClick={() => setModalAdd(!modalAdd)}><Icon name="XCircle" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="FUN DOC CONTROL"
                isOpen={modal_d}
                style={customStylesForModal}
                ariaHideApp={false}
            >
                <div className="my-4 d-flex justify-content-between">
                    <label><Icon name="archive" size={16} /> VISTA DOCUMENTAL - No. Radicación :  {anex.id_public} </label>
                    <button type="button" className="btn-close" onClick={() => setModal_d(!modal_d)} />
                </div>
                <hr className='bg-info' style={{ height: '4px' }} />

                <FUN_6_VIEW
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={anex}
                    currentId={anex.id}
                    currentVersion={anex.version}
                    title={'Documentos giditalizados'}
                    readOnly
                />
                <hr className='bg-info' style={{ height: '4px' }} />
                <div className="text-end">
                    <Button variant="secondary" size="sm" onClick={() => setModal_d(!modal_d)}><Icon name="XCircle" size={14} /> Cerrar</Button>
                </div>
            </Modal>
        </div>
    );
}
