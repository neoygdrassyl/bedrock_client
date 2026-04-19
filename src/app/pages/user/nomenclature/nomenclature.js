import { useState, useEffect, useCallback } from 'react';

import { Link } from "react-router-dom";
import DataTable from '@/components/data-table-bridge';
import { LegacyModal as Modal } from '@/components/legacy-modal';

// SERVICES
import Nomenclature_Service from '../../../services/nomeclature.service'
import { dateParser } from '../../../components/customClasses/typeParse'

// COMPONENT
import NOMENCLATURE_NEW from './new_nomenclature';
import dayjs from 'dayjs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { swalClose, swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function NOMENCLATURE({ translation, swaMsg, globals, breadCrums }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [modal, setModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [list, setList] = useState([]);
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    const asignList = useCallback((_LIST) => {
        setList(_LIST);
        setIsLoaded(true);
    }, []);

    const retrievePublish = useCallback(() => {
        Nomenclature_Service.getAll()
            .then(response => {
                asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }, [asignList]);

    useEffect(() => {
        retrievePublish();
    }, [retrievePublish]);

    const retrieveSearch = useCallback((field, string) => {
        Nomenclature_Service.getSearch(field, string)
            .then(response => {
                asignList(response.data);
                swalClose();
            })
            .catch(e => {
                console.log(e);
            });
    }, [asignList]);

    const refreshItem = useCallback((id) => {
        Nomenclature_Service.get(id).then(response => {
            let item = response.data;
            setCurrentItem(item);
        });
    }, []);

    const refreshList = useCallback((id) => {
        retrievePublish();
        if (id) refreshItem(id);
    }, [retrievePublish, refreshItem]);

    const toggle = useCallback((item) => {
        setModal(prev => !prev);
        if (item) {
            setCurrentId(item.id_public);
            setCurrentItem(item);
        } else {
            setCurrentId(null);
            setCurrentItem(null);
        }
    }, []);

    const toggle_new = useCallback(() => {
        setNewModal(prev => !prev);
    }, []);

        const columns = [
            {
                name: 'No. RADICACIÓN',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.id_public}</span>
            },
            {
                name: 'TIPO',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                cell: row => <span className="text-sm">{row.type}</span>
            },
            {
                name: 'FECHA RADICACIÓN',
                selector: row => row.date_start,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{dateParser(row.date_start)}</span>
            },
            {
                name: 'FECHA EXPEDICIÓN',
                selector: row => row.date_end,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm">{dateParser(row.date_end)}</span>
            },
            {
                name: 'DOCUMENTO',
                selector: row => row.nome_doc,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <label>{row.nome_doc
                    ? <Icon name="check" size={24} className="text-success" />
                    : <Icon name="times" size={24} className="text-danger" />}</label>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '100px',
                cell: row => <>
                        <button title="Ver detalles" onClick={() => toggle(row)} className="btn btn-sm btn-info m-0 p-2 shadow-none">
                            <Icon name="folder-open" size={16} /></button>

                        <button title="Eliminar" onClick={() => delete_nomenclature(row.id)} className="btn btn-sm btn-danger  m-0 p-2 shadow-none">
                            <Icon name="trash-alt" size={16} /></button>
                </>,
            },
        ]

        // CUSTOM STYLES FOR THE MODAL
        const customStyles = {};

        // CREATES A NEW LICENCE
        let delete_nomenclature = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    Nomenclature_Service.delete(id)
                        .then(response => {
                            if (response.data === 'OK') {
                                swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                                refreshList();
                            } else {
                                swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                            }
                        })
                        .catch(e => {
                            console.log(e);
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                        });
                }
            });
        };

        let search = () => {
            let field = document.getElementById("nomen_search_0").value;
            let string = document.getElementById("nomen_search_1").value;
            if (string) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                retrieveSearch(field, string);
            } else {
                refreshList();
                // list_search and isLoadedSearch state cleared by refreshList
            }
        };

        let get_cvs = (e) => {
            e.preventDefault();
            let date_a = document.getElementById("nomenclature_cvs_gen_1").value;
            let date_b = document.getElementById("nomenclature_cvs_gen_2").value;
            var date_start = date_a;
            var date_end = date_b;
            if (dayjs(date_a).diff(date_b) >= 0) {
                date_start = date_b;
                date_end = date_a;
            }
            setDateStart(date_start);
            setDateEnd(date_end);

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            Nomenclature_Service.getExcellData(date_start, date_end)
                .then(response => {
                    if (response.data.length) {
                        gen_cvs(response.data)
                    } else {
                        swalError({ title: "NO SE ENCONTRÓ INFORMACIÓN", text: `Para las fechas ${date_start} y ${date_end} no se encontró información, verifique las fechas de búsqueda.`, icon: 'warning' });
                    }
                })
                .catch(e => {
                    console.log(e);
                    swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text, icon: 'warning' });
                });
        }

        let gen_cvs = (data) => {
            let _data = data;
            const rows = [];

            const headRows = [
                "Nr PREDIAL",
                'Nr BOLETÍN',
                'DIRECCIÓN',
                'Nr DE NOMENCLATURAS A EXPEDIR',
                'FECHA DE RADICACIÓN',
                'FECHA DE EXPEDICIÓN',
                'ACCESO',
                'DESTINO',
                'USO',
            ];

            rows.push(headRows);
            for (var i = 0; i < _data.length; i++) {
                let row = [];
                row.push(_data[i].predial);
                row.push(_data[i].id_public);
                row.push(_data[i].address);
                row.push(_data[i].number);
                row.push(_data[i].date_start);
                row.push(_data[i].date_end);
                row.push(_data[i].details ? _data[i].details.replace(/[\r\n]+ */g, ' ') : ' ');
                row.push('Servicios Públicos y Notariales');
                row.push(_data[i].use);

                rows.push(row)
            }

            let csvContent = ""
                + rows.map(e => e.join(";")).join("\n");

            var csvData = new Blob([csvContent], { type: 'text/csv' }); //new way
            var csvUrl = URL.createObjectURL(csvData);

            var link = document.createElement("a");
            link.setAttribute("href", csvUrl);
            link.setAttribute("download", `REPORTE DE NOMENCLATURAS ${date_start} - ${date_end}.csv`);
            document.body.appendChild(link); // Required for FF
            swalClose()
            link.click();
        }
        return (
            <div className="Nomenclature container">
                

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h1 className="text-center my-4">GESTIÓN DE NOMENCLATURAS</h1>
                        <hr />

                        <h2 className="text-center pb-2">ACCIONES</h2>
                        <div className="row">
                            <div className="col-4">
                                <div className="text-center py-4 mt-3">
                                    <button className="btn btn-success" onClick={() => toggle_new()} styes={{ zIndex: -1 }} l><Icon name="plus-circle" size={16} /> CREAR NOMENCLATURA </button>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="rounded-lg border bg-card p-4 mb-3">
                                    <div>
                                        <h4 className="text-center font-semibold mb-3">CONSULTAR NOMENCLATURA</h4>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="info-circle" size={16} />
                                            </span>
                                            <select className="form-select" id="nomen_search_0" required>
                                                <option value="1">Número de Radicado</option>
                                                <option value="2">Número de Matricula Inmobiliaria</option>
                                                <option value="3">Número de Identificación Predial/Catastral</option>
                                                <option value="4">Dirección Actual</option>
                                                <option value="5">C.C o NIT</option>
                                                <option value="6">Nombre Solicitante</option>
                                            </select>
                                        </div>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-primary text-primary-foreground">
                                                <Icon name="comment-dots" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="nomen_search_1" placeholder="Buscar..." />
                                        </div>
                                        <div className="text-center py-2">
                                            <button type="button" className="btn btn-secondary shadow-none" onClick={() => search()}><Icon name="search-plus" size={16} /> CONSULTAR </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="rounded-lg border bg-card p-4 mb-3">
                                    <div>
                                        <h4 className="text-center font-semibold mb-3">GENERAR EXCEL</h4>
                                        <form onSubmit={get_cvs} id="fun_form_nomenclature_cvs_gen">
                                            <div className="input-group mb-3">
                                                <span className="input-group-text bg-primary text-primary-foreground">
                                                    <Icon name="calendar-alt" size={16} />
                                                </span>
                                                <input type="date" className="form-control" id="nomenclature_cvs_gen_1" required
                                                    defaultValue={dayjs().subtract(8, 'days').format('YYYY-MM-DD')} />
                                            </div>
                                            <div className="input-group mb-3">
                                                <span className="input-group-text bg-primary text-primary-foreground">
                                                    <Icon name="calendar-alt" size={16} />
                                                </span>
                                                <input type="date" className="form-control" id="nomenclature_cvs_gen_2" required
                                                    defaultValue={dayjs().format('YYYY-MM-DD')} />
                                            </div>
                                            <div className="text-center py-2">
                                                <button className="btn btn-success"><Icon name="file-excel" size={16} /> DESCARGAR </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h2 className="text-center pb-2">Lista de Nomenclaturas</h2>
                        <div className="text-center">
                            {isLoaded ? (
                                <DataTable
                                    paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                    noDataComponent={<h4 className="fw-bold">NO HAY INFORMACIÓN</h4>}
                                    striped="true"
                                    columns={columns}
                                    data={list}
                                    highlightOnHover
                                    pagination
                                    paginationPerPage={20}
                                    paginationRowsPerPageOptions={[20, 50, 100]}
                                    className="data-table-component"
                                    noHeader
                                    defaultSortFieldId={1}
                                    defaultSortAsc={false}
                            
                                />
                            ) : (
                                <div className="text-center">
                                    <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                                </div>)}
                        </div>
                    </div>
                </div>

                <Modal contentLabel="VIEW/EDIT"
                    isOpen={modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="edit" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Actualizar nomenclatura — {currentId}</h2>
                        </div>
                        <button type="button" onClick={toggle} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                    <NOMENCLATURE_NEW
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={refreshList}
                        closeModal={toggle_new}
                        currentItem={currentItem} />

                    <div className="text-end py-4 mt-3">
                        <Button variant="outline" size="sm" onClick={() => toggle()}><Icon name="X" size={14} /> Cerrar</Button>
                    </div>
                </Modal>

                <Modal contentLabel="NEW VIEW"
                    isOpen={newModal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="flex items-center justify-between py-2.5 mb-3 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="plus-circle" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Nueva nomenclatura</h2>
                        </div>
                        <button type="button" onClick={() => toggle_new()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                    <NOMENCLATURE_NEW
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={refreshList}
                        closeModal={toggle_new} />
                    <div className="text-end py-4 mt-3">
                        <Button variant="outline" size="sm" onClick={() => toggle_new()}><Icon name="X" size={14} /> Cerrar</Button>
                    </div>
                </Modal>

            </div >
        );
}

export default NOMENCLATURE;