import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const projectRoot = path.resolve(__dirname, '..', '..');

const filesToCheck = [
  'src/app/pages/user/expeditions/exp_1.component.js',
  'src/app/pages/user/expeditions/exp_areas.component.js',
  'src/app/pages/user/records/ph/record_ph_review.component.js',
  'src/app/pages/user/records/record_review.js',
  'src/app/pages/user/fun_forms/components/fun_0_recipe.js',
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
