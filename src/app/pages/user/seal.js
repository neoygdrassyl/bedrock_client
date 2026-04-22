import { useState, useEffect, useCallback } from 'react';
import SealsService from '../../services/seal.service'
import CustomService from '../../services/custom.service'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/icon';
import DataTable from '@/components/data-table-bridge';
import { formsParser1_exlucde2, dateParser, formsParser1 } from '../../components/customClasses/typeParse'
import dayjs from 'dayjs';
import { swalClose, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
function Seals({ translation, swaMsg, breadCrums }) {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [modal, setModal] = useState(false);
    const [items, setItems] = useState([]);
    const [helpText, setHelpText] = useState(<label className="text-dark">Ingrese numero de radicado</label>);
    const [allowCreate, setAllowCreate] = useState(false);
    const [action, setAction] = useState("create");

    const retrievePublish = useCallback(() => {
        SealsService.getAll()
            .then(response => {
                setItems(response.data);
                setIsLoaded(true);
            })
            .catch(e => {
                console.log(e);
            });
    }, []);

    useEffect(() => {
        retrievePublish();
    }, [retrievePublish]);

    const retrieveSearch = (field, string) => {
        SealsService.getSearch(field, string)
            .then(response => {
                swalClose();
                if (response.data.length) {
                    setItem(response.data[0])
                } else {
                    swalError({ title: "NO SE ENCONTRO SELLO", text: "Asegurese de que el sello que busca existe y cullo numero de radicacion es valido" });
                }
            })
            .catch(e => {
                console.log(e);
            });
    };

    const refreshList = () => {
        retrievePublish();
        setCurrentItem(null);
        setCurrentIndex(-1);
    };

    const toggle = () => {
        setModal(prev => !prev);
    };

    const getToggle = () => {
        return modal;
    };

    const setItem = (item) => {
        setCurrentItem(item);
        setModal(prev => !prev);
        SealsService.getParent(item.fun_0.id_public)
            .then(response => {
                if (response.data.length > 0) {
                    let modalidaObject = response.data[0].fun_1s;
                    if (modalidaObject.length == 0) {
                        document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                    }
                    if (modalidaObject.length == 1) {
                        let string = formsParser1_exlucde2(modalidaObject[0])
                        document.getElementById("t_11").value = string;
                    }
                    if (modalidaObject.length > 1) {
                        let string = formsParser1_exlucde2(modalidaObject[modalidaObject.length - 1])
                        document.getElementById("t_11").value = string;
                    }
                } else {
                    document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                }
            })
            .catch(e => {
                document.getElementById("t_11").value = "VACIO, ESTO NO DEBERIA APARECER AQUI, CONTACTAR CON EL INGERNIERO";
                console.log(e);
            });
    };
        const columns = [
            {
                name: <h3>No. Radicado</h3>,
                selector: row => row.id_request,
                sortable: true,
                filterable: true,
                minWidth: '100px',
                cell: row => <p className="pt-3">{row.fun_0.id_public}</p>
            },
            {
                name: <h3>Sello Consecutivo</h3>,
                selector: row => row.id_public,
                sortable: true,
                cell: row => <p className="pt-3">{row.id_public}</p>
            },
            {
                name: <h3>Fecha de Expedición</h3>,
                selector: row => row.date,
                sortable: true,
                cell: row => <p className="pt-3 text-center">{dateParser(row.fun_0.date)}</p>
            },
            {
                name: <h3>Acción</h3>,
                button: true,
                minWidth: '100px',
                cell: row =>
                    <Button variant="destructive" size="sm" onClick={() => setItem(row)}><Icon name="file-alt" size={16} /> Ver</Button>
                ,
            },
        ]

        var formData = new FormData();

        let handleSubmit = (event) => {
            event.preventDefault();
            formData = new FormData();
            console.log(allowCreate)
            if (allowCreate) {
                let blueprints = document.getElementById("blueprints").value;
                let drives = document.getElementById("drives").value;
                let folders = document.getElementById("folders").value;
                formData.set('blueprints', blueprints);
                formData.set('drives', drives);
                formData.set('folders', folders);
                let area = document.getElementById("s_4").value;
                formData.set('area', area);
                let id_public = document.getElementById("s_0").value;
                formData.set('id_public', id_public);
                let fun0Id = document.getElementById("f_0").value;
                formData.set('fun0Id', fun0Id);
                let date = document.getElementById("f_03").value;
                formData.set('date', date)
                swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
                if(action == "create"){
                SealsService.create(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            document.getElementById("app-form").reset();
                            formData = new FormData();
                            refreshList();
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
                }else if(action == "edit"){
                    let id = document.getElementById("s_1").value
                    SealsService.update(id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            document.getElementById("app-form").reset();
                            formData = new FormData();
                            refreshList();
                        }
                    })
                    .catch(e => {
                        console.log(e);
                    });
                }
            } else {
                swalError({ title: "ESTA SOLICITUD NO ES VALIDA", text: "Asegurese de que la solicitud solocitada sea valida y correcta." });
            }

        };

        // GENERATES AND GETS PDF SEAL
        let generate = (type) => {
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            formData = new FormData();
            // DATA FROM THE PARENT
            let id_request = currentItem.fun_0.id_public;
            formData.set('id_request', id_request);
            let mode = document.getElementById("t_11").value
            formData.set('mode', mode);
            let date = document.getElementById("gen_03").value
            formData.set('date', date);
            // DATA ON DEMAND
            let _type = type ? "ORIGINAL" : "TITULAR";
            formData.set('type', _type);
            // DATA FROM THE CURRENT ITEM 
            let area = currentItem.area;
            formData.set('area', area);
            let blueprints = currentItem.blueprints;
            formData.set('blueprints', blueprints);
            let drives = currentItem.drives;
            formData.set('drives', drives);
            let folders = currentItem.folders;
            formData.set('folders', folders);
            let id_public = currentItem.id_public;
            formData.set('id_public', id_public);

            CustomService.generate(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        swalClose();
                        window.open(import.meta.env.VITE_API_URL + "/seal/" + "Sello_" + id_request + ".pdf");
                        document.getElementById("app-form").reset();
                        formData = new FormData();
                        refreshList();
                        swalClose();
                    }
                })
                .catch(e => {
                    console.log(e);
                });
            toggle();
        };

        let loadParent = () => {
            let id_public = document.getElementById("f_02").value;
            setHelpText(<label className="text-warning">Buscando...</label>)
            SealsService.getParent(id_public)
                .then(response => {
                    if (response.data.length > 0) {
                        
                        if (response.data[0].seal) {
                            setHelpText(<label className="text-warning">Ya existe un sello para esta solicitud, si se crea el sello, este será reemplazado por el nuevo sello.</label>);
                            setAllowCreate(true);
                            setAction("edit");
                            document.getElementById("s_1").value = response.data[0].seal.id;
                            document.getElementById("s_4").value = response.data[0].seal.area;
                            document.getElementById("s_0").value = response.data[0].seal.id_public;
                            document.getElementById("blueprints").value = response.data[0].seal.blueprints;
                            document.getElementById("drives").value = response.data[0].seal.drives;
                            document.getElementById("folders").value = response.data[0].seal.folders;
                        } else {
                            setHelpText(<label className="text-success">Se ha encontrado esta Solicitud</label>);
                            setAllowCreate(true);
                            setAction("create");
                            document.getElementById("s_1").value = "";
                            document.getElementById("s_4").value = "";
                            document.getElementById("s_0").value = "";
                            document.getElementById("blueprints").value = "";
                            document.getElementById("drives").value = "";
                            document.getElementById("folders").value = "";
                        }
                        
                            let date = dayjs(response.data[0].date).format("YYYY-MM-DD");
                            let parent_id = response.data[0].id
                            document.getElementById("f_03").value = date;
                            document.getElementById("f_0").value = parent_id;
                            let modalidaObject = response.data[0].fun_1s;
                            if (modalidaObject.length == 0) {
                                setHelpText(<label className="text-warning">Se ha encontrado esta Solicitud, pero no se ha especificado su modalidad</label>);
                                setAllowCreate(false);
                            }
                            if (modalidaObject.length == 1) {
                                let string = formsParser1_exlucde2(modalidaObject[0])
                                document.getElementById("f_11").value = string;
                            }
                            if (modalidaObject.length > 1) {
                                if (response.data[0].seal) {
                                    setHelpText(<label className="text-success">Se ha encontrado esta Solicitud, con un total de ({modalidaObject.length}) Versiones, se usara su ultima version. Ya existe un sello para esta solicitud, si se crea el sello, este será reemplazado por el nuevo sello.</label>);
                                    setAction("edit");
                                }else{
                                    setHelpText(<label className="text-success">Se ha encontrado esta Solicitud, con un total de ({modalidaObject.length}) Versiones, se usara su ultima version.</label>);
                                    setAction("create");
                                }
                                
                                let string = formsParser1_exlucde2(modalidaObject[modalidaObject.length - 1])
                                document.getElementById("f_11").value = string;
                            }
                        
                    } else {
                        setHelpText(<label className="text-danger">No se encontraron datos para esta solicitud</label>);
                        setAllowCreate(false);
                        document.getElementById("f_03").value = null;
                        document.getElementById("f_11").value = null;
                        document.getElementById("f_0").value = "";
                        document.getElementById("s_1").value = "";
                    }
                })
                .catch(e => {
                    setHelpText(<label className="text-danger">Un error se ha presentado.</label>);
                    setAllowCreate(false);
                    console.log(e);
                });

        }
        let search = (event) => {
            event.preventDefault();
            let field = document.getElementById("search_0").value;
            let string = document.getElementById("search_1").value;
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            retrieveSearch(field, string)

        }
        return (

            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Sellos</h1>
                    <p className="text-sm text-muted-foreground mt-1">Generación y consulta de sellos de licencias</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base"><Icon name="FilePlus" size={16} className="inline mr-2" />Generar Sellos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} id="app-form">
                                    <input type="hidden" id="f_0" />
                                    <input type="hidden" id="s_1" />
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="hashtag" size={16} />
                                        </span>
                                        <input type="text" className="form-control" defaultValue="68001-1-" id="f_02"
                                            onChange={() => loadParent()} />
                                    </div>
                                    <div className="fw-normal lead"><ul>{helpText}</ul></div>

                                    <div className="input-group mb-1">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="check-circle" size={16} />
                                        </span>
                                        <input type="text" className="form-control" value="Modalidad" disabled />
                                    </div>
                                    <textarea className="form-control mb-3" rows="3" id="f_11" ></textarea>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="calendar-alt" size={16} />
                                        </span>
                                        <input type="date" className="form-control" placeholder="Fecha de Expedicion" id="f_03"
                                            onChange={(e) => formData.set('date', e.target.value)} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="cube" size={16} />
                                        </span>
                                        <input type="number" min="1" step="0.01" className="form-control" placeholder="Area Total" id="s_4"
                                            required onChange={(e) => formData.set('area', e.target.value)} />
                                    </div>

                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="hashtag" size={16} />
                                        </span>
                                        <input type="text" className="form-control" placeholder="Consecutivo Sello" id="s_0"
                                            required onChange={(e) => formData.set('id_public', e.target.value)} />
                                    </div>
                                    <hr />
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="ruler-combined" size={16} />
                                        </span>
                                        <input type="number" min="0" step="1" className="form-control" placeholder="Planos" id="blueprints"
                                            required onChange={(e) => { formData.set('blueprints', e.target.value) }} />
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="database" size={16} />
                                        </span>
                                        <input type="number" min="0" step="1" className="form-control" placeholder="Memorias" id="drives"
                                            required onChange={(e) => formData.set('drives', e.target.value)} />
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="file-invoice" size={16} />
                                        </span>
                                        <input type="number" min="0" step="1" className="form-control" placeholder="Estudios" id="folders"
                                            required onChange={(e) => formData.set('folders', e.target.value)} />
                                    </div>
                                    <div className="text-center py-4 mt-3">
                                        <Button size="sm"><Icon name="file-import" size={14} /> Crear</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base"><Icon name="Search" size={16} className="inline mr-2" />Buscar Sellos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={search} id="app-form">
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="info-circle" size={16} />
                                        </span>
                                        <select className="form-select" id="search_0" required>
                                            <option value="1">Numero de Radicado</option>
                                            <option value="2">Consecutivo Sello</option>
                                        </select>
                                    </div>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text bg-primary text-primary-foreground">
                                            <Icon name="comment-dots" size={16} />
                                        </span>
                                        <input type="text" className="form-control" id="search_1" required />
                                    </div>
                                    <div className="text-center py-4 mt-3">
                                        <Button variant="outline" size="sm"><Icon name="search-plus" size={14} /> Consultar</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base"><Icon name="FileText" size={16} className="inline mr-2" />Listado de Sellos</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {isLoaded ? (
                                    <DataTable
                                        paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}
                                        noDataComponent="No hay publicaciones en estos momentos"
                                        striped="true"
                                        columns={columns}
                                        data={items}
                                        highlightOnHover
                                        pagination
                                        paginationPerPage={20}
                                        paginationRowsPerPageOptions={[20, 50, 100]}
                                        className="data-table-component"
                                        noHeader
                                    />
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Cargando...</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Detail Modal */}
                {getToggle() && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={toggle}>
                        <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <h2 className="text-lg font-semibold"><Icon name="FileText" size={18} className="inline mr-2" />Detalles del Sello: {currentItem ? currentItem.id_public : ''}</h2>
                                <button type="button" onClick={toggle} className="rounded-md p-1 hover:bg-muted transition-colors" aria-label="Cerrar">
                                    <Icon name="X" size={16} className="text-muted-foreground" />
                                </button>
                            </div>
                            <CardContent className="p-4">
                                <table className="table table-bordered table-sm table-hover text-start table-light">
                                    <tbody>
                                        {currentItem ? <>
                                            <tr>
                                                <td><label>Nr. de Solicitud</label></td>
                                                <td><label className="fw-bold">{currentItem.fun_0.id_public}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Consecutivo Sello</label></td>
                                                <td><label className="fw-bold">{currentItem.id_public}</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2"><label>Modalidad</label></td>
                                            </tr>
                                            <tr>
                                                <td colSpan="2">
                                                    <textarea className="form-control mb-3" rows="3" id="t_11"></textarea>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><label>Area</label></td>
                                                <td><label className="fw-bold">{currentItem.area}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Fecha</label></td>
                                                <td><label className="fw-bold">
                                                <input type="date" className="form-control" placeholder="Fecha de Expedicion" id="gen_03"
                                                 defaultValue={currentItem.fun_0.date} /></label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Planos</label></td>
                                                <td><label className="fw-bold">{currentItem.blueprints}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Memorias</label></td>
                                                <td><label className="fw-bold">{currentItem.drives}</label></td>
                                            </tr>
                                            <tr>
                                                <td><label>Estudios</label></td>
                                                <td><label className="fw-bold">{currentItem.folders}</label></td>
                                            </tr>
                                        </> : ""}
                                    </tbody>
                                </table>
                            </CardContent>
                            <div className="flex flex-wrap justify-end gap-2 p-4 border-t border-border">
                                <Button variant="default" onClick={() => generate(1)}><Icon name="FileText" size={16} /> Generar Original</Button>
                                <Button variant="default" onClick={() => generate(0)}><Icon name="FileText" size={16} /> Generar Titular</Button>
                                <Button variant="secondary" onClick={toggle}><Icon name="XCircle" size={16} /> Cerrar</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        );
}

export default Seals;