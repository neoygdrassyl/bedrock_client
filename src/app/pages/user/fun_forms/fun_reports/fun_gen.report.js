import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import Spreadsheet from "react-spreadsheet";
import FUNService from '../../../../services/fun.service';
import { _FUN_1_PARSER, _FUN_24_PARSER, _FUN_2_PARSER, _FUN_3_PARSER, _FUN_4_PARSER, _FUN_5_PARSER, _FUN_6_PARSER, _FUN_8_PARSER } from '../../../../components/customClasses/funCustomArrays';
import { _CALCULATE_EXPENSES, formsParser1, getJSON, getJSONFull, regexChecker_isPh } from '../../../../components/customClasses/typeParse';
import { infoCud } from '../../../../components/jsons/vars';
import { MDBBtn, MDBIcon } from 'mdb-react-ui-kit';

const _GLOBAL_ID = process.env.REACT_APP_GLOBAL_ID;
const MySwal = withReactContent(Swal);

export default function FUN_REPORT_GEN(props) {
    const { translation, swaMsg, globals, data, date_i, date_f } = props;
    const pass_meas = {
        A: 'Cubierta Verde',
        B: "Elementos de protección Solar",
        C: "Vidrios de protección solar",
        D: "Cubierta de protección solar",
        E: "Pared de protección solar"
    };
    const pass_act = {
        A: 'Iluminación eficiente',
        B: "Equipos e aire acondicionados eficientes",
        C: "Agua caliente solar",
        D: "Controles de iluminación",
        E: "Variedades de velocidad para bombas"
    };
    const climate = {
        A: 'Frio',
        B: "Templado",
        C: "Cálido seco",
        D: "Cálido húmedo",
    };
    const moment = require('moment');

    var [localData, setDataLocal] = useState([]);

    var [dataContraloria, setDataCon] = useState([]);
    var [dataContraloria2, setDataCon2] = useState([]);
    var [dataCamacol, setDataCam] = useState([]);
    var [dataDane, setDataDan] = useState([]);
    var [dataPlaneacion, setDataPlan] = useState([]);
    var [dataMinisterio, setDataMin] = useState([]);
    var [dataMoney, setDataMoney] = useState([]);
    var [dataCMDB, setDataCMDB] = useState([]);
    var [dataPlaneacion2, setDataPlan2] = useState([]);
    var [dataResume, setDataResume] = useState([]);
    var [dataIgac, setDataIgac] = useState([]);
    var [dataNotaria, setDataNotaria] = useState([]);
    var [dataAuditoria, setDataAuditoria] = useState([]);
    var [dataFDPM, setDataFDPM] = useState([]);

    var [load, setLoad] = useState(0);
    var [preview, setPre] = useState(false);

    var [date_1, setDate_1] = useState(date_i);
    var [date_2, setDate_2] = useState(date_f);

    useEffect(() => {
        setDate_1(date_i);
        setDate_2(date_f);
        setLoad(0);
    }, [date_i, date_f]);

    // CONTRALORIA
    const header_1 = [
        "Solicitud No",
        "Fecha Solicitud",
        "Tipo Solicitud",
        "Nombre Propietario",
        "Apellidos Propietario",
        "Matricula No",
        "Dirección Predio",
        "Fecha Licencia",
        "Total Area Inter",
        "Total Cargo Vble",
        "Total Delineación",
        "Total Sub-Suelo",
        "Total Fondo embellecimiento",
        "Total Pro-UIS",
        "Cédula Catastral",
        "Estrato",
    ];

    let report_data_1 = (v) => {
        var regex = /[.,\s]/g;
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let taxes = getJSONFull(v.taxes);
        let reso = getJSONFull(v.reso);
        let tmp = getJSONFull(v.tmp);
        let tax1 = tmp.zone ?? 0.1;
        let delineamiento = _GLOBAL_ID == 'cb1' ? _FIELDS_ADD(v.expc_1, ';') : _FIELDS_MULTIPLY(v.expa_1, v.expc_1, ';', ';');
        let delineamiento_2 = reso.sexto_v ? reso.sexto_v.split(';')[2] : false
        if (delineamiento_2) delineamiento_2 = delineamiento_2.replace(regex, '');

        var cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        var cv_charge = v.exp_charge ? v.exp_charge.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        let metraje = Number(taxes.id_payment_0_area || 0) + Number(cv_area)
        let uis = ((taxes.id_payment_2_p || 0) * Number(taxes.uis ?? 0)) / 100 + Number(taxes.uis ?? 0)
        let uis_2 = reso.sexto_v ? reso.sexto_v.split(';')[4] : false
        if (uis_2) uis_2 = uis_2.replace(regex, '');

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, //  Solicitud No
            { value: v.clock_payment },  //  Fecha Solicitud
            { value: formsParser1(_CHILD_1, true) }, //  Tipo Solicitud
            { value: _JOIN_FIELDS(v, ['names51',], true) }, // Nombre Propietario
            { value: _JOIN_FIELDS(v, ['surnames51',], true) }, // Apellidos Propietario
            { value: v.matricula }, // Matricula No
            { value: (v.direccion ?? '').toUpperCase() }, // Dirección Predio
            { value: v.clock_license }, // Fecha Licencia
            { value: metraje.toFixed(2) }, // Total Area Inter
            { value: Number(taxes.id_payment_1_real || cv_charge) }, // Total Cargo Vble
            { value: delineamiento_2 || delineamiento || 0 }, // Total Delineación
            { value: (Math.ceil(delineamiento * tax1 / 50) * 50).toFixed(0) }, // Total Sub-Suelo
            { value: 0 }, // Total Fondo embellecimiento
            { value: uis_2 || uis || 0 }, //  Total Pro-UIS
            { value: v.catastral_2 || v.catastral },  //  Cédula Catastral
            { value: v.estrato }, // Estrato
        ]
    }

    // CAMACOL
    const header_2 = [
        "Fecha de Expedición",
        "No. Solicitud",
        "Tipo de Licencia",
        "Nombre propietario",
        "Dirección del predio",
        "Estrato",
        "Area Intervención",
        "Área ampliada",
        "Unidades de comercio",
        "Unidades de vivienda",
        "No. De Pisos",
        "VIS",
        "VIP",
        "Otro",
        "Cédula Catastral",
    ];
    let report_data_2 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let aint;
        let amp;
        let uc;
        let uv;
        let floors;

        aint = _FIELDS_ADD(v.r33a_build, ',', undefined, 2);
        amp = _FIELDS_ADD(v.r33a_build, ',', 1, 2);
        uc = _FIELDS_ADD(v.r33a_units, ';', 1, 0);
        uv = _FIELDS_ADD(v.r33a_units, ';', 0, 0);
        floors = _FIELDS_GET_GREATER(v.r33a_floor);


        return [
            { value: isPH ? v.clock_license_ph : v.clock_license }, //  Fecha de Expedición
            { value: isPH ? v.id_public_ph : v.id_public },  //  No. Solicitud
            { value: formsParser1(_CHILD_1) }, //  Tipo de Licencia
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // Nombre Propietario
            { value: (v.direccion ?? '').toUpperCase() }, // Dirección del predio
            { value: v.estrato }, // Estrato
            { value: aint }, // Area Intervención
            { value: amp }, // Área ampliada
            { value: uc }, // Unidades de comercio
            { value: uv }, // Unidades de vivienda
            { value: floors }, // No. De Pisos
            { value: v.vivienda == 'B' ? 'X' : '' }, // VIS
            { value: v.vivienda == 'A' ? 'X' : '' }, //  VIP
            { value: v.vivienda == 'C' ? 'X' : '' }, //  Otro
            { value: v.catastral_2 || v.catastral },  //  Cédula Catastral
        ]
    }

    // DANE
    const header_3 = [
        "Mes y Año De Aprobacion",
        "Numero De Licencia de Cnstruccion",
        "Tipo De Licencia",
        "Objeto De Tramite",
        "Direccon De La Obra",
        "Cédula Catastral",
        "Barrio",
        "Nombre Del Constructor O Responsable",
        "Telefono Constructor O Responsable",
        "Correo Electronico",
        "Discripcion De La Obra",
        "Modalidades De Construccion",
        "Tipo",
        "(VIP) Area m2",
        "(VIP) Unidades",
        "(VIS) Area m2",
        "(VIS) Unidades",
        "Estrato",
        "Tipo",
        "(NO VIS) Area m2",
        "(NO VIS) Unidades",
        "Estrato",
        "Destino",
        "Destino Varios",
        "Area m2",
        "Unidades",
    ];
    let report_data_3 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let F52 = v.objs_52 ? v.objs_52.split('&&') : [];
        F52 = F52.map(f => getJSONFull(f));

        let worker = _FIND_F5(F52, ['DIRECTOR DE LA CONSTRUCCION', 'URBANIZADOR O CONSTRUCTOR RESPONSABLE'])

        let EXP_A = v.exp_a_obj ? v.exp_a_obj.split('&&') : [];
        EXP_A = EXP_A.map(ea => getJSONFull(ea));

        let dest_a1 = _ADD(EXP_A, 'area', 'Comercial y de Servicios');
        let dest_a2 = _ADD(EXP_A, 'area', 'Dotacional');
        let dest_a3 = _ADD(EXP_A, 'area', 'Industrial');
        let dest_a4 = _ADD(EXP_A, 'area', 'Multiple');

        let dest_u1 = _ADD(EXP_A, 'units', 'Comercial y de Servicios');
        let dest_u2 = _ADD(EXP_A, 'units', 'Dotacional');
        let dest_u3 = _ADD(EXP_A, 'units', 'Industrial');
        let dest_u4 = _ADD(EXP_A, 'units', 'Multiple');

        let m2 = v.step_s34_json ? getJSON(v.step_s34_json, 'm2') : '';

        let du2 = 0;

        let dest_s0 = [];
        let dest_d0 = [];
        if (dest_a4 > 0) {
            dest_s0.push('Multiple')
            //dm2 = dest_a4;
            du2 = dest_u4;
            if (dest_a1 > 0) dest_d0.push('Comercial y de Servicios')
            if (dest_a2 > 0) dest_d0.push('Dotacional')
            if (dest_a3 > 0) dest_d0.push('Industrial')
        }
        else {
            if (dest_a1 > 0) {
                dest_s0.push('Comercial y de Servicios')
                //dm2 = dest_a1;
                du2 = dest_u1;
            }
            else if (dest_a2 > 0) {
                dest_s0.push('Dotacional')
                //dm2 = dest_a2;
                du2 = dest_u2;
            }
            else if (dest_a3 > 0) {
                dest_s0.push('Industrial')
                //dm2 = dest_a3;
                du2 = dest_u3;
            }
        }

        let tipe1 = '';
        let tipe2 = '';

        if (_ADD(EXP_A, 'units', 'vivienda') > 0) tipe1 = 'Vivienda';
        else if (_ADD(EXP_A, 'units', 'residencia') > 0) tipe1 = 'Vivienda';
        else if (_ADD(EXP_A, 'units', 'apartamento') > 0) tipe1 = 'Apartamento';

        if (_ADD(EXP_A, 'units', 'vivienda (NO VIP)') > 0) tipe1 = 'Vivienda';
        else if (_ADD(EXP_A, 'units', 'residencia (NO VIP)') > 0) tipe1 = 'Vivienda';
        else if (_ADD(EXP_A, 'units', 'apartamento (NO VIP)') > 0) tipe1 = 'Apartamento';

        var p_desc = v.arc_desc ? v.arc_desc.split(';')[1] : v.description;
        p_desc = p_desc.replaceAll(';',",");
        return [
            { value: isPH ? moment(v.clock_license_ph).format('MM-YYYY') : moment(v.clock_license).format('MM-YYYY') }, //  Mes y Año De Aprobacion
            { value: isPH ? v.id_public_ph : v.id_public },  //  Numero De Licencia de Cnstruccion
            { value: formsParser1(v, true) },  //  Tipo De Licencia
            { value: _FUN_2_PARSER(v.tramite, true) },  //  Objeto De Tramite
            { value: (v.direccion ?? '').toUpperCase() },  //  Direccon De La Obra
            { value: v.catastral_2 || v.catastral },  //  Cédula Catastral
            { value: v.barrio },  //  Barrio
            { value: (worker.name ?? '') + ' ' + (worker.surname ?? '') },  //  Nombre Del Constructor O Responsable
            { value: worker.number ?? '' },  //  Telefono Constructor O Responsable
            { value: worker.email ?? '' },  //  Correo Electronico
            { value: p_desc },  //  Discripcion De La Obra
            { value: _FUN_5_PARSER(v.m_lic, true) },  //  Modalidades De Construccion
            { value: tipe1 },  //  Tipo
            { value: _ADD(EXP_A, 'area', '(VIP)') },  //  (VIP) Area m2
            { value: _ADD(EXP_A, 'units', '(VIP)') },  //  (VIP) Unidades
            { value: _ADD(EXP_A, 'area', '(VIS)') },  //  (VIS) Area m2
            { value: _ADD(EXP_A, 'units', '(VIS)') },  //  (VIS) Unidades
            { value: v.estrato },  //  Estrato
            { value: tipe2 },  //  Tipo
            { value: _ADD(EXP_A, 'area', '(NO VIP)') },  //  (NO VIS) Area m2
            { value: _ADD(EXP_A, 'units', '(NO VIP)') },  //  (NO VIS) Unidades
            { value: v.estrato },  //  Estrato
            { value: dest_s0.join(', ') },  //  Destino
            { value: dest_d0.join(', ') },  //  Destino varios
            { value: m2 || '' },  //  Area m2
            { value: du2 },  //  Unidades
        ]
    }

    // PLANEACION
    const header_4 = [
        "Licencia",
        "Tipo De Licencia",
        "Destinacion",
        "Direccion",
        "Barrio",
        "Predial",
        "N° Matricula Inmobiliaria",
        "Propietario",
        "Pot (Norma Aplicable)",
        "Fecha de Radicación",
        "Fecha De Licencia",
        "N° Folios de Licencia",
        "Resolucion",
        "Fecha De Resolucion",
        "N° Folios de Resolucion",
        "Norma",
        "Fecha de Norma",
        "N° Folios De Norma",
        "Arquitecto",
        "Ingeniero",
        "Resposable De La Obra",
        "N° Planos Topograficos",
        "N° Planos Arquitectonicos",
        "N° Planos Estructurales",
        "Memorias Calculo",
        "N° Folios De Memorias",
        "Certificación Estructural",
        "N° Folios de Certificación",
        "Estudio De  Suelos",
        "N° Folios de Estudio de Suelos",
        "Otros Folios",
        "Folio Control De Doc",
        "N° Total de Folios",
        "Cd",
        "Unidades De Viv",
        "Unidades De Comercio",
        "N° Parqueaderos",
        "N De Piso",
        "Altura De La Edificación",
        "M2 Área Predios",
        "M2 Intervenidos",
        "M2 Construidos",
        "Descripcion Proyecto",
        "Meidadas Pasivas",
        "Zona Cliatica",
        "Coordenadas",
        "Cédula Catastral",
        "Estrato",
    ];
    let report_data_4 = (v) => {

        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);

        let pm_f1 = getJSON(v.anex2, 'a211');
        let cz_f1 = getJSON(v.anex2, 'a27');

        if (pm_f1) pm_f1 = pm_f1.split(';')
        else pm_f1 = [];
        pm_f1 = pm_f1.filter(p => pass_meas[p] || p != 0);
        pm_f1 = pm_f1.map(p => pass_meas[p] || p)

        if (cz_f1) cz_f1 = cz_f1.split(';')
        else cz_f1 = [];
        var cz_other = cz_f1[4] || false;
        var cz_other_str = cz_other ? cz_f1[6] : ''
        cz_f1 = cz_f1.filter((p, i) => (climate[p] || p != 0) && i < 4);
        cz_f1 = cz_f1.map(p => climate[p] || p)
        if (cz_other_str) cz_f1.push(cz_other_str)

        let F52 = v.objs_52 ? v.objs_52.split('&&') : [];
        F52 = F52.map(f => getJSONFull(f));

        let worker = _FIND_F5(F52, ['DIRECTOR DE LA CONSTRUCCION', 'URBANIZADOR O CONSTRUCTOR RESPONSABLE']);

        let worker_arc = _FIND_F5(F52, ['ARQUITECTO PROYECTISTA']);
        worker_arc = (worker_arc.name ?? '') + ' ' + (worker_arc.surname ?? '')

        let worker_eng_1 = _FIND_F5(F52, ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL']);
        let worker_eng_2 = _FIND_F5(F52, ['INGENIERO CIVIL GEOTECNISTA']);
        let worker_eng_3 = _FIND_F5(F52, ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO']);

        let worker_eng = [];
        if (worker_eng_1.name) worker_eng.push((worker_eng_1.name ?? '') + ' ' + (worker_eng_1.surname ?? ''))
        if (worker_eng_2.name) worker_eng.push((worker_eng_2.name ?? '') + ' ' + (worker_eng_2.surname ?? ''))
        if (worker_eng_3.name) worker_eng.push((worker_eng_3.name ?? '') + ' ' + (worker_eng_3.surname ?? ''))
        worker_eng = worker_eng.join(', ')

        let height = '';
        let levels = v.r33a_level ? v.r33a_level.split('%%') : [];
        levels = levels.map(l => l ? l.split('&')[0].includes('-') ? -Number(l.split('&')[1]) : Number(l.split('&')[1]) : 0);
        let heightRule = v.arule_check === '1' ? true : false;

        if (heightRule) height = Math.max.apply(Math, levels).toFixed(2);
        else height = levels.reduce((sum, next) => { if (next > 0) return sum + next; return sum }, 0).toFixed(2);
        height = height > 0 ? height : '';

        let uc;
        let uv;
        let floors;
        let aint; // SUM OF EVERYTHING
        let abld_t;  // HISTORIC + B[0,1,10] - B[7]
        uc = _FIELDS_ADD(v.r33a_units, ';', 1, 0);
        uv = _FIELDS_ADD(v.r33a_units, ';', 0, 0);
        floors = _FIELDS_GET_GREATER(v.r33a_floor);
        aint = _FIELDS_ADD(v.r33a_build, ',', undefined, 2);
        aint = aint > 0 ? aint : '';

        let historic = _FIELDS_GET_HISTORIC_SUM(v)
        let abld_1 = _FIELDS_ADD(v.r33a_build, ',', 0, 2);
        let abld_0 = _FIELDS_ADD(v.r33a_build, ',', 1, 2);
        let abld_7 = _FIELDS_ADD(v.r33a_build, ',', 7, 2);
        let abld_10 = _FIELDS_ADD(v.r33a_build, ',', 10, 2);
        abld_t = (Number(historic) + Number(abld_1) + Number(abld_0) + Number(abld_10) - Number(abld_7)).toFixed(2);
        abld_t = abld_t > 0 ? abld_t : '';

        let eng_cant = v.eng_doc_cant ? v.eng_doc_cant.split(';') : [];
        let eng_pag = v.eng_doc_pag ? v.eng_doc_pag.split(';') : [];

        let m2 = v.step_s34_json ? getJSON(v.step_s34_json, 'm2') : '';

        let coords = v.step_ageo ? v.step_ageo.split(';') : [];
        if (coords.length) {
            coords[0] = "N: " + coords[0];
            coords[1] = "E: " + coords[1];
        }

        var exp_steps = getJSONFull(v.control);
        var arc_control = getJSONFull(v.arc_control);
        var arc_bp = v.arc_bp ? v.arc_bp.split(';') : [];

        var p_desc = v.arc_desc ? v.arc_desc.split(';')[1] : v.description;
        p_desc = p_desc.replaceAll(';',",");
        return [
            { value: isPH ? v.id_public_ph : v.id_public }, //  Licencia
            { value: formsParser1(v, true) }, //  Tipo De Licencia
            { value: _FUN_6_PARSER(v.usos, true) }, //  Destinacion
            { value: (v.direccion ?? '').toUpperCase() }, //  Direccion
            { value: v.barrio }, //  Barrio
            { value: v.catastral_2 || v.catastral }, //  Predial
            { value: v.matricula }, //  N° Matricula Inmobiliaria
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, //  Propietario
            { value: infoCud.pot }, //  Pot (Norma Aplicable)
            { value: v.clock_payment }, //  Fecha de Radicación
            { value: isPH ? v.clock_license_ph : v.clock_license }, //  Fecha De Licencia
            { value: exp_steps.n_lic }, //  N° Folios de Licencia
            { value: isPH ? v.id_public_ph : v.exp_id }, //  Resolucion
            { value: v.clock_res_date }, //  Fecha De Resolucion
            { value: exp_steps.n_res }, //  N° Folios de Resolucion
            { value: exp_steps.norm }, //  Norma
            { value: exp_steps.date_norm }, //  Fecha de Norma
            { value: exp_steps.n_norm }, //  N° Folios De Norma
            { value: worker_arc }, //  Arquitecto
            { value: worker_eng }, //  Ingeniero
            { value: (worker.name ?? '') + ' ' + (worker.surname ?? '') }, //  Resposable De La Obra
            { value: arc_bp[6] ?? 0 }, //  N° Planos Topograficos
            { value: arc_bp[0] ?? 0 }, //  N° Planos Arquitectonicos
            { value: eng_pag[2] ?? 0 }, //  N° Planos Estructurales
            { value: Number(eng_cant[0] ?? 0) + Number(eng_cant[1] ?? 0) }, //  Memorias Calculo
            { value: Number(eng_pag[0] ?? 0) + Number(eng_pag[1] ?? 0) }, //  N° Folios De Memorias
            { value: '' }, //  Certificación Estructural
            { value: '' }, //  N° Folios de Certificación
            { value: eng_cant[9] ?? 0 }, //  Estudio De  Suelos
            { value: eng_pag[9] ?? 0 }, //  N° Folios de Estudio de Suelos 
            { value: eng_pag[7] ?? 0 }, //  Otros Folios
            { value: '' }, //  Folio Control De Doc
            { value: '' }, //  N° Total de Folios
            { value: '' }, //  Cd
            { value: uv }, //  Unidades De Viv
            { value: uc }, //  Unidades De Comercio
            { value: v.parking ?? arc_control.n_parking }, //  N° Parqueaderos
            { value: floors }, //  N De Piso
            { value: height }, //  Altura De La Edificación
            { value: m2 || arc_control.m2_predio || '' }, //  M2 Área Predios
            { value: aint }, //  M2 Intervenidos
            { value: abld_t }, //  M2 Construidos
            { value: p_desc }, //  Descripcion Proyecto
            { value: pm_f1.join(', ') }, //  Meidadas Pasivas
            { value: cz_f1.join(', ') }, //  Zona Cliatica
            { value: coords.join(', ') }, //  Coordenadas
            { value: v.catastral_2 || v.catastral },  //  Cédula Catastral
            { value: v.estrato }, // Estrato
        ]
    }

    // MINISTERIO VIVIENDA
    const header_5 = [
        "Número de Licecia",
        "Clase de Licencia",
        "Número de Subdivisión",
        "Tipo de Licencia",
        "Clase de Suelo",
        "Código Catastral",
        "Matricula Inmobiliaria",
        "Fecha Ejecutoria",
        "Desisitmiento",
        "Negación",
        "Renuncia",
        "Modalidad",
        "Modalidad 2",
        "Modalidad 3",
        "Uso Principal",
        "Vivienda",
        "Comercio/Servicios",
        "Industrial",
        "Dotacional",
        "Tipo de Vivienda",
        "Unidades VIS",
        "Unidades VIP",
        "Unidades NO VIS",
        "Area Bruta M2",
        "Area Neta M2",
        "Area Util M2",
        "Area Consruida VIS",
        "Area Consruida VIP",
        "Area Construida NO VIP",
        "Area Construida Industrial",
        "Area Construida Comcercio/Servicio",
        "Area Construida Dotacional",
        "Area Util VIS",
        "Area Util VIP",
        "Area Uti No VIS",
        "Area Util Industrial",
        "Area Util Comcercio/Servicio",
        "Area Util Dotacional",
        "Estrato",
        "Localidad",
        "Sector",
        "Barrio",
        "Vereda",
        "Corregimiento",
        "Manzana",
        "Lote",
        "Cantidad de Planos Estructurales",
        "Cantidad de Planos Arquitectónicos",
        "Cantidad de Planos de Subdivisión",
        "Cantidad de Planos de Urbanización",
        "Cantidad de Planos de Parcelación",
        "Medidas Pasivas",
        "Medidas Activas",
        "Zonificación Climática",
        "¿El predio esta en una zona climática distinta a la que le fue asignada?",
        "Si a la pregunta anterior marco SI seleccione la zona correcta",
        "Cédula Catastral",
    ];
    let report_data_5 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);

        let EXP_A = v.exp_a_obj ? v.exp_a_obj.split('&&') : [];
        EXP_A = EXP_A.map(ea => getJSONFull(ea));

        let u_vip = _ADD(EXP_A, 'units', '(VIP)');
        let u_vis = _ADD(EXP_A, 'units', '(VIS)');
        let u_nvis = _ADD(EXP_A, 'units', '(NO VIS)');

        let a_vis = _ADD(EXP_A, 'area', '(VIS)');
        let a_vip = _ADD(EXP_A, 'area', '(VIP)');
        let a_nvis = _ADD(EXP_A, 'area', '(NO VIS)');

        let a_com = _ADD(EXP_A, 'area', 'Comcercio');
        let a_ind = _ADD(EXP_A, 'area', 'Industrial');
        let a_dot = _ADD(EXP_A, 'area', 'Dotacional');

        let m_lics = _FUN_5_PARSER(v.m_lic, true).split(', ');

        let mod1 = _FUN_1_PARSER(v.tipo, true);
        mod1 += _FUN_3_PARSER(v.m_urb, true) ? `, ${_FUN_3_PARSER(v.m_urb, true)}` : '';
        mod1 += _FUN_4_PARSER(v.m_sub, true) ? `, ${_FUN_4_PARSER(v.m_sub, true)}` : '';
        mod1 += m_lics[0] ? `, ${m_lics[0]}` : '';

        let mod2 = '';
        let mod3 = '';

        if (m_lics.length > 1) {
            mod2 = _FUN_1_PARSER(v.tipo, true);
            mod2 += m_lics[1] ? `, ${m_lics[1]}` : '';
        }

        if (m_lics.length > 2) {
            mod3 = _FUN_1_PARSER(v.tipo, true);
            mod3 += m_lics[2] ? `, ${m_lics[2]}` : '';
        }

        var arc_control = getJSONFull(v.arc_control);
        var arc_bp = v.arc_bp ? v.arc_bp.split(';') : [];
        let eng_cant = v.eng_doc_cant ? v.eng_doc_cant.split(';') : [];

        let pm_f1 = getJSON(v.anex2, 'a211');
        let pm_f2 = getJSON(v.anex2, 'a212');
        let cz_f1 = getJSON(v.anex2, 'a27');

        if (pm_f1) pm_f1 = pm_f1.split(';')
        else pm_f1 = [];
        pm_f1 = pm_f1.filter(p => pass_meas[p] || p != 0);
        pm_f1 = pm_f1.map(p => pass_meas[p] || p)

        if (cz_f1) cz_f1 = cz_f1.split(';')
        else cz_f1 = [];
        var cz_other = cz_f1[4] || false;
        var cz_other_str = cz_other ? cz_f1[6] : ''
        cz_f1 = cz_f1.filter((p, i) => (climate[p] || p != 0) && i < 4);
        cz_f1 = cz_f1.map(p => climate[p] || p)

        if (pm_f2) pm_f2 = pm_f2.split(';')
        else pm_f2 = [];
        pm_f2 = pm_f2.filter(p => pass_act[p] || p != 0);
        pm_f2 = pm_f2.map(p => pass_act[p] || p)

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, //  Número de Licecia
            { value: _FUN_1_PARSER(v.tipo, true) }, //  Clase de Licencia
            { value: arc_control.n_sub || 0 }, //  Número de Subdivisión
            { value: _FUN_2_PARSER(v.tramite, true) }, //  Tipo de Licencia
            { value: _FUN_24_PARSER(v.suelo, true) }, //  Clase de Suelo
            { value: v.catastral_2 || v.catastral }, //  Código Catastral
            { value: v.matricula }, //  Matricula Inmobiliaria
            { value: isPH ? v.clock_license_ph : v.clock_license }, //  Fecha Ejecutoria
            { value: v.clock_res_c == 'DESISTE' ? 'X' : '' }, //  Desisitmiento
            { value: v.clock_res_c == 'NIEGA' ? 'X' : '' }, //  Negación
            { value: "" }, //  Renuncia
            { value: mod1 }, //  Modalidad
            { value: mod2 }, //  Modalidad 2
            { value: mod3 }, //  Modalidad 3
            { value: arc_control.main_use }, //  Uso Principal
            { value: v.usos ? v.usos.includes('A') ? 'X' : '' : '' }, //  Vivienda
            { value: v.usos ? v.usos.includes('B') ? 'X' : '' : '' }, //  Comercio/Servicios
            { value: v.usos ? v.usos.includes('C') ? 'X' : '' : '' }, //  Industrial
            { value: v.usos ? v.usos.includes('D') ? 'X' : '' : '' }, //  Dotacional
            { value: _FUN_8_PARSER(v.vivienda, true) }, //  Tipo de Vivienda
            { value: u_vis }, //  Unidades VIS
            { value: u_vip }, //  Unidades VIP
            { value: u_nvis }, //  Unidades NO VIS
            { value: arc_control.m2_brute || arc_control.m2_predio || 0 }, //  Area Bruta M2
            { value: arc_control.m2_net || 0 }, //  Area Neta M2
            { value: arc_control.m2_useful || 0 }, //  Area Util M2
            { value: a_vis }, //  Area Consruida VIS
            { value: a_vip }, //  Area Consruida VIP
            { value: a_nvis }, //  Area Construida NO VIP
            { value: a_com }, //  Area Construida Industrial
            { value: a_ind }, //  Area Construida Comcercio/Servicio
            { value: a_dot }, //  Area Construida Dotacional
            { value: arc_control.m2_vis || 0 }, //  Area Util VIS
            { value: arc_control.m2_vip || 0 }, //  Area Util VIP
            { value: arc_control.m2_novis || 0 }, //  Area Util No VIS
            { value: arc_control.m2_ind || 0 }, //  Area Util Industrial
            { value: arc_control.m2_com || 0 }, //  Area Util Comcercio/Servicio
            { value: arc_control.m2_dot || 0 }, //  Area Util Dotacional
            { value: v.estrato }, //  Estrato
            { value: v.comuna }, //  Localidad
            { value: v.sector }, //  Sector
            { value: v.barrio }, //  Barrio
            { value: v.vereda }, //  Vereda
            { value: v.corregimiento }, //  Corregimiento
            { value: v.manzana }, //  Manzana
            { value: v.lote }, //  Lote
            { value: eng_cant[2] ?? 0 }, //  Cantidad de Planos Estructurales
            { value: arc_bp[0] ?? 0 }, //  Cantidad de Planos Arquitectónicos
            { value: arc_bp[5] ?? 0 }, //  Cantidad de Planos de Subdivisión
            { value: Number(arc_bp[7] ?? 0) + Number(arc_bp[8] ?? 0) }, //  Cantidad de Planos de Urbanización
            { value: arc_bp[3] ?? 0 }, //  Cantidad de Planos de Parcelación
            { value: pm_f1.join(', ') }, //  Medidas Pasivas
            { value: pm_f2.join(', ') }, //  Medidas Activas
            { value: cz_f1.join(', ') }, //  Zonificación Climática
            { value: cz_other ? 'SI' : 'NO' }, //  ¿El predio esta en una zona climática distinta a la que le fue asignada?
            { value: cz_other_str }, //  Si a la pregunta anterior marco "SI" seleccione la zona correcta
            { value: v.catastral_2 || v.catastral },  //  Cédula Catastral
        ]
    }


    // EXPENSAS
    const header_6 = [
        "Número de Solicitud",
        "Tipo de tramite",
        "Estado",

        "Cargo Fijo",
        "Cargo Fijo Pagado",
        "Cargo Fijo Diferencia",
        "Factura Nr Cargo Fijo",
        "Factura Fecha Cargo Fijo",
        "Area Liquidada Cargo Fijo",

        "Cargo Variable",
        "Cargo Variable Pagado",
        "Cargo Variable Diferencia",
        "Factura Nr Cargo Variable",
        "Factura Fecha Cargo Variable",
        "Area Liquidada Cargo Variable",

        "Valor Total",

        //"Impuesto Delineación",
        // "Impuesto de Uso",
        // "Fondo de Embelicimiento",
        // "Estampilla PRO UIS",
        //"Valor Total Licencia",
        //"Impuestos y Tasas",
        //"Compensaciones",
        //"Deberes Urbanisticos",
        //"Parqueaderos",
        //"Valor Total (3)",
        "Estrato",
    ];
    let report_data_6 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic, usos: v.usos };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let taxes = getJSONFull(v.taxes);

        var rule = formsParser1(_CHILD_1);
        var subrule = formsParser1(_CHILD_1);
        var use = _FUN_6_PARSER(_CHILD_1.usos, true);
        var st = v.estrato - 1
        var Q = taxes.id_payment_0_area || false;
        var year = moment(v.pay_date).format('YYYY')

        var expenses = _CALCULATE_EXPENSES(rule, subrule, use, st, Q, year);

        var cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        var cv_charge = v.exp_charge ? v.exp_charge.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, //  Número de Licecia
            { value: formsParser1(_CHILD_1) }, //  Tipo de tramite
            { value: _GET_STATE_STR(v.state) }, // Estado

            { value: (expenses.cf).toFixed(0) }, // Cargo Fijo
            { value: taxes.id_payment_0_real || 0 }, // Cargo Fijo Pagado
            { value: Number(expenses.cf - (taxes.id_payment_0_real || 0)).toFixed(0) }, // Cargo Fijo Diferencia
            { value: v.pay_id }, // Factura Nr  Cargo Fijo
            { value: v.pay_date }, // Factura Fecha Cargo Fijo
            { value: Number(taxes.id_payment_0_area || 0).toFixed(2) }, // Area Liquidada Cargo Fijo

            { value: Number(cv_charge).toFixed(0) }, // Cargo Variable
            { value: taxes.id_payment_1_real || 0 }, // Cargo Variable Pägado
            { value: Number(cv_charge - (taxes.id_payment_1_real || 0)).toFixed(0) }, // Cargo Variable Diferencia
            { value: taxes.id_payment_1 }, // Factura Nr Cargo Variable
            { value: taxes.id_payment_1_date }, // Factura Fecha Cargo Variable
            { value: Number(cv_area).toFixed(2) }, // Area Liquidada Cargo Variable

            { value: (Number(expenses.cf) + Number(cv_charge)).toFixed(0) }, // Valor Total

            //{ value: delineamiento }, // Impuesto Delineación
            //{ value: delineamiento * 0.1 }, // Impuesto de Uso
            //{ value: aint > axisTable[tmp.axis ?? 5] ? delineamiento * 0.6 : 0 }, // Fondo de Embelicimiento
            //{ value: taxes.uis ?? 0 }, // Estampilla PRO UIS
            //{ value: (Number(delineamiento) + Number(delineamiento * 0.1) + Number(aint > axisTable[tmp.axis ?? 5] ? delineamiento * 0.6 : 0) + Number(taxes.uis ?? 0) + Number(cargoVble)).toFixed(0) }, // Valor Total (2)
            // { value: '' }, // Impuestos y Tasas
            // { value: '' }, // Compensaciones
            // { value: '' }, // Deberes Urbanisticos
            // { value: '' }, // Parqueaderos
            //{ value: '' }, // Valor Total (3)
            { value: v.estrato }, // Estrato
        ]
    }

    // CDMB
    const header_7 = [
        "Número de Solicitud",
        "Tipo de Licencia",
        "Destinacion",
        "Dirección",
        "Predial",
        "N° Matricula Inmobiliaria",
        "Propietario",
        "Fecha de Radicación",
        "Fecha de Licencia",
        "Coordenadas",
        "Estrato",
    ];
    let report_data_7 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let coords = v.step_ageo ? v.step_ageo.split(';') : [];
        if (coords.length) {
            coords[0] = "N: " + coords[0];
            coords[1] = "E: " + coords[1];
        }

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, //  Número de Licecia
            { value: _FUN_1_PARSER(_CHILD_1.tipo, true) }, // Tipo de Licencia
            { value: _FUN_6_PARSER(v.usos, true) }, // Destinacion
            { value: (v.direccion ?? '').toUpperCase() }, // Dirección
            { value: v.catastral_2 || v.catastral }, // Predial
            { value: v.matricula }, // N° Matricula Inmobiliaria
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // Propietario
            { value: v.clock_payment }, // Fecha de Radicación
            { value: isPH ? v.clock_license_ph : v.clock_license }, // Fecha de Licencia
            { value: coords.join(', ') }, // Coordenadas
            { value: v.estrato }, // Estrato
        ]
    }
    let cons_7 = (v) => {
        let mat = v.catastral_2 || v.catastral;
        let mat_con = mat ? mat[0] + mat[1] + mat[2] : '';
        let suelo = v.suelo;

        return mat_con === '00-' || suelo === 'B' || suelo === 'C';
    }

    // PLANEACION 2
    const header_8 = [
        "Curaduria",
        "Licencia",
        "TipoLicencia",
        "Destinacion",
        "Direccion",
        "Barrio",
        "Predial",
        "Matricula",
        "Propietario",
        "POT",
        "POTFecApli", // POTFecApli // Radicacion
        "FechaLicencia",
        "FoliosLicencia",
        "Resolucion", // ID RES
        "FechaRes",
        "FoliosRes",
        "Norma",
        "FechaNorma",
        "FoliosNorma",
        "Arquitecto",
        "Ingeniero",
        "ResObra",
        "NumPlaTop",
        "NumPlaArq",
        "NumPlaEst",
        "MemoriasCalculo",
        "FoliosMemCal",
        "CerEst",
        "FoliosCerEst",
        "EstudioSuelos",
        "FoliosEstSue",
        "OtrosFolios",
        "FolioContable",
        "CD",
        "UnidadesVIV",
        "UnidadesComercio",
        "Parqueaderos",
        "NumeroPisos",
        "Altura",
        "AreaPredios",
        "M2Intervenidos",
        "M2Construidos",
        "Descripcion",
        "Coordenadas",
        "Estrato",
    ];
    let report_data_8 = (v) => {
        var arc_control = getJSONFull(v.arc_control);
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        var exp_steps = getJSONFull(v.control);
        let F52 = v.objs_52 ? v.objs_52.split('&&') : [];
        F52 = F52.map(f => getJSONFull(f));
        // -------------------------------------------
        let historic = _FIELDS_GET_HISTORIC_SUM(v)
        let abld_1 = _FIELDS_ADD(v.r33a_build, ',', 0, 2);
        let abld_0 = _FIELDS_ADD(v.r33a_build, ',', 1, 2);
        let abld_7 = _FIELDS_ADD(v.r33a_build, ',', 7, 2);
        let abld_10 = _FIELDS_ADD(v.r33a_build, ',', 10, 2);
        let abld_t = (Number(historic) + Number(abld_1) + Number(abld_0) + Number(abld_10) - Number(abld_7)).toFixed(2);
        abld_t = abld_t > 0 ? abld_t : '';
        // -------------------------------------------
        let EXP_A = v.exp_a_obj ? v.exp_a_obj.split('&&') : [];
        EXP_A = EXP_A.map(ea => getJSONFull(ea));

        let dest_a1 = _ADD(EXP_A, 'area', 'Comercial y de Servicios');
        let dest_a2 = _ADD(EXP_A, 'area', 'Dotacional');
        let dest_a3 = _ADD(EXP_A, 'area', 'Industrial');
        let dest_a4 = _ADD(EXP_A, 'area', 'Multiple');

        let dest_u1 = _ADD(EXP_A, 'units', 'Comercial y de Servicios');
        let dest_u2 = _ADD(EXP_A, 'units', 'Dotacional');
        let dest_u3 = _ADD(EXP_A, 'units', 'Industrial');
        let dest_u4 = _ADD(EXP_A, 'units', 'Multiple');

        let dm2 = 0;
        let du2 = 0;
        let dest_s0 = [];
        let dest_d0 = [];
        if (dest_a4 > 0) {
            dest_s0.push('Multiple')
            dm2 = dest_a4;
            du2 = dest_u4;
            if (dest_a1 > 0) dest_d0.push('Comercial y de Servicios')
            if (dest_a2 > 0) dest_d0.push('Dotacional')
            if (dest_a3 > 0) dest_d0.push('Industrial')
        }
        else {
            if (dest_a1 > 0) {
                dest_s0.push('Comercial y de Servicios')
                dm2 = dest_a1;
                du2 = dest_u1;
            }
            else if (dest_a2 > 0) {
                dest_s0.push('Dotacional')
                dm2 = dest_a2;
                du2 = dest_u2;
            }
            else if (dest_a3 > 0) {
                dest_s0.push('Industrial')
                dm2 = dest_a3;
                du2 = dest_u3;
            }
        }
        // -------------------------------------------
        let aint = _FIELDS_ADD(v.r33a_build, ',', undefined, 2);
        // -------------------------------------------
        let floors = _FIELDS_GET_GREATER(v.r33a_floor);
        // -------------------------------------------
        let height = '';
        let levels = v.r33a_level ? v.r33a_level.split('%%') : [];
        levels = levels.map(l => l ? l.split('&')[0].includes('-') ? -Number(l.split('&')[1]) : Number(l.split('&')[1]) : 0);
        let heightRule = v.arule_check === '1' ? true : false;
        if (heightRule) height = Math.max.apply(Math, levels).toFixed(2);
        else height = levels.reduce((sum, next) => { if (next > 0) return sum + next; return sum }, 0).toFixed(2);
        height = height > 0 ? height : '';
        // -------------------------------------------
        var p_desc = v.arc_desc ? v.arc_desc.split(';')[1] : v.description;
        p_desc = p_desc.replaceAll(';',",");
        // -------------------------------------------
        let coords = v.step_ageo ? v.step_ageo.split(';') : [];
        if (coords.length) {
            coords[0] = "N: " + coords[0];
            coords[1] = "E: " + coords[1];
        }
        // -------------------------------------------
        let uc = _FIELDS_ADD(v.r33a_units, ';', 0, 0);
        let uv = _FIELDS_ADD(v.r33a_units, ';', 1, 0);
        // -------------------------------------------
        var arc_bp = v.arc_bp ? v.arc_bp.split(';') : [];
        // -------------------------------------------
        let eng_pag = v.eng_doc_pag ? v.eng_doc_pag.split(';') : [];
        let eng_cant = v.eng_doc_cant ? v.eng_doc_cant.split(';') : [];
        // -------------------------------------------
        let worker = _FIND_F5(F52, ['DIRECTOR DE LA CONSTRUCCION', 'URBANIZADOR O CONSTRUCTOR RESPONSABLE']);
        // -------------------------------------------
        let worker_arc = _FIND_F5(F52, ['ARQUITECTO PROYECTISTA']);
        worker_arc = (worker_arc.name ?? '') + ' ' + (worker_arc.surname ?? '')
        let worker_eng_1 = _FIND_F5(F52, ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL']);
        let worker_eng_2 = _FIND_F5(F52, ['INGENIERO CIVIL GEOTECNISTA']);
        let worker_eng_3 = _FIND_F5(F52, ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO']);
        // -------------------------------------------
        let worker_eng = [];
        if (worker_eng_1.name) worker_eng.push((worker_eng_1.name ?? '') + ' ' + (worker_eng_1.surname ?? ''))
        if (worker_eng_2.name) worker_eng.push((worker_eng_2.name ?? '') + ' ' + (worker_eng_2.surname ?? ''))
        if (worker_eng_3.name) worker_eng.push((worker_eng_3.name ?? '') + ' ' + (worker_eng_3.surname ?? ''))
        worker_eng = worker_eng.join(', ')
        return [
            { value: infoCud.nomens }, // Curaduria
            { value: isPH ? v.id_public_ph : v.id_public }, // Licencia
            { value: formsParser1(_CHILD_1, true) }, // TipoLicencia
            { value: _FUN_6_PARSER(v.usos, true) }, // Destinacion
            { value: (v.direccion ?? '').toUpperCase() }, // Direccion
            { value: v.barrio }, // Barrio
            { value: v.catastral_2 || v.catastral }, // Predial
            { value: v.matricula }, // Matricula
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // Propietario
            { value: infoCud.pot }, // POT
            { value: v.clock_payment }, // POTFecApli // Radicacion
            { value: isPH ? v.clock_license_ph : v.clock_license }, // FechaLicencia
            { value: exp_steps.n_lic }, // FoliosLicencia
            { value: isPH ? v.id_public_ph : v.exp_id }, // Resolucion ID
            { value: v.clock_res_date }, // FechaRes
            { value: exp_steps.n_res }, // FoliosRes
            { value: exp_steps.norm }, // Norma
            { value: exp_steps.date_norm }, // FechaNorma
            { value: exp_steps.n_norm }, // FoliosNorma
            { value: worker_arc }, // Arquitecto
            { value: worker_eng }, // Ingeniero
            { value: (worker.name ?? '') + ' ' + (worker.surname ?? '') }, // ResObra
            { value: arc_bp[6] ?? 0 }, // NumPlaTop
            { value: arc_bp[0] ?? 0 }, // NumPlaArq
            { value: eng_pag[2] ?? 0 }, // NumPlaEst
            { value: Number(eng_cant[0] ?? 0) + Number(eng_cant[1] ?? 0) }, // MemoriasCalculo
            { value: Number(eng_pag[0] ?? 0) + Number(eng_pag[1] ?? 0) }, // FoliosMemCal
            { value: '' }, // CerEst
            { value: '' }, // FoliosCerEst
            { value: eng_cant[3] ?? 0 }, // EstudioSuelos
            { value: eng_pag[3] ?? 0 }, // FoliosEstSue
            { value: eng_pag[7] ?? 0 }, // OtrosFolios
            { value: '' }, // FolioContable
            { value: '' }, // CD
            { value: uv }, // UnidadesVIV
            { value: uc }, // UnidadesComercio
            { value: v.parking ?? arc_control.n_parking }, // Parqueaderos
            { value: floors }, // NumeroPisos
            { value: height }, // Altura
            { value: dm2 }, // AreaPredios
            { value: aint }, // M2Intervenidos
            { value: abld_t }, // M2Construidos
            { value: p_desc }, // Descripcion
            { value: coords.join(', ') }, // Coordenadas
            { value: v.estrato }, // Estrato
        ]
    };

    // CONTRALORIA DEPARTAMENTAL
    const header_9 = [
        "No Licencia",
        "Clase Y Modalidad De La Licencia",
        "Fecha De Solicitud",
        "Beneficiario",
        "Direccion",
        "Matricula Inmobiliaria",
        "Fecha De Expedicion",
        "Valor Expensas",
        "Metraje",
        "Tipo De Estampilla", // Departamental
        "Nombre De La Estampilla", // PRO-UIS
        "Valor Pagado estampilla",
        "Fecha De Pago estampilla",
        "Mecanismo De Entrega De Cesiones", // ""
        "Estrato",
    ];

    let report_data_9 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let taxes = getJSONFull(v.taxes);
        let reso = getJSONFull(v.reso);
        var cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        var cv_charge = v.exp_charge ? v.exp_charge.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;

        var rule = formsParser1(_CHILD_1);
        var subrule = formsParser1(_CHILD_1);
        var use = _FUN_6_PARSER(_CHILD_1.usos, true);
        var st = v.estrato - 1
        var Q = taxes.id_payment_0_area || false;
        var year = moment(v.pay_date).format('YYYY')

        var expenses = _CALCULATE_EXPENSES(rule, subrule, use, st, Q, year);

        let expenses_total = Number(taxes.id_payment_1_real || cv_charge) + Number(taxes.id_payment_0_real || expenses.cf)
        let metraje = Number(taxes.id_payment_0_area || 0) + Number(cv_area)
        let uis = ((taxes.id_payment_2_p || 0) * Number(taxes.uis ?? 0)) / 100 + Number(taxes.uis ?? 0)
        let uis_2 = reso.sexto_v ? reso.sexto_v.split(';')[4] : false
        var regex = /[.,\s]/g;
        if (uis_2) uis_2 = uis_2.replace(regex, '');

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, // No Licencia
            { value: formsParser1(_CHILD_1, true) }, // Clase Y Modalidad De La Licencia
            { value: v.clock_payment }, // Fecha De Solicitud
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // Beneficiario
            { value: (v.direccion ?? '').toUpperCase() }, // Direccion
            { value: v.matricula }, // Matricula Inmobiliaria
            { value: v.clock_license }, // Fecha De Expedicion
            { value: expenses_total.toFixed(0) }, // Valor Expensas
            { value: metraje.toFixed(2) }, // Metraje
            { value: "Departamental" }, // Tipo De Estampilla
            { value: "PRO-UIS" }, // Nombre De La Estampilla
            { value: uis_2 || uis || 0 }, // Valor Pagado estampilla
            { value: v.clock_payment_uis }, // Fecha De Pago estampilla
            { value: "" }, // Mecanismo De Entrega De Cesiones
            { value: v.estrato }, // Estrato
        ]
    };

    // RESUMEN
    const header_10 = [
        "No Licencia",
        "Modalidad De La Licencia",
        "No Expedicion",
        "Estado",
        "Fecha De Solicitud",
        "Fecha De Expedicion",
        "Dirección",
        "Predial",
        "Matricula",
        "Propietario",
        "Ejecutoria",
    ];

    let report_data_10 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let reso = getJSONFull(v.reso);
        let is_neg =  _GET_STATE_STR(v.state).includes('DESISTIDO')
        let neg_clock = v.clock_neg_5 || v.clock_neg_4 || v.clock_neg_3 || v.clock_neg_2 || v.clock_neg_1

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, // No Licencia
            { value: formsParser1(_CHILD_1, true) }, // Modalidad De La Licencia
            { value: isPH ? v.id_public_ph : v.exp_id }, // No Expedicion
            { value: reso.state || _GET_STATE_STR(v.state) }, // Estado
            { value: v.clock_payment }, // Fecha De Solicitud
            { value: v.clock_license || v.clock_license_ph }, // Fecha De Expedicion
            { value: (v.direccion ?? '').toUpperCase() }, // Dirección
            { value: v.catastral_2 || v.catastral }, // Predial
            { value: v.matricula }, // Matricula
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // Propietario
            { value: isPH ? v.clock_license_ph : is_neg ? neg_clock : v.clock_license }, // Ejecutoria   
        ]
    };

    // IGAC
    const header_11 = [
        "Radicado",
        "Modalidad de Licencia",
        "Departamento",
        "Municipio",
        "Identificacion catastral",
        "Matricula inmobiliaria",
        "Area del predio",
        "Area licenciada",
        "Area construida",
        "Direccion",
        "Longitud",
        "Latitud",
        "Clasificación del suelo",
        "Tipo de vivienda",
        "BIC",
    ];
    let report_data_11 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let taxes = getJSONFull(v.taxes);
        var arc_control = getJSONFull(v.arc_control);

        let coords = v.step_ageo ? v.step_ageo.split(';') : [];
        let coords_n = "N: " + (coords[0] || '')
        let coords_e = "E: " + (coords[1] || '')

        let bic = v.cultural === "A" ? 'SI' : false
        if (!bic) bic = v.cultural === "B" ? 'NO' : ''

        var cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        let metraje = Number(taxes.id_payment_0_area || 0) + Number(cv_area)

        return [
            { value: isPH ? v.id_public_ph : v.id_public }, // No Licencia
            { value: formsParser1(_CHILD_1, true) }, // Modalidad De La Licencia
            { value: infoCud.state.toUpperCase() }, // Departamento
            { value: infoCud.city.toUpperCase() }, // Municipio
            { value: v.catastral_2 || v.catastral }, // Identificacion catastral
            { value: v.matricula }, // Matricula inmobiliaria
            { value: arc_control.m2_brute || '' }, // Area del predio (bruta)
            { value: arc_control.m2_useful || metraje.toFixed(2) }, // Area licenciada (intervenida)
            { value: arc_control.m2_useful || metraje.toFixed(2) }, // Area construida (intervenida)
            { value: (v.direccion ?? '').toUpperCase() }, // Direccion
            { value: coords_n }, // Longitud
            { value: coords_e }, // Latitud
            { value: _FUN_24_PARSER(v.suelo, true) }, // Clasificación del suelo
            { value: _FUN_8_PARSER(v.vivienda, true) }, // Tipo de vivienda
            { value: bic }, // BIC
        ]
    };

    // Superintendencia de Notariado y Registro
    const header_12 = [
        "No. RADICADO DEL EXPEDIENTE",
        "No. DE ACTO ADMINISTATIVO",
        "TIPO DE TRAMITE",
        "TIPO DE DECISIÓN",
        "FECHA DE EXPEDICIÓN",
        "FECHA DE EJECUTORIA",
    ];
    let report_data_12 = (v) => {
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        return [
            { value: isPH ? v.id_public : v.id_public }, // No. RADICADO DEL EXPEDIENTE
            { value: isPH ? v.id_public_ph : v.exp_id }, // No. DE ACTO ADMINISTATIVO
            { value: formsParser1(_CHILD_1, true) }, // TIPO DE TRAMITE
            { value: "Expedido" }, // TIPO DE DECISIÓN
            { value: isPH ? v.clock_license_ph : v.clock_res_date }, // FECHA DE EXPEDICIÓN
            { value: isPH ? v.clock_license_ph : v.clock_license }, // FECHA DE EJECUTORIA
        ]
    };

    // Auditoria Contral dedpartamental
    const header_13 = [
        "RADICADO",
        "Clase Y Modalidad De La Licencia",
        "Fecha De Solicitud",
        "Matricula Inmobiliaria",
        "Numero predial",
        "Numero de Resolución",
        "Fecha De Expedicion RESOLUCION",
        "Fecha Ejecutoria",
        "Estado",
        "Valor Expensas",
        "Metraje",
        "Estrato",
        "Valor Pagado estampilla PROUIS",
        "Fecha De Pago estampilla",
        "NUMERO RECIBO PROUIS",
        "CARGO FIJO",
        "FACTURA CARGO FIJO",
        "FECHA FACTURA CARGO FIJO",
        "CARGO VARIABLE",
        "FACTURA CARGO VARIABLE",
        "FECHA FAC CARGO VARIABLE",
        "IMPUESTO DELIENACION URBANA VALOR PAGADO",
        "NUMERO DE RECIBO DELINEACION URBANA",
        "FECHA PAGO DELINEACION URBANA",
    ];
    let report_data_13 = (v) => {
        var regex = /[.,\s]/g;
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic, usos: v.usos };
        let isPH = regexChecker_isPh(_CHILD_1, true);
        let taxes = getJSONFull(v.taxes);
        let reso = getJSONFull(v.reso);
        let tmp = getJSONFull(v.tmp);

        let uis = ((taxes.id_payment_2_p || 0) * Number(taxes.uis ?? 0)) / 100 + Number(taxes.uis ?? 0)
        let uis_2 = reso.sexto_v ? reso.sexto_v.split(';')[4] : false
        if (uis_2) uis_2 = uis_2.replace(regex, '');

        var rule = formsParser1(_CHILD_1);
        var subrule = formsParser1(_CHILD_1);
        var use = _FUN_6_PARSER(_CHILD_1.usos, true);
        var st = v.estrato - 1
        var Q = taxes.id_payment_0_area || false;
        var year = moment(v.pay_date).format('YYYY')

        var expenses = _CALCULATE_EXPENSES(rule, subrule, use, st, Q, year);
        var cv_charge = v.exp_charge ? v.exp_charge.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;

        var cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        let metraje = Number(taxes.id_payment_0_area || 0) + Number(cv_area)

        let cargo_fijo = taxes.id_payment_0_real || Number(expenses.cf).toFixed(0);
        let cargo_varibable = taxes.id_payment_1_real || Number(cv_charge).toFixed(0)

        const sexto_v = reso.sexto_v ? reso.sexto_v.split(';') : []

        let del_pay = taxes.del_pay || sexto_v[2] || ''
        let del_number = taxes.del_number || sexto_v[3] || ''
        if (reso.parcon) {
            del_pay = taxes.del_pay || sexto_v[3] || ''
            del_number = taxes.del_number || sexto_v[4] || ''
        }
        return [
            { value: isPH ? v.id_public : v.id_public }, // RADICADO
            { value: formsParser1(_CHILD_1, true) }, // Clase Y Modalidad De La Licencia
            { value: v.clock_payment }, // Fecha De Solicitud
            { value: v.matricula }, // Matricula Inmobiliaria
            { value: v.catastral_2 || v.catastral }, // Numero predial
            { value: isPH ? v.id_public_ph : v.exp_id }, // Numero de Resolución
            { value: isPH ? v.clock_license_ph : v.clock_res_date }, // Fecha De Expedicion RESOLUCION
            { value: isPH ? v.clock_license_ph : v.clock_license }, // Fecha Ejecutoria
            { value: reso.state || _GET_STATE_STR(v.state) }, // Estado
            { value: Number(cargo_fijo) + Number(cargo_varibable) }, // Valor Expensas
            { value: metraje.toFixed(2) }, // Metraje
            { value: v.estrato }, // Estrato
            { value: uis || uis_2 || 0 }, // Valor Pagado estampilla PROUIS
            { value: v.clock_payment_uis }, // Fecha De Pago estampilla
            { value: taxes.id_payment_2 }, // NUMERO RECIBO PROUIS
            { value: cargo_fijo }, // CARGO FIJO
            { value: v.pay_id }, // FACTURA CARGO FIJO
            { value: v.pay_date }, // FECHA FACTURA CARGO FIJO
            { value: cargo_varibable }, // CARGO VARIABLE
            { value: taxes.id_payment_1 }, // FACTURA CARGO VARIABLE
            { value: taxes.id_payment_1_date }, // FECHA FAC CARGO VARIABLE
            { value: del_pay }, // IMPUESTO DELIENACION URBANA VALOR PAGADO
            { value: del_number }, // NUMERO DE RECIBO DELINEACION URBANA
            { value: taxes.del_date }, // FECHA PAGO DELINEACION URBANA

        ]
    };

    // INFORME LICENCIAS EXP. CURAD. URB. (F-DPM-1220-238,37-018)
    const header_14 = [
        "No de ORDEN",
        "CODIGO - SERIE",
        "CODIGO - SUBSERIE",
        "NOMBRE SERIE/SUBSERIE O ASUNTO",
        "FECHAS EXTENA - INICIAL",
        "FECHA EXTERNA - FINAL",
        "UNIDAD DE CONVSERVACIÓN - No DE CAJA",
        "UNIAD DE CONVSERVACIÓN - No. DE CARPETA",
        "UNIAD DE CONVSERVACIÓN - OTROS",
        "No DE FOLIOS",
        "SOPORTE",
        "FRECUENCIA DE CONSULTA",
        "RADICADO DE LICENCIA URBANISTICA",
        "NOTAS",
        "USO EXCLUSIVO OFICINA DE GESTION DOCUMENTAL - CONSECUTIVO DE CAJA",
        "USO EXCLUSIVO OFICINA DE GESTION DOCUMENTAL - OBSERVACIONES",
        "CURADURIA",
        "FECHA DE REPORTE", // AAAAMM
        "TIPO DE LICENCIA",
        "MODALIDAD DE LICENCIA",
        "ACTO DE RECONOCIMIENTO",
        "DESTINACIÓN",
        "DIRECCIÓN",
        "BARRIO",
        "GEORERENCIACION  COORDENADAS",
        "ESTRATO",
        "NUMERO PREDIAL",
        "MATRICULA INMOBILIARIA",
        "PROPIETARIO Y/O TITULAR DE LA LICENCIA",
        "RESOLUCIONES Y/O ACUERDOS DEL POT",
        "FECHA DE RADICADO SOLICITUD LICENCIA", // yyyymmdd
        "FECHA DEE EXPEDICIÓN DE LA LICENCIA", // YYYYMMDD
        "FECHA DE VIGENCIA DE LA LICENCIA", // YYYYMMDD
        "No FOLIOS LICENCIA",
        "ACTO ADMINISTRATIVO DE LA LICENCIA - No.",
        "ACTO ADMINISTRATIVO DE LA LICENCIA - FECHA", // YYYYMMDD
        "ACTO ADMINISTRATIVO DE LA LICENCIA - FOLIOS",
        "LICENCIA EJECUTORIADA - No",
        "LICENCIA EJECUTORIADA - FECHA", // YYYYMMDD
        "LICENCIA EJECUTORIADA - FOLIOS",
        "NORMA URBANA - No.",
        "NORMA URBANA - FECHA EXPEDICIÓN.", // YYYYMMDD
        "NORMA URBANA - FOLIOS",
        "RESPONSABLES - ARQUITECTO",
        "RESPONSABLES - INGENIERO",
        "RESPONSABLES - DE OBRA",
        "RESPONSABLES - OTROS",
        "PLANOS - No PLANOS TOPOGRAFICOS",
        "PLANOS - No PLANOS ARQUITECTONICOS",
        "PLANOS - No PLANOS ESTRUCTURALES",
        "PLANOS - OTROS",
        "MEMORIAS DE CALCULO - No",
        "MEMORIAS DE CALCULO FOLIOS",
        "PERITAJE TECNICO - No",
        "PERITAJE TECNICO - FOLIOS",
        "CERTIFICADO ESTRUCTURAL - No",
        "CERTIFICADO ESTRUCTURAL - FOLIOS",
        "ESTUDIOS DE SUELOS - No",
        "ESTUDIO DE SUELOS FOLIOS",
        "OTROS FOLIOS",
        "CDs",
        "No DE UNIDADES DE VIVIENDA",
        "No DE UNIDADES DE COMERCIO",
        "No DE UNIDADES DOTACIIONALES",
        "No DE UNIDADES INDUSTRIALES",
        "No DE PARQUEADEROS",
        "No DE PISOS",
        "ALTURA DE LA EDIFICACION",
        "AREA (m2) TOTAL PREDIOS",
        "AREA (m2) INTERVENIDA",
        "AREA (m2) CONSTRUIDA",
        "DESCRIPCIÓN DEL PROYECTO",
    ];

    let report_data_14 = (v) => {
        //let regex = /[.,\s]/g;
        let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic, usos: v.usos };
        const isPH = regexChecker_isPh(_CHILD_1, true);
        const taxes = getJSONFull(v.taxes);
        const reso = getJSONFull(v.reso);
        //let tmp = getJSONFull(v.tmp);
        const arc_control = getJSONFull(v.arc_control);
        var exp_steps = getJSONFull(v.control);
        const json34 =  getJSONFull(v.arc_json34);
        // -------------------------------------------
        let coords = v.step_ageo ? v.step_ageo.split(';') : [];
        if (coords.length) {
            coords[0] = "N: " + coords[0];
            coords[1] = "E: " + coords[1];
        }
        // -------------------------------------------
        let cv_area = v.exp_area ? v.exp_area.split(';').reduce((sum, next) => sum += Number(next), 0) : 0;
        let metraje = Number(taxes.id_payment_0_area || 0) + Number(cv_area)
        // -------------------------------------------
        let aint;
        let amp;
        let uc;
        let uv;
        let floors;
        aint = _FIELDS_ADD(v.r33a_build, ',', undefined, 2);
        amp = _FIELDS_ADD(v.r33a_build, ',', 1, 2);
        uc = _FIELDS_ADD(v.r33a_units, ';', 1, 0);
        uv = _FIELDS_ADD(v.r33a_units, ';', 0, 0);
        floors = _FIELDS_GET_GREATER(v.r33a_floor);
        let height = '';
        let levels = v.r33a_level ? v.r33a_level.split('%%') : [];
        levels = levels.map(l => l ? l.split('&')[0].includes('-') ? -Number(l.split('&')[1]) : Number(l.split('&')[1]) : 0);
        let heightRule = v.arule_check === '1' ? true : false;
        if (heightRule) height = Math.max.apply(Math, levels).toFixed(2);
        else height = levels.reduce((sum, next) => { if (next > 0) return sum + next; return sum }, 0).toFixed(2);
        height = height > 0 ? height : '';
        // -------------------------------------------
        let EXP_A = v.exp_a_obj ? v.exp_a_obj.split('&&') : [];
        EXP_A = EXP_A.map(ea => getJSONFull(ea));

        //let dest_a1 = _ADD(EXP_A, 'area', 'Comercial y de Servicios');
        //let dest_a2 = _ADD(EXP_A, 'area', 'Dotacional');
        //let dest_a3 = _ADD(EXP_A, 'area', 'Industrial');
        //let dest_a4 = _ADD(EXP_A, 'area', 'Multiple');

        //let dest_u1 = _ADD(EXP_A, 'units', 'Comercial y de Servicios');
        let dest_u2 = _ADD(EXP_A, 'units', 'Dotacional');
        let dest_u3 = _ADD(EXP_A, 'units', 'Industrial');
        //let dest_u4 = _ADD(EXP_A, 'units', 'Multiple');
        // -------------------------------------------
        let F52 = v.objs_52 ? v.objs_52.split('&&') : [];
        F52 = F52.map(f => getJSONFull(f));
        // -------------------------------------------
        let worker = _FIND_F5(F52, ['DIRECTOR DE LA CONSTRUCCION', 'URBANIZADOR O CONSTRUCTOR RESPONSABLE']);
        // -------------------------------------------
        let worker_arc = _FIND_F5(F52, ['ARQUITECTO PROYECTISTA']);
        worker_arc = (worker_arc.name ?? '') + ' ' + (worker_arc.surname ?? '')
        let worker_eng_1 = _FIND_F5(F52, ['INGENIERO CIVIL DISEÑADOR ESTRUCTURAL']);
        let worker_eng_2 = _FIND_F5(F52, ['INGENIERO CIVIL GEOTECNISTA']);
        let worker_eng_3 = _FIND_F5(F52, ['INGENIERO TOPOGRAFO Y/O TOPÓGRAFO']);
        let worker_eng_4 = _FIND_F5(F52, ['REVISOR INDEPENDIENTE DE LOS DISEÑOS ESTRUCTURALES']);
        let worker_eng = [];
        if (worker_eng_1.name) worker_eng.push((worker_eng_1.name ?? '') + ' ' + (worker_eng_1.surname ?? ''))
        worker_eng = worker_eng.join(', ')
        let worker_eng_other = []
        if (worker_eng_2.name) worker_eng_other.push((worker_eng_2.name ?? '') + ' ' + (worker_eng_2.surname ?? ''))
        if (worker_eng_3.name) worker_eng_other.push((worker_eng_3.name ?? '') + ' ' + (worker_eng_3.surname ?? ''))
        if (worker_eng_4.name) worker_eng_other.push((worker_eng_4.name ?? '') + ' ' + (worker_eng_4.surname ?? ''))
        worker_eng_other = worker_eng_other.join(', ')
        // -------------------------------------------
        let arc_bp = v.arc_bp ? v.arc_bp.split(';') : [];
        let eng_cant = v.eng_doc_cant ? v.eng_doc_cant.split(';') : [];
        let eng_doc_pag = v.eng_doc_pag ? v.eng_doc_pag.split(';') : [];
        let eng_ncert = v.eng_ncert
        let arc_op = Number(arc_bp[1] || 0) + Number(arc_bp[2] || 0) + Number(arc_bp[3] || 0) + Number(arc_bp[4] || 0) + Number(arc_bp[5] || 0) + Number(arc_bp[7] || 0) + Number(arc_bp[8] || 0)
        // -------------------------------------------
        var p_desc = v.arc_desc ? v.arc_desc.split(';')[1] : v.description;
        p_desc = p_desc.replaceAll(';',",");
        // -------------------------------------------
        let vig = reso.eje || '';
        // -------------------------------------------
        return [
            { value: '' }, // No de ORDEN
            { value: '' }, // CODIGO - SERIE
            { value: '' }, // CODIGO - SUBSERIE
            { value: '' }, // NOMBRE SERIE/SUBSERIE O ASUNTO
            { value: '' }, // FECHAS EXTENA - INICIAL
            { value: '' }, // FECHA EXTERNA - FINAL
            { value: '' }, // UNIDAD DE CONVSERVACIÓN - No DE CAJA
            { value: '' }, // UNIAD DE CONVSERVACIÓN - No. DE CARPETA
            { value: '' }, // UNIAD DE CONVSERVACIÓN - OTROS
            { value: '' }, // No DE FOLIOS
            { value: '' }, // SOPORTE
            { value: '' }, // FRECUENCIA DE CONSULTA ---
            { value: '' }, // RADICADO DE LICENCIA URBANISTICA
            { value: '' }, // NOTAS
            { value: '' }, // USO EXCLUSIVO OFICINA DE GESTION DOCUMENTAL - CONSECUTIVO DE CAJA
            { value: '' }, // USO EXCLUSIVO OFICINA DE GESTION DOCUMENTAL - OBSERVACIONES
            { value: infoCud.name + " DE " + (infoCud.city).toUpperCase() }, // CURADURIA
            { value: '' }, // FECHA DE REPORTE // AAAAMM
            { value: _FUN_1_PARSER(_CHILD_1.tipo, true) }, // TIPO DE LICENCIA
            { value: isPH ? '' : formsParser1(_CHILD_1, true) }, // MODALIDAD DE LICENCIA
            { value: isPH ? formsParser1(_CHILD_1, true) : '' }, // ACTO DE RECONOCIMIENTO
            { value: _FUN_6_PARSER(v.usos, true) }, // DESTINACIÓN
            { value: (v.direccion ?? '').toUpperCase() }, // DIRECCIÓN
            { value: v.barrio }, // BARRIO
            { value: coords.join(', ') }, // GEORERENCIACION  COORDENADAS
            { value: v.estrato }, // ESTRATO
            { value: v.catastral_2 || v.catastral }, // NUMERO PREDIAL
            { value: v.matricula }, // MATRICULA INMOBILIARIA
            { value: _JOIN_FIELDS(v, ['names51', 'surnames51'], true) }, // PROPIETARIO Y/O TITULAR DE LA LICENCIA
            { value: infoCud.pot }, // RESOLUCIONES Y/O ACUERDOS DEL POT
            { value: v.clock_payment ? moment(v.clock_payment).format('YYYYMMDD') : '' }, // FECHA DE RADICADO SOLICITUD LICENCIA // yyyymmdd
            {
                value: isPH ?
                    (v.clock_license_ph ? moment(v.clock_license_ph).format('YYYYMMDD') : '') :
                    (v.clock_res_date ? moment(v.clock_res_date).format('YYYYMMDD') : '')
            }, // FECHA DEE EXPEDICIÓN DE LA LICENCIA // YYYYMMDD
            { value: vig }, // FECHA DE VIGENCIA DE LA LICENCIA // YYYYMMDD
            { value: '' }, // No FOLIOS LICENCIA
            { value: isPH ? v.id_public_ph : v.exp_id }, // ACTO ADMINISTRATIVO DE LA LICENCIA - No
            {
                value: isPH ?
                    (v.clock_license_ph ? moment(v.clock_license_ph).format('YYYYMMDD') : '') :
                    (v.clock_res_date ? moment(v.clock_res_date).format('YYYYMMDD') : '')
            }, // ACTO ADMINISTRATIVO DE LA LICENCIA - FECHA // YYYYMMDD
            { value: '' }, // ACTO ADMINISTRATIVO DE LA LICENCIA - FOLIOS
            {
                value: isPH ?
                    (v.clock_license_ph ? moment(v.clock_license_ph).format('YYYYMMDD') : '') :
                    (v.clock_res_date ? moment(v.clock_res_date).format('YYYYMMDD') : '')
            }, // LICENCIA EJECUTORIADA - No
            {
                value: isPH ?
                    (v.clock_license_ph ? moment(v.clock_license_ph).format('YYYYMMDD') : '') :
                    (v.clock_license ? moment(v.clock_license).format('YYYYMMDD') : '')
            }, // LICENCIA EJECUTORIADA - FECHA // YYYYMMDD
            { value: '' }, // LICENCIA EJECUTORIADA - FOLIOS
            { value: exp_steps.norm }, // NORMA URBANA - No
            { value: exp_steps.date_norm ? moment(exp_steps.date_norm).format('YYYYMMDD') : '' }, // NORMA URBANA - FECHA EXPEDICIÓN // YYYYMMDD
            { value: exp_steps.n_norm }, // NORMA URBANA - FOLIOS
            { value: worker_arc }, // RESPONSABLES - ARQUITECTO
            { value: worker_eng }, // RESPONSABLES - INGENIERO
            { value: (worker.name ?? '') + ' ' + (worker.surname ?? '') }, // RESPONSABLES - DE OBRA
            { value: worker_eng_other }, // RESPONSABLES - OTROS
            { value: arc_bp[6] ?? '' }, // PLANOS - No PLANOS TOPOGRAFICOS
            { value: arc_bp[0] ?? '' }, // PLANOS - No PLANOS ARQUITECTONICOS
            { value: eng_cant[2] ?? '' }, // PLANOS - No PLANOS ESTRUCTURALES
            { value: arc_op }, // PLANOS - OTROS
            { value: eng_cant[0] || '' }, // MEMORIAS DE CALCULO - No
            { value: eng_doc_pag[0] || '' }, // MEMORIAS DE CALCULO FOLIOS
            { value: eng_cant[5] || '' }, // PERITAJE TECNICO - No
            { value: eng_doc_pag[5] || '' }, // PERITAJE TECNICO - FOLIOS
            { value: v.id_public }, // CERTIFICADO ESTRUCTURAL - No
            { value: eng_ncert }, // CERTIFICADO ESTRUCTURAL - FOLIOS
            { value: eng_cant[9] || '' }, // ESTUDIOS DE SUELOS - No
            { value: eng_doc_pag[9] || '' }, // ESTUDIO DE SUELOS FOLIOS
            { value: arc_bp[6] || '' }, // OTROS FOLIOS
            { value: '' }, // CDs
            { value: uv }, // No DE UNIDADES DE VIVIENDA
            { value: uc }, // No DE UNIDADES DE COMERCIO
            { value: dest_u2 }, // No DE UNIDADES DOTACIIONALES
            { value: dest_u3 }, // No DE UNIDADES INDUSTRIALES
            { value: v.parking ?? arc_control.n_parking }, // No DE PARQUEADEROS
            { value: floors }, // No DE PISOS
            { value: height }, // ALTURA DE LA EDIFICACION
            { value: json34 ?  json34.m2 ? json34.m2  + ' m2' : arc_control.m2_predio ? arc_control.m2_predio + ' m2' : '' : '' }, // AREA (m2) TOTAL PREDIOS
            { value: metraje.toFixed(2) }, // AREA (m2) INTERVENIDA
            { value: arc_control.m2_useful || metraje.toFixed(2) }, // AREA (m2) CONSTRUIDA
            { value: p_desc }, // DESCRIPCIÓN DEL PROYECTO
        ]
    };

    useEffect(() => {
        if (load == 0) {
            _GET_DATA();
            _GET_DATA_MONEY();
            _GET_DATA_RESUME();
        }
    }, [load]);

    // ***************************  DATA GETTERS *********************** //
    let _GET_DATA = () => {
        FUNService.reportsData(date_1, date_2)
            .then(response => {
                let curatedData = []
                response.data.map(v => {
                    let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
                    let isPH = regexChecker_isPh(_CHILD_1, true);
                    if (isPH) {
                        if (date_1 <= v.clock_license_ph && v.clock_license_ph <= date_2) curatedData.push(v)
                    }
                    else curatedData.push(v)
                })

                setDataLocal(curatedData)
                if (response.data.length > 0) _SET_DATA_FINISHED(curatedData)
                setLoad(1)
            })
            .catch(e => {
                console.log(e);
            });
    }
    let _GET_DATA_MONEY = () => {
        FUNService.reportsFinance(date_1, date_2)
            .then(response => {
                let curatedData = []
                response.data.map(v => {
                    let _CHILD_1 = { tipo: v.tipo, tramite: v.tramite, m_urb: v.m_urb, m_sub: v.m_sub, m_lic: v.m_lic };
                    let isPH = regexChecker_isPh(_CHILD_1, true);
                    if (isPH) {
                        if (date_1 <= v.clock_license_ph && v.clock_license_ph <= date_2) curatedData.push(v)
                    }
                    else curatedData.push(v)
                })

                if (response.data.length > 0) _SET_DATA_MONEY(curatedData)
                setLoad(1)
            })
            .catch(e => {
                console.log(e);
            });
    }
    let _GET_DATA_RESUME = () => {
        FUNService.reportsResume(date_1, date_2)
            .then(response => {
                _SET_DATA_RESUME(response.data)
                setLoad(1)
            })
            .catch(e => {
                console.log(e);
            });
    }

    let _SET_DATA_RESUME = (_data) => {
        var dataResume = [];
        var auditoria = [];
        _data.map(v => {
            dataResume.push(report_data_10(v));
            // auditoria.push(report_data_13(v));

        })
        setDataResume(dataResume);
        // setDataAuditoria(auditoria);
    }

    let _SET_DATA_MONEY = (_data) => {
        var dataMon = [];

        _data.map(v => {
            dataMon.push(report_data_6(v));


        })
        setDataMoney(dataMon);

    }
    let _SET_DATA_FINISHED = (_data) => {
        var dataCon = [];
        var dataCon2 = [];
        var dataCam = [];
        var dataDan = [];
        var dataPlan = [];
        var dataMin = [];
        var dataMon = [];
        var dataCmdb = [];
        var dataPlan2 = [];
        var dataIga = [];
        var notaria = [];
        var FPDM = [];
        var auditoria = [];


        _data.map(v => {
            dataCon.push(report_data_1(v));
            dataCam.push(report_data_2(v));
            dataDan.push(report_data_3(v));
            dataPlan.push(report_data_4(v));
            dataMin.push(report_data_5(v));
            //dataMon.push(report_data_6(v));
            if (cons_7(v)) dataCmdb.push(report_data_7(v));
            dataPlan2.push(report_data_8(v));
            dataCon2.push(report_data_9(v));
            dataIga.push(report_data_11(v));
            notaria.push(report_data_12(v));
            auditoria.push(report_data_13(v));
            FPDM.push(report_data_14(v));
        })

        setDataCon(dataCon);
        setDataCon2(dataCon2);
        setDataCam(dataCam);
        setDataDan(dataDan);
        setDataPlan(dataPlan);
        setDataMin(dataMin);
        //setDataMoney(dataMon);
        setDataCMDB(dataCmdb);
        setDataPlan2(dataPlan2);
        setDataIgac(dataIga);
        setDataNotaria(notaria);
        setDataAuditoria(auditoria);
        setDataFDPM(FPDM);

    }
    // *************************  DATA CONVERTERS ********************** //
    let _JOIN_FIELDS = (row, fields, up) => {
        let strName = [];
        let iterator = 0;
        try {
            iterator = row[fields[0]].split(';').length
        } catch (error) {
        }
        if (iterator > 0) {
            strName = Array(iterator).fill('')
            fields.map(field => {
                const srtArray = row[field].split(';');
                srtArray.map((value, i) => strName[i] += (up ? (value).toUpperCase() : value) + ' ')
            })
        }
        return strName.join(', ').trim()
    }
    let _GET_STATE_STR = (state) => {
        if (state < '-1') return 'DESISTIDO (Ejecución)'
        if (state == '-1') return 'INCOMPLETO'
        if (state == '1') return 'INCOMPLETO'
        if (state == '5') return 'LYDF'
        if (state == '50') return 'EXPEDICIÓN'
        if (state == '100') return 'OTORGADA'
        if (state == '101') return 'OTORGADA'
        if (state == '200') return 'DESISTIDO'
        if (state == '201') return 'DESISTIDO (Incompleto)'
        if (state == '202') return 'DESISTIDO (No radicó valla)'
        if (state == '203') return 'DESISTIDO (No subsanó Acta)'
        if (state == '204') return 'DESISTIDO (No radicó pagos)'
        if (state == '205') return 'DESISTIDO (Voluntario)'
        if (state == '206') return 'DESISTIDO (Negada)'
        return ''
    }

    // (DATA, STRING SEPARATOS, INDEX  (OPTIONAL), TO FIXED NUMBER (OPTIONAL))
    function _FIELDS_ADD(field, ss, ind, dec) {
        if (!field) return (0).toFixed(dec ?? 0);
        let fields = field.split('&&');
        let sum = 0;
        fields.map(f => {
            let areas = f.split(ss);
            if (ind == undefined) areas.map(a => sum += Number(a))
            else sum += Number(areas[ind]);
        }
        );
        return (sum).toFixed(dec ?? 0);
    }
    function _FIELDS_MULTIPLY(field1, field2, ss1, ss2) {
        if (!field1 || !field2) return 0;
        let fields1 = field1.split(ss1);
        let fields2 = field2.split(ss2);
        let prod = 0;
        fields1.map((f, i) => prod += (f * fields2[i]))
        return (prod).toFixed(0);
    }
    function _FIELDS_GET_GREATER(field, ss, ind, dec) {
        if (!field) return 0;
        let fields = field.split('&&');
        let bigest = -Infinity;
        fields.map(f => {
            let num = f.replace(/^\D+/g, '');
            if (Number(num )> Number(bigest)) bigest = num;
        }
        );
        return bigest == -Infinity ? 0 : bigest;
    }
    function _FIELDS_GET_HISTORIC_SUM(v) {
        let historic = 0;
        let historicConfig = getJSON(v.arule_json, 'tagh');
        historicConfig = historicConfig ? historicConfig.split(';') : [];
        let historicIndex = historicConfig.map((h, i) => {
            let con = (h).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes('historic');
            if (con) return i;
            else return -1;
        });

        let historicArray = v.r33a_history ? v.r33a_history.split('&&') : [];
        historicArray = historicArray.map(h => h ? h.split(';') : []);

        historicIndex.map(index => {
            if (index > -1) historicArray.map(arr => {
                arr.map((v, i) => {
                    if (i == index) historic += Number(v);
                })
            })
        })

        return historic;
    }

    // EXP SUPPORT FUNCTIONS
    function _FIND(exp, use, desc) {
        if (!use && !desc) return exp;

        let _use = use ? use.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : undefined;
        let _desc = desc ? desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : undefined;

        return exp.filter(e => {
            let __use = e.use ? e.use.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : undefined;
            let __desc = e.desc ? e.desc.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : undefined;

            if (!__use && !__desc) return false;
            if (__use && !__desc) return __use.includes(_use);
            if (!__use && __desc) return __desc.includes(_desc)
            if (__use && __desc) return __use.includes(_use) || __desc.includes(_desc)
        })
    }
    function _ADD(exp, field, use, desc) {
        let _exp = _FIND(exp, use, desc);
        let sum = 0;
        _exp.map(e => sum += Number(e[field]))
        return sum;
    }

    // EXP SUPPORT FUNCTIONS
    function _FIND_F5(fun5, roles) {
        if (!fun5) return {};
        for (let i = 0; i < fun5.length; i++) {
            const f5 = fun5[i];
            if (roles.includes(f5.role)) {
                let _f5 = f5;
                _f5.name = f5.name.toUpperCase();
                _f5.surname = f5.surname.toUpperCase();
                return _f5;
            }
        }
        return {};
    }
    // ******************************* JSX ***************************** // 
    let _LIST_NEW = () => {
        var list = [];
        data.sort((a, b) => new Date(b.clock_payment) - new Date(a.clock_payment));

        data.map(value => {
            var condition = moment(value.clock_payment).isBetween(date_i, date_f);
            if (condition) list.push(value);
        })

        return <>
            <h4 className='fw-bold'>NUEVAS SOLICITUDES: {list.length}</h4>
            <div class="d-flex flex-wrap">
                {list.map(value => <div class="input-group-prepend border border-primary">
                    <div class="input-group-text">
                        <label>{(value.id_public).slice(-7)} - {moment(value.clock_payment).format('MM-DD')}</label></div>
                </div>)}
            </div>
        </>
    }
    let _LIST_FINISH = () => {
        var list = []
        var _data = Array.from(localData);
        _data.sort((a, b) => new Date(b.clock_license || b.clock_archive) - new Date(a.clock_license || a.clock_archive));

        _data.map(value => {
            var condition = moment(value.clock_license).isBetween(date_i, date_f);
            var condition2 = moment(value.clock_archive).isBetween(date_i, date_f);
            var condition3 = moment(value.clock_license_2).isBetween(date_i, date_f);
            if (condition || condition3) list.push(value);
        })

        return <>
            <h4 className='fw-bold'>SOLICITUDES EXPEDIDAS : {list.length}</h4>
            <div class="d-flex flex-wrap">
                {list.map(value => {
                    let _CHILD_1 = { tipo: value.tipo, tramite: value.tramite, m_urb: value.m_urb, m_sub: value.m_sub, m_lic: value.m_lic };
                    let isPH = regexChecker_isPh(_CHILD_1, true);

                    return <div class="input-group-prepend border border-success">
                        <div class="input-group-text">
                            <label>{isPH ? value.id_public_ph : (value.id_public ?? '').slice(-7)}</label></div>
                    </div>
                }
                )} </div></>
    }
    // ******************************* APIS **************************** // 
    let generateCVS = (_header, _data, _name) => {
        var rows = [];
        const headRows = _header
        rows = _data.map(d => d.map(r => (String(r.value ?? '')).replace(/[\n\r]+ */g, ' ')));
        rows.unshift(headRows);

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(";")).join("\n");


        var encodedUri = encodeURI(csvContent);
        const fixedEncodedURI = encodedUri.replaceAll('#', '%23').replaceAll('°', 'r');

        var link = document.createElement("a");
        link.setAttribute("href", fixedEncodedURI);
        link.setAttribute("download", `INFORME ${_name}  (${date_1} - ${date_2}).csv`);
        document.body.appendChild(link); // Required for FF

        link.click();
    }
    return (
        <div>
            <div className='row my-2'>
                <div className='col'>
                    {_LIST_FINISH()}
                </div>
            </div>

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS CONTRALORIA - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_1, dataContraloria, 'CONTRALORIA')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_0']} onClick={() => setPre({ ['pre_0']: !preview['pre_0'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_0'] ? <div className='row container-sh'>
                <Spreadsheet data={dataContraloria} columnLabels={header_1} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS CONTRAELORIA DEPARTAMENTAL - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_9, dataContraloria2, 'CONTRALORIA DEPARTAMENTAL')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_8']} onClick={() => setPre({ ['pre_8']: !preview['pre_8'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_8'] ? <div className='row container-sh'>
                <Spreadsheet data={dataContraloria2} columnLabels={header_9} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS CAMACOL - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_2, dataCamacol, 'CAMACOL')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_1']} onClick={() => setPre({ ['pre_1']: !preview['pre_1'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_1'] ? <div className='row container-sh'>
                <Spreadsheet data={dataCamacol} columnLabels={header_2} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS DANE - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_3, dataDane, 'DANE')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_2']} onClick={() => setPre({ ['pre_2']: !preview['pre_2'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_2'] ? <div className='row container-sh'>
                <Spreadsheet data={dataDane} columnLabels={header_3} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS PLANEACION - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_4, dataPlaneacion, 'PLANEACION')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_3']} onClick={() => setPre({ ['pre_3']: !preview['pre_3'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_3'] ? <div className='row container-sh'>
                <Spreadsheet data={dataPlaneacion} columnLabels={header_4} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS MINISTERIO DE VIVIENDA - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_5, dataMinisterio, 'MINISTERIO DE VIVIENDA')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_4']} onClick={() => setPre({ ['pre_4']: !preview['pre_4'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_4'] ? <div className='row container-sh'>
                <Spreadsheet data={dataMinisterio} columnLabels={header_5} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS EXPENSAS - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_6, dataMoney, 'EXPENSAS')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_5']} onClick={() => setPre({ ['pre_5']: !preview['pre_5'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_5'] ? <div className='row container-sh'>
                <Spreadsheet data={dataMoney} columnLabels={header_6} />
            </div> : ''}


            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>DATOS CDMB - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_7, dataCMDB, 'CDMB')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_6']} onClick={() => setPre({ ['pre_6']: !preview['pre_6'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_6'] ? <div className='row container-sh'>
                <Spreadsheet data={dataCMDB} columnLabels={header_7} />
            </div> : ''}

            {process.env.REACT_APP_GLOBAL_ID == 'cb1'
                ? <>
                    <div className='row my-2'>
                        <div className='col'>
                            <label className='fw-bold'>DATOS PLANEACION 2 - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_8, dataPlaneacion2, 'PLEANEACION 2')}>
                                <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_7']} onClick={() => setPre({ ['pre_7']: !preview['pre_7'] })} >
                                    <MDBIcon fas icon='eye' /></MDBBtn></label>
                        </div>
                    </div>
                    {preview['pre_7'] ? <div className='row container-sh'>
                        <Spreadsheet data={dataPlaneacion2} columnLabels={header_8} />
                    </div> : ''}
                </>
                : null}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>OBSERVATORIO IGAC - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_11, dataIgac, 'Observatorio IGAC')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_11']} onClick={() => setPre({ ['pre_11']: !preview['pre_11'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_11'] ? <div className='row container-sh'>
                <Spreadsheet data={dataIgac} columnLabels={header_11} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>SUPERINTENDENCIA DE NOTARIADO Y REGISTRO - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_12, dataNotaria, 'Superintendencia de Notariado y Registro')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_12']} onClick={() => setPre({ ['pre_12']: !preview['pre_12'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_12'] ? <div className='row container-sh'>
                <Spreadsheet data={dataNotaria} columnLabels={header_12} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>AUDITORES CONTRA DEPARTAMENTAL - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_13, dataAuditoria, 'Auditores Contra departamental')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_13']} onClick={() => setPre({ ['pre_13']: !preview['pre_13'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_13'] ? <div className='row container-sh'>
                <Spreadsheet data={dataAuditoria} columnLabels={header_13} />
            </div> : ''}

            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>INFORME LICENCIAS EXP. CURAD. URB. (F-DPM-1220-238,37-018) - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_14, dataFDPM, 'INFORME LICENCIAS EXP. CURAD. URB. (F-DPM-1220-238,37-018)')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_14']} onClick={() => setPre({ ['pre_14']: !preview['pre_14'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_14'] ? <div className='row container-sh'>
                <Spreadsheet data={dataFDPM} columnLabels={header_14} />
            </div> : ''}


            <div className='row my-2'>
                <div className='col'>
                    <label className='fw-bold'>RESUMEN - <MDBBtn floating tag='a' color='success' size='sm' outline onClick={() => generateCVS(header_10, dataResume, 'Resumen')}>
                        <MDBIcon fas icon='download' /></MDBBtn> <MDBBtn floating tag='a' color='primary' size='sm' outline={!preview['pre_9']} onClick={() => setPre({ ['pre_9']: !preview['pre_9'] })} >
                            <MDBIcon fas icon='eye' /></MDBBtn></label>
                </div>
            </div>
            {preview['pre_9'] ? <div className='row container-sh'>
                <Spreadsheet data={dataResume} columnLabels={header_10} />
            </div> : ''}




        </div >
    );
}
