import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const recordArcSource = readFileSync('src/app/pages/user/records/record_arc.js', 'utf8');
const typographySource = readFileSync('src/app/pages/user/records/arc/record_arc_typography.css', 'utf8');

describe('Control de contenido de arquitectura', () => {
    it('mantiene cada interruptor junto a su etiqueta', () => {
        expect(recordArcSource).toContain('record-arc-content-control-list');
        expect(recordArcSource).toContain('record-arc-content-control-row');
        expect(recordArcSource).toContain('record-arc-content-control-switch');
        expect(typographySource).toContain('.record-arc-content-control-row');
        expect(typographySource).toContain('display: inline-flex;');
        expect(typographySource).toContain('gap: 0.75rem;');
    });
});
