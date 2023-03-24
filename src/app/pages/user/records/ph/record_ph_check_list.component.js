import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import RECORD_PH from '../../../../services/record_ph.service';

const MySwal = withReactContent(Swal);

export default function RECORD_PH_CHECK_LIST(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR } = props;
    var _SAVE_STEPS = 0;
    const REVIEWS_TYPES = [
        { name: 'CONSTRUCCIÓN', id: 'con' },
        { name: 'LOTEO, PARCELACIÓN, SUBDIVISIÓN Y URBANISMO', id: 'sub' },
        { name: 'CERRAMIENTO', id: 'cer' },
    ]
    const REVIEW = REVIEW_DOCS;
    // ******************* DATA GETERS ********************* //
    let LOAD_STEP = (_id_public) => {
        var _CHILD = currentRecord.record_ph_steps;
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }
    // *******************  DATA CONVERTERS ******************* //
    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type]
        if (!value) return [];
        value = value.split(';');
        return value
    }
    let _GET_SELECT_COLOR_VALUE = (_VALUE) => {
        if (_VALUE === '0' || _VALUE === 'NO CUMPLE') {
            return 'form-select text-danger form-select-sm';
        }
        if (_VALUE === '1' || _VALUE === 'CUMPLE') {
            return 'form-select text-success form-select-sm';
        }
        if (_VALUE === '2' || _VALUE === 'NO APLICA') {
            return 'form-select text-warning form-select-sm';
        }
        return 'form-select form-select-sm';
    }
    // ******************* COMPONENTS JSX ******************* //
    let _COMPONENT = () => {
        const _CHECK_ARRAY = _GET_STEP_TYPE('phcl', 'check');
        const LIST = [
            { title: 'Planos arquitectónicos', items: [] },
            {
                title: false, items: [
                    { desc: 'Anteproyecto de intervención en BIENES DE INTERÉS CULTURAL (BIC) o en inmuebles colindantes o localizados dentro de su área de influencia', i: 27 },
                ]
            },
            {
                title: 'Rótulo', items: [
                    { desc: 'Dirección', i: 0 },
                    { desc: 'Firma del arquitecto responsable (indispensable validez)', i: 1 },
                    { desc: 'Número de matricula del arquitecto', i: 2 },
                    { desc: 'Escala', i: 3 },
                ]
            },
            {
                title: 'Características del predio', items: [
                    { desc: 'Plano de localización e identificación (georreferenciado art 365 POT)', i: 4 },
                    { desc: 'Sección vial', i: 5 },
                    { desc: 'Nomenclatura vial', i: 6 },
                    { desc: 'Linderos del predio', i: 7 },
                    { desc: 'Norte', i: 8 },
                ]
            },
            {
                title: 'Cuadro de áreas', items: [
                    { desc: 'Cuadro general de las áreas del proyecto arquitectónico', i: 9 },
                ]
            },
            {
                title: 'Plantas arquitectónicas por piso, sótano o semisótano  cubiertas', items: [
                    { desc: 'Primera planta relacionada con el espacio público', i: 10 },
                    { desc: 'Cotas totales y parciales del proyecto', i: 11 },
                    { desc: 'Ejes y elementos estructurales proyectados (Sistema estructural)', i: 12 },
                    { desc: 'Niveles', i: 13 },
                    { desc: 'Usos', i: 14 },
                    { desc: 'Indicación cortes (longitudinal, transversal relacionad con E.Público)', i: 15 },
                    { desc: 'Planta de cubierta', i: 26 },
                ]
            },
            {
                title: 'Cortes', items: [
                    { desc: 'Relación con el espacio público y privado', i: 16 },
                    { desc: 'Indicación de la pendiente del terreno', i: 17 },
                    { desc: 'Niveles por piso', i: 18 },
                    { desc: 'Cotas totales y parciales', i: 19 },
                    { desc: 'Ejes estructurales', i: 20 },
                ]
            },
            {
                title: 'Fachadas', items: [
                    { desc: 'Indicación de la pendiente el terreno', i: 21 },
                    { desc: 'Niveles por piso', i: 22 },
                    { desc: 'Cotas totales y parciales', i: 23 },
                ]
            },
            {
                title: false, items: [
                    { desc: 'Plantas, cortes y fachas a la misma escala', i: 24 },
                ]
            },
            {
                title: false, items: [
                    { desc: 'Planos arquitectónicos para el reconocimiento de la existencia de edificaciones', i: 25 },
                ]
            },
        ]

        return LIST.map((list, i) => {
            return <div className="row border">
                {list.title ? <div className='col-3 text-center '><label className='fw-bold'>{list.title}</label></div> : ''}
                <div className='col'>
                    {list.items.map((item, j) => {
                        return <>
                            <div className='row border'>
                                <div className='col'><label>{item.desc}</label></div>
                                <div className='col-2'><select className={_GET_SELECT_COLOR_VALUE(_CHECK_ARRAY[item.i])}
                                    name="phcl_checks" id={"phcl_checks_" + item.i}
                                    defaultValue={_CHECK_ARRAY[item.i]} onChange={() => manage_rar(false)} >
                                    <option value="0" className="text-danger">NO</option>
                                    <option value="1" className="text-success">SI</option>
                                    <option value="2" className="text-warning">NA</option>
                                </select></div>
                            </div>
                        </>
                    })}
                </div>
            </div>
        })
    }


    // ******************* APIS ******************* //
    let manage_rar = (e) => {
        if (e) e.preventDefault();
        let formData = new FormData();
        let checks = [];
        let checks_html;
        let values = [];

        checks_html = document.getElementsByName('phcl_checks');
        for (var i = 0; i < checks_html.length; i++) {
            checks.push(document.getElementById('phcl_checks_' + i).value)
        }

        formData.set('check', checks.join(';'));

        formData.set('version', currentVersionR);
        formData.set('recordPhId', currentRecord.id);
        formData.set('id_public', 'phcl');

        save_step('phcl', false, formData);
    }

    let save_step = (_id_public, useSwal, formData, start, end) => {
        var STEP = LOAD_STEP(_id_public);

        if (useSwal) MySwal.fire({
            title: swaMsg.title_wait,
            text: swaMsg.text_wait,
            icon: 'info',
            showConfirmButton: false,
        });
        if (STEP.id) {
            RECORD_PH.update_step(STEP.id, formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        if (start != undefined) {
                            if (start == end) props.requestUpdateRecord(currentItem.id);
                        }
                        else props.requestUpdateRecord(currentItem.id);
                    } else {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useSwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
        else {
            RECORD_PH.create_step(formData)
                .then(response => {
                    if (response.data === 'OK') {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.publish_success_title,
                            text: swaMsg.publish_success_text,
                            footer: swaMsg.text_footer,
                            icon: 'success',
                            confirmButtonText: swaMsg.text_btn,
                        });
                        if (start != undefined) {
                            if (start == end) props.requestUpdateRecord(currentItem.id);
                        }
                        else props.requestUpdateRecord(currentItem.id);
                    } else {
                        if (useSwal) MySwal.fire({
                            title: swaMsg.generic_eror_title,
                            text: swaMsg.generic_error_text,
                            icon: 'warning',
                            confirmButtonText: swaMsg.text_btn,
                        });
                    }
                })
                .catch(e => {
                    console.log(e);
                    if (useSwal) MySwal.fire({
                        title: swaMsg.generic_eror_title,
                        text: swaMsg.generic_error_text,
                        icon: 'warning',
                        confirmButtonText: swaMsg.text_btn,
                    });
                });
        }
    }
    return (
        <div>
            {_COMPONENT()}
        </div >
    );
}
