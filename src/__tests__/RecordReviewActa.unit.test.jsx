import { describe, expect, it } from 'vitest';

import { resolveStructuralReviewDate } from '../app/pages/user/records/record_review';

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
