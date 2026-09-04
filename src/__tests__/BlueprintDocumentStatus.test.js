import { describe, expect, test } from 'vitest';

import {
  BLUEPRINT_DOCUMENT_OPTIONS,
  getBlueprintDocumentLabel,
  normalizeBlueprintDocumentState,
} from '../app/pages/user/records/arc/components/blueprintDocumentStatus';

describe('blueprint document status', () => {
  test('offers only the supported document states', () => {
    expect(BLUEPRINT_DOCUMENT_OPTIONS).toEqual([
      { value: 'physical', label: 'APORTADO FISICAMENTE' },
      { value: 'digital', label: 'APORTADO DIGITALMENTE' },
      { value: 'none', label: 'SIN DOCUMENTO' },
    ]);
  });

  test.each([
    ['physical', 'physical', 'FISICO'],
    ['digital', 'digital', 'DIGITALIZADO'],
    ['none', 'none', ''],
    ['-1', 'physical', 'FISICO'],
    ['42', 'digital', 'DIGITALIZADO'],
    [null, 'none', ''],
  ])('maps %j to its state and table label', (value, state, label) => {
    expect(normalizeBlueprintDocumentState(value)).toBe(state);
    expect(getBlueprintDocumentLabel(value)).toBe(label);
  });
});
