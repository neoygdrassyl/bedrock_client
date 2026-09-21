import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import FUNService from '../../../services/fun.service'
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import RequirementPreviewPanel from './components/RequirementPreviewPanel.jsx';
import FunUpdateSectionLegend from './components/FunUpdateSectionLegend.jsx';
import IdentificationChangeLogTable from './components/IdentificationChangeLogTable.jsx';
import { useRequirementPreview } from './hooks/useRequirementPreview.js';
import './fun_n_1.css';

const FUN_1_DILIGENCIADO_POR_KEYS = ['tipo', 'tramite', 'm_urb', 'm_sub', 'm_lic', 'usos', 'area', 'vivienda', 'cultural', 'regla_1', 'regla_2'];
const DILIGENCIADO_POR_DEFAULT = 'NO_DILIGENCIADO';
const DILIGENCIADO_POR_VALUES = new Set(['SOLICITANTE', 'CURADURIA', DILIGENCIADO_POR_DEFAULT]);
const FUN_1_MULTI_KEYS = new Set(['tipo', 'm_lic', 'usos']);
const FUN_1_OPTIONS = {
    tipo: ['A. Licencia de Urbanización', 'B. Licencia de Parcelación', 'C. Licencia de Subdivisión', 'D. Licencia de Construcción', 'E. Intervención y ocupación del espacio Público', 'F. Reconocimiento de la existencia de una edificación', 'G. Otras Actuaciones'],
    tramite: ['A. Inicial', 'B. Prórroga', 'C. Modificación de Licencia Vigente', 'D. Revalidación'],
    m_urb: ['A. Desarrollo', 'B. Saneamiento', 'C. Reurbanización'],
    m_sub: ['A. Subdivisión rural', 'B. Subdivisión urbana', 'C. Reloteo'],
    m_lic: ['A. Obra Nueva', 'B. Ampliación', 'C. Adecuación', 'D. Modificación', 'E. Restauración', 'F. Reforzamiento Estructural', 'G.1 Demolición: Total', 'G.2 Demolición Parcial', 'H. Reconstrucción', 'I. Cerramiento'],
    usos: ['A. Vivienda', 'B. Comercio y/o Servicios', 'C. Institucional', 'D. Industrial'],
    area: ['A. Menor a 2000 m2', 'B. Igual o Mayor a 2000 m2', 'C. Alcanza o supera mediante ampliación los 2000 m2'],
    vivienda: ['A. VIP', 'B. VIS', 'C. NO VIS'],
    cultural: ['A. SI', 'B. NO'],
    regla_1: ['A. Medidas Pasivas', 'B. Medidas Activas', 'C. Medidas Activas y Pasivas'],
    regla_2: ['A. Frío', 'B. Templado', 'C. Cálido Seco', 'D. Cálido Húmedo'],
};
const FUN_1_TITLES = {
    tipo: '1.1 Tipo de Solicitud', tramite: '1.2 Objeto del Trámite', m_urb: '1.3 Modalidad Licencia de Urbanización', m_sub: '1.4 Modalidad Licencia de Subdivisión', m_lic: '1.5 Modalidad Licencia de Construcción', usos: '1.6 Usos', area: '1.7 Área Construida', vivienda: '1.8 Tipo de Vivienda', cultural: '1.9 Bien de Interés Cultural', regla_1: '1.10.1 Declaración sobre medidas de construcción sostenible', regla_2: '1.10.2 Zonificación Climática',
};
const FUN_1_SUBTITLES = {
    tipo: 'Clasifique el tipo de licencia o actuación solicitada.',
    tramite: 'Indique la actuación que se presenta para estudio.',
    m_urb: 'Seleccione la modalidad de urbanización aplicable.',
    m_sub: 'Seleccione la modalidad de subdivisión aplicable.',
    m_lic: 'Seleccione la modalidad de construcción aplicable.',
    usos: 'Identifique los usos previstos en la solicitud.',
    area: 'Defina el rango del área construida del proyecto.',
    vivienda: 'Identifique la clasificación de la vivienda.',
    cultural: 'Indique si el inmueble es de interés cultural.',
    regla_1: 'Seleccione las medidas de construcción sostenible.',
    regla_2: 'Indique la zonificación climática del proyecto.',
};
const FUN_1_INPUT_NAMES = {
    tipo: 'f_11', tramite: 'f_12', m_urb: 'f_13', m_sub: 'f_14', m_lic: 'f_15', usos: 'f_16', area: 'f_17', vivienda: 'f_18', cultural: 'f_19', regla_1: 'f_101', regla_2: 'f_102',
};
const FUN_1_CHANGE_TARGET_IDS = {
    tipo: '1.1', tramite: '1.2', m_urb: '1.3', m_sub: '1.4', m_lic: '1.5', usos: '1.6', area: '1.7', vivienda: '1.8', cultural: '1.9', regla_1: '1.10.1', regla_2: '1.10.2',
};

export function getFun1ForVersion(entries, targetVersion) {
    const version = Number(targetVersion);
    if (!Number.isInteger(version) || version < 1 || !Array.isArray(entries)) return null;
    return entries.find((entry) => Number(entry?.version) === version) || null;
}

function getDiligenciadoPor(anex2) {
    let metadata = anex2;
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch {
            metadata = {};
        }
    }
    const values = metadata?.identificacion?.radicacion?.diligenciado_por || metadata?.diligenciado_por;
    const source = values && typeof values === 'object'
        ? values
        : {};

    return Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [
        key,
        DILIGENCIADO_POR_VALUES.has(source[key]) ? source[key] : DILIGENCIADO_POR_DEFAULT,
    ]));
}

function getActualizarDiligenciadoPor(anex2) {
    let metadata = anex2;
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch {
            metadata = {};
        }
    }
    const values = metadata?.identificacion?.actualizar?.diligenciado_por;
    return Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [
        key,
        DILIGENCIADO_POR_VALUES.has(values?.[key]) ? values[key] : DILIGENCIADO_POR_DEFAULT,
    ]));
}

function getActualizarDiligenciadoPorKeys(anex2) {
    let metadata = anex2;
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch {
            metadata = {};
        }
    }
    const values = metadata?.identificacion?.actualizar?.diligenciado_por;
    return new Set(FUN_1_DILIGENCIADO_POR_KEYS.filter(key => Object.prototype.hasOwnProperty.call(values || {}, key)));
}

function getEffectiveDiligenciadoPor(key, radicacionValues, actualizarValues, actualizarKeys) {
    const radicacionValue = radicacionValues[key] || DILIGENCIADO_POR_DEFAULT;
    return actualizarKeys.has(key)
        ? actualizarValues[key] || DILIGENCIADO_POR_DEFAULT
        : radicacionValue;
}

function getIdentificationMetadata(anex2) {
    let metadata = anex2;
    if (typeof metadata === 'string') {
        try {
            metadata = JSON.parse(metadata);
        } catch {
            metadata = {};
        }
    }
    return metadata?.identificacion && typeof metadata.identificacion === 'object' ? metadata.identificacion : null;
}

function getFun1IdentificationValues(fun1) {
    return Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [
        key,
        fun1?.[key] == null ? '' : String(fun1[key]),
    ]));
}

function serializeIdentificationValue(value) {
    if (Array.isArray(value)) return value.map(item => String(item ?? '').trim()).filter(Boolean).join(',');
    return String(value ?? '').trim();
}

function getFun1OptionValue(key, label) {
    if (key === 'm_lic' && label.startsWith('G.1')) return 'G';
    if (key === 'm_lic' && label.startsWith('G.2')) return 'g';
    return label.charAt(0);
}

function getFun1Options(key, model) {
    const options = FUN_1_OPTIONS[key] || [];
    if (key === 'tramite' && Number(model) !== 2021) return options.filter(option => !option.startsWith('B.'));
    if (key === 'area' && Number(model) === 2022) return [...options, 'D. Genera 5 o más unidades de vivienda para transferir a terceros'];
    return options;
}

function getOtherOptionValue(key, value, model) {
    const text = String(value || '').trim();
    if (!text) return '';
    const optionValues = getFun1Options(key, model).map(option => getFun1OptionValue(key, option));
    if (key === 'usos') return normalizeMultiValue(text, 'usos').every(item => optionValues.includes(item)) ? '' : text;
    return optionValues.includes(text) ? '' : text;
}

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
    const currentFun1 = getFun1ForVersion(currentItem.fun_1s, currentVersion);
    const isInitialRadicacion = currentFun1 == null;
    const [changeLogEntries, setChangeLogEntries] = useState([]);
    const [changeLogDraftDetails, setChangeLogDraftDetails] = useState({});
    const [changeLogReceiptStatus, setChangeLogReceiptStatus] = useState('SIN DEFINIR');
    const [changeLogLoading, setChangeLogLoading] = useState(false);
    const [changeLogError, setChangeLogError] = useState('');
    const [deletingChangeLogEntryId, setDeletingChangeLogEntryId] = useState(null);
    const requestResponsibleName = useMemo(() => {
        const responsibles = Array.isArray(currentItem.fun_53s) ? currentItem.fun_53s : [];
        const responsible = responsibles.find(item => Number(item.version) === Number(currentVersion));
        return [responsible?.name, responsible?.surname].filter(Boolean).join(' ').trim();
    }, [currentItem.fun_53s, currentVersion]);

    useEffect(() => {
        if (currentFun1?.tipo) {
            if (currentFun1.tipo.includes('A')) setDisMUrb(false);
            if (currentFun1.tipo.includes('C')) setDisMSub(false);
            if (currentFun1.tipo.includes('D')) setDisMLic(false);
        }
    }, [currentFun1]);

        var formData = new FormData();

        let _SET_CHILD_1 = () => {
            const _CHILD = currentFun1;
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
                item_diligenciado_por: getDiligenciadoPor(),
            }
            if (_CHILD) {
                    _CHILD_VARS.item_0 = _CHILD.id;
                    _CHILD_VARS.item_1 = _CHILD.tipo ? _CHILD.tipo : "";
                    _CHILD_VARS.item_2 = _CHILD.tramite ? _CHILD.tramite : "";
                    _CHILD_VARS.item_3 = _CHILD.m_urb ? _CHILD.m_urb : "";
                    _CHILD_VARS.item_4 = _CHILD.m_sub ? _CHILD.m_sub : "";
                    _CHILD_VARS.item_5 = _CHILD.m_lic ? _CHILD.m_lic : "";
                    _CHILD_VARS.item_6 = _CHILD.usos ? _CHILD.usos : "";
                    _CHILD_VARS.item_7 = _CHILD.area ? _CHILD.area : "";
                    _CHILD_VARS.item_8 = _CHILD.vivienda ? _CHILD.vivienda : "";
                    _CHILD_VARS.item_9 = _CHILD.cultural ? _CHILD.cultural : "";
                    _CHILD_VARS.item_101 = _CHILD.regla_1 ? _CHILD.regla_1 : "";
                    _CHILD_VARS.item_102 = _CHILD.regla_2 ? _CHILD.regla_2 : "";
                    _CHILD_VARS.item_diligenciado_por = getDiligenciadoPor(_CHILD.anex2);
                    const identification = getIdentificationMetadata(_CHILD.anex2);
                    if (identification?.radicacion) {
                        const actualizar = identification.actualizar?.values || {};
                        _CHILD_VARS.item_1 = actualizar.tipo || "";
                        _CHILD_VARS.item_2 = actualizar.tramite || "";
                        _CHILD_VARS.item_3 = actualizar.m_urb || "";
                        _CHILD_VARS.item_4 = actualizar.m_sub || "";
                        _CHILD_VARS.item_5 = actualizar.m_lic || "";
                        _CHILD_VARS.item_6 = actualizar.usos || "";
                        _CHILD_VARS.item_7 = actualizar.area || "";
                        _CHILD_VARS.item_8 = actualizar.vivienda || "";
                        _CHILD_VARS.item_9 = actualizar.cultural || "";
                        _CHILD_VARS.item_101 = actualizar.regla_1 || "";
                        _CHILD_VARS.item_102 = actualizar.regla_2 || "";
                    }
            }
            return _CHILD_VARS;
        }

        const previewScopeRef = useRef(null);
        const selectedSingleChoiceRef = useRef(null);
        const initialPreviewActuacion = useMemo(() => buildPreviewActuacionFromChild(_SET_CHILD_1()), [currentItem, currentVersion]);
        const [previewActuacion, setPreviewActuacion] = useState(initialPreviewActuacion);
        const initialPreviewSignatureRef = useRef(JSON.stringify(initialPreviewActuacion));
        const initialDiligenciadoPor = useMemo(() => _SET_CHILD_1().item_diligenciado_por, [currentItem, currentVersion]);
        const [diligenciadoPor, setDiligenciadoPor] = useState(initialDiligenciadoPor);
        const initialActualizarDiligenciadoPor = useMemo(() => getActualizarDiligenciadoPor(currentFun1?.anex2), [currentFun1]);
        const initialActualizarDiligenciadoPorKeys = useMemo(() => getActualizarDiligenciadoPorKeys(currentFun1?.anex2), [currentFun1]);
        const [actualizarDiligenciadoPor, setActualizarDiligenciadoPor] = useState(initialActualizarDiligenciadoPor);
        const [actualizarDiligenciadoPorKeys, setActualizarDiligenciadoPorKeys] = useState(initialActualizarDiligenciadoPorKeys);
        const requirementPreviewState = useRequirementPreview(previewActuacion, { configStatus: 'published', debounceMs: 500 });
        const identificationChangeDrafts = useMemo(() => {
            if (isInitialRadicacion) return [];
            const previousValues = getFun1IdentificationValues(currentFun1);
            const radicacionValues = getIdentificationMetadata(currentFun1?.anex2)?.radicacion?.values || previousValues;
            return FUN_1_DILIGENCIADO_POR_KEYS.reduce((drafts, key) => {
                const nextValue = serializeIdentificationValue(previewActuacion[key]) || serializeIdentificationValue(radicacionValues[key]);
                if (previousValues[key] === nextValue) return drafts;
                drafts.push({
                    targetKey: key,
                    targetId: FUN_1_CHANGE_TARGET_IDS[key],
                    previousValue: previousValues[key],
                    nextValue,
                    ...(changeLogDraftDetails[key] || {}),
                    receiptStatus: changeLogReceiptStatus,
                    detectedAt: new Date().toISOString(),
                });
                return drafts;
            }, []);
        }, [currentFun1, isInitialRadicacion, previewActuacion, changeLogReceiptStatus, changeLogDraftDetails]);

        useEffect(() => {
            const nextSignature = JSON.stringify(initialPreviewActuacion);
            if (initialPreviewSignatureRef.current === nextSignature) return;
            initialPreviewSignatureRef.current = nextSignature;
            setPreviewActuacion(initialPreviewActuacion);
        }, [initialPreviewActuacion]);

        useEffect(() => {
            setDiligenciadoPor(initialDiligenciadoPor);
        }, [initialDiligenciadoPor]);

        useEffect(() => {
            setActualizarDiligenciadoPor(initialActualizarDiligenciadoPor);
            setActualizarDiligenciadoPorKeys(initialActualizarDiligenciadoPorKeys);
        }, [initialActualizarDiligenciadoPor, initialActualizarDiligenciadoPorKeys]);

        useEffect(() => {
            if (isInitialRadicacion || !currentItem.id || !currentVersion) {
                setChangeLogEntries([]);
                setChangeLogReceiptStatus('SIN DEFINIR');
                return;
            }

            let cancelled = false;
            setChangeLogLoading(true);
            setChangeLogError('');
            Promise.all([
                FUNService.getIdentificationChangeLog(currentItem.id, currentVersion),
                FUNService.getIdentificationReceiptStatus(currentItem.id, currentVersion),
            ]).then(([entriesResponse, statusResponse]) => {
                if (cancelled) return;
                setChangeLogEntries(Array.isArray(entriesResponse.data) ? entriesResponse.data : []);
                setChangeLogReceiptStatus(statusResponse.data?.status || 'SIN DEFINIR');
            }).catch(() => {
                if (!cancelled) setChangeLogError('No fue posible cargar la bitácora de cambios.');
            }).finally(() => {
                if (!cancelled) setChangeLogLoading(false);
            });

            return () => { cancelled = true; };
        }, [currentItem.id, currentVersion, isInitialRadicacion]);

        const handlePreviewFormChange = useCallback(() => {
            setPreviewActuacion(buildPreviewActuacionFromForm(previewScopeRef.current, _SET_CHILD_1()));
        }, [currentItem, currentVersion]);

        const handleDraftChange = useCallback((targetKey, field, value) => {
            setChangeLogDraftDetails(current => ({
                ...current,
                [targetKey]: { ...current[targetKey], [field]: value },
            }));
        }, []);

        const handlePersistedInputChange = useCallback((id, field, value) => {
            setChangeLogEntries(current => current.map(entry => (
                entry.id === id ? { ...entry, [field]: value } : entry
            )));
        }, []);

        const handlePersistedChange = useCallback((id, field, value) => {
            setChangeLogError('');
            FUNService.updateIdentificationChangeLog(id, { [field]: value })
                .then(({ data }) => {
                    setChangeLogEntries(current => current.map(entry => entry.id === id ? data : entry));
                })
                .catch(() => setChangeLogError('No fue posible guardar el campo de la bitácora.'));
        }, []);

        const handleDeleteChangeLogEntry = useCallback(async (id) => {
            const confirmation = await swalConfirm({
                title: '¿Eliminar cambio?',
                text: 'Esta acción eliminará permanentemente el registro de la bitácora.',
                confirmButtonText: 'Eliminar',
            });
            if (!confirmation.isConfirmed) return;

            setDeletingChangeLogEntryId(id);
            setChangeLogError('');
            try {
                await FUNService.deleteIdentificationChangeLog(id);
                setChangeLogEntries(current => current.filter(entry => entry.id !== id));
            } catch {
                setChangeLogError('No fue posible eliminar el cambio de la bitácora.');
            } finally {
                setDeletingChangeLogEntryId(null);
            }
        }, []);

        let _DILIGENCIADO_POR = (key, visible = true) => {
            if (!visible) return null;
            const effectiveValue = getEffectiveDiligenciadoPor(
                key,
                diligenciadoPor,
                actualizarDiligenciadoPor,
                actualizarDiligenciadoPorKeys,
            );

            return <div className="funn1-completed-by">
                <label htmlFor={`f_diligenciado_por_${key}`}>Diligenciado por</label>
                <select id={`f_diligenciado_por_${key}`} className="form-select form-select-sm" value={effectiveValue} onChange={event => {
                    if (isInitialRadicacion) {
                        setDiligenciadoPor(current => ({ ...current, [key]: event.target.value }));
                        return;
                    }
                    setActualizarDiligenciadoPor(current => ({ ...current, [key]: event.target.value }));
                    setActualizarDiligenciadoPorKeys(current => new Set(current).add(key));
                }}>
                    <option value="NO_DILIGENCIADO">NO DILIGENCIADO</option>
                    <option value="SOLICITANTE">SOLICITANTE</option>
                    <option value="CURADURIA">CURADURIA</option>
                </select>
            </div>
        }
        const identificationMetadata = getIdentificationMetadata(currentFun1?.anex2);

        let _RADICACION = (key) => {
            const values = identificationMetadata?.radicacion?.values || getFun1IdentificationValues(currentFun1);
            const value = values[key] || '';
            const isMulti = FUN_1_MULTI_KEYS.has(key);
            const selected = normalizeMultiValue(value, key === 'usos' ? 'usos' : 'letters');

            return <fieldset className="funn1-phase-content" disabled={!isInitialRadicacion}>
                {FUN_1_OPTIONS[key].map(label => {
                    const optionValue = getFun1OptionValue(key, label);
                    const checked = isMulti ? selected.includes(optionValue) : value === optionValue;
                    return <div className="form-check" key={label}>
                        <label className="form-check-label">{label}</label>
                        <input className="form-check-input" type={isMulti ? 'checkbox' : 'radio'} name={`f_rad_${key}`} value={optionValue} defaultChecked={checked} />
                    </div>
                })}
                {key === 'tramite' ? <input id="f_rad_tramite_o" className="form-control form-control-sm mt-2" placeholder="Otras actuaciones, ¿cuál?" defaultValue={!FUN_1_OPTIONS.tramite.some(option => option.startsWith(value)) ? value : ''} /> : null}
                {key === 'usos' ? <input id="f_rad_usos_o" className="form-control form-control-sm mt-2" placeholder="Otro, ¿cuál?" defaultValue={!selected.every(item => ['A', 'B', 'C', 'D'].includes(item)) ? value : ''} /> : null}
                {key === 'regla_2' ? <input id="f_rad_regla_2_o" className="form-control form-control-sm mt-2" placeholder="Otro clima, ¿cuál?" defaultValue={!FUN_1_OPTIONS.regla_2.some(option => option.startsWith(value)) ? value : ''} /> : null}
            </fieldset>
        }
        let _GET_RADICACION = () => ({
            tipo: getCheckedValues(previewScopeRef.current, 'f_rad_tipo').join(','),
            tramite: getInputValue(previewScopeRef.current, 'f_rad_tramite_o') || getRadioValue(previewScopeRef.current, 'f_rad_tramite'),
            m_urb: getRadioValue(previewScopeRef.current, 'f_rad_m_urb'),
            m_sub: getRadioValue(previewScopeRef.current, 'f_rad_m_sub'),
            m_lic: getCheckedValues(previewScopeRef.current, 'f_rad_m_lic').join(','),
            usos: getInputValue(previewScopeRef.current, 'f_rad_usos_o') || getCheckedValues(previewScopeRef.current, 'f_rad_usos').join(','),
            area: getRadioValue(previewScopeRef.current, 'f_rad_area'),
            vivienda: getRadioValue(previewScopeRef.current, 'f_rad_vivienda'),
            cultural: getRadioValue(previewScopeRef.current, 'f_rad_cultural'),
            regla_1: getRadioValue(previewScopeRef.current, 'f_rad_regla_1'),
            regla_2: getInputValue(previewScopeRef.current, 'f_rad_regla_2_o') || getRadioValue(previewScopeRef.current, 'f_rad_regla_2'),
        });
        let _CARD = (key, visible = true) => {
            if (!visible) return null;
            const currentValues = identificationMetadata?.actualizar?.values || {};
            const radicacionValues = identificationMetadata?.radicacion?.values || getFun1IdentificationValues(currentFun1);
            const options = getFun1Options(key, currentItem.model);
            const inputName = FUN_1_INPUT_NAMES[key];
            const isMulti = FUN_1_MULTI_KEYS.has(key);
            const radicacionValue = radicacionValues[key] || '';
            const actualizarValue = currentValues[key] || '';
            const radicacionSelected = normalizeMultiValue(radicacionValue, key === 'usos' ? 'usos' : 'letters');
            const actualizarSelected = normalizeMultiValue(actualizarValue, key === 'usos' ? 'usos' : 'letters');
            const updateDisabled = isInitialRadicacion
                || (key === 'm_urb' && dis_m_urb)
                || (key === 'm_sub' && dis_m_sub)
                || (key === 'm_lic' && dis_m_lic);
            const otherInputId = key === 'tramite' ? 'f_12_o' : key === 'usos' ? 'f_16_o' : key === 'regla_2' ? 'f_102_o' : null;
            const radicacionOther = getOtherOptionValue(key, radicacionValue, currentItem.model);
            const actualizarOther = getOtherOptionValue(key, actualizarValue, currentItem.model);
            const handleUpdateChange = key === 'tipo'
                ? () => {
                    if (!actualizarDiligenciadoPorKeys.has(key)) {
                        setActualizarDiligenciadoPor(current => ({ ...current, [key]: diligenciadoPor[key] || DILIGENCIADO_POR_DEFAULT }));
                    }
                    setActualizarDiligenciadoPorKeys(current => new Set(current).add(key));
                    const selected = new Set(getCheckedValues(previewScopeRef.current, inputName));
                    setDisMUrb(!selected.has('A'));
                    setDisMSub(!selected.has('C'));
                    setDisMLic(!selected.has('D'));
                }
                : () => {
                    if (!actualizarDiligenciadoPorKeys.has(key)) {
                        setActualizarDiligenciadoPor(current => ({ ...current, [key]: diligenciadoPor[key] || DILIGENCIADO_POR_DEFAULT }));
                    }
                    setActualizarDiligenciadoPorKeys(current => new Set(current).add(key));
                };
            const captureSingleChoice = event => {
                selectedSingleChoiceRef.current = event.currentTarget.checked ? event.currentTarget.id : null;
            };
            const deselectSingleChoice = (event, onDeselect) => {
                if (selectedSingleChoiceRef.current !== event.currentTarget.id) return;
                selectedSingleChoiceRef.current = null;
                event.currentTarget.checked = false;
                onDeselect?.();
            };

            const title = FUN_1_TITLES[key] || 'Identificación de la solicitud';
            const subtitle = FUN_1_SUBTITLES[key];
            const diligenciadoValue = getEffectiveDiligenciadoPor(
                key,
                diligenciadoPor,
                actualizarDiligenciadoPor,
                actualizarDiligenciadoPorKeys,
            );
            const isCompleted = diligenciadoValue !== DILIGENCIADO_POR_DEFAULT;

            return <section className="funn1-block">
                <header className="funn1-card-header">
                    <div className="funn1-card-heading">
                        <h3 className="funn1-card-title">{title}</h3>
                        {subtitle ? <p className="funn1-card-subtitle">{subtitle}</p> : null}
                    </div>
                    <span className={`funn1-status ${isCompleted ? 'funn1-status-complete' : 'funn1-status-pending'}`}>
                        {isCompleted ? 'Diligenciado' : 'Sin diligenciar'}
                    </span>
                </header>
                <div className="funn1-checklist-grid" role="group" aria-label={title}>
                    <div className="funn1-checklist-header"><span>Opción</span><abbr title="Radicación">R</abbr><abbr title="Actualizar">A</abbr></div>
                    {options.map(label => {
                        const optionValue = getFun1OptionValue(key, label);
                        const radicacionChecked = isMulti ? radicacionSelected.includes(optionValue) : radicacionValue === optionValue;
                        const actualizarChecked = isMulti ? actualizarSelected.includes(optionValue) : actualizarValue === optionValue;
                        const rowId = `${key}-${optionValue}`;

                        return <div className="funn1-checklist-row" key={label}>
                            <label htmlFor={`f_rad_${rowId}`}>{label}</label>
                            <input id={`f_rad_${rowId}`} type={isMulti ? 'checkbox' : 'radio'} name={`f_rad_${key}`} value={optionValue} defaultChecked={radicacionChecked} disabled={!isInitialRadicacion} onPointerDown={isMulti ? undefined : captureSingleChoice} onClick={isMulti ? undefined : deselectSingleChoice} />
                            <input id={`f_act_${rowId}`} type={isMulti ? 'checkbox' : 'radio'} name={inputName} value={optionValue} defaultChecked={actualizarChecked} disabled={updateDisabled} onChange={handleUpdateChange} onPointerDown={isMulti ? undefined : captureSingleChoice} onClick={isMulti ? undefined : event => deselectSingleChoice(event, handleUpdateChange)} />
                        </div>;
                    })}
                    {otherInputId ? key === 'tramite' ? <div className="funn1-checklist-row funn1-checklist-other funn1-checklist-other-tramite" role="group" aria-label="Otra opción">
                        <span className="funn1-other-option-label">Otra opción</span>
                        <label className="funn1-other-option-phase" htmlFor={`f_rad_${otherInputId}`}>
                            <span>Radicación</span>
                            <input id={`f_rad_${otherInputId}`} type="text" defaultValue={radicacionOther} disabled={!isInitialRadicacion} />
                        </label>
                        <label className="funn1-other-option-phase" htmlFor={otherInputId}>
                            <span>Actualizar</span>
                            <input id={otherInputId} type="text" defaultValue={actualizarOther} disabled={updateDisabled} onChange={handleUpdateChange} />
                        </label>
                    </div> : <div className="funn1-checklist-row funn1-checklist-other">
                        <label htmlFor={`f_rad_${otherInputId}`}>{key === 'regla_2' ? 'Otro clima' : 'Otra opción'}</label>
                        <input id={`f_rad_${otherInputId}`} type="text" defaultValue={radicacionOther} disabled={!isInitialRadicacion} />
                        <input id={otherInputId} type="text" defaultValue={actualizarOther} disabled={updateDisabled} onChange={handleUpdateChange} />
                    </div> : null}
                </div>
                {_DILIGENCIADO_POR(key)}
            </section>;
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
            document.querySelectorAll('[name^="f_rad_"]').forEach(input => {
                input.checked = false;
            });
            ['f_rad_tramite_o', 'f_rad_usos_o', 'f_rad_regla_2_o'].forEach(id => {
                const input = document.getElementById(id);
                if (input) input.value = '';
            });
            setDiligenciadoPor(Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [key, DILIGENCIADO_POR_DEFAULT])));
            setActualizarDiligenciadoPor(Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [key, DILIGENCIADO_POR_DEFAULT])));
            setActualizarDiligenciadoPorKeys(new Set());
        }

        let new_1 = () => {
            formData = new FormData();
            const fun1Id = currentFun1?.id;
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

            const radicacionDiligenciadoPor = Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [key, diligenciadoPor[key] || DILIGENCIADO_POR_DEFAULT]));

            if (currentFun1 && !fun1Id) {
                swalError({ title: swaMsg.generic_eror_title, text: 'No fue posible identificar la versión FUN que se debe actualizar.' });
                return;
            }

            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });

            const actualizacion = Object.fromEntries(FUN_1_DILIGENCIADO_POR_KEYS.map(key => [key, formData.get(key) || '']));

            if (currentFun1 == null) {
                formData.set('identificacion_radicacion', JSON.stringify({
                    values: _GET_RADICACION(),
                    diligenciado_por: radicacionDiligenciadoPor,
                }));
            } else if (currentFun1) {
                const actualizarDiligenciado = Object.fromEntries([...actualizarDiligenciadoPorKeys].map(key => [
                    key,
                    actualizarDiligenciadoPor[key] || DILIGENCIADO_POR_DEFAULT,
                ]));
                formData.set('identificacion_actualizar', JSON.stringify({ values: actualizacion, diligenciado_por: actualizarDiligenciado }));
                formData.set('identification_change_entries', JSON.stringify(identificationChangeDrafts));
            }

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
            <fieldset ref={previewScopeRef} onChange={handlePreviewFormChange} className="p-3 funn1-form">
                <FunUpdateSectionLegend id="funn_1" step="1">Identificación de la Solicitud</FunUpdateSectionLegend>
                <div className="funn1-card-grid">
                    {_CARD('tipo')}
                    {_CARD('tramite')}
                    {_CARD('m_urb')}
                    {_CARD('m_sub')}
                    {_CARD('m_lic')}
                    {_CARD('usos')}
                    {_CARD('area')}
                    {_CARD('vivienda')}
                    {_CARD('cultural')}
                    {_CARD('regla_1', currentItem.model == 2021)}
                    {_CARD('regla_2', currentItem.model == 2021)}
                </div>
                {/* Preview documental oculto en el submódulo Actualizar. */}
                <IdentificationChangeLogTable
                    entries={changeLogEntries}
                    drafts={identificationChangeDrafts}
                    loading={changeLogLoading}
                    error={changeLogError}
                    requestResponsibleName={requestResponsibleName}
                    deletingEntryId={deletingChangeLogEntryId}
                    onDraftChange={handleDraftChange}
                    onPersistedInputChange={handlePersistedInputChange}
                    onPersistedChange={handlePersistedChange}
                    onDelete={handleDeleteChangeLogEntry}
                />
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
