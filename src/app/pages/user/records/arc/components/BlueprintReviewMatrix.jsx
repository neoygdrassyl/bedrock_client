import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { LegacyModal as Modal } from '@/components/legacy-modal';
import { swalConfirm, swalFormDialog, swalInfo } from '@/app/utils/swalAdapter';

const BANDS = [
    { title: 'Rótulo', criteria: ['Dirección', 'Firmas', 'Matrículas', 'Escala', 'Modalidad de licencia'] },
    { title: 'Predio', criteria: ['Georreferenciación', 'Sección vial', 'Nomenclatura vial', 'Linderos', 'Norte'] },
    { title: 'Áreas', criteria: ['Cuadro de áreas'] },
    { title: 'Plantas', criteria: ['Espacio público', 'Cotas del proyecto', 'Ejes estructurales', 'Niveles', 'Usos', 'Indicación de cortes', 'Planta de cubierta'] },
    { title: 'Cortes', criteria: ['Relación espacio público', 'Pendiente del terreno', 'Niveles por piso', 'Cotas totales y parciales', 'Ejes estructurales'] },
    { title: 'Fachadas', criteria: ['Pendiente del terreno', 'Niveles por piso', 'Cotas totales y parciales'] },
];

const CRITERIA = BANDS.flatMap((band, bandIndex) => band.criteria.map((label, criterionIndex) => ({
    id: `band-${bandIndex}-criterion-${criterionIndex}`,
    label,
    band: band.title,
})));

const VERIFICATIONS = [
    'Anteproyecto de intervención en bienes de interés cultural (BIC) o en inmuebles colindantes o localizados dentro de su área de influencia',
    'Plantas, cortes y fachadas a la misma escala',
    'Planos arquitectónicos para el reconocimiento de la existencia de edificaciones',
    'Los planos permiten entender el proyecto y por tanto su construcción',
    'El proyecto tiene diseñado el espacio público',
    'La suma del cuadro de áreas es correcta por cada actuación urbanística solicitada',
    'La solicitud señalada en el FUN y la valla corresponden con lo revisado',
    'Las firmas de todos los profesionales coinciden en sus respectivos planos',
].map((label, index) => ({ id: `verification-${index}`, label }));

const CELL_STATES = ['pending', 'cumple', 'no_cumple', 'no_aplica'];
const BULK_CELL_STATES = ['pending', 'cumple', 'no_cumple', 'no_aplica'];
const STATE_META = {
    pending: { label: 'Pendiente', glyph: '', className: 'border-border bg-muted/30 text-muted-foreground' },
    cumple: { label: 'Cumple', glyph: '✓', className: 'border-success bg-success/10 text-success' },
    no_cumple: { label: 'No cumple', glyph: '✕', className: 'border-destructive bg-destructive/10 text-destructive' },
    no_aplica: { label: 'No aplica', glyph: '–', className: 'border-warning bg-warning/10 text-warning' },
};
const CONTROL_META = [
    { state: 'cumple', label: 'Cumple', icon: 'check-circle', selectedClassName: 'border-success text-success', focusClassName: 'focus-visible:ring-success', pressedClassName: 'active:bg-success/10' },
    { state: 'no_cumple', label: 'No cumple', icon: 'times-circle', selectedClassName: 'border-destructive text-destructive', focusClassName: 'focus-visible:ring-destructive', pressedClassName: 'active:bg-destructive/10' },
    { state: 'no_aplica', label: 'No aplica', icon: 'minus-circle', selectedClassName: 'border-warning text-warning', focusClassName: 'focus-visible:ring-warning', pressedClassName: 'active:bg-warning/10' },
];

function normalizeReview(saved) {
    const review = saved && typeof saved === 'object' ? saved : {};
    const cells = { ...(review.cells || {}) };
    const verifications = { ...(review.verifications || {}) };
    const observations = { ...(review.observations || {}) };
    const verificationObservations = { ...(review.verificationObservations || {}) };
    const generalObservations = Array.isArray(review.generalObservations) ? review.generalObservations : [];
    for (const [blueprintId, row] of Object.entries(review.cells || {})) {
        if (!row || typeof row !== 'object') continue;
        cells[blueprintId] = {};
        for (const criterion of CRITERIA) {
            if (CELL_STATES.includes(row[criterion.id])) cells[blueprintId][criterion.id] = row[criterion.id];
        }
    }
    for (const [blueprintId, notes] of Object.entries(review.observations || {})) {
        if (!Array.isArray(notes)) continue;
        observations[blueprintId] = notes
            .filter(note => note && typeof note.text === 'string' && note.text.trim())
            .map(note => ({ id: String(note.id || `${blueprintId}-${Math.random()}`), text: note.text, criterionId: note.criterionId || '' }));
    }
    for (const [verificationId, notes] of Object.entries(review.verificationObservations || {})) {
        if (!Array.isArray(notes)) continue;
        verificationObservations[verificationId] = notes.filter(note => typeof note === 'string' && note.trim()).map(note => note.trim());
    }
    return {
        cells,
        verifications,
        observations,
        verificationObservations,
        generalObservations: generalObservations
            .filter(note => note && typeof note.text === 'string' && note.text.trim() && CRITERIA.some(criterion => criterion.id === note.criterionId))
            .map(note => ({ id: String(note.id || `general-${Math.random()}`), text: note.text.trim(), criterionId: note.criterionId })),
    };
}

function getCycle(state) {
    return CELL_STATES[(CELL_STATES.indexOf(state || 'pending') + 1) % CELL_STATES.length];
}

function getBulkState(blueprints, cells, criterionId) {
    const states = blueprints.map(blueprint => cells[blueprint.id]?.[criterionId] || 'pending');
    const firstState = states[0] || 'pending';
    return states.every(state => state === firstState) && BULK_CELL_STATES.includes(firstState) ? firstState : 'mixed';
}

function getBulkCycle(state) {
    if (state === 'mixed') return 'cumple';
    return BULK_CELL_STATES[(BULK_CELL_STATES.indexOf(state) + 1) % BULK_CELL_STATES.length];
}

function getProfessionalDetails(professional) {
    return {
        responsibility: String(professional?.role || 'Responsabilidad sin registrar').trim().toUpperCase(),
        name: [professional?.name, professional?.surname].filter(Boolean).join(' ').trim().toUpperCase() || 'Nombre sin registrar',
    };
}

function BlueprintReviewMatrix({ blueprints, professionals, savedReview, saving, finalizing, readOnly = false, onSave, onFinalize, onClose }) {
    const gridId = useId().replaceAll(':', '');
    const [review, setReview] = useState(() => normalizeReview(savedReview));
    const [filter, setFilter] = useState('all');
    const [activeObservationId, setActiveObservationId] = useState(null);
    const [draftObservation, setDraftObservation] = useState('');
    const [draftCriterionId, setDraftCriterionId] = useState('');
    const [validationError, setValidationError] = useState('');
    const [bulkActionActive, setBulkActionActive] = useState(false);
    const [bulkActionApplying, setBulkActionApplying] = useState(false);
    const [activeVerificationObservation, setActiveVerificationObservation] = useState(null);
    const [generalObservationsOpen, setGeneralObservationsOpen] = useState(false);
    const [professionalsOpen, setProfessionalsOpen] = useState(false);
    const [draftGeneralObservation, setDraftGeneralObservation] = useState('');
    const [draftGeneralCriterionId, setDraftGeneralCriterionId] = useState('');
    const cellRefs = useRef({});
    const savedReviewRef = useRef('');

    function createNoteId() {
        return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    }

    useEffect(() => {
        const normalizedReview = normalizeReview(savedReview);
        setReview(normalizedReview);
        savedReviewRef.current = JSON.stringify(normalizedReview);
        setValidationError('');
    }, [savedReview]);

    const counts = useMemo(() => {
        const values = blueprints.flatMap(blueprint => CRITERIA.map(criterion => review.cells[blueprint.id]?.[criterion.id] || 'pending'));
        return values.reduce((result, state) => ({ ...result, [state]: result[state] + 1 }), { cumple: 0, no_cumple: 0, no_aplica: 0, pending: 0 });
    }, [blueprints, review.cells]);
    const evaluated = counts.cumple + counts.no_cumple + counts.no_aplica;
    const total = blueprints.length * CRITERIA.length;

    function updateCell(blueprintId, criterionId, nextState) {
        if (readOnly) return;
        setReview(current => ({
            ...current,
            cells: {
                ...current.cells,
                [blueprintId]: { ...(current.cells[blueprintId] || {}), [criterionId]: nextState },
            },
        }));
        setValidationError('');
    }

    async function updateColumn(criterion) {
        if (readOnly || !bulkActionActive || bulkActionApplying || !blueprints.length) return;

        const currentState = getBulkState(blueprints, review.cells, criterion.id);
        const nextState = getBulkCycle(currentState);
        setBulkActionApplying(true);

        try {
            const result = await swalConfirm({
                title: '¿APLICAR ACTUACIÓN MASIVA?',
                text: `Se marcarán ${blueprints.length} plano${blueprints.length === 1 ? '' : 's'} como “${STATE_META[nextState].label}” en “${criterion.label}”.`,
                confirmButtonText: 'SÍ, APLICAR',
                cancelButtonText: 'CANCELAR',
            });
            if (!result.isConfirmed) return;

            setReview(current => ({
                ...current,
                cells: blueprints.reduce((cells, blueprint) => ({
                    ...cells,
                    [blueprint.id]: { ...(cells[blueprint.id] || {}), [criterion.id]: nextState },
                }), { ...current.cells }),
            }));
            setValidationError('');
        } catch {
            setValidationError('No fue posible aplicar la actuación masiva. Inténtelo nuevamente.');
        } finally {
            setBulkActionApplying(false);
        }
    }

    function showBulkActionInfo() {
        swalInfo({
            title: 'Actuación masiva',
            html: '<p>Active esta opción para aplicar un estado a todos los planos de un mismo criterio.</p><p>Cada cambio requiere confirmación y afecta todos los planos cargados, aunque haya filtros activos.</p><p>Para guardar <strong>No cumple</strong>, agregue al menos una observación asociada al criterio en cualquier plano.</p>',
        });
    }

    function updateVerification(id, state) {
        if (readOnly) return;
        setReview(current => ({ ...current, verifications: { ...current.verifications, [id]: current.verifications[id] === state ? 'pending' : state } }));
    }

    async function addVerificationObservation(item) {
        if (readOnly) return;
        try {
            const result = await swalFormDialog({
                title: 'Añadir observación',
                input: 'textarea',
                inputLabel: item.label,
                inputPlaceholder: 'Escriba la observación',
                inputValidator: value => value?.trim() ? undefined : 'Escriba una observación antes de guardar.',
            });
            const text = result.value?.trim();
            if (!result.isConfirmed || !text) return;
            setReview(current => ({
                ...current,
                verificationObservations: {
                    ...(current.verificationObservations || {}),
                    [item.id]: [...(current.verificationObservations?.[item.id] || []), text],
                },
            }));
            setActiveVerificationObservation(item.id);
        } catch {
            setValidationError('No fue posible agregar la observación. Inténtelo nuevamente.');
        }
    }

    function removeVerificationObservation(itemId, noteIndex) {
        if (readOnly) return;
        setReview(current => {
            const notes = (current.verificationObservations?.[itemId] || []).filter((_, index) => index !== noteIndex);
            const verificationObservations = { ...(current.verificationObservations || {}) };
            if (notes.length) verificationObservations[itemId] = notes;
            else delete verificationObservations[itemId];
            return { ...current, verificationObservations };
        });
    }

    function isVisible(blueprint) {
        const states = CRITERIA.map(criterion => review.cells[blueprint.id]?.[criterion.id] || 'pending');
        return filter === 'all' || states.some(state => state === filter);
    }

    function openObservationPanel(blueprintId) {
        setActiveObservationId(blueprintId);
        setDraftObservation('');
        setDraftCriterionId('');
    }

    function addObservation() {
        if (readOnly || !draftObservation.trim() || !activeObservationId) return;
        const note = { id: createNoteId(), text: draftObservation.trim(), criterionId: draftCriterionId };
        setReview(current => ({
            ...current,
            observations: { ...current.observations, [activeObservationId]: [...(current.observations[activeObservationId] || []), note] },
        }));
        setDraftObservation('');
        setDraftCriterionId('');
    }

    function removeObservation(noteId) {
        if (readOnly) return;
        setReview(current => ({
            ...current,
            observations: { ...current.observations, [activeObservationId]: (current.observations[activeObservationId] || []).filter(note => note.id !== noteId) },
        }));
    }

    function addGeneralObservation() {
        if (readOnly || !draftGeneralObservation.trim() || !draftGeneralCriterionId) return;
        const note = { id: createNoteId(), text: draftGeneralObservation.trim(), criterionId: draftGeneralCriterionId };
        setReview(current => ({ ...current, generalObservations: [...(current.generalObservations || []), note] }));
        setDraftGeneralObservation('');
        setDraftGeneralCriterionId('');
    }

    function removeGeneralObservation(noteId) {
        if (readOnly) return;
        setReview(current => ({ ...current, generalObservations: (current.generalObservations || []).filter(note => note.id !== noteId) }));
    }

    const observationText = [
        ...blueprints.flatMap(blueprint => (review.observations[blueprint.id] || []).map(note => `${blueprint.id_public}: ${note.text}`)),
        ...(review.generalObservations || []).map(note => `General · ${CRITERIA.find(criterion => criterion.id === note.criterionId)?.label || 'Criterio'}: ${note.text}`),
        ...VERIFICATIONS.flatMap(item => (review.verificationObservations?.[item.id] || []).map(note => `${item.label}: ${note}`)),
    ].join('\n');

    function getMissingObservations() {
        return CRITERIA.flatMap(criterion => {
            const blueprint = blueprints.find(item => review.cells[item.id]?.[criterion.id] === 'no_cumple');
            const hasObservation = blueprints.some(item => (review.observations[item.id] || []).some(note => note.criterionId === criterion.id && note.text.trim()))
                || (review.generalObservations || []).some(note => note.criterionId === criterion.id && note.text.trim());
            return blueprint && !hasObservation ? [{ blueprint, criterion }] : [];
        });
    }

    function showMissingObservationError({ blueprint, criterion }) {
        setValidationError(`“${criterion.label}”: agregue al menos una observación asociada a este criterio marcado como No cumple en alguno de los planos.`);
        setFilter('all');
        setTimeout(() => cellRefs.current[`${blueprint.id}-${CRITERIA.findIndex(item => item.id === criterion.id)}`]?.focus(), 0);
    }

    async function save(event) {
        event.preventDefault();
        if (readOnly) return;
        const missingObservations = getMissingObservations();
        if (missingObservations.length) {
            showMissingObservationError(missingObservations[0]);
            return;
        }
        await onSave(review);
        savedReviewRef.current = JSON.stringify(review);
    }

    async function finalizeReview() {
        if (readOnly || !onFinalize) return;
        const missingObservations = getMissingObservations();
        if (missingObservations.length) {
            showMissingObservationError(missingObservations[0]);
            return;
        }
        await onFinalize(review);
    }

    async function closeReview() {
        if (saving) return;
        if (JSON.stringify(review) === savedReviewRef.current) {
            onClose();
            return;
        }
        const result = await swalConfirm({
            title: '¿DESEA GUARDAR LOS CAMBIOS ANTES DE SALIR?',
            text: 'Los cambios sin guardar se perderán si continúa sin guardarlos.',
            confirmButtonText: 'SI, GUARDAR',
            cancelButtonText: 'NO, SALIR',
        });
        if (result.isConfirmed) {
            const missingObservations = getMissingObservations();
            if (missingObservations.length) {
                showMissingObservationError(missingObservations[0]);
                return;
            }
            await onSave(review);
            savedReviewRef.current = JSON.stringify(review);
            return;
        }
        if (result.dismiss === 'cancel') onClose();
    }

    function handleCellKeyDown(event, blueprintIndex, criterionIndex, blueprint, visibleBlueprints) {
        const shortcut = { '0': 'pending', '1': 'cumple', '2': 'no_cumple', '3': 'no_aplica' }[event.key];
        if (shortcut) {
            event.preventDefault();
            updateCell(blueprint.id, CRITERIA[criterionIndex].id, shortcut);
            return;
        }
        const move = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[event.key];
        if (!move) return;
        event.preventDefault();
        const nextBlueprint = Math.max(0, Math.min(visibleBlueprints.length - 1, blueprintIndex + move[0]));
        const nextCriterion = Math.max(0, Math.min(CRITERIA.length - 1, criterionIndex + move[1]));
        cellRefs.current[`${visibleBlueprints[nextBlueprint].id}-${nextCriterion}`]?.focus();
    }

    if (!blueprints.length) return <p className="mb-0 text-sm text-muted-foreground">No hay planos cargados. Añádalas en 3.3.2 Planos antes de iniciar la evaluación.</p>;

    const activeBlueprint = blueprints.find(blueprint => blueprint.id === activeObservationId);
    const visibleBlueprints = blueprints.filter(isVisible);
    const projectProfessionals = Array.isArray(professionals) ? professionals : [];
    const isComplete = blueprints.every(blueprint => CRITERIA.every(criterion => review.cells[blueprint.id]?.[criterion.id] && review.cells[blueprint.id][criterion.id] !== 'pending'))
        && VERIFICATIONS.every(item => review.verifications[item.id] && review.verifications[item.id] !== 'pending');
    const noCumpleCount = counts.no_cumple + VERIFICATIONS.filter(item => review.verifications[item.id] === 'no_cumple').length;
    const evaluationStatus = noCumpleCount ? 'NO APROBADO' : 'APROBADO';

    function focusObservationCriterion(criterionId) {
        setFilter('all');
        setActiveObservationId(null);
        setTimeout(() => cellRefs.current[`${activeBlueprint.id}-${CRITERIA.findIndex(criterion => criterion.id === criterionId)}`]?.focus(), 0);
    }

    return <form onSubmit={save} className="space-y-3 [&_*]:text-[11px]" aria-readonly={readOnly}>
        {readOnly ? <p className={`mb-0 rounded-md border px-3 py-2 text-sm font-semibold ${noCumpleCount ? 'border-destructive bg-destructive/10 text-destructive' : 'border-success bg-success/10 text-success'}`} role="status">{evaluationStatus}</p> : null}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {['cumple', 'no_cumple', 'no_aplica', 'pending'].map(state => <div key={state} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-center text-xs"><strong>{counts[state]}</strong><span className="ms-1">{STATE_META[state].label}</span></div>)}
        </div>
        <div>
            <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin="0" aria-valuemax={total} aria-valuenow={evaluated}>
                <div className="h-full bg-primary transition-[width]" style={{ width: `${total ? (evaluated / total) * 100 : 0}%` }} />
            </div>
            <p className="mt-1 text-center text-xs text-muted-foreground">{evaluated} de {total} celdas evaluadas · {blueprints.length} planos × 26 criterios</p>
        </div>
        <section className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-muted/20 px-3 py-2" aria-label="Guía de estados de evaluación">
            <span className="font-semibold text-foreground">Cómo evaluar:</span>
            {['cumple', 'no_cumple', 'no_aplica'].map(state => <span key={state} className="inline-flex items-center gap-1"><span className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border text-xs font-semibold ${STATE_META[state].className}`} aria-hidden="true">{STATE_META[state].glyph}</span>{STATE_META[state].label}</span>)}
            <span className="text-muted-foreground">Haz clic en una celda para cambiar su estado.</span>
        </section>
        <div className="flex flex-wrap gap-2" aria-label="Filtrar planos">
            {[['all', 'Todos los planos'], ['pending', 'Pendientes'], ['no_cumple', 'No cumple']].map(([value, label]) => <Button key={value} type="button" size="sm" variant={filter === value ? 'default' : 'outline'} onClick={() => setFilter(value)}>{label}</Button>)}
        </div>
        <div className="max-h-[52dvh] overflow-auto rounded-md border border-border" role="region" aria-label="Matriz de evaluación de planos" tabIndex="0">
            <table id={gridId} className="min-w-[1080px] w-full table-fixed border-collapse text-xs">
                <thead className="sticky top-0 z-30 bg-background">
                    <tr>
                        <th rowSpan="2" className="sticky left-0 z-40 w-60 min-w-60 border-b border-r border-border bg-background px-2 py-1 text-left text-foreground">Plano</th>
                        {BANDS.map(band => <th key={band.title} colSpan={band.criteria.length} className="border-b border-r border-border bg-muted/60 px-1 py-0.5 text-center font-semibold text-foreground">{band.title}</th>)}
                    </tr>
                    <tr>{CRITERIA.map(criterion => <th key={criterion.id} className="h-28 min-w-8 w-8 border-b border-r border-border bg-muted/30 p-0 text-center align-bottom text-foreground">
                        <div className="flex h-full flex-col items-center justify-end gap-1 pb-1">
                            {criterion.label === 'Firmas' ? <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Ver profesionales que deben firmar los planos" title="Ver profesionales que deben firmar los planos" onClick={() => setProfessionalsOpen(true)}><Icon name="eye" size={14} /></button> : null}
                            <span className="inline-block whitespace-nowrap !text-[10px] font-medium leading-none [writing-mode:vertical-rl] rotate-180">{criterion.label}</span>
                        </div>
                    </th>)}</tr>
                </thead>
                <tbody>
                    <tr className="bg-muted/20">
                        <th scope="row" className="sticky left-0 z-20 w-60 min-w-60 border-b border-r border-border bg-muted/20 px-2 py-1 text-left font-normal">
                            <div className="flex items-center justify-between gap-2"><strong>Actuación masiva</strong><div className="flex items-center gap-1"><Button type="button" size="sm" variant={bulkActionActive ? 'default' : 'outline'} className="h-7 px-2 text-xs" aria-pressed={bulkActionActive} onClick={() => setBulkActionActive(active => !active)} disabled={bulkActionApplying}>{bulkActionActive ? 'DESACTIVAR' : 'ACTIVAR'}</Button><button type="button" className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Información sobre actuación masiva" onClick={showBulkActionInfo}><Icon name="info-circle" size={14} /></button></div></div>
                        </th>
                        {CRITERIA.map(criterion => {
                            const state = getBulkState(blueprints, review.cells, criterion.id);
                            const meta = state === 'mixed' ? { label: 'Estados distintos', glyph: '•', className: 'border-border bg-muted/50 text-muted-foreground' } : STATE_META[state];
                            return <td key={criterion.id} className="h-8 w-8 border-b border-r border-border p-0 text-center"><button type="button" className={`h-6 w-6 rounded-sm border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${meta.className} ${!bulkActionActive || bulkActionApplying ? 'cursor-not-allowed opacity-45' : ''}`} aria-label={`Actuación masiva, ${criterion.label}: ${meta.label}`} disabled={!bulkActionActive || bulkActionApplying} onClick={() => updateColumn(criterion)}>{meta.glyph}</button></td>;
                        })}
                    </tr>
                    {visibleBlueprints.map((blueprint, blueprintIndex) => {
                    const notes = review.observations[blueprint.id] || [];
                    return <tr key={blueprint.id}>
                        <th scope="row" className="sticky left-0 z-20 w-60 min-w-60 border-b border-r border-border bg-background px-2 py-1 text-left font-normal">
                            <div className="flex items-center justify-between gap-2"><div className="min-w-0"><strong>{blueprint.id_public}</strong><p className="mb-0 truncate text-[10px] leading-tight text-muted-foreground">{blueprint.use || ''}</p></div><Button type="button" size="sm" variant="outline" className={`h-7 shrink-0 px-2 text-xs ${notes.length ? 'border-destructive text-destructive' : 'text-muted-foreground'}`} onClick={() => openObservationPanel(blueprint.id)}><Icon name="comment" size={13} className="me-1" />{notes.length ? `${notes.length} observación${notes.length === 1 ? '' : 'es'}` : 'Añadir observación'}</Button></div>
                        </th>
                        {CRITERIA.map((criterion, criterionIndex) => {
                            const state = review.cells[blueprint.id]?.[criterion.id] || 'pending';
                            const meta = STATE_META[state];
                            return <td key={criterion.id} className="h-8 w-8 border-b border-r border-border p-0 text-center"><button type="button" ref={element => { cellRefs.current[`${blueprint.id}-${criterionIndex}`] = element; }} className={`h-6 w-6 rounded-sm border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${meta.className}`} aria-label={`${blueprint.id_public}, ${criterion.label}: ${meta.label}`} onClick={() => updateCell(blueprint.id, criterion.id, getCycle(state))} onKeyDown={event => handleCellKeyDown(event, blueprintIndex, criterionIndex, blueprint, visibleBlueprints)}>{meta.glyph}</button></td>;
                        })}
                    </tr>;
                    })}
                </tbody>
            </table>
        </div>
        <section className="divide-y divide-border rounded-md border border-border">
            {VERIFICATIONS.map(item => {
                const currentState = review.verifications[item.id] || 'pending';
                const notes = review.verificationObservations?.[item.id] || [];
                return <div key={item.id} className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><span className="text-sm">{item.label}</span><div className="grid grid-cols-[92px_92px_92px_146px] gap-1">{CONTROL_META.map(option => <button key={option.state} type="button" aria-pressed={currentState === option.state} className={`w-full rounded border bg-background px-2 py-1 text-xs font-medium transition-[border-color,color,background-color] duration-[140ms] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 ${option.focusClassName} ${option.pressedClassName} ${currentState === option.state ? option.selectedClassName : 'border-border text-foreground [&_svg]:text-muted-foreground'}`} onClick={() => updateVerification(item.id, option.state)}><Icon name={option.icon} size={13} className="me-1" />{option.label}</button>)}<Button type="button" size="sm" variant="outline" className={`h-auto w-full px-2 text-xs ${notes.length ? 'border-destructive text-destructive' : 'text-muted-foreground'}`} onClick={() => setActiveVerificationObservation(item.id)}><Icon name="comment" size={13} className="me-1" />{notes.length ? `${notes.length} observación${notes.length === 1 ? '' : 'es'}` : 'Añadir observación'}</Button></div></div>;
            })}
        </section>
        <div className="rounded-md border border-border p-3"><div className="mb-2 flex items-center justify-between gap-2"><strong className="text-sm">Observaciones</strong><Button type="button" size="sm" variant="outline" onClick={() => { setActiveObservationId(null); setActiveVerificationObservation(null); setGeneralObservationsOpen(true); }}><Icon name="comment" size={13} className="me-1" />OBSERVACIONES GENERALES</Button></div><textarea className="form-control form-control-sm" rows="4" readOnly value={observationText} placeholder="Las observaciones de planos, criterios y verificaciones aparecerán aquí." /></div>
        {validationError ? <p className="mb-0 text-sm text-destructive" role="alert">{validationError}</p> : null}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" size="sm" disabled={saving || finalizing} onClick={closeReview}><Icon name="times-circle" size={16} className="me-1" />CERRAR</Button>{!readOnly ? <><Button type="submit" size="sm" disabled={saving || finalizing}><Icon name="save" size={16} className="me-1" />{saving ? 'GUARDANDO...' : 'Guardar'}</Button><Button type="button" size="sm" variant="outline" disabled={saving || finalizing || !isComplete} title={isComplete ? 'Finalizar revisión' : 'Complete todos los criterios y verificaciones para finalizar'} onClick={finalizeReview}><Icon name="check-circle" size={16} className="me-1" />{finalizing ? 'FINALIZANDO...' : 'FINALIZAR REVISIÓN'}</Button></> : null}</div>
        <Modal
            contentLabel="Profesionales que deben firmar los planos"
            isOpen={professionalsOpen}
            onRequestClose={() => setProfessionalsOpen(false)}
            ariaHideApp={false}
            style={{ content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', width: 'calc(100vw - 2rem)', maxWidth: '28rem' } }}
            className="!left-1/2 !top-1/2 !w-[calc(100vw-2rem)] !max-w-md !-translate-x-1/2 !-translate-y-1/2"
        >
            <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div><h2 className="mb-1 text-sm font-semibold">Firmas requeridas</h2><p className="mb-0 text-xs text-muted-foreground">Profesionales a cargo del proyecto que deben firmar los planos</p></div>
                    <Button type="button" variant="outline" size="sm" aria-label="Cerrar profesionales responsables" onClick={() => setProfessionalsOpen(false)}><Icon name="times-circle" size={14} /></Button>
                </div>
                <div className="divide-y divide-border rounded-md border border-border">
                    {projectProfessionals.length
                        ? projectProfessionals.map((professional, index) => {
                            const { responsibility, name } = getProfessionalDetails(professional);
                            return <p key={professional.id || `${professional.role}-${professional.name}-${professional.surname}-${index}`} className="mb-0 px-3 py-2 text-xs leading-5 text-foreground"><strong className="font-semibold">{responsibility}:</strong> {name}</p>;
                        })
                        : <p className="mb-0 px-3 py-4 text-sm text-muted-foreground" role="status">No hay profesionales responsables registrados en Inf. Jur 5.2.</p>}
                </div>
                <div className="flex justify-end"><Button type="button" size="sm" variant="outline" onClick={() => setProfessionalsOpen(false)}>Cerrar</Button></div>
            </div>
        </Modal>
        {activeVerificationObservation ? (() => {
            const item = VERIFICATIONS.find(verification => verification.id === activeVerificationObservation);
            const notes = review.verificationObservations?.[activeVerificationObservation] || [];
            if (!item) return null;
            return <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background p-4 shadow-lg" aria-label={`Observaciones de ${item.label}`}><div className="mb-3 flex items-center justify-between gap-2"><strong>Observaciones</strong><Button type="button" variant="outline" size="sm" onClick={() => setActiveVerificationObservation(null)}><Icon name="times-circle" size={14} /></Button></div><p className="mb-3 text-sm text-muted-foreground">{item.label}</p><div className="flex-1 space-y-2 overflow-auto">{notes.map((note, index) => <div key={`${item.id}-${index}`} className="rounded border border-border p-2 text-sm"><div className="flex justify-between gap-2"><span>{note}</span><button type="button" className="text-destructive" aria-label="Eliminar observación" onClick={() => removeVerificationObservation(item.id, index)}><Icon name="trash-alt" size={14} /></button></div></div>)}</div><div className="mt-3 border-t border-border pt-3"><Button type="button" size="sm" onClick={() => addVerificationObservation(item)}>Añadir observación</Button></div></aside>;
        })() : null}
        {generalObservationsOpen ? <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background p-4 shadow-lg" aria-label="Observaciones generales"><div className="mb-3 flex items-center justify-between gap-2"><strong>Observaciones generales</strong><Button type="button" variant="outline" size="sm" onClick={() => setGeneralObservationsOpen(false)}><Icon name="times-circle" size={14} /></Button></div><p className="mb-3 text-sm text-muted-foreground">Asocie cada observación a un criterio de evaluación.</p><div className="flex-1 space-y-2 overflow-auto">{(review.generalObservations || []).map(note => <div key={note.id} className="rounded border border-border p-2 text-sm"><div className="flex justify-between gap-2"><div><strong>{CRITERIA.find(criterion => criterion.id === note.criterionId)?.label}</strong><p className="mb-0">{note.text}</p></div><button type="button" className="text-destructive" aria-label="Eliminar observación general" onClick={() => removeGeneralObservation(note.id)}><Icon name="trash-alt" size={14} /></button></div></div>)}</div><div className="mt-3 space-y-2 border-t border-border pt-3"><textarea className="form-control form-control-sm" value={draftGeneralObservation} onChange={event => setDraftGeneralObservation(event.target.value)} placeholder="Nueva observación general" /><select className="form-select form-select-sm" value={draftGeneralCriterionId} onChange={event => setDraftGeneralCriterionId(event.target.value)}><option value="">Seleccione un criterio</option>{CRITERIA.map(criterion => <option key={criterion.id} value={criterion.id}>{criterion.band}: {criterion.label}</option>)}</select><Button type="button" size="sm" onClick={addGeneralObservation} disabled={!draftGeneralObservation.trim() || !draftGeneralCriterionId}>Agregar observación</Button></div></aside> : null}
        {activeBlueprint ? <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background p-4 shadow-lg" aria-label={`Observaciones de ${activeBlueprint.id_public}`}><div className="mb-3 flex items-center justify-between"><strong>Observaciones: {activeBlueprint.id_public}</strong><Button type="button" variant="outline" size="sm" onClick={() => setActiveObservationId(null)}><Icon name="times-circle" size={14} /></Button></div><div className="flex-1 overflow-auto space-y-2">{(review.observations[activeBlueprint.id] || []).map(note => <div key={note.id} className="rounded border border-border p-2 text-sm"><div className="flex justify-between gap-2"><span>{note.text}</span><button type="button" className="text-destructive" aria-label="Eliminar observación" onClick={() => removeObservation(note.id)}><Icon name="trash-alt" size={14} /></button></div>{note.criterionId && CRITERIA.some(criterion => criterion.id === note.criterionId) ? <button type="button" className="mt-1 text-xs text-primary underline" onClick={() => focusObservationCriterion(note.criterionId)}>Ir a {CRITERIA.find(criterion => criterion.id === note.criterionId)?.label}</button> : null}</div>)}</div><div className="mt-3 space-y-2 border-t border-border pt-3"><textarea className="form-control form-control-sm" value={draftObservation} onChange={event => setDraftObservation(event.target.value)} placeholder="Nueva observación" /><select className="form-select form-select-sm" value={draftCriterionId} onChange={event => setDraftCriterionId(event.target.value)}><option value="">Sin asociar a criterio</option>{CRITERIA.map(criterion => <option key={criterion.id} value={criterion.id}>{criterion.band}: {criterion.label}</option>)}</select><Button type="button" size="sm" onClick={addObservation} disabled={!draftObservation.trim()}>Agregar observación</Button></div></aside> : null}
    </form>;
}

export default BlueprintReviewMatrix;
