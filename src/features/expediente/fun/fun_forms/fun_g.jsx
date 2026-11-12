import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';

import DataTable from '@/shared/components/data-table-bridge';
import {
    _FUN_1_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER,
    _FUN_7_PARSER, _FUN_8_PARSER, _FUN_9_PARSER, _FUN_101_PARSER, _FUN_102_PARSER, _FUN_24_PARSER, _FUN_25_PARSER
} from '../../../../shared/config/customClasses/funCustomArrays'
import { Icon } from '@/shared/components/icon';
import { regexChecker_isOA_2 } from '../../../../shared/config/customClasses/typeParse';
import FUNG_CHECKLIST from './fun_g_checklist';
import FUNG_NAV from './components/fun_g_nav';
import FUN_MODULE_NAV from './components/fun_moduleNav';
import FUN_VERSION_NAV from './components/fun_versionNav';
import FUN_SERVICE from '../../api/fun.service';
import FUN_3_G_VIEW from './components/fun_3_g_view';
import VIZUALIZER from '../../../../shared/components/vizualizer.component';
import FUN_G_MIX from './components/fun_g_mix.component';
import FUN_G_REPORTS from './components/fun_g_reports.component';
import FUN_ARCHIVE from './components/fun_archive.component';
import FUN_G_REPORT_MASTER from './components/fun_g_reportMaster.component';
import FunChecklistWindowSwitcher from './components/FunChecklistWindowSwitcher';
import ARCHIVE_FUN_VIEW from '../../../archive/arcXfun_view.component';
import FUN_DUPLICATE from './components/fun_duplicate.component';
import { swalError } from '@/shared/utils/swalAdapter';
import { useIsInsideExpedienteWorkspace } from '../../workspace/ExpedienteWorkspaceContext';
import { SectionCard, SectionSubheading, DataGrid, DataField } from '@/shared/components/SectionCard';
import IllustratedState from '@/shared/components/feedback/IllustratedState';
import dayjs from 'dayjs';

// Technical dates read as dd/mm/yyyy; anything that is not a date is shown as stored.
const formatShortDate = (value) => {
    if (value === null || value === undefined || value === '' || value === false) return '';
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(value);
};

// Document-type key (tokens in index.css): color is always paired with the icon and the legend text.
const DOC_KEY = {
    identity: 'hsl(var(--doc-key-identity))',
    registration: 'hsl(var(--doc-key-registration))',
    validity: 'hsl(var(--doc-key-validity))',
    resume: 'hsl(var(--doc-key-resume))',
    postgraduate: 'hsl(var(--doc-key-postgraduate))',
};


function FUNG({ translation, swaMsg, globals, currentVersion, currentId, NAVIGATION, NAVIGATION_VERSION, onDuplicateSuccess }) {
    const insideWorkspace = useIsInsideExpedienteWorkspace();
    const [load, setLoad] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [pqrsxfun, setPqrsxfun] = useState(false);
    const [showDuplicate, setShowDuplicate] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoad(false);
        setLoadFailed(false);
        setCurrentItem(null);
        setPqrsxfun(false);
        retrieveItem(currentId, { isCancelled: () => cancelled });
        return () => {
            cancelled = true;
        };
    }, [currentId]);

    const retrieveItem = (id, options = {}) => {
        const isCancelled = options.isCancelled || (() => false);
        FUN_SERVICE.get(id)
            .then(response => {
                if (isCancelled()) return;
                setLoadFailed(false);
                setCurrentItem(response.data);
                setLoad(true);
                retrievePQRSxFUN(response.data.id_public, { isCancelled });
            })
            .catch(e => {
                if (isCancelled()) return;
                console.log(e);
                setLoadFailed(true);
                swalError({ title: "ERROR AL CARGAR", text: "No ha sido posible cargar este item, intentelo nuevamente." });
            });
    };

    const retrievePQRSxFUN = (id_public, options = {}) => {
        const isCancelled = options.isCancelled || (() => false);
        FUN_SERVICE.loadPQRSxFUN(id_public)
            .then(response => {
                if (isCancelled()) return;
                setPqrsxfun(response.data);
            })
            .catch(e => {
                if (isCancelled()) return;
                console.log(e);
            });
    };

        // DATA GETTERS
        let _GET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
                description: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.tramite = _CHILD[_CURRENT_VERSION].tramite;
                    _CHILD_VARS.description = _CHILD[_CURRENT_VERSION].description ? _CHILD[_CURRENT_VERSION].description : "";
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CHILD_53 = () => {
            var _CHILD = currentItem.fun_53s;
            var _CURRENT_VERSION = currentItem.version - 1;
            var _CHILD_VARS = {
                item_530: "",
                item_5311: "",
                item_5312: "",
                item_532: "",
                item_533: "",
                item_534: "",
                item_535: "",
                item_536: "",
                docs: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_530 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_5311 = _CHILD[_CURRENT_VERSION].name;
                    _CHILD_VARS.item_5312 = _CHILD[_CURRENT_VERSION].surname;
                    _CHILD_VARS.item_532 = _CHILD[_CURRENT_VERSION].id_number;
                    _CHILD_VARS.item_533 = _CHILD[_CURRENT_VERSION].role;
                    _CHILD_VARS.item_534 = _CHILD[_CURRENT_VERSION].number;
                    _CHILD_VARS.item_535 = _CHILD[_CURRENT_VERSION].email;
                    _CHILD_VARS.item_536 = _CHILD[_CURRENT_VERSION].address;
                    _CHILD_VARS.docs = _CHILD[_CURRENT_VERSION].docs;
                }
            }
            return _CHILD_VARS;
        }
        let _GET_CLOCK = () => {
            var _CHILD = currentItem.fun_clocks;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _GET_CHILD_LAW = () => {
            var _CHILD = currentItem.fun_law;
            var _CHILD_VARS = {
                id: "",
                sign: "",
                new_type: "",
                publish_neighbour: "",
                id6payment: "",
            }
            if (_CHILD != null) {
                _CHILD_VARS.id = _CHILD.id;
                _CHILD_VARS.new_type = _CHILD.new_type;
                _CHILD_VARS.sign = _CHILD.sign;
                _CHILD_VARS.id6payment = _CHILD.id6payment;
            }
            return _CHILD_VARS;
        }
        // DATA CONVERTERS
        let _GET_DOCS_BTNS = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<span key="doc-0">{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'IdCard'} color={DOC_KEY.identity} />
                : ""}</span>)

            _COMPONENT.push(<span key="doc-1">{_array[1] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'FileText'} color={DOC_KEY.registration} />
                : ""}</span>)

            _COMPONENT.push(<span key="doc-2">{_array[2] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[2]).path + "/" + _FIND_6(_array[2]).filename} apipath={'/files/'}
                    icon={'FileText'} color={DOC_KEY.validity} />
                : ""}</span>)

            _COMPONENT.push(<span key="doc-3">{_array[3] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[3]).path + "/" + _FIND_6(_array[3]).filename} apipath={'/files/'}
                    icon={'FileText'} color={DOC_KEY.resume} />
                : ""}</span>)

            _COMPONENT.push(<span key="doc-4">{_array[4] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[4]).path + "/" + _FIND_6(_array[4]).filename} apipath={'/files/'}
                    icon={'FileText'} color={DOC_KEY.postgraduate} />
                : ""}</span>)

            return <>{_COMPONENT}</>
        }
        let _GET_DOC_VALUE = (_index) => {
            var _CHILD = _GET_CHILD_53();
            if (!_CHILD.docs) return false
            var _array = _CHILD.docs.split(',');

            return _array[_index]
        }
        let _GET_CLOCK_STATE = (_state) => {
            var _CLOCK = _GET_CLOCK();
            if (_state == null) return false;
            for (var i = 0; i < _CLOCK.length; i++) {
                if (_CLOCK[i].state == _state) return _CLOCK[i];
            }
            return false;
        }
        let _FIND_6 = (_ID) => {
            let _LIST = _SET_CHILD_6();
            let _CHILD = [];
            for (var i = 0; i < _LIST.length; i++) {
                if (_LIST[i].id == _ID) {
                    return _LIST[i];
                }
            }
            return _CHILD;
        }
        let _GET_DOCS_BTNS_FUN51 = (_item) => {
            if (!_item) return "";
            var _array = _item.split(',');
            var _COMPONENT = [];

            _COMPONENT.push(<span key="fun51-doc-0">{_array[0] > 0
                ?
                <VIZUALIZER url={_FIND_6(_array[0]).path + "/" + _FIND_6(_array[0]).filename} apipath={'/files/'}
                    icon={'IdCard'} color={DOC_KEY.identity} />
                : ""}</span>)

            _COMPONENT.push(<span key="fun51-doc-1">{_array[1] > 0
                ? <VIZUALIZER url={_FIND_6(_array[1]).path + "/" + _FIND_6(_array[1]).filename} apipath={'/files/'}
                    icon={'BadgeCheck'} color={DOC_KEY.registration} />
                : ""}</span>)

            return <>{_COMPONENT}</>
        }
        let _GET_NEIGHBOUR_STATE = (_state) => {
            if (!_state) return <label className="fw-bold text-danger">PENDIENTE</label>
            else if (_state == 1) return <label className="fw-bold text-success">CITACIÓN POSITIVA</label>
            else if (_state == 2) return <label className="fw-bold text-warning">CITACIÓN NEGATIVA</label>
        }
        // COMPONENT JSX

        let _SET_CHILD_0 = () => {
            var _CHILD = _GET_CLOCK_STATE(3);
            var _CHILD_LAW = _GET_CHILD_LAW();
            var _fun_0_type = { '0': 'SIN CATEGORIZAR', 'i': 'CATEGORIA I', 'ii': "CATEGORIA II", 'iii': "CATEGORIA III", 'iv': "CATEGORIA IV", 'oa': "OTRAS ACTUACIONES" }
            if (!_CHILD) _CHILD = "";
            const paymentDate = formatShortDate(_CHILD.date_start);
            const hasPaymentSupport = _CHILD_LAW.id6payment > 0;
            return <DataGrid>
                <DataField label="Fecha de pago" mono>
                    {paymentDate || hasPaymentSupport ? <span className="inline-flex items-center gap-2">
                        {paymentDate}
                        {hasPaymentSupport
                            ?
                            <VIZUALIZER url={_FIND_6(_CHILD_LAW.id6payment).path + "/" + _FIND_6(_CHILD_LAW.id6payment).filename}
                                apipath={'/files/'} />

                            : ""}
                    </span> : null}
                </DataField>
                <DataField label="Consecutivo de pago" mono value={currentItem.id_payment} />
                <DataField label="Categorización" value={_fun_0_type[currentItem.type]} />
                <DataField label="Descripción del proyecto" full prose value={_GET_CHILD_1().description} />
            </DataGrid>
        }
        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_1: "",
                item_2: "",
                item_3: "",
                item_4: "",
                item_5: "",
                item_6: "",
                item_7: "",
                item_8: "",
                item_9: "",
                item_101: "",
                item_102: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_1 = _FUN_1_PARSER(_CHILD[_CURRENT_VERSION].tipo);
                    _CHILD_VARS.item_2 = _FUN_2_PARSER(_CHILD[_CURRENT_VERSION].tramite);
                    _CHILD_VARS.item_3 = _FUN_3_PARSER(_CHILD[_CURRENT_VERSION].m_urb);
                    _CHILD_VARS.item_4 = _FUN_4_PARSER(_CHILD[_CURRENT_VERSION].m_sub);
                    _CHILD_VARS.item_5 = _FUN_5_PARSER(_CHILD[_CURRENT_VERSION].m_lic);
                    _CHILD_VARS.item_6 = _FUN_6_PARSER(_CHILD[_CURRENT_VERSION].usos);
                    _CHILD_VARS.item_7 = _FUN_7_PARSER(_CHILD[_CURRENT_VERSION].area);
                    _CHILD_VARS.item_8 = _FUN_8_PARSER(_CHILD[_CURRENT_VERSION].vivienda);
                    _CHILD_VARS.item_9 = _FUN_9_PARSER(_CHILD[_CURRENT_VERSION].cultural);
                    _CHILD_VARS.item_101 = _FUN_101_PARSER(_CHILD[_CURRENT_VERSION].regla_1);
                    _CHILD_VARS.item_102 = _FUN_102_PARSER(_CHILD[_CURRENT_VERSION].regla_2);
                }
            }
            return <DataGrid>
                <DataField label="1.1 Tipo de solicitud" value={_CHILD_VARS.item_1} />
                <DataField label="1.2 Objeto del trámite" value={_CHILD_VARS.item_2} />
                <DataField label="1.3 Modalidad licencia de urbanización" value={_CHILD_VARS.item_3} emptyText="No aplica" />
                <DataField label="1.4 Modalidad licencia de subdivisión" value={_CHILD_VARS.item_4} emptyText="No aplica" />
                <DataField label="1.5 Modalidad licencia de construcción" value={_CHILD_VARS.item_5} emptyText="No aplica" />
                <DataField label="1.6 Usos" value={_CHILD_VARS.item_6} />
                <DataField label="1.7 Área construida" value={_CHILD_VARS.item_7} />
                <DataField label="1.8 Tipo de vivienda" value={_CHILD_VARS.item_8} />
                <DataField label="1.9 Bien de interés cultural" value={_CHILD_VARS.item_9} />
                <DataField label="1.10.1 Declaración de medidas de construcción sostenible" value={_CHILD_VARS.item_102} />
                <DataField label="1.10.2 Zonificación climática" value={_CHILD_VARS.item_101} />
            </DataGrid>
        }
        let _SET_CHILD_2 = () => {
            var _CHILD = currentItem.fun_2;
            var _CHILD_VARS = {
                item_211: "",
                item_212: "",
                item_22: "",
                item_23: "",
                item_232: "",
                item_24: "",
                item_25: "",
                item_261: "",
                item_262: "",
                item_263: "",
                item_264: "",
                item_265: "",
                item_266: "",
            }
            if (_CHILD) {
                _CHILD_VARS.item_211 = _CHILD.direccion;
                _CHILD_VARS.item_212 = _CHILD.direccion_ant;
                _CHILD_VARS.item_22 = _CHILD.matricula;
                _CHILD_VARS.item_23 = _CHILD.catastral;
                _CHILD_VARS.item_232 = _CHILD.catastral_2;
                _CHILD_VARS.item_24 = _FUN_24_PARSER(_CHILD.suelo); // PARSER
                _CHILD_VARS.item_25 = _FUN_25_PARSER(_CHILD.lote_pla);// PARSER

                _CHILD_VARS.item_261 = _CHILD.barrio;
                _CHILD_VARS.item_262 = _CHILD.vereda;
                _CHILD_VARS.item_263 = _CHILD.comuna;
                _CHILD_VARS.item_264 = _CHILD.sector;
                _CHILD_VARS.item_265 = _CHILD.corregimiento;
                _CHILD_VARS.item_266 = _CHILD.lote;
                _CHILD_VARS.item_267 = _CHILD.estrato;
                _CHILD_VARS.item_268 = _CHILD.manzana;
            }
            return <>
                <DataGrid>
                    <DataField label="2.1 Dirección o nomenclatura actual" value={_CHILD_VARS.item_211} />
                    <DataField label="2.1 Dirección(es) anterior(es)" value={_CHILD_VARS.item_212} />
                    <DataField label="2.2 No. matrícula inmobiliaria" mono value={_CHILD_VARS.item_22} />
                    <DataField label="2.3 Identificación catastral" mono value={_CHILD_VARS.item_232 || _CHILD_VARS.item_23} />
                    <DataField label="2.4 Clasificación del suelo" value={_CHILD_VARS.item_24} />
                    <DataField label="2.5 Planimetría del lote" value={_CHILD_VARS.item_25} />
                </DataGrid>
                <SectionSubheading>2.6 Información general</SectionSubheading>
                <DataGrid>
                    <DataField label="Barrio o urbanización" value={_CHILD_VARS.item_261} />
                    <DataField label="Vereda" value={_CHILD_VARS.item_262} />
                    <DataField label="Comuna" value={_CHILD_VARS.item_263} />
                    <DataField label="Sector" value={_CHILD_VARS.item_264} />
                    <DataField label="Estrato" mono value={_CHILD_VARS.item_267} />
                    <DataField label="Corregimiento" value={_CHILD_VARS.item_265} />
                    <DataField label="Manzana No." mono value={_CHILD_VARS.item_268} />
                    <DataField label="Lote No." mono value={_CHILD_VARS.item_266} />
                </DataGrid>
            </>
        }
        let _SET_CHILD_3 = () => {
            var _CHILD = currentItem.fun_3s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_4 = () => {
            var _CHILD = currentItem.fun_4s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            const columns_4 = [
                {
                    name: 'LINDEROS',
                    selector: row => row.coord, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="text-sm">{row.coord}</span>
                },
                {
                    name: 'LONGITUD',
                    selector: row => row.longitud, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="ew-num text-sm">{row.longitud}</span>
                },
                {
                    name: 'COLINDA CON',
                    selector: row => row.colinda, // FIX: react-data-table v7→v8
                    cell: row => <span className="text-sm">{row.colinda}</span>
                },
            ]
            return <DataTable
                paginationComponentOptions={{ rowsPerPageText: 'Filas por página', rangeSeparatorText: 'de' }}
                noDataComponent="Sin linderos registrados"
                columns={columns_4}
                data={_LIST}
                highlightOnHover
                pagination
                paginationPerPage={5}
                paginationRowsPerPageOptions={[5, 10, 15]}
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_51 = () => {
            var _CHILD = currentItem.fun_51s;
            var _LIST = [];
            // SETTING 5.1 RETRIEVE ONLY THE ONES ACTIVES
            if (_CHILD) {
                for (var i = 0; i < _CHILD.length; i++) {
                    if (_CHILD[i].active == 1) {
                        _LIST.push(_CHILD[i]);
                    }
                }
            }
            const columns_51 = [
                {
                    name: 'TIPO',
                    selector: row => row.type, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.type}</span>
                },
                {
                    name: 'NOMBRE',
                    selector: row => row.name, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.name + " " + row.surname}</span>
                },
                {
                    name: 'CC/NIT',
                    selector: row => row.id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="ew-num text-sm">{row.id_number}</span>
                },
                {
                    name: 'NOMBRE REP. LEGAL',
                    selector: row => row.rep_name, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.rep_name}</span>
                },
                {
                    name: 'C.C. REP. LEGAL',
                    selector: row => row.rep_id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    cell: row => <span className="ew-num text-sm">{row.rep_id_number}</span>
                },
                {
                    name: 'TELÉFONO/ CELULAR',
                    selector: row => row.nunber, // FIX: react-data-table v7→v8
                    cell: row => <span className="ew-num text-sm">{row.nunber}</span>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'ROL',
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'DOCUMENTOS',
                    button: true,
                    cell: row => <> {_GET_DOCS_BTNS_FUN51(row.docs)}</>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                columns={columns_51}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_52 = () => {
            var _CHILD = currentItem.fun_52s;
            var _LIST = [];
            // SETTING 5.1 RETRIEVE ONLY THE ONES ACTIVES
            if (_CHILD) {
                for (var i = 0; i < _CHILD.length; i++) {
                    if (_CHILD[i].active == 1) {
                        _LIST.push(_CHILD[i]);
                    }
                }
            }
            const columns_52 = [
                {
                    name: 'NOMBRE',
                    selector: row => row.surname, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.name + " " + row.surname}</span>
                },
                {
                    name: 'CC/NIT',
                    selector: row => row.id_number, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '150px',
                    cell: row => <span className="ew-num text-sm">{row.id_number}</span>
                },
                {
                    name: 'TELÉFONO/ CELULAR',
                    selector: row => row.number, // FIX: react-data-table v7→v8
                    minWidth: '150px',
                    cell: row => <span className="ew-num text-sm">{row.number}</span>
                },
                {
                    name: 'CORREO',
                    selector: row => row.email, // FIX: react-data-table v7→v8
                    minWidth: '150px',
                    cell: row => <span className="text-sm">{row.email}</span>
                },
                {
                    name: 'PROFESIÓN',
                    selector: row => row.role, // FIX: react-data-table v7→v8
                    sortable: true,
                    filterable: true,
                    minWidth: '200px',
                    cell: row => <span className="text-sm">{row.role}</span>
                },
                {
                    name: 'MATRICULA',
                    selector: row => row.registration, // FIX: react-data-table v7→v8
                    minWidth: '150px',
                    cell: row => <span className="ew-num text-sm">{row.registration}</span>
                },
                {
                    name: 'EXP. MATRICULA',
                    selector: row => row.registration_date, // FIX: react-data-table v7→v8
                    minWidth: '150px',
                    cell: row => <span className="ew-num text-sm">{formatShortDate(row.registration_date)}</span>
                },
                {
                    name: 'EXPERIENCIA',
                    selector: row => row.expirience, // FIX: react-data-table v7→v8
                    minWidth: '150px',
                    cell: row => <span className="ew-num text-sm">{Math.trunc(row.expirience / 12)} año(s)</span>
                },
                {
                    name: '¿SANCIONADO?',
                    selector: row => row.sanction, // FIX: react-data-table v7→v8
                    cell: row => <span className="text-sm">{row.sanction ? <span className="ew-text-danger font-semibold">Sí</span> : "No"}</span>
                },
                {
                    name: 'SUPERVISIÓN',
                    selector: row => row.supervision, // FIX: react-data-table v7→v8
                    cell: row => <span className="text-sm">{row.supervision}</span>
                },
                {
                    name: 'DOCUMENTOS',
                    button: true,
                    center: true,
                    cell: row => <> {_GET_DOCS_BTNS(row.docs)}</>
                },
            ]
            return <DataTable
                noDataComponent="No hay Items"
                columns={columns_52}
                data={_LIST}
                highlightOnHover
                className="data-table-component"
                noHeader
            />
        }
        let _SET_CHILD_53 = () => {
            var _CHILD_VARS = _GET_CHILD_53();
            const fullName = [_CHILD_VARS.item_5311, _CHILD_VARS.item_5312].filter(Boolean).join(' ');
            const missingDocument = <span className="ew-text-warning font-medium">Sin documento</span>;
            return <>
                <DataGrid>
                    <DataField label="5.3.1 Nombre y apellido(s)" value={fullName} />
                    <DataField label="5.3.2 Cédula" mono value={_CHILD_VARS.item_532} />
                    <DataField label="5.3.3 Número de contacto" mono value={_CHILD_VARS.item_534} />
                    <DataField label="5.3.4 Correo electrónico" value={_CHILD_VARS.item_535} />
                    <DataField label="5.3.5 Dirección de correspondencia" value={_CHILD_VARS.item_536} />
                    <DataField label="5.3.6 En calidad de" value={_CHILD_VARS.item_533} />
                </DataGrid>
                <SectionSubheading>5.3.7 Documentos</SectionSubheading>
                <DataGrid>
                    <DataField label="Documento de identidad">
                        {_GET_DOC_VALUE(0) > 0
                            ? <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(0)).path + "/" + _FIND_6(_GET_DOC_VALUE(0)).filename}
                                apipath={'/files/'} />
                            : missingDocument}
                    </DataField>
                    <DataField label="Poder o autorización">
                        {_GET_DOC_VALUE(1) > 0
                            ?
                            <VIZUALIZER url={_FIND_6(_GET_DOC_VALUE(1)).path + "/" + _FIND_6(_GET_DOC_VALUE(1)).filename} apipath={'/files/'}
                            />
                            : missingDocument}
                    </DataField>
                </DataGrid>
            </>
        }
        let _SET_CHILD_6 = () => {
            var _CHILD = currentItem.fun_6s;
            var _LIST = [];
            if (_CHILD) {
                _LIST = _CHILD;
            }
            return _LIST;
        }
        let _SET_CHILD_C = () => {
            var _CHILD = currentItem.fun_cs;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_c0: "",
                item_c1: "",
                item_c2: "",
                item_c3: "",
                item_c4: "",
                item_c5: "",
                item_c6: "",
                item_c7: "",
                item_c8: "",
                item_c9: "",
            }
            if (_CHILD) {
                if (_CHILD[_CURRENT_VERSION] != null) {
                    _CHILD_VARS.item_c0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_c1 = _CHILD[_CURRENT_VERSION].worker;
                    _CHILD_VARS.item_c2 = _CHILD[_CURRENT_VERSION].date;
                    _CHILD_VARS.item_c3 = _CHILD[_CURRENT_VERSION].condition;
                    _CHILD_VARS.item_c4 = _CHILD[_CURRENT_VERSION].details;
                    _CHILD_VARS.item_c5 = _CHILD[_CURRENT_VERSION].reciever_name;
                    _CHILD_VARS.item_c6 = _CHILD[_CURRENT_VERSION].reciever_date;
                    _CHILD_VARS.item_c7 = _CHILD[_CURRENT_VERSION].reciever_id;
                    _CHILD_VARS.item_c8 = _CHILD[_CURRENT_VERSION].reciever_actor;
                    _CHILD_VARS.item_c9 = _CHILD[_CURRENT_VERSION].legal_date;
                }
            }
            // Same loose comparisons the read-only radios used (the stored value may be a number, a string or a boolean).
            let conditionLabel = '';
            if (_CHILD_VARS.item_c3 == '1') conditionLabel = 'Radicación en legal y debida forma';
            else if (_CHILD_VARS.item_c3 == '0') conditionLabel = 'Radicación incompleta';
            const actorLabels = { A: 'Solicitante', B: 'Apoderado', C: 'Mandatario' };
            return <>
                <SectionSubheading id="fung_c1" className="ew-subheading--first">C.1 Encargado de la revisión</SectionSubheading>
                <DataGrid>
                    <DataField label="Nombre del encargado de revisión" value={_CHILD_VARS.item_c1} />
                    <DataField label="No. radicado" mono value={currentItem.id_public} />
                    <DataField label="Fecha de revisión" mono value={formatShortDate(_CHILD_VARS.item_c2)} />
                </DataGrid>

                <SectionSubheading id="fung_c2">C.2 Condición de la radicación</SectionSubheading>
                <DataGrid>
                    <DataField label="Condición" value={conditionLabel} />
                    <DataField label="Actuador" value={actorLabels[_CHILD_VARS.item_c8]} />
                    <DataField label="Nombre" value={_CHILD_VARS.item_c5} />
                    <DataField label="CC/NIT" mono value={_CHILD_VARS.item_c7} />
                    <DataField label="Fecha incompleto" mono value={formatShortDate(_CHILD_VARS.item_c6)} />
                    <DataField label="Fecha legal y debida forma" mono value={formatShortDate(_CHILD_VARS.item_c9)} />
                    <DataField label="Observaciones" full prose value={_CHILD_VARS.item_c4} emptyText="Sin observaciones" />
                </DataGrid>
                <div className="mt-4" />
            </>
        }

        let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : {})
        let rules = currentItem ? currentItem.rules ? currentItem.rules.split(';') : [] : [];
        return (
            <div>
                {currentItem != null ? <>
                    {insideWorkspace ? null : <h2 className="text-center">RESUMEN DE LA SOLICITUD</h2>}
                    <SectionCard id="fung_0" title="0. Metadatos de la solicitud">
                        {_SET_CHILD_0()}
                        <SectionSubheading id="fun_arch">Archivo</SectionSubheading>
                        <ARCHIVE_FUN_VIEW
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                        />
                    </SectionCard>
                    <SectionCard id="fung_1" title="1. Identificación de la solicitud">
                        {_SET_CHILD_1()}
                    </SectionCard>
                    <SectionCard id="fung_2" title="2. Información del predio">
                        {_SET_CHILD_2()}
                    </SectionCard>
                    <SectionCard id="fung_3" title="3. Información de vecinos colindantes">
                        <FUN_3_G_VIEW
                            _FUN_3={_SET_CHILD_3()}
                            _FUN_6={_SET_CHILD_6()}
                        />
                    </SectionCard>
                    <SectionCard id="fung_4" title="4. Linderos, dimensiones y áreas">
                        {_SET_CHILD_4()}
                    </SectionCard>
                    <h2 className="ew-group-title" id="fun_pdf">5. Titulares y profesionales responsables</h2>
                    <SectionCard id="fung_51" title="5.1 Titular(es) de la licencia" headingLevel="h3">
                        {_SET_CHILD_51()}
                        <ul className="ew-key" aria-label="Leyenda de documentos">
                            <li><Icon name="id-card" size={16} style={{ color: DOC_KEY.identity }} aria-hidden="true" /> Documento de identidad</li>
                            <li><Icon name="id-badge" size={16} style={{ color: DOC_KEY.registration }} aria-hidden="true" /> Certificado de existencia y representación legal</li>
                        </ul>
                    </SectionCard>
                    <SectionCard id="fung_52" title="5.2 Profesionales responsables" headingLevel="h3">
                        {_SET_CHILD_52()}
                        <ul className="ew-key" aria-label="Leyenda de documentos">
                            <li><Icon name="id-card" size={16} style={{ color: DOC_KEY.identity }} aria-hidden="true" /> C.C.</li>
                            <li><Icon name="file-alt" size={16} style={{ color: DOC_KEY.registration }} aria-hidden="true" /> Matrícula</li>
                            <li><Icon name="file-alt" size={16} style={{ color: DOC_KEY.validity }} aria-hidden="true" /> Vigencia matricular</li>
                            <li><Icon name="file-alt" size={16} style={{ color: DOC_KEY.resume }} aria-hidden="true" /> Hoja de vida y certificados</li>
                            <li><Icon name="file-alt" size={16} style={{ color: DOC_KEY.postgraduate }} aria-hidden="true" /> Estudios de postgrado</li>
                        </ul>
                    </SectionCard>
                    <SectionCard id="fung_53" title="5.3 Responsable de la solicitud" headingLevel="h3">
                        {_SET_CHILD_53()}
                    </SectionCard>

                    <SectionCard id="fung_c" title="Lista de chequeo">
                        {_SET_CHILD_C()}
                        <FunChecklistWindowSwitcher
                            translation={translation}
                            swaMsg={swaMsg}
                            globals={globals}
                            currentItem={currentItem}
                            currentVersion={currentVersion}
                            requestUpdate={retrieveItem}
                            LegacyChecklistComponent={FUNG_CHECKLIST}
                        />
                    </SectionCard>

                    <FUN_G_MIX
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    />

                    <FUN_G_REPORTS
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        nomenclature={'9.'}
                        card
                        noArc={conOA()}
                        noEng={conOA() || rules[1] == 1}
                    />

                    <FUN_G_REPORT_MASTER
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        nomenclature={'9.'}
                    />

                    {/* Duplicate project section */}
                    <SectionCard
                        title="Duplicar proyecto"
                        meta="Crea un expediente nuevo a partir de los datos de este."
                        actions={
                            <Button
                                variant="outline"
                                size="sm"
                                aria-expanded={showDuplicate}
                                onClick={() => setShowDuplicate(prev => !prev)}
                            >
                                <Icon name={showDuplicate ? 'times' : 'copy'} size={16} className="me-2" />
                                {showDuplicate ? 'Cerrar duplicación' : 'Duplicar proyecto'}
                            </Button>
                        }
                    >
                        {showDuplicate && (
                            <FUN_DUPLICATE
                                swaMsg={swaMsg}
                                currentItem={currentItem}
                                onDuplicateSuccess={onDuplicateSuccess}
                            />
                        )}
                    </SectionCard>

                    {/* <FUNG_NAV
                        translation={translation} swaMsg={swaMsg} globals={globals}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                    /> */}
                    <FUN_MODULE_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        FROM={"general"}
                        NAVIGATION={NAVIGATION}
                        pqrsxfun={pqrsxfun}
                    />
                    <FUN_VERSION_NAV
                        translation={translation}
                        currentItem={currentItem}
                        currentVersion={currentVersion}
                        NAVIGATION_VERSION={NAVIGATION_VERSION}
                        ON
                    />
                </> : <SectionCard id="fung_0">
                    {loadFailed
                        ? <IllustratedState variant="load-error" onRetry={() => { setLoadFailed(false); retrieveItem(currentId); }} />
                        : <p className="m-0 py-8 text-center text-sm text-muted-foreground" role="status">Cargando información de la solicitud…</p>}
                </SectionCard>}
            </div>
        );
}

export default FUNG;
