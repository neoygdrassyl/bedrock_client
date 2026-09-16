import { useEffect, useMemo, useState } from 'react';
import FUNService from '../../../services/fun.service'
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import FunUpdateSectionLegend from './components/FunUpdateSectionLegend.jsx';
import MatrixInformationTable from '../records/law/MatrixInformationTable';

const PROPERTY_FIELDS = [
    { key: 'direccion_ant', item: '2.1 Dirección o Nomenclatura', label: 'Dirección anterior', multiline: true },
    { key: 'direccion', item: '2.1 Dirección o Nomenclatura', label: 'Dirección actual', multiline: true },
    { key: 'matricula_anterior', item: '2.2 Matrícula Inmobiliaria', label: 'Matrícula anterior' },
    { key: 'matricula', item: '2.2 Matrícula Inmobiliaria', label: 'Matrícula actual' },
    { key: 'catastral', item: '2.3 Identificación Catastral', label: 'Identificación catastral anterior' },
    { key: 'catastral_2', item: '2.3 Identificación Catastral', label: 'Identificación catastral actual' },
];

const PROPERTY_FIELD_KEYS = PROPERTY_FIELDS.map(field => field.key);
const PROPERTY_CHOICE_FIELDS = [
    {
        key: 'suelo',
        title: '2.4 Clasificación del Suelo',
        options: [
            { value: 'A', label: 'A. Urbano' },
            { value: 'B', label: 'B. Rural' },
            { value: 'C', label: 'C. De Expansión' },
        ],
    },
    {
        key: 'lote_pla',
        title: '2.5 Planimetría del Lote',
        options: [
            { value: 'A', label: 'A. Plano del Lote' },
            { value: 'B', label: 'B. Plano Topográfico' },
        ],
        otherLabel: 'Otro, ¿cuál?',
    },
];

const PROPERTY_CHOICE_KEYS = PROPERTY_CHOICE_FIELDS.map(field => field.key);
const PROPERTY_GENERAL_FIELDS = [
    { key: 'barrio', label: 'a. Barrio o urbanización', group: 'Predio urbano' },
    { key: 'comuna', label: 'b. Comuna', group: 'Predio urbano' },
    { key: 'estrato', label: 'c. Estrato', group: 'Predio urbano' },
    { key: 'manzana', label: 'd. Manzana', group: 'Predio urbano' },
    { key: 'vereda', label: 'e. Vereda', group: 'Predio rural' },
    { key: 'sector', label: 'f. Sector', group: 'Predio rural' },
    { key: 'corregimiento', label: 'g. Corregimiento', group: 'Predio rural' },
    { key: 'lote', label: 'h. Lote', group: 'Predio rural' },
];
const PROPERTY_GENERAL_KEYS = PROPERTY_GENERAL_FIELDS.map(field => field.key);
const FUN_2_COMPARISON_KEYS = [...PROPERTY_FIELD_KEYS, ...PROPERTY_CHOICE_KEYS, ...PROPERTY_GENERAL_KEYS];

function propertyValues(property) {
    return FUN_2_COMPARISON_KEYS.reduce((values, key) => ({ ...values, [key]: property?.[key] == null ? '' : String(property[key]) }), {});
}

function propertyMetadata(value) {
    if (!value) return { data: {}, error: '' };
    if (typeof value === 'object' && !Array.isArray(value)) return validatePropertyMetadata(value);
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? validatePropertyMetadata(parsed)
            : { data: {}, error: 'No fue posible cargar la comparación de Radicación.' };
    } catch {
        return { data: {}, error: 'No fue posible cargar la comparación de Radicación.' };
    }
}

function validatePropertyMetadata(metadata) {
    const comparison = metadata.informacion_predio;
    if (!comparison) return { data: metadata, error: '' };
    if (typeof comparison !== 'object' || Array.isArray(comparison)) {
        return { data: {}, error: 'La comparación de Radicación contiene una estructura no válida.' };
    }

    const hasInvalidValue = ['radicacion', 'actualizar'].some(phase => {
        const phaseData = comparison[phase];
        const values = phaseData?.values;
        return phaseData != null && (
            typeof phaseData !== 'object'
            || Array.isArray(phaseData)
            || (values != null && (
            typeof values !== 'object'
            || Array.isArray(values)
            || FUN_2_COMPARISON_KEYS.some(key => values[key] != null && typeof values[key] === 'object')
            ))
        );
    });

    return hasInvalidValue
        ? { data: {}, error: 'La comparación de Radicación contiene valores no válidos.' }
        : { data: metadata, error: '' };
}

const FUNN2 = ({ translation, swaMsg, globals, currentItem, currentVersion, requestUpdate }) => {

        var formData = new FormData();

        let _GET_EXISTING_FUN_2 = () => {
            const child = currentItem.fun_2;
            const item = Array.isArray(child) ? child.find(entry => entry?.id) : child;
            if (!item || typeof item !== 'object' || item.id == null || item.id === '') return null;
            return item;
        }

        const currentFun2 = _GET_EXISTING_FUN_2();
        const isInitialRadicacion = !currentFun2;
        const currentPropertyValues = useMemo(() => propertyValues(currentFun2), [currentFun2]);
        const metadataState = useMemo(() => propertyMetadata(currentFun2?.anex2), [currentFun2?.anex2]);
        const metadata = metadataState.data;
        const initialRadicacionValues = useMemo(() => propertyValues({
            ...currentPropertyValues,
            ...(metadata.informacion_predio?.radicacion?.values || {}),
        }), [currentPropertyValues, metadata]);
        const initialActualizarValues = useMemo(() => propertyValues(metadata.informacion_predio?.actualizar?.values), [metadata]);
        const [radicacionValues, setRadicacionValues] = useState(initialRadicacionValues);
        const [actualizarValues, setActualizarValues] = useState(initialActualizarValues);

        useEffect(() => {
            setRadicacionValues(initialRadicacionValues);
            setActualizarValues(initialActualizarValues);
        }, [initialRadicacionValues, initialActualizarValues]);

        const comparisonRows = useMemo(() => PROPERTY_FIELDS.map(field => {
            const radicacion = radicacionValues[field.key] ?? '';
            const actualizar = actualizarValues[field.key] ?? '';
            const updated = !isInitialRadicacion && actualizar.trim() !== '' && actualizar.trim() !== radicacion.trim();
            return {
                ...field,
                value: updated ? actualizar : radicacion,
                updated,
                radicacionMarked: true,
                canEdit: true,
            };
        }), [actualizarValues, isInitialRadicacion, radicacionValues]);
        const generalComparisonRows = useMemo(() => PROPERTY_GENERAL_FIELDS.map(field => {
            const radicacion = radicacionValues[field.key] ?? '';
            const actualizar = actualizarValues[field.key] ?? '';
            const updated = !isInitialRadicacion && actualizar.trim() !== '' && actualizar.trim() !== radicacion.trim();
            return {
                ...field,
                value: updated ? actualizar : radicacion,
                updated,
                radicacionMarked: true,
                canEdit: true,
            };
        }), [actualizarValues, isInitialRadicacion, radicacionValues]);

        const handleComparisonChange = (key, value) => {
            if (isInitialRadicacion) setRadicacionValues(current => ({ ...current, [key]: value }));
            else setActualizarValues(current => ({ ...current, [key]: value }));
        };
        const handleChoiceChange = (key, value) => {
            if (isInitialRadicacion) {
                setRadicacionValues(current => ({ ...current, [key]: value }));
                return;
            }
            setActualizarValues(current => ({
                ...current,
                [key]: value === (radicacionValues[key] ?? '') ? '' : value,
            }));
        };
        // DATA COMVERTERS
        let _REGEX_PREDIAL = (e) => {
            let regex = /^[0-9]+$/i;
            let _value = e.target.value
            let _id = e.target.id
            let test = regex.test(_value);
            if (test) {
                var _new_value = "";
                if (_value.length == 15) {
                    _new_value += _value.substring(0, 2);
                    _new_value += "-";
                    _new_value += _value.substring(2, 4);
                    _new_value += "-";
                    _new_value += _value.substring(4, 8);
                    _new_value += "-";
                    _new_value += _value.substring(8, 12);
                    _new_value += "-";
                    _new_value += _value.substring(12, 15);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        let _REGEX_MATRICULA = (e) => {
            let _keyPressed = e.key;
            let regex = /^[0-9]+$/i;
            let _value = e.target.value;
            let _id = e.target.id
            let test = regex.test(_keyPressed);
            if (test) {
                var _new_value = "";
                if (_value.length == 4) {
                    _new_value += _value.substring(0, 3);
                    _new_value += "-";
                    _new_value += _value.substring(3, _value.length + 1);
                    document.getElementById(_id).value = _new_value;
                } else document.getElementById(_id).value = _value;
            } else {
                document.getElementById(_id).value = _value.slice(0, _value.length - 1);
            }
        }
        // COMPONENT JSX
        const choiceComparisonRows = useMemo(() => PROPERTY_CHOICE_FIELDS.map(field => {
            const radicacionValue = radicacionValues[field.key] ?? '';
            const actualizarValue = actualizarValues[field.key] ?? '';
            const optionValues = field.options.map(option => option.value);
            return {
                ...field,
                optionValues,
                radicacionValue,
                actualizarValue,
                otherValue: field.otherLabel && !optionValues.includes(actualizarValue) && actualizarValue !== ''
                    ? actualizarValue
                    : field.otherLabel && !optionValues.includes(radicacionValue) ? radicacionValue : '',
            };
        }), [actualizarValues, radicacionValues]);
        let _CHILD_2_COMPONENT = () => {
            return <>
                <div className="mb-3">
                    <MatrixInformationTable mode="comparison" comparisonRows={comparisonRows} onReviewChange={handleComparisonChange} />
                </div>
                <div className="mb-3">
                    <MatrixInformationTable
                        mode="property-details-comparison"
                        choiceRows={choiceComparisonRows}
                        generalRows={generalComparisonRows}
                        isInitialRadicacion={isInitialRadicacion}
                        onReviewChange={handleComparisonChange}
                        onChoiceChange={handleChoiceChange}
                    />
                </div>
            </>
        }
        let _RESET_FORM_2 = () => {
            const clearChoices = current => PROPERTY_CHOICE_KEYS.reduce((values, key) => ({ ...values, [key]: '' }), { ...current });
            if (isInitialRadicacion) setRadicacionValues(clearChoices);
            else setActualizarValues(clearChoices);
        }

        let new_2 = () => {
            if (metadataState.error) {
                swalError({ title: swaMsg.generic_eror_title, text: metadataState.error });
                return;
            }
            formData = new FormData();
            let fun0Id = currentItem.id;
            formData.set('fun0Id', fun0Id);
            let fun2Id = currentFun2?.id;
            const effectivePropertyValues = FUN_2_COMPARISON_KEYS.reduce((values, key) => {
                const radicacion = radicacionValues[key] ?? '';
                const actualizar = actualizarValues[key] ?? '';
                values[key] = !isInitialRadicacion && actualizar.trim() !== '' && actualizar.trim() !== radicacion.trim()
                    ? actualizar
                    : radicacion;
                return values;
            }, {});

            FUN_2_COMPARISON_KEYS.forEach(key => formData.set(key, effectivePropertyValues[key]));
            formData.set('informacion_predio_radicacion', JSON.stringify({ values: radicacionValues }));
            formData.set('informacion_predio_actualizar', JSON.stringify({ values: actualizarValues }));
            swalLoading({ title: swaMsg.title_wait, text: swaMsg.text_wait });
            if (!fun2Id) {
                FUNService.create_fun2(formData)
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
                FUNService.update_2(fun2Id, formData)
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
            <fieldset className="p-3">
                <FunUpdateSectionLegend id="funn_2" step="2">Información del Predio</FunUpdateSectionLegend>
                {metadataState.error ? <p className="text-danger" role="alert">{metadataState.error}</p> : null}
                {_CHILD_2_COMPONENT()}
                <div className="row mb-3 text-center">
                    <div className="col-6">
                        <Button size="sm" className="my-3" onClick={() => new_2()}><Icon name="file-alt" size={16} /> ACTUALIZAR </Button>
                    </div>
                    <div className="col-6">
                            <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90 my-3" onClick={() => _RESET_FORM_2()}><Icon name="eraser" size={16} /> LIMPIAR (2.4 y 2.5) </Button>
                        </div>
                </div>
            </fieldset>
        </>);
};

export default FUNN2;
