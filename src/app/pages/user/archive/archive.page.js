import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import { useEffect, useState } from 'react';
const TagGroup = ({ children }) => <span className="flex flex-wrap gap-1">{children}</span>;
const Tag = ({ color, children }) => (
  <Badge variant={color === 'blue' ? 'secondary' : 'default'} className="text-[0.6875rem]">
    {children}
  </Badge>
);

import { LegacyModal as Modal } from '@/components/legacy-modal';

import SERVICE_ARCHIVE from '../../../services/archive.service';
import DataTable from '@/components/data-table-bridge';
import ARCHIVE_MANAGE from './archive_manage.component';

import ARCHIVE_X_FUN from './archive_x_fun.component';
import { getJSON, getJSONFull, regexChecker_isPh } from '../../../components/customClasses/typeParse';
import FUN_6_VIEW from '../fun_forms/fun_6.view';
import { nomens } from '../../../components/jsons/vars';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
const customStylesForModal = {};
const customStylesForModal2 = {};
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
            name: 'Estante',
            selector: row => row.column,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.column)}</h6>

        },
        {
            name: 'Entrepaño',
            selector: row => row.row,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.row)}</h6>

        },
        {
            name: 'Caja N°',
            selector: row => row.box,
            sortable: true,
            filterable: true,
            center: true,
            maxWidth: '80px',
            cell: row => <h6 className='fw-normal'>{(row.box)}</h6>

        },
        {
            name: 'Contenido',
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
                    return <Tag key={it.id || `${id_public}-${it.folder || '0'}`} color={color}>{id_public}</Tag>
                })}
            </TagGroup>
        },
        {
            name: 'Acción',
            button: true,
            center: true,
            omit: window.user.roleId != 1 && window.user.roleId != 3,
            maxWidth: '120px',
            cell: row => <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Modificar Items" onClick={() => { setItem(row); setModalAdd(!modalAdd) }}>
                    <Icon name="FileInput" size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Modificar caja" onClick={() => { setItem(row); setModale(!modal) }}>
                    <Icon name="Pencil" size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" title="Eliminar caja" onClick={() => { delete_arch(row.id); }}>
                    <Icon name="Trash2" size={14} />
                </Button>
            </div>,
        },
    ]

    const ExpandedComponent = ({ data }) => {
        let _x = data.process_x_archives;
        return <>
            {[..._x].sort((p, n) => Number(p.folder) - Number(n.folder)).map(it => {
                let json = getJSONFull(it.json);
                return <div key={it.id} className='grid grid-cols-12 gap-2 items-center py-1.5 px-2 border-b border-border/40 text-sm'>
                    <div className='col-span-3'>
                        <Icon name="Hash" size={13} /> <span className='font-semibold'>{json.id_public}</span>
                    </div>
                    <div className='col-span-2'>
                        <Icon name="FileSignature" size={13} /> Res. <span className='font-semibold'>{json.exp_id}</span>
                    </div>
                    <div className='col-span-2'>
                        <Icon name="Folder" size={13} /> Carpeta: <span className='font-semibold'>{it.folder}</span>
                    </div>
                    <div className='col-span-2'>
                        <Icon name="FileText" size={13} /> Folios: <span className='font-semibold'>{it.pages}</span>
                    </div>
                    <div className='col-span-2 text-xs tabular-nums'>
                        <Icon name="Calendar" size={13} /> {(json.clocks_start).slice(-8)} — {(json.clocks_end).slice(-8)}
                    </div>
                    <div className='col-span-1 text-right'>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Ver documentos" onClick={() => { setAnex(json); setModal_d(!modal_d) }}>
                            <Icon name="FolderOpen" size={14} />
                        </Button>
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
        swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
            if (SweetAlertResult.isConfirmed) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                SERVICE_ARCHIVE.delete(id)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            loadLists();
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
                ariaHideApp={false}
            >
                <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                            <Icon name="FolderPlus" size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight">Nueva Caja de Archivo</h2>
                    </div>
                    <button type="button" onClick={() => setModal(!modal)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                        <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <ARCHIVE_MANAGE
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={null}
                    CLOSE={() => { setModal(!modal); loadLists() }}
                />

                <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                    <Button variant="outline" size="sm" onClick={() => setModal(!modal)}><Icon name="X" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="EDIT BOX"
                isOpen={modale}
                ariaHideApp={false}
            >
                <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                            <Icon name="FolderOpen" size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight">Editar Caja: {currentItem ? currentItem.box : ''}</h2>
                    </div>
                    <button type="button" onClick={() => setModale(!modale)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                        <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <ARCHIVE_MANAGE
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem}
                    CLOSE={() => { setModale(!modale); loadLists() }}
                />

                <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                    <Button variant="outline" size="sm" onClick={() => setModale(!modale)}><Icon name="X" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="ADD TO BOX"
                isOpen={modalAdd}
                ariaHideApp={false}
            >
                <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                            <Icon name="Archive" size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight">Modificar Items: {currentItem ? currentItem.box : ''}</h2>
                    </div>
                    <button type="button" onClick={() => setModalAdd(!modalAdd)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                        <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                </div>

                <ARCHIVE_X_FUN
                    translation={translation}
                    swaMsg={swaMsg}
                    globals={globals}
                    currentItem={currentItem}
                    UPDATE={() => { loadLists() }}
                />

                <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                    <Button variant="outline" size="sm" onClick={() => setModalAdd(!modalAdd)}><Icon name="X" size={14} /> Cerrar</Button>
                </div>
            </Modal>

            <Modal contentLabel="FUN DOC CONTROL"
                isOpen={modal_d}
                ariaHideApp={false}
            >
                <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                            <Icon name="FileText" size={14} className="text-primary" />
                        </div>
                        <h2 className="text-sm font-semibold tracking-tight">Vista Documental — Rad. {anex.id_public}</h2>
                    </div>
                    <button type="button" onClick={() => setModal_d(!modal_d)} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                        <Icon name="X" size={16} className="text-muted-foreground" />
                    </button>
                </div>

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
                <div className="flex justify-end py-3 mt-3 border-t border-border/60">
                    <Button variant="outline" size="sm" onClick={() => setModal_d(!modal_d)}><Icon name="X" size={14} /> Cerrar</Button>
                </div>
            </Modal>
        </div>
    );
}
