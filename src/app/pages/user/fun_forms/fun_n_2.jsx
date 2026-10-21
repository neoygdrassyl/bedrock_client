import { useCallback, useEffect, useMemo, useState } from 'react';
import FUNService from '../../../services/fun.service'
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { swalConfirm, swalError, swalLoading, swalSuccess } from '@/app/utils/swalAdapter';
import FunUpdateSectionLegend from './components/FunUpdateSectionLegend.jsx';
import PropertyChangeLogTable from './components/PropertyChangeLogTable.jsx';
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
const PROPERTY_CHANGE_TARGET_IDS = {
    direccion_ant: '2.1 Dirección anterior', direccion: '2.1 Dirección actual',
    matricula_anterior: '2.2 Matrícula anterior', matricula: '2.2 Matrícula actual',
    catastral: '2.3 Identificación catastral anterior', catastral_2: '2.3 Identificación catastral actual',
    suelo: '2.4 Clasificación del suelo', lote_pla: '2.5 Planimetría del lote',
    barrio: '2.6 Barrio o urbanización', comuna: '2.6 Comuna', estrato: '2.6 Estrato', manzana: '2.6 Manzana',
    vereda: '2.6 Vereda', sector: '2.6 Sector', corregimiento: '2.6 Corregimiento', lote: '2.6 Lote',
};

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
        const [touchedPropertyKeys, setTouchedPropertyKeys] = useState(new Set());
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
            setRadicacionValues(initialRadicacionValues);
            setActualizarValues(initialActualizarValues);
            setTouchedPropertyKeys(new Set());
        }, [initialRadicacionValues, initialActualizarValues]);

        useEffect(() => {
            if (isInitialRadicacion || !currentItem.id || !currentVersion) {
                setChangeLogEntries([]);
                setChangeLogReceiptStatus('SIN DEFINIR');
                return;
            }

            let cancelled = false;
            setChangeLogLoading(true);
            setChangeLogError('');
            FUNService.getPropertyChangeLog(currentItem.id, currentVersion)
                .then(({ data }) => {
                    if (cancelled) return;
                    setChangeLogEntries(Array.isArray(data?.entries) ? data.entries : []);
                    setChangeLogReceiptStatus(data?.receiptStatus || 'SIN DEFINIR');
                })
                .catch(() => {
                    if (!cancelled) setChangeLogError('No fue posible cargar la bitácora de cambios.');
                })
                .finally(() => {
                    if (!cancelled) setChangeLogLoading(false);
                });

            return () => { cancelled = true; };
        }, [currentItem.id, currentVersion, isInitialRadicacion]);

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
            else {
                setActualizarValues(current => ({ ...current, [key]: value }));
                setTouchedPropertyKeys(current => new Set(current).add(key));
            }
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
            setTouchedPropertyKeys(current => new Set(current).add(key));
        };
        const propertyChangeDrafts = useMemo(() => {
            if (isInitialRadicacion) return [];
            return FUN_2_COMPARISON_KEYS.reduce((drafts, key) => {
                if (!touchedPropertyKeys.has(key)) return drafts;
                const previousValue = currentPropertyValues[key] ?? '';
                const radicacionValue = radicacionValues[key] ?? '';
                const actualizarValue = actualizarValues[key] ?? '';
                const nextValue = actualizarValue.trim() !== '' && actualizarValue.trim() !== radicacionValue.trim()
                    ? actualizarValue
                    : radicacionValue;
                if (previousValue === nextValue) return drafts;
                drafts.push({
                    targetKey: key,
                    targetId: PROPERTY_CHANGE_TARGET_IDS[key],
                    previousValue,
                    nextValue,
                    ...(changeLogDraftDetails[key] || {}),
                    receiptStatus: changeLogReceiptStatus,
                    detectedAt: new Date().toISOString(),
                });
                return drafts;
            }, []);
        }, [actualizarValues, changeLogDraftDetails, changeLogReceiptStatus, currentPropertyValues, isInitialRadicacion, radicacionValues, touchedPropertyKeys]);
        const handleDraftChange = useCallback((targetKey, field, value) => {
            setChangeLogDraftDetails(current => ({
                ...current,
                [targetKey]: { ...current[targetKey], [field]: value },
            }));
        }, []);
        const handlePersistedInputChange = useCallback((id, field, value) => {
            setChangeLogEntries(current => current.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
        }, []);
        const handlePersistedChange = useCallback((id, field, value) => {
            setChangeLogError('');
            FUNService.updatePropertyChangeLog(id, { [field]: value })
                .then(({ data }) => setChangeLogEntries(current => current.map(entry => entry.id === id ? data : entry)))
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
                await FUNService.deletePropertyChangeLog(id);
                setChangeLogEntries(current => current.filter(entry => entry.id !== id));
            } catch {
                setChangeLogError('No fue posible eliminar el cambio de la bitácora.');
            } finally {
                setDeletingChangeLogEntryId(null);
            }
        }, []);
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
            if (propertyChangeDrafts.length) {
                formData.set('funVersion', currentVersion);
                formData.set('property_change_entries', JSON.stringify(propertyChangeDrafts));
            }
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
                <PropertyChangeLogTable
                    entries={changeLogEntries}
                    drafts={propertyChangeDrafts}
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
