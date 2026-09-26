import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
    appendReviewCubFields,
    getObservationReviewDefaultValue,
    getOptionalCorrectionDefaultValue,
    getOptionalCubDefaultValue,
    getOptionalVrDefaultValue,
    shouldApplyLoadedCubRelation,
    shouldPersistReviewCub,
    shouldSaveReviewClock,
    validateObservationReview,
    resolveStructuralReviewDate,
} from '../app/pages/user/records/record_review';

function readRecordReviewSource() {
    return fs.readFileSync(
        path.resolve(__dirname, '../app/pages/user/records/record_review.js'),
        'utf8',
    );
}

function sliceSource(source, startMarker, endMarker) {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);

    return source.slice(start, end);
}

describe('resolveStructuralReviewDate', () => {
    it('usa la fecha del informe estructural cuando no existe el reloj 12/200', () => {
        const clocks = [
            { state: 12, version: 100, date_start: '2026-05-28' },
            { state: 12, version: 300, date_start: '2026-06-04' },
        ];

        expect(resolveStructuralReviewDate({ clocks })).toBe('2026-06-04');
    });

    it('mantiene prioridad de la fecha de revisión registrada', () => {
        const clocks = [
            { state: 12, version: 200, date_start: '2026-06-01' },
            { state: 12, version: 300, date_start: '2026-06-04' },
        ];

        expect(resolveStructuralReviewDate({ reviewDate: '2026-06-02', clocks })).toBe('2026-06-02');
    });
});

describe('acta de observaciones review rules', () => {
    it('mantiene Acta simple en estado local y no lo lee desde el DOM global', () => {
        const source = readRecordReviewSource();

        expect(source).toContain('const [actaSimple, setActaSimple] = useState(false);');
        expect(source).toContain('checked={actaSimple}');
        expect(source).toContain("formData.set('r_simple', actaSimple);");
        expect(source).not.toContain('document.getElementById("record_rew_simple").checked');
    });

    it('reinicia Acta simple al cambiar de expediente', () => {
        const source = readRecordReviewSource();

        expect(source).toContain('setActaSimple(false);');
        expect(source).toContain('}, [currentId]);');
    });

    it('REALIZAR REVISION no consulta informes disciplinares antes de confirmar el acta', () => {
        const source = readRecordReviewSource();
        const reviewHandler = sliceSource(source, 'let review = () => {', 'let save_review =');

        expect(reviewHandler).not.toContain('_CHECK_LAW_REPORT');
        expect(reviewHandler).not.toContain('_CHECK_ENG_REPORT');
        expect(reviewHandler).not.toContain('_CHECK_ARC_REPORT');
    });

    it('REALIZAR REVISION guarda con valores capturados antes de confirmar', () => {
        const source = readRecordReviewSource();
        const saveReviewHandler = sliceSource(source, 'let save_review =', 'let manage_review =');
        const saveClockHandler = sliceSource(source, 'let save_clock =', 'let save_clock2 =');
        const cubRelationHandler = sliceSource(source, 'let createVRxCUB_relation =', 'let conOA =');

        expect(source).toContain('const reviewValues = getReviewFormValues();');
        expect(saveReviewHandler).not.toContain('document.getElementById');
        expect(saveClockHandler).not.toContain('document.getElementById');
        expect(cubRelationHandler).not.toContain('document.getElementById');
    });

    it('refresca la relacion CUB/VR sin asumir que el select VR esta montado', () => {
        const source = readRecordReviewSource();
        const retrieveCubXvrs = sliceSource(source, 'async function retrieveCubXvrs', 'async function CREATE_CHECK_PDF');

        expect(retrieveCubXvrs).toContain('const vrSelect = document.getElementById("vr_selected11");');
        expect(retrieveCubXvrs).not.toContain('document.getElementById("vr_selected11").value');
    });

    it('permite realizar la revision con fecha y resultado de observaciones solamente', () => {
        expect(validateObservationReview({ date: '2026-07-02', check: '0' })).toEqual({ ok: true });
        expect(validateObservationReview({ date: '2026-07-02', check: '1' })).toEqual({ ok: true });
    });

    it('REALIZAR REVISION espera el guardado principal antes de refrescar el acta', () => {
        const source = readRecordReviewSource();
        const reviewHandler = sliceSource(source, 'let review = () => {', 'let save_review =');
        const saveReviewHandler = sliceSource(source, 'let save_review =', 'let manage_review =');
        const manageReviewHandler = sliceSource(source, 'let manage_review =', 'let save_clock_exp =');

        expect(reviewHandler).toContain('then(async SweetAlertResult =>');
        expect(reviewHandler).toContain('await save_review(reviewValues);');
        expect(reviewHandler).not.toContain('retrieveItem(currentItem.id);');
        expect(saveReviewHandler).toContain('return manage_review(true);');
        expect(manageReviewHandler).toContain('return RECORD_REVIEW_SERVICE.update(_CHILD.id, formData)');
    });

    it('REALIZAR REVISION muestra el confirmador antes de validar los campos del acta', () => {
        const source = readRecordReviewSource();
        const reviewHandler = sliceSource(source, 'let review = () => {', 'let save_review =');
        const confirmIndex = reviewHandler.indexOf('swalConfirm({ title: "REALIZAR REVISION"');
        const validationIndex = reviewHandler.indexOf('validateObservationReview({');

        expect(confirmIndex).toBeGreaterThanOrEqual(0);
        expect(validationIndex).toBeGreaterThanOrEqual(0);
        expect(confirmIndex).toBeLessThan(validationIndex);
    });

    it('bloquea la revision si faltan fecha o resultado de observaciones', () => {
        expect(validateObservationReview({ date: '', check: '1' })).toMatchObject({
            ok: false,
            title: 'FECHA REQUERIDA',
        });
        expect(validateObservationReview({ date: '2026-07-02', check: '2' })).toMatchObject({
            ok: false,
            title: 'RESULTADO REQUERIDO',
        });
        expect(validateObservationReview({ date: '2026-07-02', check: '' })).toMatchObject({
            ok: false,
            title: 'RESULTADO REQUERIDO',
        });
    });

    it('deja en blanco los campos posteriores cuando el usuario no los selecciona explicitamente', () => {
        expect(getOptionalCorrectionDefaultValue()).toBe('');
        expect(getOptionalCorrectionDefaultValue(null)).toBe('');
        expect(getOptionalCorrectionDefaultValue('')).toBe('');
        expect(getOptionalCorrectionDefaultValue(0)).toBe('0');
        expect(getOptionalCorrectionDefaultValue(1)).toBe('1');
        expect(getOptionalCorrectionDefaultValue(-1)).toBe('-1');

        expect(getOptionalCubDefaultValue({ currentRecordIdPublic: 'AOC26-000' })).toBe('AOC26-000');
        expect(getOptionalCubDefaultValue({ cubSelected: null, currentRecordIdPublic: 'AOC26-000' })).toBe('AOC26-000');
        expect(getOptionalCubDefaultValue({ cubSelected: '', currentRecordIdPublic: 'AOC26-000' })).toBe('');
        expect(getOptionalCubDefaultValue({ cubSelected: 'AOC26-001', currentRecordIdPublic: 'AOC26-000' })).toBe('AOC26-001');
        expect(getOptionalVrDefaultValue()).toBe('');
        expect(getOptionalVrDefaultValue('VR26-2176')).toBe('VR26-2176');
    });

    it('solo muestra relacion CUB/VR cargada cuando pertenece al CUB actual del acta', () => {
        expect(shouldApplyLoadedCubRelation({ relationCub: 'AOC26-000', currentRecordIdPublic: 'AOC26-000' })).toBe(true);
        expect(shouldApplyLoadedCubRelation({ relationCub: 'AOC26-000', currentRecordIdPublic: '' })).toBe(false);
        expect(shouldApplyLoadedCubRelation({ relationCub: 'AOC26-000', currentRecordIdPublic: 'AOC26-999' })).toBe(false);
    });

    it('mantiene VR controlado por estado para reflejar relaciones cargadas despues del montaje', () => {
        const source = readRecordReviewSource();
        const cubRelationFields = sliceSource(source, 'id="rev_cub"', '{vrsRelated && vrsRelated.map');

        expect(cubRelationFields).toContain('value={getOptionalVrDefaultValue(vrSelected)}');
        expect(cubRelationFields).toContain('onChange={(e) => setVrSelected(e.target.value)}');
    });

    it('deja en blanco el resultado de observaciones cuando no hay seleccion efectiva', () => {
        expect(getObservationReviewDefaultValue()).toBe('');
        expect(getObservationReviewDefaultValue(null)).toBe('');
        expect(getObservationReviewDefaultValue('')).toBe('');
        expect(getObservationReviewDefaultValue(2)).toBe('');
        expect(getObservationReviewDefaultValue('2')).toBe('');
        expect(getObservationReviewDefaultValue(0)).toBe('0');
        expect(getObservationReviewDefaultValue(1)).toBe('1');
    });

    it('trata CUB y VR como proceso posterior: solo persiste la relacion cuando ambos existen', () => {
        expect(shouldPersistReviewCub({ cub: '', vr: '' })).toBe(false);
        expect(shouldPersistReviewCub({ cub: 'AOC26-001', vr: '' })).toBe(false);
        expect(shouldPersistReviewCub({ cub: '', vr: 'VR26-2176' })).toBe(false);
        expect(shouldPersistReviewCub({ cub: 'AOC26-001', vr: 'VR26-2176' })).toBe(true);
    });

    it('solo envia campos de CUB del acta cuando el consecutivo existe', () => {
        const emptyData = new FormData();
        expect(appendReviewCubFields(emptyData, { cub: '', prevCub: 'AOC26-000' })).toBe(true);
        expect([...emptyData.keys()]).toEqual(['prev_cub']);
        expect(emptyData.get('prev_cub')).toBe('AOC26-000');

        const formData = new FormData();
        expect(appendReviewCubFields(formData, { cub: 'AOC26-001', prevCub: 'AOC26-000' })).toBe(true);
        expect(formData.get('id_public')).toBe('AOC26-001');
        expect(formData.get('new_cub')).toBe('AOC26-001');
        expect(formData.get('prev_cub')).toBe('AOC26-000');
    });

    it('envia campos posteriores aunque esten vacios para permitir limpiarlos', () => {
        const source = readRecordReviewSource();
        const saveReviewHandler = sliceSource(source, 'let save_review =', 'let manage_review =');

        expect(saveReviewHandler).toContain("formData.set('check_2', normalizeReviewValue(check_2));");
        expect(saveReviewHandler).toContain("formData.set('date_2', normalizeReviewValue(date_2));");
    });

    it('guarda relojes solo cuando hay fecha y resultado distinto de SIN REVISAR', () => {
        expect(shouldSaveReviewClock({ date: '2026-07-02', check: '0' })).toBe(true);
        expect(shouldSaveReviewClock({ date: '2026-07-02', check: '1' })).toBe(true);
        expect(shouldSaveReviewClock({ date: '', check: '1' })).toBe(false);
        expect(shouldSaveReviewClock({ date: '2026-07-02', check: '' })).toBe(false);
        expect(shouldSaveReviewClock({ date: '2026-07-02', check: '2' })).toBe(false);
    });

    it('borra el reloj de correcciones cuando el usuario limpia los campos posteriores', () => {
        const source = readRecordReviewSource();
        const saveClockHandler = sliceSource(source, 'let save_clock =', 'let save_clock2 =');

        expect(saveClockHandler).toContain('clear_clock(49, version);');
        expect(saveClockHandler).not.toContain('clear_clock(30, version);');
    });
});
