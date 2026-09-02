import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readExpeditionSource() {
    return fs.readFileSync(
        path.resolve(__dirname, '../app/pages/user/expeditions/exp_1.component.js'),
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

describe('EXP_1 relation CUB/VR persistence', () => {
    it('no intenta crear relaciones CubXVr cuando falta el VR seleccionado', () => {
        const source = readExpeditionSource();
        const createRelation = sliceSource(
            source,
            'let createVRxCUB_relation =',
            'let sendDataToCreate =',
        );

        expect(createRelation).toContain('if (cub1 && vr1)');
        expect(createRelation).toContain('if (cub2 && vr2)');
        expect(createRelation).not.toContain('if (cub1) {');
        expect(createRelation).not.toContain('if (cub2) {');
    });
});
