import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');

const filesToCheck = [
  'src/features/expediente/expeditions/exp_1.component.jsx',
  'src/features/expediente/expeditions/exp_areas.component.jsx',
  'src/features/expediente/records/ph/record_ph_review.component.jsx',
  'src/features/expediente/records/record_review.jsx',
  'src/features/expediente/fun/fun_forms/components/fun_0_recipe.jsx',
];

function getButtonOpenTags(source) {
  const sourceWithoutBlockComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return sourceWithoutBlockComments.match(/<Button\b[^>]*>/g) ?? [];
}

describe('legacy Button submit semantics', () => {
  test('declares button type explicitly in corrected form-heavy screens', () => {
    const missingTypes = [];

    for (const relativeFile of filesToCheck) {
      const source = fs.readFileSync(path.join(projectRoot, relativeFile), 'utf8');
      const tags = getButtonOpenTags(source);

      tags.forEach((tag) => {
        if (!/\btype=/.test(tag)) missingTypes.push(`${relativeFile}: ${tag}`);
      });
    }

    expect(missingTypes).toEqual([]);
  });
});
