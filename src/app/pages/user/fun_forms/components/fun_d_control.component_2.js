import React, { Component } from 'react';
import { MDBBtn } from 'mdb-react-ui-kit';
import FUN_SERVICE from '../../../../services/fun.service';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Series from '../../../../components/jsons/funCodes.json';
import Codes from '../../../../components/jsons/fun6DocsList.json';
import { SERIES_DOCS, _GET_SERIE_COD, _GET_SUBSERIE_COD, getJSONFull } from '../../../../components/customClasses/typeParse';

const MySwal = withReactContent(Swal);
export default function FUN_D_CONTROL_2(props) {
    const { currentItem, swaMsg, requestUpdate } = props

    // DATA GETTERS
    let GET_CHILD_1 = () => {
        var _CHILD = currentItem.fun_1s;
        var _CURRENT_VERSION = 0;
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
    let GET_CHILD_REVIEW = () => {
        var _CHILD = currentItem.fun_rs;
        var _CURRENT_VERSION = 0;
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD = _CHILD[_CURRENT_VERSION]
            } else {
                _CHILD = false
            }
        }
        return _CHILD;
    }
    let RES_PARSER_1 = (fun_1) => {
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
    let GET_CHILD_51 = (role) => {
        var _CHILD = currentItem.fun_51s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let GET_FUN_51_BY_TITLE = (_role) => {
        let fun_51 = GET_CHILD_51();
        for (let i = 0; i < fun_51.length; i++) {
            const fun51 = fun_51[i];
            if (fun51.role == _role) return fun51;
        }
        return false;
    }
    let GET_CHILD_52 = (role) => {
        var _CHILD = currentItem.fun_52s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let GET_FUN_52_BY_TITLE = (_role) => {
        let fun_52 = GET_CHILD_52();
        for (let i = 0; i < fun_52.length; i++) {
            const fun52 = fun_52[i];
            if (fun52.role == _role) return fun52;
        }
        return false;
    }
    let GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_6s;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let GET_FUN6_CODE = (_CODE) => {
        const FUN_6 = GET_CHILD_6();
        if (FUN_6) {
            let DOC = FUN_6.find(i => i.id_public == _CODE)
            if (DOC) return DOC.pages
            return DOC
        }
        return null
    }
    let GET_CLOCK = () => {
        var _CHILD = currentItem.fun_clocks;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }
    let GET_CLOCK_STATE = (_state) => {
        var _CLOCK = GET_CLOCK();
        if (_state == null) return false;
        for (var i = 0; i < _CLOCK.length; i++) {
            if (_CLOCK[i].state == _state) return _CLOCK[i];
        }
        return false;
    }
    
    // DATA CONVERTERS
    const INVENTORY = GET_CHILD_REVIEW().check_control_inventory ? getJSONFull(GET_CHILD_REVIEW().check_control_inventory) : {};
    const CHILD_1 = GET_CHILD_1();
    const TYPE = RES_PARSER_1(CHILD_1);
    const ONWER = GET_FUN_51_BY_TITLE('PROPIETARIO') ? `${GET_FUN_51_BY_TITLE('PROPIETARIO').name} ${GET_FUN_51_BY_TITLE('PROPIETARIO').surname}` : '';
    const ARCHITHEC = GET_FUN_52_BY_TITLE('ARQUITECTO PROYECTISTA') ? `${GET_FUN_52_BY_TITLE('ARQUITECTO PROYECTISTA').name} ${GET_FUN_52_BY_TITLE('ARQUITECTO PROYECTISTA').surname}` : '';
    const ENG = GET_FUN_52_BY_TITLE('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL') ? `${GET_FUN_52_BY_TITLE('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL').name} ${GET_FUN_52_BY_TITLE('INGENIERO CIVIL DISEÑADOR ESTRUCTURAL').surname}` : '';
    let SUPERVISOR = GET_FUN_52_BY_TITLE('URBANIZADOR O CONSTRUCTOR RESPONSABLE') ? `${GET_FUN_52_BY_TITLE('URBANIZADOR O CONSTRUCTOR RESPONSABLE').name} ${GET_FUN_52_BY_TITLE('URBANIZADOR O CONSTRUCTOR RESPONSABLE').surname}` : '';
    if (!SUPERVISOR) SUPERVISOR = GET_FUN_52_BY_TITLE('DIRECTOR DE LA CONSTRUCCION') ? `${GET_FUN_52_BY_TITLE('DIRECTOR DE LA CONSTRUCCION').name} ${GET_FUN_52_BY_TITLE('DIRECTOR DE LA CONSTRUCCION').surname}` : '';
    const INVENTORY_LIST = [
        { name: 'RESOLUCIÓN', n: 835, i: 0, date: true, label: "Folio(s)", folio: true, dv: () => GET_CLOCK_STATE(70).date_start, },
        { name: 'EJECUTORIA', n: 844, i: 1, date: true, label: "Folio(s)", folio: true, dv: () => GET_CLOCK_STATE(99).date_start, },
        { name: 'NORMA URBANA', n: 912, i: 2, date: true, label: "Folio(s)", folio: true, },
        { name: 'PANOS ARQUITECTÓNICOS', n: 916, i: 3, label: "Plano(s)", folio: true, },
        { name: 'PLANOS ESTRUCTURALES', n: 6605, i: 4, label: "Plano(s)", folio: true, },
        { name: 'PLANOS ELEMENTOS NO ESTRUCTURALES', n: false, i: 5, label: "Plano(s)", folio: true, },
        { name: 'MEMORIA PROYECTO ESTRUCTURALES', n: 6606, i: 6, label: "Folio(s)", folio: true, },
        { name: 'REVISION INDEPENDIENTE', n: false, i: 7, label: "Folio(s)", folio: true, },
        { name: 'PERITAJE ESTRUCTURAL', n: 652, i: 8, label: "Folio(s)", folio: true, },
        { name: 'CERTIFICACIÓN ESTRUCTURAL', n: false, i: 9, label: "Folio(s)", folio: true, },
        { name: 'ESTUDIO DE SUELOS', n: 686, n2: [686, 6602, 6862], i: 10, label: "Folio(s)", folio: true, },
        { name: 'OTROS DOCUMENTOS', n: 912, i: 11, label: "Folio(s)", folio: true, },
        { name: 'CD', n: 998, i: 12, label: "CD(s)", folio: true, },
        { name: 'TOTAL', n: false, i: 13, label: "Folio(s)", folio: true, },
        { name: 'FECHA EXPEDICIÓN LICENCIA', n: false, i: 14, date: true, dv: () => GET_CLOCK_STATE(85).date_start, },
        { name: 'FECHA DE VENCIMIENTO', n: false, i: 15, date: true, },
    ];
    // DATA SAVE
    let save_fun_r = () => {
        let formData = new FormData();
        let inventory = {
            date_create: document.getElementById('date_create').value,
            user_archive: document.getElementById('user_archive').value,
            user_retrieve: document.getElementById('user_retrieve').value,
            date_retrieve: document.getElementById('date_retrieve').value,
            items: INVENTORY_LIST.map(i => ({
                name: i.name,
                date: document.getElementById(`date_${i.n}_${i.i}`) ? document.getElementById(`date_${i.n}_${i.i}`).value : '',
                n: document.getElementById(`folio_${i.n}_${i.i}`) ? document.getElementById(`folio_${i.n}_${i.i}`).value : '',
                label: i.label || '',
            }))
        }


        formData.set('check_control_inventory', JSON.stringify(inventory));
        manage_fun_r(formData);

    }

    let gen_pdf = () => {

        let formData = new FormData();

        let inventory = {
            id: currentItem.id_public,
            type: TYPE,
            owner: ONWER,
            arc: ARCHITHEC,
            eng: ENG,
            sup: SUPERVISOR,

            date_create: document.getElementById('date_create').value,
            user_archive: document.getElementById('user_archive').value,
            user_retrieve: document.getElementById('user_retrieve').value,
            date_retrieve: document.getElementById('date_retrieve').value,
            items: INVENTORY_LIST.map(i => ({
                name: i.name,
                date: document.getElementById(`date_${i.n}_${i.i}`) ? document.getElementById(`date_${i.n}_${i.i}`).value : '',
                n: document.getElementById(`folio_${i.n}_${i.i}`) ? document.getElementById(`folio_${i.n}_${i.i}`).value : '',
                label: i.label || '',
            }))
        }


        formData.set('data', JSON.stringify(inventory));

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        FUN_SERVICE.gen_doc_checkcontrol_2(formData)
            .then(response => {
                if (response.data === 'OK') {
                    MySwal.close();
                    window.open(process.env.REACT_APP_API_URL + "/pdf/controlcheck_2/" + "Hoja de control inventario - " + currentItem.id_public + ".pdf");
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

    let manage_fun_r = (formData) => {
        var _CHILD = GET_CHILD_REVIEW();

        MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        if (_CHILD.id) {
            FUN_SERVICE.update_r(_CHILD.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdate(currentItem.id);
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
        else {
            formData.set('fun0Id', currentItem.id);
            FUN_SERVICE.create_funr(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        requestUpdate(currentItem.id);
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

    }

    // COMPONENT JSX
    const HEADER = () => {
        return <>
            <div className='row'>
                <div className='col-4 border fw-bold'>RADICADO Nr.</div>
                <div className='col-8 border'>{currentItem.id_public}</div>
            </div>
            <div className='row'>
                <div className='col-4 border fw-bold'>MODALIDAD DE LICENCIA</div>
                <div className='col-8 border'>{TYPE}</div>
            </div>
            <div className='row'>
                <div className='col-4 border fw-bold'>PROPIETARIO</div>
                <div className='col-8 border'>{ONWER}</div>
            </div>
            <div className='row'>
                <div className='col-4 border fw-bold'>ARQUITECTO</div>
                <div className='col-8 border'>{ARCHITHEC}</div>
            </div>
            <div className='row'>
                <div className='col-4 border fw-bold'>INGENIERO</div>
                <div className='col-8 border'>{ENG}</div>
            </div>
            <div className='row'>
                <div className='col-4 border fw-bold'>DIRECTOR DE LA CONSTRUCCIÓN</div>
                <div className='col-8 border'>{SUPERVISOR}</div>
            </div>
        </>

    }
    function BODY_DOPCUMENT(item) {
        const find_item = INVENTORY.items ? INVENTORY.items.find(i => i.name == item.name) : {};
        let df_n = 0
        if(item.n2){
            for (let index = 0; index < item.n2.length; index++) {
                const element = item.n2[index];
                if(GET_FUN6_CODE(element)){
                    df_n = GET_FUN6_CODE(element)
                    break;
                }
            }
        }else df_n = GET_FUN6_CODE(item.n) || 0;
        let dv = item.dv ? item.dv() : false
        return <>
            <div className='row'>
                <div className='col-4 border'>{item.name}</div>
                {item.date ? <div className='col-3 border'><input type="date" max='2100-01-01' className='form-control' id={`date_${item.n}_${item.i}`} defaultValue={find_item.date || dv} /></div> : <div className='col-3 border' />}
                {item.folio ? <div className='col-3 border'><input type="number" className='form-control' id={`folio_${item.n}_${item.i}`} defaultValue={find_item.n || df_n} /></div> : <div className='col-3 border' />}
                <div className='col-2 border'>{item.label}</div>
            </div>
        </>
    }
    const BODY = () => {
        return <>
            <div className='row text-center'>
                <div className='col-4 border fw-bold'>DOCUMENTOS</div>
                <div className='col-8 border fw-bold'>CANTIDAD</div>
            </div>
            {INVENTORY_LIST.map(BODY_DOPCUMENT)}
        </>
    }
    const FOOTER = () => {

        return <>
            <div className='row'>
                <div className='col-3 border fw-bold'>FECHA DE ELABORACIÓN</div>
                <div className='col-3 border'><input type="date" max='2100-01-01' className='form-control' id="date_create" defaultValue={INVENTORY.date_create} /></div>
                <div className='col-3 border fw-bold'>PERSONA QUE ARCHIVA</div>
                <div className='col-3 border'><input className='form-control' id="user_archive" defaultValue={INVENTORY.user_archive} /></div>
            </div>
            <div className='row'>
                <div className='col-3 border fw-bold'>FECHA DE RECIBO</div>
                <div className='col-3 border'><input type="date" max='2100-01-01' className='form-control' id="date_retrieve" defaultValue={INVENTORY.date_retrieve} /></div>
                <div className='col-3 border fw-bold'>PERSONA QUE RECIBE</div>
                <div className='col-3 border'><input className='form-control' id="user_retrieve" defaultValue={INVENTORY.user_retrieve} /></div>
            </div>
        </>
    }
    const BUTTONS = () => {
        return <>
            <div className="row my-2">
                <div className="row mb-3 text-center">
                    <div className="col">
                        <MDBBtn className="btn btn-success my-3" onClick={() => save_fun_r()} ><i class="far fa-edit"></i> GUARDAR CAMBIOS </MDBBtn>
                    </div>
                    <div className="col">
                        <MDBBtn className="btn btn-danger my-3" onClick={() => gen_pdf()} ><i class="far fa-file-pdf"></i> GENERAR PDF </MDBBtn>
                    </div>
                </div>
            </div>
        </>
    }

    return (
        <div className='m-3'>
            <div className='row'>
                <div className='col text-center border fw-bold'>DATOS GENERALES</div>
            </div>
            {HEADER()}
            {BODY()}
            {FOOTER()}
            {BUTTONS()}
        </div>
    );
}