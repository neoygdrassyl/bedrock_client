import React, { useState } from "react";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

import EXPEDITION_SERVICE from '../../../services/expedition.service';
import PQRS_Service from '../../../services/pqrs_main.service';
import FUN_SERVICE from '../../../services/fun.service';


import { cities, domains_number, infoCud, zonesTable } from '../../../components/jsons/vars';
import { MDBBtn } from 'mdb-react-ui-kit';
import { dateParser, regexChecker_isOA_2, _ADDRESS_SET_FULL, _MANAGE_IDS } from '../../../components/customClasses/typeParse';
import { _FUN_1_PARSER, _FUN_4_PARSER, _FUN_6_PARSER } from '../../../components/customClasses/funCustomArrays';
import EXP_RES_2 from './exp_res_2.component';

const MySwal = withReactContent(Swal);
const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
export default function EXP_RES(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, recordArc } = props;
    const [resDocData, setResDocData] = useState(null);

    // ***************************  DATA GETTERS *********************** //
    let _GET_EXPEDITION_JSON = (field) => {
        let json = currentRecord[field];
        if (!json) return {}
        let object = JSON.parse(JSON.parse(json))
        return object
    }
    let _GET_CHILD_AREAS = () => {
        var _CHILD = currentRecord.exp_areas;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        if (!_CHILD[_CURRENT_VERSION]) return { tipo: '' };
        var _CHILD_VARS = {
            item_0: _CHILD[_CURRENT_VERSION].id,
            tipo: _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "",
            tramite: _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "",
            m_urb: _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "",
            m_sub: _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "",
            m_lic: _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "",
            item_6: _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "",
            item_7: _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "",
            item_8: _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "",
            item_9: _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "",
            item_101: _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "",
            item_102: _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "",
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_2 = () => {
        var _CHILD = currentItem.fun_2;
        if (!_CHILD) return {
            item_20: false,
            item_211: '',
            item_212: '',
            item_22: '',
            item_23: '',
            item_232: '',
            item_24: '',// PARSER
            item_25: '',// PARSER

            item_261: '',
            item_262: '',
            item_263: '',
            item_264: '',
            item_265: '',
            item_266: '',
            item_267: '',
            item_268: '',
        };
        var _CHILD_VARS = {
            item_20: _CHILD.id ?? false,
            item_211: _CHILD.direccion || '',
            item_212: _CHILD.direccion_ant ?? '',
            item_22: _CHILD.matricula || '',
            item_23: _CHILD.catastral || '',
            item_232: _CHILD.catastral2 || '',
            item_24: _CHILD.suelo ?? '',// PARSER
            item_25: _CHILD.lote_pla ?? '',// PARSER

            item_261: _CHILD.barrio ?? '',
            item_262: _CHILD.vereda ?? '',
            item_263: _CHILD.comuna ?? '',
            item_264: _CHILD.sector ?? '',
            item_265: _CHILD.corregimiento ?? '',
            item_266: _CHILD.lote ?? '',
            item_267: _CHILD.estrato ?? '',
            item_268: _CHILD.manzana ?? '',
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_51 = () => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let _GET_CHILD_53 = () => {
        var _CHILD = currentItem.fun_53s;
        var _CURRENT_VERSION = currentItem.version - 1;
        if (!_CHILD[_CURRENT_VERSION]) return {
            item_5311: '',
            item_5312: '',
            item_532: '',
            item_533: '',
        };
        var _CHILD_VARS = {
            item_530: _CHILD[_CURRENT_VERSION].id ?? false,
            item_5311: _CHILD[_CURRENT_VERSION].name ?? '',
            item_5312: _CHILD[_CURRENT_VERSION].surname ?? '',
            item_532: _CHILD[_CURRENT_VERSION].id_number ?? '',
            item_533: _CHILD[_CURRENT_VERSION].role ?? '',
            item_534: _CHILD[_CURRENT_VERSION].number ?? '',
            item_535: _CHILD[_CURRENT_VERSION].email ?? '',
            item_536: _CHILD[_CURRENT_VERSION].address ?? '',
            docs: _CHILD[_CURRENT_VERSION].docs ?? '',
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
    let LOAD_STEP = (_id_public, _record) => {
        var _CHILD = [];
        if (_record == 'arc') _CHILD = currentItem.record_arc_steps || [];
        if (_record == 'eng') _CHILD = currentItem.record_eng_steps || [];
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    let _GET_STEP_TYPE = (_id_public, _type, _record = 'arc') => {
        var STEP = LOAD_STEP(_id_public, _record);
        if (!STEP.id) return [];
        var value = STEP[_type] ? STEP[_type] : []
        if (value === undefined || value === null || value === false) return [];
        value = String(value).split(';');
        return value
    }
    let _GET_CHILD_LAW = () => {
        var _CHILD = currentItem.fun_law;
        var _CHILD_VARS = {
            id: "",
            report_data: [],
            report_cub: "",
        }
        if (_CHILD != null) {
            _CHILD_VARS.id = _CHILD.id;
            _CHILD_VARS.report_data = _CHILD.report_data ? _CHILD.report_data : [];
            _CHILD_VARS.report_cub = _CHILD.report_cub ? _CHILD.report_cub : "";
        }
        return _CHILD_VARS;
    }
    let _GET_CHILD_ENG_REW = () => {
        var _CHILD = currentItem.record_eng ? currentItem.record_eng.record_eng_reviews ? currentItem.record_eng.record_eng_reviews : [] : [];
        var _CHILD_VARS = {
            id: _CHILD[0] ? _CHILD[0].id : false,
            check: _CHILD[0] ? _CHILD[0].check : "",
            check_2: _CHILD[0] ? _CHILD[0].check_2 : "",
            date: _CHILD[0] ? _CHILD[0].date : "",
            desc: _CHILD[0] ? _CHILD[0].desc : "",
            detail: _CHILD[0] ? _CHILD[0].detail : "",
            detail_2: _CHILD[0] ? _CHILD[0].detail_2 : "",
            worker_id: _CHILD[0] ? _CHILD[0].worker_id : "",
            worker_name: _CHILD[0] ? _CHILD[0].worker_name : "",
            version: _CHILD[0] ? _CHILD[0].version : "",
            detail_3: _CHILD[0] ? _CHILD[0].detail_3 : "",
            detail_4: _CHILD[0] ? _CHILD[0].detail_4 : "",
        }
        return _CHILD_VARS;

    }
    let _GET_LAW_REPORT_DATA = () => {
        var _CHILD = _GET_CHILD_LAW();
        if (_CHILD.report_data.length) {
            return _CHILD.report_data.split(",");
        }
        return [];
    }
    let _GET_LAST_ID = (_id) => {
        let new_id = "";
        PQRS_Service.getlascub()
            .then(response => {
                new_id = response.data[0].cub;
                new_id = _MANAGE_IDS(new_id, 'end')
                document.getElementById(_id).value = new_id;
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: props.swaMsg.text_btn,
                });
            });

    }
    let conOA = () => regexChecker_isOA_2(currentItem ? _GET_CHILD_1() : false)

    let _NOTY_TYPE_COMPONENENT = () => {
        return <>
            <div className='row mx-5 my-3 text-start'>
                <strong>TIPO DE NOTIFICACIÓN</strong>

                <div className="col-4">
                    <select className='form-select' id="type_not">
                        <option value="0">NO USAR</option>
                        <option value="1">NOTIFICACIÓN PRESENCIAL</option>
                        <option value="2">NOTIFICACIÓN ELECTRÓNICA - SIN RECURSO</option>
                        <option value="3">NOTIFICACIÓN ELECTRÓNICA - CON RECURSO</option>
                    </select>
                </div>
            </div>
        </>
    }
    // ***************************** CLOCKS **************************** //

    // *************************  DATA CONVERTERS ********************** //
    let _GET_CLOCK_STATE = (_state, _version) => {
        var _CLOCK = _GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    let _GET_FUN_51_BY_TITLE = (_role) => {
        let fun_51 = _GET_CHILD_51();
        for (let i = 0; i < fun_51.length; i++) {
            const fun51 = fun_51[i];
            if (fun51.role == _role) return fun51;
        }
        return false;
    }
    let _GET_LAST_ID_RES = (_id) => {
        let new_id = "";
        FUN_SERVICE.getLastIdPublicRes()
            .then(response => {
                new_id = response.data[0].id;
                new_id = new_id.includes('-') ? new_id.split('-')[1] : new_id;
                let pre = new_id.includes('-') ? new_id.split('-')[0] + '-' : '';
                let concecutive = Number(new_id) + 1
                if (concecutive < 1000) concecutive = "0" + concecutive
                if (concecutive < 100) concecutive = "0" + concecutive
                if (concecutive < 10) concecutive = "0" + concecutive
                document.getElementById(_id).value = pre + concecutive;
            })
            .catch(e => {
                console.log(e);
                MySwal.fire({
                    title: "ERROR AL CARGAR",
                    text: "No ha sido posible cargar el consecutivo, inténtelo nuevamente.",
                    icon: 'error',
                    confirmButtonText: this.props.swaMsg.text_btn,
                });
            });

    }
    let _VERSIONS_SELECT = () => {
        var _COMPONENT = [];
        for (let i = 0; i < currentItem.version; i++) {
            _COMPONENT.push(<option value={i + 1}>Revision {i + 1}</option>)
        }
        return <select class="form-select" id="exp_pdf_reso_record_version">{_COMPONENT}</select>
    }
    let _RES_PARSER_1 = (fun_1) => {
        let parse = [];
        let licences = [];
        let mods = [];
        const _FUN_1_P = {
            'A': 'URBANIZACION',
            'B': 'PARCELACION',
            'C': 'SUBDIVISION',
            'D': 'CONSTRUCCION',
            'E': 'INTERVENCION Y OCUPACION DEL ESPACIO PUBLICO',
            'G': 'OTRAS ACTUACIONES',
        };
        const _FUN_1_3_p = {
            'A': 'DESARROLLO',
            'B': 'SANEAMIENTO',
            'C': 'RECUPERACION'
        };
        const _FUN_1_4_P = {
            'A': 'SUBDIVISION RURAL',
            'B': 'SUBDIVISION URBANA',
            'C': 'RELOTEO'
        };
        const _FUN_1_5 = {
            'A': 'OBRA NUEVA',
            'B': 'AMPLIACION',
            'C': 'ADECUACION',
            'D': 'MODIFICACION',
            'E': 'RESTAURACION',
            'F': 'REFORZAMIENTO ESTRUCTURAL',
            'G': 'DEMOLICION TOTAL',
            'g': 'DEMOLICION PARCIAL',
            'H': 'RECONSTRUCCION',
            'I': 'CERRAMIENTO'
        };
        let tipoArray = fun_1.tipo ? fun_1.tipo.split(',') : [];
        let fun_13_Array = fun_1.tipo ? fun_1.m_urb.split(',') : [];
        let fun_14_Array = fun_1.tipo ? fun_1.m_sub.split(',') : [];
        let fun_15_Array = fun_1.tipo ? fun_1.m_lic.split(',') : [];

        if (tipoArray.includes('F')) {
            parse.push('RECONOCIMIENTO DE LA EXISTENCIA DE UNA EDIFICACION')
        }
        if (tipoArray.length > 1) parse.push('JUNTO CON LICENCIA DE')
        else { parse.push('LICENCIA DE') }

        tipoArray.map(value => { if (_FUN_1_P[value]) licences.push(_FUN_1_P[value]) });
        licences = licences.join(', ')
        parse.push(licences);

        parse.push('EN LA MODALIDAD DE')

        fun_13_Array.map(value => { if (_FUN_1_3_p[value]) mods.push(_FUN_1_3_p[value]) });
        fun_14_Array.map(value => { if (_FUN_1_4_P[value]) mods.push(_FUN_1_4_P[value]) });
        fun_15_Array.map(value => { if (_FUN_1_5[value]) mods.push(_FUN_1_5[value]) });
        mods = mods.join(', ')
        parse.push(mods);

        return parse.join(' ')
    }
    function capitalize(s) {
        return s && s[0].toUpperCase() + s.slice(1);
    }
    // ******************************* RES MDELS     ***************************** // 
    let _MODEL_OPEN = () => {
        const recursive = (value) => {
            let nextValue = value - 1;
            if (nextValue > 0) recursive(nextValue);
        }
        recursive(3);

        var reso = _GET_EXPEDITION_JSON('reso');
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var duty = _GET_EXPEDITION_JSON('duty');
        var _CHILD_1 = _GET_CHILD_1();
        var _CHILD_2 = _GET_CHILD_2();
        var _CHILD_53 = _GET_CHILD_53();
        let type = _RES_PARSER_1(_CHILD_1);
        let _REPORT_DATA = _GET_LAW_REPORT_DATA();

        let tax1 = zonesTable[_GET_EXPEDITION_JSON('tmp').zone] ?? 0.1;

        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }
        let taxCAdd = Math.ceil(taxChargeDelineacion * tax1 / 50) * 50;
        taxChargeDelineacion = Number(taxChargeDelineacion) + Number(taxCAdd);

        const reso_date_dv = reso.date ?? ''
        const reso_state_dv = reso.state ?? '';
        const reso_pot_dv = reso.pot ?? infoCud.pot;

        const primero_5_dv = reso.primero_5 || `como uso compatible ${infoCud.res_extras.art1p}`

        const segundo_1_dv = reso.segundo_1 || 'declaración de antigüedad prestada por el titular de la solicitud';
        const segundo_2_dv = reso.segundo_2 || 'en cumplimiento de lo dispuesto por el Decreto 1077 ibidem y en aplicación a la presunción de la buena fe del particular';

        const tercero_2_dv = reso.tercero_2 || 'Exigir el aislamiento posterior según la altura de la edificación, razón por la cual el solicitante adjuntó planos arquitectónicos y estructurales para dar soporte a las obras de demolición parcial y modificación de esos espacios arquitectónicos, estas actividades se respaldan en este acto administrativo con una licencia de construcción en esas modalidades.';
        const DGT = _REPORT_DATA[5] || `GDT XXX-XXXX`;
        const tercero_3_dv = reso.tercero_3 || `Comunicar, dentro de los cinco (5) días hábiles siguientes al recibo de la solicitud de reconocimiento, adjuntando copia de todos los documentos exigidos en el Decreto 1077 de 2015 o la norma que lo modifique, adicione o sustituya, a la Subsecretaria de Planeación Municipal para hacerse parte de la presente solicitud; producto de lo cual está dependencia, el cual emitió un concepto bajo el ${DGT}, que si bien no es vinculante se tuvo en cuenta al momento de decisión O ESTE SEGÚN SEA EL CASO sin que a la fecha haya emitido pronunciamiento y/o concepto acerca de la verificación de los aspectos referenciados en el Art. 471 del POT, excediéndose en el término para pronunciarse, por la razón del suscrito expide el presente acto con la información disponible, tal como lo indica el articulo 2.2.6.1.2.2.5 del decreto ibidem.`;

        const cuarto_cb = reso.cuarto_cb ?? true;
        const cuarto_1_dv = reso.cuarto_1 || 'sin que a la fecha de expedición de este acto administrativo se hayan manifestado o constituido como parte.';

        const duty_2_dv = reso.duty_2 || 'Cuando se trate de licencias de urbanización, ejecutar las obras de urbanización, con sujeción a los proyectos técnicos aprobados y entregar y dotar las áreas públicas objeto de cesión gratuita con destino a vías locales, equipamientos colectivos y espacio público, de acuerdo con las especificaciones que la autoridad competente expida.'
        const duty_6_dv = reso.duty_6 || 'Someter el proyecto a supervisión técnica independiente en los términos que señala el Título I del Reglamento Colombiano de Construcción Sismo Resistente (NSR) 10.'
        const duty_9_dv = reso.duty_9 || 'Obtener, previa la ocupación y/o transferencia de las nuevas edificaciones que requieren supervisión técnica independiente, el Certificado Técnico de Ocupación emitido por parte del Supervisor Técnico Independiente siguiendo lo previsto en el Título 1 del Reglamento Colombiano de Construcción Sismo Resistente NSR-10 (…).';
        const duty_10_dv = reso.duty_10 || 'Remitir, para el caso de proyectos que requieren supervisión técnica independiente, copia de las actas de la supervisión técnica independiente que se expidan durante el desarrollo de la obra, así como el certificado técnico de ocupación, a las autoridades competentes para ejercer el control urbano en el municipio o distrito quienes remitirán copia a la entidad encargada de conservar el expediente del proyecto, y serán de público conocimiento. En los casos de patrimonios autónomos en los que el fideicomiso ostente la titularidad del predio y/o de la licencia de construcción, se deberá prever en el correspondiente contrato fiduciario quien es el responsable de esta obligación.'
        const duty_17_dv = reso.duty_17 || 'Solicitar en los términos establecidos en el artículo 2.2.6.1.4.7 del presente decreto la diligencia de inspección para la entrega material de las áreas de cesión.'
        const duty_18_dv = reso.duty_18 || ''
        const duty_19_dv = reso.duty_19 || ''
        const duty_20_dv = reso.duty_20 || ''

        const added_pot_artis = {
            0: 'Plan de Ordenamiento Territorial. Articulos...',
            'cb1': 'Plan de Ordenamiento Territorial. Subtitulo 4° Normas para la ejecución de obras de construcción. Debe dar cumplimiento a los artículos 365° a 378°; por efecto de economía se relacionan sólo los temas que le son impuestos al titular de la actuación urbanística por parte del municipio, los cuales se pueden consultar directamente por el titular: Artículo 365° Amarre geodésico; Artículo 367° Operación de equipos y herramientas de construcción, demolición y reparaciones de vías; Artículo 369° Demoliciones; Artículo 370° Cerramiento temporal del predio durante la ejecución de obras de construcción; Artículo 371° Señalización temporal de la obra; Artículo 372° Señalización temporal de vías; Artículo 373° Movimientos de tierras y excavaciones; Artículo 374° Acopio de materiales; Artículo 375° Protección y mallas; Artículo 376° Ocupación temporal de la vía y estacionamientos de vehículos al frente de las obras; Artículo 377° Transporte de materiales y Artículos 378° Servicios sanitarios en las obras.'
        }
        const duty_21_dv = reso.duty_21 || `Acuerdo ${infoCud.pot}. ${added_pot_artis[_GLOBAL_ID] ?? added_pot_artis[0]}`.replace(/[\n\r]+ */g, ' ')

        const art_1p_dv = reso.art_1p || `La subdivisión autorizada en la presente resolución se describen así: Conceder ${_FUN_1_PARSER(_CHILD_1.tipo, true)} en la modalidad de ${_FUN_4_PARSER(_CHILD_1.m_sub, true)}, en el predio con dirección de inmueble en el LOTE ${_CHILD_2.item_266} del Municipio de ${infoCud.city}, con folio de Matrícula Inmobiliaria N° ${_CHILD_2.item_22} de la Oficina de Instrumentos Públicos de ${infoCud.city}, y número catastral ${_CHILD_2.item_23}, a nombre del señor(a) ${_CHILD_53.item_5311 + ' ' + _CHILD_53.item_5312},  en su calidad de ${_CHILD_53.item_533}, para que ${infoCud.res_extras.art1p} efectúe las obras de conformidad con los planos, documentos técnicos aprobados y disposiciones urbanísticas y ambientales vigentes en el Municipio de ${infoCud.city}.`

        const open_1 = reso.open_1 || ``;
        const open_2 = reso.open_2 || ``;
        const open_3 = reso.open_3 || ``;
        const open_cb = reso.open_cb ? reso.open_cb.split(',') : [0, 0, 0];

        const art_4_1_dv = _GET_STEP_TYPE('s33', 'value')[0] || '';
        const art_4_2_dv = (_GET_STEP_TYPE('s33', 'value')[1] + (_GET_CHILD_ENG_REW().desc ? '\n' + _GET_CHILD_ENG_REW().desc : '')) || '';
        const art_4_p_dv = reso.art_4_p ?? '';


        //  GET DATA FROM ARCS AND ENGS DOCUMENTS GIVEN
        const BP_CHECK_ARRAY = _GET_STEP_TYPE('blue_prints', 'check');
        const BP_VALUE_ARRAY = _GET_STEP_TYPE('blue_prints', 'value');
        const LIST = [
            { name: 'Arquitectónicos', v: 0, c: 0 },
            { name: 'Georreferenciado', v: 1, c: 1 },
            { name: 'de Loteo', v: 2, c: 2 },
            { name: 'de Parcelación', v: 3, c: 3 },
            { name: 'de Seguridad Humana', v: 4, c: 4 },
            { name: 'de Subdivisión', v: 5, c: 5 },
            { name: 'Topográficos', v: 6, c: 6 },
            { name: 'Urbanístico General', v: 7, c: 7 },
            { name: 'Urbanísticos', v: 8, c: 8 },
        ];

        const eng_name = _GET_STEP_TYPE('s430o', 'value', 'eng');
        const ENG_CHECK_ARRAY = _GET_STEP_TYPE('s430', 'check', 'eng');
        const LIST_2 = [
            { title: 'Memorias elementos estructurales', page: true, index: 0, },
            { title: 'Memorias elementos NO estructurales', page: true, index: 1, },
            { title: 'Planos estructurales', index: 2, },
            { title: 'Planos NO estructurales', Page: true, index: 8, },
            { title: 'Plano Geotécnico', page: true, index: 3, },
            { title: 'Estudio Geotécnico', page: true, index: 9, },
            { title: 'Memorias segunda revisor', index: 4, },
            { title: 'Peritaje', index: 5, },
            { title: 'Movimiento de tierras', index: 6, },
            { title: eng_name[0], otrher: true, page: true, index: 7, },
        ]

        const ARC_DOCS = LIST.filter(l => {
            if (BP_CHECK_ARRAY[l.c] == 1) return true
            return false
        }).map(l => {
            let prev = "plano ";
            if (BP_VALUE_ARRAY[l.v] > 1) prev = 'planos '
            return prev + l.name
        }).join(', ');

        const ENG_DOCS = LIST_2.filter(l => {
            if (ENG_CHECK_ARRAY[l.index] == 1) return true
            return false
        }).map(l => {
            return l.title
        }).join(', ');

        const art_5_1_dv = reso.art_5 || ARC_DOCS + ' ' + ENG_DOCS;

        const art_7_dv = reso.art_7 || 'Notificar personalmente a la Subsecretaría de Planeación Municipal en virtud del contenido de este acto mediante el cual esta entidad se hizo parte de los actos de reconocimiento.'
        const art_8_dv = reso.art_8 || `Conceder, con fundamento en el artículo 2.2.6.1.4.1 y 2.2.6.4.2.5 del decreto 1077 de 2015, una vigencia de XXXX (XX) meses para ejecutar las obras autorizadas en la licencia de construcción en las precitada(s) modalidad(es), que acompaña(n) el reconocimiento. Contado a partir de la fecha en que quede en firme el presente acto administrativo.  Esta fecha quedará consignada de forma expresa en el acto administrativo que certifique la ejecutoria.`;
        const art_8p_dv = reso.art_8p || 'Parágrafo 1. La ejecución de las obras autorizadas en la licencia de construcción otorgada junto al acto de reconocimiento, correspondientes a la demolición parcial y modificación que permitan el cumplimiento del art 471 del POT, es de obligatorio cumplimiento, pues el reconocimiento sólo se declara junto a esta licencia, en el entendido que cumplirá con la precitada norma.'
        const art_8p1_dv = reso.art_8p1 || 'Parágrafo 2. Cuando la licencia pierda su vigencia por vencimiento del plazo o de sus prórrogas, el interesado deberá solicitar una nueva licencia, ante la misma autoridad que la expidió, ajustándose a las normas urbanísticas vigentes al momento de la nueva solicitud. Sin embargo, el interesado podrá solicitar, por una sola vez, la revalidación de la licencia vencida, siempre y cuando no haya transcurrido un término mayor a dos (2) meses desde el vencimiento de la licencia que se pretende revalidad, que el constructor o el urbanizador presente el cuadro de áreas en el que se identifique lo ejecutado durante la licencia vencida asi como lo que se ejecutará durante la revalidación y manifieste bajo la gravedad del juramento que el inmueble se encuentra en cualquiera de las situaciones contempladas en el articulo 2.2.6.1.2.4.3. del decreto 1077 de 2015.'

        const art_9_dv = reso.art_9 || 'A juicio del curador, ordénese la publicación de la parte resolutiva de la licencia en un periódico de amplia circulación en el municipio.';

        let tb_text = () => {
            let text = `# |  Número predial | Matricula inmobiliaria | Dirección | Barrio | Área predio\n`;
            let f2 = _GET_CHILD_2();
            let law_liberties = recordArc.record_law_11_liberties

            let isLiberty = law_liberties && law_liberties.length > 0 ? true : false;
            let max_rows = 0;
            let max = f2.item_23.split('/').length;

            if (isLiberty) {
                text = `# |  Número predial | Matricula inmobiliaria | Dirección | Área predio\n`;
                law_liberties.map((item, i) => {
                    text += `${i + 1} | ${item.predial_2 || item.predial} | ${item.id_public} | ${item.address} |  ${item.boundary.split(',')[0]} m2\n`;
                })
            }
            else {
                if (max > max_rows) max_rows = max;
                max = f2.item_232.split('/').length;
                if (max > max_rows) max_rows = max;
                max = f2.item_22.split('/').length;
                if (max > max_rows) max_rows = max;
                max = f2.item_211.split('/').length;
                if (max > max_rows) max_rows = max;
                for (let i = 0; i < max; i++) {
                    let cat = f2.item_23.split('/')[i] || '';
                    let cat2 = f2.item_232.split('/')[i] || '';
                    let mat = f2.item_22.split('/')[i] || '';
                    let dir = f2.item_211.split('/')[i] || '';
    
                    text += `${i + 1} | ${cat || cat2} | ${mat} | ${dir} | ${f2.item_261} | XXX m2\n`;
                }
            }
            

            return text;
        }
        const art_1_cb_tb = reso.art_1_cb_tb ?? false;
        const art_1_txt_tb = reso.art_1_txt_tb || tb_text();
        const art_1_cb = reso.art_1_cb ? reso.art_1_cb.split(',') : [1];
        const art_1_txt = reso.art_1_txt ? reso.art_1_txt : `Parágrafo. El área del predio fue tomada del cálculo de los linderos consignados en el certificado de libertad y tradición y/o títulos de propiedad; los trámites concernientes a la inscripción, aclaración y/o corrección de área y linderos del predio con fines registrales, deberá adelantarlos ante el Área Metropolitana de Bucaramanga (gestor catastral), mediante los procedimientos establecidos en la resolución conjunta IGAC No. 1101 SNR No. 11344 del 31 de Diciembre de 2020. Por lo anterior, se sugiere antes de radicar cualquier otra actuación, realizar la inscripción del área conforme a lo antes indicado, para asegurar un trámite notarial y registral exitoso.`;
        const primero = reso.primero ? reso.primero : '';
        const segundo_cb = reso.segundo_cb ? reso.segundo_cb.split(';') : [1, 1, 1, 1, 1];
        const segundo_a = reso.segundo_a ? reso.segundo_a : 'El titular de la solicitud urbanística ostenta la calidad de propietario, poseedor, fideicomiso o de fideicomitente de los inmuebles sujetos a este procedimiento, por tanto, se ajusta al requerimiento establecido en el artículo 2.2.6.1.2.1.5 del Decreto 1077 de 2015.';
        const tercero_cb = reso.tercero_cb ? reso.tercero_cb.split(',') : [1, 1, 1, 1, 1];
        const quinto_cb_dv = reso.quinto ? 1 : 0;
        const sexto_cb = reso.sexto_cb ? reso.sexto_cb.split(',') : [1, 1, 1];
        const sexto_v_cb = reso.sexto_v_cb ? reso.sexto_v_cb.split(',') : [1, 1, 1];
        const septimo_cb = reso.septimo_cb ? reso.septimo_cb.split(',') : [1, 1, 1];
        const duty_cb = reso.duty_cb ? reso.duty_cb.split(',') : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        const arts_cb = reso.arts_cb ? reso.arts_cb.split(',') : [1, 1, 1, 1, 1];

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_a1_dv = sexto_v[0] || taxes.id_payment_3 || '';
        const sexto_a2_dv = sexto_v[1] || _GET_CLOCK_STATE(65).date_start || ''
        const sexto_a3_dv = sexto_v[2] || duty.charge || '';

        const sexto_b_dv_1 = reso.sexto_b ?? 'Deee acuerdo con el área generadora para la actividad de comercio y las unidades de uso xxx en estrato xxx se requieren xx unidades de parqueo. El proyecto presenta 2 cupos en el sitio y queda por compensar 1. De esta obligación se notifica al titular del presente acto de reconocimiento para que dé cumplimiento en el momento procesal exigible, esto es como condición para poder desarrollar el uso del suelo (licencia de funcionamiento), por cuanto que para expedir la presente actuación se verificó el cumplimiento de la norma vigente de carácter municipal, art. 471 del POT. Lo anterior debe realizarse de conformidad con lo establecido en las normas vigentes (Acuerdo 065 de 2006 y del Decreto 0198 de 2015 que reglamenta los artículos 363 y 364 del POT).';
        
        const data_sexto = ['xx', _CHILD_2.item_267 ?? 'xx', 'xx'];

        let indice = 0;
        const sexto_b_dv = sexto_b_dv_1.replace(/x{2,3}/g, () => {
        return data_sexto[indice++] ?? 'xx';
        });


        const sexto_c1_dv = currentItem.id_payment || sexto_v[3] || '';
        const sexto_c2_dv = sexto_v[4] || taxes.id_payment_1 || '';
        const sexto_c3_dv = sexto_v[5] || taxChargeDelineacion || '';
        const sexto_c4_dv = sexto_v[6] || taxes.id_payment_4 || '';
        const sexto_c5_dv = sexto_v[7] || taxes.uis || '';
        const sexto_c6_dv = sexto_v[8] || taxes.id_payment_2 || '';

        const cond_show = type.includes('SUBDIVISION') ? 'sub' : 'other'; //type.includes('CONSTRUCCION') || type.includes('RECONOCIMIENTO')

        let _PRIMERO = () => {
            const _BODY_PRIMERO_A = `Acuerdo 11 de 2014 que aprobó el Plan de Ordenaminto Territorial del municipio de ${infoCud.city}`;

            let p_text = `Que la solicitud fue presentada en vigencia del ${_BODY_PRIMERO_A} y radicada 
            con el número ${currentItem.id_public} el ${dateParser(_GET_CLOCK_STATE(5, 1).date_start)} de conformidad con lo dispuesto en los artículos 
            2.2.6.4.2.2 y 2.2.6.1.2.1.7 del Decreto 1077 de 2015; habiendo 
            presentado los titulares todos los documentos exigibles para la presente actuación urbanística, para el inmueble 
            identificado con el numero predial 
            ${_CHILD_2.item_232 || _CHILD_2.item_23}, matrícula inmobiliaria  ${_CHILD_2.item_22} y nomenclatura  ${_CHILD_2.item_211} 
            ${_CHILD_2.item_261 ? 'barrio ' + _CHILD_2.item_261 + ' ' : ''}del municipio de  ${infoCud.city}.`.replace(/[\n\r]+ */g, ' ');

            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">PRIMERO</label>
                    </div>
                    <div className="col text-start">
                        <textarea id="expedition_doc_res_primero" class="form-control" rows={7}>{primero || p_text}</textarea>
                    </div>
                </div>
            </>

        }

        let _sEGUNDO = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">SEGUNDO</label>
                    </div>
                    <div className="col text-start">
                        <p>Que el proyecto objeto de la solicitud fue revisado y aprobado de acuerdo con la normatividad vigente,
                            desde el punto de vista técnico, jurídico, estructural, urbanístico y arquitectónico por el equipo técnico y Jurídico
                            del/la Curador(a) Urbano No {infoCud.nomens} de {infoCud.city}, según constan en el acta de observaciones y
                            correcciones y el concepto de viabilidad, que dan cuenta del trámite previsto en las normas que regulan presente
                            actuación urbanística; de acuerdo con estos documentos se encontró que:
                        </p>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={segundo_cb[0] == 1 ? true : false} name="expedition_doc_res_segundo_cb" />
                            <label>A.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" rows={3} id="expedition_doc_res_segundo_a">{segundo_a}</textarea>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={segundo_cb[1] == 1 ? true : false}  name="expedition_doc_res_segundo_cb"/>
                            <label>B.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>La solicitud de la actuación urbanística presentó la documentación requerida en la resolución 463 de 2017 del ministerio de vivienda ciudad y territorio, y la resolución
                            que la modifique, adicione o sustituya, ajustándose en todo al marco normativo establecido.</p>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={segundo_cb[2] == 1 ? true : false} name="expedition_doc_res_segundo_cb" />
                            <label>C.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Se verificó que el predio y/o el inmueble a reconocer no se encuentra incurso en ninguna de las situaciones que impiden el acto administrativo solicitado, las cuales se
                            encuentran enumeradas en el artículo 2.2.6.4.1.2 del Decreto 1077 de 2015.</p>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={segundo_cb[3] == 1 ? true : false} name="expedition_doc_res_segundo_cb" />
                            <label>D.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Se verificó que el inmueble objeto de la solicitud cumpliera con el uso del suelo y que sus desarrollos arquitectónicos hayan culminado como mínimo cinco (5) años
                            antes de la entrada en vigencia de la Ley 1848 de 2017; estos requisitos de procedibilidad establecidos en el artículo 2.2.6.4.1.1 del Decreto 1077 de 2015 fueron
                            corroborados para el primer elemento a través de la consulta de la norma urbana y del segundo a través de la DECLARACION, la cual se entiende cierta y
                            emitida bajo la gravedad de juramento, CUMPLIMIENTO.</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                    </div>
                    <div className="col">
                        <label className="mt-1">Declaracion</label>
                        <input type="text" class="form-control forn-control-sm" id="expedition_doc_res_segundo_1" defaultValue={segundo_1_dv} />
                        <label className="mt-1">Cumplimiento</label>
                        <input type="text" class="form-control forn-control-sm" id="expedition_doc_res_segundo_2" defaultValue={segundo_2_dv} />
                    </div>
                </div>
                <div className="row mb-1 mt-2">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={segundo_cb[4] == 1 ? true : false} name="expedition_doc_res_segundo_cb" />
                            <label>E.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Dando cumplimiento al artículo 13° Distancias de seguridad de la Resolución 90708 de 2013 del Ministerio de Minas y Energía, los constructores y el titular de la
                            solicitud presentaron a la curaduría urbana manifestación por escrito que los proyectos que solicitan dicho trámite cumplen a cabalidad con las distancias mínimas de
                            seguridad establecidas en el RETIE.</p>
                    </div>
                </div>

            </>
        }
        let _TERCERO = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2"><label className="mt-4 fw-bold">TERCERO</label></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={tercero_cb[0] == 1 ? true : false} name="expedition_doc_res_tercero_cb" />
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Que atendiendo el contenido del parágrafo 1° del artículo 2.2.6.4.1.1. del Decreto 1077 de 2015 el municipio de {infoCud.city} reglamentó mediante el POT
                            o en su defecto el alcalde municipal, lo relativo a las normas urbanísticas que se deben cumplir en los actos de reconocimiento de edificaciones existentes
                            y de acuerdo este artículo se procedió a:</p>

                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={tercero_cb[1] == 1 ? true : false} name="expedition_doc_res_tercero_cb" />
                            <label>A.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p></p>
                        <div className="col text-start">
                            <textarea class="form-control" id="expedition_doc_res_tercero_3" rows={'8'} defaultValue={tercero_3_dv}></textarea>
                        </div>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={tercero_cb[2] == 1 ? true : false} name="expedition_doc_res_tercero_cb" />
                            <label>B.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_tercero_2" rows={'4'} defaultValue={tercero_2_dv}></textarea>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={tercero_cb[3] == 1 ? true : false} name="expedition_doc_res_tercero_cb" />
                            <label>C. </label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Constatar que el inmueble no esté invadiendo el espacio público; así mismo en los planos arquitectónicos se dejó señalado para futuras intervenciones de ampliación
                            los elementos constitutivos del espacio público y las dimensiones del perfil vial establecidos en POT, los cuales son de obligatorio cumplimiento en ese evento de
                            ampliación y/o de adecuación. Así mismo se constató que el diseño del espacio público presentado con los planos arquitectónicos estuviese conforme al manual de
                            espacio público del municipio de Bucaramanga.</p>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={tercero_cb[4] == 1 ? true : false} name="expedition_doc_res_tercero_cb" />
                            <label>D. </label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Que el proyecto de construcción contempló en su diseño las condiciones que garantizan la accesibilidad y desplazamiento de las personas con movilidad reducida, sea
                            esta temporal o permanente, de conformidad con las normas establecidas en la Ley 361 de 1997, el Decreto 1538 de 2005, el Decreto 1077 de 2015 y Normas Técnicas
                            Colombianas que tratan la accesibilidad a medios físicos emitidas por el ICONTEC. Estas condiciones deben ser respetadas en obra y en todo caso, de ser necesario, la
                            misma debe ajustarse para garantizar la accesibilidad.</p>
                    </div>
                </div>
            </>
        }
        let _CUARTO = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">CUARTO</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={cuarto_cb == 1 ? true : false} id="expedition_doc_res_cuarto_cb" />
                        </div>
                    </div>
                    <div className="col text-start">
                        <p className="mt-1">Que previo a la expedición del presente acto administrativo se verificó el cumplimiento de la publicidad efectiva, permitiendo la participación de los vecinos
                            colindantes y la intervención de terceros, para lo cual el solicitante de la actuación urbanística instaló una valla en un lugar
                            visible en la cual se advirtió a terceros sobre la
                            iniciación de trámite administrativo, allegando al expediente una fotografía de la misma dentro del término establecido,
                            así mismo el/la curador(a) citó a los vecinos
                            colindantes del predio objeto de la solicitud, para que tuvieran la oportunidad de hacerse parte y pudieran hacer valer sus
                            derechos... </p>
                        <div class="input-group">
                            <input type="text" class="form-control" id="expedition_doc_res_cuarto_1"
                                defaultValue={cuarto_1_dv} />
                        </div>
                    </div>
                </div>
            </>
        }
        let _QUINTO = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">QUINTO</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={quinto_cb_dv == 1 ? true : false} id="expedition_doc_res_quinto" />
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <label>Que el proyecto objeto de la solicitud fue revisado y aprobado de acuerdo con la normatividad vigente,
                                por la División Técnica y Jurídica de esta Curaduría.</label>
                        </div>
                    </div>
                </div>
            </>
        }
        let _SEXTO = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">QUINTO</label>
                    </div>
                    <div className="col-1">

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={sexto_cb[0] == 1 ? true : false} name="expedition_doc_res_sexto_cb" />
                            <label>A.</label>
                        </div>
                    </div>
                    <div className="col">
                        <div className='row text-start'>
                            <label>Deberes urbanísticos para la provisión de espacio público los cuales compensó en dinero para lo cual aportó el
                                recibo número A.1 del A.2 por la suma de $ A.3</label>
                            <p className='text-primary fw-bold'>Procedencia de los datos: </p>
                            <p className='text-primary fw-bold'>A.1, A.2 | ACTUALIZAR -{'>'} 0. Metadatos de la Solicitud </p>
                            {_GLOBAL_ID == 'cb1' ? <p className='text-primary fw-bold'>A. 3 | EXPEDICION -{'>'} Informacion General -{'>'} Deberes Urbanísticos -{'>'} Valor ZGU m2  </p> : ''}
                        </div>
                        <div class="row">
                            <div class="form-group col">
                                <label for="inputCity">A.1 Número</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_a1_dv} />
                            </div>
                            <div class="form-group col">
                                <label for="inputState">A.2 Fecha</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_a2_dv} />
                            </div>
                            <div class="form-group col">
                                <label for="inputZip">A.3 Suma</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_a3_dv} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={sexto_cb[1] == 1 ? true : false} name="expedition_doc_res_sexto_cb" />
                            <label> B. </label>
                        </div>
                    </div>
                    <div className="col">
                        <div className='row text-start'>
                            <label>Deber de provisión de cupos de parqueo: </label>
                        </div>
                        <textarea class="form-control" id="expedition_doc_res_sexto_b" rows={'4'} defaultValue={sexto_b_dv}></textarea>
                    </div>
                </div>


                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={sexto_cb[2] == 1 ? true : false} name="expedition_doc_res_sexto_cb" />
                            <label> C. </label>
                        </div>
                    </div>
                    <div className="col">
                        <div className='row text-start'>
                            <label>Canceló las siguientes obligaciones: Expensas fijas y variables mediante las facturas N° C.1 y C.2,
                                Impuesto de delineación y urbanismo por la suma de C.3 según recibo N° C.4,  Estampilla PROUIS por la
                                suma de C.5 según recibo N° C.6.</label>
                            <p className='text-primary fw-bold'>Procedencia de los datos: </p>
                            <p className='text-primary fw-bold'>EXPEDICIÓN -{'>'} INFORMACION GENERAL </p>
                        </div>
                        <div class="row">
                            <div className="col-1">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" defaultChecked={sexto_v_cb[0] == 1 ? true : false} name="expedition_doc_res_sexto_v_cb" />
                                </div>
                            </div>
                            <div class="form-group col">
                                <label for="inputCity">C.1 Factura Fija (Nr Factura)</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                            </div>
                            <div class="form-group col">
                                <label for="inputState">C.2 Factura Variable (Nr Factura)</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                            </div>
                        </div>
                        <div class="row">
                            <div className="col-1">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" defaultChecked={sexto_v_cb[1] == 1 ? true : false} name="expedition_doc_res_sexto_v_cb" />
                                </div>
                            </div>
                            <div class="form-group col">
                                <label for="inputZip">C.3 Impuesto Delineación y Urbanismo (Valor Factura) </label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c3_dv} />
                            </div>
                            <div class="form-group col">
                                <label for="inputCity">C.4 Impuesto Delineación y Urbanismo (Nr Factura)</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c4_dv} />
                            </div>
                        </div>
                        <div class="row">
                            <div className="col-1">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" defaultChecked={sexto_v_cb[2] == 1 ? true : false} name="expedition_doc_res_sexto_v_cb" />
                                </div>
                            </div>
                            <div class="form-group col">
                                <label for="inputState">C.5 PRO-UIS (Valor Factura)</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c5_dv} />
                            </div>
                            <div class="form-group col">
                                <label for="inputZip">C.6 PROS-UIS (Nr Factura)</label>
                                <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c6_dv} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _OPEN = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ABIERTOS</label>
                    </div>
                    <div className="col-1">

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={open_cb[0] == 1 ? true : false} name="expedition_doc_reso_open_cb" />
                            <label>1.</label>
                        </div>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_res_open_1" rows={'4'} defaultValue={open_1}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={open_cb[1] == 1 ? true : false} name="expedition_doc_reso_open_cb" />
                            <label> 2. </label>
                        </div>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_res_open_2" rows={'4'} defaultValue={open_2}></textarea>
                    </div>
                </div>


                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" defaultChecked={open_cb[2] == 1 ? true : false} name="expedition_doc_reso_open_cb" />
                            <label> 3. </label>
                        </div>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_res_open_3" rows={'4'} defaultValue={open_3}></textarea>
                    </div>
                </div>
            </>
        }

        let _DUTIES = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">OBLIGACIONES TITULAR</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[0] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>1.</label>
                        </div>
                    </div>
                    <div className="col v">
                        <div class="input-group text-start">
                            <p>Ejecutar las obras de forma tal que se garantice la salubridad y seguridad de las personas, así como la estabilidad de los terrenos y edificaciones vecinas y de
                                los elementos constitutivos del espacio público.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[1] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>2.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_2" rows={'4'} defaultValue={duty_2_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[2] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>3.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Mantener en la obra la licencia y los planos aprobados, y exhibirlos cuando sean requeridos por la autoridad competente.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[3] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>4.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Cumplir con el programa de manejo ambiental de materiales y elementos a los que hace referencia la Resolución 541 de 1994 del Ministerio del Medio
                                Ambiente, o el acto que la modifique o sustituya, para aquellos proyectos que no requieren licencia ambiental, o planes de manejo, recuperación o
                                restauración ambiental, de conformidad con el decreto único del sector ambiente y desarrollo sostenible en materia de licenciamiento ambiental.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[4] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>5.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Cuando se trate de licencias de construcción, solicitar la Autorización de Ocupación de Inmuebles al concluir las obras de edificación en los términos que
                                establece el artículo 2.2.6.1.4.1 del presente decreto.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[5] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>6.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_6" rows={'2'} defaultValue={duty_6_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[6] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>7.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Garantizar durante el desarrollo de la obra la participación del diseñador estructural del proyecto y del ingeniero geotecnista responsables de los planos y
                                estudios aprobados, con el fin de que atiendan las consultas y aclaraciones que solicite el constructor y/o supervisor técnico independiente. Las consultas y
                                aclaraciones deberán incorporarse en la bitácora del proyecto y/o en las actas de supervisión.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[7] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>8.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Designar en un término máximo de 15 días hábiles al profesional que remplazará a aquel que se desvinculó de la ejecución de los diseños o de la ejecución
                                de la obra. Hasta tanto se designe el nuevo profesional, el que asumirá la obligación del profesional saliente será el titular de la licencia.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[8] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>9.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_9" rows={'3'} defaultValue={duty_9_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[9] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>10.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_10" rows={'7'} defaultValue={duty_10_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[10] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>11.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Realizar los controles de calidad para los diferentes materiales y elementos que señalen las normas de construcción Sismo Resistentes.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[11] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>12.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Instalar los equipos, sistemas e implementos de bajo consumo de agua, establecidos en la Ley 373 de 1997 o la norma que la adicione, modifique o sustituya.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[12] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>13.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Cumplir con las normas vigentes de carácter nacional, municipal o distrital sobre eliminación de barreras arquitectónicas para personas en situación de
                                discapacidad.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[13] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>14.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Cumplir con las disposiciones contenidas en las normas de construcción sismo resistente vigente.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[14] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>15.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Dar cumplimiento a las disposiciones sobre construcción sostenible que adopte el Ministerio de Vivienda, Ciudad y Territorio o los municipios o distritos en
                                ejercicio de sus competencias.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[15] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>16.</label>
                        </div>
                    </div>
                    <div className="col">
                        <div class="input-group text-start">
                            <p>Realizar la publicación establecida en el artículo 2.2.6.1.2.3.8 del presente decreto en un diario de amplia circulación en el municipio o distrito donde se
                                encuentren ubicados los inmuebles.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[16] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>17.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_17" rows={'2'} defaultValue={duty_17_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[17] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>18.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_18" rows={'2'} defaultValue={duty_18_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[18] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>19.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_19" rows={'2'} defaultValue={duty_19_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[19] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>20.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_duty_20" rows={'2'} defaultValue={duty_20_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ADICIONAL</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[17] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                        </div>
                    </div>
                    <div className="col v">
                        <div class="input-group text-start">
                            <p>Adicionalmente para el caso del reconocimiento debe dar alcance al contenido del numeral 2 del artículo 2.2.6.1.4.1 del Decreto
                                1077 de 2015 que reza: Las obras de adecuación a las normas de sismo resistencia y/o a las normas urbanísticas y
                                arquitectónicas contempladas en el acto de reconocimiento de la edificación, en los términos de que trata el presente decreto.
                                Para este efecto, la autoridad competente realizará una inspección al sitio donde se desarrolló el proyecto, dejando constancia
                                de la misma mediante acta, en la que se describirán las obras ejecutadas. Si estas se adelantaron de conformidad con lo
                                aprobado en la licencia, la autoridad expedirá la Autorización de Ocupación de Inmuebles</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col v">
                        <div class="input-group text-start">
                            <p>Así mismo, se recalca que el titular de la licencia será el responsable de todas las obligaciones urbanísticas y arquitectónicas
                                adquiridas con ocasión de su expedición y extracontractualmente por los perjuicios que se causaren a terceros en desarrollo de
                                la misma</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[18] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>2.1</label>
                        </div>
                    </div>
                    <div className="col v">
                        <textarea class="form-control" id="expedition_doc_res_duty_21" rows={'4'} defaultValue={duty_21_dv}></textarea>
                        <div class="input-group text-start">
                            <p></p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={duty_cb[19] == 1 ? true : false} name="expedition_doc_res_duty_cb" />
                            <label>2.2</label>
                        </div>
                    </div>
                    <div className="col v">
                        <div class="input-group text-start">
                            <p>Resolución 190708 de 2013 por medio de la cual se expide el Reglamento Técnico de Instalaciones Eléctricas –
                                RETIE. El titular de la actuación urbanística y el constructor deben dar cumplimiento integral a este reglamento y en
                                particular guardar las distancias de aislamiento a las redes eléctricas según su capacidad y atender las
                                responsabilidades contenidas para los diseñadores y los constructores.</p>
                        </div>
                    </div>
                </div>
            </>
        }

        let _ART_1 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 1</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={art_1_cb_tb} id="expedition_doc_res_art_1_cb_tb" />
                            <label>Tabla</label>
                        </div>
                    </div>
                    <div className="col">
                        <textarea rows={'4'} id="expedition_doc_res_art_1_text_tb" class="form-control">{art_1_txt_tb}</textarea>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={art_1_cb[0] == 1 ? true : false} name="expedition_doc_res_art_1_cb" />
                            <label> a.</label>
                        </div>
                    </div>
                    <div className="col">
                        <textarea rows={'7'} id="expedition_doc_res_art_1_text" class="form-control">{art_1_txt}</textarea>
                    </div>
                </div>
            </>
        }
        let _ART_4 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 4</label>
                    </div>
                    <div className="col text-start">
                        <p>Autorizar las obras e intervenciones que a continuación se describen.</p>
                        <p className='text-primary fw-bold'>Procedencia de los datos: </p>
                        <p className='text-primary fw-bold'>INFO. ARQ. -{'>'} 3.3 Descripción de la Actuación Urbanística -{'>'} 3.3.1 Antecedentes y Descripción del Proyecto a licencias</p>
                        <p className='text-primary fw-bold'>INFO. EST. -{'>'} 4.2 Descripción del proyecto -{'>'} Descripción del proyecto estructural</p>
                    </div>
                </div>
                <div className="row mb-1">
                    <div className="col-2">

                    </div>
                    <div className="col-2">
                        <div class="form-check form-check-inline mt-5">
                            <label> 1. Antecedentes</label>
                            <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[0] == 1 ? true : false} name="expedition_doc_res_arts_cb" />
                        </div>
                    </div>
                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_res_art_4_1_dv" rows={'3'} defaultValue={art_4_1_dv}></textarea>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2">
                    </div>
                    <div className="col-2">
                        <div class="form-check form-check-inline mt-5">
                            <label> 2. Descripción</label>
                            <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[1] == 1 ? true : false} name="expedition_doc_res_arts_cb" />
                        </div>
                    </div>

                    <div className="col">
                        <textarea class="form-control" id="expedition_doc_res_art_4_2_dv" rows={'4'} defaultValue={art_4_2_dv}></textarea>
                    </div>
                </div>

                <div className="row my-2">
                    <div className="col-2"></div>
                    <div className="col-2">
                        <div class="form-check form-check-inline">
                            <label> Cuadro Areas Paragrafo</label>
                        </div>
                    </div>

                    <div className="col">
                        <input class="form-control" id="expedition_doc_res_art_4_p" defaultValue={art_4_p_dv} />
                    </div>
                </div>
            </>
        }
        let _ART_5 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 5</label>
                    </div>
                    <div className="col text-start">
                        <p>Reconocer como parte integral de este acto administrativo los documentos legales y técnicos presentados por los titulares de la solicitud urbanística y los profesionales reconocidos en esta solicitud, quienes son responsables por su contenido; también hace parte de este acto los documentos expedidos por el curador urbano. A continuación, se relacionan:</p>
                        <p className='text-primary fw-bold'>Procedencia de los datos: </p>
                        <p className='text-primary fw-bold'>INFO. ARQ. -{'>'} 3.3.2 Planos aportados</p>
                        <p className='text-primary fw-bold'>INFO. ESTRUC.. -{'>'} 4.1.4 Revision de planos, estudio y memorias</p>
                        <div class="input-group">
                            <div className="col text-start">
                                <textarea class="form-control" id="expedition_doc_res_art_5" rows={'3'} defaultValue={art_5_1_dv}></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        }
        let _ART_7 = () => {
            return <>
                <div className="row mb-1">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 7</label>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Librar las siguientes notificaciones personales</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={septimo_cb[0] == 1 ? true : false} name="expedition_doc_res_septimo_cb" />
                            <label>1.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Notificar personalmente a los titulares, del contenido de la presente resolución en los términos del Decreto 1077 de
                                2015 y Ley 1437 de 2011.</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={septimo_cb[1] == 1 ? true : false} name="expedition_doc_res_septimo_cb" />
                            <label>2.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <div class="input-group">
                            <p>Notificar personalmente a cualquier persona que se hubiere hecho parte dentro del trámite, en los términos del
                                Decreto ibidem</p>
                        </div>
                    </div>
                </div>

                <div className="row mb-1">
                    <div className="col-2"></div>
                    <div className="col-1">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" defaultChecked={septimo_cb[2] == 1 ? true : false} name="expedition_doc_res_septimo_cb" />
                            <label>3.</label>
                        </div>
                    </div>
                    <div className="col text-start">
                        <textarea class="form-control" id="expedition_doc_res_art_7" rows={'3'} defaultValue={art_7_dv}></textarea>
                    </div>
                </div>
            </>
        }
        let _ART_8 = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 8</label>
                    </div>
                    <div className="col text-start">
                        <label className="mt-1">Vigencia</label>
                        <textarea class="form-control" id="expedition_doc_res_art_8" rows={'5'} defaultValue={art_8_dv}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline mt-5">
                            <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[2] == 1 ? true : false} name="expedition_doc_res_arts_cb" />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Paragrafo 1</label>
                        <textarea class="form-control" id="expedition_doc_res_art_8p1" rows={'5'} defaultValue={art_8p_dv}></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline mt-5">
                            <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[3] == 1 ? true : false} name="expedition_doc_res_arts_cb" />
                        </div>
                    </div>
                    <div className="col">
                        <label className="mt-1">Paragrafo 2</label>
                        <textarea class="form-control" id="expedition_doc_res_art_8p" rows={'6'} defaultValue={art_8p1_dv}></textarea>
                    </div>
                </div>
            </>
        }
        let _ART_9 = () => {
            return <>
                <div className="row">
                    <div className="col-2">
                        <label className="mt-4 fw-bold">ARTICULO 9</label>
                    </div>
                    <div className="col-1">
                        <div class="form-check form-check-inline mt-5">
                            <input class="form-check-input" type="checkbox" defaultChecked={arts_cb[4] == 1 ? true : false} name="expedition_doc_res_arts_cb" />
                        </div>
                    </div>
                    <div className="col text-start">
                        <p>Ordénese publicar el contenido resolutorio del presente acto administrativo en la página web corporativa
                            de la Curaduría Urbana N. º {infoCud.nomens} de {infoCud.city} {infoCud.web}, con el objeto de darse a conocer a terceros
                            que no hayan intervenido en la actuación.</p>
                        <textarea class="form-control" id="expedition_doc_res_art_9" rows={'2'} defaultValue={art_9_dv}></textarea>
                    </div>
                </div>
            </>
        }

        return <>

            {cond_show == 'other' ?
                <>

                    <div className="row text-center">
                        <h3 className="my-4 fw-bold">PARTE CONSIDERATIVA</h3>
                    </div>

                    {/***
                         * 
                         * <div className="row">
                                <div className="col-2">
                                    <label className="mt-4 fw-bold">PRIMERO</label>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Acuerdo</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_1"
                                            defaultValue={primero_1_dv} />
                                    </div>
                                </div>
                                <div className="col-2">
                                    <label className="mt-1">Municipio</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_2"
                                            defaultValue={primero_2_dv} />
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-2">
                                </div>
                                <div className="col">
                                    <label className="mt-1">Predial</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_3"
                                            value={(_CHILD_2.item_23 ?? '').replaceAll('-', '')} disabled readOnly />
                                    </div>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Matrícula</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_4"
                                            value={_CHILD_2.item_22} disabled readOnly />
                                    </div>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Nomenclatura</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_5"
                                            value={_CHILD_2.item_211} disabled readOnly />
                                    </div>
                                </div>
                                <div className="col">
                                    <label className="mt-1">Barrio</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="expedition_doc_res_primero_6"
                                            value={(_CHILD_2.item_261 ?? '').toUpperCase()} disabled readOnly />
                                    </div>
                                </div>
                            </div>
                            <hr />
                         * 
                         */}
                    {_PRIMERO()}
                    <hr />
                    {_sEGUNDO()}
                    <hr />
                    {_TERCERO()}
                    <hr />
                    {_CUARTO()}
                    <hr />
                    {_SEXTO()}
                    <hr />
                    {_OPEN()}
                    <hr />

                    <div className="row text-center">
                        <h3 className="my-4 fw-bold">PARTE RESOLUTIVA</h3>
                    </div>

                    {_DUTIES()}
                    <hr />
                    {_ART_1()}

                    <hr />
                    {_ART_4()}
                    <hr />
                    {_ART_5()}
                    <hr />
                    {_ART_7()}
                    <hr />
                    {_ART_8()}
                    <hr />
                    {_ART_9()}
                </>
                : cond_show == 'sub' ?
                    <>
                        <div className="row">
                            <div className="col-2">
                                <label className="mt-4 fw-bold">CONSIDERANDO</label>
                            </div>
                            <div className="col">
                                <label className="mt-1">Uso Principal</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="expedition_doc_res_primero_5"
                                        defaultValue={primero_5_dv} />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2">
                                <label className="mt-4 fw-bold">RESUELVE</label>
                            </div>
                            <div className="col">
                                <label className="mt-1">Art 1. Paragrafo</label>
                                <textarea class="form-control" id="expedition_doc_res_art_1p" rows={'7'} defaultValue={art_1p_dv}></textarea>
                            </div>
                        </div>
                    </> : ''}
        </>
    }

    let _MODEL_NEG = () => {
        return 'MODEL NOT IMPLEMENTED'
    }

    let _MODEL_DES = () => {
        var reso = _GET_EXPEDITION_JSON('reso');
        var _CHILD_1 = _GET_CHILD_1();
        var _CHILD_2 = _GET_CHILD_2();
        var _CHILD_53 = _GET_CHILD_53();
        let type = _RES_PARSER_1(_CHILD_1);

        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const reso_date_dv = reso.date ?? ''
        const reso_state_dv = reso.state ?? '';
        const reso_pot_dv = reso.pot ?? infoCud.pot;

        const primero_2_dv = reso.primero_2 || infoCud.city;
        const primero_3_dv = reso.primero_3 || '102'; //NEGATIVE ID
        const primero_32_dv = reso.primero_4 || ''; // LAW USER THAT REVIEWS


        const negative_info = {
            '101': [
                {
                    title: 'SEGUNDO', id: 'expedition_doc_res_segundo_1', dv: reso.segundo_1,
                    text: 'Que en el caso particular no se dio cumplimiento a la presentación en término de todos los documentos y requisitos que se deben aportar para que la solicitud se entienda radicada en legal y debida forma. Lo anterior de conformidad con lo dispuesto en el artículo 2.2.6.1.2.1.7 del Decreto 1077 de 2015 expedido por el Ministerio de Vivienda, Ciudad y Territorio, las Resoluciones 462 y 463 de 2017 y las que las modifiquen, adicionen y demás normas concordantes.'
                },
                {
                    title: 'TERCERO', id: 'expedition_doc_res_tercero_1', dv: reso.tercero_1,
                    text: 'Que debido a que no se completaron todos los documentos y requisitos faltantes dentro del término legal, en virtud del artículo 2.2.6.1.2.1.2 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio, esta solicitud se entiende desistida.'
                },
            ],
            '102': [
                {
                    title: 'SEGUNDO', id: 'expedition_doc_res_segundo_1', dv: reso.segundo_1,
                    text: 'Que han transcurrido más de cinco (5) días hábiles a la radicación en legal y debida forma de la solicitud y no se evidencia radicación del registro fotográfico del aviso o valla informativa, según sea el caso; o el radicado al expediente no cumple con los requisitos del artículo 2.2.6.1.2.2.1 del decreto 1077 de 2015, por no contener la información requerida, por ser ilegible o por no evidenciarse del mismo su visibilidad desde el espacio público o desde la cartelera principal del conjunto o el lugar determinado por la administración, en el caso de los inmuebles sometidos a propiedad horizontal, por lo cual esta solicitud se entiende desistida.'
                },
            ],
            '103': [
                {
                    title: 'SEGUNDO', id: 'expedition_doc_res_segundo_1', dv: reso.segundo_1,
                    text: 'Que el proyecto fue sometido a estudio por parte de los departamentos técnico y jurídico, informando al solicitante sobre las observaciones, correcciones o aclaraciones que debía realizar al mismo, y los documentos adicionales que debía aportar para decidir sobre la solicitud, de acuerdo con lo establecido en el artículo 2.2.6.1.2.2.4 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio.'
                },
                {
                    title: 'TERCERO', id: 'expedition_doc_res_tercero_1', dv: reso.tercero_1,
                    text: 'Que no se dio cumplimiento a las observaciones contenidas en el acta de observaciones, por cuanto que no se realizaron las correcciones pertinentes o las mismas se radicaron de forma extemporánea, por la cual y en virtud del artículo 2.2.6.1.2.3.4 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio, esta solicitud se entiende desistida.'
                },
            ],
            '104': [
                {
                    title: 'SEGUNDO', id: 'expedition_doc_res_segundo_1', dv: reso.segundo_1,
                    text: 'Que a la anterior solicitud se le dio trámite previsto en la Ley 388 de 1997, la Ley 810 de 2003, la Ley 1796 de 2016, el Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio y sus modificaciones, adiciones y demás normas concordantes, habiéndose sometido al estudio técnico y jurídico pertinente.'
                },
                {
                    title: 'TERCERO', id: 'expedition_doc_res_tercero_1', dv: reso.tercero_1,
                    text: 'Que ha transcurrido más de (30) días hábiles desde la comunicación/ notificación del acto de viabilidad y no se evidencia radicación de los recibos de pago de impuestos, gravámenes, tasas, participaciones y contribuciones asociadas a la expedición de licencias y/o pago de expensa de acuerdo con el artículo 2.2.6.6.8.2 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio y lo establecido en el Acuerdo 011 de mayo de 2014 – Plan de Ordenamiento Territorial de Segunda Generación del municipio de Bucaramanga. Así las cosas, de conformidad con el artículo 2.2.6.1.2.3.1 del mencionado Decreto 1077 de 2015, esta solicitud se entiende desistida.'
                },
            ],
            '105': [
                {
                    title: 'SEGUNDO', id: 'expedition_doc_res_segundo_2', edit: true, dv: reso.segundo_2,
                    text: `Que el día XX de XXXX de 20XX mediante oficio VRaa-0000, el solicitante elevó ante este Despacho la solicitud de desistimiento del proyecto Radicado bajo el No ${currentItem.id_public}.`
                },
                {
                    title: 'TERCERO', id: 'expedition_doc_res_tercero_1', dv: reso.tercero_1,
                    text: 'Que de conformidad con el artículo 2.2.6.1.2.3.4 del Decreto 1077 de 2015 del Ministerio de Vivienda, Ciudad y Territorio, el solicitante de una licencia urbanística podrá desistir de la misma mientras no se haya expedido el acto administrativo mediante el cual se concede la licencia o se niegue la solicitud presentada.'
                },
                {
                    title: 'CUARTO', id: 'expedition_doc_res_cuarto_1', dv: reso.cuarto_1,
                    text: 'Que a la fecha no se ha expedido acto administrativo por el cual se conceda o niegue la licencia objeto de estudio.'
                },
            ],
        }

        const editNeg = (value) => {
            // WORK AROUND FOR SOME BIZARRE REACT BUG REGARDING DEFAULT VALUE MANAGEMENT AND CHANGING COMPONENTS
            let _text = reso.segundo_2 || value.text;
            return <>
                <input type='hidden' />
                <textarea className="input-group" id={value.id}
                    rows='4' defaultValue={_text}></textarea></>
        }

        return <>
            <div className="row">
                <div className="col-2">
                    <label className="mt-4 fw-bold">PRIMERO</label>
                </div>
                <div className="col">
                    <label className="mt-1">Titular</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_1"
                            defaultValue={_CHILD_53.item_5311 + ' ' + _CHILD_53.item_5312} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Cédul o NIT</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_7"
                            defaultValue={_CHILD_53.item_532} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">En calidad de:</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_8"
                            defaultValue={_CHILD_53.item_533} />
                    </div>
                </div>
                <div className="col-2">
                    <label className="mt-1">Municipio</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_2"
                            defaultValue={primero_2_dv} />
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-2">
                </div>
                <div className="col">
                    <label className="mt-1">Predial</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_3"
                            defaultValue={(_CHILD_2.item_23 ?? '').replaceAll('-', '')} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Matrícula</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_4"
                            defaultValue={_CHILD_2.item_22} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Nomenclatura</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_5"
                            defaultValue={_CHILD_2.item_211} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Barrio</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_primero_6"
                            defaultValue={(_CHILD_2.item_261 ?? '').toUpperCase()} />
                    </div>
                </div>
            </div>

            <div className="row mt-2">
                <div className="col-2"></div>
                <div className="col">
                    <label className="pt-2 fw-bold">MOTIVO DE DESISTIMIENTO</label>
                    <div class="input-group">
                        <select className="form-select" id="expedition_doc_res_negative_id" defaultValue={primero_3_dv} required>
                            <option value={'102'}>POR NO RADICAR EL REGISTRO FOTOGRÁFICO DE LA VALLA O POR NO RADICARLO EN DEBIDA FORMA</option>
                            <option value={'101'}>POR RADICACION INCOMPLETA – NO QUEDÓ EN LYDF</option>
                            <option value={'103'}>POR NO SUBSANAR LAS OBSERVACIONES DEL ACTA</option>
                            <option value={'104'}>POR NO RADICAR SOPORTES DE PAGO</option>
                            <option value={'105'}>DESISTIMIENTO VOLUNTARIO</option>
                        </select>
                    </div>
                </div>
            </div>

            {negative_info[primero_3_dv].map(value => {
                return <>
                    <div className="row mt-2">
                        <div className="col-2">
                            <label className="mt-4 fw-bold">{value.title}</label>
                        </div>
                        <div className="col">
                            <div class="input-group">
                                {value.edit ?
                                    editNeg(value)
                                    : <textarea className="input-group" id={value.id}
                                        value={value.text} disabled readOnly rows='4' />}
                            </div>
                        </div>
                    </div>
                </>
            })}

            <div className="row mt-3">
                <div className="col-2"></div>
                <div className="col-10">
                    <label className="mY-2 fw-bold" >ABOGADO REVISOR</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_negative_user"
                            defaultValue={primero_32_dv} />
                    </div>
                </div>

            </div>
        </>
    }

    let _MODEL_ONN = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? 'ninguno de ellos se hizo parte.';
        return <>

            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>Vecinos que hicieron parte </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <input type="text" class="form-control" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv} />
                        </div>
                    </div>
                </div>
            </div>


            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                        <p>2- Impuesto de delineación y urbanismo por la suma de A.3 según recibo A.4.  </p>
                        <p>3- Estampilla PRO-UIS por la suma de A.5 según recibo A.6. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.3 Impuesto Delineación y Urbanismo (Valor Factura) </label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c3_dv} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.4 Impuesto Delineación y Urbanismo (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c4_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.5 PRO-UIS (Valor Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c5_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.6 PROS-UIS (Nr Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c6_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_ONS = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? 'ninguno de ellos se hizo parte.';

        return <>
            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>Vecinos que hicieron parte </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <input type="text" class="form-control" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-3">
                <div className="col">
                    <label className='fw-bold'>CONSIDERATIVA 7</label>
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                        <p>2- Impuesto de delineación y urbanismo por la suma de A.3 según recibo A.4.  </p>
                        <p>3- Estampilla PRO-UIS por la suma de A.5 según recibo A.6. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.3 Impuesto Delineación y Urbanismo (Valor Factura) </label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c3_dv} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.4 Impuesto Delineación y Urbanismo (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c4_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.5 PRO-UIS (Valor Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c5_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.6 PROS-UIS (Nr Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c6_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_RECCON = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? 'ninguno de ellos se hizo parte.';

        return <>

            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>Vecinos que hicieron parte </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <input type="text" class="form-control" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_PARCON = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Que en cumplimiento de lo establecido en el artículo 2.2.6.1.2.2.1 del Decreto 1077 de 2015, se efectuó publicación en un periódico de amplia circulación, incluyendo la información indicada para las citaciones a vecinos colindantes, informando sobre la radicación del trámite de licenciamiento para que se hagan parte y puedan hacer valer sus derechos, de los cuales ninguno de ellos se hizo parte.`
        let parcon_6 = parcon[1] || `Que dentro de la solicitud de Licencia de Parcelación, la Oficina Asesora de Planeación de Piedecuesta emitió la Resolución N° P000-2022 del xxxxxxxxxxx de dos mil veintidós (2022), mediante la cual se realizó la Liquidación de las Áreas de Cesión tipo A para compensación en dinero, conforme a lo establecido en el Acuerdo Municipal 028 de 2003, Acuerdo Municipal N° 007 de 2007 y el Decreto Municipal 106 de 2008, liquidando las Áreas de Cesión Tipo A equivalentes al doce por ciento (12%) del área neta urbanizable, de cesiones sociales y ambientales compensadas en dinero, es decir, equivalentes a 000,00 m2, en concordancia con el Avalúo xxxxxxxxxxxxxxxxx. En consecuencia, quedó viabilizado el concepto de 7% para cesiones sociales y 5% para cesiones ambientales, las cuales se compensaron en dinero, antes de la Notificación de la Licencia, en la Secretaría de Hacienda Municipal de Piedecuesta con destino al Fondo de Compensación de Áreas de Cesión Tipo A.`
        let parcon_7 = parcon[2] || `Que las Áreas de Cesión Tipo A, efectivamente fueron consignadas, según paz y salvo N° 0000-000 expedido por la Oficina Asesora de Planeación de Piedecuesta y consignación bancaria realizada el xxxxxxxx (xxx) de marzo de dos mil veintidós (2022) en el Banco de xxxxxxxxx en cuenta a nombre del Municipio de Piedecuesta.`
        let parcon_8 = parcon[3] || `Que el Área Metropolitana de Bucaramanga –AMB- expidió la Resolución N° 000000 del xxxxx (x) de xxxx de dos mil veintidós (2022) “Por la cual se efectúa la liquidación de Áreas de Cesión Tipo C”, correspondientes al tres por ciento (3%) del área neta urbanizable, es decir, equivalente a 00,0000 m2 de la Licencia de Parcelación con fundamento en el Avalúo xxxxxxxxxxxxxx N° 0000-2022 del xxxxxx (xx) de xxxxxxx de dos mil veintidós (2022), elaborado por la Corporación Lonja Inmobiliaria xxxxxxx y el Plano del proyecto con su respectivo cuadro de áreas.`
        let parcon_9 = parcon[4] || `Que el valor de la compensación en dinero de las Áreas de Cesión Tipo C fue consignado por parte del titular de la licencia según paz y salvo de la Subdirectora Administrativa y Financiera del Área Metropolitana de Bucaramanga –AMB-, expedido el xxxxxx (xx) de xxxxxxx de dos mil veintidós (2022).`
        let parcon_10 = parcon[5] || `Que, de conformidad con lo anterior, las áreas de cesión han sido compensadas en dinero por el titular de la Licencia al Municipio de Piedecuesta y al Área Metropolitana de Bucaramanga, según lo establecido en los actos administrativos emitidos por dichas entidades, en concordancia con el P.B.O.T. de Piedecuesta, los artículos 2.2.6.1.4.5; 2.2.6.1.4.6 y 2.2.6.1.4.7 del Decreto 1077 de 2015 y demás normas aplicables.`
        let parcon_11 = parcon[6] || `Que la ELECTRIFICADORA DE SANTANDER S.A. E.S.P., expidió Oficio mediante el cual otorga la disponibilidad / factibilidad del servicio de energía.`
        let parcon_12 = parcon[7] || `Que la EMPRESA PIEDECUESTA DE SERVICIOS PÚBLICOS E.S.P., certificó el xxxxxx (xx) de xxxxxxx de dos mil veintidós (2022) que el predio con número catastral 68547-00-00-0000-0000-000 puede acceder al servicio de acueducto para xxxxxxxxxxxxxxxxxxx, por lo tanto cuenta con disponibilidad del servicio de acueducto y aseo.`
        let parcon_13 = parcon[8] || `Que el titular de la licencia presentó memoria técnica del sistema de tratamiento a implementar en la recolección de aguas servidas y disposición final de la red sanitaria para la edificación. `


        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 2</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col">
                    <textarea className='form-control' rows="8" name="expedition_doc_res_c_parcon" defaultValue={parcon_6 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 7</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 8</label>
                <div className="col">
                    <textarea className='form-control' rows="5" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 9</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_9 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 10</label>
                <div className="col">
                    <textarea className='form-control' rows="4" name="expedition_doc_res_c_parcon" defaultValue={parcon_10 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 11</label>
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_11 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 12</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_12 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 13</label>
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_13 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <div className="col">
                    <label className='fw-bold'>CONSIDERATIVA 16</label>
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                        <p>2- Impuesto de delineación y urbanismo por la suma de A.3 según recibo A.4.  </p>
                        <p>3- Estampilla PRO-UIS por la suma de A.5 según recibo A.6. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.3 Impuesto Delineación y Urbanismo (Valor Factura) </label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c3_dv} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.4 Impuesto Delineación y Urbanismo (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c4_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.5 PRO-UIS (Valor Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c5_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.6 PROS-UIS (Nr Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c6_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_SUB = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        let parcon = reso.sub ? reso.sub.split('&&') : [];

        let parcon_6 = parcon[0] || `Que para el predio rural objeto de la presente subdivisión, el titular de la licencia realiza la subdivisión según lo establecido en el artículo 45 literal b) de la Ley 160 de 1994, por lo cual los predios resultantes de la subdivisión serán destinados para uso principal xxxxxxxxxxxxx como uso compatible de acuerdo a lo establecido por Acuerdo N° 028 de 2003 PBOT.`


        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col">
                    <textarea className='form-control' rows="4" name="expedition_doc_res_c_sub" defaultValue={parcon_6 || ''} />
                </div>
            </div>



            <div className="row mb-1">
                <div className="col">
                    <label className='fw-bold'>CONSIDERATIVA 16</label>
                    <div className='row text-start'>
                        <p>1- Expensas fijas A.1 </p>
                        <p>2- Impuesto de delineación y urbanismo por la suma de A.3 según recibo A.4.  </p>
                        <p>3- Estampilla PRO-UIS por la suma de A.5 según recibo A.6. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">

                        </div>
                        <div class="form-group col">

                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_UPVIG = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? '';

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col">
                    <div className='row text-start'>
                        <p>Actos administrativos precedentes, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>

            <div className="row mt-3">
                <div className="col">
                    <label className='fw-bold'>CONSIDERATIVA 6</label>
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_UPVIG_2 = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? '';

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col">
                    <div className='row text-start'>
                        <p>Actos administrativos precedentes, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                        <p>2- Impuesto de delineación y urbanismo por la suma de A.3 según recibo A.4.  </p>
                        <p>3- Estampilla PRO-UIS por la suma de A.5 según recibo A.6. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.3 Impuesto Delineación y Urbanismo (Valor Factura) </label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c3_dv} />
                        </div>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.4 Impuesto Delineación y Urbanismo (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c4_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.5 PRO-UIS (Valor Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c5_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputZip">A.6 PROS-UIS (Nr Factura)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c6_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_NEG1 = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_c7_dv = reso.old_lic ?? 'ninguno de ellos se hizo parte.';

        return <>
            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>VR y fecha de manifiesto de desitimiento </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <input type="text" class="form-control" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_NEG5 = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_c7_dv = reso.old_lic ?? 'ninguno de ellos se hizo parte.';

        return <>
            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>VR y fecha de manifiesto de desitimiento </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <input type="text" class="form-control" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_OTHER = () => {
        return ''
    }
    let _MODEL_PRO = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_c7_dv = reso.old_lic ?? '';

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 3</label>
                <div className="col">
                    <div className='row text-start'>
                        <p>Actos administrativos precedentes, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>
        </>
    }
    let _MODEL_LICUP = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_c7_dv = reso.old_lic ?? '';

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Autorizar la Revalidación de la “(NOMBRE LICENCIA ANTERIOR XXXXXXXXXXXXX)” otorgada mediante la Resolución N0000-0-00-0000 del 00 de XXXXX de 20XX, expedida por XXXXXXXXX, otorgando con el presente acto un periodo adicional de veinticuatro (24) meses para culminar las obras aprobadas en los actos administrativos referenciados anteriormente, previo cumplimiento de lo reglamentado en el artículo 2.2.6.1.2.4.1.`


        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 2</label>
                <div className="col">
                    <div className='row text-start'>
                        <p>Actos administrativos precedentes, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>ARTICULO 1, PARRAFO 1</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                </div>
            </div>
        </>
    }
    let _MODEL_EJE = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        var _CHILD_1 = _GET_CHILD_1();
        let type = reso.type || _RES_PARSER_1(_CHILD_1);

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Que dentro del término de ejecutoria se interpuso recurso de reposición y en subsidio de apelación contra la Resolución No. ${currentRecord.id_public} del XXXX (XX) de XXXXX de XXXXXs (XXXX), la cual fue CONFIRMADA por el/la suscrita Curador(a) Urbano/a mediante la Resolución N°  ${currentRecord.id_public} del XXXX (XX) de XXXX de XXXX (XXXX), de estas actuaciones se surtió traslado a la Oficina Asesora de Planeación, la cual CONFIRMÓ la resolución en todos sus apartes mediante Resolución N° XXXX-XXXX por medio de la cual resuelve el recurso de apelación, siendo notificada el XXXX (XX) de XXXX de XXXX (XXXX) y quedando el acto administrativo de ${type} debidamente EJECUTORIADO EL XXXX (XX) DE XXXX DE XXXXX (XXXX).`


        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CUERPO</label>
                <div className="col">
                    <div className="col">
                        <textarea className='form-control' rows="6" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                    </div>
                </div>
            </div>
        </>
    }
    let _MODEL_CLEAR = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Que la mencionada solicitud fue aprobada mediante Resolución N° ${currentRecord.id_public} del XXXX (XX) de XXXXX de XXXX (XXXX) la cual quedó debidamente ejecutoriada el XXXX (XX) de XXXXX del mismo año.`
        let parcon_3 = parcon[1] || `Que el apoderado o solicitante allega petición radicada bajo el radicado VR22-XXXX del XXXXXX (XX) de XXXX de dos mil veinte XX (202X), por medio de la cual solicita “XXXXXXXX”`
        let parcon_4 = parcon[2] || `Corregir y aclarar el parágrafo x del artículo x° de la Resolución N° 0XXX del XXX (X) de marzo de dos mil veinte___ (202X), el cual quedará así: `
        let parcon_5 = parcon[3] || ``


        return <>
            <label className='fw-bold'>CONSIDERATIVA 3</label>
            <div className="col">
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                </div>
            </div>

            <div className="row my-2">
                <div className="col">
                    <label className='fw-bold'>CONSIDERATIVA 4</label>
                    <div class="row">
                        <div class="form-group col">
                            <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_3 || ''} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col">
                    <label className='fw-bold'>ARTICULO 1</label>
                    <div class="row">
                        <div class="form-group col">
                            <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_4 || ''} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="row my-2">
                <div className="col text-start">
                    <label>Correcion:</label>
                    <div class="row">
                        <div class="form-group col">
                            <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_5 || ''} />
                        </div>
                    </div>
                </div>
            </div>

        </>
    }
    let _MODEL_REV = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }


        let f2 = _GET_CHILD_2();
        let f53 = _GET_CHILD_53();

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_7 = parcon[0] || ``;
        let parcon_8 = parcon[1] || `Que por parte del inspector de policía tercero de Piedecuesta, se adelantó un proceso de infracción urbanística a los propietarios del predio antes descrito, en donde se evidencio la existencia de los dos actos administrativos correspondientes a la Licencia de construcción en la modalidad de XXXXXXXXXXXXXXXXXXX.`
        let parcon_9 = parcon[2] || `Que de acuerdo a lo anterior se pudo evidenciar que la Curaduría No X de XXXXXX en cabeza de XXXXXXXXX, expidió Licencia de Construcción en la modalidad de XXXXXXXXXXXXX, aprobada mediante la resolución No XXXXXX del XX de XXXXX de XXXX y Nota Ejecutoria No XXXXXX del XX de XXXX de XXXX.`;
        let parcon_10 = parcon[3] || `Que por evidenciarse que el precitado acto administrativo se encuentra inmerso en una(s) de las causales de revocación que trata el artículo 93 del CPACA, la suscrita curadora, de oficio, mediante la RESOLUCION xxxx DEL xx DE xxxx DE xxxx ID ${infoCud.nomen}18-0124, inició el trámite de revocatoria directa de la Resolución XXXX del XX de XXXX de XXXX, por medio de la cual se concedió un XXXXXXXXXXXXXXXXXXX para destinación XXXXX, del  predio localizado en ${f2.item_211} Municipio de ${infoCud.city}, con folio de matrícula inmobiliaria ${f2.item_22} de la Oficina de Instrumentos Públicos de ${infoCud.city}, número catastral ${f2.item_232 || f2.item_23}, otorgado a ${f53.item_5311} ${f53.item_5312} identificados con el documento de identificación Nº. ${f53.item_532}, en su calidad de ${f53.item_533}.`;
        let parcon_11 = parcon[4] || `Que el acto administrativo fue notificado a los titulares del reconocimiento, quienes presentaron escrito del día XX de XXXX de XXXX, quienes indicaron no estar de acuerdo con el proceso de Revocatoria directa. En igual sentido no se evidencia solicitud de hacerse parte, ni manifestación alguna por terceros..`;
        let parcon_12 = parcon[5] || `Que el expediente estuvo a disposición de los interesados desde el inicio del trámite y que en el mismo no se solicitaron pruebas, ni se decretaron de oficio por la suscrita, garantizándose en todo caso los derechos de audiencia y de defensa.`;

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 4</label>
                <div className="col text-start">
                    <label>Que la edificación reconocida en la resolución consta de:</label>
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_9 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 8</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_10 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 9</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_11 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 10</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_12 || ''} />
                </div>
            </div>

        </>
    }
    let _MODEL_REV0 = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_7 = parcon[0] || `Que la mencionada solicitud fue aprobada mediante Resolución N° XXX del XX de XXXX de XXXX la cual quedó debidamente ejecutoriada el XX de XXXX de XXXX.`;
        let parcon_8 = parcon[1] || ``
        let parcon_9 = parcon[2] || `Que por parte del inspector de policía tercero de Piedecuesta, se recibió oficio No XXXX-XX de fecha del XX de XXXX de XXXX, en el cual solicitaba realizar la revisión a la resolución No XXXX del XX de XXXX de XXX, expedida por la Curaduría No 1 de Piedecuesta, oficio expedido dentro del proceso abreviado de Policía con Radicado No XXXX-XX.`;
        let parcon_10 = parcon[3] || `Que en el oficio No XXXXX-XX, expedido por la Inspección de policía tercera, se puso en conocimiento a este despacho que el predio objeto del Reconocimiento de Edificación, ya había obtenido una Licencia de XXXXXXXXXXXXXXX mediante la Resolución No PXXX- XXX, expedido por la Oficina Asesora de Planeación.`;
        let parcon_11 = parcon[4] || `Que en el mismo oficio se informó que la Licencia de construcción Obra Nueva expedida por la oficina Asesora de Planeación, fue dejada sin efectos debido a la renuncia de la Licencia de los efectos de la Resolución No PXXXX-XXXX de fecha del XX de XXXX de XXX.`;

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 3</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 4</label>
                <div className="col text-start">
                    <label>Que la edificación reconocida en la resolución consta de:</label>
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_9 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_10 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 7</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_11 || ''} />
                </div>
            </div>
        </>
    }
    let _MODEL_REV2 = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        var _CHILD_1 = _GET_CHILD_1();
        let type = reso.type || _RES_PARSER_1(_CHILD_1);
        let f2 = _GET_CHILD_2();
        let f53 = _GET_CHILD_53();

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_7 = parcon[0] || `Que una vez revisada la solicitud y verificado el cumplimiento de todos los requisitos se procedió a expedir la a expedir la aprobación de ${type} mediante la Resolución No. ${currentRecord.id_public} del XX de XXXX de XXXX`;
        let parcon_8 = parcon[1] || ``
        let parcon_9 = parcon[2] || `Que por parte de la Inspección de Policía N° III de Piedecuesta se adelantó un Proceso de Infracción Urbanística a los propietarios del predio antes descrito, “por Infracción del artículo 135 de la Ley 1801 de 2016, respecto al inicio de actividades de construcción sin Licencia, ya que se están realizando actividades de XXXXXXXXXX en el sitio inspeccionado”, lo anterior de acuerdo al Oficio N° XXXX-XX del XXXX (XX) de XXXX de XXXXXX (XXXX).`;
        let parcon_10 = parcon[3] || `Que por evidenciarse que el precitado acto administrativo se encuentra inmerso en una(s) de las causales de revocación que trata el artículo 93 del CPACA, la suscrita Curadora, de oficio, mediante la Resolución ${currentRecord._id_public} del XX de XXXX de XXX ID ${currentItem.id_public}, inició el trámite de revocatoria directa de la Resolución ${infoCud.nomen}XX-XXXX del XX de XXXX de XXXX, por medio de la cual se concedió un XXXXXXXXXXX.`;
        let parcon_11 = parcon[4] || `Que el acto administrativo fue notificado por Conducta Concluyente a ${f53.item_5311} ${f53.item_5312} identificado con cédula de ciudadanía Nº. ${f53.item_532}, en su calidad de ${f53.item_533} del predio localizado en la ${f2.item_211} del Municipio de ${infoCud.city}, con folio de matrícula inmobiliaria ${f2.item_22} de la Oficina de Instrumentos Públicos de ${infoCud.city}, número catastral ${f2.item_232 || f2.item_23}, dentro del proceso de Revocatoria Directa del Acto Administrativo No ${infoCud.nomen}XX-XXXX del XXXX (XX) de XXXX de XXXXX (XXXX).`;
        let parcon_12 = parcon[5] || `Que mediante escrito recibido por este despacho el día XXXX (XX) de XXXX de XXXXX (XXXX) radicado bajo el número VRXX-XXXX, el señor(a) XXXXXXXXXXXXXXXX, manifestaron que es su intención que se revoque el acto administrativo N° ${infoCud.nomen}XX-XXXX del XX de XXXXX de XXXX, de acuerdo a la notificación efectuada.`;
        let parcon_13 = parcon[6] || `Que en el mismo oficio se informó que la Licencia de construcción Obra Nueva expedida por la oficina Asesora de Planeación, fue dejada sin efectos debido a la renuncia de la Licencia de los efectos de la Resolución No PXXXX-XXXX de fecha del XX de XXXX de XXX.`;

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 3</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 4</label>
                <div className="col text-start">
                    <label>Que la edificación reconocida en la resolución consta de:</label>
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_9 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 7</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_10 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 8</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_11 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 9</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_12 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 10</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_13 || ''} />
                </div>
            </div>


        </>
    }
    let _MODEL_UPDATE = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Que la mencionada solicitud fue aprobada mediante Resolución N° ${infoCud.nomen}XX-XXXX del XXXX (XX) de XXXXX de XXXXXX (XXXX), quedando debidamente ejecutoriada el XXXXX (XX) de XXXXX de XXXXX (XXXX).`
        let parcon_6 = parcon[1] || `Que como titular de la licencia en la parte resolutiva de la Resolución N° ${infoCud.nomen}XX-XXXX del XXXX (XX) de XXXXX de XXXXXX (XXXX) con radicado No. ${infoCud.nomen}XX-XXXX, era el señor xxxxxxx según anotación N° xxx registrada en el certificado de tradición No xxx-xxxxxx de la Oficina de Instrumentos Públicos de ${infoCud.city}.`
        let parcon_7 = parcon[2] || `Que el predio fue enajenado de forma posterior a la expedición de la Licencia al xxxxxxx, de acuerdo a la anotación N° xxx del mencionado certificado de tradición de la Oficina de Instrumentos Públicos de ${infoCud.city}.`
        let parcon_8 = parcon[3] || `Que mediante memorial con radicado VRxx-xxxx del del XXXX (XX) de XXXXX de XXXXXX, la apoderada del nuevo propietario del predio solicita se realice acto administrativo pertinente para cambio de titular de la licencia a efectos de poder protocolizar los actos notariales.`
        let parcon_9 = parcon[4] || `Actualizar el titular de la Licencia de XXXXXXX en la modalidad de XXXXXXX contenida en la Resolución N° ${infoCud.nomen}XX-XXXX del XXXX (XX) de XXXX de XXXX (XXXX) y en tal sentido se entenderá actualizado en los demás actos administrativos que hacen parte integral de la misma al igual que en los documentos legales y técnicos presentados con la solicitud urbanística.`;

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 3</label>
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 4</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_6 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col">
                    <textarea className='form-control' rows="2" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>ARTICULO 1</label>
                <div className="col text-start">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_9 || ''} />
                </div>
            </div>
        </>
    }
    let _MODEL_RES = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }
        const reso_date_dv = reso.date ?? ''

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? '';

        let _CHILD_1 = _GET_CHILD_1();
        let type = _RES_PARSER_1(_CHILD_1);

        let _CHILD_53 = _GET_CHILD_53();

        let parcon = reso.parcon ? reso.parcon.split('&&') : [];

        let parcon_2 = parcon[0] || `Que, de acuerdo a lo anterior, el equipo interdisciplinario de la Curaduría N° 1 de ${infoCud.city}, encuentra que el trámite solicitado no cumple con los requisitos para adelantar el trámite administrativo previsto en el Decreto Nacional 1077 de 2015 - XXXXXXXXXX, por cuanto que, se identificó que el inmueble objeto del reconocimiento de la edificación, en los documentos técnicos aportados ocupa parcialmente el espacio público, incumpliendo con lo establecido en el Decreto Nacional 1077 de 2015 articulo 2.2.6.2.4.1.2 “Situaciones en las que no procede el Reconocimiento de Edificaciones.”`
        let parcon_6 = parcon[1] || `Que, debido al incumplimiento de los requisitos, se expidió la resolución No. ${sexto_c1_dv || 'XXXX'} del ${dateParser(reso_date_dv) || 'XX de XXXX de XXXX'}, “Por la cual se Niega una solicitud de ${type}” acto administrativo notificado a la solicitante el día XXXX (XX) de XXXX de XXXX.`
        let parcon_7 = parcon[2] || `Que el día xx (xx) de xxxx de xxxx, el señor ${_CHILD_53.item_5311} ${_CHILD_53.item_5312}, identificado con la cédula de ciudadanía No. ${_CHILD_53.item_532} radicó ante la Curaduría Urbana No. ${infoCud.nomens} de ${infoCud.city}-, recurso de reposición y en subsidio de apelación en contra de la precitada RESOLUCIÓN No. xxx del xxxx (xx) de xxxx de xxxx.`
        let parcon_8 = parcon[3] || `Ahora bien, se tiene que el mismo fue presentado personalmente por XXXXXXXXXXX  identificado con la cédula de ciudadanía XXXXXXXXX, sin manifestar en calidad de que actúa, sin embargo se encuentra que dentro de los documentos anexos que acompañan el recurso de reposición y en subsidio el del apelación no existe poder otorgado por los propietarios, que lo faculte para representarlos e interponer los precitados recursos en su nombre, encontrando únicamente dentro del expediente del trámite de XXXXXXXXXXXXX, poder para realizar el trámite de licencia, sin que dicho poder le faculte para interponer recursos. Así mismo XXXXXXXX identificado con la cédula de ciudadanía XXXXXXXXX no es abogado en ejercicio, y tan solo los abogados en ejercicio podrán ser apoderados.`



        return <>
            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>Documentos aportados, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 5</label>
                <div className="col">
                    <textarea className='form-control' rows="4" name="expedition_doc_res_c_parcon" defaultValue={parcon_2 || ''} />
                </div>
            </div>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 6</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_6 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 7</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_7 || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <label className='fw-bold'>REQUISITOS DE PROCEDIBILIDAD DEL RECURSO DE REPOSICIÓN y APELACIÓN.</label>
                <div className="col">
                    <textarea className='form-control' rows="3" name="expedition_doc_res_c_parcon" defaultValue={parcon_8 || ''} />
                </div>
            </div>
        </>
    }
    let _MODEL_COTA = () => {
        var taxes = _GET_EXPEDITION_JSON('taxes');
        var reso = _GET_EXPEDITION_JSON('reso');
        let _areas = _GET_CHILD_AREAS();
        let taxChargeDelineacion = 0;
        for (var i = 0; i < _areas.length; i++) {
            if (_areas[i].payment == 1 || _areas[i].payment == 2) {
                taxChargeDelineacion += _areas[i].charge;
            }
        }

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []
        const sexto_c1_dv = currentItem.id_payment || sexto_v[0] || '';
        const sexto_c2_dv = sexto_v[1] ?? '';
        const sexto_c3_dv = sexto_v[2] ?? '';
        const sexto_c4_dv = sexto_v[3] ?? '';
        const sexto_c5_dv = sexto_v[4] ?? '';
        const sexto_c6_dv = sexto_v[5] ?? '';

        const sexto_c7_dv = reso.old_lic ?? '';

        return <>
            <div className="row mb-1">
                <label className='fw-bold'>CONSIDERATIVA 4</label>
                <div className="col">
                    <div className='row text-start'>
                        <p>Actos administrativos precedentes, separados por punto y coma ( ; ) </p>
                    </div>
                    <textarea className='form-control' rows="4" id="expedition_doc_res_old_lic" defaultValue={sexto_c7_dv || ''} />
                </div>
            </div>

            <div className="row mb-1">
                <div className="col">
                    <div className='row text-start'>
                        <p>1- Expensas fijas y variables mediante las facturas A.1 y A.2. </p>
                    </div>
                    <div class="row">
                        <div class="form-group col">
                            <label for="inputCity">A.1 Factura Fija (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c1_dv} />
                        </div>
                        <div class="form-group col">
                            <label for="inputState">A.2 Factura Variable (Nr Factura y Fecha)</label>
                            <input type="text" class="form-control" name="expedition_doc_res_sexto_v" defaultValue={sexto_c2_dv} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    }
    // ******************************* JSX ***************************** // 
    let _COMPONENT_DOC_RES = () => {
        var model = currentRecord.model || 'open';
        let canSave = (window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5 || window.user.roleId == 2) || _GLOBAL_ID == 'cb1';
        function getModel(model) {
            if (model == 'open') return _MODEL_OPEN();
            if (model == 'neg') return _MODEL_NEG();
            if (model == 'des') return _MODEL_DES();
            if (model == 'onn' || model == 'rec' || model == 'demon' || model == 'rdm') return _MODEL_ONN();
            if (model == 'reccon') return _MODEL_RECCON();
            if (model == 'parcon' || model == 'par') return _MODEL_PARCON();
            if (model == 'sub') return _MODEL_SUB();
            if (model == 'ons') return _MODEL_ONS();
            if (model == 'upvigon') return _MODEL_UPVIG();
            if (model == 'upvigam') return _MODEL_UPVIG_2();
            if (model == 'neg1') return _MODEL_NEG1();
            if (model == 'neg5') return _MODEL_NEG5();
            if (model == 'pro') return _MODEL_PRO();
            if (model == 'licup') return _MODEL_LICUP();
            if (model == 'eje') return _MODEL_EJE();
            if (model == 'clear') return _MODEL_CLEAR();
            if (model == 'rev') return _MODEL_REV();
            if (model == 'rev0') return _MODEL_REV0();
            if (model == 'rev2') return _MODEL_REV2();
            if (model == 'update') return _MODEL_UPDATE();
            if (model == 'res') return _MODEL_RES();
            if (model == 'cota') return _MODEL_COTA();
            return _MODEL_OTHER();

        }

        function getOptions(model) {
            let defaultOp = <>
                {_GLOBAL_ID == 'cb1' ? <option>OTORGADA</option> : ''}
                {_GLOBAL_ID == 'cp1' ? <option>OTORGADA</option> : ''}
                <option>RECURSO</option>
                <option>REVOCATORIA DIRECTA</option>
                <option>SILENCIO ADMINISTRATIVO</option>
                <option>ACLARACIONES Y CORRECCIONES</option>
                <option>INTERNO</option>
                <option>OTRO</option>
            </>;
            let desOp = <option>DESISTIDA</option>;
            let negOp = <option>NEGADA</option>;
            let clearOp = <option>ACLARA</option>;
            let revOp = <option>DECIDE</option>;
            let rev0Op = <option>INICIA</option>;
            let rev1Op = <option>RESUELVE</option>;

            if (model == 'open') return defaultOp;
            if (model == 'neg' || model == 'neg1' || model == 'neg2' || model == 'neg3' || model == 'neg4' || model == 'neg5') return desOp;
            if (model == 'des') return desOp;
            if (model == 'clear') return clearOp;
            if (model == 'rev') return revOp;
            if (model == 'rev0') return rev0Op;
            if (model == 'rev1') return rev1Op;
            if (model == 'rev2') return rev1Op;
            if (model == 'res') return rev1Op;
            return defaultOp;

        }


        var reso = _GET_EXPEDITION_JSON('reso');
        var _CHILD_1 = _GET_CHILD_1();
        let type = reso.type || _RES_PARSER_1(_CHILD_1);

        const reso_date_dv = reso.date ?? ''
        const reso_state_dv = reso.state ?? '';
        const reso_pot_dv = reso.pot ?? infoCud.pot;

        return <>
            <div className="row">
                <div className="col">
                    <label className="mt-2">Modalidad</label>
                    <input type="text" class="form-control" id="expedition_doc_res_1"
                        defaultValue={type} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <label className="mt-1">Fecha</label>
                    <div class="input-group">
                        <input type="date" class="form-control" id="expedition_doc_res_2"
                            defaultValue={reso_date_dv} required />
                    </div>
                </div>
                <div className="col-3">
                    <label className="mt-1">Consecutivo</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_id"
                            defaultValue={currentRecord.id_public} />
                        <button type="button" class="btn btn-info shadow-none" onClick={() => _GET_LAST_ID_RES('expedition_doc_res_id')}>GENERAR</button>
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">POT</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_pot" required
                            defaultValue={reso_pot_dv} />
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1">Estado</label>
                    <div class="input-group">
                        <select className="form-select" id="expedition_doc_res_state" defaultValue={reso_state_dv} required>
                            {getOptions(model)}
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label className="mt-1"># Radicacion</label>
                    <div class="input-group">
                        <input type="text" class="form-control" id="expedition_doc_res_3" disabled
                            value={currentItem.id_public} readOnly />
                    </div>
                </div>
            </div>

            <hr />
            {getModel(model)}
            {canSave ?
                <div className="row text-center">
                    <div className="col">
                        <button className="btn btn-success my-3"><i class="far fa-share-square"></i> GUARDAR CAMBIOS </button>
                    </div>
                </div>
                : ''}

        </>


    }
    let _COMPONENT_DOC_RES_PDF = () => {
        var reso = _GET_EXPEDITION_JSON('reso');
        let canGenPDF = true; // window.user.id == 1 || window.user.roleId == 3 || window.user.roleId == 5;
        const reso_header_text = reso.header_text ?? '';

        if (canGenPDF) return <>
            <hr />
            <div className="row my-3 text-center">
                <label className='fw-bold my-2'>GENERAR PDFS</label>
            </div>
            <div className="row mb-2">

                {_NOTY_TYPE_COMPONENENT()}

                <div className="col">
                    <label>Alineción firma curador</label>
                    <div class="input-group my-1">
                        <select class="form-select me-1" id={"exp_pdf_reso_1"}>
                            <option value={'center'}>CENTRO</option>
                            <option value={'left'}>IZQUIERDA</option>
                            <option value={'right'}>DERECHA</option>
                        </select>
                    </div>
                </div>

                <div className="col">
                    <label>Vigencia</label>
                    <div class="input-group my-1">
                        <select class="form-select" id="exp_pdf_reso_record_version" defaultValue={reso.eje || 0}>
                            <option value={0}>NO USAR EJECUTORIA Y FECHA</option>
                            <option value={1}>NO USAR FECHA</option>
                            <option>DOCE (12) MESES</option>
                            <option>VEINTE Y CUATRO (24) MESES</option>
                            <option>TREINTA Y SEIS (36) MESES</option>
                            <option>CUARENTA Y OCHO (48) MESES</option>
                        </select>
                    </div>
                </div>
                <div className="col">
                    <label>Logo</label>
                    <div class="input-group my-1">
                        <select class="form-select me-1" id={"exp_pdf_reso_logo"}>
                            <option value={'no'}>SIN LOGO</option>
                            <option value={'left'}>IZQUIERDA</option>
                            <option value={'left2'}>IZQUIERDA ENTRESALTO</option>
                            <option value={'right'}>DERECHA</option>
                            <option value={'right2'}>DERECHA ENTRESALTO</option>

                        </select>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-4">
                    <label className="mt-2">Texto de cabezera</label>
                    <input class="form-control" id="expedition_doc_header_text" defaultValue={reso_header_text} />
                </div>
            </div>
            <div className="row m-3">
                <div className="col d-flex justify-content-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="record_rew_simple" />
                        <label class="form-check-label">Usar nombre revisor</label>
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="record_rew_signs" />
                        <label class="form-check-label">Usar firma profesionales</label>
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="record_rew_pagesi" />
                        <label class="form-check-label">Usar pie de pagina</label>
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="record_rew_pagesn" defaultChecked="true" />
                        <label class="form-check-label">Usar paginación</label>
                    </div>
                </div>

            </div>
            <div className="row m-3">
                <div className="col d-flex justify-content-center">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="record_rew_pagesx" defaultChecked={false} />
                        <label class="form-check-label">Paginacion Arriba</label>
                    </div>
                </div>
            </div>


            <div className="row mb-2 text-center">

                <div className="col ">
                    <div class="input-group-sm my-1">
                        <label class="form-check-label">Margen Superior (cm)</label>
                        <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_top" defaultValue={2.5} />
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="input-group-sm my-1">
                        <label class="form-check-label">Margen Inferior (cm)</label>
                        <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_bot" defaultValue={2.5} />
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="input-group-sm my-1">
                        <label class="form-check-label">Margen Izquierdo (cm)</label>
                        <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_left" defaultValue={1.7} />
                    </div>
                </div>

                <div className="col d-flex justify-content-center">
                    <div class="input-group-sm my-1">
                        <label class="form-check-label">Margen Derecho (cm)</label>
                        <input type="number" min={0} step={0.01} class="form-control-sm" id="record_maring_right" defaultValue={1.7} />
                    </div>
                </div>
                {process.env.REACT_APP_GLOBAL_ID == 'cb1' ? (
                <>
                    <div className="col d-flex justify-content-center">
                    <div className="input-group-sm my-1">
                        <label className="form-check-label">Saltos entre párrafos</label>
                        <input
                        type="number"
                        min={1}
                        step={1}
                        className="form-control-sm"
                        id="record_page_step"
                        defaultValue={1}
                        />
                    </div>
                    </div>
                    <div className="col d-flex justify-content-center">
                    <div className="input-group-sm my-1">
                        <label className="form-check-label">Espaciado encabezado</label>
                        <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="form-control-sm"
                        id="record_header_spacing"
                        defaultValue={6}
                        />
                    </div>
                    </div>
                </>
                ) : null}
            </div>
            <div className="row text-center">
                <div className="col d-flex justify-content-center">
                    <div className="d-flex gap-3"> {/* Espaciado entre botones */}
                    <MDBBtn className="btn btn-danger my-3" onClick={() => pdf_gen_res()}>
                        <i className="far fa-file-pdf"></i> GENERAR PDF
                    </MDBBtn>
                    {process.env.REACT_APP_GLOBAL_ID == 'cb1' && (
                    <MDBBtn className="btn btn-secondary my-3" onClick={() => pdf_gen_res(true)}>
                        <i className="fas fa-edit"></i> EDITAR PDF
                    </MDBBtn>
                    )}
                    </div>
                </div>
            </div>
        </>
        else return ''
    }
    let _MODEL_SELECTOR = () => {
        var default_model = currentRecord.model || 'open';

        let models = [
            { value: 'open', label: 'MODELO DE RESOLUCION ABIERTO' },
            { value: 'des', label: 'MODELO DE RESOLUCION DESISTIDA' },
            { value: 'neg', label: 'MODELO DE RESOLUCION NEGADA' },
        ];

        if (_GLOBAL_ID == 'cb1') {

        }
        if (_GLOBAL_ID == 'cp1') {
            models.push({
                group: 'RESOLUCIONES', items: [
                    { value: 'onn', label: 'OBRA NUEVA SIN SUPERVISIÓN' },
                    { value: 'ons', label: 'OBRA NUEVA CON SUPERVISIÓN' },
                    { value: 'demon', label: 'OBRA NUEVA Y DEMOLICIÓN SIN SUPERVICIÓN' }
                ]
            });

            models.push({
                group: 'ACTOS DE RECONOCIMIENTO', items: [
                    { value: 'rec', label: 'ACTO DE RECONOCIMIENTO CON LICENCIA DE CONSTRUCCIÓN' },
                    { value: 'reccon', label: 'ACTO DE RECONOCIMIENTO SIMPLE Y SIN VIGENCIA' },
                    { value: 'rdm', label: 'ACTO DE RECONOCIMIENTO, DEMOLICIÓN PARCIAL Y MODIFICACIÓN - SIN SUPERVICIÓN' }
                ]
            });

            models.push({
                group: 'LICENCIAS', items: [
                    { value: 'parcon', label: 'LICENCIA PARCELACIÓN Y CONSTRUCCIÓN' },
                    { value: 'par', label: 'LICENCIA PARCELACIÓN' },
                    { value: 'sub', label: 'LICENCIA DE SUBDIVISION' }
                ]
            });

            models.push({
                group: 'MODIFICACIÓN DE LICENCIA VIGENTE', items: [
                    { value: 'upvigon', label: 'MODIFICACIÓN DE LICENCIA VIGENTE MODALIDAD OBRA NUEVA' },
                    { value: 'upvigam', label: 'MODIFICACIÓN DE LICENCIA VIGENTE MODALIDAD AMPLICACIÓN' },
                ]
            });

            models.push({
                group: 'DESESTIMIENTOS', items: [
                    { value: 'neg1', label: 'DESESTIMIENTO POR LYDF' },
                    { value: 'neg3', label: 'DESESTIMIENTO ACTA DE OBSERVACIONES' },
                    { value: 'neg4', label: 'DESESTIMIENTO POR NO PAGO' },
                    { value: 'neg5', label: 'DESESTIMIENTO VOLUNTARIO' },
                ]
            });

            models.push({
                group: 'OTROS', items: [
                    { value: 'pro', label: 'PRORROGA DE LICENCIA' },
                    { value: 'licup', label: 'REVALIDACIÓN DE LICENCIA' },
                    { value: 'eje', label: 'EJECUTORIA' },
                    { value: 'clear', label: 'ACLARACIÓN DE RESOLUCIÓN' },
                    { value: 'rev0', label: 'INICIO REVOCATORIA' },
                    { value: 'rev', label: 'REVOCATORIA' },
                    { value: 'rev2', label: 'DECIDE REVOCATORIA' },
                    { value: 'update', label: 'ACTUALIZACIÓN DE TITULAR DE LA LICENCIA' },
                    { value: 'res', label: 'DECIDE RECURSO DE REPOSICIÓN' },
                    { value: 'cota', label: 'ACTO DE AJUSTE DE COTAS' },
                ]
            });
        }

        return <>
            <div className="row">
                <div className="col">
                    <label className="mt-2">MODELO DE RESOLUCIÓN</label>
                    <div class="input-group">
                        <select className="form-select" id="expedition_doc_res_model" defaultValue={default_model} onChange={(e) => update_model(e.target.value)}>
                            {models.map(model => {
                                if (model.omit) return ''
                                if (model.group)
                                    return <optgroup label={model.group}>
                                        {model.items.map(m => <option value={m.value}>{m.label}</option>)}
                                    </optgroup>
                                else return <option value={model.value}>{model.label}</option>
                            })}
                        </select>
                    </div>
                </div>
            </div>
        </>
    }
    // ******************************* APIS **************************** // 
    var formData = new FormData();
    let pdf_gen_res = (editDocument = null) => {
        formData = new FormData();

        formData.set('type_not', document.getElementById("type_not").value);

        let date_payment = _GET_CLOCK_STATE(3).date_start || '';
        let r_simple = document.getElementById("record_rew_simple").checked;
        formData.set('r_simple', r_simple);
        let rew_name = String(window.user.role_short + ' ' + window.user.name_full).toUpperCase();
        formData.set('r_simple_name', rew_name);
        let r_signs = document.getElementById("record_rew_signs").checked;
        formData.set('r_signs', r_signs);
        formData.set('r_pagesi', document.getElementById("record_rew_pagesi").checked);
        formData.set('r_pagesn', document.getElementById("record_rew_pagesn").checked);
        formData.set('r_pagesx', document.getElementById("record_rew_pagesx").checked);
        formData.set('logo', document.getElementById('exp_pdf_reso_logo').value);
        formData.set('model', document.getElementById('expedition_doc_res_model').value);
        formData.set('header_text', document.getElementById('expedition_doc_header_text').value);

        formData.set('m_top', document.getElementById("record_maring_top").value ? document.getElementById("record_maring_top").value : 2.5);
        formData.set('m_bot', document.getElementById("record_maring_bot").value ? document.getElementById("record_maring_bot").value : 2.5);
        formData.set('m_left', document.getElementById('record_maring_left').value ? document.getElementById("record_maring_left").value : 1.7);
        formData.set('m_right', document.getElementById('record_maring_right').value ? document.getElementById("record_maring_right").value : 1.7);
        formData.set('r_pages', document.getElementById('record_page_step') ? document.getElementById("record_page_step").value : 1);
        const spacingInput = document.getElementById("record_header_spacing");
        formData.set(
        "record_header_spacing",
        spacingInput && spacingInput.value ? spacingInput.value : 6
        );

        formData.set('date_payment', date_payment);
        formData.set('tipo', document.getElementById('expedition_doc_res_1').value);
        formData.set('reso_date', document.getElementById('expedition_doc_res_2').value);
        formData.set('reso_id', document.getElementById('expedition_doc_res_id').value);
        formData.set('id_public', document.getElementById('expedition_doc_res_3').value);
        formData.set('reso_pot', document.getElementById('expedition_doc_res_pot').value);
        formData.set('reso_state', document.getElementById('expedition_doc_res_state').value);
        formData.set('special_rule_1', infoCud.res_extras.art1p);

        if (document.getElementById('expedition_doc_res_old_lic')) formData.set('old_lic', document.getElementById('expedition_doc_res_old_lic').value);
        if (document.getElementById('expedition_doc_res_primero')) formData.set('primero', document.getElementById('expedition_doc_res_primero').value);
        if (document.getElementById('expedition_doc_res_primero_1')) formData.set('pimero_1', document.getElementById('expedition_doc_res_primero_1').value);
        if (document.getElementById('expedition_doc_res_primero_2')) formData.set('pimero_2', document.getElementById('expedition_doc_res_primero_2').value);
        if (document.getElementById('expedition_doc_res_primero_3')) formData.set('pimero_3', document.getElementById('expedition_doc_res_primero_3').value);
        if (document.getElementById('expedition_doc_res_primero_4')) formData.set('pimero_4', document.getElementById('expedition_doc_res_primero_4').value);
        if (document.getElementById('expedition_doc_res_primero_5')) formData.set('pimero_5', document.getElementById('expedition_doc_res_primero_5').value);
        if (document.getElementById('expedition_doc_res_primero_6')) formData.set('pimero_6', document.getElementById('expedition_doc_res_primero_6').value);
        if (document.getElementById('expedition_doc_res_primero_7')) formData.set('pimero_7', document.getElementById('expedition_doc_res_primero_7').value);
        if (document.getElementById('expedition_doc_res_primero_8')) formData.set('pimero_8', document.getElementById('expedition_doc_res_primero_8').value);
        if (document.getElementById('expedition_doc_res_negative_id')) formData.set('negative_id', document.getElementById('expedition_doc_res_negative_id').value);
        if (document.getElementById('expedition_doc_res_negative_user')) formData.set('negative_user', document.getElementById('expedition_doc_res_negative_user').value);

        if (document.getElementById('expedition_doc_res_segundo_1')) formData.set('segundo_1', document.getElementById('expedition_doc_res_segundo_1').value);
        if (document.getElementById('expedition_doc_res_segundo_2')) formData.set('segundo_2', document.getElementById('expedition_doc_res_segundo_2').value);
        if (document.getElementById('expedition_doc_res_segundo_a')) formData.set('segundo_a', document.getElementById('expedition_doc_res_segundo_a').value);

        if (document.getElementById('expedition_doc_res_tercero_1')) formData.set('tercero_1', document.getElementById('expedition_doc_res_tercero_1').value);
        if (document.getElementById('expedition_doc_res_tercero_2')) formData.set('tercero_2', document.getElementById('expedition_doc_res_tercero_2').value);
        if (document.getElementById('expedition_doc_res_tercero_3')) formData.set('tercero_3', document.getElementById('expedition_doc_res_tercero_3').value);

        if (document.getElementById('expedition_doc_res_quinto')) formData.set('quinto', document.getElementById('expedition_doc_res_quinto').value);
        if (document.getElementById('expedition_doc_res_cuarto_1')) formData.set('cuarto_1', document.getElementById('expedition_doc_res_cuarto_1').value);
        if (document.getElementById('expedition_doc_res_cuarto_cb')) formData.set('cuarto_cb', document.getElementById('expedition_doc_res_cuarto_cb').checked ? true : false);

        if (document.getElementById('expedition_doc_res_sexto_b')) formData.set('sexto_b', document.getElementById('expedition_doc_res_sexto_b').value);

        if (document.getElementById('expedition_doc_res_duty_2')) formData.set('duty_2', document.getElementById('expedition_doc_res_duty_2').value);
        if (document.getElementById('expedition_doc_res_duty_6')) formData.set('duty_6', document.getElementById('expedition_doc_res_duty_6').value);
        if (document.getElementById('expedition_doc_res_duty_9')) formData.set('duty_9', document.getElementById('expedition_doc_res_duty_9').value);
        if (document.getElementById('expedition_doc_res_duty_10')) formData.set('duty_10', document.getElementById('expedition_doc_res_duty_10').value);
        if (document.getElementById('expedition_doc_res_duty_17')) formData.set('duty_17', document.getElementById('expedition_doc_res_duty_17').value);
        if (document.getElementById('expedition_doc_res_duty_18')) formData.set('duty_18', document.getElementById('expedition_doc_res_duty_18').value);
        if (document.getElementById('expedition_doc_res_duty_19')) formData.set('duty_19', document.getElementById('expedition_doc_res_duty_19').value);
        if (document.getElementById('expedition_doc_res_duty_20')) formData.set('duty_20', document.getElementById('expedition_doc_res_duty_20').value);
        if (document.getElementById('expedition_doc_res_duty_21')) formData.set('duty_21', document.getElementById('expedition_doc_res_duty_21').value);


        if (document.getElementById('expedition_doc_res_art_1p')) formData.set('art_1p', document.getElementById('expedition_doc_res_art_1p').value);
        if (document.getElementById('expedition_doc_res_art_1_text')) formData.set('art_1_txt', document.getElementById('expedition_doc_res_art_1_text').value);
        if (document.getElementById('expedition_doc_res_art_1_cb_tb')) formData.set('art_1_cb_tb', document.getElementById('expedition_doc_res_art_1_cb_tb').checked ? true : false);
        if (document.getElementById('expedition_doc_res_art_1_text_tb')) formData.set('art_1_txt_tb', document.getElementById('expedition_doc_res_art_1_text_tb').value);

        if (document.getElementById('expedition_doc_res_art_4_1_dv')) formData.set('art_4_1', document.getElementById('expedition_doc_res_art_4_1_dv').value);
        if (document.getElementById('expedition_doc_res_art_4_2_dv')) formData.set('art_4_2', document.getElementById('expedition_doc_res_art_4_2_dv').value);
        if (document.getElementById('expedition_doc_res_art_4_p')) formData.set('art_4_p', document.getElementById('expedition_doc_res_art_4_p').value);

        if (document.getElementById('expedition_doc_res_art_5')) formData.set('art_5', document.getElementById('expedition_doc_res_art_5').value);
        if (document.getElementById('expedition_doc_res_art_7')) formData.set('art_7', document.getElementById('expedition_doc_res_art_7').value);
        if (document.getElementById('expedition_doc_res_art_8')) formData.set('art_8', document.getElementById('expedition_doc_res_art_8').value);
        if (document.getElementById('expedition_doc_res_art_8p')) formData.set('art_8p', document.getElementById('expedition_doc_res_art_8p').value);
        if (document.getElementById('expedition_doc_res_art_8p1')) formData.set('art_8p1', document.getElementById('expedition_doc_res_art_8p1').value);
        if (document.getElementById('expedition_doc_res_art_9')) formData.set('art_9', document.getElementById('expedition_doc_res_art_9').value);

        if (document.getElementById('expedition_doc_res_open_1')) formData.set('open_1', document.getElementById('expedition_doc_res_open_1').value);
        if (document.getElementById('expedition_doc_res_open_2')) formData.set('open_2', document.getElementById('expedition_doc_res_open_2').value);
        if (document.getElementById('expedition_doc_res_open_3')) formData.set('open_3', document.getElementById('expedition_doc_res_open_3').value);

        let values = []
        let values_html = document.getElementsByName('expedition_doc_res_sexto_v');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }

        formData.set('sexto_v', values.join(';'));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_segundo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('segundo_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_tercero_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('tercero_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_sexto_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('sexto_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_sexto_v_cb');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            if (element.checked == true) values.push(1)
            else values.push(0)
        }
        formData.set('sexto_v_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_duty_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('duty_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_art_1_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('art_1_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_arts_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('arts_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_septimo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('septimo_cb', values.join(','));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_c_parcon');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }
        formData.set('parcon', values.join('&&'));

        values = []
        values_html = document.getElementsByName('expedition_doc_res_c_sub');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.value)
        }
        formData.set('sub', values.join('&&'));

        values = []
        values_html = document.getElementsByName('expedition_doc_reso_open_cb');
        for (let i = 0; i < values_html.length; i++) {
            const html = values_html[i];
            values.push(html.checked)
        }
        formData.set('open_cb', values.join(','));

        formData.set('r_sign_align', document.getElementById('exp_pdf_reso_1').value);
        formData.set('curaduria', infoCud.job);
        formData.set('ciudad', infoCud.city);
        formData.set('record_version', 1);
        formData.set('record_eje', document.getElementById('exp_pdf_reso_record_version').value);
        formData.set('id', currentItem.id);

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EXPEDITION_SERVICE.gen_doc_res(formData)
            .then(response => {
                // console.log(response.data);
                if (response.data.status  === 'OK') {
                    if (editDocument) {
                        // console.log(response.data);
                        setResDocData(response.data); 
                        MySwal.close();
                    }
                    else{
                        MySwal.close();
                        window.open(process.env.REACT_APP_API_URL + "/pdf/expdocres/" + "Resolucion " + currentItem.id_public + ".pdf");
                    }
                } else {
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
    let save_exp_res = (e) => {
        e.preventDefault();

        var _CHILD_1 = _GET_CHILD_1();

        let id_public = document.getElementById("expedition_doc_res_id").value;
        formData.set('id_public', id_public);
        if (currentRecord.id_public) formData.set('prev_id_public', currentRecord.id_public);

        let reso = _GET_EXPEDITION_JSON('reso');

        reso.type = document.getElementById('expedition_doc_res_1').value;
        reso.date = document.getElementById("expedition_doc_res_2").value;
        reso.state = document.getElementById("expedition_doc_res_state").value;
        reso.pot = document.getElementById("expedition_doc_res_pot").value;
        reso.eje = document.getElementById('exp_pdf_reso_record_version').value;
        reso.header_text = document.getElementById('expedition_doc_header_text').value;

        reso.primero = document.getElementById("expedition_doc_res_primero") ? document.getElementById("expedition_doc_res_primero").value : '';
        reso.primero_1 = document.getElementById("expedition_doc_res_primero_1") ? document.getElementById("expedition_doc_res_primero_1").value : '';
        reso.primero_2 = document.getElementById("expedition_doc_res_primero_2") ? document.getElementById("expedition_doc_res_primero_2").value : '';
        reso.primero_3 = document.getElementById("expedition_doc_res_negative_id") ? document.getElementById("expedition_doc_res_negative_id").value : '';
        reso.primero_4 = document.getElementById("expedition_doc_res_negative_user") ? document.getElementById("expedition_doc_res_negative_user").value : '';
        reso.primero_5 = document.getElementById("expedition_doc_res_primero_5") ? document.getElementById("expedition_doc_res_primero_5").value : '';


        reso.segundo_1 = document.getElementById("expedition_doc_res_segundo_1") ? document.getElementById("expedition_doc_res_segundo_1").value : '';
        reso.segundo_2 = document.getElementById("expedition_doc_res_segundo_2") ? document.getElementById("expedition_doc_res_segundo_2").value : '';

        let checks = [];
        let checks_html;

        if (_CHILD_1.tipo.includes('F')) {
            reso.tercero_1 = document.getElementById("expedition_doc_res_tercero_1") ? document.getElementById("expedition_doc_res_tercero_1").value : '';
            reso.tercero_2 = document.getElementById("expedition_doc_res_tercero_2") ? document.getElementById("expedition_doc_res_tercero_2").value : '';

            checks = [];
            checks_html = document.getElementsByName('expedition_doc_res_tercero_cb');
            for (let i = 0; i < checks_html.length; i++) {
                const element = checks_html[i];
                if (element.checked == true) checks.push(1)
                else checks.push(0)
            }
            reso.tercero_cb = checks.join(',');
        }

        reso.quinto = document.getElementById("expedition_doc_res_quinto") ? document.getElementById("expedition_doc_res_quinto").checked ? 1 : 0 : 0;
        reso.cuarto_1 = document.getElementById("expedition_doc_res_cuarto_1") ? document.getElementById("expedition_doc_res_cuarto_1").value : '';
        reso.cuarto_cb = document.getElementById("expedition_doc_res_cuarto_cb") ? document.getElementById("expedition_doc_res_cuarto_cb").checked ? 1 : 0 : 0;


        reso.sexto_b = document.getElementById("expedition_doc_res_sexto_b") ? document.getElementById("expedition_doc_res_sexto_b").value : '';


        let values = [];
        let values_html = document.getElementsByName('expedition_doc_res_segundo_cb');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            if (element.checked == true) values.push(1)
            else values.push(0)
        }
        reso.segundo_cb = values.join(';');
        reso.segundo_a =  document.getElementsByName('expedition_doc_res_segundo_a').value;


        values = [];
        values_html = document.getElementsByName('expedition_doc_res_sexto_v');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.sexto_v = values.join(';');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_sexto_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }
        reso.sexto_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_sexto_v_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }
        reso.sexto_v_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_duty_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }

        reso.duty_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_art_1_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }

        reso.art_1_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_arts_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }

        reso.arts_cb = checks.join(',');

        checks = [];
        checks_html = document.getElementsByName('expedition_doc_res_septimo_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }

        values = [];
        values_html = document.getElementsByName('expedition_doc_res_c_parcon');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.parcon = values.join('&&');

        values = [];
        values_html = document.getElementsByName('expedition_doc_res_c_sub');
        for (let i = 0; i < values_html.length; i++) {
            const element = values_html[i];
            values.push(element.value)
        }
        reso.sub = values.join('&&');

        reso.septimo_cb = checks.join(',');

        reso.old_lic = document.getElementById("expedition_doc_res_old_lic") ? document.getElementById("expedition_doc_res_old_lic").value : '';

        reso.duty_2 = document.getElementById("expedition_doc_res_duty_2") ? document.getElementById("expedition_doc_res_duty_2").value : '';
        reso.duty_6 = document.getElementById("expedition_doc_res_duty_6") ? document.getElementById("expedition_doc_res_duty_6").value : '';
        reso.duty_9 = document.getElementById("expedition_doc_res_duty_9") ? document.getElementById("expedition_doc_res_duty_9").value : '';
        reso.duty_10 = document.getElementById("expedition_doc_res_duty_10") ? document.getElementById("expedition_doc_res_duty_10").value : '';
        reso.duty_17 = document.getElementById("expedition_doc_res_duty_17") ? document.getElementById("expedition_doc_res_duty_17").value : '';
        reso.duty_18 = document.getElementById("expedition_doc_res_duty_18") ? document.getElementById("expedition_doc_res_duty_18").value : '';
        reso.duty_19 = document.getElementById("expedition_doc_res_duty_19") ? document.getElementById("expedition_doc_res_duty_19").value : '';
        reso.duty_20 = document.getElementById("expedition_doc_res_duty_20") ? document.getElementById("expedition_doc_res_duty_20").value : '';
        reso.duty_21 = document.getElementById("expedition_doc_res_duty_21") ? document.getElementById("expedition_doc_res_duty_21").value : '';

        reso.art_1_txt = document.getElementById("expedition_doc_res_art_1_text") ? document.getElementById("expedition_doc_res_art_1_text").value : '';
        reso.art_1_cb_tb = document.getElementById("expedition_doc_res_art_1_cb_tb") ? document.getElementById("expedition_doc_res_art_1_cb_tb").checked ? 1 : 0 : 0;
        reso.art_1_txt_tb = document.getElementById("expedition_doc_res_art_1_text_tb") ? document.getElementById("expedition_doc_res_art_1_text_tb").value : '';

        reso.art_4_1 = document.getElementById("expedition_doc_res_art_4_1_dv") ? document.getElementById("expedition_doc_res_art_4_1_dv").value : '';
        reso.art_4_2 = document.getElementById("expedition_doc_res_art_4_2_dv") ? document.getElementById("expedition_doc_res_art_4_2_dv").value : '';
        reso.art_4_p = document.getElementById('expedition_doc_res_art_4_p') ? document.getElementById('expedition_doc_res_art_4_p').value : '';

        reso.art_1p = document.getElementById("expedition_doc_res_art_1p") ? document.getElementById("expedition_doc_res_art_1p").value : '';
        reso.art_5 = document.getElementById("expedition_doc_res_art_5") ? document.getElementById("expedition_doc_res_art_5").value : '';
        reso.art_7 = document.getElementById("expedition_doc_res_art_7") ? document.getElementById("expedition_doc_res_art_7").value : '';
        reso.art_8 = document.getElementById("expedition_doc_res_art_8") ? document.getElementById("expedition_doc_res_art_8").value : '';
        reso.art_8p = document.getElementById("expedition_doc_res_art_8p") ? document.getElementById("expedition_doc_res_art_8p").value : '';
        reso.art_8p1 = document.getElementById("expedition_doc_res_art_8p1") ? document.getElementById("expedition_doc_res_art_8p1").value : '';
        reso.art_9 = document.getElementById("expedition_doc_res_art_9") ? document.getElementById("expedition_doc_res_art_9").value : '';

        reso.open_1 = document.getElementById("expedition_doc_res_open_1") ? document.getElementById("expedition_doc_res_open_1").value : '';
        reso.open_2 = document.getElementById("expedition_doc_res_open_2") ? document.getElementById("expedition_doc_res_open_2").value : '';
        reso.open_3 = document.getElementById("expedition_doc_res_open_3") ? document.getElementById("expedition_doc_res_open_3").value : '';
        checks = [];
        checks_html = document.getElementsByName('expedition_doc_reso_open_cb');
        for (let i = 0; i < checks_html.length; i++) {
            const element = checks_html[i];
            if (element.checked == true) checks.push(1)
            else checks.push(0)
        }
        reso.open_cb = checks.join(',');

        formData.set('reso', JSON.stringify(reso));
        manage_exp();

    }
    let update_model = (model) => {
        formData = new FormData();
        formData.set('model', model);
        manage_exp();
    }
    let manage_exp = () => {
        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        EXPEDITION_SERVICE.update(currentRecord.id, formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.fire({
                        title: swaMsg.publish_success_title,
                        text: swaMsg.publish_success_text,
                        footer: swaMsg.text_footer,
                        icon: 'success',
                        confirmButtonText: swaMsg.text_btn,
                    });

                    props.requestUpdateRecord(currentItem.id);
                    props.requestUpdate(currentItem.id);
                } else if (response.data === 'ERROR_DUPLICATE') {
                    MySwal.fire({
                        title: "ERROR DE DUPLICACION",
                        text: "El concecutivo CUB de este formulario ya existe, debe de elegir un concecutivo nuevo",
                        icon: 'error',
                        confirmButtonText: swaMsg.text_btn,
                    });
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
    return (
        <div>
            <div>
                {_MODEL_SELECTOR()}
                <form id="form_expedition_4" onSubmit={save_exp_res}>
                    {_COMPONENT_DOC_RES()}
                    {_COMPONENT_DOC_RES_PDF()}
                </form>
            </div>
            <div>
                {process.env.REACT_APP_GLOBAL_ID === 'cb1' && resDocData && (
                    <EXP_RES_2 data={resDocData} swaMsg={swaMsg} currentItem={currentItem} />
                )}
            </div>
        </div>
    );
}
