import { describe, expect, it } from 'vitest';
import { buildLdfChecklist, groupHeading, partiesOf, partyIssueLabel, primaryInstance, requirementOfDocumentKey, requirementReason, requirementStatus, rowsProgress } from './ldfChecklistModel';

const ANA = 'fun_51:1';
const JOHN = 'fun_51:2';
const PRO = 'fun_52:7';

const party = (id, extra) => ({ id, kind: 'applicant', kindLabel: 'Solicitante', label: id, source: { table: 'fun_51s', rowId: 1 }, idNumber: null, type: 'natural', role: 'titular',
  values: ['natural', 'titular'], valueLabels: ['Persona natural', 'Titular'], issues: [], evaluated: true, requirementCount: 1, deliveredCount: 0, blockerCount: 1, state: 'missing', ...extra });
const requirement = (code, extra) => ({ documentCode: code, documentId: `d-${code}`, title: `Doc ${code}`, required: true, delivered: false, verdict: 'pending', blockers: [], instances: [], groupCode: null, section: null, ...extra });
const personal = (code, subjectId, extra) => requirement(code, { requirementKey: `${subjectId}|d-${code}`, subjectId, subjectKind: subjectId.startsWith('fun_52') ? 'professional' : 'applicant', subjectLabel: subjectId, ...extra });

const parties = {
  available: true, perPerson: true,
  applicants: [party(ANA, { label: 'Ana Pérez' }), party(JOHN, { label: 'John Ruiz', type: null, values: ['titular'], valueLabels: ['Titular'], issues: [{ code: 'MISSING_PERSON_TYPE', field: 'type' }] })],
  professionals: [party(PRO, { kind: 'professional', kindLabel: 'Profesional', label: 'Eva Gil', source: { table: 'fun_52s', rowId: 7 }, values: ['director_obra'], valueLabels: ['Director de la construcción'] })],
  unassigned: [{ source: { table: 'fun_53s', rowId: 5 }, label: 'Carlos', idNumber: '9', role: 'titular', issues: [{ code: 'UNMATCHED_RESPONSIBLE', field: 'id_number' }] }],
  issueCount: 2,
};

describe('partiesOf', () => {
  it('describes each party with its values, plain-Spanish issues and the FUN form where it is completed', () => {
    const result = partiesOf({ parties });
    expect(result.gated).toBe(true);
    expect(result.total).toBe(4);
    expect(result.pendingCount).toBe(2);
    expect(result.applicants[0]).toMatchObject({ label: 'Ana Pérez', description: 'Solicitante — Persona natural · Titular', complete: true, form: { anchor: 'fun_n_51', label: '5.1' } });
    expect(result.applicants[1]).toMatchObject({ complete: false, issues: [{ code: 'MISSING_PERSON_TYPE', label: 'Falta tipo de persona' }] });
    expect(result.professionals[0]).toMatchObject({ description: 'Profesional — Director de la construcción', form: { anchor: 'fun_n_52', label: '5.2' } });
    expect(result.unassigned[0]).toMatchObject({ complete: false, form: { anchor: 'fun_n_53', label: '5.3' }, issues: [{ label: 'No coincide con un titular ni es apoderado' }] });
  });

  it('is null without parties (older backend) and not gated without issues', () => {
    expect(partiesOf({})).toBeNull();
    expect(partiesOf({ parties: { available: true, applicants: [party(ANA)], professionals: [], unassigned: [], issueCount: 0 } }).gated).toBe(false);
  });

  it('labels every issue code', () => {
    expect(partyIssueLabel({ code: 'MISSING_ROLE', field: 'role' })).toBe('Falta rol');
    expect(partyIssueLabel({ code: 'UNMAPPED_VALUE', field: 'role', value: 'Ingeniero X' })).toBe('Rol no reconocido: «Ingeniero X»');
    expect(partyIssueLabel({ code: 'UNMAPPED_VALUE', field: 'type', value: 'mixta' })).toBe('Tipo de persona no reconocido: «mixta»');
  });
});

describe('buildLdfChecklist', () => {
  const data = {
    parties,
    subjects: [
      { subjectId: ANA, kind: 'applicant', label: 'Ana Pérez', typologies: [{ typologyCode: 'PER', typologyName: 'Persona', selectedOptionIds: ['natural'], selectionSource: 'party' }], state: 'missing' },
      { subjectId: JOHN, kind: 'applicant', label: 'John Ruiz', typologies: [{ typologyCode: 'PER', typologyName: 'Persona', selectedOptionIds: [], selectionSource: null }], state: 'selection_required' },
      { subjectId: PRO, kind: 'professional', label: 'Eva Gil', typologies: [], state: 'satisfied' },
    ],
    requirements: [
      requirement('511', { delivered: true, verdict: 'complies', instances: [{ documentKey: 'k-511', verdict: 'complies' }] }),
      requirement('900', { direction: 'output' }),
      personal('101', ANA, { blockers: [{ code: 'NOT_DELIVERED', subjectId: ANA }], section: { typologyCode: 'PER', typologyName: 'Persona', optionId: 'natural', optionLabel: 'Persona natural' } }),
      personal('101', JOHN, { required: false }),
      personal('300', PRO, { required: false, groupCode: 'PRO:dir@fun_52:7', delivered: true, verdict: 'pending', blockers: [], instances: [{ documentKey: 'k-300', verdict: 'pending' }] }),
      personal('301', PRO, { required: false, groupCode: 'PRO:dir@fun_52:7' }),
    ],
    groups: [{ code: 'PRO:dir@fun_52:7', mode: 'at_least_one', status: 'missing', satisfied: false, subjectId: PRO, documentCodes: ['300', '301'], typologyCode: 'PRO', typologyName: 'Profesional', optionLabel: 'Director' }],
    blockers: [
      { code: 'NOT_DELIVERED', documentCode: '101', subjectId: ANA },
      { code: 'TYPOLOGY_SELECTION_REQUIRED', typologyCode: 'PER', subjectId: JOHN },
      { code: 'GROUP_NOT_SATISFIED', groupCode: 'PRO:dir@fun_52:7', subjectId: PRO },
      { code: 'REQUIREMENTS_STALE', message: 'cambió' },
      { code: 'SOMETHING_NEW', message: 'nuevo' },
    ],
  };

  it('groups the request first and then one group per person in the evaluation order, leaving issued documents out', () => {
    const { groups } = buildLdfChecklist(data);
    expect(groups.map((group) => group.key)).toEqual(['request', ANA, JOHN, PRO]);
    expect(groups[0].rows.map((row) => row.code)).toEqual(['511']);
    expect(groupHeading(groups[3])).toBe('Eva Gil · Profesional — Director de la construcción');
    expect(groups[1]).toMatchObject({ title: 'Ana Pérez', requiredCount: 1, deliveredCount: 0, pendingCount: 1 });
    expect(groups[1].rows[0]).toMatchObject({ code: '101', status: 'missing', marker: 'required', subjectId: ANA });
  });

  it('keeps the same document of two persons as two rows and lists a missing option first in its group', () => {
    const { groups } = buildLdfChecklist(data);
    const john = groups.find((group) => group.key === JOHN);
    expect(john.rows.map((row) => [row.type, row.status])).toEqual([['selection', 'selection_required'], ['document', 'optional']]);
    expect(john.rows[0].title).toBe('Elegir la opción de «Persona»');
    expect(groups.find((group) => group.key === ANA).rows[0].key).not.toBe(john.rows[1].key);
  });

  it('shows an at_least_one group of a person as one "Uno de" row with the state of its best alternative', () => {
    const pro = buildLdfChecklist(data).groups.find((group) => group.key === PRO);
    expect(pro.rows).toHaveLength(1);
    expect(pro.rows[0]).toMatchObject({ type: 'alternatives', code: '300 / 301', title: 'Uno de: 300 Doc 300 · 301 Doc 301', marker: 'at_least_one', status: 'pending_review', delivered: true });
    expect(pro).toMatchObject({ requiredCount: 1, deliveredCount: 1 });
  });

  it('keeps an unsatisfied group without listed documents and reports evaluation-level and unknown blockers', () => {
    const result = buildLdfChecklist({ requirements: [], groups: [{ code: 'G9', mode: 'at_least_one', satisfied: false, documentCodes: ['800', '801'] }],
      blockers: [{ code: 'GROUP_NOT_SATISFIED', groupCode: 'G9' }, ...data.blockers.slice(3)] });
    expect(result.groups[0].rows[0]).toMatchObject({ type: 'alternatives', code: '800 / 801', status: 'missing_alternative' });
    expect(result.alerts.map((alert) => alert.code)).toEqual(['REQUIREMENTS_STALE']);
    expect(result.others.map((other) => other.label)).toEqual(['SOMETHING_NEW']);
  });

  it('marks a satisfied alternative group as complying', () => {
    const satisfied = { ...data, groups: [{ ...data.groups[0], status: 'satisfied', satisfied: true }], blockers: [] };
    const pro = buildLdfChecklist(satisfied).groups.find((group) => group.key === PRO);
    expect(pro.rows[0].status).toBe('complies');
    expect(pro.pendingCount).toBe(0);
  });
});

describe('row helpers', () => {
  it('derives the status from the blockers first, then from the delivery and verdict', () => {
    expect(requirementStatus(requirement('1', { delivered: true, blockers: [{ code: 'DOES_NOT_COMPLY' }] }))).toBe('rejected');
    expect(requirementStatus(requirement('1', { delivered: true, verdict: 'complies' }))).toBe('complies');
    expect(requirementStatus(requirement('1', { delivered: true, verdict: 'not_applicable' }))).toBe('not_applicable');
    expect(requirementStatus(requirement('1', { required: false }))).toBe('optional');
    expect(requirementStatus(requirement('1'))).toBe('missing');
  });

  it('counts required rows only and selections as pending', () => {
    expect(rowsProgress([{ type: 'document', marker: 'required', delivered: true, status: 'complies' }, { type: 'document', marker: 'optional', delivered: false, status: 'optional' },
      { type: 'selection', marker: 'required', delivered: false, status: 'selection_required' }])).toEqual({ requiredCount: 1, deliveredCount: 1, pendingCount: 1 });
  });

  it('explains why a requirement is required, with the pending options of the same person', () => {
    const data = {
      subjects: [{ subjectId: ANA, typologies: [{ typologyCode: 'PER', typologyName: 'Persona', selectionSource: 'party' }] }],
      blockers: [{ code: 'TYPOLOGY_SELECTION_REQUIRED', typologyCode: 'CAL', subjectId: ANA }, { code: 'TYPOLOGY_SELECTION_REQUIRED', typologyCode: 'X' }],
    };
    const row = { type: 'document', subjectId: ANA, requirement: personal('101', ANA, { section: { typologyCode: 'PER', typologyName: 'Persona', optionId: 'natural', optionLabel: 'Persona natural' } }) };
    expect(requirementReason(data, row)).toMatchObject({ general: false, typologyName: 'Persona', optionLabel: 'Persona natural', selectionSource: 'party', subjectId: ANA,
      pendingSelections: [{ typologyCode: 'CAL', subjectId: ANA }] });
    expect(requirementReason(data, { type: 'document', requirement: requirement('511') })).toMatchObject({ general: true, pendingSelections: [{ typologyCode: 'X', subjectId: null }] });
  });

  it('finds the requirement of a delivery and the instance to open first', () => {
    const target = requirement('1', { instances: [{ documentKey: 'a', verdict: 'complies' }, { documentKey: 'b', verdict: 'pending' }] });
    expect(requirementOfDocumentKey({ requirements: [requirement('0'), target] }, 'b')).toBe(target);
    expect(primaryInstance(target).documentKey).toBe('b');
    expect(primaryInstance(requirement('2'))).toBeNull();
  });

  it('keeps request documents now asked of each person out of the list and names them on the Solicitud group', () => {
    const { groups } = buildLdfChecklist({ requirements: [], blockers: [], supersededBySubjectDocumentCodes: ['519', 520, '519'] });
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ key: 'request', rows: [], superseded: ['519', '520'] });
  });
});
