import { useState, useEffect } from 'react';
import { REVIEW_DOCS } from '../../../../components/jsons/arcReviewDocs';
import RECORD_PH_SERVICE from '../../../../services/record_ph.service';
import { swalError } from '../../../../utils/swalAdapter';
import usePHSave from './hooks/usePHSave';
import { savePHStep } from './utils/phSaveStep';

export default function RECORD_PH_GEN_ARC_REVIEW(props) {
    const { translation, swaMsg, globals, currentItem, currentVersion, currentRecord, currentVersionR, requestUpdateRecord } = props;
    const { execute } = usePHSave({ swaMsg });
    const REVIEW = REVIEW_DOCS;

    const [stateMap, setStateMap] = useState(new Map());
    const [rewType, setRewType] = useState('');

    useEffect(() => {
        const next = new Map();
        REVIEW.forEach(re => {
            const _value = _GET_STEP_TYPE(re.pid, 'value');
            const _check = _GET_STEP_TYPE(re.pid, 'check');
            const _context = _GET_STEP_TYPE(re.pid + '_c', 'value');
            re.items.forEach(it => {
                if (!it.rtype.includes('ph')) return;
                const key = `${re.pid}_${it.v}`;
                next.set(key, {
                    value: _value[it.v] ?? '',
                    check: _check[it.c] ?? '1',
                    context: _context[it.v] ?? '',
                });
            });
        });
        setStateMap(next);
        setRewType(_GET_REVIEW_TYPE());
    }, [currentRecord.record_ph_steps, currentVersionR]);

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

    let _GET_REVIEW_TYPE = () => {
        let STEPS = Array.isArray(currentRecord.record_ph_steps) ? currentRecord.record_ph_steps : [];
        for (const step of STEPS) {
            if (step.version == currentVersionR && step.name.includes('TIPO DE REVISION ')) {
                if (step.name.includes('URBANISMO')) return 1;
                if (step.name.includes('ARQUITECTURA')) return 2;
                if (step.name.includes('ESTRUCTURAL')) return 3;
                if (step.name.includes('GEOTECNIA')) return 4;
                if (step.name.includes('ELECTRICO')) return 5;
                if (step.name.includes('HIDRAULICO')) return 6;
                if (step.name.includes('INCENDIOS')) return 7;
            }
        }
        return 0;
    }

    const handleChange = (rePid, itV, itC, field) => (e) => {
        const key = `${rePid}_${itV}`;
        setStateMap(prev => {
            const next = new Map(prev);
            const existing = next.get(key) || { value: '', check: '1', context: '' };
            next.set(key, { ...existing, [field]: e.target.value });
            return next;
        });
    };

    let manage_rar = async (e, value) => {
        if (e) e.preventDefault();
        const formData = new FormData();
        formData.set('recordPhId', currentRecord.id);
        formData.set('version', currentVersionR);
        let _types = {
            1: 'URBANISMO',
            2: 'ARQUITECTURA',
            3: 'ESTRUCTURAL',
            4: 'GEOTECNIA',
            5: 'ELECTRICO',
            6: 'HIDRAULICO',
            7: 'INCENDIOS',
        };
        let _type = _types[value] ?? '';
        formData.set('name', 'TIPO DE REVISION ' + _type);
        formData.set('value', value);
        formData.set('check', '');
        formData.set('desc', _type);
        formData.set('id_public', 'phrew');
        formData.set('json', JSON.stringify({
            '0': { value: value, desc: _type, check: '' },
        }));
        await execute(savePHStep(RECORD_PH_SERVICE, 'phrew', formData), {
            operationName: 'guardar tipo de revisión',
            success: true,
            error: true,
            onSuccess: () => {
                setRewType(value);
                requestUpdateRecord(currentItem.id);
            },
        });
    }

    let manage_rar_rew = async (e) => {
        if (e) e.preventDefault();
        let _LIMIT_STEPS = 0;
        REVIEW.forEach((rew) => {
            if (rew.rtype.includes('ph')) _LIMIT_STEPS++;
        });

        let _SAVE_STEPS = 0;
        for (const rew of REVIEW) {
            if (!rew.rtype.includes('ph')) continue;
            _SAVE_STEPS++;
            const values = [rew.title ?? ''];
            const checks = ['0'];

            rew.items.forEach(it => {
                if (!it.rtype.includes('ph')) return;
                const key = `${rew.pid}_${it.v}`;
                const st = stateMap.get(key) || { value: '', check: '1' };
                values.push(st.value);
                checks.push(st.check);
            });

            const formData = new FormData();
            formData.set('json', rew.rtype.join(';'));
            formData.set('value', values.join(';'));
            formData.set('check', checks.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordPhId', currentRecord.id);
            formData.set('id_public', rew.pid);

            const isLast = _SAVE_STEPS === _LIMIT_STEPS;
            await execute(savePHStep(RECORD_PH_SERVICE, rew.pid, formData), {
                operationName: `guardar revisión ${rew.pid}`,
                success: false,
                error: true,
                onSuccess: isLast ? () => requestUpdateRecord(currentItem.id) : undefined,
            });
        }
    }

    let manage_rar_context = async (e) => {
        if (e) e.preventDefault();
        let _LIMIT_STEPS = 0;
        REVIEW.forEach((rew) => {
            if (rew.rtype.includes('ph')) _LIMIT_STEPS++;
        });

        let _SAVE_STEPS = 0;
        for (const rew of REVIEW) {
            if (!rew.rtype.includes('ph')) continue;
            _SAVE_STEPS++;
            const values = [rew.title ?? ''];

            rew.items.forEach(it => {
                if (!it.rtype.includes('ph')) return;
                const key = `${rew.pid}_${it.v}`;
                const st = stateMap.get(key) || { context: '' };
                values.push(st.context);
            });

            const formData = new FormData();
            formData.set('value', values.join(';'));
            formData.set('version', currentVersionR);
            formData.set('recordPhId', currentRecord.id);
            formData.set('id_public', rew.pid + '_c');

            const isLast = _SAVE_STEPS === _LIMIT_STEPS;
            await execute(savePHStep(RECORD_PH_SERVICE, rew.pid + '_c', formData), {
                operationName: `guardar contexto ${rew.pid}`,
                success: false,
                error: true,
                onSuccess: isLast ? () => requestUpdateRecord(currentItem.id) : undefined,
            });
        }
    }

    let _COMPONENT = () => {
        let _GET_REVIEW_TYPE = () => {
            let STEPS = Array.isArray(currentRecord.record_ph_steps) ? currentRecord.record_ph_steps : [];
            for (const step of STEPS) {
                if (step.version == currentVersionR && step.name.includes('TIPO DE REVISION ')) {
                    if (step.name.includes('URBANISMO')) return 1;
                    if (step.name.includes('ARQUITECTURA')) return 2;
                    if (step.name.includes('ESTRUCTURAL')) return 3;
                    if (step.name.includes('GEOTECNIA')) return 4;
                    if (step.name.includes('ELECTRICO')) return 5;
                    if (step.name.includes('HIDRAULICO')) return 6;
                    if (step.name.includes('INCENDIOS')) return 7;
                }
            }
            return 0;
        }
        return _GET_REVIEW_TYPE()
    }

    return (
        <div>
            {_MASTER_LIST_COMPONENT()}
            {REVIEW.map(re => {
                if (!re.rtype.includes('ph')) return null;
                return (
                    <div className='row border' key={re.pid}>
                        {re.title ? <div className='col-3 text-center fw-bold'>{re.title}</div> : null}
                        <div className='col'>
                            {re.items.map(it => {
                                if (!it.rtype.includes('ph')) return null;
                                const key = `${re.pid}_${it.v}`;
                                const st = stateMap.get(key) || { value: '', check: '1', context: '' };
                                return (
                                    <div className='row border' key={it.v}>
                                        <div className='col'>
                                            <label className={it.className ?? ''}>{it.name}</label>
                                            {st.check === '0'
                                                ? <input type="text" value={st.context}
                                                    className="form-control form-control-sm"
                                                    onBlur={() => manage_rar_context()}
                                                    onChange={handleChange(re.pid, it.v, it.c, 'context')}
                                                    style={{backgroundColor: 'LightPink'}} />
                                                : <input type='hidden' value={st.context} />
                                            }
                                        </div>
                                        <div className='col-2 text-center'>
                                            <select className={_GET_SELECT_COLOR_VALUE(st.check)}
                                                value={st.check}
                                                onChange={handleChange(re.pid, it.v, it.c, 'check')} >
                                                <option value="0" className="text-danger">NO CUMPLE</option>
                                                <option value="1" className="text-success">CUMPLE</option>
                                                <option value="2" className="text-warning">NO APLICA</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            <div className='row border'>
                <div className='col'>
                    <label className={'text-primary'}>* ITEMS DE LA LISTA DE CHECKEO</label>
                </div>
            </div>
        </div>
    );

    function _MASTER_LIST_COMPONENT() {
        return (
            <div className='row border'>
                <div className='col-3 text-center'>
                    <select className={_GET_SELECT_COLOR_VALUE(rewType)} defaultValue={''}
                        value={rewType} onChange={e => manage_rar(e, e.target.value)}>
                        <option className="text-danger">TIPO DE REVISIÓN</option>
                        <option className="text-warning" value="1">URBANISMO</option>
                        <option className="text-warning" value="2">ARQUITECTURA</option>
                        <option className="text-warning" value="3">ESTRUCTURAL</option>
                        <option className="text-warning" value="4">GEOTECNIA</option>
                        <option className="text-warning" value="5">ELECTRICO</option>
                        <option className="text-warning" value="6">HIDRAULICO</option>
                        <option className="text-warning" value="7">INCENDIOS</option>
                    </select>
                </div>
                <div className='col text-start'>
                    <label className='text-danger'>Seleccione el tipo de revisión realizada sobre el proyecto</label>
                </div>
            </div>
        )
    }
}
