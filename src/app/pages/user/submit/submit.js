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

    const submitModalStyles = {
        content: {
            top: '6%',
            left: '15%',
            right: '15%',
            bottom: '6%',
            maxWidth: '1120px',
            padding: '0',
        },
    };

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
                cell: row => <span>{row.sub_doc
                    ? <Icon name="Check" size={16} className="text-success" />
                    : <Icon name="X" size={16} className="text-danger" />}</span>
            },
            {
                name: 'Acción',
                button: true,
                minWidth: '100px',
                cell: row => <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggle(row)} title="Abrir">
                        <Icon name="FolderOpen" size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => delete_submit(row.id)} title="Eliminar">
                        <Icon name="Trash2" size={14} />
                    </Button>
                </div>,
            },
        ]

        // CUSTOM STYLES FOR THE MODAL
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

                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-center tracking-wide uppercase">ACCIONES</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Card>
                            <CardHeader className="py-2.5 px-3">
                                <CardTitle className="text-sm text-center">Crear entrada</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3 flex items-center justify-center">
                                <Button onClick={() => toggle_new()}>
                                    <Icon name="PlusCircle" size={14} /> Nueva Entrada
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2.5 px-3">
                                <CardTitle className="text-sm text-center">Consultar</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3">
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="Info" size={13} />
                                    </span>
                                    <select className="form-select" id="submit_search_0" required>
                                        <option value="1">Número de radicado VR</option>
                                        <option value="2">Número de Licencia / Solicitud</option>
                                        <option value="3">Propietario</option>
                                        <option value="4">Persona que Entrega</option>
                                        <option value="5">C.C Persona que Entrega</option>
                                    </select>
                                </div>
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="MessageCircle" size={13} />
                                    </span>
                                    <input type="text" className="form-control" id="submit_search_1" placeholder="Buscar..." />
                                </div>
                                <div className="text-center">
                                    <Button variant="secondary" size="sm" onClick={() => search()}>
                                        <Icon name="SearchCheck" size={13} /> Consultar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2.5 px-3">
                                <CardTitle className="text-sm text-center">Documento CSV</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 pb-3">
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="Hash" size={13} />
                                    </span>
                                    <input type="text" className="form-control" id="csv_limit_1" placeholder="Limite inferior"
                                        defaultValue={`VR${dayjs().format('YY')}-0001`} />
                                </div>
                                <div className="input-group mb-2">
                                    <span className="input-group-text bg-primary text-primary-foreground">
                                        <Icon name="Hash" size={13} />
                                    </span>
                                    <input type="text" className="form-control" id="csv_limit_2" placeholder="Limite superior"
                                        defaultValue={`VR${dayjs().format('YY')}-9999`} />
                                </div>
                                <div className="text-center">
                                    <Button variant="default" size="sm" onClick={() => generateCVS()}>
                                        <Icon name="Table" size={13} /> Generar CSV
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-center mb-2">Lista de entradas</h3>
                    {isLoaded ? (
                        <DataTable
                            paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                            noDataComponent="No hay información"
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
                        <div className="p-8 text-center text-muted-foreground text-sm">Cargando información...</div>
                    )}
                </div>

                <Modal contentLabel="VIEW/EDIT"
                    isOpen={modal}
                    style={submitModalStyles}
                    ariaHideApp={false}
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="Pencil" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Actualizar Entrada: {currentIdPublic}</h2>
                        </div>
                        <button type="button" onClick={toggle} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                    <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-5">
                        <SUBTMIT_MANAGE
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            refreshList={refreshList}
                            closeModal={toggle_new}
                            currentId={currentId}
                            edit />
                    </div>
                    <div className="flex justify-end border-t border-border/60 bg-background/95 px-5 py-4">
                        <Button variant="outline" size="sm" onClick={() => toggle()}>
                            <Icon name="X" size={14} /> Cerrar
                        </Button>
                    </div>
                </Modal>

                <Modal contentLabel="NEW VIEW"
                    isOpen={newModal}
                    style={submitModalStyles}
                    ariaHideApp={false}
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-muted/30 px-5 py-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                                <Icon name="PlusCircle" size={14} className="text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold tracking-tight">Nueva Entrada</h2>
                        </div>
                        <button type="button" onClick={() => toggle_new()} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                            <Icon name="X" size={16} className="text-muted-foreground" />
                        </button>
                    </div>
                    <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-5">
                        <SUBTMIT_MANAGE
                            translation={translation} swaMsg={swaMsg} globals={globals}
                            refreshList={refreshList}
                            closeModal={toggle_new} />
                    </div>
                    <div className="flex justify-end border-t border-border/60 bg-background/95 px-5 py-4">
                        <Button variant="outline" size="sm" onClick={() => toggle_new()}>
                            <Icon name="X" size={14} /> Cerrar
                        </Button>
                    </div>
                </Modal>


            </div >
        );
}

export default SUBMIT;