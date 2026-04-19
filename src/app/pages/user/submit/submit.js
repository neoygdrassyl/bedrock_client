import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubmitService from '../../../services/submit.service';
import DataTable from '@/components/data-table-bridge';
import { dateParser } from '../../../components/customClasses/typeParse';
import SUBTMIT_MANAGE from './submit_manage'
import { LegacyModal as Modal } from '@/components/legacy-modal';
import dayjs from 'dayjs';
import ListsCodes from '../../../components/jsons/fun6DocsList.json'
import { Icon } from '@/components/icon';
import { swalClose, swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';

function SUBMIT({ translation, swaMsg, globals, breadCrums }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentId, setCurrentId] = useState(null);
    const [currentIdPublic, setCurrentIdPublic] = useState(null);
    const [modal, setModal] = useState(false);
    const [newModal, setNewModal] = useState(false);
    const [list, setList] = useState([]);

    useEffect(() => {
        retrievePublish();
    }, []);

    function retrievePublish() {
        SubmitService.getAll()
            .then(response => {
                asignList(response.data);
            })
            .catch(e => {
                console.log(e);
            });
    }

    function refreshList(id) {
        retrievePublish();
        if (id) refreshItem(id);
    }

    function refreshItem(id) {
        SubmitService.get(id).then(response => {
            let item = response.data;
            setCurrentItem(item);
            setCurrentId(item.id);
        });
    }

    function retrieveSearch(field, string) {
        SubmitService.getSearch(field, string)
            .then(response => {
                asignList(response.data);
                swalClose();
            })
            .catch(e => {
                console.log(e);
            });
    }

    function asignList(_LIST) {
        setList(_LIST);
        setIsLoaded(true);
    }

    //  MODAL CONTROLS
    function toggle(item) {
        setModal(prev => !prev);
        if (item) {
            setCurrentItem(item);
            setCurrentId(item.id);
            setCurrentIdPublic(item.id_public);
        } else {
            setCurrentId(null);
            setCurrentItem(null);
            setCurrentIdPublic(null);
        }
    }

    function toggle_new() {
        setNewModal(prev => !prev);
    }

    const columns = [
            {
                name: 'Nr. Radicación',
                selector: row => row.id_public,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm font-medium font-mono">{row.id_public}</span>
            },
            {
                name: 'Nr. Licencia / Solicitud',
                selector: row => row.id_related,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-sm font-medium font-mono">{row.id_related}</span>
            },
            {
                name: 'Tipo',
                selector: row => row.type,
                sortable: true,
                filterable: true,
                minWidth: '300px',
                center: true,
                cell: row => <span className="text-sm">{row.type}</span>
            },
            {
                name: 'Fecha Radicación',
                selector: row => row.date + ' - ' + row.time,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <span className="text-xs font-mono tabular-nums">{row.date} - {row.time}</span>
            },
            {
                name: 'Documento',
                selector: row => row.sub_doc,
                sortable: true,
                filterable: true,
                center: true,
                minWidth: '60px',
                cell: row => <label>{row.sub_doc
                    ? <Icon name="check" size={24} className="text-success" />
                    : <Icon name="times" size={24} className="text-danger" />}</label>
            },
            {
                name: 'ACCIÓN',
                button: true,
                minWidth: '100px',
                cell: row => <>
                    
                        <button onClick={() => toggle(row)} className="btn btn-sm btn-info m-0 p-2 shadow-none">
                            <Icon name="folder-open" size={16} /></button>
                    
                        <button onClick={() => delete_submit(row.id)} className="btn btn-sm btn-danger  m-0 p-2 shadow-none">
                            <Icon name="trash-alt" size={16} /></button>                </>,
            },
        ]

        // CUSTOM STYLES FOR THE MODAL
        const customStyles = {
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
                top: '40px',
                left: '5%',
                right: '5%',
                bottom: '40px',
                border: '1px solid #ccc',
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
                borderRadius: '4px',
                outline: 'none',
                padding: '20px',
                marginRight: 'auto',
            }
        };
        // CREATES A NEW LICENCE
        let delete_submit = (id) => {
            swalConfirm({ title: "ELIMINAR ESTE ITEM", text: "¿Esta seguro de eliminar de forma permanente este item?", icon: 'question', confirmButtonText: "ELIMINAR" }).then(SweetAlertResult => {
                if (SweetAlertResult.isConfirmed) {
                    swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                    SubmitService.delete(id)
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
            let field = document.getElementById("submit_search_0").value;
            let string = document.getElementById("submit_search_1").value;
            if (string) {
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                retrieveSearch(field, string);
            } else {
                refreshList();
            }
        };

        let generateCVS = () => {
            let _data = list;
            let limit_1 = document.getElementById('csv_limit_1').value;
            let limit_2 = document.getElementById('csv_limit_2').value;
            let state = [
                'OTRO',
                'RADICACIÓN SOLICITUD',
                'ASESORÍA TÉCNICA',
                'CORRECCIONES SOLICITUD',
                'TRAMITE',
                'PQRS',
                'FOTO VALLA',
                'SOLICITUD LICENCIAS URBANISTICA',
                'SOLICITUD MODIFICACION LICENCIA VIGENTE',
                'SOLICITUD DE CONCEPTO DE USO',
                'SOLICITUD DE NORMA URBANA',
                'SOLICITUD OTRAS ACTUACIONES',
                'SOLICITUD PRORROGA',
                'SOLICITUD REVALIDACION',
                'PAGO EXPENSAS Y/O IMPUESTOS / OTROS',
                'DOCUMENTOS PARA RLDF',
                'DOCUMENTOS ACTAS OBSERVACIONES',
                'DOCUMENTOS TRAMITE',
            ]
            const rows = [];

            const headRows = [
                "No. Radicación",
                'No. Solicitud',
                'Tipo',
                'Tipo de Radicación',
                'Fecha y hora de ingreso',
                'Propietario',
                'Persona que entrega',
                'Número de Folios',
                'Descripción',
            ];

            rows.push(headRows);
            _data.map(d => {
                let id = d.id_public;
                let con = limit_1 <= id && id <= limit_2;
                let folios = 0
                let docs = [];
                if (d.sub_lists && d.sub_lists.length) {
                    for (let i = 0; i < d.sub_lists.length; i++) {
                        const element = d.sub_lists[i].list_pages;
                        var pages = element ? element.split(",") : [];
                        pages.map(p => folios += Number(p));

                        const doc_codes = d.sub_lists[i].list_code;
                        var codes = doc_codes ? doc_codes.split(",") : [];
                        codes.map(c => {
                            if (ListsCodes[c]) docs.push(ListsCodes[c])
                        });


                    }
                }

                if (con) {
                    let row = [];
                    row.push(d.id_public);
                    row.push(d.id_related);
                    row.push(d.type);
                    row.push(state[d.list_type] ?? '');
                    row.push(`${d.date} - ${d.time ?? ''}`);
                    row.push(d.owner);
                    row.push(d.name_retriever);
                    row.push(folios > 0 ? folios : "");
                    row.push(docs.join(", "));
                    rows.push(row)
                }
            })

            let csvContent = "data:text/csv;charset=utf-8,"
                + rows.map(e => e.join(";")).join("\n");

            var encodedUri = encodeURI(csvContent);
            const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

            var link = document.createElement("a");
            link.setAttribute("href", fixedEncodedURI);
            link.setAttribute("download", `REPORTE_VENTANILLA_UNICA_${limit_1}_${limit_2}.csv`);
            document.body.appendChild(link); // Required for FF

            link.click();
        }
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Ventanilla Única</h1>
                    <p className="text-sm text-muted-foreground mt-1">Gestión de entradas y radicados</p>
                </div>

                <div className="row d-flex justify-content-center">
                    <div className="col-10">
                        <h2 className="text-uppercase text-center pb-2">ACCIONES</h2>

                        <div className="row">
                            <div className="col-4">
                                <div className="text-center py-4 mt-3">
                                    <button className="btn btn-success" onClick={() => toggle_new()} styes={{ zIndex: -1 }} l><Icon name="plus-circle" size={16} /> NUEVA ENTRADA </button>
                                </div>
                            </div>
                            <div className="col-4">
                                <Card className="mb-3">
                                    <CardContent>
                                        <CardTitle className="text-center">Consultar</CardTitle>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <Icon name="info-circle" size={16} />
                                            </span>
                                            <select className="form-select" id="submit_search_0" required>
                                                <option value="1">Número de radicado VR</option>
                                                <option value="2">Número de Licencia / Solicitud</option>
                                                <option value="3">Propietario</option>
                                                <option value="4">Persona que Entrega</option>
                                                <option value="5">C.C Persona que Entrega</option>
                                            </select>
                                        </div>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <Icon name="comment-dots" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="submit_search_1" placeholder="Buscar..." />
                                        </div>
                                        <div className="text-center py-2">
                                            <button type="button" className="btn btn-secondary shadow-none" onClick={() => search()}><Icon name="search-plus" size={16} /> CONSULTAR </button>
                                        </div>
                                    </CardContent></Card>
                                
                            </div>
                            <div className="col-4">
                                <Card className="mb-3">
                                    <CardContent>
                                        <CardTitle className="text-center">Documento CSV</CardTitle>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <Icon name="hashtag" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="csv_limit_1" placeholder="Limite inferior"
                                                defaultValue={`VR${dayjs().format('YY')}-0001`} />
                                        </div>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text bg-info text-white">
                                                <Icon name="hashtag" size={16} />
                                            </span>
                                            <input type="text" className="form-control" id="csv_limit_2" placeholder="Limite superior"
                                                defaultValue={`VR${dayjs().format('YY')}-9999`} />
                                        </div>
                                        <div className="text-center py-2">
                                            <button type="button" className="btn btn-success shadow-none" onClick={() => generateCVS()}><Icon name="table" size={16} /> GENERAR CSV </button>
                                        </div>
                                    </CardContent></Card>
                                
                            </div>
                        </div>

                    </div >
                    <div className="row d-flex justify-content-center">
                        <div className="col-12">
                            <h2 className="text-uppercase text-center pb-2">Lista de entradas</h2>
                            <div className="text-center">
                                {isLoaded ? (
                                    <DataTable
                                        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                        noDataComponent={<h4 className="fw-bold">NO HAY INFORMACION</h4>}
                                        striped="true"
                                        columns={columns}
                                        data={list}
                                        highlightOnHover
                                        pagination
                                        paginationPerPage={20}
                                        paginationRowsPerPageOptions={[20, 50, 100]}
                                        className="data-table-component"
                                        noHeader

                                        dense
                                        defaultSortFieldId={1}
                                        defaultSortAsc={false}
                                    />
                                ) : (
                                    <div className="text-center">
                                        <h4 className="fw-bold">CARGANDO INFORMACIÓN...</h4>
                                    </div>)}
                            </div>

                        </div >
                    </div >
                </div >

                <Modal contentLabel="VIEW/EDIT"
                    isOpen={modal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3><Icon name="edit" size={16} /> ACTUALIZAR ENTRADA: {currentIdPublic} </h3>
                        <button type="button" className="btn-close" onClick={toggle} />
                    </div>
                    <SUBTMIT_MANAGE
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={refreshList}
                        closeModal={toggle_new}
                        currentId={currentId}
                        edit />

                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggle()}><Icon name="times-circle" size={16} /> CERRAR </button>
                    </div>
                </Modal>

                <Modal contentLabel="NEW VIEW"
                    isOpen={newModal}
                    style={customStyles}
                    ariaHideApp={false}
                >
                    <div className="my-4 d-flex justify-content-between">
                        <h3><Icon name="plus-circle" size={16} /> NUEVA ENTRADA </h3>
                        <button type="button" className="btn-close" onClick={() => toggle_new()} />
                    </div>
                    <SUBTMIT_MANAGE
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        refreshList={refreshList}
                        closeModal={toggle_new} />
                    <div className="text-end py-4 mt-3">
                        <button className="btn btn-lg btn-info" onClick={() => toggle_new()}><Icon name="times-circle" size={16} /> CERRAR </button>
                    </div>
                </Modal>


            </div >
        );
}

export default SUBMIT;