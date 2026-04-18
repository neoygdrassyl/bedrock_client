import { MDBTabsContent, MDBTabsPane, MDBPopover, MDBPopoverHeader, MDBPopoverBody } from '../../components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';

import SERVICE_CUSTOM from '../../services/custom.service';

import { formsParser1, getJSONFull } from '../../components/customClasses/typeParse';
import TIPOLOGIA from '../../components/jsons/fun6DocsList.json'
import SERIES from '../../components/jsons/funCodes.json'
import SERIES_CB1 from '../../components/jsons/funcCodes.cb1.json'
import DataTable from 'react-data-table-component';
import VIZUALIZER from '../../components/vizualizer.component';
import { infoCud } from '../../components/jsons/vars';

const _GLOBAL_ID = import.meta.env.VITE_GLOBAL_ID;
export default function DICTIONARY(props) {
    const { translation, swaMsg, globals, breadCrums } = props;

    var [LIST_A, setListA] = useState([]);
    var [LIST_B, setListB] = useState([]);
    var [LIST_C, setListC] = useState([]);
    var [LIST_D, setListD] = useState([]);
    var [LIST_E, setListE] = useState([]);
    var [LIST_F, setListF] = useState([]);
    var [LIST_G, setListG] = useState([]);
    var [LIST_H, setListH] = useState([]);

    var [filter_A, setFil_A] = useState('');

    var [filter_B, setFil_B] = useState('');

    var [pag_C, setPag_C] = useState(1);
    var [limit_c, setLim_C] = useState(100);
    var [filter_C, setFil_C] = useState('');

    var [pag_D, setPag_D] = useState(1);
    var [limit_D, setLim_D] = useState(500);
    var [filter_D, setFil_D] = useState('');

    var [pag_E, setPag_E] = useState(1);
    var [limit_E, setLim_E] = useState(500);
    var [filter_E, setFil_E] = useState('');

    var [pag_F, setPag_F] = useState(1);
    var [limit_F, setLim_F] = useState(100);
    var [filter_F, setFil_F] = useState('');

    var [pag_G, setPag_G] = useState(1);
    var [limit_G, setLim_G] = useState(500);
    var [filter_G, setFil_G] = useState('');

    var [pag_H, setPag_H] = useState(1);
    var [limit_H, setLim_H] = useState(500);
    var [filter_H, setFil_H] = useState('');

    var [tab, setTab] = useState('C');

    var [load, setLoad] = useState(0);

    var [proccessToFilter, setProccessToFilter] = useState('');

    useEffect(() => {
        if (load == 0) loadLists();
    }, [load]);

    // ***************************  DATA CONVERTER *********************** //
    function _GET_STATE_STR(state) {
        if (state < '-1') return <label className='text-danger'>DESISTIDO (Ejecución)</label>
        if (state == '-1') return 'INCOMPLETO'
        if (state == '1') return 'INCOMPLETO'
        if (state == '5') return 'LYDF'
        if (state == '50') return 'EXPEDICIÓN'
        if (state == '100') return <label className='fw-bold text-success'>EXPEDIDO</label>
        if (state == '101') return <label className='fw-bold text-success'>ARCHIVADO</label>
        if (state == '200') return <label className='fw-bold text-danger'>CERRADO (Desistido)</label>
        if (state == '201') return <label className='text-danger fw-bold'>DESISTIDO (Incompleto)</label>
        if (state == '202') return <label className='text-danger fw-boldr'>DESISTIDO (No radicó valla)</label>
        if (state == '203') return <label className='text-danger fw-bold'>DESISTIDO (No subsanó Acta)</label>
        if (state == '204') return <label className='text-danger fw-bold'>DESISTIDO (No radicó pagos)</label>
        if (state == '205') return <label className='text-danger fw-boldr'>DESISTIDO (Voluntario)</label>
        if (state == '206') return <label className='text-danger fw-boldr'>DESISTIDO (Negada)</label>
        return ''
    }
    function _FILTER_H(row) {
        if (filter_H == '') return true;
        let searchPattern = (filter_H).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
        let curatedName = (row.name + ' ' + row.surname).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
        let curatedEmail = (row.email).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

        if (curatedName.includes(searchPattern)) return true;
        if (row.id_number.includes(searchPattern)) return true;
        if (curatedEmail.includes(searchPattern)) return true;
        if (row.number.includes(searchPattern)) return true;
        if (row.registration.includes(searchPattern)) return true;
        return false;
    }
    // ***************************  JXS *********************** //
    let _GET_DOCS_BTNS = (_item) => {
        if (!_item) return "";
        var _array = _item.split(',');
        var _COMPONENT = [];

        _COMPONENT.push(<>{_array[0] > 0
            ?
            <VIZUALIZER id={_array[0]} apipath={'/files/'}
                icon={'far fa-id-card fa-2x me-1'} color={'DeepSkyBlue'} />
            : ""}</>)

        _COMPONENT.push(<>{_array[1] > 0
            ?
            <VIZUALIZER id={_array[1]} apipath={'/files/'}
                icon={'far fa-id-badge fa-2x me-1'} color={'DarkOrchid'} />
            : ""}</>)

        _COMPONENT.push(<>{_array[2] > 0
            ?
            <VIZUALIZER id={_array[2]} apipath={'/files/'}
                icon={'fas fa-book fa-2x me-1'} color={'GoldenRod'} />
            : ""}</>)

        _COMPONENT.push(<>{_array[3] > 0
            ?
            <VIZUALIZER id={_array[3]} apipath={'/files/'}
                icon={'fas fa-file-invoice fa-2x me-1'} color={'LimeGreen'} />
            : ""}</>)

        return <>{_COMPONENT}</>
    }
    let _HEADER_COMPONENET = () => {
        return <>
            <div>
                <h1 className="text-xl font-bold text-foreground">Nomenclatura</h1>
                <p className="text-sm text-muted-foreground mt-1">Diccionario de series, tipología y consecutivos</p>
            </div>
            <div className="row my-4 d-flex justify-content-center">
                <div className="col-lg-11 col-md-12">
                    <h1 className="text-center my-4">DICCIONARIO DE CONSECUTIVOS</h1>
                    <hr />
                </div>
            </div>
        </>
    }

    let _COMPONENT_PAGINATION = (_list, _page, _limit, _func, _filter, process, _key) => {
        var LIST = [];
        if (process !== '') {
            LIST = _list.filter(item => item[process] == _filter)
        }
        else {
            LIST = _list.filter((arr, i) => {
                let curated_filter = _filter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                let curated_element = arr[_key].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return curated_element.includes(curated_filter)
            })
        }
        let currentItemsLenght = LIST.filter((arr, i) => Math.ceil((i + 1) / _limit) == _page).length

        let limit = Math.ceil(LIST.length / _limit)
        if (_page > limit && limit != 0) _func(limit)

        let PageNacITems = [];
        for (let i = 0; i < limit; i++) {
            PageNacITems.push(
                <li key={i} className={`page-item${i + 1 == _page ? ' active' : ''}`} onClick={() => _func(i + 1)}>
                    <a className="page-link" role="button">
                        {i + 1} {i + 1 == _page ? <span className="sr-only">(current)</span> : ''}
                    </a>
                </li>
            )
        }

        return <>
            <div className="row">
                <div className="col">
                    <nav className="m-3"><ul className="pagination">
                        <li className={`page-item${_page == 1 ? ' disabled' : ''}`} onClick={() => { if (_page != 1) _func(_page - 1) }}>
                            <a className="page-link" role="button" aria-label="Anterior">
                                <i className="fas fa-chevron-left"></i>
                                <span className="sr-only">Anterior</span>
                            </a>
                        </li>
                        {PageNacITems}
                        <li className={`page-item${_page == limit || limit < 2 ? ' disabled' : ''}`} onClick={() => _func(_page + 1)}>
                            <a className="page-link" role="button" aria-label="Siguiente">
                                <i className="fas fa-chevron-right"></i>
                                <span className="sr-only">Siguiente</span>
                            </a>
                        </li>
                        <li className="page-item"> <label className='lead'>{(_limit) * (_page - 1) == 0 ? 1 : (_limit) * (_page - 1)} - {LIST.length < _limit * _page ? LIST.length : _limit * _page}</label> </li>
                    </ul></nav>
                </div>
                <div className="col m-3 text-end">
                    <label className='lead'>{currentItemsLenght} DE {LIST.length}</label>
                </div>
            </div>
        </>
    }

    let _COMPONENT_SEARCH_BAR = (_id, _filter, _func) => {
        function setFilter() {
            _func(document.getElementById(_id).value)
        }
        function clearFilter() {
            _func('');
            document.getElementById(_id).value = ''
        }
        return <>
            <div className="input-group m-3 px-3 mx-0">
                <span className="input-group-text bg-linght">
                    <i className="fas fa-search"></i>
                </span>
                <input type='text' className='form-control' placeholder='Busqueda...' id={_id} defaultValue={_filter}
                    onKeyPress={(e) => { if (e.key === 'Enter') setFilter() }} />
                <Button variant="secondary" size="sm" onClick={() => setFilter()}><i className="fas fa-angle-double-right"></i> Buscar</Button>
                {_filter ? <Button variant="ghost" size="sm" onClick={() => clearFilter()}><i className="fas fa-times"></i> </Button>
                    : ''}
            </div>
        </>
    }
    let _COMPONENT_SEARCH_BAR_CUB = (_id, _filter, _func, setProccess, process) => {
        const [proccessSelected, setProccessSelected] = useState('')

        function setFilter() {
            _func(document.getElementById(_id).value);
        }

        function clearFilter() {
            _func('');
            setProccessSelected('');
            setProccess('')
            document.getElementById(_id).value = '';
        }
        const filterOptions = [
            {
                label: 'PQRS',
                value: 'pqrs'
            },
            {
                label: 'FUN',
                value: 'id'
            },
            {
                label: 'VR',
                value: 'vr'
            }
        ];

        return (
            <>
                <div className="input-group m-3 px-3 mx-0">
                    {/* Dropdown para filtro */}
                    <div className="dropdown">
                        <button
                            className="input-group-text bg-light border-0 dropdown-toggle" type="button"
                            id="dropdownMenuButton"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                            <i className="fas fa-search"></i>
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {filterOptions.map((filter) => (
                                <li key={filter.label}>
                                    <span className="dropdown-item" href=""
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setProccessSelected(filter.value);
                                        }}>
                                        {filter.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Input de búsqueda */}
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Busqueda..."
                        id={_id}
                        defaultValue={_filter}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                setFilter()
                                proccessSelected && setProccess(proccessSelected);
                            };
                        }} />

                    {/* Botón Buscar */}
                    <Button variant="secondary" size="sm" onClick={() => {
                        setFilter()
                        setProccess(proccessSelected);
                    }}><i className="fas fa-angle-double-right"></i> Buscar</Button>

                    {/* Botón Limpiar */}
                    {_filter || process ? (
                        <Button variant="ghost" size="sm" onClick={() => clearFilter()}><i className="fas fa-times"></i></Button>
                    ) : (
                        ''
                    )}
                </div>

                {/* Filtro seleccionado*/}
                {proccessSelected && (
                    <div className="text-muted mx-3">
                        <small>Filtro seleccionado: {proccessSelected.toUpperCase()}</small>
                    </div>
                )}
            </>
        );
    };

    let _COMPONENT_LIST_A = () => {
        let _SERIES = SERIES
        if (infoCud.codeDictionary){
            if (_GLOBAL_ID == "cb1") _SERIES = SERIES_CB1.NEW
        }
        let ELEMENTS = [];  
        for (const key in _SERIES) {
            if (Object.hasOwnProperty.call(_SERIES, key)) {
                const element = _SERIES[key];
                ELEMENTS.push({ element: element, key: key })
            }
        }

        let LIST = ELEMENTS.filter((arr, i) => {
            if (filter_A == '') return true
            let curated_filter = filter_A.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            let curated_element_1 = arr.element.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            let curated_element_2 = arr.key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return curated_element_1.includes(curated_filter) || curated_element_2.includes(curated_filter)
        })

        return <div className='m-4 p-2'>
            <div className='row'>
                {LIST.map(el => {
                    if (el.key != '0') return <>
                        <div className='col-2 text-end border'><h5 className='lead'>{el.key}</h5></div>
                        <div className='col-4 border'><h5 className='lead fw-bold'>{el.element}</h5></div>
                    </>
                })}
            </div>
        </div>
    }

    let _COMPONENT_LIST_B = () => {

        let ELEMENTS = [];
        for (const key in TIPOLOGIA) {
            if (Object.hasOwnProperty.call(TIPOLOGIA, key)) {
                const element = TIPOLOGIA[key];
                ELEMENTS.push({ element: element, key: key })
            }
        }

        let LIST = ELEMENTS.filter((arr, i) => {
            if (filter_B == '') return true
            let curated_filter = filter_B.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            let curated_element_1 = arr.element.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            let curated_element_2 = arr.key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            return curated_element_1.includes(curated_filter) || curated_element_2.includes(curated_filter)
        })

        return <div className='m-4 p-2'>
            <div className='row'>
                {LIST.map(el => {
                    if (el.key != '0') return <>
                        <div className='col-2 text-end border'><h5 className=''>{el.key}</h5></div>
                        <div className='col-4 border'><h5 className=''>{el.element}</h5></div>
                    </>
                })}
            </div>
        </div>
    }

    let _COMPONENT_LIST_H = () => {
        const headers = ['NOMBRE', 'DOCUMENTO', 'CORREO', 'NUMERO', 'MATRICULA', 'FECHA MAT.', 'SANCIÓN']
        const columns = [
            {
                name: <label className="text-center">Nombre</label>,
                selector: row => row.name + ' ' + row.surname,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{(row.name + ' ' + row.surname).toUpperCase()}</h6>

            },
            {
                name: <label className="text-center">Documento</label>,
                selector: row => row.id_number,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{row.id_number}</h6>
            },
            {
                name: <label className="text-center">Coreo</label>,
                selector: row => row.email,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{row.email}</h6>
            },
            {
                name: <label className="text-center">Número</label>,
                selector: row => row.number,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{row.number}</h6>
            },
            {
                name: <label className="text-center">Matricula</label>,
                selector: row => row.registration,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{row.registration}</h6>
            },
            {
                name: <label className="text-center">Fecha Mat.</label>,
                selector: row => row.registration_date,
                sortable: true,
                filterable: true,
                center: true,
                cell: row => <h6 className='fw-normal'>{row.registration_date}</h6>
            },
            {
                name: <label className="text-center">Docs</label>,
                center: true,
                cell: row => <h6 className='fw-normal'>{_GET_DOCS_BTNS(row.docs)}</h6>
            },
        ]
        const LIST = LIST_H.filter(row => _FILTER_H(row));
        return <>
            <DataTable
                title={<>
                    <div className='row'>
                        <div className='col'>
                            LISTADO DE PROFESIONALES  <i className="fas fa-user-circle"></i>
                        </div>
                        <div className='col-3 text-end'>
                            <Button variant="outline" size="sm" onClick={() => generateCVS(headers, LIST.map(row => [(row.name + ' ' + row.surname).toUpperCase(),
                            row.id_number, row.email, row.number, row.registration, row.registration_date, row.sanction ? 'SI' : 'NO']), 'LISTADO PROFESIONALES')}
                                ><i className="fas fa-table"></i> Descargar CSV</Button>
                        </div>
                    </div>
                </>}

                pagination
                paginationPerPage={20}
                paginationRowsPerPageOptions={[20, 50, 100]}
                paginationComponentOptions={{ rowsPerPageText: 'Publicaciones por Pagina:', rangeSeparatorText: 'de' }}

                noDataComponent="NO HAY CERTIFICACIONES"
                striped="true"
                columns={columns}
                data={LIST}
                highlightOnHover
                dense

                progressPending={LIST_H.length == 0}
                progressComponent={<label className='fw-normal lead text-muted'>CARGANDO...</label>}

                defaultSortFieldId={1}
            />

            <div className="border p-2 m-2">
                <label className="me-2">LEYENDA:</label>
                <label className="me-2"><a><i className="far fa-id-card fa-2x" style={{ "color": "DeepSkyBlue" }}></i></a> : C.C.,</label>
                <label className="me-2"><a><i className="far fa-id-badge fa-2x" style={{ "color": "DarkOrchid" }}></i></a> : Matrícula,</label>
                <label className="me-2"><a><i className="fas fa-book fa-2x" style={{ "color": "GoldenRod" }}></i></a> : Vigencia Matricular,</label>
                <label className="me-2"><a><i className="fas fa-file-invoice fa-2x" style={{ "color": "LimeGreen" }}></i></a> : Hoja de vida y Certificados</label>
            </div></>
    }

    let _COMPONENT_MAIN_LIST = (_list, _filter, process, _key, _limit, _page, _COMPONENT_POP) => {
        var LIST = [];
        if (process !== '') {
            console.log(process.toLowerCase())
            console.log(_filter)
            LIST = _list.filter(item => item[process] == _filter)
        }
        else {
            LIST = _list.filter((arr, i) => {
                let curated_filter = _filter.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                let curated_element = arr[_key].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
                return curated_element.includes(curated_filter)
            })
        }
        return <>
            <div className="d-flex flex-wrap m-3">
                {LIST.filter((arr, i) => Math.ceil((i + 1) / _limit) == _page).map(it => {
                    return <>
                        <div className={it.id_related ? '' : ''}>
                            <div className="input-group-text">
                                {_COMPONENT_POP(it)}
                            </div>
                        </div>
                    </>
                })}
            </div>

        </>
    }

    let _COMPONENT_POPC_C = (it) => {
        return <MDBPopover tag="section" popperTag='span' btnChildren={it.id_public} placement='top' dismiss>
            <MDBPopoverHeader> <label>{it.id_public}</label></MDBPopoverHeader>
            <MDBPopoverBody>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><label>Modalidad: {formsParser1(it)}</label></li>
                    <li className="list-group-item"><label>Estado: {_GET_STATE_STR(it.state)}</label></li>
                </ul>
            </MDBPopoverBody>
        </MDBPopover>
    }

    let _COMPONENT_POPC_D = (it) => {
        return <MDBPopover tag="section" popperTag='span' btnChildren={it.cub} placement='top' dismiss>
            <MDBPopoverHeader> <label>{it.cub}</label></MDBPopoverHeader>
            <MDBPopoverBody>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><label>Relación: <label className='fw-bold'>{it.id === '1' ? it.vr : it.id}</label></label></li>
                    {
                        it.id !== '1' && <li className="list-group-item"><label>VR: <label className='fw-bold'>{it.vr}</label></label></li>
                    }
                    <li className="list-group-item"><label>Proceso: <label className='fw-bold'>{it.res}</label></label></li>
                </ul>
            </MDBPopoverBody>
        </MDBPopover>
    }

    let _COMPONENT_POPC_E = (it) => {
        return <MDBPopover tag="section" popperTag='span' btnChildren={it.vr} placement='top' dismiss>
            <MDBPopoverHeader> <label>{it.vr}</label></MDBPopoverHeader>
            <MDBPopoverBody>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><label>Relación: <label className='fw-bold'>{it.desc}</label></label></li>
                </ul>
            </MDBPopoverBody>
        </MDBPopover>
    }

    let _COMPONENT_POPC_F = (it) => {
        return <MDBPopover tag="section" popperTag='span' btnChildren={it.id_child} placement='top' dismiss>
            <MDBPopoverHeader> <label>{it.id_child}</label></MDBPopoverHeader>
            <MDBPopoverBody>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><label>Proceso: <label className='fw-bold'>{it.id_public}</label></label></li>
                    <li className="list-group-item"><label>Modalidad: {formsParser1(it)}</label></li>
                    <li className="list-group-item"><label>Estado: {_GET_STATE_STR(it.state)}</label></li>
                </ul>
            </MDBPopoverBody>
        </MDBPopover>
    }

    let _COMPONENT_POPC_G = (it) => {
        return <MDBPopover tag="section" popperTag='span' btnChildren={it.id_public} placement='top' dismiss>
            <MDBPopoverHeader> <label>{it.id_public}</label></MDBPopoverHeader>
            <MDBPopoverBody>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item"><label>Descripción: <label className='fw-bold'>{it.description}</label></label></li>
                    {it.id_related ? <li className="list-group-item"><label>Proceso: {it.id_related}</label></li> : ''}
                </ul>
            </MDBPopoverBody>
        </MDBPopover>
    }

    let _COMPONENTN_TABS = () => {
        return <>
            <div className='row'>
                <div className='col text-center'>
                    <div className="flex flex-wrap gap-1">
                        <Button variant={tab != 'C' ? "outline" : "default"} size="sm" onClick={() => setTab('C')}>ACTUACIONES ({LIST_C.length})</Button>
                        <Button variant={tab != 'E' ? "outline" : "default"} size="sm" onClick={() => setTab('E')}>CONSECUTIVOS ENTRADA ({LIST_E.length})</Button>
                        <Button variant={tab != 'D' ? "outline" : "default"} size="sm" onClick={() => setTab('D')}>CONSECUTIVOS SALIDA ({LIST_D.length})</Button>
                        <Button variant={tab != 'F' ? "outline" : "default"} size="sm" onClick={() => setTab('F')}>CONSECUTIVO FINAL  ({LIST_F.length})</Button>
                        <Button variant={tab != 'G' ? "outline" : "default"} size="sm" onClick={() => setTab('G')}>CERTIFICACIONES  ({LIST_G.length})</Button>
                        <Button variant={tab != 'H' ? "outline" : "default"} size="sm" onClick={() => setTab('H')}>PROFESIONALES  ({LIST_H.length})</Button>
                        <Button variant={tab != 'A' ? "outline" : "default"} size="sm" onClick={() => setTab('A')}>SERIES Y SUBSERIES</Button>
                        <Button variant={tab != 'B' ? "outline" : "default"} size="sm" onClick={() => setTab('B')}>TIPOLOGÍA DOCUMENTAL</Button>
                    </div>
                </div>
            </div>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'A'}>
                    {_COMPONENT_SEARCH_BAR('search_a', filter_A, setFil_A)}
                    {_COMPONENT_LIST_A()}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'B'}>
                    {_COMPONENT_SEARCH_BAR('search_b', filter_B, setFil_B)}
                    {_COMPONENT_LIST_B()}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'C'}>
                    {_COMPONENT_SEARCH_BAR('search_c', filter_C, setFil_C)}
                    {_COMPONENT_PAGINATION(LIST_C, pag_C, limit_c, setPag_C, filter_C, '', 'id_public')}
                    {_COMPONENT_MAIN_LIST(LIST_C, filter_C,'', 'id_public', limit_c, pag_C, _COMPONENT_POPC_C)}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'D'}>
                    {_COMPONENT_SEARCH_BAR_CUB('search_d', filter_D, setFil_D, setProccessToFilter, proccessToFilter)}
                    {_COMPONENT_PAGINATION(LIST_D, pag_D, limit_D, setPag_D, filter_D, proccessToFilter, 'cub')}
                    <div className='row mx-3'>
                        <div className='col text-end'>
                            <Button variant="outline" size="sm" onClick={() => generateCVS(
                                ['CÓDIGO', 'PROCESO', 'DESCRIPCCIÓN', "FECHA"],
                                LIST_D.map((i) => ([`${i.cub}`, `${i.id || i.vr}`, `${i.res}`, 
                                    i.res === 'Citacion Notificación Resolución' ? getJSONFull(i.date).date_doc :i.date])),
                                'LISTADO CONSECUTIVOS DE SALIDA')}
                                ><i className="fas fa-table"></i> Descargar CSV</Button>
                        </div>
                    </div>
                    {_COMPONENT_MAIN_LIST(LIST_D, filter_D, proccessToFilter, 'cub', limit_D, pag_D, _COMPONENT_POPC_D)}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'E'}>
                    {_COMPONENT_SEARCH_BAR('search_e', filter_E, setFil_E)}
                    {_COMPONENT_PAGINATION(LIST_E, pag_E, limit_E, setPag_E, filter_E, '', 'vr')}
                    {_COMPONENT_MAIN_LIST(LIST_E, filter_E,'', 'vr', limit_E, pag_E, _COMPONENT_POPC_E)}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'F'}>
                    {_COMPONENT_SEARCH_BAR('search_f', filter_F, setFil_F)}
                    {_COMPONENT_PAGINATION(LIST_F, pag_F, limit_F, setPag_F, filter_F, '', 'id_child')}
                    {_COMPONENT_MAIN_LIST(LIST_F, filter_F,'', 'id_child', limit_F, pag_F, _COMPONENT_POPC_F)}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'G'}>
                    {_COMPONENT_SEARCH_BAR('search_g', filter_G, setFil_G)}
                    {_COMPONENT_PAGINATION(LIST_G, pag_G, limit_G, setPag_G, filter_G, '', 'id_public')}
                    {_COMPONENT_MAIN_LIST(LIST_G, filter_G,'', 'id_public', limit_G, pag_G, _COMPONENT_POPC_G)}
                </MDBTabsPane>
            </MDBTabsContent>

            <MDBTabsContent>
                <MDBTabsPane show={tab == 'H'}>
                    {_COMPONENT_SEARCH_BAR('search_h', filter_H, setFil_H)}
                    {_COMPONENT_LIST_H()}
                </MDBTabsPane>
            </MDBTabsContent>
        </>
    }
    // ***************************  DATATABLES *********************** //

    // ***************************  APIS *********************** //
    function loadLists() {
        SERVICE_CUSTOM.loadDictionary_fun()
            .then(response => {
                setListC(response.data)
            })
            .catch(e => {
                console.log(e);
            });
        SERVICE_CUSTOM.loadDictionary_cub()
            .then(response => {
                setListD(response.data)
            })
            .catch(e => {
                console.log(e);
            });
        SERVICE_CUSTOM.loadDictionary_vr()
            .then(response => {
                setListE(response.data)
            })
            .catch(e => {
                console.log(e);
            });
        SERVICE_CUSTOM.loadDictionary_out()
            .then(response => {
                setListF(response.data)
            })
            .catch(e => {
                console.log(e);
            });
        SERVICE_CUSTOM.loadDictionary_oc()
            .then(response => {
                setListG(response.data)
            })
            .catch(e => {
                console.log(e);
            });
        SERVICE_CUSTOM.loadDictionary_prof()
            .then(response => {
                setListH(response.data)
            })
            .catch(e => {
                console.log(e);
            });
    }
    let generateCVS = (_header, _data, _name) => {
        var rows = [];
        const headRows = _header
        rows = _data.map(d => d.map(r => (String(r ?? '')).replace(/[\n\r]+ */g, ' ')));
        rows.unshift(headRows);

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(";")).join("\n");

        var encodedUri = encodeURI(csvContent);
        const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

        var link = document.createElement("a");
        link.setAttribute("href", fixedEncodedURI);
        link.setAttribute("download", `${_name}.csv`);
        document.body.appendChild(link); // Required for FF

        link.click();
    }

    return (
        <>
            {_HEADER_COMPONENET()}
            {_COMPONENTN_TABS()}
        </>
    );
}
