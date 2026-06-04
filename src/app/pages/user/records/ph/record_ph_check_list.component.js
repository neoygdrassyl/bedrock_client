import { useState } from 'react';
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import RECORD_PH from '../../../../services/record_ph.service';
import usePHSave from './hooks/usePHSave';
import { savePHStep } from './utils/phSaveStep';

const getPHReviewDetails = (sectionId) => {
    const section = REVIEW_DOCS.find((reviewSection) => reviewSection.pid === sectionId);
    if (!section) return [];

    return section.items
        .filter((item) => Array.isArray(item.rtype) && item.rtype.includes('ph'))
        .map((item) => item.name);
};

const PH_AREA_DETAILS = getPHReviewDetails('rar_3');
const PH_PLANT_DETAILS = getPHReviewDetails('rar_4');

export default function RECORD_PH_CHECK_LIST(props) {
    const { swaMsg, currentItem, currentRecord, currentVersionR, requestUpdateRecord } = props;
    const { execute } = usePHSave(swaMsg);

    let LOAD_STEP = (_id_public) => {
        const _CHILD = Array.isArray(currentRecord.record_ph_steps) ? currentRecord.record_ph_steps : [];
        for (let i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version === currentVersionR && _CHILD[i].id_public === _id_public) return _CHILD[i]
        }
        return []
    }

    let _GET_STEP_TYPE = (_id_public, _type) => {
        const STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        let value = STEP[_type]
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

    const initialChecks = _GET_STEP_TYPE('phcl', 'check');
    const [checks, setChecks] = useState(() => {
        const arr = [...initialChecks];
        while (arr.length < 28) arr.push('');
        return arr;
    });

    let _COMPONENT = () => {
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
                    { desc: 'Cuadro general de las áreas del proyecto arquitectónico', i: 9, details: PH_AREA_DETAILS },
                ]
            },
            {
                title: 'Plantas arquitectónicas por piso, sótano o semisótano  cubiertas', items: [
                    { desc: 'Primera planta relacionada con el espacio público', i: 10, details: PH_PLANT_DETAILS },
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

        return LIST.map((list) => {
            const sectionKey = list.title || `phcl-section-${list.items.map((item) => item.i).join('-')}`;
            return <div className="row border" key={sectionKey}>
                {list.title ? <div className='col-3 text-center '><span className='fw-bold'>{list.title}</span></div> : ''}
                <div className='col'>
                    {list.items.map((item) => {
                        return <div className='row border' key={`phcl-item-${item.i}`}>
                                <div className='col'>
                                    <span>
                                        {item.desc}
                                        {item.details?.length ? (
                                            <ul className="mb-0 ps-3 small text-muted">
                                                {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                                            </ul>
                                        ) : null}
                                    </span>
                                </div>
                                <div className='col-2'>
                                    <select
                                        aria-label={item.desc}
                                        className={_GET_SELECT_COLOR_VALUE(checks[item.i])}
                                        value={checks[item.i]}
                                        onChange={(e) => handleCheckChange(item.i, e.target.value)}
                                    >
                                        <option value="0" className="text-danger">NO</option>
                                        <option value="1" className="text-success">SI</option>
                                        <option value="2" className="text-warning">NA</option>
                                    </select>
                                </div>
                            </div>
                    })}
                </div>
            </div>
        })
    }

    const handleCheckChange = async (index, value) => {
        const newChecks = [...checks];
        newChecks[index] = value;
        setChecks(newChecks);

        const formData = new FormData();
        formData.set('check', newChecks.join(';'));
        formData.set('version', currentVersionR);
        formData.set('recordPhId', currentRecord.id);
        formData.set('id_public', 'phcl');

        const step = LOAD_STEP('phcl');
        const result = await execute(savePHStep(RECORD_PH, step, formData), {
            operationName: 'guardar checklist',
            loading: false,
            success: false,
            error: true,
        });

        if (result.ok) {
            requestUpdateRecord(currentItem.id);
        }
    }

    return (
        <div>
            {_COMPONENT()}
        </div>
    );
}
