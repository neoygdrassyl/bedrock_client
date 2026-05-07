import { useState, useEffect } from 'react';

import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service';
import RECORD_LAW_SERVICE from '../../../../services/record_law.service';
import { swalConfirm, swalError } from '../../../../utils/swalAdapter';
import usePHSave from './hooks/usePHSave';
import { savePHStep } from './utils/phSaveStep';

export default function RECORD_PH_FLOOR(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord, attachs } = props;
    const { execute } = usePHSave({ swaMsg });
    const REVIEW = REVIEW_DOCS;

    const [a1, setA1] = useState({ f01: '', f02: '', f03: '', f04: '' });
    const [a2, setA2] = useState({ f01: '', f02: '', f03: '', f04: '', f05: '', f06: '' });
    const [i1, setI1] = useState({ f01: '' });
    const [n2, setN2] = useState({ f01: '', f02: '' });
    const [m1, setM1] = useState({ f01: '' });
    const [m2, setM2] = useState({ f01: '' });
    const [n3, setN3] = useState({ f01: '', f02: '', f03: '' });
    const [n3v, setN3v] = useState({ f01: '', f02: '', f03: '' });
    const [n3t, setN3t] = useState({ f01: '', f02: '', f03: '' });
    const [o1, setO1] = useState({ f01: '', f02: '' });
    const [o2, setO2] = useState({ f01: '' });
    const [n4, setN4] = useState({ f01: '', f02: '', f03: '', f04: '' });
    const [v1, setV1] = useState({ f01: '' });
    const [v2, setV2] = useState({ f01: '' });
    const [v3, setV3] = useState({ f01: '', f02: '', f03: '' });
    const [v4, setV4] = useState({ f01: '' });
    const [s1, setS1] = useState({ f01: '', f02: '', f03: '' });
    const [v5, setV5] = useState({ f01: '' });
    const [d1, setD1] = useState({ f01: '' });
    const [p1, setP1] = useState({ f01: '' });
    const [e1, setE1] = useState({ f01: '' });
    const [e2, setE2] = useState({ f01: '', f02: '' });
    const [h1, setH1] = useState({ f01: '', f02: '', f03: '' });
    const [h2, setH2] = useState({ f01: '', f02: '', f03: '', f04: '', f05: '', f06: '', f07: '', f08: '', f09: '', f10: '' });
    const [f1, setF1] = useState({ f01: '', f02: '', f03: '', f04: '', f05: '' });
    const [c1, setC1] = useState({ f01: '' });
    const [r1, setR1] = useState({ f01: '' });

    const [showIncluir, setShowIncluir] = useState(false);
    const [showCub, setShowCub] = useState(false);
    const [showAnexo, setShowAnexo] = useState(false);
    const [incluyeSelect, setIncluyeSelect] = useState('');
    const [cub0, setCub0] = useState('');
    const [cub1, setCub1] = useState('');
    const [ext0, setExt0] = useState(false);
    const [ext1, setExt1] = useState('');
    const [ext2, setExt2] = useState(false);
    const [ext3, setExt3] = useState('');
    const [checkArrayState, setCheckArrayState] = useState([null, null, null, null, null, null]);
    const [checkedReviews, setCheckedReviews] = useState(new Set());

    const [toggle, setToggle] = useState(0);
    const [cubSelected, setCubSelected] = useState({
        item_1: null,
        item_2: null,
        item_3: null,
        item_4: null,
        item_5: null,
        item_6: null,
    });
    const [lastButton, setLastButton] = useState(false);

    useEffect(() => {
        const _CHILD = _GET_CHILD_1(currentItem);
        setToggle(_CHILD.item_1);
        const _CHILD_1 = _GET_CHILD_1_LATER(currentItem);
        setLastButton(_CHILD_1.item_2);
        setCub0(_CHILD_1.item_0 ?? '');
        setCub1(_CHILD_1.item_1 ?? '');
        const _CHILD_1_LATER = _GET_CHILD_1_LATER_LIST(currentItem);
        if (_CHILD_1_LATER && Array.isArray(_CHILD_1_LATER)) {
            const next = {};
            _CHILD_1_LATER.forEach(it => { next[it.type] = it; });
            setCubSelected({
                item_1: next['cub1'] || null,
                item_2: next['cub2'] || null,
                item_3: next['cub3'] || null,
                item_4: next['cub4'] || null,
                item_5: next['cub5'] || null,
                item_6: next['cub6'] || null,
            });
        }
        const _CHILD_VARS = _GET_CHILD_1(currentItem);
        setExt0(_CHILD_VARS.item_0 == 1);
        setExt1(_CHILD_VARS.item_1 ?? '');
        setExt2(_CHILD_VARS.item_2 == 1);
        setExt3(_CHILD_VARS.item_3 ?? '');
        const _CHILD_6 = _GET_CHILD_6();
        const nextChecks = [null, null, null, null, null, null];
        for (let i = 0; i < 6; i++) {
            nextChecks[i] = _CHILD_6['item_' + i] ?? null;
        }
        setCheckArrayState(nextChecks);
        const review = _GET_REVIEW();
        setCheckedReviews(new Set(review));
    }, [currentItem]);

    const SECTION_MAP = [
        { id: 'phfa', state: a1, set: setA1, labels: ['AREA TOTAL', 'AREA NO BALCON', 'AREA POR PISO', 'ALTURA PROMEDIO'] },
        { id: 'phfb', state: a2, set: setA2, labels: ['AREA SEMISOTANO', 'AREA ZINJA', 'AREA BALCON', 'AREA MEZANINE', 'AREA COMUN', 'AREA CONSTRUIDA'] },
        { id: 'phfi', state: i1, set: setI1, labels: ['NUMERO DE PARQUEADEROS'] },
        { id: 'phfn', state: n2, set: setN2, labels: ['SEPARACION FRONTAL MINIMA', 'SEPARACION LATERAL MINIMA'] },
        { id: 'phfm', state: m1, set: setM1, labels: ['ANCHO FRONTAL MINIMO'] },
        { id: 'phfm2', state: m2, set: setM2, labels: ['PROFUNDIDAD MINIMA'] },
        { id: 'phfn3', state: n3, set: setN3, labels: ['SEPARACION POSTERIOR', 'SEPARACION LATERAL 1', 'SEPARACION LATERAL 2'] },
        { id: 'phfn3v', state: n3v, set: setN3v, labels: ['VIVIENDAS', 'VIVIENDAS', 'VIVIENDAS'] },
        { id: 'phfn3t', state: n3t, set: setN3t, labels: ['TERRENOS', 'TERRENOS', 'TERRENOS'] },
        { id: 'phfo', state: o1, set: setO1, labels: ['CARRERA', 'CALLE'] },
        { id: 'phfo2', state: o2, set: setO2, labels: ['ESQUINA'] },
        { id: 'phfn4', state: n4, set: setN4, labels: ['METROS SUPERFICIE 1', 'METROS SUPERFICIE 2', 'METROS SUPERFICIE 3', 'METROS SUPERFICIE 4'] },
        { id: 'phfv', state: v1, set: setV1, labels: ['VIVIENDA VIS'] },
        { id: 'phfv2', state: v2, set: setV2, labels: ['VIVIENDA VIP'] },
        { id: 'phfv3', state: v3, set: setV3, labels: ['ESTRATO 1', 'ESTRATO 2', 'ESTRATO 3'] },
        { id: 'phfv4', state: v4, set: setV4, labels: ['DESPLAZADOS'] },
        { id: 'phfs', state: s1, set: setS1, labels: ['SOTANO', 'SEMISOTANO', 'ZINJA'] },
        { id: 'phfv5', state: v5, set: setV5, labels: ['CONJUNTO CERRADO'] },
        { id: 'phfd', state: d1, set: setD1, labels: ['DENSIDAD'] },
        { id: 'phfp', state: p1, set: setP1, labels: ['CONSTRUCCION DE VIVIENDA'] },
        { id: 'phfe', state: e1, set: setE1, labels: ['EXCESO EN ALTURA'] },
        { id: 'phfe2', state: e2, set: setE2, labels: ['RETIRO SUPERIOR', 'RETIRO SUPERIOR NORMA'] },
        { id: 'phfh', state: h1, set: setH1, labels: ['ALTURA EDIFICACION', 'NIVELES', 'ALTURA EN NIVELES'] },
        { id: 'phfh2', state: h2, set: setH2, labels: ['ALTURA BASICA', 'ALTURA BASICA PLUS', 'ALTURA ESPECIAL', 'INDICE', 'INDICE PLUS', 'INDICE ESPECIAL', 'INDICE ADICIONAL', 'ESCALONADA', 'ESCALONADA PLUS', 'ESCALONADA ESPECIAL'] },
        { id: 'phff', state: f1, set: setF1, labels: ['FACHADA', 'MATERIAL', 'HASTA', 'RESTO', 'MODIFICACION'] },
        { id: 'phfc', state: c1, set: setC1, labels: ['NUMERO DE PISOS'] },
        { id: 'phfr', state: r1, set: setR1, labels: ['RENOVACION'] },
    ];

    const _JSON_VECTOR = ['phfa', 'phfb', 'phfi', 'phfn', 'phfm', 'phfm2', 'phfn3', 'phfn3v', 'phfn3t', 'phfo', 'phfo2', 'phfn4', 'phfv', 'phfv2', 'phfv3', 'phfv4', 'phfs', 'phfv5', 'phfd', 'phfp', 'phfe', 'phfe2', 'phfh', 'phfh2', 'phff', 'phfc', 'phfr'];

    let _GET_CHILD_1 = (_item) => {
        var _CHILD = _item.fun_1s;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_0: "",
            item_1: "",
            item_2: "",
            item_3: "",
        }
        if (_CHILD) {
            if (_CHILD[_CURRENT_VERSION] != null) {
                _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id ?? "";
                _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ?? "";
                _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ?? "";
                _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ?? "";
            }
        }
        return _CHILD_VARS;
    }

    let _GET_CHILD_1_LATER = (_item) => {
        var _CHILD = _item.fun_1;
        var _CHILD_VARS = {
            item_0: "",
            item_1: "",
            item_2: "",
        }
        if (_CHILD) {
            _CHILD_VARS.item_0 = _CHILD.id ?? "";
            _CHILD_VARS.item_1 = _CHILD.tipo ?? "";
            _CHILD_VARS.item_2 = _CHILD.tramite ?? "";
        }
        return _CHILD_VARS;
    }

    let _GET_CHILD_1_LATER_LIST = (_item) => {
        var _CHILD = _item.fun_1_list;
        var _LIST = [];
        if (_CHILD) {
            _LIST = _CHILD;
        }
        return _LIST;
    }

    const _GET_CHILD_6 = () => {
        var _CHILD = currentItem.fun_rs;
        var _CURRENT_VERSION = currentVersion - 1;
        var _CHILD_VARS = {
            item_0: null,
            item_1: null,
            item_2: null,
            item_3: null,
            item_4: null,
            item_5: null,
        }
        if (_CHILD && _CHILD[_CURRENT_VERSION]) {
            for (var i = 0; i < _CHILD[_CURRENT_VERSION].length; i++) {
                if (_CHILD[_CURRENT_VERSION][i] != null) {
                    _CHILD_VARS['item_' + i] = _CHILD[_CURRENT_VERSION][i];
                }
            }
        }
        return _CHILD_VARS;
    }

    let LOAD_STEP = (_id_public) => {
        var _CHILD = Array.isArray(currentRecord.record_ph_steps) ? currentRecord.record_ph_steps : [];
        for (var i = 0; i < _CHILD.length; i++) {
            if (_CHILD[i].version == currentVersionR && _CHILD[i].id_public == _id_public) return _CHILD[i]
        }
        return []
    }

    let _GET_STEP_TYPE = (_id_public, _type) => {
        var STEP = LOAD_STEP(_id_public);
        if (!STEP.id) return [];
        var value = STEP[_type]
        if (!value) return [];
        value = value.split(';');
        return value
    }

    let _GET_REVIEW = () => {
        const REVIEW = [];
        if (currentRecord != null) {
            const value = currentRecord.record_ph?.review ?? currentRecord.review ?? '';
            if (value) return value.split(',');
        }
        return REVIEW;
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

    const handleSectionChange = (setState) => (field) => (e) => {
        let val = e.target.value;
        if (e.target.type === 'number') val = val.replaceAll(',', '.').replace(/[^0-9.]/g, '');
        setState(prev => ({ ...prev, [field]: val }));
    };

    let manage_item = async (e, id) => {
        if (e) e.preventDefault();
        const section = SECTION_MAP.find(s => s.id === id);
        if (!section) return;
        const values = Object.values(section.state);
        const formData = new FormData();
        formData.set('value', values.join(';'));
        formData.set('version', currentVersionR);
        formData.set('recordPhId', currentRecord.id);
        formData.set('id_public', id);
        await execute(savePHStep(RECORD_PH_SERVICE, LOAD_STEP(id), formData), {
            operationName: `guardar sección ${id}`,
            success: true,
            error: true,
            onSuccess: () => requestUpdateRecord(currentItem.id),
        });
    }

    let manage_rar = async (e) => {
        if (e) e.preventDefault();
        const formData = new FormData();
        const checks = Array.from(checkedReviews).join(',');
        formData.set('review', checks);
        const recordId = currentRecord.record_ph?.id ?? currentRecord.id;
        await execute(RECORD_PH_SERVICE.update(recordId, formData), {
            operationName: 'guardar lista de checkeo',
            success: true,
            error: true,
            onSuccess: () => requestUpdateRecord(currentItem.id),
        });
    }

    let save_item_61 = async (e, id) => {
        if (e) e.preventDefault();
        const formData = new FormData();
        formData.set('value', e.target.value);
        formData.set('version', currentVersionR);
        formData.set('recordPhId', currentRecord.id);
        formData.set('id_public', id);
        await execute(savePHStep(RECORD_PH_SERVICE, LOAD_STEP(id), formData), {
            operationName: `guardar sección ${id}`,
            success: false,
            error: true,
        });
    }

    let toggle_not = (setter) => setter(prev => !prev);

    let removeItem = (id) => {
        swalConfirm('Remover elemento', '¿Esta seguro de remover este elemento de la informacion?', () => {
            RECORD_LAW_SERVICE.delete(id)
                .then(response => {
                    if (response.data === 'OK') requestUpdateRecord(currentItem.id);
                })
                .catch(e => swalError({ title: 'Error en eliminación', text: e.message }));
        });
    }

    let _COMPONENT_REVIEW = () => {
        const _COMPONENT_RETURN = _GET_REVIEW().map(review => {
            const found = REVIEW.find(re => re['alias'] == review);
            const item = { ...found };
            if (item.name) item.name = item.name.toUpperCase();
            if (item.desc) item.desc = item.desc.toUpperCase();
            return item;
        })
        return _COMPONENT_RETURN;
    }

    let _CHECK_ARRAY = () => {
        let _LIST = [0, 1, 2, 3, 4, 5];
        let _COMPONENT = [];
        for (var i = 0; i < _LIST.length; i++) {
            _COMPONENT.push(
                checkArrayState[i] ?
                    <div className="row border" key={i}>
                        <div className="col">
                            <select className="form-control form-control-sm" value={checkArrayState[i] ?? ''}
                                onChange={(e) => {
                                    const next = [...checkArrayState];
                                    next[i] = e.target.value;
                                    setCheckArrayState(next);
                                }}>
                                <option value="1">INCLUIR CONTRIBUYENTES INMUEBLE</option>
                                <option value="2">INCLUIR CONTRIBUYENTES LINDEROS</option>
                                <option value="3">INCLUIR PROPIETARIOS PREDIO</option>
                                <option value="4">INCLUIR PROPIETARIOS LINDEROS</option>
                                <option value="5">INCLUIR TITULARES APROBACION</option>
                                <option value="6">INCLUIR AUTORIZA DESPUES</option>
                            </select>
                        </div>
                        <div className="col-3">
                            <button className="btn btn-danger" onClick={() => removeItem(i)}>BORRAR</button>
                        </div>
                    </div>
                    : null
            );
        }
        return _COMPONENT;
    }

    let _COMPONENT = () => {
        let _CHILD_VARS = _GET_CHILD_1(currentItem);
        let _CHILD_1 = _GET_CHILD_1_LATER(currentItem);
        let _CHILD_2 = _GET_CHILD_1_LATER_LIST(currentItem);
        let _CHILD_6 = _GET_CHILD_6();

        let _JOIN_ARRAY = [];
        if (attachs) _JOIN_ARRAY = attachs;

        return (
            <div className='record_ph_i container'>
                {SECTION_MAP.map(sec => {
                    const data = _GET_STEP_TYPE(sec.id, 'value');
                    return (
                        <div className='row border' key={sec.id}>
                            {sec.labels.map((label, i) => {
                                const field = `f0${i + 1}`;
                                return (
                                    <div className='col' key={field}>
                                        <div className="row">
                                            <div className="col-6">
                                                <label>{label}</label>
                                            </div>
                                            <div className="col">
                                                <input type={field === 'f01' ? "text" : "number"}
                                                    className='form-control'
                                                    value={sec.state[field]}
                                                    onChange={handleSectionChange(sec.set)(field)} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="col-3">
                                <button className="btn btn-danger btn-block" onClick={(e) => manage_item(e, sec.id)}>GUARDAR</button>
                            </div>
                        </div>
                    );
                })}

                <div className='row border'>
                    <div className="col">
                        <div className="row">
                            <label className="app-p lead fw-bold text-uppercase text-start">¿Qué listas incluye?</label>
                            <div className="text-start">
                                {_COMPONENT_REVIEW().map((rev, index) => <span key={rev.alias || rev.name || index}>{rev.name} <br /></span>)}
                            </div>
                        </div>
                        <div className="row">
                            <div className="row">
                                <div className="col">
                                    <label>ESTA SOLICITUD INCLUYE: </label>
                                </div>
                                <div className="col">
                                <select className="form-select" value={incluyeSelect}
                                    onChange={(e) => { setIncluyeSelect(e.target.value); save_item_61(e, 'phfpr'); }}>
                                    <option value="">APLIQUE PARA AGREGAR O ELIMINAR</option>
                                    <option value="1">INCLUIR CONTRIBUYENTES INMUEBLE</option>
                                    <option value="2">INCLUIR CONTRIBUYENTES LINDEROS</option>
                                    <option value="3">INCLUIR PROPIETARIOS PREDIO</option>
                                    <option value="4">INCLUIR PROPIETARIOS LINDEROS</option>
                                    <option value="5">INCLUIR TITULARES APROBACION</option>
                                    <option value="6">INCLUIR AUTORIZA DESPUES</option>
                                </select>
                                </div>
                            </div>
                            {_CHECK_ARRAY()}
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-1">
                        <button className="btn btn-danger btn-block" onClick={() => toggle_not(setShowIncluir)}>INCLUIR</button>
                    </div>
                    <div className="col-1">
                        <button className="btn btn-info btn-block" onClick={() => toggle_not(setShowCub)}>CUB</button>
                    </div>
                </div>

                {showIncluir && (
                    <div className='row border'>
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <h3 className="text-center">INCLUIR DOCUMENTO</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="row">
                                        <label className="app-p lead text-start fw-bold">DOCUMENTO EXTERNO ANEXO</label>
                                        <div className="col">
                                            <div className="form-check ms-5">
                                                <input className="form-check-input" type="checkbox" checked={ext0}
                                                    onChange={(e) => { setExt0(e.target.checked); save_item_61(e, 'phfpr0'); }} />
                                                <label className="form-check-label">INCLUIR</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>DESCRIPCION</label>
                                            <textarea className="form-control mb-3" rows="3" maxLength="2000"
                                                value={ext1}
                                                onChange={(e) => setExt1(e.target.value)}
                                                onBlur={(e) => save_item_61(e, 'phfpr1')}
                                                placeholder="DESCRIPCION DEL DOCUMENTO (MAXIMO 2000 CARACTERES)"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showCub && (
                    <div className='row border'>
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <h3 className="text-center">INCLUIR CUB</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="row">
                                        <div className="col">
                                            <div className="input-group">
                                                <select className="form-select" value={cub0}
                                                    onChange={(e) => { setCub0(e.target.value); manage_item(e, 'phfpr_cub_0'); }}>
                                                    <option value="">SELECCIONE UNA CATEGORIA DE CUB</option>
                                                    <option value="1">CUB 1</option>
                                                    <option value="2">CUB 2</option>
                                                    <option value="3">CUB 3</option>
                                                    <option value="4">CUB 4</option>
                                                    <option value="5">CUB 5</option>
                                                    <option value="6">CUB 6</option>
                                                </select>
                                                <select className="form-select" value={cub1}
                                                    onChange={(e) => { setCub1(e.target.value); manage_item(e, 'phfpr_cub_1'); }}>
                                                    <option value="">SELECCIONE UNA CATEGORIA DE CUB</option>
                                                    <option value="1">CUB 1</option>
                                                    <option value="2">CUB 2</option>
                                                    <option value="3">CUB 3</option>
                                                    <option value="4">CUB 4</option>
                                                    <option value="5">CUB 5</option>
                                                    <option value="6">CUB 6</option>
                                                </select>
                                                <button className="btn btn-danger" onClick={(e) => manage_item(e, 'phfpr_cub')}>GENERAR</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row">
                    <div className="col-1">
                        <button className="btn btn-danger btn-block" onClick={() => toggle_not(setShowAnexo)}>ANEXO</button>
                    </div>
                </div>

                {showAnexo && (
                    <div className='row border'>
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <h3 className="text-center">ANEXO</h3>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div className="row">
                                        <label className="app-p lead text-start fw-bold">DOCUMENTO EXTERNO ANEXO</label>
                                        <div className="col">
                                            <div className="form-check ms-5">
                                                <input className="form-check-input" type="checkbox" checked={ext2}
                                                    onChange={(e) => { setExt2(e.target.checked); save_item_61(e, 'phfpr2'); }} />
                                                <label className="form-check-label">INCLUIR</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label>DESCRIPCION</label>
                                            <textarea className="form-control mb-3" rows="3" maxLength="2000"
                                                value={ext3}
                                                onChange={(e) => setExt3(e.target.value)}
                                                onBlur={(e) => save_item_61(e, 'phfpr3')}
                                                placeholder="DESCRIPCION DEL DOCUMENTO (MAXIMO 2000 CARACTERES)"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="record_ph_i container">
            {_COMPONENT()}
        </div>
    )
}
