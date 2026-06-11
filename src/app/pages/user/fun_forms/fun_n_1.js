import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import FUNService from '../../../services/fun.service'
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import RequirementPreviewPanel from './components/RequirementPreviewPanel.jsx';
import { useRequirementPreview } from './hooks/useRequirementPreview.js';

function normalizeMultiValue(value, mode = 'csv') {
    if (Array.isArray(value)) return value.map(item => String(item ?? '').trim()).filter(Boolean);
    if (value == null || value === false) return [];
    const text = String(value).trim();
    if (!text) return [];
    if (text.includes(',')) return text.split(',').map(item => item.trim()).filter(Boolean);
    if (mode === 'letters' && /^[A-Za-z]+$/.test(text)) return text.split('').filter(Boolean);
    if (mode === 'usos' && /^[A-D]+$/.test(text)) return text.split('').filter(Boolean);
    return [text];
}

function normalizeScalarValue(value) {
    if (Array.isArray(value)) return value[0] ? String(value[0]).trim() : '';
    if (value == null || value === false) return '';
    return String(value).trim();
}

function getCheckedValues(scope, name) {
    const root = scope || document;
    return Array.from(root.querySelectorAll(`input[name="${name}"]`))
        .filter(input => input.checked)
        .map(input => input.value)
        .filter(Boolean);
}

function getRadioValue(scope, name) {
    const root = scope || document;
    const checked = root.querySelector(`input[name="${name}"]:checked`);
    return checked?.value || '';
}

function getInputValue(scope, id) {
    const root = scope || document;
    return root.querySelector(`#${id}`)?.value?.trim() || '';
}

function buildPreviewActuacionFromChild(childVars = {}) {
    return {
        tipo: normalizeMultiValue(childVars.item_1, 'letters'),
        tramite: normalizeScalarValue(childVars.item_2),
        m_urb: normalizeScalarValue(childVars.item_3),
        m_sub: normalizeScalarValue(childVars.item_4),
        m_lic: normalizeMultiValue(childVars.item_5, 'letters'),
        usos: normalizeMultiValue(childVars.item_6, 'usos'),
        area: normalizeScalarValue(childVars.item_7),
        vivienda: normalizeScalarValue(childVars.item_8),
        cultural: normalizeScalarValue(childVars.item_9),
        regla_1: normalizeScalarValue(childVars.item_101),
        regla_2: normalizeScalarValue(childVars.item_102),
    };
}

function buildPreviewActuacionFromForm(scope, fallback = {}) {
    const otherTramite = getInputValue(scope, 'f_12_o');
    const otherUsos = getInputValue(scope, 'f_16_o');
    const fallbackActuacion = buildPreviewActuacionFromChild(fallback);

    return {
        ...fallbackActuacion,
        tipo: getCheckedValues(scope, 'f_11'),
        tramite: otherTramite || getRadioValue(scope, 'f_12') || fallbackActuacion.tramite,
        m_urb: getRadioValue(scope, 'f_13') || fallbackActuacion.m_urb,
        m_sub: getRadioValue(scope, 'f_14') || fallbackActuacion.m_sub,
        m_lic: getCheckedValues(scope, 'f_15'),
        usos: otherUsos ? [otherUsos] : getCheckedValues(scope, 'f_16'),
        area: getRadioValue(scope, 'f_17') || fallbackActuacion.area,
        vivienda: getRadioValue(scope, 'f_18') || fallbackActuacion.vivienda,
        cultural: getRadioValue(scope, 'f_19') || fallbackActuacion.cultural,
        regla_1: getRadioValue(scope, 'f_101') || fallbackActuacion.regla_1,
        regla_2: getInputValue(scope, 'f_102_o') || getRadioValue(scope, 'f_102') || fallbackActuacion.regla_2,
    };
}

const FUNN1 = ({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) => {
    const [dis_m_urb, setDisMUrb] = useState(true);
    const [dis_m_sub, setDisMSub] = useState(true);
    const [dis_m_lic, setDisMLic] = useState(true);

    useEffect(() => {
        let _CHILD = currentItem.fun_1s ? currentItem.fun_1s[0] : {};
        if (_CHILD && _CHILD.tipo) {
            if (_CHILD.tipo.includes('A')) setDisMUrb(false);
            if (_CHILD.tipo.includes('C')) setDisMSub(false);
            if (_CHILD.tipo.includes('D')) setDisMLic(false);
        }
    }, []);

        var formData = new FormData();

        let _SET_CHILD_1 = () => {
            var _CHILD = currentItem.fun_1s;
            var _CURRENT_VERSION = currentVersion - 1;
            var _CHILD_VARS = {
                item_0: "",
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
                    _CHILD_VARS.item_0 = _CHILD[_CURRENT_VERSION].id;
                    _CHILD_VARS.item_1 = _CHILD[_CURRENT_VERSION].tipo ? _CHILD[_CURRENT_VERSION].tipo : "";
                    _CHILD_VARS.item_2 = _CHILD[_CURRENT_VERSION].tramite ? _CHILD[_CURRENT_VERSION].tramite : "";
                    _CHILD_VARS.item_3 = _CHILD[_CURRENT_VERSION].m_urb ? _CHILD[_CURRENT_VERSION].m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD[_CURRENT_VERSION].m_sub ? _CHILD[_CURRENT_VERSION].m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD[_CURRENT_VERSION].m_lic ? _CHILD[_CURRENT_VERSION].m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD[_CURRENT_VERSION].usos ? _CHILD[_CURRENT_VERSION].usos : "";
                    _CHILD_VARS.item_7 = _CHILD[_CURRENT_VERSION].area ? _CHILD[_CURRENT_VERSION].area : "";
                    _CHILD_VARS.item_8 = _CHILD[_CURRENT_VERSION].vivienda ? _CHILD[_CURRENT_VERSION].vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD[_CURRENT_VERSION].cultural ? _CHILD[_CURRENT_VERSION].cultural : "";
                    _CHILD_VARS.item_101 = _CHILD[_CURRENT_VERSION].regla_1 ? _CHILD[_CURRENT_VERSION].regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD[_CURRENT_VERSION].regla_2 ? _CHILD[_CURRENT_VERSION].regla_2 : "";
                }
            }
            return _CHILD_VARS;
        }

        const previewScopeRef = useRef(null);
        const initialPreviewActuacion = useMemo(() => buildPreviewActuacionFromChild(_SET_CHILD_1()), [currentItem, currentVersion]);
        const [previewActuacion, setPreviewActuacion] = useState(initialPreviewActuacion);
        const initialPreviewSignatureRef = useRef(JSON.stringify(initialPreviewActuacion));
        const requirementPreviewState = useRequirementPreview(previewActuacion, { configStatus: 'published', debounceMs: 500 });

        useEffect(() => {
            const nextSignature = JSON.stringify(initialPreviewActuacion);
            if (initialPreviewSignatureRef.current === nextSignature) return;
            initialPreviewSignatureRef.current = nextSignature;
            setPreviewActuacion(initialPreviewActuacion);
        }, [initialPreviewActuacion]);

        const handlePreviewFormChange = useCallback(() => {
            setPreviewActuacion(buildPreviewActuacionFromForm(previewScopeRef.current, _SET_CHILD_1()));
        }, [currentItem, currentVersion]);

        let _CHILD_0 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <input type="hidden" id="f_10" defaultValue={_CHILD_VARS.item_0} />
        }
        let _CHILD_11 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <div>
                <label>1.1 Tipo de Solicitud</label>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="A" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('A') ? true : false} onChange={e => setDisMUrb(!e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Licencia de Urbanización
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="B" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('B') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Licencia de Parcelación
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="C" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('C') ? true : false} onChange={e => setDisMSub(!e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Licencia de Subdivisión
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="D" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('D') ? true : false} onChange={e => setDisMLic(!e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        D. Licencia de Construcción
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="E" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('E') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        E. Intervención y ocupación del espacio Público
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="F" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('F') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        F. Reconocimiento de la existencia de una edificación
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="G" name="f_11"
                        defaultChecked={_CHILD_VARS.item_1.includes('G') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        G. Otras Actuaciones
                    </label>
                </div>
            </div>
        }
        let _CHILD_12 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <div>
                <label>1.2 Objeto del Tramite</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Inicial
                    </label>
                </div>
                {currentItem.model == 2021 ?
                    <div className="form-check">
                        <input className="form-check-input" type="radio" value="B" name="f_12"
                            defaultChecked={_CHILD_VARS.item_2 == 'B' ? true : false} />
                        <label className="form-check-label" htmlFor="flexCheckChecked">
                            B. Prórroga
                        </label>
                    </div>
                    : currentItem.model == 2022 ?
                        ''
                        : ''}

                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'C' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Modificación de Licencia Vigente
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="D" name="f_12"
                        defaultChecked={_CHILD_VARS.item_2 == 'D' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        D. Revalidación
                    </label>
                </div>
                <div className="input-group my-3">
                    <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="question-circle" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="Otras Actuaciones, ¿Cual?"
                        defaultValue={_CHILD_VARS.item_2 != 'A' && _CHILD_VARS.item_2 != 'B' && _CHILD_VARS.item_2 != 'C'
                            && _CHILD_VARS.item_2 != 'D' ? _CHILD_VARS.item_2 : ""} id="f_12_o" />
                </div>
            </div>
        }
        let _CHILD_13 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let disabled = dis_m_urb;

            return <div>
                <label>1.3 Modalidad Licencia de Urbanización</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'A' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Desarrollo
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'B' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Saneamiento
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_13"
                        defaultChecked={_CHILD_VARS.item_3 == 'C' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Reurbanización
                    </label>
                </div>
            </div>
        }
        let _CHILD_14 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let disabled =  dis_m_sub;

            return <div>
                <label>1.4 Modalidad Licencia de Subdivisión</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'A' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Subdivisión rural
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'B' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Subdivisión urbana
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_14"
                        defaultChecked={_CHILD_VARS.item_4 == 'C' ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Reloteo
                    </label>
                </div>
            </div>
        }
        let _CHILD_15 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let disabled =  dis_m_lic;

            return <div>
                <label>1.5 Modalidad Licencia de Construcción</label>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="A" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('A') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Obra Nueva
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="B" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('B') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Ampliación
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="C" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('C') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Adecuación
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="D" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('D') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        D. Modificación
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="E" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('E') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        E. Restauración
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="F" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('F') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        F. Reforzamiento Estructural
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="G" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('G') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        G.1 Demolición: Total
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="g" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('g') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        G.2 Demolición Parcial
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="H" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('H') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        H. Reconstrucción
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="I" name="f_15"
                        defaultChecked={_CHILD_VARS.item_5.includes('I') ? true : false} disabled={disabled} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        I. Cerramiento
                    </label>
                </div>
            </div>
        }
        let _CHILD_16 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let _arrayHelper = ['ABCD', 'ABC', 'ABD', 'ACD', 'AB', 'AC', 'AD', 'BC', 'BD', 'CD', 'A', 'B', 'C', 'D'];
            let _arrayPretty = "";
            let _otherValue = "";
            if (_CHILD_VARS.item_6) {
                _arrayPretty = _CHILD_VARS.item_6.replace(',', "");
                _otherValue = "";
                let flag = false;
                for (var i = 0; i < _arrayHelper.length; i++) {
                    if (_arrayPretty.includes(_arrayHelper[i])) {
                        flag = true;
                        break
                    }
                }
                if (!flag) {
                    _arrayPretty = "";
                    _otherValue = _CHILD_VARS.item_6;
                }
            }
            return <div>
                <label>1.6 Usos</label>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="A" name="f_16"
                        defaultChecked={_arrayPretty.includes('A') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Vivienda
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="B" name="f_16"
                        defaultChecked={_arrayPretty.includes('B') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Comercio y/o Servicios
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="C" name="f_16"
                        defaultChecked={_arrayPretty.includes('C') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Institucional
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="D" name="f_16"
                        defaultChecked={_arrayPretty.includes('D') ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        D. Industrial
                    </label>
                </div>
                <div className="input-group my-3">
                    <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="question-circle" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="Otro, ¿Cual?"
                        id="f_16_o" defaultValue={_otherValue} />
                </div>
            </div>
        }
        let _CHILD_17 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <div>
                <label>1.7 Área Construida</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Menor a 2000 m2
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'B' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Igual o Mayor a 2000 m2
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_17"
                        defaultChecked={_CHILD_VARS.item_7 == 'C' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Alcanza o supera mediante ampliación los 2000 m2
                    </label>
                </div>
                {currentItem.model == 2021 ?
                    ''
                    : currentItem.model == 2022 ?
                        <div className="form-check">
                            <input className="form-check-input" type="radio" value="D" name="f_17"
                                defaultChecked={_CHILD_VARS.item_7 == 'D' ? true : false} />
                            <label className="form-check-label" htmlFor="flexCheckChecked">
                                D. Genera 5 o más unidades de vivienda para transferir a terceros
                            </label>
                        </div>
                        : ''}
            </div>
        }
        let _CHILD_18 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <div>
                <label>1.8 Tipo de Vivienda</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. VIP
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'B' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. VIS
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_18"
                        defaultChecked={_CHILD_VARS.item_8 == 'C' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. NO VIS
                    </label>
                </div>
            </div>
        }
        let _CHILD_19 = () => {
            let _CHILD_VARS = _SET_CHILD_1();

            return <div>
                <label>1.9  Bien de Interés Cultural</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_19"
                        defaultChecked={_CHILD_VARS.item_9 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. SI
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_19"
                        defaultChecked={_CHILD_VARS.item_9 == 'B' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. NO
                    </label>
                </div>
            </div>
        }
        let _CHILD_101 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let JSXC = <div>
                <label >1.10.1  Declaración sobre medidas de construcción sostenible</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Medidas Pasivas
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'B' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Medidas Activas
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_101"
                        defaultChecked={_CHILD_VARS.item_101 == 'C' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Medidas Activas y Pasivas
                    </label>
                </div>
            </div>
            return currentItem.model == 2021 ?
                JSXC
                : currentItem.model == 2022 ?
                    ''
                    : ''
        }
        let _CHILD_102 = () => {
            let _CHILD_VARS = _SET_CHILD_1();
            let JSXC = <div>
                <label >1.10.2  Zónificacion Climática</label>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="A" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'A' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckDefault">
                        A. Frío
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="B" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'B' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        B. Templado
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="C" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'C' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        C. Cálido Seco
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" value="D" name="f_102"
                        defaultChecked={_CHILD_VARS.item_102 == 'D' ? true : false} />
                    <label className="form-check-label" htmlFor="flexCheckChecked">
                        D. Cálido Húmedo
                    </label>
                </div>
                <div className="input-group my-3">
                    <span className="input-group-text bg-primary text-primary-foreground">
                        <Icon name="question-circle" size={16} />
                    </span>
                    <input type="text" className="form-control" placeholder="Otro clima, ¿Cual?" id="f_102_o"
                        defaultValue={_CHILD_VARS.item_102 != 'A' && _CHILD_VARS.item_102 != 'B' && _CHILD_VARS.item_102 != 'C'
                            && _CHILD_VARS.item_102 != 'D' ? _CHILD_VARS.item_102 : ""} />
                </div>
            </div>
            return currentItem.model == 2021 ?
                JSXC
                : currentItem.model == 2022 ?
                    ''
                    : ''
        }
        let _RESET_FORM_1 = () => {
            let _array = []
            //_array = document.getElementsByName("f_11");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];

            _array = document.getElementsByName("f_12");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_13");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_14");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            //_array = document.getElementsByName("f_15");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            //_array = document.getElementsByName("f_16");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_17");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_18");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_19");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_101");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            _array = document.getElementsByName("f_102");
            for (var i = 0; i < _array.length; i++) {
                _array[i].checked = false;
            }
            _array = [];
            if (document.getElementById('f_12_o')) document.getElementById('f_12_o').value = "";
            document.getElementById('f_16_o').value = "";
            if (document.getElementById('f_102_o')) document.getElementById('f_102_o').value = "";
        }

        let new_1 = () => {
            formData = new FormData();
            let fun1Id = document.getElementById("f_10").value;
            let version = currentVersion;
            let fun0Id = currentItem.id;
            formData.set('version', version);
            formData.set('fun0Id', fun0Id);

            let value = null;
            let checkbox = null;
            let radios = null;
            let otherOption = null;
            // SET OF THE VARIABLES

            // 1.1 CAN BE MULTIPLE
            value = []
            checkbox = document.getElementsByName("f_11");
            for (var i = 0; i < checkbox.length; i++) {
                if (checkbox[i].checked) {
                    value.push(checkbox[i].value)
                }
            } formData.set('tipo', value);
            value = "";

            // 1.2 CAN BE OTHERS
            otherOption = document.getElementById("f_12_o");
            if (otherOption.value) {
                value = otherOption.value
            } else {
                radios = document.getElementsByName("f_12"); // USES OTHER OPTION
                for (var i = 0; i < radios.length; i++) {
                    if (radios[i].checked == true) {
                        value = radios[i].value
                    }
                }
            } formData.set('tramite', value);
            otherOption = null;
            value = "";

            // 1.3
            radios = document.getElementsByName("f_13");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('m_urb', value);
            value = "";

            // 1.4
            radios = document.getElementsByName("f_14");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('m_sub', value);
            value = "";

            // 1.5 CAN BE MULTIPLE
            value = []
            checkbox = document.getElementsByName("f_15");
            for (var i = 0; i < checkbox.length; i++) {
                if (checkbox[i].checked) {
                    value.push(checkbox[i].value)
                }
            } formData.set('m_lic', value);
            value = "";

            // 1.6 CAN BE MULTIPLE && CAN BE OTHERS
            value = []
            otherOption = document.getElementById("f_16_o");
            if (otherOption.value) {
                value.push(otherOption.value)
            } else {
                checkbox = document.getElementsByName("f_16"); // USES OTHER OPTION
                for (var i = 0; i < checkbox.length; i++) {
                    if (checkbox[i].checked) {
                        value.push(checkbox[i].value)
                    }
                }
            } formData.set('usos', value);
            otherOption = null;
            value = "";

            // 1.7 
            radios = document.getElementsByName("f_17");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('area', value);
            value = "";

            // 1.8
            radios = document.getElementsByName("f_18");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('vivienda', value);
            value = "";

            // 1.9
            radios = document.getElementsByName("f_19");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('cultural', value);
            value = "";

            // 1.10.1
            radios = document.getElementsByName("f_101");
            for (var i = 0; i < radios.length; i++) {
                if (radios[i].checked == true) {
                    value = radios[i].value
                }
            } formData.set('regla_1', value);
            value = "";

            // 1.10.2 CAN BE OTHERS
            otherOption = document.getElementById("f_102_o");
            if (otherOption) {
                if (otherOption.value) {
                    value = otherOption.value
                } else {
                    radios = document.getElementsByName("f_102");  // USES OTHER OPTION
                    for (var i = 0; i < radios.length; i++) {
                        if (radios[i].checked == true) {
                            value = radios[i].value
                        }
                    }
                } formData.set('regla_2', value);
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            const fun1s = Array.isArray(currentItem.fun_1s) ? currentItem.fun_1s : [];
            const currentFun1 = fun1s[currentVersion - 1];

            if (currentFun1 == null) {
                FUNService.create_fun1(formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            } else {
                FUNService.update_1(fun1Id, formData)
                    .then(response => {
                        if (response.data === 'OK') {
                            swalSuccess({ title: swaMsg.publish_success_title, text: swaMsg.publish_success_text, footer: swaMsg.text_footer });
                            requestUpdate(currentItem.id)
                        } else {
                            swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                        }
                    })
                    .catch(e => {
                        console.log(e);
                        swalError({ title: swaMsg.generic_eror_title, text: swaMsg.generic_error_text });
                    });
            }

        }
        return (<>
            {_CHILD_0()}
            <fieldset ref={previewScopeRef} onChange={handlePreviewFormChange} className="p-3">
                <legend className="my-2 px-3 Collapsible" id="funn_1">
                    <label className="app-p lead fw-normal">1. Identificación de la Solicitud</label>
                </legend>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_11()}
                    </div>
                    <div className="col-6">
                        {_CHILD_12()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_13()}
                    </div>
                    <div className="col-6">
                        {_CHILD_14()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_15()}
                    </div>
                    <div className="col-6">
                        {_CHILD_16()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_17()}
                    </div>
                    <div className="col-6">
                        {_CHILD_18()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-6">
                        {_CHILD_19()}
                    </div>
                    <div className="col-6">
                        {_CHILD_102()}
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-12">
                        {_CHILD_101()}
                    </div>
                </div>
                <RequirementPreviewPanel state={requirementPreviewState} />
                <div className="row mb-3 text-center">
                    <div className="col-6">
                        <Button size="sm" className="my-3" onClick={() => new_1()}><Icon name="file-alt" size={16} /> ACTUALIZAR </Button>
                    </div>
                    <div className="col-6">
                        <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3" onClick={() => { _RESET_FORM_1(); handlePreviewFormChange(); }}><Icon name="eraser" size={16} /> LIMPIAR </Button>
                    </div>
                </div>
            </fieldset>
        </>);
};

export default FUNN1;
