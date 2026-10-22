import { describe, expect, it } from 'vitest';
import { DOCUMENT_GENERATORS, buildGeneratorContext, getGeneratorProps } from './documentGeneratorsRegistry';
import { generatorSaveErrorText, isCanonicalSaveBlocked } from './generatorSavePolicy';

const entry = (id) => DOCUMENT_GENERATORS.find((candidate) => candidate.id === id);
const canonical = { id: 1, id_public: 'F-1', centralReleaseId: 7 };
const legacy = { id: 2, id_public: 'F-2', centralReleaseId: null };

describe('generatorSavePolicy', () => {
  it('blocks saving only for generators that cannot save in the canonical model', () => {
    expect(isCanonicalSaveBlocked(entry('fun_alert_neighbour'), canonical)).toBe(true);
    expect(isCanonicalSaveBlocked(entry('fun_alert_neighbour'), legacy)).toBe(false);
    // The control sheets save through the legal y debida forma reviews and sheet.
    expect(isCanonicalSaveBlocked(entry('fun_d_control'), canonical)).toBe(false);
    expect(isCanonicalSaveBlocked(entry('fun_d_control_2'), canonical)).toBe(false);
    expect(isCanonicalSaveBlocked(entry('fun_report_data_edit'), canonical)).toBe(false);
  });

  it('passes canonicalSaveBlocked to the generator', () => {
    const ctx = buildGeneratorContext({ currentItem: canonical, currentVersion: 1, requestUpdate: () => {}, globalId: 'cb2' });
    expect(getGeneratorProps(entry('fun_alert_neighbour'), {}, ctx).canonicalSaveBlocked).toBe(true);
    expect(getGeneratorProps(entry('fun_d_control_2'), {}, ctx).canonicalSaveBlocked).toBe(false);
    expect(getGeneratorProps(entry('fun_doc_confirmlegal'), {}, ctx).canonicalSaveBlocked).toBe(false);
  });

  it('shows the backend code and message of a failed write', () => {
    const error = { response: { data: { error: { code: 'CANONICAL_LEGACY_WRITE_FORBIDDEN', message: 'Writer unavailable.' } } } };
    expect(generatorSaveErrorText(error, 'generic')).toBe('Writer unavailable. (CANONICAL_LEGACY_WRITE_FORBIDDEN)');
    expect(generatorSaveErrorText({ response: { data: { code: 'X' } } }, 'generic')).toBe('generic (X)');
    expect(generatorSaveErrorText(new Error('boom'), 'generic')).toBe('generic');
  });
});
