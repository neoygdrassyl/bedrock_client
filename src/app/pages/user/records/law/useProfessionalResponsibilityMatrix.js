import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHECK_COLUMNS, CELL_STATES } from './professionalResponsibility.constants';

const validState = state => CELL_STATES.includes(state) ? state : 'pending';
const keyFor = (professionalId, criterionId) => `${professionalId}:${criterionId}`;

function createVisualMatrix(professionals) {
    const checks = {};
    professionals.forEach(professional => {
        CHECK_COLUMNS.forEach(criterion => {
            const key = keyFor(professional.id, criterion.id);
            checks[key] = 'pending';
        });
    });

    return { checks, observations: {} };
}

export default function useProfessionalResponsibilityMatrix({ professionals }) {
    const [matrix, setMatrix] = useState(() => createVisualMatrix(professionals));
    const [filter, setFilter] = useState('all');
    const [density, setDensity] = useState('compact');
    const [editorOpen, setEditorOpen] = useState(false);
    const [observationProfessionalId, setObservationProfessionalId] = useState(null);
    const [observationDraft, setObservationDraft] = useState('');
    useEffect(() => {
        setMatrix(createVisualMatrix(professionals));
    }, [professionals]);

    const changeCheck = useCallback((professionalId, criterionId) => {
        const current = matrix.checks[keyFor(professionalId, criterionId)] || 'pending';
        const next = CELL_STATES[(CELL_STATES.indexOf(current) + 1) % CELL_STATES.length];
        const nextMatrix = { ...matrix, checks: { ...matrix.checks, [keyFor(professionalId, criterionId)]: next } };
        setMatrix(nextMatrix);
    }, [matrix]);

    const saveObservation = useCallback(() => {
        const text = observationDraft.trim();
        if (!text || !observationProfessionalId) return;
        const nextMatrix = {
            ...matrix,
            observations: {
                ...matrix.observations,
                [observationProfessionalId]: [...(matrix.observations[observationProfessionalId] || []), text],
            },
        };
        setMatrix(nextMatrix);
        setObservationDraft('');
        setObservationProfessionalId(null);
    }, [matrix, observationDraft, observationProfessionalId]);

    const counts = useMemo(() => professionals.flatMap(professional => CHECK_COLUMNS.map(criterion => matrix.checks[keyFor(professional.id, criterion.id)] || 'pending'))
        .reduce((result, state) => ({ ...result, [validState(state)]: result[validState(state)] + 1 }), { cumple: 0, no_cumple: 0, no_aplica: 0, pending: 0 }), [matrix.checks, professionals]);

    const evaluated = counts.cumple + counts.no_cumple + counts.no_aplica;
    return { matrix, filter, setFilter, density, setDensity, editorOpen, setEditorOpen, observationProfessionalId, setObservationProfessionalId, observationDraft, setObservationDraft, saveObservation, changeCheck, counts, evaluated };
}
