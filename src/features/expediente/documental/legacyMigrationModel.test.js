import { describe, expect, it } from 'vitest';
import { buildResolutions, commitCommand, deliveryMedium, EXCLUDE_VALUE, groupIssues, ISSUE_LABELS, pendingDigitalFiles, summaryFacts } from './legacyMigrationModel';
import { validateLegacyMigrationPreview, validateLegacyMigrationResult } from '@/features/expediente/api/legacyMigration.service';

const HASH = 'a'.repeat(64);
const preview = {
  schemaVersion: 'dovela-backoffice/documentary-legacy-migration/v1', project: { fun0Id: 7 }, release: { configurationId: 3, checksum: HASH, releaseVersion: 5, isCurrent: true },
  planHash: HASH, blocking: true, inputRevision: 0, vrs: [], releaseOptions: [], checklistComparison: [],
  deliveries: [{ legacyKey: 'sub_lists:1:0', status: 'import', hasPhysical: true, pagesPhysical: 4, files: { scan: 'fun_6s:1', digital: null } }],
  files: [{ id: 9, table: 'fun_6s', status: 'unassigned', assignable: true }, { id: 1, table: 'fun_6s', status: 'attached', assignable: false }],
  issues: [{ code: 'DIGITAL_WITHOUT_VR', severity: 'blocking', sources: [] }, { code: 'FILE_MISSING', severity: 'warning', sources: [] }, { code: 'FILE_MISSING', severity: 'warning', sources: [] }],
  stats: { vrs: 2, pqrsVrs: 0, deliveries: 1, documents: 1, versionedDocuments: 0, files: { imported: 1, found: 0, missing: 1 }, issues: { blocking: 1, warning: 2 } },
  resolutions: { digitalAssignments: [], excludedSources: [] },
};

describe('legacy migration model', () => {
  it('groups issues by severity and code', () => {
    const groups = groupIssues(preview.issues);
    expect(groups.map((group) => group.severity)).toEqual(['blocking', 'warning']);
    expect(groups[1].entries[0]).toMatchObject({ code: 'FILE_MISSING', count: 2 });
  });
  it('words every issue label as one short sentence without mentioning PQRS', () => {
    Object.values(ISSUE_LABELS).forEach((label) => { expect(label).not.toMatch(/PQRS/i); expect(label).toMatch(/[.]$/); });
  });
  it('builds resolutions and the commit command from the UI choices', () => {
    const resolutions = buildResolutions({ 12: '40', 9: EXCLUDE_VALUE, 5: '' });
    expect(resolutions).toEqual({ digitalAssignments: [{ fun6Id: 9, submitId: null }, { fun6Id: 12, submitId: 40 }], excludedSources: [] });
    expect(commitCommand(preview, resolutions, ' Motivo ', 'key-1')).toEqual({ configurationId: 3, expectedChecksum: HASH, expectedPlanHash: HASH, expectedInputRevision: 0,
      idempotencyKey: 'key-1', reason: 'Motivo', resolutions });
  });
  it('lists pending digital files, summary facts and the delivery medium', () => {
    expect(pendingDigitalFiles(preview).map((file) => file.id)).toEqual([9]);
    expect(summaryFacts(preview).map((fact) => fact.value)).toEqual([2, 1, 1]);
    expect(summaryFacts({ stats: { ...preview.stats, pqrsVrs: 3 } }).some((fact) => /PQRS/.test(`${fact.label}${fact.hint}`))).toBe(false);
    expect(deliveryMedium(preview.deliveries[0])).toBe('Físico · 4 folios · Escaneo');
  });
  it('validates the preview and result contracts for the expediente', () => {
    expect(validateLegacyMigrationPreview(preview, 7)).toBe(preview);
    expect(() => validateLegacyMigrationPreview(preview, 8)).toThrow();
    expect(() => validateLegacyMigrationResult({ schemaVersion: preview.schemaVersion, fun0Id: 7, mode: 'traditional' }, 7)).toThrow();
  });
});
